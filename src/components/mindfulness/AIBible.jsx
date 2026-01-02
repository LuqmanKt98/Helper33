import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Heart,
  Sparkles,
  Search,
  Target,
  CheckCircle,
  Bookmark,
  MessageCircle,
  Loader2,
  ChevronRight,
  Star,
  Brain,
  Lightbulb,
  TrendingUp,
  Award
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const BIBLE_BOOKS = [
  { name: 'Genesis', chapters: 50, testament: 'old' },
  { name: 'Exodus', chapters: 40, testament: 'old' },
  { name: 'Leviticus', chapters: 27, testament: 'old' },
  { name: 'Numbers', chapters: 36, testament: 'old' },
  { name: 'Deuteronomy', chapters: 34, testament: 'old' },
  { name: 'Psalms', chapters: 150, testament: 'old' },
  { name: 'Proverbs', chapters: 31, testament: 'old' },
  { name: 'Isaiah', chapters: 66, testament: 'old' },
  { name: 'Matthew', chapters: 28, testament: 'new' },
  { name: 'Mark', chapters: 16, testament: 'new' },
  { name: 'Luke', chapters: 24, testament: 'new' },
  { name: 'John', chapters: 21, testament: 'new' },
  { name: 'Romans', chapters: 16, testament: 'new' },
  { name: 'Corinthians', chapters: 16, testament: 'new' },
  { name: 'Galatians', chapters: 6, testament: 'new' },
  { name: 'Ephesians', chapters: 6, testament: 'new' },
  { name: 'Philippians', chapters: 4, testament: 'new' },
  { name: 'Colossians', chapters: 4, testament: 'new' },
  { name: 'Revelation', chapters: 22, testament: 'new' }
];

const SUGGESTED_PROMPTS = [
  { emoji: '😢', text: 'I feel sad and need comfort', gradient: 'from-blue-400 to-indigo-400' },
  { emoji: '😰', text: 'I am anxious and worried', gradient: 'from-purple-400 to-pink-400' },
  { emoji: '😡', text: 'I am angry and frustrated', gradient: 'from-red-400 to-orange-400' },
  { emoji: '🙏', text: 'I need guidance and wisdom', gradient: 'from-amber-400 to-yellow-400' },
  { emoji: '💪', text: 'I need strength and courage', gradient: 'from-emerald-400 to-teal-400' },
  { emoji: '❤️', text: 'I want to feel loved', gradient: 'from-pink-400 to-rose-400' }
];

export default function AIBible() {
  const [activeTab, setActiveTab] = useState('ai-search');
  const [userPrompt, setUserPrompt] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [verseResults, setVerseResults] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [theologicalQuestion, setTheologicalQuestion] = useState('');
  const [theologicalAnswer, setTheologicalAnswer] = useState(null);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [chapterContent, setChapterContent] = useState(null);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser-AIBible'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: readingGoals = [], refetch: refetchGoals } = useQuery({
    queryKey: ['bibleReadingGoals', user?.email],
    queryFn: () => base44.entities.BibleReadingGoal.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: bookmarks = [], refetch: refetchBookmarks } = useQuery({
    queryKey: ['bibleBookmarks', user?.email],
    queryFn: () => base44.entities.BibleBookmark.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const handleAISearch = async () => {
    if (!userPrompt.trim()) {
      toast.error('Please describe how you\'re feeling');
      return;
    }

    setIsSearching(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a compassionate Bible verse finder. The user says: "${userPrompt}"
        
        Based on their emotional state and needs, suggest 3-5 specific Bible verses that would provide comfort, guidance, or strength. 
        
        For each verse, provide:
        1. The reference (Book Chapter:Verse)
        2. The verse text
        3. A brief explanation of why this verse helps with their situation
        
        Format as JSON array with: reference, text, explanation, emotion_tags`,
        response_json_schema: {
          type: 'object',
          properties: {
            verses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  reference: { type: 'string' },
                  text: { type: 'string' },
                  explanation: { type: 'string' },
                  emotion_tags: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            overall_message: { type: 'string' }
          }
        }
      });

      setVerseResults(response);
      toast.success('🙏 Found verses to help you');
    } catch (error) {
      console.error('AI search failed:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const createReadingGoal = async (goalData) => {
    if (!user) return toast.error('Please log in to create a goal.');
    try {
      await base44.entities.BibleReadingGoal.create({
        ...goalData,
        progress: 0,
      });
      refetchGoals();
      toast.success('📖 Reading goal created!');
      setShowGoalForm(false);
    } catch (error) {
      console.error('Failed to create goal:', error);
      toast.error('Failed to create goal');
    }
  };

  const updateGoalProgress = async (goalId, progress) => {
    try {
      await base44.entities.BibleReadingGoal.update(goalId, { progress });
      refetchGoals();
      if (progress === 100) {
        toast.success('🎉 Goal completed!', {
          description: 'You finished your reading plan!'
        });
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Could not update progress.');
    }
  };

  const addBookmark = async (verse) => {
    if (!user) return toast.error('Please log in to add bookmarks.');
    try {
      const existing = bookmarks.find(b => b.reference === verse.reference && b.text === verse.text);
      if (existing) {
        toast.info('Verse already bookmarked!');
        return;
      }
      await base44.entities.BibleBookmark.create(verse);
      refetchBookmarks();
      toast.success('⭐ Verse bookmarked!');
    } catch (error) {
      console.error('Failed to bookmark:', error);
      toast.error('Failed to add bookmark.');
    }
  };

  const fetchChapter = async (book, chapter) => {
    setIsLoadingChapter(true);
    setChapterContent(null);
    setSelectedBook(book);
    setSelectedChapter(chapter);
    try {
      const { data } = await base44.functions.invoke('fetchBibleChapter', { body: JSON.stringify({ book: book.name, chapter: chapter }) });
      if (data.error) {
        toast.error(data.details || 'Could not fetch chapter.');
        setChapterContent({ error: data.error, reference: data.reference });
      } else {
        setChapterContent(data);
      }
    } catch (error) {
      console.error('Failed to fetch chapter:', error);
      toast.error('Failed to fetch chapter. Please try again.');
      setChapterContent({ error: 'Could not load chapter.', reference: `${book.name} ${chapter}` });
    } finally {
      setIsLoadingChapter(false);
    }
  };

  const handleTheologicalQuestion = async () => {
    if (!theologicalQuestion.trim()) {
      toast.error('Please enter your question');
      return;
    }

    setIsAskingQuestion(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a compassionate theological scholar and spiritual guide. A user asks: "${theologicalQuestion}"

Provide a thoughtful, balanced explanation that:
1. Addresses their question directly with clarity and compassion
2. References specific Bible verses that relate to the topic
3. Offers different theological perspectives when relevant
4. Makes complex concepts accessible and relatable
5. Ends with a practical reflection or application

Be warm, non-judgmental, and focus on spiritual growth and understanding.`,
        response_json_schema: {
          type: 'object',
          properties: {
            direct_answer: { type: 'string' },
            related_verses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  reference: { type: 'string' },
                  text: { type: 'string' },
                  relevance: { type: 'string' }
                }
              }
            },
            perspectives: { type: 'array', items: { type: 'string' } },
            practical_reflection: { type: 'string' }
          }
        }
      });

      setTheologicalAnswer(response);
      toast.success('💡 Answer ready!');
    } catch (error) {
      console.error('Theological Q&A failed:', error);
      toast.error('Failed to get answer');
    } finally {
      setIsAskingQuestion(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <BookOpen className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
          AI Bible Companion
        </h2>
        <p className="text-gray-600">Find comfort and guidance through Scripture with AI assistance</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'ai-search', label: 'AI Verse Finder', icon: Sparkles },
          { id: 'qa', label: 'Ask Questions', icon: MessageCircle },
          { id: 'goals', label: 'Reading Goals', icon: Target },
          { id: 'explore', label: 'Explore Books', icon: BookOpen },
          { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                : ''
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* AI Verse Finder */}
        {activeTab === 'ai-search' && (
          <motion.div
            key="ai-search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <MessageCircle className="w-5 h-5" />
                  Tell me how you're feeling...
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="I'm feeling anxious about my future..."
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="min-h-[100px] border-2 border-amber-200 focus:border-amber-400"
                />

                <Button
                  onClick={handleAISearch}
                  disabled={isSearching}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 h-12 text-lg"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Finding verses...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Find Verses for Me
                    </>
                  )}
                </Button>

                {/* Suggested Prompts */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Or try these:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setUserPrompt(prompt.text);
                          setTimeout(handleAISearch, 100);
                        }}
                        className={`p-3 rounded-lg bg-gradient-to-r ${prompt.gradient} text-white text-sm font-medium shadow-md hover:shadow-lg transition-all`}
                      >
                        <span className="text-2xl mb-1 block">{prompt.emoji}</span>
                        {prompt.text}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {verseResults && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {verseResults.overall_message && (
                  <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-emerald-600 mt-1" />
                        <p className="text-gray-700 leading-relaxed">{verseResults.overall_message}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {verseResults.verses?.map((verse, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-2 border-blue-200 hover:shadow-xl transition-all bg-white">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-start justify-between">
                          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                            {verse.reference}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => addBookmark(verse)}
                            className="text-amber-600 hover:text-amber-700"
                          >
                            <Bookmark className="w-4 h-4" />
                          </Button>
                        </div>

                        <blockquote className="text-lg text-gray-800 italic border-l-4 border-blue-400 pl-4 py-2">
                          "{verse.text}"
                        </blockquote>

                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>{verse.explanation}</span>
                          </p>
                        </div>

                        {verse.emotion_tags && (
                          <div className="flex flex-wrap gap-2">
                            {verse.emotion_tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Theological Q&A */}
        {activeTab === 'qa' && (
          <motion.div
            key="qa"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Brain className="w-5 h-5" />
                  Ask a Theological Question
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What does the Bible say about forgiveness? How can I understand the concept of grace? What is the meaning of this verse?..."
                  value={theologicalQuestion}
                  onChange={(e) => setTheologicalQuestion(e.target.value)}
                  className="min-h-[100px] border-2 border-blue-200 focus:border-blue-400"
                />

                <Button
                  onClick={handleTheologicalQuestion}
                  disabled={isAskingQuestion}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 h-12 text-lg"
                >
                  {isAskingQuestion ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Searching Scripture...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-5 h-5 mr-2" />
                      Get Answer
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Theological Answer */}
            {theologicalAnswer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg text-emerald-900 mb-2">Understanding</h3>
                        <p className="text-gray-700 leading-relaxed">{theologicalAnswer.direct_answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Related Verses */}
                {theologicalAnswer.related_verses?.length > 0 && (
                  <Card className="border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Related Scripture
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {theologicalAnswer.related_verses.map((verse, idx) => (
                        <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <Badge className="mb-2 bg-blue-500 text-white">{verse.reference}</Badge>
                          <p className="text-gray-800 italic mb-2">"{verse.text}"</p>
                          <p className="text-sm text-gray-600">{verse.relevance}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Different Perspectives */}
                {theologicalAnswer.perspectives?.length > 0 && (
                  <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Different Perspectives</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {theologicalAnswer.perspectives.map((perspective, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{perspective}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Practical Reflection */}
                {theologicalAnswer.practical_reflection && (
                  <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-amber-900 mb-2">For Your Journey</h4>
                          <p className="text-gray-700 leading-relaxed">{theologicalAnswer.practical_reflection}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Reading Goals */}
        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Button
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Target className="w-4 h-4 mr-2" />
              Create New Reading Goal
            </Button>

            {showGoalForm && (
              <Card className="border-2 border-purple-200">
                <CardContent className="pt-6 space-y-4">
                  <GoalForm onCreate={createReadingGoal} onCancel={() => setShowGoalForm(false)} />
                </CardContent>
              </Card>
            )}

            {readingGoals.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="pt-6 text-center py-12">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No reading goals yet</p>
                  <p className="text-sm text-gray-500">Create a plan to read through books of the Bible</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {readingGoals.map((goal, idx) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    index={idx}
                    onUpdateProgress={updateGoalProgress}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Explore Books */}
        {activeTab === 'explore' && (
          <motion.div
            key="explore"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-2 border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-800">Old Testament</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {BIBLE_BOOKS.filter(b => b.testament === 'old').map((book, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ x: 5 }}
                        onClick={() => { setSelectedBook(book); setChapterContent(null); setSelectedChapter(null); }}
                        className={`w-full text-left p-3 rounded-lg hover:bg-amber-50 border flex items-center justify-between group ${
                          selectedBook?.name === book.name ? 'bg-amber-100 border-amber-300' : 'border-amber-100'
                        }`}
                      >
                        <span className="font-medium text-gray-800">{book.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{book.chapters} chapters</Badge>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">New Testament</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {BIBLE_BOOKS.filter(b => b.testament === 'new').map((book, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ x: 5 }}
                        onClick={() => { setSelectedBook(book); setChapterContent(null); setSelectedChapter(null); }}
                        className={`w-full text-left p-3 rounded-lg hover:bg-blue-50 border flex items-center justify-between group ${
                          selectedBook?.name === book.name ? 'bg-blue-100 border-blue-300' : 'border-blue-100'
                        }`}
                      >
                        <span className="font-medium text-gray-800">{book.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{book.chapters} chapters</Badge>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {selectedBook && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-bold text-purple-900 mb-4">{selectedBook.name}</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: selectedBook.chapters }, (_, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className={`hover:bg-purple-100 transition-all ${selectedChapter === i + 1 ? 'bg-purple-200 border-purple-400 scale-110' : ''}`}
                          onClick={() => fetchChapter(selectedBook, i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {isLoadingChapter && (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <p className="ml-4 text-gray-600">Loading chapter...</p>
              </div>
            )}

            {chapterContent && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                <Card className="border-2 border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="text-green-800">{chapterContent.reference}</CardTitle>
                    {chapterContent.translation_name && <Badge variant="outline">{chapterContent.translation_name} ({chapterContent.translation_id?.toUpperCase()})</Badge>}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {chapterContent.error ? (
                      <p className="text-red-600">{chapterContent.error}</p>
                    ) : (
                      <div className="space-y-3 bible-text prose prose-sm max-w-none">
                        {chapterContent.verses?.map(v => (
                          <p key={v.verse} className="text-gray-800 leading-relaxed">
                            <sup className="font-bold text-green-700 mr-1 no-underline">{v.verse}</sup>
                            {v.text}
                          </p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Bookmarks */}
        {activeTab === 'bookmarks' && (
          <motion.div
            key="bookmarks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {bookmarks.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="pt-6 text-center py-12">
                  <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No bookmarked verses yet</p>
                  <p className="text-sm text-gray-500">Save meaningful verses as you discover them</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {bookmarks.map((bookmark, idx) => (
                  <motion.div
                    key={bookmark.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="border-2 border-amber-200">
                      <CardContent className="pt-6 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-amber-500 text-white">{bookmark.reference}</Badge>
                          <Star className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-gray-800 italic">"{bookmark.text}"</p>
                        <p className="text-xs text-gray-500">
                          Saved {new Date(bookmark.created_date).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GoalForm({ onCreate, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'book',
    book: '',
    chapters_per_day: 1,
    duration_days: 30,
    title: ''
  });

  const handleSubmit = () => {
    if (!formData.book && formData.type === 'book') {
      toast.error('Please select a book');
      return;
    }
    onCreate(formData);
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Goal title (e.g., Read through Psalms)"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />

      <select
        className="w-full p-2 border rounded-lg"
        value={formData.book}
        onChange={(e) => setFormData({ ...formData, book: e.target.value })}
      >
        <option value="">Select a book...</option>
        {BIBLE_BOOKS.map(book => (
          <option key={book.name} value={book.name}>{book.name}</option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Chapters per day</label>
          <Input
            type="number"
            min="1"
            value={formData.chapters_per_day}
            onChange={(e) => setFormData({ ...formData, chapters_per_day: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Duration (days)</label>
          <Input
            type="number"
            min="1"
            value={formData.duration_days}
            onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
          <CheckCircle className="w-4 h-4 mr-2" />
          Create Goal
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function GoalCard({ goal, index, onUpdateProgress }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg text-purple-900">{goal.title || goal.book}</h3>
              <p className="text-sm text-gray-600">
                {goal.chapters_per_day} chapters/day • {goal.duration_days} days
              </p>
            </div>
            {goal.progress === 100 && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                <Award className="w-3 h-3 mr-1" />
                Complete!
              </Badge>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-purple-600">{goal.progress}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {goal.progress < 100 && (
            <Button
              onClick={() => onUpdateProgress(goal.id, Math.min(goal.progress + 10, 100))}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Mark Progress
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
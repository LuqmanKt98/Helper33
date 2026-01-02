import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Search,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  List,
  ChevronDown,
  X,
  Book,
  Sparkles,
  MessageCircle,
  Lightbulb,
  History,
  Link2
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BIBLE_BOOKS = {
  OT: [
    { name: 'Genesis', chapters: 50, abbr: 'Gen' },
    { name: 'Exodus', chapters: 40, abbr: 'Exod' },
    { name: 'Leviticus', chapters: 27, abbr: 'Lev' },
    { name: 'Numbers', chapters: 36, abbr: 'Num' },
    { name: 'Deuteronomy', chapters: 34, abbr: 'Deut' },
    { name: 'Joshua', chapters: 24, abbr: 'Josh' },
    { name: 'Judges', chapters: 21, abbr: 'Judg' },
    { name: 'Ruth', chapters: 4, abbr: 'Ruth' },
    { name: '1 Samuel', chapters: 31, abbr: '1Sam' },
    { name: '2 Samuel', chapters: 24, abbr: '2Sam' },
    { name: '1 Kings', chapters: 22, abbr: '1Kgs' },
    { name: '2 Kings', chapters: 25, abbr: '2Kgs' },
    { name: '1 Chronicles', chapters: 29, abbr: '1Chr' },
    { name: '2 Chronicles', chapters: 36, abbr: '2Chr' },
    { name: 'Ezra', chapters: 10, abbr: 'Ezra' },
    { name: 'Nehemiah', chapters: 13, abbr: 'Neh' },
    { name: 'Esther', chapters: 10, abbr: 'Esth' },
    { name: 'Job', chapters: 42, abbr: 'Job' },
    { name: 'Psalms', chapters: 150, abbr: 'Ps' },
    { name: 'Proverbs', chapters: 31, abbr: 'Prov' },
    { name: 'Ecclesiastes', chapters: 12, abbr: 'Eccl' },
    { name: 'Song of Solomon', chapters: 8, abbr: 'Song' },
    { name: 'Isaiah', chapters: 66, abbr: 'Isa' },
    { name: 'Jeremiah', chapters: 52, abbr: 'Jer' },
    { name: 'Lamentations', chapters: 5, abbr: 'Lam' },
    { name: 'Ezekiel', chapters: 48, abbr: 'Ezek' },
    { name: 'Daniel', chapters: 12, abbr: 'Dan' },
    { name: 'Hosea', chapters: 14, abbr: 'Hos' },
    { name: 'Joel', chapters: 3, abbr: 'Joel' },
    { name: 'Amos', chapters: 9, abbr: 'Amos' },
    { name: 'Obadiah', chapters: 1, abbr: 'Obad' },
    { name: 'Jonah', chapters: 4, abbr: 'Jonah' },
    { name: 'Micah', chapters: 7, abbr: 'Mic' },
    { name: 'Nahum', chapters: 3, abbr: 'Nah' },
    { name: 'Habakkuk', chapters: 3, abbr: 'Hab' },
    { name: 'Zephaniah', chapters: 3, abbr: 'Zeph' },
    { name: 'Haggai', chapters: 2, abbr: 'Hag' },
    { name: 'Zechariah', chapters: 14, abbr: 'Zech' },
    { name: 'Malachi', chapters: 4, abbr: 'Mal' }
  ],
  NT: [
    { name: 'Matthew', chapters: 28, abbr: 'Matt' },
    { name: 'Mark', chapters: 16, abbr: 'Mark' },
    { name: 'Luke', chapters: 24, abbr: 'Luke' },
    { name: 'John', chapters: 21, abbr: 'John' },
    { name: 'Acts', chapters: 28, abbr: 'Acts' },
    { name: 'Romans', chapters: 16, abbr: 'Rom' },
    { name: '1 Corinthians', chapters: 16, abbr: '1Cor' },
    { name: '2 Corinthians', chapters: 13, abbr: '2Cor' },
    { name: 'Galatians', chapters: 6, abbr: 'Gal' },
    { name: 'Ephesians', chapters: 6, abbr: 'Eph' },
    { name: 'Philippians', chapters: 4, abbr: 'Phil' },
    { name: 'Colossians', chapters: 4, abbr: 'Col' },
    { name: '1 Thessalonians', chapters: 5, abbr: '1Thess' },
    { name: '2 Thessalonians', chapters: 3, abbr: '2Thess' },
    { name: '1 Timothy', chapters: 6, abbr: '1Tim' },
    { name: '2 Timothy', chapters: 4, abbr: '2Tim' },
    { name: 'Titus', chapters: 3, abbr: 'Titus' },
    { name: 'Philemon', chapters: 1, abbr: 'Phlm' },
    { name: 'Hebrews', chapters: 13, abbr: 'Heb' },
    { name: 'James', chapters: 5, abbr: 'Jas' },
    { name: '1 Peter', chapters: 5, abbr: '1Pet' },
    { name: '2 Peter', chapters: 3, abbr: '2Pet' },
    { name: '1 John', chapters: 5, abbr: '1John' },
    { name: '2 John', chapters: 1, abbr: '2John' },
    { name: '3 John', chapters: 1, abbr: '3John' },
    { name: 'Jude', chapters: 1, abbr: 'Jude' },
    { name: 'Revelation', chapters: 22, abbr: 'Rev' }
  ]
};

const BIBLE_VERSIONS = [
  { id: 'kjv', name: 'King James Version (KJV)', color: 'from-amber-500 to-orange-500' },
  { id: 'web', name: 'World English Bible (WEB)', color: 'from-blue-500 to-indigo-500' },
  { id: 'asv', name: 'American Standard (ASV)', color: 'from-purple-500 to-pink-500' },
  { id: 'ylt', name: "Young's Literal (YLT)", color: 'from-emerald-500 to-teal-500' },
  { id: 'oeb-cw', name: 'Open English Bible (OEB)', color: 'from-cyan-500 to-blue-500' }
];

export default function BibleReader() {
  const queryClient = useQueryClient();
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('browse'); // 'browse', 'read', 'search'
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [chapterText, setChapterText] = useState(null);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState('kjv');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiMode, setAiMode] = useState('explain'); // 'explain', 'context', 'related', 'ask'

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: bibleBookmarks = [] } = useQuery({
    queryKey: ['bible-bookmarks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return user.bible_bookmarks || [];
    },
    enabled: !!user
  });

  // Fetch Bible chapter from API via backend
  const fetchChapter = async (book, chapter, version = selectedVersion) => {
    setIsLoadingChapter(true);
    try {
      const response = await base44.functions.invoke('fetchBibleChapter', {
        book: book.name,
        chapter: chapter,
        version: version
      });
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      const data = response.data;
      
      if (!data || !data.text) {
        throw new Error('No text found in response');
      }
      
      setChapterText(data);
      setView('read');
      toast.success(`📖 Loaded ${book.name} ${chapter}`);
    } catch (error) {
      console.error('Error fetching chapter:', error);
      toast.error(`Failed to load chapter. Try a different version or book.`);
    } finally {
      setIsLoadingChapter(false);
    }
  };

  // Search Bible verses
  const searchBible = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsLoadingChapter(true);
    try {
      const response = await base44.functions.invoke('fetchBibleChapter', {
        book: searchQuery,
        chapter: 1,
        version: selectedVersion
      });
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      const data = response.data;
      
      if (!data || !data.text) {
        throw new Error('No verses found');
      }
      
      setChapterText(data);
      setView('read');
      toast.success('🔍 Search results loaded!');
    } catch (error) {
      console.error('Search error:', error);
      toast.error(`Try searching like "John 3:16" or "Psalms 23"`);
    } finally {
      setIsLoadingChapter(false);
    }
  };

  // Navigate chapters
  const goToNextChapter = () => {
    if (!selectedBook) return;
    if (selectedChapter < selectedBook.chapters) {
      setSelectedChapter(selectedChapter + 1);
      fetchChapter(selectedBook, selectedChapter + 1, selectedVersion);
    }
  };

  const goToPrevChapter = () => {
    if (!selectedBook) return;
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
      fetchChapter(selectedBook, selectedChapter - 1, selectedVersion);
    }
  };

  // Bookmark verse
  const bookmarkVerseMutation = useMutation({
    mutationFn: async (verseData) => {
      const newBookmark = {
        id: Date.now().toString(),
        ...verseData,
        created_at: new Date().toISOString()
      };
      
      const updatedBookmarks = [...(user.bible_bookmarks || []), newBookmark];
      await base44.auth.updateMe({ bible_bookmarks: updatedBookmarks });
      return updatedBookmarks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bible-bookmarks']);
      toast.success('⭐ Verse bookmarked!');
      setShowBookmarkModal(false);
      setSelectedVerse(null);
    }
  });

  // AI Assistant Functions
  const getAIInsight = async (mode, verseText = null) => {
    setIsLoadingAI(true);
    try {
      const currentText = verseText || (chapterText?.verses?.map(v => `${v.verse}. ${v.text}`).join('\n') || chapterText?.text);
      const reference = chapterText?.reference || 'Bible passage';
      
      let prompt = '';
      switch (mode) {
        case 'explain':
          prompt = `Explain this Bible passage in simple, clear terms for modern readers:\n\n${reference}\n${currentText}\n\nProvide a concise explanation that makes it easy to understand.`;
          break;
        case 'context':
          prompt = `Provide historical and cultural context for this Bible passage:\n\n${reference}\n${currentText}\n\nInclude relevant information about the time period, cultural practices, and the people involved.`;
          break;
        case 'related':
          prompt = `Suggest related Bible verses and themes for:\n\n${reference}\n${currentText}\n\nProvide 3-5 related verses with brief explanations of how they connect.`;
          break;
        case 'ask':
          prompt = `Answer this question about the Bible passage:\n\n${reference}\n${currentText}\n\nQuestion: ${aiQuery}\n\nProvide a thoughtful, biblical answer.`;
          break;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setAiResponse(response);
      toast.success('✨ AI insight generated!');
    } catch (error) {
      console.error('AI error:', error);
      toast.error('Failed to generate insight. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // All books combined
  const allBooks = [...BIBLE_BOOKS.OT, ...BIBLE_BOOKS.NT];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="pt-6 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search verses (e.g., 'John 3:16', 'love', 'faith')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchBible()}
                className="pl-10 border-2 border-purple-200 focus:border-purple-400"
              />
            </div>
            <Button
              onClick={searchBible}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Version Selector */}
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Bible Version:</label>
            <select
              value={selectedVersion}
              onChange={(e) => {
                setSelectedVersion(e.target.value);
                if (selectedBook) {
                  fetchChapter(selectedBook, selectedChapter, e.target.value);
                }
                toast.success(`Switched to ${BIBLE_VERSIONS.find(v => v.id === e.target.value)?.name}`);
              }}
              className="flex-1 h-10 px-3 rounded-lg border-2 border-purple-300 bg-white text-purple-700 font-medium hover:bg-purple-50 focus:border-purple-500 focus:outline-none transition-all"
            >
              {BIBLE_VERSIONS.map(version => (
                <option key={version.id} value={version.id}>
                  {version.name}
                </option>
              ))}
            </select>
          </div>

          {/* Book Selector */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowBookSelector(!showBookSelector)}
              variant="outline"
              className="flex-1 border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Book className="w-4 h-4 mr-2" />
              {selectedBook ? `${selectedBook.name} ${selectedChapter}` : 'Select Book'}
              <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showBookSelector ? 'rotate-180' : ''}`} />
            </Button>
            
            {selectedBook && (
              <div className="flex gap-1">
                <Button
                  onClick={goToPrevChapter}
                  disabled={selectedChapter <= 1}
                  variant="outline"
                  size="icon"
                  className="border-2 border-purple-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={goToNextChapter}
                  disabled={selectedChapter >= selectedBook.chapters}
                  variant="outline"
                  size="icon"
                  className="border-2 border-purple-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Book Selector Dropdown */}
          <AnimatePresence>
            {showBookSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 border-t border-purple-200 pt-4"
              >
                {/* Old Testament */}
                <div>
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Old Testament
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {BIBLE_BOOKS.OT.map((book, idx) => (
                      <motion.button
                        key={book.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.01 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedBook(book);
                          setSelectedChapter(1);
                          fetchChapter(book, 1, selectedVersion);
                          setShowBookSelector(false);
                        }}
                        className={`p-2 rounded-lg text-xs font-medium transition-all ${
                          selectedBook?.name === book.name
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-200'
                        }`}
                      >
                        {book.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* New Testament */}
                <div>
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    New Testament
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {BIBLE_BOOKS.NT.map((book, idx) => (
                      <motion.button
                        key={book.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.01 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedBook(book);
                          setSelectedChapter(1);
                          fetchChapter(book, 1, selectedVersion);
                          setShowBookSelector(false);
                        }}
                        className={`p-2 rounded-lg text-xs font-medium transition-all ${
                          selectedBook?.name === book.name
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-blue-50 border border-blue-200'
                        }`}
                      >
                        {book.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Chapter Reader */}
      {isLoadingChapter && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading scripture...</p>
        </div>
      )}

      {chapterText && !isLoadingChapter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Chapter Header */}
          <Card className="border-2 border-purple-200 bg-white">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-purple-900">
                    {chapterText.reference}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {chapterText.translation_name || 'King James Version'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAIPanel(!showAIPanel)}
                    variant="outline"
                    size="icon"
                    className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      if (user) {
                        setSelectedVerse(chapterText);
                        setShowBookmarkModal(true);
                      } else {
                        toast.error('Please log in to bookmark verses');
                      }
                    }}
                    variant="outline"
                    size="icon"
                    className="border-2 border-amber-300 text-amber-600 hover:bg-amber-50"
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                {chapterText.verses?.map((verse, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="mb-4 group hover:bg-purple-50 p-3 rounded-lg transition-all cursor-pointer"
                    onClick={() => {
                      if (user) {
                        setSelectedVerse(verse);
                        setShowBookmarkModal(true);
                      }
                    }}
                  >
                    <sup className="text-purple-600 font-bold mr-2">{verse.verse}</sup>
                    <span className="text-gray-800 leading-relaxed">{verse.text}</span>
                  </motion.div>
                ))}
                
                {!chapterText.verses && (
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {chapterText.text}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant Panel */}
          <AnimatePresence>
            {showAIPanel && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-purple-900">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        AI Bible Assistant
                      </CardTitle>
                      <Button
                        onClick={() => setShowAIPanel(false)}
                        variant="ghost"
                        size="icon"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* AI Mode Selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                      <Button
                        onClick={() => {
                          setAiMode('explain');
                          setAiResponse(null);
                        }}
                        variant={aiMode === 'explain' ? 'default' : 'outline'}
                        className={aiMode === 'explain' 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                          : 'border-2 border-purple-300 text-purple-700 hover:bg-purple-50'
                        }
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Explain
                      </Button>
                      <Button
                        onClick={() => {
                          setAiMode('context');
                          setAiResponse(null);
                        }}
                        variant={aiMode === 'context' ? 'default' : 'outline'}
                        className={aiMode === 'context' 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                          : 'border-2 border-purple-300 text-purple-700 hover:bg-purple-50'
                        }
                      >
                        <History className="w-4 h-4 mr-2" />
                        Context
                      </Button>
                      <Button
                        onClick={() => {
                          setAiMode('related');
                          setAiResponse(null);
                        }}
                        variant={aiMode === 'related' ? 'default' : 'outline'}
                        className={aiMode === 'related' 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                          : 'border-2 border-purple-300 text-purple-700 hover:bg-purple-50'
                        }
                      >
                        <Link2 className="w-4 h-4 mr-2" />
                        Related
                      </Button>
                      <Button
                        onClick={() => {
                          setAiMode('ask');
                          setAiResponse(null);
                        }}
                        variant={aiMode === 'ask' ? 'default' : 'outline'}
                        className={aiMode === 'ask' 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                          : 'border-2 border-purple-300 text-purple-700 hover:bg-purple-50'
                        }
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ask
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Question Input for Ask Mode */}
                    {aiMode === 'ask' && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ask a question about this passage..."
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && getAIInsight('ask')}
                          className="border-2 border-purple-300 focus:border-purple-500"
                        />
                        <Button
                          onClick={() => getAIInsight('ask')}
                          disabled={isLoadingAI || !aiQuery.trim()}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          <Sparkles className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Generate Insight Button for Other Modes */}
                    {aiMode !== 'ask' && !aiResponse && (
                      <Button
                        onClick={() => getAIInsight(aiMode)}
                        disabled={isLoadingAI}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        {isLoadingAI ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate {aiMode === 'explain' ? 'Explanation' : aiMode === 'context' ? 'Context' : 'Related Verses'}
                          </>
                        )}
                      </Button>
                    )}

                    {/* AI Response */}
                    {isLoadingAI && (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">AI is analyzing the scripture...</p>
                      </div>
                    )}

                    {aiResponse && !isLoadingAI && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-lg p-4 border-2 border-purple-200"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-purple-900 mb-1">
                              {aiMode === 'explain' && 'Explanation'}
                              {aiMode === 'context' && 'Historical Context'}
                              {aiMode === 'related' && 'Related Verses'}
                              {aiMode === 'ask' && 'Answer'}
                            </h4>
                            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                              {aiResponse}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-3 border-t border-purple-100">
                          <Button
                            onClick={() => getAIInsight(aiMode)}
                            variant="outline"
                            size="sm"
                            className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            <Loader2 className="w-3 h-3 mr-1" />
                            Regenerate
                          </Button>
                          <Button
                            onClick={() => {
                              setAiResponse(null);
                              setAiQuery('');
                            }}
                            variant="outline"
                            size="sm"
                            className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Clear
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Quick Tips */}
                    {!aiResponse && !isLoadingAI && (
                      <div className="bg-purple-100 rounded-lg p-3 text-sm text-purple-800">
                        <p className="font-semibold mb-1">💡 Tips:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• <strong>Explain:</strong> Get simple, clear explanations of complex passages</li>
                          <li>• <strong>Context:</strong> Learn about historical and cultural background</li>
                          <li>• <strong>Related:</strong> Discover connected verses and themes</li>
                          <li>• <strong>Ask:</strong> Ask specific questions about the text</li>
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {selectedBook && (
            <div className="flex gap-3 justify-center">
              <Button
                onClick={goToPrevChapter}
                disabled={selectedChapter <= 1}
                variant="outline"
                className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous Chapter
              </Button>
              <Button
                onClick={goToNextChapter}
                disabled={selectedChapter >= selectedBook.chapters}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Next Chapter
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {!selectedBook && !isLoadingChapter && view === 'browse' && (
        <Card className="border-2 border-dashed border-purple-300">
          <CardContent className="pt-12 pb-12 text-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <BookOpen className="w-20 h-20 text-purple-300 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">The Holy Bible</h3>
            <p className="text-gray-600 mb-6">Select a book above to start reading</p>
            <Button
              onClick={() => setShowBookSelector(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <List className="w-4 h-4 mr-2" />
              Browse Books
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bookmark Modal */}
      <AnimatePresence>
        {showBookmarkModal && selectedVerse && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBookmarkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="border-2 border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-amber-600" />
                    Bookmark This Verse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BookmarkVerseForm
                    verse={selectedVerse}
                    reference={chapterText.reference}
                    onSubmit={(data) => bookmarkVerseMutation.mutate(data)}
                    onCancel={() => {
                      setShowBookmarkModal(false);
                      setSelectedVerse(null);
                    }}
                    isLoading={bookmarkVerseMutation.isPending}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BookmarkVerseForm({ verse, reference, onSubmit, onCancel, isLoading }) {
  const [reflection, setReflection] = useState('');

  const handleSubmit = () => {
    const verseText = typeof verse === 'string' ? verse : verse.text;
    onSubmit({
      reference,
      verse_text: verseText,
      verse_number: verse.verse || '',
      reflection
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <p className="font-semibold text-purple-900 mb-2">{reference}</p>
        <p className="text-sm text-gray-700 italic">
          {typeof verse === 'string' ? verse : verse.text}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Your reflection (optional)
        </label>
        <Input
          placeholder="What does this verse mean to you?"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          className="border-2 border-amber-200 focus:border-amber-400"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Star className="w-4 h-4 mr-2" /> Save Bookmark</>
          )}
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}
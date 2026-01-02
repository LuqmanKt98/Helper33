import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  BookOpen,
  Sparkles,
  Heart,
  Target,
  Calendar,
  Bell,
  TrendingUp,
  Star,
  Lightbulb,
  MessageCircle,
  CheckCircle,
  Loader2,
  Plus,
  Clock,
  Award,
  Flame,
  Moon,
  Sun,
  Bookmark,
  Quote,
  Library,
  Edit,
  ShoppingBag,
  ExternalLink,
  Share2,
  X,
  Twitter,
  Facebook,
  Linkedin,
  Send,
  BookHeart,
  Feather
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import BibleReader from '@/components/spiritual/BibleReader';

// Replace 'YOUR-AFFILIATE-ID' with your actual Amazon Associates ID
const AMAZON_AFFILIATE_ID = 'YOUR-AFFILIATE-ID';

const TOP_SPIRITUAL_BOOKS = [
  {
    id: 'power-of-now',
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    description: 'A guide to spiritual enlightenment through present moment awareness.',
    pages: 236,
    themes: ['mindfulness', 'presence', 'awakening'],
    color: 'from-amber-400 to-orange-500',
    emoji: '🌅',
    cover_image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1386925535i/6708.jpg',
    amazonUrl: 'https://www.amazon.com/dp/1577314808'
  },
  {
    id: 'untethered-soul',
    title: 'The Untethered Soul',
    author: 'Michael A. Singer',
    description: 'Journey beyond yourself to find inner peace and freedom.',
    pages: 200,
    themes: ['consciousness', 'freedom', 'inner peace'],
    color: 'from-blue-400 to-indigo-500',
    emoji: '🦋',
    cover_image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1347364700i/1963638.jpg',
    amazonUrl: 'https://www.amazon.com/dp/1572245379'
  },
  {
    id: 'four-agreements',
    title: 'The Four Agreements',
    author: 'Don Miguel Ruiz',
    description: 'Ancient Toltec wisdom for personal freedom and true happiness.',
    pages: 138,
    themes: ['wisdom', 'freedom', 'transformation'],
    color: 'from-purple-400 to-pink-500',
    emoji: '✨',
    cover_image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1630642134i/6596.jpg',
    amazonUrl: 'https://www.amazon.com/dp/1878424319'
  },
  {
    id: 'alchemist',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    description: 'Follow your dreams and listen to your heart in this spiritual fable.',
    pages: 208,
    themes: ['purpose', 'destiny', 'dreams'],
    color: 'from-emerald-400 to-teal-500',
    emoji: '🗺️',
    cover_image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/18144590.jpg',
    amazonUrl: 'https://www.amazon.com/dp/0062315005'
  },
  {
    id: 'autobiography-yogi',
    title: 'Autobiography of a Yogi',
    author: 'Paramahansa Yogananda',
    description: 'Spiritual classic introducing millions to meditation and yoga.',
    pages: 502,
    themes: ['yoga', 'meditation', 'spirituality'],
    color: 'from-cyan-400 to-blue-500',
    emoji: '🧘',
    cover_image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1519001183i/639864.jpg',
    amazonUrl: 'https://www.amazon.com/dp/0876120796'
  },
  {
    id: 'mans-search-meaning',
    title: "Man's Search for Meaning",
    author: 'Viktor E. Frankl',
    description: 'Finding purpose in the midst of extreme suffering.',
    pages: 165,
    themes: ['purpose', 'resilience', 'meaning'],
    color: 'from-slate-400 to-gray-600',
    emoji: '🕊️',
    cover_image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1535419394i/4069.jpg',
    amazonUrl: 'https://www.amazon.com/dp/080701429X'
  },
  {
    id: 'way-of-zen',
    title: 'The Way of Zen',
    author: 'Alan Watts',
    description: 'Introduction to Zen Buddhism and Eastern philosophy.',
    pages: 236,
    themes: ['zen', 'philosophy', 'peace'],
    color: 'from-green-400 to-emerald-600',
    emoji: '🌿',
    cover_image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388184107i/514210.jpg',
    amazonUrl: 'https://www.amazon.com/dp/0375705104'
  },
  {
    id: 'bhagavad-gita',
    title: 'Bhagavad Gita',
    author: 'Vyasa',
    description: 'Ancient Hindu scripture on duty, devotion, and enlightenment.',
    pages: 128,
    themes: ['dharma', 'devotion', 'wisdom'],
    color: 'from-orange-400 to-red-500',
    emoji: '📿',
    cover_image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654211408i/99944.jpg',
    amazonUrl: 'https://www.amazon.com/dp/1586380192'
  },
  {
    id: 'tao-te-ching',
    title: 'Tao Te Ching',
    author: 'Lao Tzu',
    description: 'Fundamental text of Taoism on living in harmony with the Tao.',
    pages: 96,
    themes: ['taoism', 'harmony', 'balance'],
    color: 'from-indigo-400 to-purple-600',
    emoji: '☯️',
    cover_image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1653311330i/67896.jpg',
    amazonUrl: 'https://www.amazon.com/dp/0061142662'
  },
  {
    id: 'celestine-prophecy',
    title: 'The Celestine Prophecy',
    author: 'James Redfield',
    description: 'Adventure parable about spiritual awakening and synchronicity.',
    pages: 247,
    themes: ['awakening', 'energy', 'synchronicity'],
    color: 'from-pink-400 to-rose-500',
    emoji: '🌟',
    cover_image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1630641867i/10759.jpg',
    amazonUrl: 'https://www.amazon.com/dp/0446671002'
  }
];

const FEELING_PROMPTS = [
  { emoji: '😔', text: 'I feel lost and need direction', gradient: 'from-blue-400 to-indigo-500' },
  { emoji: '😰', text: 'I am anxious and seeking peace', gradient: 'from-purple-400 to-pink-500' },
  { emoji: '🤔', text: 'I want to find my purpose', gradient: 'from-emerald-400 to-teal-500' },
  { emoji: '💭', text: 'I seek deeper meaning in life', gradient: 'from-amber-400 to-orange-500' },
  { emoji: '🌱', text: 'I want to grow spiritually', gradient: 'from-green-400 to-emerald-500' },
  { emoji: '💫', text: 'I need transformation', gradient: 'from-pink-400 to-rose-500' }
];

function BookCoverImage({ book, idx }) {
  const [coverUrl, setCoverUrl] = useState(book.cover_image || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageError, setImageError] = useState(false);

  const generateAICover = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const prompt = `Professional book cover design for "${book.title}" by ${book.author}. ${book.description}. Spiritual and inspirational aesthetic, elegant typography, mystical elements, peaceful colors, professional publishing quality, photorealistic, 4K`;
      
      const response = await base44.integrations.Core.GenerateImage({ prompt });
      
      if (response.url) {
        setCoverUrl(response.url);
        setImageError(false);
      }
    } catch (error) {
      console.error('Failed to generate cover:', error);
      setImageError(true);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="relative h-80 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-purple-700">Generating cover art...</p>
        </div>
      </div>
    );
  }

  if (coverUrl && !imageError) {
    return (
      <div className="relative h-80 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
        <motion.img
          src={coverUrl}
          alt={`${book.title} cover`}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          onError={() => {
            setImageError(true);
            generateAICover();
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {book.is_custom && (
          <Badge className="absolute top-3 right-3 bg-amber-500 text-white shadow-lg">
            <Library className="w-3 h-3 mr-1" />
            Custom
          </Badge>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={`h-3 bg-gradient-to-r ${book.color || 'from-purple-400 to-pink-500'}`} />
      <div className="p-6 relative">
        {book.is_custom && (
          <Badge className="bg-amber-500 text-white mb-3">
            <Library className="w-3 h-3 mr-1" />
            Custom
          </Badge>
        )}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: idx * 0.5 }}
          className="text-6xl mb-4 text-center"
        >
          {book.emoji}
        </motion.div>
        <Button
          onClick={generateAICover}
          variant="outline"
          size="sm"
          className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          <Sparkles className="w-3 h-3 mr-2" />
          Generate Cover Art
        </Button>
      </div>
    </>
  );
}

export default function SpiritualHub() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCustomBookModal, setShowCustomBookModal] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [selectedPlanForBookmark, setSelectedPlanForBookmark] = useState(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiBookSuggestions, setAiBookSuggestions] = useState(null);
  const [showReadingPathModal, setShowReadingPathModal] = useState(false);
  const [readingPathGoal, setReadingPathGoal] = useState('');
  const [aiReadingPath, setAiReadingPath] = useState(null);
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [completedBookToShare, setCompletedBookToShare] = useState(null);
  const [journalInput, setJournalInput] = useState('');
  const [isJournaling, setIsJournaling] = useState(false);
  const [aiJournalResponse, setAiJournalResponse] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: readingPlans = [] } = useQuery({
    queryKey: ['spiritual-reading-plans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const plans = user.spiritual_reading_plans || [];
      return plans;
    },
    enabled: !!user
  });

  const { data: customBooks = [] } = useQuery({
    queryKey: ['custom-spiritual-books', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return user.custom_spiritual_books || [];
    },
    enabled: !!user
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['spiritual-bookmarks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return user.spiritual_bookmarks || [];
    },
    enabled: !!user
  });

  const { data: bibleBookmarks = [] } = useQuery({
    queryKey: ['bible-bookmarks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return user.bible_bookmarks || [];
    },
    enabled: !!user
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ['spiritual-journal-entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return (user.spiritual_journal_entries || []).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
    },
    enabled: !!user
  });

  // Combine all bookmarks
  const allBookmarks = [
    ...bookmarks.map(b => ({ ...b, type: 'book' })),
    ...bibleBookmarks.map(b => ({ ...b, type: 'bible' }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const allBooks = [...TOP_SPIRITUAL_BOOKS, ...customBooks];

  const createPlanMutation = useMutation({
    mutationFn: async (planData) => {
      const newPlan = {
        id: Date.now().toString(),
        ...planData,
        created_at: new Date().toISOString(),
        progress: 0,
        current_page: 0
      };
      
      const updatedPlans = [...(user.spiritual_reading_plans || []), newPlan];
      await base44.auth.updateMe({ spiritual_reading_plans: updatedPlans });
      return updatedPlans;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['spiritual-reading-plans']);
      toast.success('📖 Reading plan created!');
      setShowPlanModal(false);
      setSelectedBook(null);
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ planId, updates }) => {
      const updatedPlans = (user.spiritual_reading_plans || []).map(p =>
        p.id === planId ? { ...p, ...updates } : p
      );
      await base44.auth.updateMe({ spiritual_reading_plans: updatedPlans });
      return { updatedPlans, justCompleted: updates.progress === 100 };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['spiritual-reading-plans']);
      if (data.justCompleted) {
        const plan = readingPlans.find(p => p.id === variables.planId);
        const book = allBooks.find(b => b.id === plan?.book_id);
        if (book) {
          setCompletedBookToShare({ book, plan });
          setShowShareModal(true);
          toast.success('🎉 Congratulations! Book completed!');
        }
      } else {
        toast.success('Progress updated!');
      }
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId) => {
      const updatedPlans = (user.spiritual_reading_plans || []).filter(p => p.id !== planId);
      await base44.auth.updateMe({ spiritual_reading_plans: updatedPlans });
      return updatedPlans;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['spiritual-reading-plans']);
      toast.success('🗑️ Reading plan removed');
    }
  });

  const archivePlanMutation = useMutation({
    mutationFn: async (planId) => {
      const updatedPlans = (user.spiritual_reading_plans || []).map(p =>
        p.id === planId ? { ...p, archived: true, archived_at: new Date().toISOString() } : p
      );
      await base44.auth.updateMe({ spiritual_reading_plans: updatedPlans });
      return updatedPlans;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['spiritual-reading-plans']);
      toast.success('📦 Book archived successfully!');
    }
  });

  const shareToSocialMedia = (platform) => {
    if (!completedBookToShare) return;
    
    const { book } = completedBookToShare;
    const text = `🎉 Just completed reading "${book.title}" by ${book.author} on Helper33! ${book.emoji} #SpiritualGrowth #Reading #PersonalDevelopment`;
    const url = window.location.origin;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
      toast.success(`Shared to ${platform}!`);
    }
  };

  const shareOnPlatform = async () => {
    if (!completedBookToShare || !user) return;
    
    const { book } = completedBookToShare;
    const achievement = {
      type: 'book_completion',
      book_title: book.title,
      book_author: book.author,
      book_emoji: book.emoji,
      completed_at: new Date().toISOString(),
      user_name: user.full_name || user.email.split('@')[0]
    };
    
    const achievements = [...(user.spiritual_achievements || []), achievement];
    await base44.auth.updateMe({ spiritual_achievements: achievements });
    
    toast.success('🌟 Achievement shared on Helper33!');
    setShowShareModal(false);
  };

  const handleAIJournaling = async () => {
    if (!journalInput.trim()) {
      toast.error('Please share your thoughts');
      return;
    }

    setIsJournaling(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a compassionate spiritual companion and journaling guide. The user wants to journal their spiritual thoughts, feelings, or experiences. They shared: "${journalInput}"

Your role:
1. Acknowledge their sharing with empathy and warmth
2. Offer gentle reflections or insights if appropriate
3. Ask a thoughtful follow-up question to deepen their reflection (optional)
4. Create a meaningful summary of their entry for their journal record

Be authentic, supportive, and spiritually sensitive. Keep your response concise (2-3 paragraphs).`,
        response_json_schema: {
          type: 'object',
          properties: {
            response: { type: 'string' },
            summary: { type: 'string' },
            themes: { type: 'array', items: { type: 'string' } },
            suggested_prompt: { type: 'string' }
          }
        }
      });

      // Save journal entry
      const newEntry = {
        id: Date.now().toString(),
        content: journalInput,
        ai_summary: response.summary,
        ai_response: response.response,
        themes: response.themes || [],
        created_at: new Date().toISOString()
      };

      const updatedEntries = [...(user.spiritual_journal_entries || []), newEntry];
      await base44.auth.updateMe({ spiritual_journal_entries: updatedEntries });

      queryClient.invalidateQueries(['spiritual-journal-entries']);
      
      setAiJournalResponse(response);
      toast.success('📝 Journal entry saved!');
      
      // Don't clear input immediately so user can continue the thought
    } catch (error) {
      console.error('Journaling error:', error);
      toast.error('Failed to process journal entry');
    } finally {
      setIsJournaling(false);
    }
  };

  const handleAIRecommendation = async () => {
    if (!userPrompt.trim()) {
      toast.error('Please describe how you\'re feeling');
      return;
    }

    setIsSearching(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a compassionate spiritual book advisor. The user says: "${userPrompt}"
        
        Based on their emotional state and spiritual needs, recommend 3-5 books from this list that would help them most:
        ${TOP_SPIRITUAL_BOOKS.map(b => `- ${b.title} by ${b.author}: ${b.description}`).join('\n')}
        
        For each recommendation, provide:
        1. The book title (must match exactly from the list)
        2. Why this book will help their specific situation
        3. A key insight or practice they can expect
        4. Estimated reading timeline suggestion
        
        Format as JSON array with: title, reason, key_insight, timeline`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  reason: { type: 'string' },
                  key_insight: { type: 'string' },
                  timeline: { type: 'string' }
                }
              }
            },
            overall_guidance: { type: 'string' }
          }
        }
      });

      setAiRecommendations(response);
      toast.success('✨ Recommendations ready!');
    } catch (error) {
      console.error('AI recommendation failed:', error);
      toast.error('Failed to get recommendations');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreatePlan = (book) => {
    setSelectedBook(book);
    setShowPlanModal(true);
  };

  const addCustomBookMutation = useMutation({
    mutationFn: async (bookData) => {
      const newBook = {
        id: `custom-${Date.now()}`,
        ...bookData,
        is_custom: true,
        created_at: new Date().toISOString()
      };
      
      const updatedBooks = [...(user.custom_spiritual_books || []), newBook];
      await base44.auth.updateMe({ custom_spiritual_books: updatedBooks });
      return updatedBooks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['custom-spiritual-books']);
      toast.success('📚 Custom book added!');
      setShowCustomBookModal(false);
    }
  });

  const addBookmarkMutation = useMutation({
    mutationFn: async (bookmarkData) => {
      const newBookmark = {
        id: Date.now().toString(),
        ...bookmarkData,
        created_at: new Date().toISOString()
      };
      
      const updatedBookmarks = [...(user.spiritual_bookmarks || []), newBookmark];
      await base44.auth.updateMe({ spiritual_bookmarks: updatedBookmarks });
      return updatedBookmarks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['spiritual-bookmarks']);
      toast.success('⭐ Quote bookmarked!');
      setShowBookmarkModal(false);
      setSelectedPlanForBookmark(null);
    }
  });

  const getAIBookSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const readingHistory = readingPlans.map(p => {
        const book = allBooks.find(b => b.id === p.book_id);
        return book ? `${book.title} by ${book.author} (themes: ${book.themes?.join(', ')})` : '';
      }).filter(Boolean).join('; ');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a spiritual literature expert. Based on the user's reading history and preferences, suggest 5 new spiritual books they haven't read yet.

User's Reading History: ${readingHistory || 'No history yet'}

Suggest books that:
1. Complement their reading history themes
2. Offer new perspectives on spirituality
3. Are well-regarded in spiritual literature
4. Progress their spiritual journey

For each book provide:
- Title and Author (exact, real books only)
- Brief description (1-2 sentences)
- Why it fits their journey
- Key themes
- Page count
- Amazon URL (use real ASIN, format: https://www.amazon.com/dp/ASIN)
- Goodreads cover image URL (format: https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/...)
- Emoji (relevant emoji)

IMPORTANT: Only suggest real, published spiritual books with actual ISBNs/ASINs.

Return as JSON with: title, author, description, reason, themes (array), pages, amazonUrl, cover_image, emoji`,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  author: { type: 'string' },
                  description: { type: 'string' },
                  reason: { type: 'string' },
                  themes: { type: 'array', items: { type: 'string' } },
                  pages: { type: 'number' },
                  amazonUrl: { type: 'string' },
                  cover_image: { type: 'string' },
                  emoji: { type: 'string' }
                }
              }
            },
            personalized_message: { type: 'string' }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setAiBookSuggestions(data);
      setShowAISuggestions(true);
      toast.success('📚 Book suggestions ready!');
    }
  });

  const generateReadingPathMutation = useMutation({
    mutationFn: async () => {
      const completedBooks = readingPlans.filter(p => p.progress === 100).map(p => {
        const book = allBooks.find(b => b.id === p.book_id);
        return book ? book.title : '';
      }).filter(Boolean);

      const currentBooks = readingPlans.filter(p => p.progress > 0 && p.progress < 100).map(p => {
        const book = allBooks.find(b => b.id === p.book_id);
        return book ? book.title : '';
      }).filter(Boolean);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a spiritual reading guide. Create a personalized reading path for someone with this long-term goal: "${readingPathGoal}"

Their Reading Background:
- Completed: ${completedBooks.join(', ') || 'None yet'}
- Currently Reading: ${currentBooks.join(', ') || 'None'}

Create a 6-12 month reading path with:
1. 5-7 books in a specific order that builds upon each other
2. Each book should prepare them for the next
3. Include books from various traditions (Eastern, Western, mystical, practical)
4. Mix foundational texts with modern interpretations
5. Consider pacing - easier books first, deeper ones later

For each book provide:
- Title and author
- Why it's placed at this point in the journey
- What they'll gain from it
- Suggested duration (weeks)
- How it connects to the next book`,
        response_json_schema: {
          type: 'object',
          properties: {
            path_title: { type: 'string' },
            path_description: { type: 'string' },
            total_duration_weeks: { type: 'number' },
            books: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  order: { type: 'number' },
                  title: { type: 'string' },
                  author: { type: 'string' },
                  placement_reason: { type: 'string' },
                  expected_gains: { type: 'string' },
                  duration_weeks: { type: 'number' },
                  connection_to_next: { type: 'string' }
                }
              }
            }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setAiReadingPath(data);
      toast.success('🗺️ Your reading path is ready!');
    }
  });

  return (
    <>
      <SEO 
        title="Spiritual Reading Hub - Plan & Track Your Spiritual Journey"
        description="Discover top spiritual books, get AI-powered recommendations, and track your spiritual reading journey"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
            >
              <BookOpen className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Spiritual Reading Hub
            </h1>
            <p className="text-gray-600">Discover wisdom, track your journey, and grow spiritually</p>
          </motion.div>

          {/* Quick Links */}
          <div className="flex justify-center mb-6">
            <Link to={createPageUrl('SpiritualForum')}>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                Join Community Forum
              </Button>
            </Link>
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-xs text-gray-700 text-center">
            <p>
              📚 <strong>Disclaimer:</strong> Book covers displayed may be AI-generated if original covers cannot be loaded. 
              We do not claim ownership, credit, or make any changes to the original works. All rights belong to their respective authors and publishers.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'bible', label: 'Holy Bible', icon: BookOpen },
              { id: 'discover', label: 'Discover Books', icon: Sparkles },
              { id: 'journal', label: 'Spiritual Journal', icon: BookHeart },
              { id: 'ai', label: 'AI Recommendations', icon: Lightbulb },
              { id: 'path', label: 'Reading Path', icon: Target },
              { id: 'plans', label: 'My Reading Plans', icon: Target },
              { id: 'bookmarks', label: 'Saved Quotes', icon: Bookmark },
              { id: 'progress', label: 'Progress', icon: TrendingUp }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : ''
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Bible Tab */}
            {activeTab === 'bible' && (
              <motion.div
                key="bible"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <BibleReader />
              </motion.div>
            )}

            {/* Spiritual Journal Tab */}
            {activeTab === 'journal' && (
              <motion.div
                key="journal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* AI Journal Interface */}
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <Feather className="w-5 h-5" />
                      AI Spiritual Journaling
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                      Share your spiritual thoughts, reflections, prayers, or experiences. Your AI companion will listen, reflect, and help document your journey.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Today I'm feeling... I've been reflecting on... I'm grateful for... I'm struggling with..."
                      value={journalInput}
                      onChange={(e) => setJournalInput(e.target.value)}
                      className="min-h-[150px] border-2 border-purple-200 focus:border-purple-400 text-base"
                    />

                    <div className="flex gap-2">
                      <Button
                        onClick={handleAIJournaling}
                        disabled={isJournaling || !journalInput.trim()}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12 text-base"
                      >
                        {isJournaling ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing your reflection...
                          </>
                        ) : (
                          <>
                            <BookHeart className="w-5 h-5 mr-2" />
                            Journal This & Get AI Reflection
                          </>
                        )}
                      </Button>
                      {journalInput && (
                        <Button
                          onClick={() => {
                            setJournalInput('');
                            setAiJournalResponse(null);
                          }}
                          variant="outline"
                          className="border-2 border-gray-300"
                        >
                          Clear
                        </Button>
                      )}
                    </div>

                    {/* AI Response */}
                    {aiJournalResponse && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl p-6 border-2 border-purple-200 space-y-4"
                      >
                        <div className="flex items-start gap-3">
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"
                          >
                            <Sparkles className="w-5 h-5 text-white" />
                          </motion.div>
                          <div className="flex-1">
                            <h4 className="font-bold text-purple-900 mb-2">AI Reflection</h4>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {aiJournalResponse.response}
                            </p>
                          </div>
                        </div>

                        {aiJournalResponse.themes?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {aiJournalResponse.themes.map((theme, idx) => (
                              <Badge key={idx} className="bg-purple-100 text-purple-700 border border-purple-300">
                                {theme}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {aiJournalResponse.suggested_prompt && (
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <p className="text-sm text-blue-800 mb-2 font-semibold">💭 Continue reflecting:</p>
                            <p className="text-sm text-gray-700">{aiJournalResponse.suggested_prompt}</p>
                          </div>
                        )}

                        <Button
                          onClick={() => {
                            setJournalInput('');
                            setAiJournalResponse(null);
                          }}
                          variant="outline"
                          className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          Start New Entry
                        </Button>
                      </motion.div>
                    )}

                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 text-sm">
                      <p className="text-purple-800 mb-2 font-semibold">✨ Tips for Spiritual Journaling:</p>
                      <ul className="space-y-1 text-purple-700 text-xs">
                        <li>• Share your prayers, meditations, or spiritual insights</li>
                        <li>• Reflect on scriptures or spiritual readings that moved you</li>
                        <li>• Document moments of gratitude, synchronicity, or divine guidance</li>
                        <li>• Process doubts, questions, or spiritual struggles</li>
                        <li>• Record dreams, visions, or intuitive messages</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Journal Entries History */}
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Your Spiritual Journey ({journalEntries.length} entries)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {journalEntries.length === 0 ? (
                      <div className="text-center py-12">
                        <BookHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">Start your spiritual journaling journey today</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {journalEntries.map((entry, idx) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-gradient-to-br from-white to-purple-50 rounded-lg p-5 border-2 border-purple-200 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-600" />
                                <span className="text-sm text-gray-600">
                                  {new Date(entry.created_at).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>

                            {entry.ai_summary && (
                              <div className="bg-purple-100 rounded-lg p-3 mb-3 border border-purple-200">
                                <p className="text-xs font-semibold text-purple-900 mb-1">Summary:</p>
                                <p className="text-sm text-gray-700">{entry.ai_summary}</p>
                              </div>
                            )}

                            <p className="text-gray-800 leading-relaxed mb-3 italic">
                              "{entry.content}"
                            </p>

                            {entry.themes?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {entry.themes.map((theme, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {theme}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Discover Books Tab */}
            {activeTab === 'discover' && (
              <motion.div
                key="discover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Add Custom Book Button */}
                <div className="flex gap-2 mb-6">
                  <Button
                    onClick={() => setShowCustomBookModal(true)}
                    variant="outline"
                    className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Book
                  </Button>
                  <Button
                    onClick={() => getAIBookSuggestionsMutation.mutate()}
                    disabled={getAIBookSuggestionsMutation.isPending}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    {getAIBookSuggestionsMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Getting suggestions...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> AI Book Suggestions</>
                    )}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allBooks.map((book, idx) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                    >
                      <Card className="h-full border-2 border-purple-200 hover:shadow-2xl transition-all bg-white overflow-hidden">
                        {/* Book Cover */}
                        <BookCoverImage book={book} idx={idx} />

                        <CardContent className="pt-6 space-y-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{book.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                          </div>

                          <p className="text-sm text-gray-700 leading-relaxed">{book.description}</p>

                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <BookOpen className="w-4 h-4" />
                            <span>{book.pages} pages</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {book.themes.map((theme, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {theme}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleCreatePlan(book)}
                              className={`flex-1 bg-gradient-to-r ${book.color || 'from-purple-400 to-pink-500'} hover:opacity-90 text-white`}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Start Plan
                            </Button>
                            {book.amazonUrl && (
                              <Button
                                onClick={() => {
                                  toast.success('📚 Redirecting to Amazon...');
                                  const affiliateUrl = `${book.amazonUrl}?tag=${AMAZON_AFFILIATE_ID}`;
                                  setTimeout(() => {
                                    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
                                  }, 500);
                                }}
                                variant="outline"
                                className="border-2 border-green-500 text-green-700 hover:bg-green-50"
                              >
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Buy
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI Recommendations Tab */}
            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <MessageCircle className="w-5 h-5" />
                      Tell me how you're feeling...
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="I'm going through a difficult time and need guidance..."
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      className="min-h-[120px] border-2 border-purple-200 focus:border-purple-400"
                    />

                    <Button
                      onClick={handleAIRecommendation}
                      disabled={isSearching}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12 text-lg"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Finding perfect books...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Get AI Recommendations
                        </>
                      )}
                    </Button>

                    {/* Quick Prompts */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">Or try these:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {FEELING_PROMPTS.map((prompt, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              setUserPrompt(prompt.text);
                              setTimeout(handleAIRecommendation, 100);
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

                {/* AI Results */}
                {aiRecommendations && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    {aiRecommendations.overall_guidance && (
                      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <Heart className="w-5 h-5 text-emerald-600 mt-1" />
                            <p className="text-gray-700 leading-relaxed">{aiRecommendations.overall_guidance}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {aiRecommendations.recommendations?.map((rec, idx) => {
                      const book = TOP_SPIRITUAL_BOOKS.find(b => b.title === rec.title);
                      if (!book) return null;
                      
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card className="border-2 border-purple-200 hover:shadow-xl transition-all overflow-hidden bg-white">
                            {/* Book Cover */}
                            <div className="relative">
                              <BookCoverImage book={book} idx={idx} />
                              <Badge className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                                {rec.timeline}
                              </Badge>
                            </div>

                            <CardContent className="pt-6 space-y-3">
                              <div className="flex items-start gap-3">
                                <span className="text-3xl">{book.emoji}</span>
                                <div className="flex-1">
                                  <h3 className="font-bold text-lg text-gray-900">{book.title}</h3>
                                  <p className="text-sm text-gray-600">by {book.author}</p>
                                </div>
                              </div>

                              <div className="bg-purple-50 rounded-lg p-3 space-y-2">
                                <div className="flex items-start gap-2">
                                  <Lightbulb className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-semibold text-purple-900 mb-1">Why this book:</p>
                                    <p className="text-sm text-gray-700">{rec.reason}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-blue-50 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                  <Star className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-semibold text-blue-900 mb-1">Key Insight:</p>
                                    <p className="text-sm text-gray-700">{rec.key_insight}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleCreatePlan(book)}
                                  className={`flex-1 bg-gradient-to-r ${book.color} hover:opacity-90 text-white`}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Create Plan
                                </Button>
                                {book.amazonUrl && (
                                  <Button
                                    onClick={() => {
                                      toast.success('📚 Redirecting to Amazon...');
                                      const affiliateUrl = `${book.amazonUrl}?tag=${AMAZON_AFFILIATE_ID}`;
                                      setTimeout(() => {
                                        window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
                                      }, 500);
                                    }}
                                    variant="outline"
                                    className="border-2 border-green-500 text-green-700 hover:bg-green-50"
                                  >
                                    <ShoppingBag className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* AI Reading Path Tab */}
            {activeTab === 'path' && (
              <motion.div
                key="path"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <Target className="w-5 h-5" />
                      Create Your Spiritual Reading Path
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="What's your long-term spiritual goal? (e.g., 'I want to develop a deeper meditation practice', 'I seek to understand different spiritual traditions', 'I want to heal from grief and find meaning')..."
                      value={readingPathGoal}
                      onChange={(e) => setReadingPathGoal(e.target.value)}
                      className="min-h-[120px] border-2 border-purple-200 focus:border-purple-400"
                    />

                    <Button
                      onClick={() => generateReadingPathMutation.mutate()}
                      disabled={generateReadingPathMutation.isPending || !readingPathGoal.trim()}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12 text-lg"
                    >
                      {generateReadingPathMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Crafting your path...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Reading Path
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Reading Path Results */}
                {aiReadingPath && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                      <CardContent className="pt-6">
                        <h3 className="text-2xl font-bold text-emerald-900 mb-2">{aiReadingPath.path_title}</h3>
                        <p className="text-gray-700 mb-3">{aiReadingPath.path_description}</p>
                        <Badge className="bg-emerald-500 text-white">
                          <Clock className="w-3 h-3 mr-1" />
                          {aiReadingPath.total_duration_weeks} weeks total
                        </Badge>
                      </CardContent>
                    </Card>

                    <div className="relative">
                      {/* Path Line */}
                      <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-300 via-pink-300 to-blue-300" />

                      <div className="space-y-6">
                        {aiReadingPath.books?.map((book, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative pl-16"
                          >
                            {/* Step Number */}
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                              className="absolute left-0 top-4 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg"
                            >
                              {book.order}
                            </motion.div>

                            <Card className="border-2 border-purple-200 hover:shadow-xl transition-all">
                              <CardContent className="pt-6 space-y-3">
                                <div>
                                  <h4 className="font-bold text-xl text-gray-900">{book.title}</h4>
                                  <p className="text-sm text-gray-600">by {book.author}</p>
                                  <Badge className="mt-2 bg-purple-500 text-white">
                                    {book.duration_weeks} weeks
                                  </Badge>
                                </div>

                                <div className="bg-purple-50 rounded-lg p-3">
                                  <p className="text-sm font-semibold text-purple-900 mb-1">Why now:</p>
                                  <p className="text-sm text-gray-700">{book.placement_reason}</p>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-3">
                                  <p className="text-sm font-semibold text-blue-900 mb-1">You'll gain:</p>
                                  <p className="text-sm text-gray-700">{book.expected_gains}</p>
                                </div>

                                {book.connection_to_next && (
                                  <div className="bg-pink-50 rounded-lg p-3">
                                    <p className="text-sm font-semibold text-pink-900 mb-1">Leads to:</p>
                                    <p className="text-sm text-gray-700">{book.connection_to_next}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* My Reading Plans Tab */}
            {activeTab === 'plans' && (
              <motion.div
                key="plans"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Show/Hide Archived Toggle */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowArchived(!showArchived)}
                    variant="outline"
                    size="sm"
                    className="border-2 border-purple-300 text-purple-700"
                  >
                    {showArchived ? '📚 Hide Archived' : '📦 Show Archived'}
                  </Button>
                </div>

                {readingPlans.filter(p => showArchived ? p.archived : !p.archived).length === 0 ? (
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="pt-6 text-center py-12">
                      <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        {showArchived ? 'No archived plans' : 'No active reading plans yet'}
                      </p>
                      <p className="text-sm text-gray-500">Go to Discover Books to start your spiritual journey</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {readingPlans.filter(p => showArchived ? p.archived : !p.archived).map((plan, idx) => {
                      const book = allBooks.find(b => b.id === plan.book_id);
                      if (!book) return null;

                      return (
                        <motion.div
                          key={plan.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card className="border-2 border-purple-200 hover:shadow-xl transition-all">
                            <div className={`h-2 bg-gradient-to-r ${book.color}`} />
                            <CardContent className="pt-6 space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-3xl">{book.emoji}</span>
                                  <div>
                                    <h3 className="font-bold text-gray-900">{book.title}</h3>
                                    <p className="text-sm text-gray-600">{plan.pages_per_day} pages/day</p>
                                  </div>
                                </div>
                                {plan.progress === 100 && (
                                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                                    <Award className="w-3 h-3 mr-1" />
                                    {plan.archived ? 'Archived' : 'Complete!'}
                                  </Badge>
                                )}
                              </div>

                              {plan.reminder_enabled && (
                                <div className="flex items-center gap-2 text-sm text-purple-600">
                                  <Bell className="w-4 h-4" />
                                  <span>Daily reminder at {plan.reminder_time}</span>
                                </div>
                              )}

                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Progress</span>
                                  <span className="text-sm font-bold text-purple-600">
                                    {plan.current_page} / {book.pages} pages
                                  </span>
                                </div>
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                    className={`h-full bg-gradient-to-r ${book.color}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${plan.progress}%` }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                              </div>

                              {plan.progress < 100 ? (
                               <div className="space-y-2">
                                 <div className="flex gap-2">
                                   <Button
                                     onClick={() => {
                                       const newPage = Math.min(plan.current_page + plan.pages_per_day, book.pages);
                                       const newProgress = Math.round((newPage / book.pages) * 100);
                                       updatePlanMutation.mutate({
                                         planId: plan.id,
                                         updates: { current_page: newPage, progress: newProgress }
                                       });
                                     }}
                                     className={`flex-1 bg-gradient-to-r ${book.color || 'from-purple-400 to-pink-500'} hover:opacity-90 text-white`}
                                   >
                                     <CheckCircle className="w-4 h-4 mr-2" />
                                     Log Today's Reading
                                   </Button>
                                   <Button
                                     onClick={() => {
                                       setSelectedPlanForBookmark(plan);
                                       setShowBookmarkModal(true);
                                     }}
                                     variant="outline"
                                     className="border-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                                   >
                                     <Bookmark className="w-4 h-4" />
                                   </Button>
                                 </div>
                                 <Button
                                   onClick={() => setPlanToDelete(plan)}
                                   variant="outline"
                                   size="sm"
                                   className="w-full border-2 border-red-300 text-red-600 hover:bg-red-50"
                                 >
                                   <X className="w-3 h-3 mr-2" />
                                   Delete Plan
                                 </Button>
                               </div>
                              ) : plan.archived ? (
                               <Button
                                 onClick={() => setPlanToDelete(plan)}
                                 variant="outline"
                                 className="w-full border-2 border-red-300 text-red-600 hover:bg-red-50"
                               >
                                 <X className="w-4 h-4 mr-2" />
                                 Delete
                               </Button>
                              ) : (
                               <div className="space-y-2">
                                 <Button
                                   onClick={() => {
                                     setCompletedBookToShare({ book, plan });
                                     setShowShareModal(true);
                                   }}
                                   className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                                 >
                                   <Share2 className="w-4 h-4 mr-2" />
                                   Share Achievement
                                 </Button>
                                 <div className="flex gap-2">
                                   <Button
                                     onClick={() => archivePlanMutation.mutate(plan.id)}
                                     disabled={archivePlanMutation.isPending}
                                     variant="outline"
                                     size="sm"
                                     className="flex-1 border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                                   >
                                     <Bookmark className="w-3 h-3 mr-2" />
                                     Archive
                                   </Button>
                                   <Button
                                     onClick={() => setPlanToDelete(plan)}
                                     variant="outline"
                                     size="sm"
                                     className="flex-1 border-2 border-red-300 text-red-600 hover:bg-red-50"
                                   >
                                     <X className="w-3 h-3 mr-2" />
                                     Delete
                                   </Button>
                                 </div>
                               </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === 'bookmarks' && (
              <motion.div
                key="bookmarks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {allBookmarks.length === 0 ? (
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="pt-6 text-center py-12">
                      <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No bookmarked quotes yet</p>
                      <p className="text-sm text-gray-500">Save meaningful quotes and verses as you read</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {allBookmarks.map((bookmark, idx) => {
                      const book = bookmark.type === 'book' ? allBooks.find(b => b.id === bookmark.book_id) : null;
                      const isBible = bookmark.type === 'bible';
                      
                      return (
                        <motion.div
                          key={bookmark.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className={`border-2 bg-gradient-to-br hover:shadow-xl transition-all ${
                            isBible 
                              ? 'border-purple-200 from-purple-50 to-pink-50' 
                              : 'border-amber-200 from-amber-50 to-orange-50'
                          }`}>
                            <CardContent className="pt-6 space-y-3">
                              {isBible && (
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-2">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  Bible Verse
                                </Badge>
                              )}
                              
                              <div className="flex items-start gap-2 mb-3">
                                <Quote className={`w-5 h-5 flex-shrink-0 mt-1 ${
                                  isBible ? 'text-purple-600' : 'text-amber-600'
                                }`} />
                                <p className="text-gray-800 italic leading-relaxed">
                                  "{isBible ? bookmark.verse_text : bookmark.quote}"
                                </p>
                              </div>
                              
                              {bookmark.reflection && (
                                <div className={`rounded-lg p-3 border ${
                                  isBible 
                                    ? 'bg-white border-purple-200' 
                                    : 'bg-white border-amber-200'
                                }`}>
                                  <p className="text-sm text-gray-700">{bookmark.reflection}</p>
                                </div>
                              )}

                              <div className={`flex items-center justify-between pt-2 border-t ${
                                isBible ? 'border-purple-200' : 'border-amber-200'
                              }`}>
                                <div className="flex items-center gap-2">
                                  {isBible ? (
                                    <span className="text-xl">📖</span>
                                  ) : (
                                    book && <span className="text-xl">{book.emoji}</span>
                                  )}
                                  <div>
                                    <p className="text-xs font-semibold text-gray-900">
                                      {isBible ? bookmark.reference : book?.title}
                                    </p>
                                    {!isBible && bookmark.page_number && (
                                      <p className="text-xs text-gray-500">Page {bookmark.page_number}</p>
                                    )}
                                  </div>
                                </div>
                                <Star className={isBible ? 'w-4 h-4 text-purple-500' : 'w-4 h-4 text-amber-500'} />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardContent className="pt-6 text-center">
                      <Flame className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-gray-900">
                        {readingPlans.filter(p => p.progress > 0).length}
                      </p>
                      <p className="text-sm text-gray-600">Active Plans</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                    <CardContent className="pt-6 text-center">
                      <Award className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-gray-900">
                        {readingPlans.filter(p => p.progress === 100).length}
                      </p>
                      <p className="text-sm text-gray-600">Books Completed</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardContent className="pt-6 text-center">
                      <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-gray-900">
                        {readingPlans.reduce((sum, p) => sum + p.current_page, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Pages Read</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Reading Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {readingPlans.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Start a reading plan to track your progress</p>
                    ) : (
                      readingPlans.map((plan, idx) => {
                        const book = allBooks.find(b => b.id === plan.book_id);
                        if (!book) return null;

                        return (
                          <div key={plan.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-2xl">{book.emoji}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{book.title}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <Clock className="w-3 h-3" />
                                <span>Started {new Date(plan.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Badge className={plan.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}>
                              {plan.progress}%
                            </Badge>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Add Custom Book Modal */}
        <AnimatePresence>
          {showCustomBookModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCustomBookModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Library className="w-5 h-5" />
                      Add Custom Spiritual Book
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AddCustomBookForm
                      onSubmit={(data) => addCustomBookMutation.mutate(data)}
                      onCancel={() => setShowCustomBookModal(false)}
                      isLoading={addCustomBookMutation.isPending}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Bookmark Modal */}
        <AnimatePresence>
          {showBookmarkModal && selectedPlanForBookmark && (
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
                      Save Quote or Verse
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AddBookmarkForm
                      plan={selectedPlanForBookmark}
                      onSubmit={(data) => addBookmarkMutation.mutate(data)}
                      onCancel={() => {
                        setShowBookmarkModal(false);
                        setSelectedPlanForBookmark(null);
                      }}
                      isLoading={addBookmarkMutation.isPending}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Book Suggestions Modal */}
        <AnimatePresence>
          {showAISuggestions && aiBookSuggestions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowAISuggestions(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl my-8"
              >
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      AI Book Suggestions For You
                    </CardTitle>
                    {aiBookSuggestions.personalized_message && (
                      <p className="text-sm text-gray-600 mt-2">{aiBookSuggestions.personalized_message}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {aiBookSuggestions.suggestions?.map((suggestion, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="border-2 border-blue-200 bg-white overflow-hidden">
                        {/* Book Cover */}
                        <BookCoverImage book={suggestion} idx={idx} />
                          
                          <CardContent className="pt-6 space-y-3">
                            <div className="flex items-start gap-3">
                              <span className="text-3xl">{suggestion.emoji}</span>
                              <div className="flex-1">
                                <h4 className="font-bold text-lg text-gray-900">{suggestion.title}</h4>
                                <p className="text-sm text-gray-600">by {suggestion.author}</p>
                                <p className="text-xs text-gray-500 mt-1">{suggestion.pages} pages</p>
                              </div>
                            </div>

                            <p className="text-sm text-gray-700">{suggestion.description}</p>

                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-sm font-semibold text-purple-900 mb-1">Why this book:</p>
                              <p className="text-sm text-gray-700">{suggestion.reason}</p>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {suggestion.themes?.map((theme, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {theme}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={async () => {
                                  const customBook = {
                                    ...suggestion,
                                    id: `custom-${Date.now()}-${idx}`,
                                    color: 'from-purple-400 to-pink-500',
                                    is_custom: true
                                  };
                                  
                                  try {
                                    await addCustomBookMutation.mutateAsync(customBook);
                                    handleCreatePlan(customBook);
                                    setShowAISuggestions(false);
                                  } catch (error) {
                                    toast.error('Failed to add book');
                                  }
                                }}
                                disabled={addCustomBookMutation.isPending}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                              >
                                {addCustomBookMutation.isPending ? (
                                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
                                ) : (
                                  <><Plus className="w-4 h-4 mr-2" /> Create Plan</>
                                )}
                              </Button>
                              {suggestion.amazonUrl && (
                                <Button
                                  onClick={() => {
                                    toast.success('📚 Redirecting to Amazon...');
                                    setTimeout(() => {
                                      window.open(`${suggestion.amazonUrl}?tag=${AMAZON_AFFILIATE_ID}`, '_blank', 'noopener,noreferrer');
                                    }, 500);
                                  }}
                                  variant="outline"
                                  className="border-2 border-green-500 text-green-700 hover:bg-green-50"
                                >
                                  <ShoppingBag className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Achievement Modal */}
        <AnimatePresence>
          {showShareModal && completedBookToShare && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowShareModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg"
              >
                <Card className="border-4 border-emerald-300 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 overflow-hidden">
                  <motion.div
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-orange-200 to-pink-200 opacity-50" />
                    <CardHeader className="relative text-center pb-6">
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 10, 0],
                          scale: [1, 1.1, 1, 1.1, 1]
                        }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                        className="text-6xl mb-2"
                      >
                        🎉
                      </motion.div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                        Congratulations!
                      </CardTitle>
                      <p className="text-gray-700 text-lg">You've completed a spiritual journey!</p>
                    </CardHeader>
                  </motion.div>

                  <CardContent className="space-y-6">
                    {/* Achievement Card */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-xl p-6 border-4 border-emerald-200 shadow-2xl"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="text-5xl"
                        >
                          {completedBookToShare.book.emoji}
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="font-bold text-2xl text-gray-900 mb-1">
                            {completedBookToShare.book.title}
                          </h3>
                          <p className="text-gray-600">by {completedBookToShare.book.author}</p>
                          <Badge className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                            <Award className="w-3 h-3 mr-1" />
                            {completedBookToShare.book.pages} pages completed!
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg p-4 text-center">
                        <p className="text-sm text-emerald-800 font-semibold">
                          "Every book is a journey. You've reached your destination! ✨"
                        </p>
                      </div>
                    </motion.div>

                    {/* Share Options */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-700 text-center">
                        Share your achievement with the world! 🌍
                      </p>

                      {/* Platform Share */}
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={shareOnPlatform}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-14 text-base"
                        >
                          <Heart className="w-5 h-5 mr-2" />
                          Share on Helper33 Community
                        </Button>
                      </motion.div>

                      {/* Social Media Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => shareToSocialMedia('twitter')}
                            variant="outline"
                            className="w-full border-2 border-blue-400 text-blue-600 hover:bg-blue-50"
                          >
                            <Twitter className="w-4 h-4 mr-2" />
                            Twitter
                          </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => shareToSocialMedia('facebook')}
                            variant="outline"
                            className="w-full border-2 border-blue-600 text-blue-700 hover:bg-blue-50"
                          >
                            <Facebook className="w-4 h-4 mr-2" />
                            Facebook
                          </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => shareToSocialMedia('linkedin')}
                            variant="outline"
                            className="w-full border-2 border-blue-700 text-blue-800 hover:bg-blue-50"
                          >
                            <Linkedin className="w-4 h-4 mr-2" />
                            LinkedIn
                          </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => shareToSocialMedia('whatsapp')}
                            variant="outline"
                            className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>
                        </motion.div>
                      </div>

                      <Button
                        onClick={() => setShowShareModal(false)}
                        variant="ghost"
                        className="w-full"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {planToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setPlanToDelete(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <Card className="border-2 border-red-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <X className="w-5 h-5" />
                      Delete Reading Plan?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">
                      Are you sure you want to delete this reading plan? This action cannot be undone.
                    </p>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <p className="text-sm font-semibold text-red-900">
                        {allBooks.find(b => b.id === planToDelete.book_id)?.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Progress: {planToDelete.progress}% • {planToDelete.current_page} pages read
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          deletePlanMutation.mutate(planToDelete.id);
                          setPlanToDelete(null);
                        }}
                        disabled={deletePlanMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
                      >
                        {deletePlanMutation.isPending ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
                        ) : (
                          <><X className="w-4 h-4 mr-2" /> Yes, Delete</>
                        )}
                      </Button>
                      <Button
                        onClick={() => setPlanToDelete(null)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Plan Modal */}
        <AnimatePresence>
          {showPlanModal && selectedBook && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowPlanModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{selectedBook.emoji}</span>
                      Create Reading Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CreatePlanForm
                      book={selectedBook}
                      onSubmit={(data) => createPlanMutation.mutate(data)}
                      onCancel={() => setShowPlanModal(false)}
                      isLoading={createPlanMutation.isPending}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function AddCustomBookForm({ onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    pages: 200,
    themes: '',
    emoji: '📖',
    color: 'from-purple-400 to-pink-500'
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.author) {
      toast.error('Please fill in title and author');
      return;
    }
    
    const bookData = {
      ...formData,
      themes: formData.themes.split(',').map(t => t.trim()).filter(Boolean)
    };
    onSubmit(bookData);
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Book title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="border-2 border-purple-200 focus:border-purple-400"
      />
      
      <Input
        placeholder="Author name"
        value={formData.author}
        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        className="border-2 border-purple-200 focus:border-purple-400"
      />

      <Textarea
        placeholder="Brief description..."
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="border-2 border-purple-200 focus:border-purple-400"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Total pages</label>
          <Input
            type="number"
            min="1"
            value={formData.pages}
            onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 1 })}
            className="border-2 border-purple-200 focus:border-purple-400"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Emoji</label>
          <Input
            placeholder="📖"
            value={formData.emoji}
            onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
            className="border-2 border-purple-200 focus:border-purple-400"
          />
        </div>
      </div>

      <Input
        placeholder="Themes (comma-separated: wisdom, peace, etc.)"
        value={formData.themes}
        onChange={(e) => setFormData({ ...formData, themes: e.target.value })}
        className="border-2 border-purple-200 focus:border-purple-400"
      />

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
          ) : (
            <><Plus className="w-4 h-4 mr-2" /> Add Book</>
          )}
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function AddBookmarkForm({ plan, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    book_id: plan.book_id,
    plan_id: plan.id,
    quote: '',
    page_number: plan.current_page,
    reflection: ''
  });

  const handleSubmit = () => {
    if (!formData.quote.trim()) {
      toast.error('Please enter a quote or verse');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Enter the quote or verse that resonated with you..."
        value={formData.quote}
        onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
        className="min-h-[100px] border-2 border-amber-200 focus:border-amber-400"
      />

      <div>
        <label className="text-sm text-gray-600 mb-1 block">Page number</label>
        <Input
          type="number"
          min="1"
          value={formData.page_number}
          onChange={(e) => setFormData({ ...formData, page_number: parseInt(e.target.value) || 1 })}
          className="border-2 border-amber-200 focus:border-amber-400"
        />
      </div>

      <Textarea
        placeholder="Your personal reflection (optional)..."
        value={formData.reflection}
        onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
        className="min-h-[80px] border-2 border-amber-200 focus:border-amber-400"
      />

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Star className="w-4 h-4 mr-2" /> Save Quote</>
          )}
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function CreatePlanForm({ book, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    book_id: book.id,
    pages_per_day: Math.ceil(book.pages / 30),
    reminder_enabled: true,
    reminder_time: '09:00'
  });

  const estimatedDays = Math.ceil(book.pages / formData.pages_per_day);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pages per day
        </label>
        <Input
          type="number"
          min="1"
          max={book.pages}
          value={formData.pages_per_day}
          onChange={(e) => setFormData({ ...formData, pages_per_day: parseInt(e.target.value) || 1 })}
          className="border-2 border-purple-200 focus:border-purple-400"
        />
        <p className="text-xs text-gray-500 mt-1">
          📖 You'll finish in approximately {estimatedDays} days
        </p>
      </div>

      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">Daily reminder</span>
        </div>
        <input
          type="checkbox"
          checked={formData.reminder_enabled}
          onChange={(e) => setFormData({ ...formData, reminder_enabled: e.target.checked })}
          className="w-5 h-5 rounded text-purple-600"
        />
      </div>

      {formData.reminder_enabled && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reminder time
          </label>
          <Input
            type="time"
            value={formData.reminder_time}
            onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
            className="border-2 border-purple-200 focus:border-purple-400"
          />
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button
          onClick={() => onSubmit(formData)}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Create Plan
            </>
          )}
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}
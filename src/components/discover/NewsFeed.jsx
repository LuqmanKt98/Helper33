
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { FavoriteItem } from '@/entities/FavoriteItem';
import { NewsSettings } from '@/entities/NewsSettings';
import { User } from '@/entities/User';
import { Loader2, Newspaper, Bookmark, Settings, MapPin, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import AddToFavoritesModal from './AddToFavoritesModal';
import NewsPersonalizationModal from './NewsPersonalizationModal';

const categoryColors = {
  Technology: 'bg-blue-100 text-blue-800 border-blue-200',
  Health: 'bg-green-100 text-green-800 border-green-200',
  Wellness: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Business: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Science: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Lifestyle: 'bg-rose-100 text-rose-800 border-rose-200',
  Community: 'bg-purple-100 text-purple-800 border-purple-200',
  World: 'bg-slate-100 text-slate-800 border-slate-200',
  Entertainment: 'bg-pink-100 text-pink-800 border-pink-200',
  Sports: 'bg-orange-100 text-orange-800 border-orange-200',
  Local: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  General: 'bg-gray-100 text-gray-800 border-gray-200',
};

const categoryIcons = {
  Technology: '💻',
  Health: '🏥',
  Wellness: '🧘',
  Business: '💼',
  Science: '🔬',
  Lifestyle: '✨',
  Community: '👥',
  World: '🌍',
  Entertainment: '🎬',
  Sports: '⚽',
  Local: '📍',
  General: '📰'
};

export default function NewsFeed() {
  const [articles, setArticles] = useState([]); // Replaced newsItems
  const [categorizedNews, setCategorizedNews] = useState({});
  const [isLoading, setIsLoading] = useState(true); // Replaced loading
  const [error, setError] = useState(null); // Added error state
  const [user, setUser] = useState(null);
  const [newsSettings, setNewsSettings] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All'); // Replaced activeCategory; initial value will be overwritten by useEffect

  const fetchFavorites = async (currentUser) => {
    if (currentUser) {
        const userFavorites = await FavoriteItem.filter({ item_type: "news", created_by: currentUser.email });
        setFavorites(userFavorites);
    } else {
        setFavorites([]);
    }
  }

  // Function to fetch or create news personalization settings
  const fetchNewsSettings = async (currentUser) => {
    if (currentUser) {
        let settings = await NewsSettings.filter({ created_by: currentUser.email });
        if (settings.length > 0) {
            setNewsSettings(settings[0]);
        } else {
            // Create default settings if none exist
            const defaultSettings = await NewsSettings.create({
                preferred_categories: ["Health", "Wellness", "Technology", "Lifestyle"],
                location: "", // User's actual location for local news
                interests: [],
                life_goals: [],
                news_frequency: "medium", // 'low', 'medium', 'high'
                include_trending: true,
                include_local: true,
                created_by: currentUser.email
            });
            setNewsSettings(defaultSettings);
        }
    } else {
      // Default settings for guests, no database interaction
      setNewsSettings({
        preferred_categories: ["Health", "Wellness", "Technology", "Lifestyle"],
        location: "",
        interests: [],
        life_goals: [],
        news_frequency: "medium",
        include_trending: true,
        include_local: false, // Guests might not get local news
      });
    }
  };

  const getEnhancedFallbackNews = (settings) => {
    const allNews = [
      {
        id: 'news-1',
        title: 'Breakthrough in Mental Health: New Therapy Approaches Show Promise',
        summary: 'Recent clinical trials demonstrate significant improvements in treatment outcomes using innovative therapeutic techniques combining traditional methods with modern technology.',
        source: 'Health Science Today',
        link: 'https://example.com/health-breakthrough',
        image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
        category: 'Health',
        is_trending: true,
        is_local: false
      },
      {
        id: 'news-2',
        title: 'Sustainable Technology Innovations Transform Daily Life',
        summary: 'New eco-friendly technologies are making sustainable living more accessible and affordable for families worldwide, reducing carbon footprint significantly.',
        source: 'Tech Innovation Weekly',
        link: 'https://example.com/sustainable-tech',
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
        category: 'Technology',
        is_trending: true,
        is_local: false
      },
      {
        id: 'news-3',
        title: 'Community Wellness Programs See Record Participation',
        summary: 'Local wellness initiatives are bringing communities together while promoting healthier lifestyles and mental well-being through group activities.',
        source: 'Community Health Report',
        link: 'https://example.com/community-wellness',
        image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
        category: 'Wellness',
        is_trending: true,
        is_local: true
      },
      {
        id: 'news-4',
        title: 'Work-Life Balance: New Research on Remote Work Benefits',
        summary: 'Studies reveal how flexible work arrangements are improving employee satisfaction and productivity across industries while reducing stress.',
        source: 'Lifestyle Business Journal',
        link: 'https://example.com/work-life-balance',
        image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
        category: 'Lifestyle',
        is_trending: true,
        is_local: false
      },
      {
        id: 'news-5',
        title: 'Mindfulness Apps Gain Popularity Among Young Professionals',
        summary: 'Digital wellness tools are helping millennials and Gen Z manage stress and anxiety through guided meditation and breathing exercises.',
        source: 'Digital Wellness Report',
        link: 'https://example.com/mindfulness-apps',
        image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
        category: 'Wellness',
        is_trending: true,
        is_local: false
      },
      {
        id: 'news-6',
        title: 'AI-Powered Health Monitoring Devices Hit Consumer Market',
        summary: 'New wearable technology uses artificial intelligence to predict health issues before they become serious, revolutionizing preventive care.',
        source: 'Tech Health News',
        link: 'https://example.com/ai-health',
        image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
        category: 'Technology',
        is_trending: false,
        is_local: false
      },
      {
        id: 'news-7',
        title: 'Plant-Based Diet Benefits Extend Beyond Physical Health',
        summary: 'New research shows that plant-based diets not only improve physical health but also enhance mental clarity and emotional well-being.',
        source: 'Nutrition Science Weekly',
        link: 'https://example.com/plant-based',
        image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        category: 'Health',
        is_trending: false,
        is_local: false
      },
      {
        id: 'news-8',
        title: 'Local Community Centers Offer Free Fitness Classes',
        summary: 'Cities nationwide are expanding free fitness programs to promote community health and combat sedentary lifestyles.',
        source: 'Community Fitness Today',
        link: 'https://example.com/community-fitness',
        image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        category: 'Wellness',
        is_trending: false,
        is_local: true
      },
      {
        id: 'news-9',
        title: 'Sleep Science Reveals Optimal Bedroom Conditions',
        summary: 'Scientists identify specific temperature, lighting, and sound conditions that dramatically improve sleep quality and duration.',
        source: 'Sleep Research Institute',
        link: 'https://example.com/sleep-science',
        image_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400',
        category: 'Health',
        is_trending: false,
        is_local: false
      },
      {
        id: 'news-10',
        title: 'Minimalist Living Trends Reshape Home Design',
        summary: 'The minimalist movement continues to influence home design, with families finding peace and clarity through simplified living spaces.',
        source: 'Modern Living Magazine',
        link: 'https://example.com/minimalist-living',
        image_url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=400',
        category: 'Lifestyle',
        is_trending: false,
        is_local: false
      },
      {
        id: 'news-11',
        title: 'Breakthrough in Renewable Energy Storage Solutions',
        summary: 'New battery technology promises to solve the intermittency problem of solar and wind power, making clean energy more viable.',
        source: 'Clean Energy News',
        link: 'https://example.com/renewable-storage',
        image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
        category: 'Technology',
        is_trending: false,
        is_local: false
      },
      {
        id: 'news-12',
        title: 'Urban Gardening Movements Transform City Landscapes',
        summary: 'Community gardens and rooftop farms are bringing fresh produce and green spaces to urban environments while building community bonds.',
        source: 'Urban Agriculture Today',
        link: 'https://example.com/urban-gardening',
        image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        category: 'Lifestyle',
        is_trending: false,
        is_local: true
      },
      {
        id: 'news-13',
        title: 'Exercise Prescriptions Gain Traction in Medical Community',
        summary: 'Doctors increasingly prescribe specific exercise routines alongside medication, recognizing physical activity as powerful medicine.',
        source: 'Medical Practice News',
        link: 'https://example.com/exercise-prescriptions',
        image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400',
        category: 'Health',
        is_trending: false,
        is_local: false
      },
      {
        id: 'news-14',
        title: 'Digital Detox Retreats See Surge in Bookings',
        summary: 'More professionals are seeking technology-free vacations to reconnect with nature and reduce digital overwhelm.',
        source: 'Travel Wellness Report',
        link: 'https://example.com/digital-detox',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        category: 'Wellness',
        is_trending: false,
        is_local: false
      },
      {
        id: 'news-15',
        title: 'Smart Home Technology Adapts to Family Routines',
        summary: 'AI-powered home systems learn family patterns to optimize energy use, security, and comfort automatically.',
        source: 'Smart Home Review',
        link: 'https://example.com/smart-homes',
        image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400',
        category: 'Technology',
        is_trending: false,
        is_local: false
      }
    ];

    // Filter based on user preferences
    let filteredNews = allNews;
    
    if (settings?.preferred_categories?.length > 0) {
      filteredNews = filteredNews.filter(item => 
        settings.preferred_categories.includes(item.category) ||
        item.is_trending // Always include trending if setting allows, regardless of category preference
      );
    }

    if (!settings?.include_local) {
      filteredNews = filteredNews.filter(item => !item.is_local);
    }

    if (!settings?.include_trending) {
      filteredNews = filteredNews.filter(item => !item.is_trending);
    }

    return filteredNews;
  };

  const fetchPersonalizedNews = async (settings) => {
    const categoriesPrompt = settings?.preferred_categories?.length > 0 
        ? settings.preferred_categories.join(', ') 
        : "Health, Wellness, Technology, Lifestyle";
    
    const locationPrompt = settings?.location && settings.include_local 
        ? `Include local news from ${settings.location}.` 
        : "";
    
    const interestsPrompt = settings?.interests?.length > 0 
        ? `Focus on these specific interests: ${settings.interests.join(', ')}.` 
        : "";
    
    const goalsPrompt = settings?.life_goals?.length > 0 
        ? `Relate news to these life goals: ${settings.life_goals.join(', ')}.` 
        : "";

    const newsCount = settings?.news_frequency === 'high' ? 30 : settings?.news_frequency === 'low' ? 15 : 25;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Get ${newsCount} news articles organized by categories. ${settings?.include_trending ? 'Start with the TOP 5 trending stories of today,' : ''} then provide articles in these categories: ${categoriesPrompt}.
        
        ${locationPrompt}
        ${interestsPrompt}
        ${goalsPrompt}
        
        Focus on constructive, informative, and uplifting content that helps people grow and stay informed. Ensure good distribution across the requested categories.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            articles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { 
                    type: "string", 
                    description: "A unique identifier for the article (e.g., a slugified title)" 
                  },
                  title: { type: "string" },
                  summary: { type: "string" },
                  source: { type: "string" },
                  link: { type: "string" },
                  image_url: { type: "string" },
                  category: { type: "string" },
                  is_trending: { type: "boolean" },
                  is_local: { type: "boolean" }
                },
                // Removed 'image_url' from required fields to allow the LLM to sometimes omit it
                // and avoid schema validation errors, as the UI handles its absence gracefully.
                required: ["id", "title", "summary", "source", "link", "category"]
              }
            }
          },
          required: ["articles"]
        }
      });
      
      if (response && response.articles) {
        return response.articles;
      }
      return []; // Return empty array if articles are not in the response
    } catch (error) {
      console.error('Failed to fetch personalized news:', error);
      throw error; // Propagate error for proper handling in useEffect
    }
  };

  // Initial data fetch effect (user and settings)
  useEffect(() => {
    async function initialFetch() {
      setIsLoading(true); // Changed from setLoading
      const currentUser = await User.me().catch(() => null);
      setUser(currentUser);
      await fetchNewsSettings(currentUser); // Fetch/create settings
      await fetchFavorites(currentUser);
      // setIsLoading(false); // Original code had this commented out, keeping it so.
    }
    initialFetch();
  }, []);

  useEffect(() => {
    const fetchAndOrganizeNews = async () => {
        if (!newsSettings) return;

        setIsLoading(true); // Changed from setLoading
        let fetchedArticles = []; 
        try {
            fetchedArticles = await fetchPersonalizedNews(newsSettings);
            if (!fetchedArticles || fetchedArticles.length === 0) {
                console.log("LLM returned no articles, using fallback.");
                fetchedArticles = getEnhancedFallbackNews(newsSettings);
            }
            setError(null); // Clear any previous errors on successful fetch
        } catch (err) {
            console.error("Error fetching personalized news, using fallback.", err);
            fetchedArticles = getEnhancedFallbackNews(newsSettings);
            setError("Failed to load personalized news. Displaying fallback content. Please check your network or try again later."); // Set error
        }

        setArticles(fetchedArticles); // Changed from setNewsItems
      
        const organized = fetchedArticles.reduce((acc, article) => {
            // Ensure trending articles are correctly assigned to the 'trending' pseudo-category
            if (article.is_trending && newsSettings?.include_trending) {
              if (!acc.trending) acc.trending = [];
              acc.trending.push(article);
            }
            // Ensure local articles are correctly assigned to the 'local' pseudo-category
            if (article.is_local && newsSettings?.include_local) {
              if (!acc.local) acc.local = [];
              acc.local.push(article);
            }
            
            // Group by primary category
            const category = article.category;
            if (!acc[category]) acc[category] = [];
            acc[category].push(article);
            
            return acc;
        }, {});

        setCategorizedNews(organized);
      
        // Set initial active filter (previously activeCategory) based on available data
        if (newsSettings?.include_trending && organized.trending?.length > 0) {
            setActiveFilter('trending'); // Changed from setActiveCategory
        } else {
            const firstAvailableCategory = Object.keys(organized).find(cat => 
            cat !== 'trending' && cat !== 'local' && organized[cat]?.length > 0
            );
            if (firstAvailableCategory) {
            setActiveFilter(firstAvailableCategory); // Changed from setActiveCategory
            } else if (newsSettings?.include_local && organized.local?.length > 0) {
            setActiveFilter('local'); // Changed from setActiveCategory
            } else if (Object.keys(organized).length > 0) {
            setActiveFilter(Object.keys(organized)[0]); // Changed from setActiveCategory
            } else {
              // If no categories have news, set an empty string or a default tab that exists, if any.
              // For now, setting to empty to indicate no valid tab is selected.
              setActiveFilter(''); 
            }
        }
        setIsLoading(false); // Changed from setLoading
    }
    
    if (newsSettings) {
        fetchAndOrganizeNews();
    }
  }, [newsSettings]);

  const handleSettingsUpdate = async (updatedFields) => {
    if (user && newsSettings) {
      try {
        const updatedSettings = await NewsSettings.update(newsSettings.id, { ...newsSettings, ...updatedFields });
        setNewsSettings(updatedSettings); // Trigger re-fetch of news
        setShowPersonalizationModal(false);
        setError(null); // Clear errors on successful update
      } catch (error) {
        console.error('Failed to update news settings:', error);
        alert('Failed to save personalization settings. Please try again.');
        setError('Failed to save personalization settings. Please try again.'); // Set error
      }
    } else if (!user) {
      // For guests, just update the local state for immediate feedback
      setNewsSettings(prev => ({ ...prev, ...updatedFields }));
      setShowPersonalizationModal(false);
    }
  };

  const openFavoritesModal = (item) => {
    if (!user) {
        alert("Please log in to save favorites.");
        return;
    }
    setSelectedItem(item);
    setShowFavoritesModal(true);
  };
  
  const handleSaveFavorite = async (item, itemType, collectionId) => {
    const existingFavorite = favorites.find(f => f.item_id === item.id);
    
    try {
        if (existingFavorite) {
            await FavoriteItem.update(existingFavorite.id, { collection_id: collectionId });
        } else {
            await FavoriteItem.create({
                item_id: item.id,
                item_type: itemType,
                item_title: item.title,
                created_by: user.email,
                collection_id: collectionId,
            });
        }
        await fetchFavorites(user);
        setShowFavoritesModal(false);
        setError(null); // Clear errors on successful operation
    } catch (error) {
        console.error('Failed to save favorite:', error);
        alert('Failed to save favorite. Please try again.');
        setError('Failed to save favorite. Please try again.'); // Set error
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
        await FavoriteItem.delete(favoriteId);
        await fetchFavorites(user);
        setShowFavoritesModal(false);
        setError(null); // Clear errors on successful operation
    } catch (error) {
        console.error('Failed to remove favorite:', error);
        alert('Failed to remove favorite. Please try again.');
        setError('Failed to remove favorite. Please try again.'); // Set error
    }
  };
  
  const favoriteIds = useMemo(() => new Set(favorites.map(f => f.item_id)), [favorites]);

  const renderNewsCard = (item, index, isTrendingCard = false) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`p-4 flex flex-col md:flex-row gap-4 items-start hover:shadow-lg transition-all duration-300 ${
        isTrendingCard ? 'border-l-4 border-red-500 bg-gradient-to-r from-red-50/50 to-orange-50/50' : ''
      }`}>
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
            className={`w-full md:w-48 h-40 md:h-auto object-cover rounded-lg flex-shrink-0 ${
              isTrendingCard ? 'ring-2 ring-red-200' : ''
            }`}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {item.is_trending && (
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    🔥 TRENDING
                  </Badge>
                )}
                {item.is_local && (
                  <Badge className={categoryColors.Local}>
                    📍 LOCAL
                  </Badge>
                )}
                <Badge className={categoryColors[item.category] || categoryColors.General}>
                  {categoryIcons[item.category] || categoryIcons.General} {item.category}
                </Badge>
                <span className="text-xs text-gray-500 font-medium">{item.source}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
            </div>
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openFavoritesModal(item)}
                className="text-gray-400 hover:text-orange-500"
                title={favoriteIds.has(item.id) ? "Manage favorite" : "Save for later"}
              >
                <Bookmark className={`w-5 h-5 transition-all ${favoriteIds.has(item.id) ? 'fill-orange-500 text-orange-500' : ''}`} />
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">{item.summary}</p>
          <Button 
            asChild 
            size="sm" 
            className={isTrendingCard ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white" : ""}
            variant={isTrendingCard ? "default" : "outline"}
          >
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              {isTrendingCard ? "Read Trending Story" : "Read More"}
            </a>
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  if (isLoading) { // Changed from loading
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Filter out any categories that don't have news items, or if include is false
  const availableCategories = Object.keys(categorizedNews).filter(cat => 
    (cat === 'trending' && newsSettings?.include_trending && categorizedNews.trending?.length > 0) ||
    (cat === 'local' && newsSettings?.include_local && categorizedNews.local?.length > 0) ||
    (newsSettings?.preferred_categories?.includes(cat) && categorizedNews[cat]?.length > 0)
  );

  if (articles.length === 0 && !isLoading) { // Changed from newsItems.length and !loading
    return (
      <div className="text-center py-12 text-gray-500">
        <Newspaper className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>No news updates available at the moment.</p>
        <p className="text-sm">Please check back later or adjust your personalization settings.</p>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>} {/* Display error if any */}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personalization Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {newsSettings?.location && newsSettings.include_local && (
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
              <MapPin className="w-4 h-4 mr-1" />
              {newsSettings.location}
            </Badge>
          )}
          {newsSettings?.interests?.length > 0 && (
            <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
              <Heart className="w-4 h-4 mr-1" />
              {newsSettings.interests.length} interests
            </Badge>
          )}
          {newsSettings?.preferred_categories?.length > 0 && (
            <Badge className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
              <Newspaper className="w-4 h-4 mr-1" />
              {newsSettings.preferred_categories.length} categories
            </Badge>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowPersonalizationModal(true)}
          className="bg-white/50 hover:bg-white/80"
        >
          <Settings className="w-4 h-4 mr-2" />
          Personalize News
        </Button>
      </div>
      {error && ( // Display general error message at the top
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Category Tabs */}
      {availableCategories.length > 0 && (
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full"> {/* Changed from activeCategory */}
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-6 overflow-x-auto justify-start">
            {newsSettings?.include_trending && categorizedNews.trending?.length > 0 && (
              <TabsTrigger value="trending" className="text-xs flex items-center gap-1">
                🔥 Trending
              </TabsTrigger>
            )}
            {newsSettings?.include_local && categorizedNews.local?.length > 0 && (
              <TabsTrigger value="local" className="text-xs flex items-center gap-1">
                📍 Local
              </TabsTrigger>
            )}
            {newsSettings?.preferred_categories?.filter(cat => categorizedNews[cat]?.length > 0).map(category => (
              <TabsTrigger key={category} value={category} className="text-xs flex items-center gap-1">
                {categoryIcons[category]} {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Trending Tab Content */}
          {newsSettings?.include_trending && categorizedNews.trending?.length > 0 && (
            <TabsContent value="trending">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span className="text-sm font-bold">TOP TRENDING TODAY</span>
                </div>
              </div>
              <div className="space-y-4">
                {categorizedNews.trending.map((item, index) => renderNewsCard(item, index, true))}
              </div>
            </TabsContent>
          )}

          {/* Local Tab Content */}
          {newsSettings?.include_local && categorizedNews.local?.length > 0 && (
            <TabsContent value="local">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full shadow-lg">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-bold">LOCAL NEWS</span>
                </div>
              </div>
              <div className="space-y-4">
                {categorizedNews.local.map((item, index) => renderNewsCard(item, index))}
              </div>
            </TabsContent>
          )}

          {/* Personalized Category Tabs Content */}
          {newsSettings?.preferred_categories?.filter(cat => categorizedNews[cat]?.length > 0).map(category => (
            <TabsContent key={category} value={category}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${
                  categoryColors[category]?.replace('bg-', 'bg-').replace('-100', '-500').replace('text-', 'text-white') ||
                  'bg-gray-500 text-white'
                }`}>
                  <span className="text-lg">{categoryIcons[category] || categoryIcons.General}</span>
                  <span className="text-sm font-bold">{category.toUpperCase()}</span>
                </div>
              </div>
              <div className="space-y-4">
                {categorizedNews[category].map((item, index) => renderNewsCard(item, index))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Modals */}
      {selectedItem && (
        <AddToFavoritesModal
          isOpen={showFavoritesModal}
          onClose={() => setShowFavoritesModal(false)}
          item={selectedItem}
          itemType="news"
          onSave={handleSaveFavorite}
          onRemove={handleRemoveFavorite}
          existingFavorite={favorites.find(f => f.item_id === selectedItem.id)}
        />
      )}

      {newsSettings && (
        <NewsPersonalizationModal
          isOpen={showPersonalizationModal}
          onClose={() => setShowPersonalizationModal(false)}
          currentSettings={newsSettings}
          onSave={handleSettingsUpdate}
        />
      )}
    </div>
  );
}

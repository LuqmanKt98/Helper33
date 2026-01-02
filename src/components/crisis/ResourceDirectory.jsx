
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  MessageSquare,
  Globe,
  Mail,
  Clock,
  MapPin,
  DollarSign,
  Star,
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  CheckCircle,
  Heart,
  Shield,
  Users,
  Home,
  Scale,
  Pill,
  Brain,
  Baby,
  AlertCircle,
  Languages,
  Accessibility,
  ChevronDown,
  ChevronUp,
  Pin,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import DirectoryChat from './DirectoryChat';

const CATEGORY_CONFIG = {
  immediate_crisis: {
    icon: AlertCircle,
    color: 'from-red-500 to-rose-500',
    label: 'Immediate Crisis',
    emoji: '🚨'
  },
  long_term_therapy: {
    icon: Brain,
    color: 'from-purple-500 to-indigo-500',
    label: 'Long-term Therapy',
    emoji: '🧠'
  },
  addiction_support: {
    icon: Shield,
    color: 'from-blue-500 to-cyan-500',
    label: 'Addiction Support',
    emoji: '🛡️'
  },
  domestic_violence: {
    icon: Home,
    color: 'from-orange-500 to-amber-500',
    label: 'Domestic Violence',
    emoji: '🏠'
  },
  lgbtq_support: {
    icon: Heart,
    color: 'from-pink-500 to-purple-500',
    label: 'LGBTQ+ Support',
    emoji: '🏳️‍🌈'
  },
  veterans_support: {
    icon: Star,
    color: 'from-blue-600 to-indigo-600',
    label: 'Veterans Support',
    emoji: '⭐'
  },
  youth_support: {
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    label: 'Youth Support',
    emoji: '👶'
  },
  grief_bereavement: {
    icon: Heart,
    color: 'from-rose-500 to-pink-500',
    label: 'Grief & Bereavement',
    emoji: '💔'
  },
  eating_disorders: {
    icon: Pill,
    color: 'from-teal-500 to-cyan-500',
    label: 'Eating Disorders',
    emoji: '🍽️'
  },
  postpartum_support: {
    icon: Baby,
    color: 'from-pink-400 to-rose-400',
    label: 'Postpartum Support',
    emoji: '👶'
  },
  trauma_ptsd: {
    icon: Shield,
    color: 'from-indigo-500 to-purple-500',
    label: 'Trauma & PTSD',
    emoji: '🧘'
  },
  financial_assistance: {
    icon: DollarSign,
    color: 'from-green-600 to-emerald-600',
    label: 'Financial Aid',
    emoji: '💰'
  },
  legal_aid: {
    icon: Scale,
    color: 'from-blue-700 to-indigo-700',
    label: 'Legal Aid',
    emoji: '⚖️'
  },
  housing_shelter: {
    icon: Home,
    color: 'from-amber-600 to-orange-600',
    label: 'Housing & Shelter',
    emoji: '🏘️'
  },
  general_mental_health: {
    icon: Brain,
    color: 'from-purple-600 to-pink-600',
    label: 'Mental Health',
    emoji: '💙'
  }
};

export default function ResourceDirectory({ userCountry, userLanguage }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedResource, setExpandedResource] = useState(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [creatingResources, setCreatingResources] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: allResources = [], isLoading } = useQuery({
    queryKey: ['crisisResources'],
    queryFn: async () => {
      const resources = await base44.entities.CrisisResource.list('-is_featured', 200);
      console.log('🔍 Loaded all resources:', resources.length, resources);
      return resources;
    },
    staleTime: 5 * 60 * 1000
  });

  const { data: savedResources = [], isLoading: isSavedLoading } = useQuery({
    queryKey: ['savedCrisisResources'],
    queryFn: async () => {
      const saved = await base44.entities.SavedCrisisResource.list('-created_date');
      console.log('📚 Loaded saved resources:', saved.length, saved);
      return saved;
    },
    refetchInterval: 2000,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });

  // Debug logging
  useEffect(() => {
    console.log('📊 ResourceDirectory State:', {
      totalResources: allResources.length,
      savedResources: savedResources.length,
      savedResourceIds: savedResources.map(sr => ({ id: sr.id, resource_id: sr.resource_id, name: sr.resource_name })),
      isLoading,
      isSavedLoading
    });
  }, [allResources, savedResources, isLoading, isSavedLoading]);

  // Admin: Create Sample Resources
  const createSampleResources = async () => {
    if (user?.role !== 'admin') {
      toast.error('Only admins can add resources');
      return;
    }

    setCreatingResources(true);
    const sampleResources = [
      {
        resource_name: "988 Suicide & Crisis Lifeline",
        category: "immediate_crisis",
        description: "24/7 free and confidential support for people in distress, prevention and crisis resources",
        phone_number: "988",
        text_number: "988",
        website_url: "https://988lifeline.org",
        chat_url: "https://988lifeline.org/chat",
        availability: "24_7",
        country: "United States",
        is_national: true,
        languages_supported: ["en", "es"],
        cost: "free",
        is_verified: true,
        is_featured: true,
        tags: ["suicide", "crisis", "mental health", "emergency"]
      },
      {
        resource_name: "Crisis Text Line",
        category: "immediate_crisis",
        description: "Free 24/7 text support. Text HOME to 741741",
        text_number: "741741",
        website_url: "https://www.crisistextline.org",
        availability: "24_7",
        country: "United States",
        is_national: true,
        languages_supported: ["en"],
        cost: "free",
        specialized_services: ["Text counseling", "Crisis intervention"],
        is_verified: true,
        is_featured: true,
        tags: ["crisis", "text", "youth"]
      },
      {
        resource_name: "National Domestic Violence Hotline",
        category: "domestic_violence",
        description: "Confidential support for anyone experiencing domestic violence",
        phone_number: "1-800-799-7233",
        text_number: "START to 88788",
        website_url: "https://www.thehotline.org",
        chat_url: "https://www.thehotline.org/chat",
        availability: "24_7",
        country: "United States",
        is_national: true,
        languages_supported: ["en", "es"],
        cost: "free",
        is_verified: true,
        is_featured: true,
        tags: ["domestic violence", "abuse", "safety"]
      },
      {
        resource_name: "Trevor Project Lifeline",
        category: "lgbtq_support",
        description: "24/7 suicide prevention for LGBTQ young people",
        phone_number: "1-866-488-7386",
        text_number: "START to 678-678",
        website_url: "https://www.thetrevorproject.org",
        chat_url: "https://www.thetrevorproject.org/get-help",
        availability: "24_7",
        country: "United States",
        is_national: true,
        cost: "free",
        target_audience: ["lgbtq", "youth"],
        is_verified: true,
        is_featured: true,
        tags: ["lgbtq", "youth", "crisis"]
      },
      {
        resource_name: "SAMHSA National Helpline",
        category: "addiction_support",
        description: "Treatment referral for substance use and mental health disorders",
        phone_number: "1-800-662-4357",
        website_url: "https://www.samhsa.gov/find-help/national-helpline",
        availability: "24_7",
        country: "United States",
        is_national: true,
        languages_supported: ["en", "es"],
        cost: "free",
        is_verified: true,
        tags: ["addiction", "substance abuse", "referrals"]
      }
    ];

    try {
      for (const resource of sampleResources) {
        await base44.entities.CrisisResource.create(resource);
      }
      await queryClient.invalidateQueries(['crisisResources']);
      await queryClient.refetchQueries(['crisisResources']);
      toast.success(`✅ Added ${sampleResources.length} sample resources!`);
      setCreatingResources(false);
    } catch (error) {
      console.error('Error creating resources:', error);
      toast.error('Failed to create resources');
      setCreatingResources(false);
    }
  };

  const saveResourceMutation = useMutation({
    mutationFn: async (resource) => {
      console.log('💾 Attempting to save resource:', {
        id: resource.id,
        name: resource.resource_name,
        category: resource.category
      });
      
      const newSaved = await base44.entities.SavedCrisisResource.create({
        resource_id: resource.id,
        resource_name: resource.resource_name,
        resource_category: resource.category,
        quick_access: false,
        contact_attempts: 0,
        notes: ''
      });
      
      console.log('✅ Resource created in DB:', newSaved);
      return newSaved;
    },
    onSuccess: async (data) => {
      console.log('✅ Save mutation success, refetching all data...');
      await queryClient.invalidateQueries(['savedCrisisResources']);
      const refetched = await queryClient.refetchQueries(['savedCrisisResources']);
      console.log('🔄 Refetch result:', refetched);
      toast.success('✅ Resource saved!', { 
        duration: 2000,
        icon: '💾'
      });
    },
    onError: (error) => {
      console.error('❌ Save mutation error:', error);
      toast.error('Failed to save. Please try again.');
    }
  });

  const unsaveResourceMutation = useMutation({
    mutationFn: async (savedResourceId) => {
      console.log('🗑️ Deleting saved resource ID:', savedResourceId);
      await base44.entities.SavedCrisisResource.delete(savedResourceId);
      return savedResourceId;
    },
    onSuccess: async () => {
      console.log('✅ Delete success, refetching...');
      await queryClient.invalidateQueries(['savedCrisisResources']);
      await queryClient.refetchQueries(['savedCrisisResources']);
      toast.info('Resource removed');
    },
    onError: (error) => {
      console.error('❌ Delete error:', error);
      toast.error('Failed to remove.');
    }
  });

  const toggleQuickAccessMutation = useMutation({
    mutationFn: async ({ id, quickAccess }) => {
      await base44.entities.SavedCrisisResource.update(id, { quick_access: quickAccess });
      return { id, quickAccess };
    },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries(['savedCrisisResources']);
      await queryClient.refetchQueries(['savedCrisisResources']);
      toast.success(variables.quickAccess ? '📌 Pinned to quick access' : 'Removed from quick access');
    }
  });

  const markHelpfulMutation = useMutation({
    mutationFn: async ({ id, isHelpful }) => {
      await base44.entities.SavedCrisisResource.update(id, {
        is_helpful: isHelpful,
        contact_attempts: isHelpful ? 1 : 0, // Reset contact attempts if marking helpful, for simplicity or could increment
        last_contacted: new Date().toISOString()
      });
      return { id, isHelpful };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['savedCrisisResources']);
      await queryClient.refetchQueries(['savedCrisisResources']);
      toast.success('Feedback saved');
    }
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }) => {
      await base44.entities.SavedCrisisResource.update(id, { notes });
      return { id, notes };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['savedCrisisResources']);
    }
  });

  const isResourceSaved = (resourceId) => {
    const found = savedResources.find(sr => sr.resource_id === resourceId);
    console.log(`🔍 Checking if resource ${resourceId} is saved:`, !!found);
    return found; // Return the saved object, not just a boolean
  };

  const handleSaveToggle = async (resource) => {
    const saved = isResourceSaved(resource.id);
    console.log('🔄 Toggle save - Resource:', resource.resource_name, 'Currently saved:', !!saved);
    
    if (saved) {
      console.log('Unsaving with ID:', saved.id);
      await unsaveResourceMutation.mutateAsync(saved.id);
    } else {
      console.log('Saving new resource');
      await saveResourceMutation.mutateAsync(resource);
    }
  };

  const handleQuickAccessToggle = async (savedResource) => {
    await toggleQuickAccessMutation.mutateAsync({
      id: savedResource.id,
      quickAccess: !savedResource.quick_access
    });
  };

  // Filter resources
  const filteredResources = allResources.filter(resource => {
    if (selectedCategory !== 'all' && resource.category !== selectedCategory) return false;
    if (userCountry && !resource.is_international && resource.country !== userCountry) return false;

    if (userLanguage && resource.languages_supported && resource.languages_supported.length > 0) {
      if (!resource.languages_supported.includes(userLanguage)) return false;
    }

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        resource.resource_name.toLowerCase().includes(search) ||
        resource.description?.toLowerCase().includes(search) ||
        resource.specialized_services?.some(s => s.toLowerCase().includes(search)) ||
        resource.tags?.some(t => t.toLowerCase().includes(search))
      );
    }

    if (showSavedOnly && !isResourceSaved(resource.id)) return false;
    return true;
  });

  const quickAccessResources = savedResources.filter(sr => sr.quick_access);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Chat Interface - ALWAYS AT TOP */}
      <DirectoryChat 
        allResources={allResources}
        isCollapsed={isChatCollapsed}
        onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
      />

      {/* Admin Prompt - Only if NO resources and user is admin */}
      {allResources.length === 0 && user?.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-4 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-8">
              <AlertCircle className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-purple-900 mb-3 text-center">
                🛠️ Admin: Add Crisis Resources
              </h2>
              <p className="text-2xl font-bold text-purple-900 mb-3 text-center max-w-xl mx-auto">
                The Resource Directory is empty. Click below to populate it with essential crisis support resources.
              </p>
              <div className="text-center">
                <Button
                  onClick={createSampleResources}
                  disabled={creatingResources}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl px-8 py-4"
                >
                  {creatingResources ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Creating Resources...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-3" />
                      Add 5 Essential Resources
                    </>
                  )}
                </Button>
                <p className="text-sm text-purple-600 mt-3">
                  This will add: 988 Lifeline, Crisis Text Line, Domestic Violence Hotline, Trevor Project, SAMHSA Helpline
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* If no resources and not admin, show helper message */}
      {allResources.length === 0 && user?.role !== 'admin' && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              🤖 Chat with AI Above
            </h3>
            <p className="text-gray-600 mb-4">
              The directory is being built, but you can use the AI Navigator above to get help finding resources!
            </p>
            <p className="text-sm text-purple-600 font-semibold">
              Use the chat interface to tell the AI what you need 💙
            </p>
          </CardContent>
        </Card>
      )}

      {/* Saved Resources Summary - Show only if resources exist */}
      {savedResources.length > 0 && allResources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 border-4 border-purple-400 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-3 rounded-xl bg-purple-600 shadow-lg"
                  >
                    <BookmarkCheck className="w-8 h-8 text-white fill-current" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-purple-900 mb-1">
                      💜 Your Saved Resources
                    </h3>
                    <p className="text-purple-700 font-semibold">
                      {savedResources.length} saved • {quickAccessResources.length} quick access
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowSavedOnly(!showSavedOnly)}
                  className={`${
                    showSavedOnly 
                      ? 'bg-gradient-to-r from-purple-700 to-pink-700' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600'
                  } hover:from-purple-700 hover:to-pink-700 shadow-lg`}
                >
                  {showSavedOnly ? (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Browse All
                    </>
                  ) : (
                    <>
                      <BookmarkCheck className="w-5 h-5 mr-2" />
                      View Saved Only
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Access Bar */}
      {quickAccessResources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Pin className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-purple-900">⚡ Quick Access</h3>
                <Badge className="bg-purple-600 text-white">{quickAccessResources.length}</Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                {quickAccessResources.map((sr) => {
                  const resource = allResources.find(r => r.id === sr.resource_id);
                  if (!resource) return null;
                  
                  return (
                    <Button
                      key={sr.id}
                      onClick={() => setExpandedResource(expandedResource === resource.id ? null : resource.id)}
                      size="sm"
                      className="bg-white text-purple-700 hover:bg-purple-50 shadow-md justify-start"
                    >
                      {CATEGORY_CONFIG[resource.category]?.emoji} {resource.resource_name}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search and Filters - Only show if resources exist */}
      {allResources.length > 0 && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, service, or tag..."
                className="pl-10 border-2 focus:border-purple-400"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedCategory('all')}
              size="sm"
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className={selectedCategory === 'all' ? 'bg-purple-600' : ''}
            >
              All Categories
            </Button>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <Button
                key={key}
                onClick={() => setSelectedCategory(key)}
                size="sm"
                variant={selectedCategory === key ? 'default' : 'outline'}
                className={selectedCategory === key ? `bg-gradient-to-r ${config.color} text-white` : ''}
              >
                {config.emoji} {config.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Results Count - Only show if resources exist */}
      {allResources.length > 0 && (
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <strong className="text-blue-600 text-lg">{filteredResources.length}</strong> resource{filteredResources.length !== 1 ? 's' : ''}
            {userCountry && <span className="ml-2">📍 {userCountry}</span>}
            {userLanguage && <span className="ml-2">🗣️ {userLanguage.toUpperCase()}</span>}
          </div>
          <Badge className="bg-purple-600 text-white font-bold text-base px-4 py-2">
            💾 {savedResources.length} Saved
          </Badge>
        </div>
      )}

      {/* Resources List */}
      {allResources.length > 0 && (
        <div className="space-y-4">
          {filteredResources.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Resources Found
                </h3>
                <p className="text-gray-500">
                  {showSavedOnly 
                    ? 'You haven\'t saved any resources yet. Browse and save resources to see them here.'
                    : 'Try adjusting your filters or search terms'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredResources.map((resource, idx) => {
              const config = CATEGORY_CONFIG[resource.category];
              const CategoryIcon = config?.icon || Shield;
              const saved = isResourceSaved(resource.id);
              const isExpanded = expandedResource === resource.id;
              const isSaving = saveResourceMutation.isLoading || unsaveResourceMutation.isLoading;

              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`border-4 hover:shadow-2xl transition-all duration-300 ${
                    saved 
                      ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl' 
                      : 'border-gray-200 hover:border-purple-200'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            className={`p-3 rounded-xl bg-gradient-to-br ${config?.color || 'from-gray-500 to-slate-500'} flex-shrink-0 shadow-lg`}
                          >
                            <CategoryIcon className="w-6 h-6 text-white" />
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-2 flex-wrap">
                              <h3 className="font-bold text-lg text-gray-900">{resource.resource_name}</h3>
                              {resource.is_verified && (
                                <Badge className="bg-green-100 text-green-800 flex-shrink-0">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {resource.is_featured && (
                                <Badge className="bg-amber-100 text-amber-800 flex-shrink-0">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              {saved && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 200 }}
                                >
                                  <Badge className="bg-purple-600 text-white shadow-lg flex-shrink-0">
                                    <BookmarkCheck className="w-3 h-3 mr-1 fill-current" />
                                    SAVED
                                  </Badge>
                                </motion.div>
                              )}
                            </div>

                            <Badge className={`bg-gradient-to-r ${config?.color} text-white mb-2`}>
                              {config?.emoji} {config?.label}
                            </Badge>

                            <p className="text-sm text-gray-700 line-clamp-2 mb-2">{resource.description}</p>
                          </div>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            onClick={() => handleSaveToggle(resource)}
                            disabled={isSaving}
                            size="lg"
                            className={`${
                              saved 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl' 
                                : 'bg-white hover:bg-purple-50 border-4 border-purple-300 text-purple-700'
                            } transition-all duration-300 px-6 py-6`}
                            title={saved ? 'Remove from saved' : 'Save this resource'}
                          >
                            {isSaving ? (
                              <Loader2 className="w-6 h-6 animate-spin" />
                            ) : saved ? (
                              <BookmarkCheck className="w-6 h-6 fill-current" />
                            ) : (
                              <Bookmark className="w-6 h-6" />
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* Quick Contact Buttons */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {resource.phone_number && (
                          <a href={`tel:${resource.phone_number.replace(/[^0-9]/g, '')}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                              <Phone className="w-4 h-4 mr-2" />
                              Call {resource.phone_number}
                            </Button>
                          </a>
                        )}
                        {resource.text_number && (
                          <a href={`sms:${resource.text_number}`}>
                            <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Text
                            </Button>
                          </a>
                        )}
                        {resource.chat_url && (
                          <a href={resource.chat_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Chat
                            </Button>
                          </a>
                        )}
                        {resource.website_url && (
                          <a href={resource.website_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="border-gray-600 text-gray-600 hover:bg-gray-50">
                              <Globe className="w-4 h-4 mr-2" />
                              Website
                            </Button>
                          </a>
                        )}
                        {saved && (
                          <Button
                            onClick={() => handleQuickAccessToggle(saved)}
                            size="sm"
                            variant="outline"
                            className={`${
                              saved.quick_access 
                                ? 'border-purple-600 bg-purple-100 text-purple-700' 
                                : 'border-gray-400 text-gray-600'
                            }`}
                            disabled={toggleQuickAccessMutation.isLoading}
                          >
                            <Pin className={`w-4 h-4 mr-2 ${saved.quick_access ? 'fill-current' : ''}`} />
                            {saved.quick_access ? 'Pinned' : 'Pin'}
                          </Button>
                        )}
                      </div>

                      {/* Expand/Collapse Details */}
                      <Button
                        onClick={() => setExpandedResource(isExpanded ? null : resource.id)}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <span className="text-xs font-medium">
                          {isExpanded ? 'Show less' : 'Show full details'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 space-y-3 pt-3 border-t-2 border-gray-200"
                          >
                            {resource.specialized_services && resource.specialized_services.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">Services Offered:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {resource.specialized_services.map((service, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs border-purple-300">
                                      {service}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {resource.target_audience && resource.target_audience.length > 0 && (
                              <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-gray-700">
                                  <strong>For:</strong> {resource.target_audience.join(', ')}
                                </span>
                              </div>
                            )}

                            {(resource.country || resource.state_province || resource.city) && (
                              <div className="flex items-center gap-2 text-sm bg-green-50 p-2 rounded">
                                <MapPin className="w-4 h-4 text-green-600" />
                                <span className="text-gray-700">
                                  <strong>Location:</strong> {[resource.city, resource.state_province, resource.country]
                                    .filter(Boolean)
                                    .join(', ')}
                                </span>
                              </div>
                            )}

                            {resource.languages_supported && resource.languages_supported.length > 0 && (
                              <div className="flex items-center gap-2 text-sm bg-purple-50 p-2 rounded">
                                <Languages className="w-4 h-4 text-purple-600" />
                                <span className="text-gray-700">
                                  <strong>Languages:</strong> {resource.languages_supported.map(l => l.toUpperCase()).join(', ')}
                                </span>
                              </div>
                            )}

                            {resource.availability_details && (
                              <div className="flex items-center gap-2 text-sm bg-amber-50 p-2 rounded">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <span className="text-gray-700">
                                  <strong>Hours:</strong> {resource.availability_details}
                                </span>
                              </div>
                            )}

                            {resource.cost_details && (
                              <div className="flex items-center gap-2 text-sm bg-green-50 p-2 rounded">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="text-gray-700">
                                  <strong>Cost:</strong> {resource.cost_details}
                                </span>
                              </div>
                            )}

                            {resource.email && (
                              <div className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                                <Mail className="w-4 h-4 text-gray-600" />
                                <a href={`mailto:${resource.email}`} className="text-blue-600 hover:underline">
                                  {resource.email}
                                </a>
                              </div>
                            )}

                            {resource.accessibility_features && resource.accessibility_features.length > 0 && (
                              <div className="flex items-start gap-2 text-sm bg-cyan-50 p-2 rounded">
                                <Accessibility className="w-4 h-4 text-cyan-600 mt-0.5" />
                                <span className="text-gray-700">
                                  <strong>Accessibility:</strong> {resource.accessibility_features.join(', ')}
                                </span>
                              </div>
                            )}

                            {/* User Notes Section */}
                            {saved && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="pt-3 border-t-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-sm font-bold text-purple-900">📝 Your Personal Notes</p>
                                  <div className="flex gap-1">
                                    <Button
                                      onClick={() => markHelpfulMutation.mutate({ id: saved.id, isHelpful: true })}
                                      size="sm"
                                      variant="ghost"
                                      className={saved.is_helpful ? 'text-green-600' : 'text-gray-400'}
                                      disabled={markHelpfulMutation.isLoading}
                                    >
                                      <ThumbsUp className={`w-4 h-4 ${saved.is_helpful ? 'fill-current' : ''}`} />
                                    </Button>
                                    <Button
                                      onClick={() => markHelpfulMutation.mutate({ id: saved.id, isHelpful: false })}
                                      size="sm"
                                      variant="ghost"
                                      className={saved.is_helpful === false ? 'text-red-600' : 'text-gray-400'}
                                      disabled={markHelpfulMutation.isLoading}
                                    >
                                      <ThumbsDown className={`w-4 h-4 ${saved.is_helpful === false ? 'fill-current' : ''}`} />
                                    </Button>
                                  </div>
                                </div>
                                <Textarea
                                  value={saved.notes || ''}
                                  onChange={(e) => updateNotesMutation.mutate({ id: saved.id, notes: e.target.value })}
                                  placeholder="Add notes about this resource (e.g., called them, very helpful, spoke with Sarah...)"
                                  className="h-20 text-sm bg-white border-2 border-purple-200 focus:border-purple-400"
                                />
                                {saved.contact_attempts > 0 && (
                                  <p className="text-xs text-purple-600 mt-2 font-semibold">
                                    ✅ Contacted {saved.contact_attempts} time{saved.contact_attempts > 1 ? 's' : ''}
                                    {saved.last_contacted && ` • ${new Date(saved.last_contacted).toLocaleDateString()}`}
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Categories Overview - Show when viewing all */}
      {selectedCategory === 'all' && searchQuery === '' && !showSavedOnly && allResources.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Browse by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                  const count = allResources.filter(r => r.category === key).length;
                  if (count === 0) return null;

                  return (
                    <motion.button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 rounded-xl bg-gradient-to-br ${config.color} text-white text-left shadow-lg hover:shadow-xl transition-all`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{config.emoji}</span>
                        <Badge className="bg-white/30 text-white backdrop-blur-sm">{count}</Badge>
                      </div>
                      <p className="font-bold text-sm">{config.label}</p>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

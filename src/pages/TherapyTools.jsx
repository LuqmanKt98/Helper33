import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Download, FileText, Search, Heart, Brain, Users, Sparkles,
  BookOpen, Lock, Crown, Star, CheckCircle, Briefcase,
  GraduationCap, Leaf, Target, Clock, ArrowRight, Pen, Zap, Gift
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '@/components/SEO';
import PDFWorkbookViewer from '@/components/therapy/PDFWorkbookViewer';

const TOOL_CATEGORIES = [
  { id: 'all', name: 'All Tools', icon: Sparkles },
  { id: 'grief', name: 'Grief & Loss', icon: Heart },
  { id: 'anxiety', name: 'Anxiety & Stress', icon: Brain },
  { id: 'relationships', name: 'Relationships', icon: Users },
  { id: 'self-esteem', name: 'Self-Esteem', icon: Star },
  { id: 'mindfulness', name: 'Mindfulness', icon: Leaf },
  { id: 'goals', name: 'Goal Setting', icon: Target }
];

// Compatible apps for digital planners
const COMPATIBLE_APPS = [
  { name: 'GoodNotes', platform: 'iOS/Mac', icon: '📝' },
  { name: 'Notability', platform: 'iOS/Mac', icon: '✏️' },
  { name: 'Xodo', platform: 'iOS/Android', icon: '📄' },
  { name: 'Noteshelf', platform: 'iOS/Android', icon: '📓' },
  { name: 'Samsung Notes', platform: 'Android', icon: '📱' },
  { name: 'PDF Expert', platform: 'iOS/Mac', icon: '📑' }
];

// Plan types: 'basic', 'pro', 'executive', 'coming_soon'
const THERAPY_TOOLS = [
  {
    id: 'manifestation-planner-interactive',
    title: 'Digital Manifestation Planner (Interactive)',
    description: 'Hyperlinked digital planner for manifesting your dreams. Features gratitude tracking, vision boards, morning/evening routines, meditation tracker, and manifestation worksheets. Perfect for GoodNotes, Notability, Xodo, and other PDF apps.',
    category: 'goals',
    tags: ['manifestation', 'goals', 'gratitude', 'vision board', 'law of attraction', 'interactive'],
    pages: 62,
    downloads: 0,
    isNew: true,
    interactive: true,
    plan: 'basic', // Available in Basic plan and above
    digitalFeatures: ['Hyperlinked Index', 'Clickable Tabs', 'Fillable Fields', 'Bookmarks'],
    gradient: 'from-purple-600 to-indigo-600',
    pdfUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/1d9f8a694_DigitalManifestationPlannerMRR-Manual.pdf',
    features: [
      'Getting to Know Myself worksheet',
      'Morning & Evening Routines (SAVERS method)',
      'Gratitude Tracker & Daily Gratitude',
      'Meditation Tracker',
      'Vision Board pages',
      'Law of Attraction worksheets',
      'Manifestation areas: Love, Career, Family, Travel, Home, Car, Wealth, Business',
      '3-6-9 Method',
      'Limiting Beliefs & Thought Pattern tracking',
      'Money Mindset worksheets',
      'Weekly, Monthly, Yearly Reflections'
    ]
  },
  {
    id: 'manifestation-planner-print',
    title: 'Digital Manifestation Planner (Print/Canva)',
    description: 'Print-ready manifestation planner with all the core worksheets. Perfect for printing at home or customizing in Canva before printing. Includes all manifestation tools for goal setting and daily practice.',
    category: 'goals',
    tags: ['manifestation', 'goals', 'gratitude', 'vision board', 'printable', 'canva'],
    pages: 63,
    downloads: 0,
    isNew: true,
    interactive: false,
    plan: 'basic', // Available in Basic plan and above
    gradient: 'from-pink-600 to-rose-600',
    pdfUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/bca20bf24_DigitalManifestationPlanner.pdf',
    features: [
      'Print-Ready Format',
      'Canva Editable',
      'Hyperlinked Index for easy navigation',
      'Morning & Evening Routines',
      'Gratitude & Meditation Trackers',
      'Vision Board pages',
      'Complete Manifestation Worksheets',
      'Daily, Weekly, Monthly, Yearly Reflections',
      'Journaling pages',
      'Bucket List & My New Reality'
    ]
  }
];

// Plan badge configuration
const PLAN_CONFIG = {
  basic: { label: 'Basic', color: 'bg-blue-100 text-blue-700', icon: Star },
  pro: { label: 'Pro', color: 'bg-purple-100 text-purple-700', icon: Zap },
  executive: { label: 'Executive', color: 'bg-amber-100 text-amber-700', icon: Crown },
  coming_soon: { label: 'Coming Soon', color: 'bg-gray-100 text-gray-600', icon: Clock }
};

const ToolCard = ({ tool, hasAccess, hasTrial, onDownload, onOpenWorkbook }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryIcon = (category) => {
    const cat = TOOL_CATEGORIES.find(c => c.id === category);
    return cat ? cat.icon : FileText;
  };

  const CategoryIcon = getCategoryIcon(tool.category);
  const planConfig = PLAN_CONFIG[tool.plan] || PLAN_CONFIG.coming_soon;
  const PlanIcon = planConfig.icon;
  
  const isComingSoon = tool.plan === 'coming_soon';
  const canAccess = hasAccess || hasTrial;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Card className={`h-full border-2 ${isComingSoon ? 'border-gray-200 opacity-80' : 'border-purple-100 hover:border-purple-300'} transition-all duration-300 overflow-hidden bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl`}>
        <div className={`h-2 bg-gradient-to-r ${isComingSoon ? 'from-gray-300 to-gray-400' : tool.gradient || 'from-purple-500 to-pink-500'}`} />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <motion.div
              animate={{ rotate: isHovered && !isComingSoon ? 360 : 0 }}
              transition={{ duration: 0.5 }}
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${isComingSoon ? 'from-gray-300 to-gray-400' : tool.gradient || 'from-purple-500 to-pink-500'} flex items-center justify-center shadow-lg`}
            >
              <CategoryIcon className="w-6 h-6 text-white" />
            </motion.div>
            <div className="flex flex-wrap gap-1 justify-end">
              {/* Plan Badge */}
              <Badge className={`${planConfig.color} flex items-center gap-1`}>
                <PlanIcon className="w-3 h-3" />
                {planConfig.label}
              </Badge>
              {tool.interactive && !isComingSoon && (
                <Badge className="bg-blue-100 text-blue-700">
                  <Pen className="w-3 h-3 mr-1" />
                  Interactive
                </Badge>
              )}
              {tool.isNew && !isComingSoon && (
                <Badge className="bg-green-100 text-green-700">
                  ✨ New
                </Badge>
              )}
            </div>
          </div>
          
          <CardTitle className={`text-lg font-bold mt-3 line-clamp-2 ${isComingSoon ? 'text-gray-500' : 'text-gray-800'}`}>
            {tool.title}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 line-clamp-2">
            {tool.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tool.tags?.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-gray-50">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{tool.pages} pages</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{tool.downloads || 0} downloads</span>
            </div>
          </div>

          {isComingSoon ? (
            <Button
              disabled
              className="w-full bg-gray-200 text-gray-500 cursor-not-allowed"
            >
              <Clock className="w-4 h-4 mr-2" />
              Coming Soon
            </Button>
          ) : canAccess ? (
            <div className="space-y-2">
              {hasTrial && !hasAccess && (
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                  <Gift className="w-3 h-3" />
                  <span>Free trial access</span>
                </div>
              )}
              {tool.interactive && (
                <Button
                  onClick={() => onOpenWorkbook(tool)}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                >
                  <Pen className="w-4 h-4 mr-2" />
                  Open Interactive Workbook
                </Button>
              )}
              <Button
                onClick={() => onDownload(tool)}
                variant={tool.interactive ? "outline" : "default"}
                className={tool.interactive 
                  ? "w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                  : "w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                }
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          ) : (
            <Link to={createPageUrl('Upgrade')} className="block">
              <Button
                variant="outline"
                className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Lock className="w-4 h-4 mr-2" />
                Upgrade to Access
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function TherapyTools() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeWorkbook, setActiveWorkbook] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  // Check if user has active subscription
  const hasAccess = user?.role === 'admin' ||
    user?.subscription_status === 'active' ||
    user?.subscription_tier === 'basic' ||
    user?.subscription_tier === 'pro' ||
    user?.subscription_tier === 'executive';

  // Check if user is in 3-day free trial
  const getTrialDaysLeft = () => {
    if (!user?.created_date) return 0;
    const createdDate = new Date(user.created_date);
    const now = new Date();
    const daysSinceSignup = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    return Math.max(0, 3 - daysSinceSignup);
  };
  
  const trialDaysLeft = getTrialDaysLeft();
  const hasTrial = trialDaysLeft > 0 && user;

  const filteredTools = THERAPY_TOOLS.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (tool) => {
    if (tool.pdfUrl) {
      window.open(tool.pdfUrl, '_blank');
    }
  };

  const handleOpenWorkbook = (tool) => {
    setActiveWorkbook(tool);
  };

  return (
    <>
      {/* Interactive Workbook Viewer */}
      <AnimatePresence>
        {activeWorkbook && (
          <PDFWorkbookViewer
            tool={activeWorkbook}
            onClose={() => setActiveWorkbook(null)}
          />
        )}
      </AnimatePresence>

      <SEO
        title="Therapy Tools & Workbooks | Helper33"
        description="Download professional therapy worksheets, workbooks, and tools for therapists, life coaches, and mental health professionals."
        keywords="therapy worksheets, counseling tools, mental health workbooks, therapist resources, coaching materials"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-16">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-purple-200/30 to-pink-200/30 blur-3xl"
              style={{
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 30, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-pink-600/90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1920')] bg-cover bg-center opacity-20" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
              >
                <Briefcase className="w-5 h-5 text-white" />
                <span className="text-white font-medium">For Mental Health Professionals</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                Professional Therapy
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Tools & Workbooks
                </span>
              </h1>

              <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
                Download evidence-based worksheets, workbooks, and therapeutic resources 
                designed for therapists, life coaches, and mental health professionals.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">Evidence-Based</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Download className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">Instant Download</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">Print-Ready PDFs</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          {/* Search & Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search tools, worksheets, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-purple-400"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                {TOOL_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`whitespace-nowrap ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'border-2 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Trial Banner */}
          {hasTrial && !hasAccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
                      >
                        <Gift className="w-7 h-7 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">🎉 Free Trial Active!</h3>
                        <p className="text-gray-600">
                          You have <span className="font-bold text-green-600">{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}</span> left to explore all premium tools for free
                        </p>
                      </div>
                    </div>
                    <Link to={createPageUrl('Upgrade')}>
                      <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                        Subscribe to Keep Access
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Access Banner for Non-Subscribers (no trial) */}
          {!hasAccess && !hasTrial && user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Crown className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Unlock All Professional Tools</h3>
                        <p className="text-gray-600">Subscribe to download unlimited therapy worksheets and workbooks</p>
                      </div>
                    </div>
                    <Link to={createPageUrl('Upgrade')}>
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                        View Plans
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Not logged in banner */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"
                      >
                        <Gift className="w-7 h-7 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Try All Tools Free for 3 Days!</h3>
                        <p className="text-gray-600">Sign up now and get instant access to all therapy tools and workbooks</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => base44.auth.redirectToLogin()}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                    >
                      Start Free Trial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tools Grid */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ToolCard
                    tool={tool}
                    hasAccess={hasAccess}
                    hasTrial={hasTrial}
                    onDownload={handleDownload}
                    onOpenWorkbook={handleOpenWorkbook}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Tools Coming Soon!</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                We're adding professional therapy workbooks and worksheets. 
                Check back soon for evidence-based resources!
              </p>
              <Link to={createPageUrl('Dashboard')}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Explore Other Features
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: GraduationCap,
                title: 'Evidence-Based',
                description: 'All tools are developed using proven therapeutic frameworks and methodologies.',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Briefcase,
                title: 'Professional Use',
                description: 'Designed specifically for therapists, coaches, and mental health practitioners.',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: Clock,
                title: 'Save Time',
                description: 'Ready-to-use worksheets and workbooks that you can use immediately with clients.',
                gradient: 'from-orange-500 to-red-500'
              }
            ].map((item, index) => (
              <Card key={index} className="border-2 border-gray-100 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
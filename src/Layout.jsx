import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { isAppMySite } from './components/hooks/useAppMySite';
import { base44 } from './api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import {
  Home,
  LayoutDashboard,
  CalendarDays,
  Activity,
  UsersRound,
  BrainCircuit,
  BookOpenText,
  LifeBuoy,
  Briefcase,
  Sparkles,
  LayoutGrid,
  Flame,
  MessageSquare,
  Crown,
  Menu,
  X,
  LogOut,
  Settings,
  Bell,
  User,
  Heart,
  ShoppingBag,
  Globe,
  CheckCircle,
  Shield,
  GraduationCap,
  Zap,
  Lock,
  ChevronDown,
  Info,
  FileText,
  HeartHandshake,
  Utensils,
  Baby,
  Laptop,
  Snowflake,
  Target,
  Calendar,
  Bot,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationToggles, NotificationProvider } from './components/SoundManager';
// OneSignalManager removed - consolidated into NotificationManager
import PWAInstaller from './components/PWAInstaller';
import ConsentBanner from './components/ConsentBanner';
import NotificationManager from './components/NotificationManager';
import UserCache from './components/UserCache';
import VisitorTracker from './components/VisitorTracker';
import GoogleTagManager from './components/GoogleTagManager';
import GoogleAdsTracking from './components/GoogleAdsTracking';
import GoogleAnalytics from './components/GoogleAnalytics';
import AIAssistant from './components/AIAssistant';
import { useTranslation } from './components/Translations';
import LanguageSwitcher from './components/LanguageSwitcher';
import DevelopmentProgress from './components/DevelopmentProgress';
import TrialBanner from './components/TrialBanner';
import NotificationBell from './components/NotificationBell';
import ProactiveAISupport from './components/ProactiveAISupport';
import PaywallGate from './components/PaywallGate';
import WelcomeOnboarding from './components/WelcomeOnboarding';
import ServiceWorkerInstaller from './components/push/ServiceWorkerInstaller';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
  const [aiInitialMessage, setAiInitialMessage] = useState("");
  const [aiAgent, setAiAgent] = useState('personal_assistant');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isInApp, setIsInApp] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsInApp(isAppMySite());
    if (isAppMySite()) {
      document.body.classList.add('appmysite-view');
    }
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const userData = await base44.auth.me();
      await UserCache.setUser(userData);
      return userData;
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false
  });

  const { t, lang, isRTL } = useTranslation(user);

  const featureCategories = [
    {
      name: "Dashboard",
      path: "Dashboard",
      icon: LayoutDashboard,
      description: "Your personalized AI command center",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      name: "Wellness AI",
      path: "Wellness",
      icon: Activity,
      description: "Mental health support & wellness tracking",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      name: "Student AI",
      path: "HomeworkHub",
      icon: GraduationCap,
      description: "Homework help & AI tutoring",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      name: "Cooking AI",
      path: "MealPlanner",
      icon: Utensils,
      description: "Meal planning & recipe generator",
      gradient: "from-orange-500 to-red-500"
    },
    {
      name: "Kids AI",
      path: "KidsCreativeStudio",
      icon: Baby,
      description: "Safe learning games & creative tools",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      name: "Business AI",
      path: "SocialMediaManager",
      icon: Laptop,
      description: "AI consultation, implementation & content creation",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      name: "AI Agents Hub",
      path: "AgentsHub",
      icon: Bot,
      description: "Manage specialized AI agents",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      name: "Family Hub",
      path: "Family",
      icon: UsersRound,
      description: "Family calendar & task management",
      gradient: "from-rose-500 to-pink-500"
    },
    {
      name: "Care Hub",
      path: "CareHub",
      icon: HeartHandshake,
      description: "Find caregivers & post jobs",
      gradient: "from-teal-500 to-cyan-500"
    }
  ];

  const handleLogout = async () => {
    await UserCache.clearUser();
    await base44.auth.logout();
    window.location.href = createPageUrl("Home");
  };

  const handleOpenAI = useCallback((message = "", agent = 'personal_assistant') => {
    setAiInitialMessage(message);
    setAiAgent(agent);
    const event = new CustomEvent('forceOpenAI', { detail: { message, agent } });
    window.dispatchEvent(event);
  }, []);

  useEffect(() => {
    const handleOpenAIEvent = (e) => {
      handleOpenAI(e.detail?.message || "", e.detail?.agent || 'personal_assistant');
    };
    
    window.addEventListener('openAIAssistant', handleOpenAIEvent);
    return () => window.removeEventListener('openAIAssistant', handleOpenAIEvent);
  }, [handleOpenAI]);

  useEffect(() => {
    setMobileMenuOpen(false);

    if (user && !isLoading) {
      const hasSeenOnboarding = localStorage.getItem(`onboarding_complete_${user.id}`);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }

    const handleClickOutside = (e) => {
      if (userMenuOpen && !e.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
      if (featuresDropdownOpen && !e.target.closest('.features-dropdown')) {
        setFeaturesDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen, featuresDropdownOpen, location.pathname, user, isLoading]);

  const getUserAvatar = () => {
    if (user?.avatar_url) {
      return <img src={user.avatar_url} alt={user.full_name || 'User avatar'} className="w-full h-full rounded-full object-cover" />;
    }
    if (user?.profile_emoji) {
      return (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
          <span className="text-xl">{user.profile_emoji}</span>
        </div>
      );
    }
    return (
      <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
        <User className="w-5 h-5 text-white" />
      </div>
    );
  };

  const getDisplayName = () => {
    if (!user) return '';
    return user.preferred_name || user.full_name;
  };

  return (
    <NotificationProvider>
      <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <ScrollToTop />
        <ScrollToTopButton />
        <GoogleAnalytics />
        <ConsentBanner />
        {!isInApp && <PWAInstaller />}
        <NotificationManager />
        <VisitorTracker />
        <GoogleTagManager />
        <GoogleAdsTracking />
        <ServiceWorkerInstaller />

        <AnimatePresence>
          {showOnboarding && user && (
            <WelcomeOnboarding onComplete={() => {
              setShowOnboarding(false);
              localStorage.setItem(`onboarding_complete_${user.id}`, 'true');
            }} />
          )}
        </AnimatePresence>

        <TrialBanner />
        

        <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-orange-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to={createPageUrl("Home")} className="flex items-center gap-2 flex-shrink-0">
                <motion.div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/7020c5b33_logo-squarecc.png"
                    alt="Helper33 Logo"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Helper33
                </span>
              </Link>

              {/* Primary Navigation - Essential Links */}
              <div className="hidden lg:flex items-center gap-1">
                <Link to={createPageUrl("Home")}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                      currentPageName === "Home"
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span className="font-medium">Home</span>
                  </Button>
                </Link>

                <Link to={createPageUrl("Dashboard")}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                      currentPageName === "Dashboard"
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="font-medium">Dashboard</span>
                  </Button>
                </Link>

                <div className="relative features-dropdown">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFeaturesDropdownOpen(!featuresDropdownOpen);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all font-medium ${
                      featuresDropdownOpen
                        ? 'bg-purple-100 text-purple-900'
                        : 'text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Features</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${featuresDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {featuresDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border-2 border-purple-200 overflow-hidden z-50"
                      >
                        <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                          {featureCategories.map((feature) => {
                            const Icon = feature.icon;
                            return (
                              <Link key={feature.path} to={createPageUrl(feature.path)}>
                                <motion.div
                                  whileHover={{ x: 5 }}
                                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-all cursor-pointer group"
                                  onClick={() => setFeaturesDropdownOpen(false)}
                                >
                                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow`}>
                                    <Icon className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm">{feature.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{feature.description}</p>
                                  </div>
                                </motion.div>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link to={createPageUrl("CrisisHub")}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                      currentPageName === "CrisisHub"
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                        : 'text-red-600 hover:bg-red-50 font-semibold'
                    }`}
                  >
                    <LifeBuoy className={`w-4 h-4 ${currentPageName !== "CrisisHub" ? 'animate-pulse' : ''}`} />
                    <span className="font-medium">Crisis</span>
                  </Button>
                </Link>

                <Link to={createPageUrl("Shop")}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                      currentPageName === "Shop"
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="font-medium">Shop</span>
                  </Button>
                </Link>

                <Link to={createPageUrl("About")}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                      currentPageName === "About"
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    <Info className="w-4 h-4" />
                    <span className="font-medium">About</span>
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {user && (
                  <>
                    <Link to={createPageUrl('Messages')}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-orange-50 relative"
                        title="Messages"
                      >
                        <MessageSquare className="w-5 h-5 text-gray-700" />
                      </Button>
                    </Link>

                    <NotificationBell />

                    <Link to={createPageUrl('AccountManager')}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 hover:from-purple-100 hover:to-pink-100 hover:scale-105 transition-all shadow-md"
                      >
                        <Crown className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold text-purple-700">Account</span>
                      </Button>
                    </Link>
                  </>
                )}

                <div className="hidden md:block">
                  <NotificationToggles />
                </div>

                {user ? (
                  <div className="relative user-menu">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserMenuOpen(!userMenuOpen);
                      }}
                      className="h-10 w-10 p-0 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border-2 border-orange-300 hover:border-orange-400 transition-all hover:scale-110 shadow-md hover:shadow-lg rounded-full overflow-hidden"
                      title={`${getDisplayName()} - Settings Menu`}
                    >
                      {getUserAvatar()}
                    </Button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-orange-200 py-2 overflow-hidden z-50"
                        >
                          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12">
                                {getUserAvatar()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{getDisplayName()}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                              </div>
                            </div>
                          </div>
                          <Link to={createPageUrl('Dashboard')}>
                            <Button
                              variant="ghost"
                              className="w-full px-4 py-3 justify-start hover:bg-blue-50 flex items-center gap-3 text-sm font-medium"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <LayoutDashboard className="w-4 h-4 text-blue-600" />
                              Dashboard
                            </Button>
                          </Link>
                          <Link to={createPageUrl('Profile')}>
                            <Button
                              variant="ghost"
                              className="w-full px-4 py-3 justify-start hover:bg-purple-50 flex items-center gap-3 text-sm font-medium"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <User className="w-4 h-4 text-purple-600" />
                              View Profile
                            </Button>
                          </Link>
                          <Link to={createPageUrl('AccountManager')}>
                            <Button
                              variant="ghost"
                              className="w-full px-4 py-3 justify-start hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 flex items-center gap-3 text-sm font-medium"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Crown className="w-4 h-4 text-purple-600" />
                              Account Manager
                            </Button>
                          </Link>
                          <Link to={createPageUrl('Account')}>
                            <Button
                              variant="ghost"
                              className="w-full px-4 py-3 justify-start hover:bg-orange-50 flex items-center gap-3 text-sm font-medium"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Settings className="w-4 h-4 text-orange-600" />
                              Settings
                            </Button>
                          </Link>
                          <Link to={createPageUrl('Security')}>
                            <Button
                              variant="ghost"
                              className="w-full px-4 py-3 justify-start hover:bg-blue-50 flex items-center gap-3 text-sm font-medium"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Lock className="w-4 h-4 text-blue-600" />
                              Security & Privacy
                            </Button>
                          </Link>
                          <Link to={createPageUrl('IntegrationsHub')}>
                            <Button
                              variant="ghost"
                              className="w-full px-4 py-3 justify-start hover:bg-green-50 flex items-center gap-3 text-sm font-medium"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Zap className="w-4 h-4 text-green-600" />
                              Integrations
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setUserMenuOpen(false);
                              handleLogout();
                            }}
                            className="w-full px-4 py-3 justify-start hover:bg-red-50 flex items-center gap-3 text-sm font-medium text-red-600"
                          >
                            <LogOut className="w-4 h-4" />
                            {t('layout.logout')}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Button
                    onClick={() => base44.auth.redirectToLogin()}
                    className="hidden lg:flex bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    Log In / Sign Up
                  </Button>
                )}

                <LanguageSwitcher currentLanguage={lang} size="sm" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-orange-50"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="lg:hidden py-4 space-y-2 max-h-[70vh] overflow-y-auto"
                >
                  {!user && (
                    <Button
                      onClick={() => base44.auth.redirectToLogin()}
                      className="w-full mb-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-md"
                    >
                      Log In / Sign Up
                    </Button>
                  )}

                  <Link to={createPageUrl("Home")}>
                    <Button
                      variant="ghost"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg justify-start text-sm ${
                        currentPageName === "Home"
                          ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-orange-50'
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      <span className="font-medium">Home</span>
                    </Button>
                  </Link>

                  <Link to={createPageUrl("Year2026Hub")}>
                    <Button
                      variant="ghost"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg justify-start text-sm ${
                        currentPageName === "Year2026Hub"
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                          : 'text-purple-700 hover:bg-purple-50 font-semibold border-2 border-purple-300'
                      }`}
                    >
                      <Target className="w-4 h-4" />
                      <span className="font-medium">🎯 2026 Planner</span>
                    </Button>
                  </Link>

                  <div className="space-y-1">
                    <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Features</p>
                    {featureCategories.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <Link key={feature.path} to={createPageUrl(feature.path)}>
                          <Button
                            variant="ghost"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full flex items-start gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-orange-50 justify-start text-sm"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold">{feature.name}</p>
                              <p className="text-xs text-gray-500 truncate">{feature.description}</p>
                            </div>
                          </Button>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-200 my-2"></div>

                  <Link to={createPageUrl("CrisisHub")}>
                    <Button
                      variant="ghost"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg justify-start text-sm ${
                        currentPageName === "CrisisHub"
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                          : 'text-red-700 hover:bg-red-50 font-semibold border-2 border-red-300'
                      }`}
                    >
                      <LifeBuoy className={`w-4 h-4 ${currentPageName !== "CrisisHub" ? 'animate-pulse' : ''}`} />
                      <span className="font-medium">Crisis-Safe Hub</span>
                    </Button>
                  </Link>

                  <Link to={createPageUrl("About")}>
                    <Button
                      variant="ghost"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-orange-50 justify-start text-sm"
                    >
                      <Info className="w-4 h-4" />
                      <span className="font-medium">About</span>
                    </Button>
                  </Link>

                  <Link to={createPageUrl("OurStory")}>
                    <Button
                      variant="ghost"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg justify-start text-sm ${
                        currentPageName === "OurStory"
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'text-purple-700 hover:bg-purple-50 font-semibold border-2 border-purple-300'
                      }`}
                    >
                      <BookOpenText className="w-4 h-4" />
                      <span className="font-medium">Our Story</span>
                    </Button>
                  </Link>

                  <Link to={createPageUrl("Blog")}>
                    <Button
                      variant="ghost"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-orange-50 justify-start text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">Blog</span>
                    </Button>
                  </Link>

                  <Link to={createPageUrl("HeartfulHolidays")}>
                    <Button
                      variant="ghost"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg justify-start text-sm ${
                        currentPageName === "HeartfulHolidays"
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                          : 'text-blue-700 hover:bg-blue-50 border-2 border-blue-300'
                      }`}
                    >
                      <Snowflake className="w-4 h-4" />
                      <span className="font-medium">Holiday Hub</span>
                    </Button>
                  </Link>

                  <Link to={createPageUrl("FindPractitioners")}>
                    <Button
                      variant="ghost"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-2 border-purple-300 justify-start text-sm"
                    >
                      <HeartHandshake className="w-4 h-4" />
                      <span className="font-medium">Find Practitioners</span>
                    </Button>
                  </Link>

                  <Link to={createPageUrl("ClientPortal")}>
                    <Button
                      variant="ghost"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg justify-start text-sm ${
                        currentPageName === "ClientPortal"
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'text-purple-700 hover:bg-purple-50 border-2 border-purple-300'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">My Portal</span>
                    </Button>
                  </Link>

                  <Link to={createPageUrl("TherapyTools")}>
                    <Button
                      variant="ghost"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg justify-start text-sm ${
                        currentPageName === "TherapyTools"
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'text-purple-700 hover:bg-purple-50 border-2 border-purple-300'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span className="font-medium">Therapy Tools</span>
                    </Button>
                  </Link>

                  <Link to={createPageUrl("SupportUs")}>
                    <Button
                      variant="ghost"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 text-orange-700 border-2 border-orange-300 justify-start text-sm"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">Back Us / Donate</span>
                    </Button>
                  </Link>

                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-medium text-gray-700">{t('layout.soundEffects')}</span>
                    <NotificationToggles />
                  </div>

                  {user && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>

                      <div className="px-3 py-2 bg-gray-50 rounded-lg mx-2 flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 h-12">
                          {getUserAvatar()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{getDisplayName()}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>

                      <Link to={createPageUrl('Dashboard')}>
                        <Button
                          variant="ghost"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 justify-start text-sm"
                        >
                          <LayoutDashboard className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Dashboard</span>
                        </Button>
                      </Link>

                      <Link to={createPageUrl('Profile')}>
                        <Button
                          variant="ghost"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 justify-start text-sm"
                        >
                          <User className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">My Profile</span>
                        </Button>
                      </Link>

                      <Link to={createPageUrl('AccountManager')}>
                        <Button
                          variant="ghost"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 justify-start text-sm font-semibold"
                        >
                          <Crown className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">Account Manager</span>
                        </Button>
                      </Link>
                      
                      <Link to={createPageUrl('Account')}>
                        <Button
                          variant="ghost"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-orange-50 justify-start text-sm"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="font-medium">Settings</span>
                        </Button>
                      </Link>

                      <Link to={createPageUrl('Security')}>
                        <Button
                          variant="ghost"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 justify-start text-sm"
                        >
                          <Lock className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Security & Privacy</span>
                        </Button>
                      </Link>

                      <Link to={createPageUrl('IntegrationsHub')}>
                        <Button
                          variant="ghost"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-green-50 justify-start text-sm"
                        >
                          <Zap className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Integrations</span>
                        </Button>
                      </Link>
                      
                      {user?.role === 'admin' && (
                        <div className="mt-4 bg-amber-500/10 border-2 border-amber-300 rounded-lg p-2 mx-2">
                          <h4 className="font-bold text-amber-700 mb-2 flex items-center gap-2 px-1">
                            <Crown className="w-4 h-4" />
                            Admin Tools
                          </h4>
                          <ul className="space-y-1">
                            <li>
                              <Link to={createPageUrl('AdminPractitionerReview')}>
                                <Button
                                  variant="ghost"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-700 hover:bg-amber-50 justify-start text-sm font-semibold"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                  🛡️ Review Practitioners
                                </Button>
                              </Link>
                            </li>
                            <li>
                              <Link to={createPageUrl('AdminAuditLogs')}>
                                <Button
                                  variant="ghost"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-700 hover:bg-amber-50 justify-start text-sm font-semibold"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                  📋 Audit Logs
                                </Button>
                              </Link>
                            </li>
                            <li>
                              <Link to={createPageUrl('AdminConsultantReview')}>
                                <Button
                                  variant="ghost"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-700 hover:bg-amber-50 justify-start text-sm font-semibold"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                  🛡️ Review Consultants
                                </Button>
                              </Link>
                            </li>
                            <li>
                              <Link to={createPageUrl('AdminChallengeReview')}>
                                <Button
                                  variant="ghost"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-700 hover:bg-amber-50 justify-start text-sm font-semibold"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                  🎯 Review Challenges
                                </Button>
                              </Link>
                            </li>
                            <li>
                              <Link to={createPageUrl('Security')}> 
                                <Button
                                  variant="ghost"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-700 hover:bg-amber-50 justify-start text-sm font-semibold"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                  🔒 Security Audit
                                </Button>
                              </Link>
                            </li>
                          </ul>
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 justify-start text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">{t('layout.logout')}</span>
                      </Button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <main>
          <PaywallGate currentPageName={currentPageName}>
            {children}
          </PaywallGate>
        </main>

        <footer className="bg-gradient-to-br from-orange-900 via-red-900 to-amber-900 text-white mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {user && (
              <div className="text-center mb-6 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-orange-200">
                  ✅ Logged in as: <span className="font-bold text-white">{user.email}</span> |
                  Role: <span className="font-bold text-amber-300">{user.role || 'not set'}</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/7020c5b33_logo-squarecc.png"
                      alt="Helper33 Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xl font-bold">Helper33</span>
                </div>
                <p className="text-orange-200 text-sm leading-relaxed mb-4">
                  All-in-one AI ecosystem for everyday life and business. 33+ AI Tools • 13+ Intelligent Agents • 700+ AI Controls.
                  Family-friendly platform with AI consultants for personal and business projects.
                </p>
                <div className="flex gap-3">
                  <a href="https://www.instagram.com/lifewellnessai/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                    <span className="text-sm">📱</span>
                  </a>
                  <a href="https://facebook.com/helper33" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                    <span className="text-sm">👍</span>
                  </a>
                  <a href="https://twitter.com/helper33" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                    <span className="text-sm">🐦</span>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  {[
                    { name: 'Home', path: 'Home' },
                    { name: 'Dashboard', path: 'Dashboard' },
                    { name: 'About Us', path: 'About' },
                    { name: 'Community', path: 'Community' },
                    { name: 'Blog', path: 'Blog' }
                  ].map(link => (
                    <li key={link.path}>
                      <Link to={createPageUrl(link.path)} className="text-orange-200 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-orange-400 group-hover:bg-white transition-colors"></span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Support & Resources</h3>
                <ul className="space-y-2">
                  {[
                    { name: 'Crisis Support', path: 'CrisisHub' },
                    { name: 'Help Center', path: 'About' },
                    { name: 'Contact Us', path: 'About' },
                    { name: 'Feedback', path: 'FeedbackSurvey' }
                  ].map(link => (
                    <li key={link.path}>
                      <Link to={createPageUrl(link.path)} className="text-orange-200 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-orange-400 group-hover:bg-white transition-colors"></span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                {user?.role === 'admin' && (
                  <div className="mt-6 bg-amber-500/20 border-2 border-amber-400 rounded-xl p-4 backdrop-blur-sm">
                    <h4 className="font-bold text-amber-300 mb-3 flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      🛡️ Admin Tools
                    </h4>
                    <ul className="space-y-2">
                      {[
                        { name: '🛡️ Review Practitioners', path: 'AdminPractitionerReview' },
                        { name: '📋 Audit Logs', path: 'AdminAuditLogs' },
                        { name: '🛡️ Review Consultants', path: 'AdminConsultantReview' },
                        { name: '🎯 Review Challenges', path: 'AdminChallengeReview' },
                        { name: '🔒 Security Audit', path: 'Security' }
                      ].map(link => (
                        <li key={link.path}>
                          <Link to={createPageUrl(link.path)} className="text-amber-200 hover:text-white transition-colors text-sm flex items-center gap-2 group font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:bg-white transition-colors"></span>
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Legal & Policies</h3>
                <ul className="space-y-2 mb-6">
                  {[
                    { name: 'Privacy Policy', path: 'PrivacyPolicy' },
                    { name: 'Terms Of Service', path: 'TermsOfService' },
                    { name: 'Legal Disclaimer', path: 'LegalDisclaimer' }
                  ].map(link => (
                    <li key={link.path}>
                      <Link to={createPageUrl(link.path)} className="text-orange-200 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-orange-400 group-hover:bg-white transition-colors"></span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Contact Us
                  </h4>
                  <p className="text-orange-200 text-xs mb-1">
                    <strong>Email:</strong> support@helper33.com
                  </p>
                  <p className="text-orange-200 text-xs mb-1">
                    <strong>Crisis Line:</strong> 988 (US)
                  </p>
                  <p className="text-orange-200 text-xs">
                    <strong>Hours:</strong> 24/7 AI Support
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-orange-200 text-sm text-center md:text-left">
                  © {new Date().getFullYear()} Helper33 Inc. All rights reserved. <span className="text-white font-semibold">Helper33</span> -
                  All-in-one AI ecosystem with 33+ tools, 13+ agents, and 700+ AI controls. Made with <Heart className="w-4 h-4 inline text-orange-400" /> for families, businesses, and individuals.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-orange-200">
                  <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                  <span>•</span>
                  <Link to={createPageUrl('TermsOfService')} className="hover:text-white transition-colors">
                    Terms
                  </Link>
                  {user?.role === 'admin' && (
                    <>
                      <span>•</span>
                      <Link to={createPageUrl('Security')} className="hover:text-white transition-colors font-bold text-amber-300">
                        🔒 Security
                      </Link>
                    </>
                  )}
                  <span>•</span>
                  <a href="mailto:support@helper33.com" className="hover:text-white transition-colors">
                    Support
                  </a>
                </div>
              </div>

              <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-200 text-xs text-center leading-relaxed">
                  <strong>⚕️ Health and Wellness Product Disclaimer:</strong> Helper33 is a wellness and personal growth tool.
                  This product and its features are <strong>NOT</strong> a replacement for medication, medical treatment, psychological therapy, or a doctor's examination.
                  Helper33 does not diagnose, cure, treat, mitigate, or prevent any disease, condition, or illness.
                  <br/><br/>
                  <strong>If you are experiencing a mental health crisis:</strong> Please call 988 (US Suicide & Crisis Lifeline),
                  your local emergency services, or contact a licensed healthcare professional immediately.
                </p>
              </div>
            </div>
          </div>
        </footer>

        {user && (
          <>
            <AIAssistant 
              currentPageName={currentPageName} 
              initialMessage={aiInitialMessage}
              initialAgent={aiAgent}
            />
            <ProactiveAISupport currentPageName={currentPageName} onOpenAI={handleOpenAI} />
          </>
        )}

        <style>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .rtl {
            direction: rtl;
          }
        `}</style>
      </div>
    </NotificationProvider>
  );
}
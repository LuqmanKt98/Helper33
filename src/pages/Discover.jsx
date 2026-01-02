
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User as UserEntity } from '@/entities/all';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Newspaper, Compass, Heart, Sprout, Lightbulb, Video, PlayCircle, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

import NewsFeed from '@/components/discover/NewsFeed';
import MyFavorites from '@/components/discover/MyFavorites';
import GardenPlanner from '@/components/discover/GardenPlanner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const FeatureCard = ({ icon: Icon, title, description, onClick, bgColor, textColor, isActive }) => (
    <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.05, y: -5, boxShadow: '0px 10px 30px -5px rgba(0,0,0,0.1)' }}
        className={`relative rounded-2xl p-6 cursor-pointer h-full flex flex-col justify-between overflow-hidden transition-all duration-300 ${ isActive ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-teal-50' : 'ring-0' } ${bgColor}`}
        onClick={onClick}
    >
        <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10`}></div>
        <div className={`absolute top-4 left-4 w-16 h-16 rounded-full bg-white/10`}></div>
        
        <div className="relative z-10">
            <div className="p-3 bg-white/20 rounded-xl inline-block mb-4 shadow-inner">
                <Icon className={`w-7 h-7 ${textColor}`} />
            </div>
            <h3 className={`text-xl font-bold ${textColor} mb-2`}>{title}</h3>
            <p className={`text-sm opacity-80 ${textColor}`}>{description}</p>
        </div>
        <div className="relative z-10 mt-4">
             {isActive && <motion.div layoutId="active-indicator" className="h-1 w-12 bg-white rounded-full"></motion.div>}
        </div>
    </motion.div>
);


export default function Discover() {
  const [activeTab, setActiveTab] = useState('news');
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-discover-access'],
    queryFn: () => UserEntity.me().catch(() => null),
  });

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast.error("You don't have permission to access this page.");
      navigate(createPageUrl('Home'));
    }
  }, [user, isLoading, navigate]);

  const tabs = [
    { id: 'news', label: 'Inspiration Feed', icon: Newspaper, description: "Daily dose of curated news.", color: 'bg-gradient-to-br from-sky-400 to-blue-500 text-white' },
    { id: 'videos', label: 'Inspiring Videos', icon: Video, description: "Powerful stories that move.", color: 'bg-gradient-to-br from-purple-400 to-indigo-500 text-white' },
    { id: 'projects', label: 'Creative Projects', icon: Lightbulb, description: "DIY ideas and creative sparks.", color: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' },
    { id: 'garden', label: 'Garden Planner', icon: Sprout, description: "Grow your own fresh herbs.", color: 'bg-gradient-to-br from-emerald-400 to-green-500 text-white' },
    { id: 'favorites', label: 'My Favorites', icon: Heart, description: "Your saved collection.", color: 'bg-gradient-to-br from-rose-400 to-pink-500 text-white' },
  ];

  const forYouItems = [
      { id: 'news', title: "Trending Stories", description: "Catch up on what's new and noteworthy in wellness and technology.", icon: Newspaper, action: () => setActiveTab('news') },
      { id: 'garden', title: "Start Your First Herb Garden", description: "Simple tips to begin growing your own fresh ingredients at home.", icon: Sprout, action: () => setActiveTab('garden') },
      { id: 'videos', title: "Featured Video: The Power of Yet", description: "Discover how a simple mindset shift can unlock your potential.", icon: PlayCircle, action: () => setActiveTab('videos') },
  ];

  if (isLoading || (user && user.role !== 'admin')) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 overflow-hidden">
        {/* Floating Orbs Background */}
        <div className="absolute inset-0 z-0 opacity-50">
            <div className="absolute top-0 -left-24 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-2xl animate-blob"></div>
            <div className="absolute top-20 -right-24 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-16 left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10">
            {/* Header Section */}
            <motion.div 
                className="h-[50vh] relative flex items-center justify-center text-white text-center p-6 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div className="relative z-10">
                    <motion.div 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <Compass className="w-6 h-6" />
                        <span className="text-lg font-bold tracking-wide">Discover</span>
                    </motion.div>
                    <motion.h1 
                        className="text-4xl md:text-6xl font-bold mb-4 shadow-text"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        Explore Your World
                    </motion.h1>
                    <motion.p 
                        className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto shadow-text"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                    >
                        A space for inspiration, creativity, and personal growth.
                    </motion.p>
                </div>
            </motion.div>
            
            <div className="p-6 md:p-10 -mt-24">
                {/* For You Carousel */}
                <motion.section 
                    className="mb-12"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.7 }}
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 px-2">Curated For You</h2>
                    <div className="flex overflow-x-auto space-x-6 pb-4">
                        {forYouItems.map((item, index) => (
                             <motion.div 
                                key={index} 
                                className="flex-shrink-0 w-80 cursor-pointer"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1 + index * 0.2 }}
                                onClick={item.action}
                            >
                                <Card 
                                    className="bg-white/70 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
                                >
                                    <CardContent className="p-6 flex flex-col flex-grow">
                                        <item.icon className="w-8 h-8 text-emerald-600 mb-4" />
                                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex-grow">{item.title}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                                        <div className="mt-auto text-emerald-600 font-semibold flex items-center group">
                                            Explore Now <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>


                {/* Main Navigation */}
                <motion.div 
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {tabs.map((tab) => (
                        <FeatureCard
                            key={tab.id}
                            icon={tab.icon}
                            title={tab.label}
                            description={tab.description}
                            onClick={() => setActiveTab(tab.id)}
                            bgColor={tab.color}
                            textColor="text-white"
                            isActive={activeTab === tab.id}
                        />
                    ))}
                </motion.div>

                {/* Content Area */}
                <div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="mt-8"
                        >
                            {activeTab === 'news' && <NewsFeed />}
                            {activeTab === 'videos' && (
                                <Card className="flex flex-col items-center justify-center text-center p-12 bg-white/70 backdrop-blur-md border-0 shadow-lg">
                                    <div className="p-4 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full mb-6 shadow-lg">
                                        <Video className="w-12 h-12 text-white animate-pulse" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">Powerful Stories on the Way!</h3>
                                    <p className="text-gray-600 mt-2 max-w-md">
                                        Our curated collection of inspirational videos is coming soon. Prepare to be moved and motivated.
                                    </p>
                                </Card>
                            )}
                            {activeTab === 'projects' && (
                                <Card className="flex flex-col items-center justify-center text-center p-12 bg-white/70 backdrop-blur-md border-0 shadow-lg">
                                    <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-6 shadow-lg">
                                        <Lightbulb className="w-12 h-12 text-white animate-pulse" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">New Ideas Brewing!</h3>
                                    <p className="text-gray-600 mt-2 max-w-md">
                                        Our Creative Projects showcase is under construction. Get ready for a dose of inspiration!
                                    </p>
                                </Card>
                            )}
                            {activeTab === 'garden' && <GardenPlanner />}
                            {activeTab === 'favorites' && <MyFavorites />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    </div>
  );
}

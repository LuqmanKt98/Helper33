
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookHeart, Sparkles, Infinity as InfinityIcon, BookOpen, Search, Archive, ClipboardCheck, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import GuestPrompt from '@/components/common/GuestPrompt';
import SEO from '@/components/SEO';

const journalModules = [
  {
    title: 'Gratitude Journal',
    description: "Cultivate joy and mindfulness by reflecting on what you're thankful for each day.",
    icon: <Sparkles className="w-8 h-8 text-amber-500" />,
    url: createPageUrl('GratitudeJournal'),
    color: 'amber',
  },
  {
    title: 'Infinity Journal',
    description: 'A 21-day guided journey to navigate the complexities of grief and loss with compassion.',
    icon: <InfinityIcon className="w-8 h-8 text-rose-500" />,
    url: createPageUrl('InfinityJournal'),
    color: 'rose',
  },
  {
    title: 'Heart Shift Journal',
    description: 'A dedicated space to shift your perspective, find comfort, and journal through life\'s changes.',
    icon: <BookHeart className="w-8 h-8 text-purple-500" />,
    url: createPageUrl('HeartShiftJournal'),
    color: 'purple',
  },
];

const writingTools = [
  {
    title: 'Vision Board',
    description: 'Visualize your dreams and goals with beautiful vision boards and affirmations.',
    icon: <ClipboardCheck className="w-7 h-7 text-indigo-500" />,
    url: createPageUrl('VisionBoard'),
    color: 'indigo',
  },
  {
    title: 'Memory Vault',
    description: 'Preserve and cherish your most precious memories in your personal vault.',
    icon: <Archive className="w-7 h-7 text-blue-500" />,
    url: createPageUrl('MemoryVault'),
    color: 'blue',
  },
  {
    title: 'Gentle Flow Planner',
    description: 'A therapeutic daily planner with free-form notes and to-dos tailored to your energy.',
    icon: <PenTool className="w-7 h-7 text-teal-500" />,
    url: createPageUrl('GentleFlowPlanner'),
    color: 'teal',
  },
];

export default function JournalStudio() {
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const handleJournalClick = (journalUrl) => {
    if (!user) {
      setShowGuestPrompt(true);
      return;
    }
    
    navigate(journalUrl);
  };

  return (
    <>
      <SEO 
        title="Journal Studio - Helper33 | Guided Therapeutic Journaling"
        description="Access multiple guided journals including Infinity Journal, Gratitude Journal, and Heart Shift Journal. AI-powered prompts for healing and reflection."
        keywords="therapeutic journaling, guided journal, grief journal, gratitude journal, AI journal prompts, healing journal, reflection journal"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
        {/* Guest Prompt Modal */}
        <GuestPrompt 
          isOpen={showGuestPrompt}
          onClose={() => setShowGuestPrompt(false)}
          action="save your journal entries"
        />

        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-purple-100 mb-4 shadow-sm">
                <PenTool className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">The Writing Studio</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
                Your Sacred Writing Space
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Choose a guided journal, create vision boards, preserve memories, or write freely. Your thoughts matter.
              </p>
            </motion.div>
          </header>

          <main className="space-y-12">
            {/* Guided Journals Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-purple-600" />
                Guided Journals
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {journalModules.map((journal, index) => (
                  <motion.div
                    key={journal.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="h-full"
                  >
                    <Card className={`group bg-white/70 backdrop-blur-md border-0 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full overflow-hidden border-t-4 border-${journal.color}-400`}>
                      <CardHeader className="flex-shrink-0">
                        <div className="flex items-center gap-4">
                          <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br from-${journal.color}-100 to-white rounded-2xl flex items-center justify-center`}>
                            {journal.icon}
                          </div>
                          <CardTitle className="text-xl font-bold text-gray-800">{journal.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <CardDescription className="text-gray-600">{journal.description}</CardDescription>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          onClick={() => handleJournalClick(journal.url)}
                          className={`w-full bg-${journal.color}-500 hover:bg-${journal.color}-600 text-white font-semibold group`}
                        >
                          Begin Journey
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Creative Writing Tools Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <PenTool className="w-6 h-6 text-indigo-600" />
                Creative Writing & Planning Tools
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {writingTools.map((tool, index) => (
                  <motion.div
                    key={tool.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                    whileHover={{ y: -5 }}
                  >
                    <Link to={tool.url}>
                      <Card className={`group bg-white/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full border-l-4 border-${tool.color}-400 cursor-pointer`}>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br from-${tool.color}-100 to-white rounded-xl flex items-center justify-center`}>
                              {tool.icon}
                            </div>
                            <CardTitle className="text-lg font-bold text-gray-800">{tool.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-600 text-sm">{tool.description}</CardDescription>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Journal History Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center"
            >
              <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-0 shadow-lg">
                <CardContent className="p-8">
                  <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Revisit Your Thoughts</h2>
                  <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                    Explore your complete journal history. Search, filter, and reflect on your personal growth over time.
                  </p>
                  <Link to={createPageUrl('JournalHistory')}>
                    <Button size="lg" variant="outline" className="bg-white/70 backdrop-blur-sm shadow-md hover:bg-white text-gray-700 hover:text-gray-900 border-gray-300">
                      <Search className="w-5 h-5 mr-2" />
                      View All Entries
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.section>
          </main>
        </div>
      </div>
    </>
  );
}

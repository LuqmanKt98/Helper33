import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Waves, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import SoundscapeStudio from '@/components/soundscapes/SoundscapeStudio';
import CreativeHub from '@/components/games/CreativeHub';

export default function MindfulTools() {
  const [activeTab, setActiveTab] = useState('soundscapes');

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to={createPageUrl('MindfulnessHub')}>
            <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Mindfulness Hub
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Mindful Tools
          </h1>
          <p className="text-gray-600 text-lg">
            Therapeutic soundscapes and creative expression tools
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-lg">
            <TabsTrigger 
              value="soundscapes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl"
            >
              <Waves className="w-4 h-4 mr-2" />
              Therapeutic Soundscapes
            </TabsTrigger>
            <TabsTrigger 
              value="creative"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl"
            >
              <Palette className="w-4 h-4 mr-2" />
              Creative Hub
            </TabsTrigger>
          </TabsList>

          <TabsContent value="soundscapes">
            <SoundscapeStudio />
          </TabsContent>

          <TabsContent value="creative">
            <CreativeHub />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
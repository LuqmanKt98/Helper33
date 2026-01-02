import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Baby,
  Sparkles,
  History
} from 'lucide-react';
import { motion } from 'framer-motion';
import { differenceInWeeks, format, parseISO } from 'date-fns';
import BabyCareTracker from './BabyCareTracker';
import BabyCareHistory from './BabyCareHistory';
import AIBabyCareInsights from './AIBabyCareInsights';
import DevelopmentalMilestones from './DevelopmentalMilestones';
import BabyMilestones from './BabyMilestones';

export default function BabyCareDashboard({ pregnancyData }) {
  const [activeTab, setActiveTab] = useState('tracker');
  const [selectedBaby, setSelectedBaby] = useState('all');

  if (!pregnancyData?.birth_date) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-12 text-center">
          <Baby className="w-16 h-16 text-pink-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Baby Data Yet</h3>
          <p className="text-gray-600">
            Complete your pregnancy tracking to enable baby care features.
          </p>
        </CardContent>
      </Card>
    );
  }

  const birthDate = parseISO(pregnancyData.birth_date);
  const babyAge = differenceInWeeks(new Date(), birthDate);
  const babies = pregnancyData?.babies || [];
  const isMultipleBirth = pregnancyData?.is_multiple_birth && babies.length > 0;
  const babyName = babies[0]?.baby_name || pregnancyData?.baby_name || 'Baby';

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white border-0 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Baby className="w-7 h-7" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {isMultipleBirth ? 'Your Babies' : `${babyName}'s Care`}
                </h2>
                <p className="text-white/90 text-sm">
                  {babyAge} weeks old • Born {format(birthDate, 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Baby Selector for Multiple Birth */}
      {isMultipleBirth && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">Select Baby:</span>
              <Button
                size="sm"
                variant={selectedBaby === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedBaby('all')}
              >
                All Babies
              </Button>
              {babies.map((baby) => (
                <Button
                  key={baby.baby_id}
                  size="sm"
                  variant={selectedBaby === baby.baby_id ? 'default' : 'outline'}
                  onClick={() => setSelectedBaby(baby.baby_id)}
                >
                  {baby.baby_name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <AIBabyCareInsights pregnancyData={pregnancyData} selectedBaby={selectedBaby} />

      {/* Developmental Milestones Info */}
      <DevelopmentalMilestones babyAge={babyAge} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-lg">
          <TabsTrigger 
            value="tracker"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white rounded-xl"
          >
            <Baby className="w-4 h-4 mr-2" />
            Daily Care
          </TabsTrigger>
          <TabsTrigger 
            value="milestones"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Milestones
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl"
          >
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="mt-6">
          <BabyCareTracker 
            babyName={babyName}
            birthDate={pregnancyData.birth_date}
            pregnancyData={pregnancyData}
            selectedBaby={selectedBaby}
          />
        </TabsContent>

        <TabsContent value="milestones" className="mt-6">
          <BabyMilestones 
            pregnancyData={pregnancyData}
            selectedBaby={selectedBaby}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <BabyCareHistory 
            babyName={babyName}
            birthDate={pregnancyData.birth_date}
            pregnancyData={pregnancyData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
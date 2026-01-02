
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Baby, BookOpen, History } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PostpartumInsights from './PostpartumInsights';
import BabyCareHistory from './BabyCareHistory';
import { Badge } from '@/components/ui/badge'; // Import Badge component
import AIBabyCareInsights from './AIBabyCareInsights';
import BabySelector from './BabySelector';
import DevelopmentalMilestones from './DevelopmentalMilestones';

export default function PostpartumDashboard({ pregnancyData }) {
  const [activeTab, setActiveTab] = useState('insights');
  const [selectedBaby, setSelectedBaby] = useState('all');

  const birthDate = pregnancyData?.birth_date ? new Date(pregnancyData.birth_date) : null;
  const today = new Date();
  const daysPostpartum = birthDate ? differenceInDays(today, birthDate) : 0;
  const weeksPostpartum = Math.floor(daysPostpartum / 7);
  
  const babies = pregnancyData?.babies || [];
  const isMultipleBirth = pregnancyData?.is_multiple_birth && babies.length > 0;

  // Fetch postpartum milestones
  const { data: milestones = [] } = useQuery({
    queryKey: ['postpartum-milestones', weeksPostpartum],
    queryFn: async () => {
      if (!birthDate || weeksPostpartum < 0 || weeksPostpartum > 52) return [];
      const data = await base44.entities.PostpartumMilestone.filter({
        week_number: weeksPostpartum
      });
      return data;
    },
    enabled: !!birthDate
  });

  if (!birthDate) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
        <CardContent className="p-12 text-center">
          <Baby className="w-16 h-16 text-blue-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to Postpartum Care</h3>
          <p className="text-gray-600 mb-6">
            Once your baby arrives, go to the <strong>Pregnancy</strong> tab and click <strong>"Baby Born!"</strong> to log the birth date.
            This will unlock postpartum care tools, feeding trackers, and weekly insights for your first year!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-pink-400 to-rose-500 text-white border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center">
            {isMultipleBirth ? (
              <div className="flex justify-center gap-2 mb-4">
                {babies.map(baby => (
                  <div
                    key={baby.baby_id}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white/20 backdrop-blur-sm"
                  >
                    {baby.emoji}
                  </div>
                ))}
              </div>
            ) : (
              <Baby className="w-16 h-16 mx-auto mb-4 opacity-90" />
            )}
            
            <h2 className="text-4xl font-bold mb-2">
              Week {weeksPostpartum} Postpartum
            </h2>
            <p className="text-pink-100 text-lg mb-4">
              {daysPostpartum} days with your little {babies.length > 1 ? 'ones' : 'one'}
            </p>
            
            {isMultipleBirth ? (
              <div className="flex flex-wrap justify-center gap-2">
                {babies.map(baby => (
                  <Badge 
                    key={baby.baby_id}
                    className="text-white text-lg"
                    style={{ backgroundColor: baby.color }}
                  >
                    {baby.emoji} {baby.baby_name}
                  </Badge>
                ))}
              </div>
            ) : (
              pregnancyData.baby_name && (
                <p className="text-2xl font-semibold text-white/90">
                  💕 {pregnancyData.baby_name}
                </p>
              )
            )}
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mt-4">
              <p className="text-sm text-pink-100 mb-1">Born</p>
              <p className="text-xl font-bold">
                {format(birthDate, 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Baby Selector for Multiple Births */}
      {isMultipleBirth && babies.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardContent className="p-4">
            <BabySelector
              babies={babies}
              selectedBaby={selectedBaby}
              onSelect={setSelectedBaby}
              showAll={true}
            />
          </CardContent>
        </Card>
      )}

      {/* AI Insights - NEW! */}
      <AIBabyCareInsights 
        pregnancyData={pregnancyData}
        selectedBaby={selectedBaby}
      />

      {/* Developmental Milestones - NEW! */}
      <DevelopmentalMilestones 
        pregnancyData={pregnancyData}
        trackingMode="baby"
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-lg">
          <TabsTrigger 
            value="insights"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white rounded-xl"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Weekly Guide
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-xl"
          >
            <History className="w-4 h-4 mr-2" />
            Baby Care History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-6">
          <PostpartumInsights 
            weeksPostpartum={weeksPostpartum}
            milestones={milestones}
            babyName={pregnancyData.baby_name}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <BabyCareHistory 
            babyName={pregnancyData.baby_name}
            birthDate={pregnancyData.birth_date}
            pregnancyData={pregnancyData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

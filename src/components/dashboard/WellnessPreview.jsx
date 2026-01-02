import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, Droplets, Smile, Meh, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/components/Translations';

const MoodIcon = ({ rating }) => {
    if (rating > 7) return <Smile className="w-6 h-6 text-green-500" />;
    if (rating > 4) return <Meh className="w-6 h-6 text-yellow-500" />;
    return <Frown className="w-6 h-6 text-red-500" />;
}

export default function WellnessPreview() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { t } = useTranslation(user);

  const { data: todayWellness } = useQuery({
    queryKey: ['todayWellness'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const entries = await base44.entities.WellnessEntry.filter({ date: today });
      return entries[0] || null;
    }
  });

  if (!todayWellness) return null;

  const waterGoal = user?.wellness_settings?.water_goal || 8;
  const waterProgress = todayWellness.water_intake ? (todayWellness.water_intake / waterGoal) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="col-span-12 md:col-span-6 lg:col-span-4"
    >
      <div data-card className="h-full p-6 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-foreground">{t('home.wellnessTracker')}</h3>
        </div>
        
        <div className="flex-grow space-y-4 mb-4">
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-3">
                <MoodIcon rating={todayWellness.mood_rating} />
                <p className="font-semibold text-primary">{t('dashboard.todaysMood')}</p>
            </div>
            <p className="font-bold text-xl text-primary">{todayWellness.mood_rating}/10</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <p className="font-semibold text-primary">{t('dashboard.hydration')}</p>
                </div>
                <p className="text-sm font-medium text-secondary-foreground">{todayWellness.water_intake || 0} / {waterGoal} {t('dashboard.glasses')}</p>
            </div>
            <Progress value={waterProgress} className="h-2" />
          </div>
        </div>
        
        <Link to={createPageUrl('Wellness')}>
            <Button variant="ghost" className="w-full justify-center text-muted-foreground hover:text-primary-foreground">
                {t('dashboard.viewFullTracker')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
        </Link>
      </div>
    </motion.div>
  );
}
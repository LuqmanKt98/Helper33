
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, Sparkles, Award, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/components/Translations';

export default function MindfulnessPreview() {
  const { data: user } = useQuery({
    queryKey: ['userMe'],
    queryFn: () => base44.auth.me()
  });

  const { t } = useTranslation(user);

  const { data: badges } = useQuery({
    queryKey: ['userBadges'],
    queryFn: () => base44.entities.UserBadge.list(),
    enabled: !!user
  });

  const streak = user?.mindful_streak?.current || 0;
  const longestStreak = user?.mindful_streak?.longest || 0;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1">
        <CardHeader className="bg-white/95">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                <Wind className="w-5 h-5 text-white" />
              </div>
              <span>{t('dashboard.mindfulness')}</span>
            </div>
            <Link to={createPageUrl('MindfulnessHub')}>
              <Button variant="ghost" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
      </div>

      <CardContent className="p-6">
        {streak > 0 ? (
          <div className="space-y-4">
            <motion.div
              className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-700">{streak}</div>
                <div className="text-sm text-yellow-600">{t('dashboard.dayStreak')}</div>
              </div>
            </motion.div>

            {longestStreak > streak && (
              <div className="text-center text-sm text-gray-600">
                {t('dashboard.personalBest')} {longestStreak} {t('dashboard.days')} 🏆
              </div>
            )}

            {badges && badges.length > 0 && (
              <div className="flex items-center justify-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">{badges.length} {t('dashboard.badgesEarned')}</span>
              </div>
            )}

            <Link to={createPageUrl('MindfulnessHub')}>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
                {t('dashboard.continuePractice')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-gray-600">
              {t('dashboard.startMindfulness')}
            </div>
            <Link to={createPageUrl('MindfulnessHub')}>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
                {t('dashboard.beginPractice')}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

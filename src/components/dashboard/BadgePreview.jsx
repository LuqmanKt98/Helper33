
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Trophy, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/components/Translations';

export default function BadgePreview() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { t } = useTranslation(user);

  const { data: recentBadges = [] } = useQuery({
    queryKey: ['recent-badges'],
    queryFn: () => base44.entities.UserBadge.filter({}, '-earned_at', 6),
  });

  const eventStats = user?.gamification_stats?.events_attended || 0;
  const eventMessages = user?.gamification_stats?.event_chat_messages || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="col-span-12 md:col-span-6 lg:col-span-4"
    >
      <div className="h-full p-6 flex flex-col bg-white rounded-xl border border-gray-200 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{t('dashboard.achievements')}</h3>
        </div>

        {(eventStats > 0 || eventMessages > 0) && (
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">{t('dashboard.eventEngagement')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-white/60 rounded">
                <div className="font-bold text-purple-700">{eventStats}</div>
                <div className="text-gray-600">{t('dashboard.attended')}</div>
              </div>
              <div className="text-center p-2 bg-white/60 rounded">
                <div className="font-bold text-purple-700">{eventMessages}</div>
                <div className="text-gray-600">{t('dashboard.messages')}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-grow">
          {recentBadges.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {recentBadges.slice(0, 6).map((badge, idx) => {
                const gradientFrom = badge.badge_gradient?.from || 'purple-500';
                const gradientTo = badge.badge_gradient?.to || 'pink-500';
                
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative"
                  >
                    <div className={`aspect-square bg-gradient-to-br from-${gradientFrom} to-${gradientTo} rounded-xl flex items-center justify-center text-3xl shadow-lg`}>
                      {badge.badge_icon}
                    </div>
                    {badge.is_new && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse">
                        !
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-600">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">{t('dashboard.completeActivities')}</p>
            </div>
          )}
        </div>
        
        <Link to={createPageUrl('GamificationDashboard')}>
          <Button variant="ghost" className="w-full mt-4 justify-center text-gray-600 hover:text-gray-900">
            {t('dashboard.viewAllBadges')} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

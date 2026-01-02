
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle, Clock, Zap, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/components/Translations';

export default function WellnessPlanPreview() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => base44.entities.User.get('me'),
  });

  const { t } = useTranslation(user);

  const { data: activePlans = [] } = useQuery({
    queryKey: ['active-wellness-plans'],
    queryFn: async () => {
      const plans = await base44.entities.WellnessPlan.filter(
        { status: 'active' },
        '-generated_for_date',
        1
      );
      return plans;
    }
  });

  const activePlan = activePlans[0];

  const { data: planSuggestions = [] } = useQuery({
    queryKey: ['plan-suggestions', activePlan?.id],
    queryFn: async () => {
      if (!activePlan) return [];
      return base44.entities.WellnessPlanSuggestion.filter({
        plan_id: activePlan.id,
        status: 'pending'
      }, '', 3);
    },
    enabled: !!activePlan
  });

  if (!activePlan) return null;

  const acceptedCount = activePlan.accepted_suggestions || 0;
  const totalCount = activePlan.total_suggestions || 0;
  const progressPercent = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;

  const eventStats = user?.gamification_stats?.events_attended || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="col-span-12 md:col-span-6 lg:col-span-4"
    >
      <div data-card="true" className="h-full p-6 flex flex-col bg-white rounded-xl border border-gray-200 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{t('dashboard.aiWellnessPlan')}</h3>
        </div>

        {/* Event Participation Highlight */}
        {eventStats > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-900">{t('dashboard.communityActive')}</span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">{eventStats}</div>
              <div className="text-xs text-gray-600">{t('dashboard.eventsAttended')}</div>
            </div>
          </div>
        )}
        
        <div className="flex-grow space-y-3 mb-4">
          <div className="p-3 bg-secondary rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-primary text-sm">{activePlan.plan_name}</p>
              <Badge variant="outline" className="text-xs">
                {acceptedCount}/{totalCount}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-secondary-foreground">{progressPercent}% {t('dashboard.completed')}</p>
          </div>

          {planSuggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-secondary-foreground font-semibold">{t('dashboard.pendingSuggestions')}</p>
              {planSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="flex items-start gap-2 p-2 bg-secondary rounded-md">
                  <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary line-clamp-1">{suggestion.title}</p>
                    {suggestion.estimated_duration_minutes && (
                      <p className="text-xs text-secondary-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {suggestion.estimated_duration_minutes} {t('dashboard.min')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {planSuggestions.length === 0 && acceptedCount === totalCount && totalCount > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-sm font-semibold text-green-900">{t('dashboard.planComplete')}</p>
            </div>
          )}
        </div>
        
        <Link to={createPageUrl('WellnessPlans')}>
          <Button variant="ghost" className="w-full justify-center text-muted-foreground hover:text-primary-foreground">
            {t('dashboard.viewFullPlan')} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

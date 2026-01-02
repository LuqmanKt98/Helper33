
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Baby,
  TrendingUp,
  Award,
  Target,
  ArrowRight,
  Star,
  Brain
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/components/Translations';

export default function KidsProgressPreview({ childProgress }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { t } = useTranslation(user);

  if (!childProgress || childProgress.length === 0) {
    return null;
  }

  const firstChild = childProgress[0];
  const activeGoals = firstChild.learning_goals?.filter(g => g.status === 'active').length || 0;
  const achievements = firstChild.achievements?.length || 0;

  return (
    <Link to={createPageUrl('ParentDashboard')}>
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        className="h-full"
      >
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all h-full cursor-pointer group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Baby className="w-7 h-7" />
                </motion.div>
                {t('dashboard.kidsProgress')}
              </CardTitle>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardHeader>

          <CardContent className="relative z-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-purple-100">{t('dashboard.tracking')}</span>
                <span className="font-bold text-white text-lg">{firstChild.child_name}</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                  <Award className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{achievements}</div>
                  <div className="text-xs text-purple-100">{t('dashboard.achievements')}</div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                  <Target className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{activeGoals}</div>
                  <div className="text-xs text-purple-100">{t('dashboard.activeGoals')}</div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                  <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{firstChild.overall_progress_score || 0}%</div>
                  <div className="text-xs text-purple-100">Progress</div>
                </div>
              </div>

              {firstChild.strengths?.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs text-purple-100 mb-2">{t('dashboard.topStrengths')}</div>
                  <div className="flex flex-wrap gap-1">
                    {firstChild.strengths.slice(0, 3).map(strength => (
                      <Badge key={strength} className="bg-white/30 text-white border-0 text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <motion.div
                className="flex items-center justify-center gap-2 pt-2 text-sm font-semibold group-hover:gap-3 transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <Brain className="w-4 h-4" />
                {t('dashboard.viewFullDashboard')}
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}

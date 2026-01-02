import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Target, ArrowRight, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/components/Translations';

export default function LifeCoachPreview() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { t } = useTranslation(user);

  if (!user?.life_goals || user.life_goals.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="col-span-12 md:col-span-6 lg:col-span-4"
    >
      <div data-card className="h-full p-6 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-foreground">{t('dashboard.lifeCoach')}</h3>
        </div>
        
        <div className="flex-grow space-y-3 mb-4">
            <p className="text-sm text-secondary-foreground mb-2">{t('dashboard.yourCurrentGoals')}</p>
            {user.life_goals.slice(0, 3).map((goal, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-secondary rounded-md">
                    <Flag className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-primary truncate">{goal}</p>
                </div>
            ))}
        </div>
        
        <Link to={createPageUrl('LifeCoach')}>
            <Button variant="ghost" className="w-full justify-center text-muted-foreground hover:text-primary-foreground">
                {t('dashboard.reviewYourGoals')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
        </Link>
      </div>
    </motion.div>
  );
}
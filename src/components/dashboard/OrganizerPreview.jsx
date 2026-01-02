import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ListChecks, ArrowRight, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/components/Translations';

export default function OrganizerPreview() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { t } = useTranslation(user);

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.filter({ status: { $ne: 'completed' } }, '-due_date', 5)
  });

  if (!tasks || tasks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="col-span-12 md:col-span-6 lg:col-span-4"
    >
      <div data-card className="h-full p-6 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
            <ListChecks className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-foreground">{t('dashboard.lifeOrganizer')}</h3>
        </div>
        
        <div className="flex-grow space-y-3 mb-4">
            <p className="text-sm text-secondary-foreground mb-2">{t('dashboard.nextFewTasks')}</p>
            {tasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-2 bg-secondary rounded-md">
                    <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-primary truncate">{task.title}</p>
                </div>
            ))}
        </div>
        
        <Link to={createPageUrl('Organizer')}>
            <Button variant="ghost" className="w-full justify-center text-muted-foreground hover:text-primary-foreground">
                {t('dashboard.viewAllTasks')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
        </Link>
      </div>
    </motion.div>
  );
}
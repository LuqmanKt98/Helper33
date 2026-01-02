import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { BookHeart, ArrowRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/components/Translations';

export default function JournalPreview() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { t } = useTranslation(user);

  const { data: entries = [] } = useQuery({
    queryKey: ['recentJournalEntries'],
    queryFn: () => base44.entities.UserJournalEntry.list('-created_date', 1)
  });

  const latestEntry = entries[0];
  if (!latestEntry) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="col-span-12 md:col-span-6 lg:col-span-4"
    >
      <div data-card className="h-full p-6 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
            <BookHeart className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-foreground">{t('dashboard.digitalJournal')}</h3>
        </div>
        
        <div className="flex-grow space-y-3 mb-4 p-4 bg-secondary rounded-lg">
            <p className="text-sm text-secondary-foreground font-semibold">{t('dashboard.latestEntry')}</p>
            <div className="flex items-start gap-3">
                <Quote className="w-8 h-8 text-gray-300 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-primary truncate">{latestEntry.entry_title || t('dashboard.untitledEntry')}</h4>
                    <p className="text-sm text-secondary-foreground line-clamp-2">{latestEntry.entry_content}</p>
                </div>
            </div>
        </div>
        
        <Link to={createPageUrl('InfinityJournal')}>
            <Button variant="ghost" className="w-full justify-center text-muted-foreground hover:text-primary-foreground">
                {t('dashboard.goToJournal')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
        </Link>
      </div>
    </motion.div>
  );
}
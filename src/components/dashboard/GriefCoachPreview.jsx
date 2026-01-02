import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight, Feather, Library } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import GriefBlogSection from '@/components/grief/GriefBlogSection';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/components/Translations';

export default function GriefCoachPreview() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { t } = useTranslation(user);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-0 shadow-lg h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500" />
              {t('dashboard.griefLossSupport')}
            </span>
            <Button asChild size="sm" variant="ghost">
              <Link to={createPageUrl('GriefCoach')}>
                {t('dashboard.viewAll')} <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <p className="text-gray-700 leading-relaxed">
            {t('dashboard.compassionateAI')}
          </p>

          <div className="grid grid-cols-1 gap-3">
            <Button asChild variant="outline" className="h-auto py-3 justify-start w-full">
              <Link to={createPageUrl('GriefCoach')}>
                <Heart className="w-4 h-4 mr-2 text-rose-500 flex-shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <div className="font-semibold text-sm">{t('dashboard.griefCoachSupport')}</div>
                  <div className="text-xs text-muted-foreground truncate">{t('dashboard.twentyFourSevenSupport')}</div>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto py-3 justify-start w-full">
              <Link to={createPageUrl('InfinityJournal')}>
                <Feather className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <div className="font-semibold text-sm">{t('dashboard.infinityJournal')}</div>
                  <div className="text-xs text-muted-foreground truncate">{t('dashboard.twentyOneDayGuide')}</div>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto py-3 justify-start w-full">
              <Link to={createPageUrl('MemoryVault')}>
                <Library className="w-4 h-4 mr-2 text-amber-500 flex-shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <div className="font-semibold text-sm">{t('dashboard.memoryVault')}</div>
                  <div className="text-xs text-muted-foreground truncate">{t('dashboard.preserveLove')}</div>
                </div>
              </Link>
            </Button>
          </div>

          {/* Blog Posts Preview */}
          <div className="pt-4 border-t">
            <div className="mb-3">
              <GriefBlogSection limit={2} showHeader={false} />
            </div>
            <div className="text-center">
              <Button asChild variant="link" size="sm" className="text-xs">
                <Link to={createPageUrl('Blog')}>
                  {t('dashboard.readMoreHealingWritings')} <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
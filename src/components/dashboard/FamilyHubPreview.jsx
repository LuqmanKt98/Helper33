import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/components/Translations';

export default function FamilyHubPreview() {
    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => base44.auth.me()
    });

    const { t } = useTranslation(user);

    const { data: events = [] } = useQuery({
        queryKey: ['upcomingFamilyEvents'],
        queryFn: () => base44.entities.FamilyEvent.list('-start_date', 1)
    });

    const { data: updates = [] } = useQuery({
        queryKey: ['recentFamilyUpdates'],
        queryFn: () => base44.entities.FamilyUpdate.list('-created_date', 1)
    });

    const nextEvent = events[0];
    const latestUpdate = updates[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="col-span-12 md:col-span-6 lg:col-span-4"
        >
            <div data-card className="h-full p-6 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{t('dashboard.familyHub')}</h3>
                </div>

                <div className="flex-grow space-y-4 mb-4">
                    {nextEvent && (
                        <div className="p-3 bg-secondary rounded-lg">
                            <p className="text-xs text-secondary-foreground font-semibold uppercase tracking-wider mb-1">{t('dashboard.nextEvent')}</p>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                <div className="truncate">
                                    <p className="text-sm font-bold text-primary truncate">{nextEvent.title}</p>
                                    <p className="text-xs text-secondary-foreground truncate">{new Date(nextEvent.start_date).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {latestUpdate && (
                         <div className="p-3 bg-secondary rounded-lg">
                            <p className="text-xs text-secondary-foreground font-semibold uppercase tracking-wider mb-1">{t('dashboard.latestUpdate')}</p>
                             <div className="flex items-start gap-3">
                                <MessageSquare className="w-5 h-5 text-gray-500 mt-0.5" />
                                <p className="text-sm text-primary line-clamp-2">{latestUpdate.content}</p>
                            </div>
                        </div>
                    )}
                     {!nextEvent && !latestUpdate && (
                         <div className="p-3 bg-secondary rounded-lg text-center">
                            <p className="text-sm text-secondary-foreground">{t('dashboard.connectWithFamily')}</p>
                         </div>
                    )}
                </div>

                <Link to={createPageUrl('Family')}>
                    <Button variant="ghost" className="w-full justify-center text-muted-foreground hover:text-primary-foreground">
                        {t('dashboard.openFamilyHub')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </motion.div>
    );
}
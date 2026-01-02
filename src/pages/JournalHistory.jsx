
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Search, ArrowLeft, BookHeart, Sparkles, Infinity as InfinityIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

const fetchAllEntries = async () => {
    // Fetch all journal types
    return base44.entities.UserJournalEntry.filter({}, '-created_date', 500);
};

const JournalIcon = ({ type }) => {
    switch (type) {
        case 'gratitude': return <Sparkles className="w-4 h-4 text-amber-500" />;
        case 'infinity': return <InfinityIcon className="w-4 h-4 text-rose-500" />;
        case 'heart_shift': return <BookHeart className="w-4 h-4 text-purple-500" />;
        default: return <BookHeart className="w-4 h-4 text-gray-500" />;
    }
};

const JournalBadge = ({ type }) => {
    const styles = {
        gratitude: 'bg-amber-100 text-amber-800 border-amber-200',
        infinity: 'bg-rose-100 text-rose-800 border-rose-200',
        heart_shift: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return (
        <Badge variant="outline" className={`capitalize ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
            <JournalIcon type={type} />
            <span className="ml-1">{type.replace('_', ' ')}</span>
        </Badge>
    );
};

export default function JournalHistory() {
    const { data: entries = [], isLoading } = useQuery({
        queryKey: ['allJournalEntries'],
        queryFn: fetchAllEntries,
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedEntry, setSelectedEntry] = useState(null);

    const filteredEntries = useMemo(() => {
        return entries
            .filter(entry => filterType === 'all' || entry.journal_type === filterType)
            .filter(entry =>
                (entry.entry_title && entry.entry_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (entry.entry_content && entry.entry_content.toLowerCase().includes(searchTerm.toLowerCase()))
            );
    }, [entries, searchTerm, filterType]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <Link to={createPageUrl('JournalStudio')} className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Journal Studio
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-800">Journal History</h1>
                    <p className="text-lg text-gray-500 mt-2">A complete archive of your reflections and moments of growth.</p>
                </header>

                <Card className="bg-white/70 backdrop-blur-md border-0 shadow-md p-4 mb-8 sticky top-4 z-10">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search entries..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by journal type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Journals</SelectItem>
                                <SelectItem value="gratitude">Gratitude</SelectItem>
                                <SelectItem value="infinity">Infinity</SelectItem>
                                <SelectItem value="heart_shift">Heart Shift</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </Card>

                <AnimatePresence>
                    <motion.div layout className="space-y-4">
                        {filteredEntries.length > 0 ? (
                            filteredEntries.map((entry, index) => (
                                <motion.div
                                    key={entry.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    whileHover={{ y: -3 }}
                                >
                                    <Card
                                        onClick={() => setSelectedEntry(entry)}
                                        className="cursor-pointer bg-white/80 hover:bg-white transition-all shadow-sm hover:shadow-lg border"
                                    >
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">{format(parseISO(entry.created_date), 'MMMM d, yyyy')}</p>
                                                <h3 className="font-semibold text-gray-800 truncate">{entry.entry_title || 'Untitled Entry'}</h3>
                                                <p className="text-sm text-gray-600 line-clamp-1 mt-1">{entry.entry_content}</p>
                                            </div>
                                            <div className="ml-4 flex-shrink-0">
                                                <JournalBadge type={entry.journal_type} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20"
                            >
                                <BookHeart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700">No Entries Found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your search or start a new journal entry!</p>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {selectedEntry && (
                    <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
                        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-4">
                                    <JournalBadge type={selectedEntry.journal_type} />
                                    <span className="flex-1">{selectedEntry.entry_title}</span>
                                </DialogTitle>
                                <DialogDescription>
                                    {format(parseISO(selectedEntry.created_date), 'eeee, MMMM d, yyyy')}
                                </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="flex-grow -mx-6 px-6">
                                <div className="prose prose-sm max-w-none whitespace-pre-wrap py-4">
                                    {selectedEntry.entry_content}
                                </div>
                            </ScrollArea>
                            <div className="flex justify-end pt-4">
                                <Button variant="outline" onClick={() => setSelectedEntry(null)}>Close</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
}

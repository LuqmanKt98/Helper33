import React from 'react';
import { Card } from '@/components/ui/card';
import { Image as ImageIcon, Video, Mic, FileText, Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';

const mediaTypeIcon = (type) => {
    switch (type) {
        case 'image': return <ImageIcon className="w-8 h-8 text-amber-300" />;
        case 'video': return <Video className="w-8 h-8 text-amber-300" />;
        case 'audio': return <Mic className="w-8 h-8 text-amber-300" />;
        default: return <FileText className="w-8 h-8 text-amber-300" />;
    }
};

export default function MemoryCard({ memory, onClick }) {
    return (
        <motion.div whileHover={{ y: -6 }} className="h-full">
            <Card 
                className="group cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-slate-800/50 border border-purple-500/20 hover:border-amber-400/70 rounded-2xl flex flex-col h-full backdrop-blur-sm"
                onClick={onClick}
            >
                {memory.media_type === 'image' && memory.media_url ? (
                    <div className="overflow-hidden aspect-w-16 aspect-h-9">
                        <img src={memory.media_url} alt={memory.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                ) : (
                     <div className="h-32 bg-black/20 flex items-center justify-center">
                        <div className="p-4 bg-slate-700/50 rounded-full shadow-inner">
                            {mediaTypeIcon(memory.media_type)}
                        </div>
                    </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-amber-300 truncate">{memory.title || 'Untitled Memory'}</h3>
                    <p className="text-sm text-gray-300 mt-1 flex-grow line-clamp-3">{memory.content}</p>
                    
                    <div className="mt-4 flex flex-col gap-2 text-xs text-gray-400">
                        {memory.memory_date && (
                             <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{format(parseISO(memory.memory_date), 'MMMM d, yyyy')}</span>
                            </div>
                        )}
                        {memory.tags && memory.tags.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5" />
                                <span className="truncate">{memory.tags.join(', ')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
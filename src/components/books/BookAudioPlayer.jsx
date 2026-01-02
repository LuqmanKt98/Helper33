import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, Loader2, Headphones } from 'lucide-react';
import { sectionPageTitles } from './InfinityContent';


export default function BookAudioPlayer({ sectionId, page, totalPages, onPlay, isLoading, isPlaying }) {
  const title = sectionPageTitles[sectionId]?.[page] || "Audio Narration";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto mb-6"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 flex items-center gap-4 border">
        <div className="flex-shrink-0 bg-rose-100 text-rose-600 rounded-full p-2.5">
          <Headphones className="w-5 h-5" />
        </div>
        <div className="flex-grow">
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500">Narrated by Dobry AI</p>
            {totalPages > 1 && <p className="text-xs text-rose-600/80 font-medium">Part {page + 1} of {totalPages}</p>}
          </div>
        </div>
        <Button
          onClick={onPlay}
          variant="ghost"
          size="icon"
          className="rounded-full w-10 h-10 bg-rose-50 hover:bg-rose-100 text-rose-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </Button>
      </div>
    </motion.div>
  );
}
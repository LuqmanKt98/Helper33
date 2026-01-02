import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookHeart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function JournalPromptCard() {
  return (
    <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
          >
            <BookHeart className="w-6 h-6 text-purple-500" />
          </motion.div>
          A Moment for Gratitude
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          End your day on a positive note. Taking a moment to acknowledge the good things in your life can improve your mood and overall well-being.
        </p>
        <Link to={createPageUrl('GratitudeJournal')}>
          <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white group">
            Open Your Gratitude Journal
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
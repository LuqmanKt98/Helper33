import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookPageNavigation({ onPrevious, onNext, isFirstPage, isLastPage }) {
  return (
    <motion.div 
      className="max-w-3xl mx-auto mt-8 flex justify-between items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Button 
        variant="outline" 
        onClick={onPrevious} 
        disabled={isFirstPage}
        className="bg-white/80 backdrop-blur-sm hover:bg-white"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>
      <Button 
        onClick={onNext} 
        disabled={isLastPage}
        className="bg-rose-500 hover:bg-rose-600 text-white"
      >
        Next
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}
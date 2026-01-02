import React from 'react';
import { motion } from 'framer-motion';
import { Quote, BookHeart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function InfinityQuoteCard() {
  return (
    <Link to={createPageUrl('InfinityBook')}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group max-w-md"
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/06cf47a80_infinitybooky.jpg')`
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        
        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Quote Icon */}
          <Quote className="w-8 h-8 text-rose-200/60 mb-3" />
          
          {/* Quote Text */}
          <p className="text-white text-lg italic leading-relaxed mb-3" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            "Infinity is the soul's way of saying, 'I am not done yet.'"
          </p>
          
          {/* Author */}
          <p className="text-rose-200 text-sm font-medium mb-4">
            — Ruby Dobry
          </p>
          
          {/* Book Title & CTA */}
          <div className="flex items-center justify-between border-t border-white/20 pt-4">
            <div className="flex items-center gap-2">
              <BookHeart className="w-5 h-5 text-rose-300" />
              <div>
                <p className="text-white font-semibold text-sm">Ruby's Life Story</p>
                <p className="text-rose-200/80 text-xs">21-Day Journey</p>
              </div>
            </div>
            <div className="text-rose-300 text-sm font-medium group-hover:text-rose-200 transition-colors">
              Read →
            </div>
          </div>
        </div>
        
        {/* Subtle shimmer on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.8 }}
        />
      </motion.div>
    </Link>
  );
}
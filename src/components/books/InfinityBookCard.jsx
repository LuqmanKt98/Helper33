import React from 'react';
import { motion } from 'framer-motion';
import { BookHeart, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function InfinityBookCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={createPageUrl('InfinityBook')}>
        <Card className="overflow-hidden group cursor-pointer border-2 border-rose-200 hover:border-rose-400 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-rose-50 to-pink-50">
          {/* Featured Badge */}
          <div className="absolute top-3 left-3 z-10">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1 text-xs font-bold border border-white/50"
            >
              <Star className="w-3 h-3 fill-current" />
              FEATURED
            </motion.div>
          </div>

          {/* Book Cover Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/06cf47a80_infinitybooky.jpg"
              alt="Infinity Book Cover"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Quote overlay */}
            <div className="absolute inset-0 p-4 flex flex-col justify-end">
              <p className="text-white text-sm italic leading-relaxed" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
                "Infinity is the soul's way of saying, 'I am not done yet.'"
              </p>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-5 space-y-3">
            <div className="flex items-start gap-2">
              <BookHeart className="w-6 h-6 text-rose-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                  Ruby's Life Story
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  A 21-Day Journey Through Grief & Healing
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">
              Experience a profound journey of love, loss, and eternal connections through Ruby's heartfelt narrative.
            </p>

            <Button 
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white group-hover:shadow-lg transition-all"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Read Now
            </Button>
          </div>

          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full"
            animate={{
              x: ['0%', '200%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
        </Card>
      </Link>
    </motion.div>
  );
}
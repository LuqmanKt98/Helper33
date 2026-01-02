import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';

const SURVIVOR_STORIES = [
  { id: 1, story: "I almost ended my life after losing everything in a divorce. I felt like a complete failure. But therapy, medication adjustments, and a support group showed me that pain passes. Today, I volunteer to help others going through divorce. The fact that I stayed alive means I can help someone else stay too.", author: "Sarah, Age 32", yearsLater: 3, hope: "Now I help run a divorce support group and I've never been happier." },
  { id: 2, story: "After my mom died, I couldn't see a future. The grief was unbearable. I called 988 one night when I was planning to end it. The counselor stayed on the phone with me for 2 hours. Three years later, I'm studying to become a crisis counselor myself.", author: "Michael, Age 28", yearsLater: 3, hope: "My mom would be proud of who I'm becoming." },
  { id: 3, story: "I stayed for my dog. It sounds simple, but she needed me. On my darkest day, I looked at her and thought 'who will take care of you?' Now I volunteer at a suicide hotline. I tell people: find one small reason to stay. Just one. Tomorrow, you might find another.", author: "Jessica, Age 45", yearsLater: 7, hope: "I've helped hundreds of people find their 'one reason' to stay." },
  { id: 4, story: "My antidepressant medication was making my suicidal thoughts worse, not better. Once my doctor adjusted it, the thoughts went away completely. It was a side effect, not my reality. If you're on SSRIs and feeling worse, please tell your doctor immediately.", author: "David, Age 35", yearsLater: 2, hope: "Now I advocate for medication monitoring and patient education." },
  { id: 5, story: "I lost my job, my apartment, and felt like I had nothing. I was ready to give up. A friend convinced me to try one more day. Then one more. Small steps led to a new career I actually love. Sometimes 'one more day' is all you need.", author: "Maria, Age 41", yearsLater: 5, hope: "I mentor young professionals now and remind them that setbacks aren't endings." }
];

export default function SurvivorStories({ onClose }) {
  const [currentStory, setCurrentStory] = useState(0);
  const story = SURVIVOR_STORIES[currentStory];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl">
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent">Stories of Hope</h2>
              <Button onClick={onClose} variant="ghost" size="icon"><X className="w-5 h-5" /></Button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={currentStory} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <Heart className="w-8 h-8 text-rose-500 fill-current mb-4" />
                  <p className="text-lg text-gray-800 leading-relaxed mb-4 italic">"{story.story}"</p>
                  <p className="font-semibold">— {story.author}</p>
                  <p className="text-sm text-purple-700 mt-2">{story.yearsLater} years later: {story.hope}</p>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mb-4">
              <Button onClick={() => setCurrentStory((prev) => (prev - 1 + SURVIVOR_STORIES.length) % SURVIVOR_STORIES.length)} variant="outline"><ChevronLeft className="w-4 h-4 mr-2" />Previous</Button>
              <span className="text-sm text-gray-600">{currentStory + 1} of {SURVIVOR_STORIES.length}</span>
              <Button onClick={() => setCurrentStory((prev) => (prev + 1) % SURVIVOR_STORIES.length)} variant="outline">Next<ChevronRight className="w-4 h-4 ml-2" /></Button>
            </div>
            <div className="p-4 bg-rose-50 rounded-lg border-2 border-rose-200">
              <p className="text-sm text-rose-900 font-semibold mb-2">Need to talk to someone right now?</p>
              <div className="flex gap-2">
                <a href="tel:988" className="flex-1"><Button size="sm" className="w-full bg-rose-600 text-white">Call 988</Button></a>
                <a href="sms:741741&body=HOME" className="flex-1"><Button size="sm" className="w-full bg-rose-600 text-white">Text 741741</Button></a>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
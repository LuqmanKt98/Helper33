import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Sparkles, Music, Headphones, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TheVoiceBook() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center p-6">
      <div className="floating-notes">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="note" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${12 + Math.random() * 8}s`
          }}>♪</span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full relative z-10"
      >
        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="p-12 text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="flex justify-center mb-6"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 via-indigo-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                <Mic className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-6 py-3 rounded-full border-2 border-yellow-300 mb-6">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 font-semibold text-lg">Coming Soon!</span>
              </div>
            </motion.div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              The Voice
            </h1>
            <p className="text-lg text-gray-500 mb-6">By Alex Echo</p>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              A profound exploration of the power within each of our voices. This compelling story unravels how our inner voice shapes our destiny and influences the world around us.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              {[
                { icon: Music, text: "Find Your Voice", color: "from-purple-400 to-indigo-500" },
                { icon: Headphones, text: "Listen Within", color: "from-indigo-400 to-blue-500" },
                { icon: Sparkles, text: "Transform Destiny", color: "from-blue-400 to-cyan-500" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (idx * 0.1) }}
                  className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-xl border-2 border-purple-200 mb-8"
            >
              <h4 className="font-bold text-purple-900 mb-2 flex items-center justify-center gap-2">
                <Music className="w-5 h-5" />
                In Development
              </h4>
              <p className="text-purple-700 text-sm leading-relaxed">
                Alex Echo is crafting this transformative journey with care. The story will feature an immersive audio experience, bringing the power of voice to life in a unique and meaningful way. Stay tuned for updates! 🎵
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button
                onClick={() => navigate(createPageUrl('BookStudio'))}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Book Studio
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <style>
        {`
          .floating-notes {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
          }
          
          .note {
            position: absolute;
            top: -50px;
            font-size: 24px;
            opacity: 0.3;
            animation: float-note linear infinite;
            color: #8b5cf6;
          }
          
          @keyframes float-note {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 0.3;
            }
            90% {
              opacity: 0.3;
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
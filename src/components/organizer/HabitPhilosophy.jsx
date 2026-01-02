import React from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, TrendingUp } from "lucide-react";

export default function HabitPhilosophy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-100 shadow-sm mb-6"
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-4 right-8 text-4xl opacity-20"
      >
        🌿
      </motion.div>

      <motion.div
        animate={{
          y: [10, -10, 10],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-4 left-8 text-3xl opacity-20"
      >
        ✨
      </motion.div>

      <div className="relative px-6 py-5 md:px-8 md:py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Icon */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex-shrink-0"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-white fill-white" />
            </div>
          </motion.div>

          {/* Content */}
          <div className="flex-1">
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl font-bold text-emerald-900 mb-2 flex items-center gap-2"
            >
              <span>🌿 Build Consistency, Not Pressure</span>
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-emerald-800 text-sm md:text-base leading-relaxed mb-2"
            >
              Your habits tell your story. Track, reflect, and grow with compassion.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-emerald-700"
            >
              <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">Every checkmark is progress</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">Every moment counts</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 origin-left"
      />
    </motion.div>
  );
}
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AIEncouragement } from "@/entities/all";
import { useNotifications } from "@/components/SoundManager";

export default function EncouragementFeed({ className = "" }) {
  const { playSound } = useNotifications();
  const [encouragements, setEncouragements] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadEncouragements();
    
    // Poll for new encouragements every 30 seconds
    const interval = setInterval(loadEncouragements, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadEncouragements = async () => {
    try {
      const today = new Date();
      const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      const allEncouragements = await AIEncouragement.list('-created_date', 20);
      const recentOnes = allEncouragements.filter(e => 
        new Date(e.created_date) >= threeDaysAgo
      );
      
      setEncouragements(recentOnes);
    } catch (error) {
      console.error("Error loading encouragements:", error);
    }
  };

  const markAsRead = async (encouragementId) => {
    try {
      await AIEncouragement.update(encouragementId, { is_read: true });
      playSound('click');
      loadEncouragements();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const getTriggerIcon = (trigger) => {
    switch (trigger) {
      case "onCheckIn": return "✅";
      case "onStreakMilestone": return "🔥";
      case "onMissedDay": return "🌱";
      case "onFamilyCheer": return "👨‍👩‍👧";
      case "onWeeklyReview": return "📊";
      case "onGoalChange": return "🎯";
      default: return "💚";
    }
  };

  const getToneColor = (tone) => {
    switch (tone) {
      case "calm": return "from-green-400 to-emerald-500";
      case "hype": return "from-orange-400 to-red-500";
      case "playful": return "from-purple-400 to-pink-500";
      default: return "from-blue-400 to-indigo-500";
    }
  };

  const unreadCount = encouragements.filter(e => !e.is_read).length;
  const displayedEncouragements = showAll ? encouragements : encouragements.slice(0, 3);

  if (encouragements.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(20, 184, 166, 0.15) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
        </div>

        <CardContent className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  💚 AI Encouragement
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {unreadCount} new
                    </Badge>
                  )}
                </h3>
                <p className="text-xs text-gray-600">
                  Coach, not critic — Always compassionate
                </p>
              </div>
            </div>
          </div>

          {/* Encouragement Cards */}
          <div className="space-y-3">
            <AnimatePresence>
              {displayedEncouragements.map((encouragement, index) => (
                <motion.div
                  key={encouragement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative ${
                    encouragement.is_read ? 'opacity-75' : ''
                  }`}
                >
                  <div className={`bg-gradient-to-r ${getToneColor(encouragement.tone)} rounded-xl p-4 text-white shadow-md`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">
                            {getTriggerIcon(encouragement.trigger_type)}
                          </span>
                          <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                            {encouragement.tone}
                          </Badge>
                          {encouragement.streak_days && (
                            <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                              {encouragement.streak_days} day streak
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm leading-relaxed font-medium mb-2">
                          {encouragement.message}
                        </p>
                        
                        {encouragement.habit_name && (
                          <p className="text-xs opacity-90">
                            For: {encouragement.habit_name}
                          </p>
                        )}
                      </div>

                      {!encouragement.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead(encouragement.id)}
                          className="text-white hover:bg-white/20 flex-shrink-0"
                          title="Mark as read"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
                      <span className="text-xs opacity-75">
                        {new Date(encouragement.created_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Show More/Less */}
          {encouragements.length > 3 && (
            <div className="text-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="text-teal-700 hover:text-teal-900 hover:bg-teal-100"
              >
                {showAll ? 'Show less' : `Show ${encouragements.length - 3} more`}
              </Button>
            </div>
          )}

          {/* System Info */}
          <div className="mt-4 pt-4 border-t border-teal-200">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-700">
              <div className="font-semibold mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-teal-600" />
                How it works:
              </div>
              <ul className="space-y-1 opacity-80">
                <li>• Auto messages on check-ins, milestones, & weekly reviews</li>
                <li>• Respects quiet hours (9pm–7am) & 2/day limit</li>
                <li>• Tone adapts to your mood & preferences</li>
                <li>• Family cheers trigger celebrations 👨‍👩‍👧</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
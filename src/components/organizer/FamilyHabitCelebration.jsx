import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Heart, Sparkles, Users, MessageCircle, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HabitCompletion, HabitTracker, FamilyMember, HabitEncouragement } from "@/entities/all";
import { useNotifications } from "@/components/SoundManager";

const reactionOptions = [
  { value: "heart", emoji: "❤️", label: "Great job!", color: "from-red-400 to-rose-500" },
  { value: "star", emoji: "🌟", label: "Keep it up!", color: "from-yellow-400 to-orange-500" },
  { value: "flower", emoji: "💐", label: "You inspire me!", color: "from-purple-400 to-pink-500" },
  { value: "party", emoji: "🎉", label: "So proud of you!", color: "from-blue-400 to-indigo-500" }
];

const weeklyTips = [
  {
    title: "Habits Grow Stronger with Connection",
    statistic: "2x more likely",
    detail: "Families who celebrate together stay consistent",
    tip: "Try ending your day with gratitude: \"What's one small win we're thankful for today?\"",
    emoji: "💡"
  },
  {
    title: "Shared Goals Create Bonds",
    statistic: "3x more",
    detail: "motivation when family members support each other",
    tip: "Create a family habit board. Celebrate each checkmark together at dinner time.",
    emoji: "🤝"
  },
  {
    title: "Lead by Example",
    statistic: "65% of kids",
    detail: "adopt habits they see parents practicing consistently",
    tip: "Want your kids to read more? Let them see you reading. Actions speak louder than words.",
    emoji: "👨‍👩‍👧"
  },
  {
    title: "Presence Over Perfection",
    statistic: "80% of families",
    detail: "report feeling closer when they reflect together daily",
    tip: "Ask \"What felt meaningful today?\" instead of \"Did you complete everything?\"",
    emoji: "🌸"
  }
];

export default function FamilyHabitCelebration({ currentUser, className = "" }) {
  const { playSound, showNotification } = useNotifications();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [todayFamilyCompletions, setTodayFamilyCompletions] = useState([]);
  const [encouragements, setEncouragements] = useState([]);
  const [showReactionDialog, setShowReactionDialog] = useState(false);
  const [selectedCompletion, setSelectedCompletion] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    loadFamilyData();
    
    // Rotate tip weekly
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const weekNumber = Math.floor(diff / oneWeek);
    setCurrentTipIndex(weekNumber % weeklyTips.length);
  }, []);

  const loadFamilyData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [members, completions, allHabits, allEncouragements] = await Promise.all([
        FamilyMember.list(),
        HabitCompletion.filter({ completion_date: today }),
        HabitTracker.list(),
        HabitEncouragement.filter({ completion_date: today })
      ]);

      setFamilyMembers(members);
      setEncouragements(allEncouragements);

      // Enrich completions with habit details and member info
      const enrichedCompletions = await Promise.all(
        completions.map(async (completion) => {
          const habit = allHabits.find(h => h.id === completion.habit_id);
          const member = members.find(m => m.name === completion.completed_by);
          
          // Get encouragements for this completion
          const completionEncouragements = allEncouragements.filter(
            e => e.habit_completion_id === completion.id
          );

          // Calculate streak
          const habitCompletions = await HabitCompletion.filter({ habit_id: completion.habit_id });
          const sortedDates = habitCompletions
            .map(c => new Date(c.completion_date))
            .sort((a, b) => b - a);
          
          let streak = 1;
          for (let i = 0; i < sortedDates.length - 1; i++) {
            const diff = (sortedDates[i] - sortedDates[i + 1]) / (1000 * 60 * 60 * 24);
            if (diff <= 1) {
              streak++;
            } else {
              break;
            }
          }

          return {
            ...completion,
            habit_name: habit?.habit_name || "Unknown Habit",
            habit_category: habit?.category,
            member_name: member?.name || completion.completed_by,
            current_streak: streak,
            encouragements: completionEncouragements
          };
        })
      );

      setTodayFamilyCompletions(enrichedCompletions);
    } catch (error) {
      console.error("Error loading family data:", error);
    }
  };

  const handleReaction = async (reactionType, label) => {
    if (!selectedCompletion) return;

    try {
      await HabitEncouragement.create({
        habit_completion_id: selectedCompletion.id,
        from_member_name: currentUser?.full_name || "Family Member",
        reaction_type: reactionType,
        message: customMessage || label,
        completion_date: new Date().toISOString().split('T')[0]
      });

      playSound('success');
      showNotification('💚 Encouragement Sent!', {
        body: `You cheered on ${selectedCompletion.member_name}!`
      });

      setShowReactionDialog(false);
      setSelectedCompletion(null);
      setCustomMessage("");
      loadFamilyData();
    } catch (error) {
      console.error("Error sending encouragement:", error);
      playSound('error');
    }
  };

  const currentTip = weeklyTips[currentTipIndex];

  if (todayFamilyCompletions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(219, 39, 119, 0.1) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-6 right-8 text-4xl opacity-20"
        >
          👨‍👩‍👧
        </motion.div>

        <CardHeader className="relative pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-800">
                👨‍👩‍👧 Family Habits & Encouragement
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                💚 Shared Progress: Together, every small step matters
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Celebration Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-100"
          >
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              Celebrate family milestones, daily wins, and new routines — one checkmark at a time.
            </p>
          </motion.div>

          {/* Family Progress */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-800">
                👀 See who's growing today:
              </h3>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {todayFamilyCompletions.map((completion, index) => (
                  <motion.div
                    key={completion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">
                            {completion.habit_category === 'health' ? '🌸' :
                             completion.habit_category === 'productivity' ? '💪' :
                             completion.habit_category === 'self_care' ? '🧘‍♀️' :
                             completion.habit_category === 'learning' ? '📚' :
                             completion.habit_category === 'social' ? '💬' : '⭐'}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {completion.member_name} completed "{completion.habit_name}"
                            </p>
                            {completion.current_streak > 1 && (
                              <p className="text-sm text-purple-600">
                                🔥 {completion.current_streak} days straight!
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Encouragements */}
                        {completion.encouragements.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {completion.encouragements.map((enc, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="bg-purple-50 border-purple-200 text-purple-700 text-xs"
                              >
                                {reactionOptions.find(r => r.value === enc.reaction_type)?.emoji || '💚'}{' '}
                                {enc.from_member_name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCompletion(completion);
                          setShowReactionDialog(true);
                        }}
                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        Cheer
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Family Reflection Moment */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-5 border border-purple-200"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🪞</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900 mb-2">
                  Family Reflection Moment
                </h4>
                <p className="text-sm text-purple-800 leading-relaxed mb-2">
                  Take a breath together. What went well today? What felt meaningful?
                </p>
                <p className="text-xs text-purple-700 italic">
                  DobryLife helps you track progress <strong>and presence</strong> — because growth is a shared journey.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tip of the Week */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold opacity-90 mb-1">
                  {currentTip.emoji} Tip of the Week
                </div>
                <h4 className="font-bold text-lg">
                  {currentTip.title}
                </h4>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-3">
              <div className="text-2xl font-bold mb-1">
                {currentTip.statistic}
              </div>
              <div className="text-sm opacity-90">
                {currentTip.detail}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <p className="text-sm leading-relaxed">
                {currentTip.tip}
              </p>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center pt-2"
          >
            <p className="text-sm text-gray-600">
              DobryLife – turning everyday actions into shared memories 🌿
            </p>
          </motion.div>
        </CardContent>
      </Card>

      {/* Reaction Dialog */}
      <Dialog open={showReactionDialog} onOpenChange={setShowReactionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>💬 Send Some Love</DialogTitle>
            <DialogDescription>
              Show {selectedCompletion?.member_name} you're proud of their progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Quick Reactions */}
            <div className="grid grid-cols-2 gap-3">
              {reactionOptions.map((reaction) => (
                <motion.button
                  key={reaction.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleReaction(reaction.value, reaction.label)}
                  className={`relative p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all group`}
                >
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${reaction.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative text-center">
                    <div className="text-4xl mb-2">{reaction.emoji}</div>
                    <div className="text-sm font-semibold text-gray-700">
                      {reaction.label}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Custom Message */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Or write a personal message:
              </label>
              <Input
                placeholder="You're doing amazing! Keep it up! 💪"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="mb-3"
              />
              <Button
                onClick={() => handleReaction('thumbs_up', customMessage)}
                disabled={!customMessage.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
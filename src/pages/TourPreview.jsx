import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Calendar, 
  Feather, 
  Heart, 
  Users, 
  ToyBrick,
  Layers,
  Rocket,
  Volume2,
  MessageSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function TourPreview() {
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const handleEnableAudio = () => {
    setAudioEnabled(true);
    setShowAudioPrompt(false);
    setTimeout(() => setShowTour(true), 500);
  };

  const handleSkipAudio = () => {
    setShowAudioPrompt(false);
    setTimeout(() => setShowTour(true), 500);
  };

  const tourMessage = `# Welcome to DobryLife! 🌟

I'm your compassionate AI assistant, here to help you navigate your wellness journey.

Let me give you a comprehensive tour of everything DobryLife offers:

---

## 🎯 **Smart Task Management & Planners**
- **Life Organizer**: Gentle structure for your daily tasks with AI-powered suggestions
- **Gentle Flow Planner**: Neuro-inclusive planning that adapts to your energy levels
- **Meal Planner**: Recipe search, meal planning, and grocery list generation
- **Schedule Templates**: Ready-made schedules for various life situations

Example: "Help me plan my day" or "Create a meal plan for this week"

---

## ✍️ **Writings & Reflection**
- **Digital Journals**: Guided journals for gratitude, grief, relationships, and more
- **Books**: Read inspiring books like Ruby's Life Story (Infinity Journal)
- **Blog**: Inspirational writings and stories for healing
- **Vision Board**: Visualize and achieve your goals with AI-powered insights

Example: "Start a gratitude journal" or "Help me create a vision board"

---

## 💙 **Support - Your Personal AI Coaches**
- **SoulLink**: Your AI companion for daily emotional support and connection
- **Grief Coach**: Compassionate support for any loss or major life change
- **Life Coach**: Goal setting, planning, and personal growth guidance
- **Coaching Matcher**: Discover the best coaching approach for your needs

Example: "I need emotional support" or "Help me set life goals"

---

## 💚 **Wellness Hub**
- **Daily Wellness Check-ins**: Track mood, sleep, energy, and habits
- **Mindfulness Hub**: Breathing exercises, meditation, and calming games
- **Chronic Illness Hub**: Support for managing chronic conditions *(Coming Soon)*
- **Wellness Tools**: Resources for your overall wellbeing

Example: "Log my wellness" or "I need to relax with breathing exercises"

---

## 👨‍👩‍👧 **Family Hub**
- **Family Dashboard**: Shared support and schedules for your household
- **Family Access**: Share info with family using secure access codes
- **Chore Management**: Rotating chores and rewards system
- **Kids Journal**: Private journaling space for children with AI encouragement
- **Family Invites**: Invite family members to collaborate

Example: "Schedule a family event" or "What's on our family calendar?"

---

## 🎨 **Kids Studio**
- **Creative Games**: Educational games and activities for children
- **Montessori Activities**: Hands-on learning experiences
- **Toddler Games**: Simple, engaging activities for little ones
- **Hand Tracing**: A-Z letter learning with family encouragement
- **Homework Helper**: AI-powered homework assistance
- **Story Creator**: AI-generated personalized stories

Example: "Show me kids activities" or "Create a story for my child"

---

## 🌟 **Community & Stories**
- **Story Hub**: Share personal stories and connect with others
- **Community Feed**: Updates and support from other families
- **Blog**: Read inspiring articles about grief, wellness, and growth
- **Family Connections**: Connect with other families for playdates and support

Example: "Show me inspiring stories" or "Connect with other families"

---

## 📚 **Resources**
- **Life Templates**: Budget planners, schedules, and organizational tools
- **Care Hub**: Find caregivers, consultants, and professional help
- **App Search**: Discover verified tools and apps for your needs
- **My Applications**: Track job applications and postings
- **Provider Reviews**: Read reviews of professionals and services

Example: "Help me find a budget template" or "Find caregivers in my area"

---

## 📖 **Our Story**
- **About DobryLife**: Learn about our mission and the story behind the platform
- **Impact Partners**: Join our investment program and be part of our growth
- **Ruby's Story**: Discover the heartfelt journey that inspired DobryLife

Example: "Tell me about DobryLife" or "Who founded this platform?"

---

## 🚀 **Coming Soon - Future Features**

We're constantly evolving to serve you better! Here's what's on the horizon:

**🏥 Chronic Illness Hub** - Comprehensive support for managing chronic conditions with symptom tracking, medication reminders, and AI health insights

**🎓 Enhanced Mentor System** - Connect with verified teachers, therapists, and mentors for personalized guidance

**🌍 Local Resources Finder** - AI-powered discovery of local support groups, healthcare providers, and community resources

**🎮 Expanded Kids Features** - More educational games, learning paths, and parent progress tracking

**💰 Financial Wellness Tools** - Advanced budgeting, expense tracking, and financial goal planning

**🎵 Enhanced Soundscapes** - AI-generated custom soundscapes tailored to your mood and preferences

**📱 Enhanced Mobile App** - Full-featured native iOS and Android apps with offline capabilities

**🤝 Collaborative Features** - Shared journals, family goal tracking, and multi-user task coordination

**🔮 Predictive Wellness** - AI that learns your patterns and proactively suggests self-care before you need it

**🌐 Multilingual Support** - Platform available in multiple languages for global accessibility

---

## 💬 **How to Use Me:**

1. **Natural Conversation**: Just type or speak naturally - I understand conversational language
2. **Ask Me Anything**: I can access your calendar, tasks, journals, wellness data, and more
3. **Voice Commands**: Say "Hey DobryLife" and tell me what you need
4. **Quick Actions**: Ask me to create tasks, schedule events, start journals, play meditation
5. **Smart Suggestions**: I learn from your patterns and offer personalized recommendations

---

## 🎯 **Try These Commands:**

**Quick Actions:**
- "What's on my schedule today?"
- "Add a task to call mom"
- "Start a gratitude journal entry"
- "Log my wellness check-in"
- "Play calming sounds"

**Planning & Organization:**
- "Help me plan tomorrow"
- "What meals should I make this week?"
- "Show me my family's schedule"
- "Create a budget template"

**Emotional Support:**
- "I'm feeling overwhelmed"
- "Help me process my grief"
- "I need encouragement"
- "Connect me with my Life Coach"

**Family & Kids:**
- "Show me activities for my kids"
- "Schedule a family game night"
- "How is my child doing with journaling?"
- "Find kid-friendly recipes"

**Wellness & Growth:**
- "Guide me through meditation"
- "Track my mood"
- "Show my wellness trends"
- "Help me create a vision board"

---

I'm here 24/7 whenever you need support, organization, guidance, or just someone to talk to. 

**What would you like to explore first?** 💙`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome Tour Preview
          </h1>
          <p className="text-gray-600">
            This is what first-time users will experience
          </p>
        </motion.div>

        {/* Reset Button */}
        <div className="mb-6 text-center">
          <Button
            onClick={() => {
              setShowAudioPrompt(true);
              setShowTour(false);
              setAudioEnabled(false);
            }}
            variant="outline"
            className="gap-2"
          >
            <Rocket className="w-4 h-4" />
            Reset & Show Again
          </Button>
        </div>

        {/* Audio Permission Prompt */}
        {showAudioPrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="bg-white shadow-2xl border-0 overflow-hidden max-w-md mx-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 p-6 text-center relative overflow-hidden">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4"
                >
                  <Volume2 className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome to DobryLife! 🎉
                </h2>
                <p className="text-white/90 text-sm">
                  Your AI companion is ready to guide you
                </p>
              </div>

              {/* Content */}
              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    First Time Here?
                  </div>
                  
                  <p className="text-gray-700 text-lg font-medium">
                    Enable Audio for the Best Experience
                  </p>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 space-y-2 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Voice-guided tour</p>
                        <p className="text-xs text-gray-600">Hear your AI assistant explain features</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Meditation & breathing</p>
                        <p className="text-xs text-gray-600">Enjoy calming soundscapes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Voice responses</p>
                        <p className="text-xs text-gray-600">Natural conversations with AI</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleEnableAudio}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg py-6"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    Enable Audio & Start Tour
                  </Button>

                  <Button
                    onClick={handleSkipAudio}
                    variant="ghost"
                    className="w-full text-gray-600"
                  >
                    Continue Without Audio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* AI Assistant Tour */}
        {showTour && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">AI Assistant</h3>
                  <p className="text-white/80 text-xs">Your Compassionate Guide</p>
                </div>
              </div>
              {audioEnabled && (
                <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                  <Volume2 className="w-4 h-4 text-green-100" />
                  <span className="text-green-100 text-xs font-medium">Audio On</span>
                </div>
              )}
            </div>

            {/* Message */}
            <div className="p-6 max-h-[600px] overflow-y-auto">
              <div className="bg-gray-50 rounded-xl p-6">
                <ReactMarkdown 
                  className="prose prose-sm max-w-none
                    [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:text-gray-900
                    [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h2]:mt-6 [&>h2]:text-gray-800
                    [&>p]:text-gray-700 [&>p]:mb-3 [&>p]:leading-relaxed
                    [&>ul]:ml-4 [&>ul]:mb-4 [&>ul]:space-y-1
                    [&>ul>li]:text-gray-700
                    [&>hr]:my-6 [&>hr]:border-gray-200"
                >
                  {tourMessage}
                </ReactMarkdown>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t">
              <p className="text-center text-sm text-gray-600">
                Type your question or click the microphone to speak
              </p>
            </div>
          </motion.div>
        )}

        {/* Feature Icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-3 md:grid-cols-6 gap-4"
        >
          {[
            { icon: Calendar, label: 'Planners', color: 'bg-blue-100 text-blue-600' },
            { icon: Feather, label: 'Writings', color: 'bg-purple-100 text-purple-600' },
            { icon: Heart, label: 'Support', color: 'bg-pink-100 text-pink-600' },
            { icon: Users, label: 'Family', color: 'bg-green-100 text-green-600' },
            { icon: ToyBrick, label: 'Kids Studio', color: 'bg-yellow-100 text-yellow-600' },
            { icon: Layers, label: 'Resources', color: 'bg-indigo-100 text-indigo-600' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="text-center"
            >
              <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-2`}>
                <item.icon className="w-8 h-8" />
              </div>
              <p className="text-xs font-medium text-gray-700">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
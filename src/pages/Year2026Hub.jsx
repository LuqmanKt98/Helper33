
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles, Calendar, Target, TrendingUp, MessageSquare, 
  BarChart3, Award, Star, Flame, CheckCircle, Heart,
  Brain, Users, Activity, BookOpen, Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import MessageBubble from '@/components/ai/MessageBubble';
import Year2026Survey from '@/components/year2026/Year2026Survey';
import Year2026Calendar from '@/components/year2026/Year2026Calendar';
import Year2026Progress from '@/components/year2026/Year2026Progress';
import DailyMotivation from '@/components/year2026/DailyMotivation';
import PersonalityBadge from '@/components/year2026/PersonalityBadge';
import GamificationDisplay from '@/components/year2026/GamificationDisplay';
import MonthlyReport from '@/components/year2026/MonthlyReport';
import DailyMicroTasks from '@/components/year2026/DailyMicroTasks';
import TodaysFocus from '@/components/year2026/TodaysFocus';
import Year2026Community from '@/components/year2026/Year2026Community';

export default function Year2026Hub() {
  const [activeTab, setActiveTab] = useState('overview');
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['year2026Goals'],
    queryFn: () => base44.entities.Year2026Goal.list('-created_date'),
    initialData: []
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ['year2026CheckIns'],
    queryFn: () => base44.entities.Year2026DailyCheckIn.list('-date'),
    initialData: []
  });

  const hasCompletedSurvey = goals.length > 0;
  const currentMonth = new Date().getMonth() + 1;
  const todayCheckIn = checkIns.find(c => c.date === new Date().toISOString().split('T')[0]);

  const totalDaysIn2026Journey = 427;
  const daysCompleted = checkIns.filter(c => c.is_checked_in).length;
  const overallProgress = (daysCompleted / totalDaysIn2026Journey) * 100;

  useEffect(() => {
    if (!conversationId) return;

    try {
      const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
        if (!data?.messages) return;
        setMessages(data.messages);
        
        const lastMessage = data.messages[data.messages.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessage?.status !== 'in_progress') {
          setIsLoading(false);
        }

        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });

      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    } catch (error) {
      console.error('Error subscribing:', error);
      setIsLoading(false);
    }
  }, [conversationId]);

  const handleSendMessage = async () => {
    const textToSend = input.trim();
    if (!textToSend || isLoading) return;

    setInput('');
    setIsLoading(true);

    try {
      let convId = conversationId;

      if (!convId) {
        const today = new Date();
        const yearStart = new Date(Date.UTC(2026, 0, 1));
        const diff = today.getTime() - yearStart.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay) + 1;
        const weekNumber = Math.ceil(dayOfYear / 7);
        
        const goalAnalysis = goals.map(goal => {
          // Ensure checkIns are ordered by date descending for slicing
          const sortedCheckIns = [...checkIns].sort((a, b) => new Date(b.date) - new Date(a.date));

          const recentCheckIns = sortedCheckIns.slice(0, 14);
          const olderCheckIns = sortedCheckIns.slice(14, 28);
          
          const recentProgress = recentCheckIns.filter(c => 
            c.goals_worked_on?.includes(goal.id)
          ).length;
          const olderProgress = olderCheckIns.filter(c => 
            c.goals_worked_on?.includes(goal.id)
          ).length;
          
          const trend = recentProgress < olderProgress ? 'declining' : 
                       recentProgress === olderProgress ? 'plateau' : 'improving';
          
          return {
            title: goal.goal_title,
            category: goal.category,
            progress: goal.progress_percentage,
            streak: goal.current_streak,
            trend,
            recentActivity: recentProgress,
            needsAttention: trend === 'declining' || (trend === 'plateau' && goal.progress_percentage < 50)
          };
        });

        const currentMilestones = goals.map(g => {
          const milestone = g.weekly_milestones?.find(m => m.week === weekNumber);
          return milestone ? `${g.goal_title}: ${milestone.milestone}` : null;
        }).filter(Boolean);

        const newConv = await base44.agents.createConversation({
          agent_name: '2026_life_planner',
          metadata: {
            name: '2026 Life Planning',
            user_email: user?.email,
            goals: goals.map(g => g.goal_title).join(', '),
            current_week: weekNumber,
            week_milestones: currentMilestones.join(' | '),
            goal_analysis: JSON.stringify(goalAnalysis),
            proactive_mode: 'enabled'
          }
        });

        convId = newConv.id;
        setConversationId(convId);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      await base44.agents.addMessage(
        { id: convId },
        { role: 'user', content: textToSend }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setInput(textToSend);
      setIsLoading(false);
      toast.error('Failed to send message');
    }
  };

  return (
    <>
      <SEO
        title="2026 Hub - Transform Your Year | Helper33"
        description="AI-powered 2026 planning with science-based surveys, daily check-ins, and personalized goal tracking integrated across all Helper33 features"
        keywords="2026 planning, new year resolutions, goal setting, AI life coach, yearly planner"
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6 relative overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], x: [0, -20, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/90 backdrop-blur-xl rounded-full border-2 border-purple-300 mb-6 shadow-2xl"
            >
              <Sparkles className="w-6 h-6 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                2026 Life Transformation Hub
              </span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                Start Now
              </span>
              <br />
              <span className="text-gray-800">Transform 2026</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Begin your journey in November 2025! AI-powered goal planning with daily check-ins, 
              science-based guidance, and full integration across Helper33 features
            </p>

            {hasCompletedSurvey && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border-2 border-purple-300 shadow-xl"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{goals.length}</div>
                  <div className="text-xs text-gray-600">Active Goals</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">{daysCompleted}</div>
                  <div className="text-xs text-gray-600">Days Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">{Math.round(overallProgress)}%</div>
                  <div className="text-xs text-gray-600">Journey Progress</div>
                </div>
              </motion.div>
            )}

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block mt-4"
            >
              <a
                href={base44.agents.getWhatsAppConnectURL('2026_life_planner')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold shadow-xl">
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Chat on WhatsApp
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {!hasCompletedSurvey ? (
            <Year2026Survey onComplete={() => queryClient.invalidateQueries(['year2026Goals'])} />
          ) : (
            <>
              {user && (
                <DailyMotivation 
                  goals={goals} 
                  checkIn={todayCheckIn}
                  timeOfDay={new Date().getHours() < 12 ? 'morning' : 'evening'}
                />
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-7 max-w-6xl mx-auto mb-8 bg-white/70 backdrop-blur-xl border-2 border-purple-300 shadow-lg">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                    <Target className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendar
                  </TabsTrigger>
                  <TabsTrigger value="progress" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Progress
                  </TabsTrigger>
                  <TabsTrigger value="community" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
                    <Users className="w-4 h-4 mr-2" />
                    Community
                  </TabsTrigger>
                  <TabsTrigger value="gamification" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                    <Award className="w-4 h-4 mr-2" />
                    Achievements
                  </TabsTrigger>
                  <TabsTrigger value="ai_coach" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    AI Coach
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Reports
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <TodaysFocus 
                        goals={goals} 
                        todayCheckIn={todayCheckIn}
                        onComplete={(goalId, type, index) => {
                          queryClient.invalidateQueries(['year2026Goals']);
                          toast.success('Progress updated! Keep going! 🎉');
                        }}
                      />
                      <Year2026Overview goals={goals} checkIns={checkIns} user={user} queryClient={queryClient} setActiveTab={setActiveTab} />
                    </div>
                    <div>
                      <DailyMicroTasks 
                        goals={goals} 
                        onTaskComplete={(taskKey) => {
                          queryClient.invalidateQueries(['year2026Goals']);
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="calendar">
                  <Year2026Calendar goals={goals} checkIns={checkIns} queryClient={queryClient} />
                </TabsContent>

                <TabsContent value="progress">
                  <Year2026Progress goals={goals} checkIns={checkIns} />
                </TabsContent>

                <TabsContent value="community">
                  <Year2026Community user={user} goals={goals} checkIns={checkIns} />
                </TabsContent>

                <TabsContent value="gamification">
                  <div className="space-y-6">
                    {user?.year_2026_personality && (
                      <PersonalityBadge personalityType={user.year_2026_personality} showFull={true} />
                    )}
                    <GamificationDisplay user={user} goals={goals} checkIns={checkIns} />
                  </div>
                </TabsContent>

                <TabsContent value="ai_coach">
                  <AICoachChat
                    conversationId={conversationId}
                    setConversationId={setConversationId}
                    messages={messages}
                    input={input}
                    setInput={setInput}
                    isLoading={isLoading}
                    handleSendMessage={handleSendMessage}
                    messagesEndRef={messagesEndRef}
                    goals={goals}
                    user={user}
                  />
                </TabsContent>

                <TabsContent value="reports">
                  <MonthlyReport 
                    month={currentMonth} 
                    goals={goals} 
                    checkIns={checkIns}
                    user={user}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Year2026Overview({ goals, checkIns, user, queryClient, setActiveTab }) {
  const activeGoals = goals.filter(g => g.status === 'active');
  const totalDays = 427;
  const daysCompleted = checkIns.filter(c => c.is_checked_in).length;
  const currentStreak = calculateCurrentStreak(checkIns);

  const categoryIcons = {
    health: { icon: Heart, color: 'from-red-400 to-pink-500', feature: 'Wellness' },
    fitness: { icon: Activity, color: 'from-orange-400 to-red-500', feature: 'Wellness' },
    wellness: { icon: Sparkles, color: 'from-purple-400 to-pink-500', feature: 'Wellness' },
    family: { icon: Users, color: 'from-blue-400 to-cyan-500', feature: 'Family' },
    career: { icon: Briefcase, color: 'from-indigo-400 to-purple-500', feature: 'SocialMediaManager' },
    learning: { icon: BookOpen, color: 'from-green-400 to-emerald-500', feature: 'HomeworkHub' },
    relationships: { icon: Heart, color: 'from-rose-400 to-pink-500', feature: 'Messages' }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Goals', value: activeGoals.length, icon: Target, color: 'purple' },
          { label: 'Days Checked In', value: daysCompleted, icon: CheckCircle, color: 'green' },
          { label: 'Current Streak', value: `${currentStreak} days`, icon: Flame, color: 'orange' },
          { label: 'Journey Progress', value: `${Math.round((daysCompleted / totalDays) * 100)}%`, icon: TrendingUp, color: 'blue' }
        ].map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                  <div className="text-right">
                    <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Target className="w-6 h-6 text-purple-600" />
            Your 2026 Goals
          </CardTitle>
          <CardDescription>Transform your life across these key areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {activeGoals.map((goal, idx) => {
              const categoryData = categoryIcons[goal.category] || { icon: Star, color: 'from-gray-400 to-gray-500', feature: 'Dashboard' };
              const Icon = categoryData.icon;
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 hover:shadow-xl transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryData.color} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 mb-1">{goal.goal_title}</h4>
                          <Badge className="bg-purple-100 text-purple-700 text-xs">{goal.category}</Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Progress</span>
                          <span className="font-bold text-purple-600">{goal.progress_percentage}%</span>
                        </div>
                        <Progress value={goal.progress_percentage} className="h-2" />
                        
                        <div className="flex gap-2 text-xs">
                          <Badge variant="outline">{goal.days_completed}/{totalDays} days</Badge>
                          <Badge className="bg-orange-100 text-orange-700">🔥 {goal.current_streak} streak</Badge>
                        </div>
                      </div>

                      {goal.integrated_features && goal.integrated_features.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-purple-100">
                          <p className="text-xs font-semibold text-purple-700 mb-2">Integrated Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {goal.integrated_features.map((feature, i) => (
                              <Badge key={i} className="bg-blue-100 text-blue-700 text-xs">{feature}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <QuickActionsGrid setActiveTab={setActiveTab} queryClient={queryClient} />
    </div>
  );
}

function QuickActionsGrid({ setActiveTab, queryClient }) {
  const [showSurvey, setShowSurvey] = useState(false);

  return (
    <>
      <div className="grid md:grid-cols-3 gap-4">
        <QuickActionCard
          title="Daily Check-In"
          description="Log today's progress"
          icon={CheckCircle}
          color="from-green-400 to-emerald-500"
          onClick={() => {
            setActiveTab('calendar');
            toast.success('Opening Calendar for check-in! 📅');
          }}
        />
        <QuickActionCard
          title="Adjust Goals"
          description="Retake survey"
          icon={Target}
          color="from-purple-400 to-pink-500"
          onClick={() => setShowSurvey(true)}
        />
        <QuickActionCard
          title="Get Motivation"
          description="Talk to AI coach"
          icon={MessageSquare}
          color="from-blue-400 to-cyan-500"
          onClick={() => {
            setActiveTab('ai_coach');
            toast.success('Opening AI Coach! 🤖✨');
          }}
        />
      </div>

      {showSurvey && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6"
        >
          <Year2026Survey 
            onComplete={() => {
              queryClient.invalidateQueries(['year2026Goals']);
              setShowSurvey(false);
              toast.success('Goals updated! 🎯');
            }} 
          />
        </motion.div>
      )}
    </>
  );
}

function QuickActionCard({ title, description, icon: Icon, color, onClick }) {
  return (
    <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 cursor-pointer hover:shadow-xl transition-all" onClick={onClick}>
        <CardContent className="p-6 text-center">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AICoachChat({ conversationId, setConversationId, messages, input, setInput, isLoading, handleSendMessage, messagesEndRef, goals, user }) {
  const [proactiveAnalysis, setProactiveAnalysis] = useState(null);
  const [analyzingProgress, setAnalyzingProgress] = useState(false);
  const queryClient = useQueryClient();

  const { data: checkIns = [] } = useQuery({
    queryKey: ['year2026CheckIns'],
    queryFn: () => base44.entities.Year2026DailyCheckIn.list('-date'),
    initialData: []
  });

  const quickPrompts = [
    "Analyze my progress and suggest improvements",
    "Which goal needs the most attention right now?",
    "Help me break down my struggling goal into smaller steps",
    "Adjust my weekly milestones based on my actual progress",
    "Make my goals SMARTer based on my patterns",
    "Create micro-adjustments for goals that are stuck"
  ];

  // Proactive analysis on mount
  useEffect(() => {
    if (goals.length > 0 && checkIns.length > 0 && !proactiveAnalysis) {
      analyzeProgressProactively();
    }
  }, [goals, checkIns, proactiveAnalysis]); // Added proactiveAnalysis to dependencies to prevent re-running if analysis is already done

  const analyzeProgressProactively = async () => {
    setAnalyzingProgress(true);
    
    try {
      // Analyze each goal's trend
      const goalTrends = goals.map(goal => {
        // Ensure checkIns are ordered by date descending for slicing
        const sortedCheckIns = [...checkIns].sort((a, b) => new Date(b.date) - new Date(a.date));

        const recentCheckIns = sortedCheckIns.slice(0, 14);
        const olderCheckIns = sortedCheckIns.slice(14, 28);
        
        const recentProgress = recentCheckIns.filter(c => 
          c.goals_worked_on?.includes(goal.id) && c.is_checked_in
        ).length;
        const olderProgress = olderCheckIns.filter(c => 
          c.goals_worked_on?.includes(goal.id) && c.is_checked_in
        ).length;
        
        const trend = recentProgress < olderProgress ? 'declining' : 
                     (recentProgress === olderProgress && recentProgress < 7) ? 'plateau' : 'improving';
        
        const recentMoods = recentCheckIns
          .filter(c => c.goals_worked_on?.includes(goal.id))
          .map(c => c.mood_rating)
          .filter(Boolean);
        const avgMood = recentMoods.length > 0 
          ? recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length 
          : null;

        return {
          goal_id: goal.id,
          title: goal.goal_title,
          category: goal.category,
          description: goal.description,
          progress: goal.progress_percentage,
          streak: goal.current_streak,
          trend,
          recentActivity: recentProgress,
          avgMood,
          needsAttention: trend === 'declining' || trend === 'plateau',
          monthly_missions: goal.monthly_missions,
          weekly_milestones: goal.weekly_milestones,
          daily_micro_tasks: goal.daily_micro_tasks
        };
      });

      const goalsNeedingAttention = goalTrends.filter(g => g.needsAttention);

      if (goalsNeedingAttention.length > 0) {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a proactive AI life coach analyzing a user's 2026 transformation journey. 

GOALS ANALYSIS:
${JSON.stringify(goalTrends, null, 2)}

RECENT CHECK-INS (Last 14 days):
${JSON.stringify(checkIns.slice(0, 14).map(c => ({
  date: c.date,
  mood: c.mood_rating,
  energy: c.energy_level,
  goals_worked: c.goals_worked_on,
  wins: c.wins_today
})), null, 2)}

CRITICAL: ${goalsNeedingAttention.length} goal(s) show declining or plateau trends and need attention.

Your task:
1. Identify specific root causes for each struggling goal
2. Suggest concrete micro-adjustments to daily tasks
3. Propose revised weekly milestones that are more achievable
4. Recommend monthly mission adjustments if needed
5. Suggest making goals SMARTer based on observed patterns (Specific, Measurable, Achievable, Relevant, Time-bound)
6. Provide actionable 3-day micro-plans to restart momentum

Be specific, actionable, and encouraging. Focus on small wins to rebuild momentum.`,
          response_json_schema: {
            type: "object",
            properties: {
              urgent_insights: {
                type: "string",
                description: "Quick summary of what needs immediate attention"
              },
              goals_needing_help: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    goal_title: { type: "string" },
                    root_cause: { type: "string" },
                    suggested_daily_adjustments: {
                      type: "array",
                      items: { type: "string" }
                    },
                    revised_weekly_milestones: {
                      type: "array",
                      items: { type: "string" }
                    },
                    smarter_goal_version: { type: "string" },
                    three_day_restart_plan: {
                      type: "array",
                      items: { type: "string" }
                    }
                  }
                }
              },
              momentum_builders: {
                type: "array",
                items: { type: "string" },
                description: "Quick wins to rebuild confidence"
              }
            }
          }
        });

        setProactiveAnalysis(response);
      } else {
        setProactiveAnalysis({
          urgent_insights: "Great momentum! All goals are progressing well. Keep up the excellent work! 🎉",
          goals_needing_help: [],
          momentum_builders: ["Continue your current routine", "Celebrate your consistency", "Consider adding stretch goals"]
        });
      }
    } catch (error) {
      console.error('Error analyzing progress:', error);
      toast.error('Failed to analyze progress');
    } finally {
      setAnalyzingProgress(false);
    }
  };

  const applyGoalAdjustment = async (goalTitle, adjustments) => {
    const goal = goals.find(g => g.goal_title === goalTitle);
    if (!goal) {
      toast.error(`Goal "${goalTitle}" not found.`);
      return;
    }

    try {
      const updatedFields = {
        ai_adjustment_applied: true,
        last_ai_adjustment_date: new Date().toISOString(),
      };

      if (adjustments.smarter_goal_version) {
        updatedFields.description = adjustments.smarter_goal_version;
      }
      // You could also update monthly_missions, weekly_milestones, daily_micro_tasks here
      // Example:
      // if (adjustments.revised_weekly_milestones) {
      //   updatedFields.weekly_milestones = adjustments.revised_weekly_milestones;
      // }
      // The current schema provides strings for milestones, which might need parsing or a different approach for direct update.

      await base44.entities.Year2026Goal.update(goal.id, updatedFields);

      await queryClient.invalidateQueries(['year2026Goals']);
      toast.success(`✨ Adjusted "${goalTitle}" with AI recommendations!`);
      // Optionally re-run proactive analysis to reflect changes
      setProactiveAnalysis(null); // Clear previous analysis to trigger re-evaluation
    } catch (error) {
      console.error('Error applying adjustment:', error);
      toast.error('Failed to apply adjustments');
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Proactive Insights Panel */}
      {proactiveAnalysis && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-300 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Brain className="w-5 h-5" />
                🎯 Proactive Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/80 rounded-lg p-4 border-2 border-orange-200">
                <p className="font-semibold text-orange-900 mb-2">📊 Quick Insight:</p>
                <p className="text-gray-700">{proactiveAnalysis.urgent_insights}</p>
              </div>

              {proactiveAnalysis.goals_needing_help?.length > 0 && (
                <div className="space-y-3">
                  {proactiveAnalysis.goals_needing_help.map((goal, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-lg p-4 border-2 border-orange-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                          <Target className="w-4 h-4 text-orange-600" />
                          {goal.goal_title}
                        </h4>
                        <Button
                          size="sm"
                          onClick={() => applyGoalAdjustment(goal.goal_title, goal)}
                          className="bg-gradient-to-r from-orange-500 to-red-500 text-xs"
                        >
                          Apply AI Fix ✨
                        </Button>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-semibold text-orange-800 mb-1">🔍 Root Cause:</p>
                          <p className="text-gray-700">{goal.root_cause}</p>
                        </div>

                        {goal.smarter_goal_version && (
                          <div>
                            <p className="font-semibold text-blue-800 mb-1">💡 SMARTer Version:</p>
                            <p className="text-gray-700 italic">{goal.smarter_goal_version}</p>
                          </div>
                        )}

                        {goal.suggested_daily_adjustments && goal.suggested_daily_adjustments.length > 0 && (
                          <div>
                            <p className="font-semibold text-gray-800 mb-1">📅 Daily Adjustments:</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                              {goal.suggested_daily_adjustments.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {goal.revised_weekly_milestones && goal.revised_weekly_milestones.length > 0 && (
                          <div>
                            <p className="font-semibold text-purple-800 mb-1">🗓️ Revised Milestones:</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                              {goal.revised_weekly_milestones.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {goal.three_day_restart_plan && goal.three_day_restart_plan.length > 0 && (
                          <div>
                            <p className="font-semibold text-green-800 mb-1">🚀 3-Day Restart:</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                              {goal.three_day_restart_plan.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {proactiveAnalysis.momentum_builders?.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <p className="font-semibold text-green-800 mb-2">⚡ Quick Momentum Builders:</p>
                  <ul className="space-y-1 text-sm">
                    {proactiveAnalysis.momentum_builders.map((builder, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {builder}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card className="lg:col-span-1 bg-white/90 backdrop-blur-sm border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg">AI Coach Prompts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickPrompts.map((prompt, idx) => (
            <Button
              key={idx}
              onClick={() => setInput(prompt)}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 hover:bg-purple-50 border-purple-200"
            >
              <Sparkles className="w-4 h-4 mr-2 flex-shrink-0 text-purple-600" />
              <span className="text-sm">{prompt}</span>
            </Button>
          ))}

          <Button
            onClick={analyzeProgressProactively}
            disabled={analyzingProgress}
            variant="outline"
            className="w-full justify-start text-left h-auto py-3 hover:bg-orange-50 border-orange-300"
          >
            {analyzingProgress ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <Brain className="w-4 h-4 mr-2 text-orange-600" />
                </motion.div>
                <span className="text-sm">Analyzing...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2 flex-shrink-0 text-orange-600" />
                <span className="text-sm">🔄 Re-analyze Progress Now</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm border-2 border-purple-200 flex flex-col h-[700px]">
        <CardHeader className="border-b border-purple-200">
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            2026 AI Life Coach
          </CardTitle>
          <CardDescription>Proactive guidance with smart micro-adjustments</CardDescription>
        </CardHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Sparkles className="w-16 h-16 text-purple-300 mb-4" />
              <h3 className="font-semibold text-lg text-gray-700 mb-2">
                Welcome to Your Proactive AI Coach! 🎉
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                I actively analyze your progress and suggest micro-adjustments when goals plateau. 
                Check the insights above for immediate recommendations!
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <MessageBubble key={msg.id || idx} message={msg} />
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </motion.div>
              <span className="text-sm">Crafting personalized guidance...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-purple-200">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Ask for micro-adjustments, goal analysis, or planning help..."
              className="flex-1 px-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Year2026Insights({ goals, checkIns }) {
  const [aiInsights, setAiInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateInsights = async () => {
    setIsAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this user's 2026 journey and provide deep, personalized insights:

GOALS:
${JSON.stringify(goals.map(g => ({ title: g.goal_title, category: g.category, progress: g.progress_percentage, streak: g.current_streak })))}

CHECK-INS (last 30 days):
${JSON.stringify(checkIns.slice(0, 30).map(c => ({ date: c.date, mood: c.mood_rating, energy: c.energy_level, wins: c.wins_today })))}

Provide analysis on:
1. Overall progress trajectory
2. Patterns in success and struggles
3. Goal category that's thriving vs needs attention
4. Personalized recommendations for next 30 days
5. Motivational insights based on their journey
6. Suggested adjustments to goals or approach
7. Celebration moments they should acknowledge

Be encouraging, specific, and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_assessment: { type: "string" },
            thriving_areas: { type: "array", items: { type: "string" } },
            needs_attention: { type: "array", items: { type: "string" } },
            success_patterns: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            celebration_moments: { type: "array", items: { type: "string" } },
            next_30_days_focus: { type: "string" }
          }
        }
      });

      setAiInsights(response);
      toast.success('Insights generated! ✨');
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI-Powered Insights</h2>
          <p className="text-gray-600">Deep analysis of your 2026 journey</p>
        </div>
        <Button
          onClick={generateInsights}
          disabled={isAnalyzing || checkIns.length === 0}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {isAnalyzing ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                <Sparkles className="w-4 h-4 mr-2" />
              </motion.div>
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Generate Insights
            </>
          )}
        </Button>
      </div>

      {aiInsights ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300">
            <CardContent className="p-6">
              <h3 className="font-bold text-purple-900 mb-3 text-lg">Overall Assessment</h3>
              <p className="text-purple-800">{aiInsights.overall_assessment}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {aiInsights.thriving_areas?.length > 0 && (
              <Card className="bg-green-50 border-2 border-green-200">
                <CardContent className="p-4">
                  <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Thriving Areas
                  </h4>
                  <ul className="space-y-1">
                    {aiInsights.thriving_areas.map((area, i) => (
                      <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {aiInsights.needs_attention?.length > 0 && (
              <Card className="bg-orange-50 border-2 border-orange-200">
                <CardContent className="p-4">
                  <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Needs Focus
                  </h4>
                  <ul className="space-y-1">
                    {aiInsights.needs_attention.map((area, i) => (
                      <li key={i} className="text-sm text-orange-800">• {area}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {aiInsights.recommendations?.length > 0 && (
            <Card className="bg-blue-50 border-2 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Personalized Recommendations
                </h4>
                <ul className="space-y-2">
                  {aiInsights.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-blue-800">✨ {rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      ) : (
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
          <CardContent className="text-center py-12">
            <Brain className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">Ready for Deep Insights?</h3>
            <p className="text-gray-500 text-sm">
              Click "Generate Insights" to get AI-powered analysis of your journey
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function calculateCurrentStreak(checkIns) {
  if (checkIns.length === 0) return 0;
  
  const sorted = [...checkIns].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayCheckIn = sorted.find(c => {
    const checkInDate = new Date(c.date);
    checkInDate.setHours(0,0,0,0);
    return checkInDate.getTime() === today.getTime();
  });

  if (!todayCheckIn || !todayCheckIn.is_checked_in) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayCheckIn = sorted.find(c => {
          const checkInDate = new Date(c.date);
          checkInDate.setHours(0,0,0,0);
          return checkInDate.getTime() === yesterday.getTime();
      });
      if (!yesterdayCheckIn || !yesterdayCheckIn.is_checked_in) {
          return 0;
      }
      let i = 0;
      let currentDate = new Date(yesterday);
      currentDate.setHours(0,0,0,0);
      while (i < sorted.length) {
          const checkInDate = new Date(sorted[i].date);
          checkInDate.setHours(0,0,0,0);
          if (checkInDate.getTime() === currentDate.getTime() && sorted[i].is_checked_in) {
              streak++;
              currentDate.setDate(currentDate.getDate() - 1);
              i++;
          } else if (checkInDate.getTime() > currentDate.getTime()) {
              i++;
          } else {
              break;
          }
      }

  } else {
      let i = 0;
      let currentDate = new Date(today);
      currentDate.setHours(0,0,0,0);
      while (i < sorted.length) {
          const checkInDate = new Date(sorted[i].date);
          checkInDate.setHours(0,0,0,0);
          
          if (checkInDate.getTime() === currentDate.getTime() && sorted[i].is_checked_in) {
              streak++;
              currentDate.setDate(currentDate.getDate() - 1);
              i++;
          } else if (checkInDate.getTime() > currentDate.getTime()) {
              i++;
          } else {
              break;
          }
      }
  }
  
  return streak;
}

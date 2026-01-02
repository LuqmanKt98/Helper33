import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Award,
  Target,
  BookOpen,
  Star,
  Trophy,
  Activity,
  Heart,
  Sparkles,
  Download,
  Share2
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { format, subDays } from 'date-fns';

export default function ParentProgressDashboard({ childMemberId, childName }) {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: childProgress } = useQuery({
    queryKey: ['childProgress', childMemberId],
    queryFn: async () => {
      const records = await base44.entities.ChildProgress.filter({
        child_member_id: childMemberId
      });
      return records[0] || null;
    },
    enabled: !!childMemberId
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ['kidsJournalEntries', childMemberId],
    queryFn: () => base44.entities.KidsJournalEntry.filter({
      child_member_id: childMemberId
    }, '-created_date', 30),
    initialData: [],
    enabled: !!childMemberId
  });

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    if (!childProgress) return null;

    const modules = childProgress.module_progress || {};
    
    return {
      // Overall Progress
      overallScore: childProgress.overall_progress_score || 0,
      
      // Math Module
      mathLevel: modules.math?.level || 1,
      mathProblems: modules.math?.problems_solved || 0,
      mathAccuracy: modules.math?.accuracy_rate || 0,
      mathConcepts: modules.math?.concepts_mastered?.length || 0,
      mathStruggles: modules.math?.struggling_with || [],
      
      // Letters Module
      lettersLearned: modules.letters?.letters_mastered?.length || 0,
      lettersInProgress: modules.letters?.letters_learning?.length || 0,
      phonicsAccuracy: modules.letters?.phonics_accuracy || 0,
      readingLevel: modules.letters?.reading_level || 'beginner',
      
      // Tracing
      lettersTraced: modules.tracing?.letters_traced?.length || 0,
      tracingAccuracy: modules.tracing?.accuracy_score || 0,
      
      // Creative Writing
      storiesCreated: modules.creative_writing?.stories_created || 0,
      vocabularyLevel: modules.creative_writing?.vocabulary_level || 1,
      creativityScore: modules.creative_writing?.creativity_score || 5,
      
      // Coloring
      coloringPages: modules.coloring?.pages_completed || 0,
      fineMotorScore: modules.coloring?.fine_motor_score || 0,
      
      // Journal
      journalEntries: modules.journal?.entries_count || 0,
      emotionalAwareness: modules.journal?.emotional_awareness_score || 0,
      
      // Achievements
      totalAchievements: childProgress.achievements?.length || 0,
      recentAchievements: childProgress.achievements?.slice(-5) || [],
      
      // Weekly Summary
      weeklyMinutes: childProgress.weekly_summary?.total_time_minutes || 0,
      weeklyActivities: childProgress.weekly_summary?.activities_completed || 0,
      weeklyPoints: childProgress.weekly_summary?.points_earned || 0,
      favoriteActivity: childProgress.weekly_summary?.favorite_activity || 'N/A'
    };
  }, [childProgress]);

  // Prepare chart data
  const last7Days = useMemo(() => {
    return [...Array(7)].map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const entriesOnDay = journalEntries.filter(e => 
        e.created_date?.startsWith(dateStr)
      );
      
      return {
        date: format(date, 'EEE'),
        fullDate: dateStr,
        entries: entriesOnDay.length,
        mood: entriesOnDay.length > 0 
          ? entriesOnDay.reduce((sum, e) => sum + (e.mood === 'happy' || e.mood === 'excited' ? 10 : e.mood === 'calm' || e.mood === 'okay' ? 7 : 4), 0) / entriesOnDay.length
          : 0
      };
    });
  }, [journalEntries]);

  const skillsRadarData = useMemo(() => {
    if (!stats) return [];
    
    return [
      { skill: 'Math', score: Math.min(100, stats.mathLevel * 20 + stats.mathAccuracy) },
      { skill: 'Reading', score: stats.lettersLearned * 4 },
      { skill: 'Writing', score: stats.lettersTraced * 4 },
      { skill: 'Creativity', score: stats.creativityScore * 10 },
      { skill: 'Fine Motor', score: stats.fineMotorScore },
      { skill: 'Emotional', score: stats.emotionalAwareness }
    ];
  }, [stats]);

  if (!stats) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Loading progress data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl"
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          {childName}'s Learning Journey
        </h1>
        <p className="text-gray-600">Comprehensive progress tracking and insights</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Overall Progress"
          value={`${stats.overallScore}%`}
          color="from-blue-500 to-cyan-600"
          progress={stats.overallScore}
        />
        <StatCard
          icon={Trophy}
          label="Achievements"
          value={stats.totalAchievements}
          color="from-yellow-400 to-orange-500"
        />
        <StatCard
          icon={BookOpen}
          label="This Week"
          value={`${stats.weeklyActivities} activities`}
          color="from-green-500 to-emerald-600"
        />
        <StatCard
          icon={Heart}
          label="Favorite"
          value={stats.favoriteActivity}
          color="from-pink-500 to-rose-600"
          isText
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="emotional">Emotional</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Skills Radar Chart */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
              <CardHeader>
                <CardTitle>Skills Development</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={skillsRadarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Radar name="Progress" dataKey="score" stroke="#8b5cf6" fill="#c4b5fd" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Activity Chart */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
              <CardHeader>
                <CardTitle>7-Day Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={last7Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="entries" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentAchievements.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentAchievements.map((achievement, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-yellow-200"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{achievement.achievement_name}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(achievement.earned_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Achievements will appear here as your child learns!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <ModuleCard
            title="📐 Math"
            level={stats.mathLevel}
            progress={stats.mathAccuracy}
            details={[
              { label: 'Problems Solved', value: stats.mathProblems },
              { label: 'Concepts Mastered', value: stats.mathConcepts },
              { label: 'Accuracy Rate', value: `${stats.mathAccuracy}%` }
            ]}
            struggling={stats.mathStruggles}
            color="from-blue-500 to-cyan-600"
          />

          <ModuleCard
            title="📖 Reading & Letters"
            level={stats.lettersLearned}
            progress={stats.phonicsAccuracy}
            details={[
              { label: 'Letters Mastered', value: stats.lettersLearned },
              { label: 'In Progress', value: stats.lettersInProgress },
              { label: 'Reading Level', value: stats.readingLevel },
              { label: 'Phonics Accuracy', value: `${stats.phonicsAccuracy}%` }
            ]}
            color="from-green-500 to-emerald-600"
          />

          <ModuleCard
            title="✏️ Letter Tracing"
            level={stats.lettersTraced}
            progress={stats.tracingAccuracy}
            details={[
              { label: 'Letters Traced', value: stats.lettersTraced },
              { label: 'Accuracy', value: `${stats.tracingAccuracy}%` }
            ]}
            color="from-purple-500 to-indigo-600"
          />

          <ModuleCard
            title="📚 Creative Writing"
            level={stats.vocabularyLevel}
            progress={stats.creativityScore * 10}
            details={[
              { label: 'Stories Created', value: stats.storiesCreated },
              { label: 'Vocabulary Level', value: stats.vocabularyLevel },
              { label: 'Creativity Score', value: `${stats.creativityScore}/10` }
            ]}
            color="from-pink-500 to-rose-600"
          />

          <ModuleCard
            title="🎨 Art & Coloring"
            level={stats.coloringPages}
            progress={stats.fineMotorScore}
            details={[
              { label: 'Pages Completed', value: stats.coloringPages },
              { label: 'Fine Motor Score', value: `${stats.fineMotorScore}%` }
            ]}
            color="from-orange-500 to-amber-600"
          />
        </TabsContent>

        {/* Emotional Tab */}
        <TabsContent value="emotional" className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-purple-600" />
                Emotional Development
              </CardTitle>
              <CardDescription>
                Track {childName}'s emotional awareness and expression
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-purple-900 mb-3">Emotional Awareness Score</h4>
                  <div className="flex items-center gap-4">
                    <Progress value={stats.emotionalAwareness} className="flex-1 h-4" />
                    <span className="text-2xl font-bold text-purple-600">{stats.emotionalAwareness}%</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-purple-900 mb-3">Journal Entries</h4>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-8 h-8 text-purple-500" />
                    <span className="text-3xl font-bold text-purple-600">{stats.journalEntries}</span>
                    <span className="text-gray-600">entries</span>
                  </div>
                </div>
              </div>

              {/* Mood Trend Chart */}
              <div>
                <h4 className="font-semibold text-purple-900 mb-3">Weekly Mood Trend</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={last7Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Journal Moods */}
              <div>
                <h4 className="font-semibold text-purple-900 mb-3">Recent Moods</h4>
                <div className="flex flex-wrap gap-2">
                  {journalEntries.slice(0, 10).map((entry, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex flex-col items-center"
                    >
                      <div className="text-3xl mb-1">{entry.mood_emoji}</div>
                      <span className="text-xs text-gray-600 capitalize">{entry.mood}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4">
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-600" />
                Learning Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <MilestoneItem
                  icon="🔢"
                  title="Math Beginner"
                  description="Solved first 10 math problems"
                  achieved={stats.mathProblems >= 10}
                  progress={Math.min(100, (stats.mathProblems / 10) * 100)}
                />
                
                <MilestoneItem
                  icon="📖"
                  title="Alphabet Explorer"
                  description="Learned 10 letters"
                  achieved={stats.lettersLearned >= 10}
                  progress={Math.min(100, (stats.lettersLearned / 10) * 100)}
                />
                
                <MilestoneItem
                  icon="✏️"
                  title="Tracing Master"
                  description="Traced 15 letters"
                  achieved={stats.lettersTraced >= 15}
                  progress={Math.min(100, (stats.lettersTraced / 15) * 100)}
                />
                
                <MilestoneItem
                  icon="📚"
                  title="Young Author"
                  description="Created 5 stories"
                  achieved={stats.storiesCreated >= 5}
                  progress={Math.min(100, (stats.storiesCreated / 5) * 100)}
                />
                
                <MilestoneItem
                  icon="🎨"
                  title="Art Enthusiast"
                  description="Completed 20 coloring pages"
                  achieved={stats.coloringPages >= 20}
                  progress={Math.min(100, (stats.coloringPages / 20) * 100)}
                />
                
                <MilestoneItem
                  icon="📓"
                  title="Journal Keeper"
                  description="Wrote 10 journal entries"
                  achieved={stats.journalEntries >= 10}
                  progress={Math.min(100, (stats.journalEntries / 10) * 100)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InsightCard
                title="🎯 Strengths"
                insights={[
                  stats.mathAccuracy > 80 && 'Excelling in mathematics with high accuracy',
                  stats.creativityScore > 7 && 'Shows strong creative thinking and imagination',
                  stats.emotionalAwareness > 70 && 'Demonstrates excellent emotional awareness',
                  stats.lettersLearned > 15 && 'Making great progress in reading and letter recognition'
                ].filter(Boolean)}
                color="bg-green-50 border-green-300"
              />

              <InsightCard
                title="📈 Areas of Growth"
                insights={[
                  stats.mathStruggles.length > 0 && `Working on: ${stats.mathStruggles.join(', ')}`,
                  stats.tracingAccuracy < 70 && 'Letter tracing could use more practice',
                  stats.phonicsAccuracy < 60 && 'Phonics skills developing - keep practicing!'
                ].filter(Boolean)}
                color="bg-blue-50 border-blue-300"
              />

              <InsightCard
                title="💡 Recommendations"
                insights={[
                  stats.weeklyActivities < 5 && 'Aim for 5-7 activities per week for optimal learning',
                  stats.journalEntries < stats.weeklyActivities && 'Encourage daily journaling to boost emotional development',
                  stats.fineMotorScore < 60 && 'More coloring/tracing activities can improve fine motor skills',
                  'Continue celebrating small wins to build confidence!'
                ]}
                color="bg-purple-50 border-purple-300"
              />
            </CardContent>
          </Card>

          {/* Export & Share */}
          <div className="flex gap-3">
            <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
              <Download className="w-5 h-5 mr-2" />
              Export Progress Report
            </Button>
            <Button variant="outline" className="border-2 border-purple-400">
              <Share2 className="w-5 h-5 mr-2" />
              Share with Teacher
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, progress, isText }) {
  return (
    <Card className={`bg-gradient-to-br ${color} text-white border-0 shadow-xl`}>
      <CardContent className="p-6 text-center">
        <Icon className="w-8 h-8 mx-auto mb-2 opacity-90" />
        <div className={`${isText ? 'text-lg' : 'text-3xl'} font-bold mb-1`}>
          {value}
        </div>
        <div className="text-sm opacity-90 mb-2">{label}</div>
        {progress !== undefined && (
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-white"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ModuleCard({ title, level, progress, details, struggling, color }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Badge className={`bg-gradient-to-r ${color} text-white`}>
            Level {level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold">Progress</span>
            <span className="text-purple-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {details.map((detail, idx) => (
            <div key={idx} className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-600 mb-1">{detail.label}</p>
              <p className="text-lg font-bold text-purple-900">{detail.value}</p>
            </div>
          ))}
        </div>

        {struggling && struggling.length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
            <p className="text-xs font-semibold text-yellow-800 mb-2">💡 Working On:</p>
            <div className="flex flex-wrap gap-2">
              {struggling.map((item, idx) => (
                <Badge key={idx} className="bg-yellow-200 text-yellow-800">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MilestoneItem({ icon, title, description, achieved, progress }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-xl border-2 transition-all ${
        achieved 
          ? 'bg-green-50 border-green-400'
          : 'bg-gray-50 border-gray-300'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`text-4xl ${achieved ? 'grayscale-0' : 'grayscale opacity-50'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-gray-800">{title}</h4>
            {achieved && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring' }}
              >
                <CheckCircle className="w-6 h-6 text-green-600" />
              </motion.div>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <div className="flex items-center gap-3">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm font-bold text-purple-600">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InsightCard({ title, insights, color }) {
  return (
    <div className={`p-4 rounded-xl border-2 ${color}`}>
      <h4 className="font-bold text-gray-800 mb-3">{title}</h4>
      {insights.length > 0 ? (
        <ul className="space-y-2">
          {insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
              <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 italic">Keep learning to unlock insights!</p>
      )}
    </div>
  );
}
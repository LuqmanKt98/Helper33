import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HandHeart, Sparkles, Brain, Star, Trophy, Lightbulb,
  BookOpen, Calculator, Shapes, Palette,
  TrendingUp, Target, Play, Lock,
  Loader2, Wand2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Import individual Montessori modules
import MontessoriMath from './montessori/MontessoriMath';
import MontessoriLetters from './montessori/MontessoriLetters';
import MontessoriShapes from './montessori/MontessoriShapes';
import MontessoriStories from './montessori/MontessoriStories';
import MontessoriPracticalLife from './montessori/MontessoriPracticalLife';

export default function MontessoriSpace() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [montessoriProgress, setMontessoriProgress] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [learningPath, setLearningPath] = useState(null);

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      const progress = userData?.montessori_progress || {
        total_activities_completed: 0,
        current_level: 1,
        modules: {
          math: { level: 1, completed_activities: 0, last_score: 0 },
          letters: { level: 1, completed_activities: 0, mastered_letters: [] },
          shapes: { level: 1, completed_activities: 0, mastered_shapes: [] },
          stories: { level: 1, completed_activities: 0, stories_created: 0 },
          practical_life: { level: 1, completed_activities: 0, skills_learned: [] }
        },
        interests: [],
        learning_style: 'balanced',
        last_activity_date: null
      };
      
      setMontessoriProgress(progress);
      setLoading(false);
    } catch (error) {
      console.warn('User not authenticated:', error);
      setUser(null);
      setMontessoriProgress({
        total_activities_completed: 0,
        current_level: 1,
        modules: {
          math: { level: 1, completed_activities: 0, last_score: 0 },
          letters: { level: 1, completed_activities: 0, mastered_letters: [] },
          shapes: { level: 1, completed_activities: 0, mastered_shapes: [] },
          stories: { level: 1, completed_activities: 0, stories_created: 0 },
          practical_life: { level: 1, completed_activities: 0, skills_learned: [] }
        },
        interests: [],
        learning_style: 'balanced',
        last_activity_date: null
      });
      setLoading(false);
    }
  };

  const generatePersonalizedLearningPath = async () => {
    setIsGeneratingPath(true);
    
    try {
      const childAge = user?.kids_studio_stats?.child_age || 5;
      const childName = user?.full_name || user?.kids_studio_stats?.child_name || 'Friend';
      
      const prompt = `You are an expert Montessori educator. Analyze this child's learning progress and create a personalized learning path.

CHILD PROFILE:
- Name: ${childName}
- Age: ${childAge} years old
- Overall Level: ${montessoriProgress.current_level}
- Total Activities Completed: ${montessoriProgress.total_activities_completed}

CURRENT PROGRESS BY MODULE:
**Math:** Level ${montessoriProgress.modules.math.level}, ${montessoriProgress.modules.math.completed_activities} activities, Last Score: ${montessoriProgress.modules.math.last_score}%
**Letters:** Level ${montessoriProgress.modules.letters.level}, Mastered: ${montessoriProgress.modules.letters.mastered_letters?.join(', ') || 'None yet'}
**Shapes:** Level ${montessoriProgress.modules.shapes.level}, Mastered: ${montessoriProgress.modules.shapes.mastered_shapes?.join(', ') || 'None yet'}
**Stories:** ${montessoriProgress.modules.stories.stories_created} stories created
**Practical Life:** ${montessoriProgress.modules.practical_life.skills_learned?.join(', ') || 'Just starting'}

Create a personalized learning path with:
1. **Recommended Next Activities** - 5 specific activities across modules that match their current level
2. **Focus Areas** - Which 2-3 modules need attention
3. **Strengths** - What they're excelling at
4. **Challenge Level** - Activities to stretch their skills
5. **Fun Breaks** - Creative activities to maintain engagement

Format as JSON with keys: recommended_activities (array with module, activity_name, difficulty, why_recommended), focus_areas (array), strengths (array), challenge_activities (array), fun_activities (array).`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            recommended_activities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  module: { type: 'string' },
                  activity_name: { type: 'string' },
                  difficulty: { type: 'string' },
                  why_recommended: { type: 'string' }
                }
              }
            },
            focus_areas: { type: 'array', items: { type: 'string' } },
            strengths: { type: 'array', items: { type: 'string' } },
            challenge_activities: { type: 'array', items: { type: 'string' } },
            fun_activities: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setLearningPath(response);
      toast.success('✨ Personalized learning path created!');
    } catch (error) {
      console.error('Error generating learning path:', error);
      toast.error('Could not generate learning path. Please try again.');
    } finally {
      setIsGeneratingPath(false);
    }
  };

  const updateProgress = async (module, activityData) => {
    const updatedProgress = { ...montessoriProgress };
    
    // Update module-specific progress
    if (module === 'math') {
      updatedProgress.modules.math.completed_activities += 1;
      updatedProgress.modules.math.last_score = activityData.score || 0;
      
      // Level up if they've completed 5 activities with 80%+ average
      if (updatedProgress.modules.math.completed_activities % 5 === 0 && 
          activityData.score >= 80) {
        updatedProgress.modules.math.level += 1;
        toast.success(`🎉 Math Level Up! Now at Level ${updatedProgress.modules.math.level}`);
      }
    } else if (module === 'letters') {
      updatedProgress.modules.letters.completed_activities += 1;
      if (activityData.masteredLetter && 
          !updatedProgress.modules.letters.mastered_letters.includes(activityData.masteredLetter)) {
        updatedProgress.modules.letters.mastered_letters.push(activityData.masteredLetter);
      }
      
      // Level up every 5 letters mastered
      const letterCount = updatedProgress.modules.letters.mastered_letters.length;
      const newLevel = Math.floor(letterCount / 5) + 1;
      if (newLevel > updatedProgress.modules.letters.level) {
        updatedProgress.modules.letters.level = newLevel;
        toast.success(`🎉 Letters Level Up! Now at Level ${newLevel}`);
      }
    } else if (module === 'shapes') {
      updatedProgress.modules.shapes.completed_activities += 1;
      if (activityData.masteredShape && 
          !updatedProgress.modules.shapes.mastered_shapes.includes(activityData.masteredShape)) {
        updatedProgress.modules.shapes.mastered_shapes.push(activityData.masteredShape);
      }
    } else if (module === 'stories') {
      updatedProgress.modules.stories.completed_activities += 1;
      updatedProgress.modules.stories.stories_created += 1;
    } else if (module === 'practical_life') {
      updatedProgress.modules.practical_life.completed_activities += 1;
      if (activityData.skillLearned && 
          !updatedProgress.modules.practical_life.skills_learned.includes(activityData.skillLearned)) {
        updatedProgress.modules.practical_life.skills_learned.push(activityData.skillLearned);
      }
    }
    
    // Update overall progress
    updatedProgress.total_activities_completed += 1;
    updatedProgress.last_activity_date = new Date().toISOString();
    
    // Calculate overall level (average of all module levels)
    const avgLevel = Math.floor(
      (updatedProgress.modules.math.level +
       updatedProgress.modules.letters.level +
       updatedProgress.modules.shapes.level) / 3
    );
    updatedProgress.current_level = avgLevel;
    
    setMontessoriProgress(updatedProgress);
    
    // Save to user profile
    if (user) {
      try {
        await base44.auth.updateMe({ montessori_progress: updatedProgress });
      } catch (error) {
        console.warn('Could not save progress:', error);
      }
    }
  };

  const modules = [
    {
      id: 'math',
      title: 'Math & Logic',
      description: 'Count, add, subtract, and solve problems!',
      icon: Calculator,
      color: 'from-blue-500 to-cyan-500',
      component: MontessoriMath,
      level: montessoriProgress?.modules.math.level || 1,
      completed: montessoriProgress?.modules.math.completed_activities || 0
    },
    {
      id: 'letters',
      title: 'Letters & Reading',
      description: 'Learn letters, sounds, and reading!',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
      component: MontessoriLetters,
      level: montessoriProgress?.modules.letters.level || 1,
      completed: montessoriProgress?.modules.letters.completed_activities || 0
    },
    {
      id: 'shapes',
      title: 'Shapes & Geometry',
      description: 'Explore shapes, patterns, and spatial thinking!',
      icon: Shapes,
      color: 'from-green-500 to-emerald-500',
      component: MontessoriShapes,
      level: montessoriProgress?.modules.shapes.level || 1,
      completed: montessoriProgress?.modules.shapes.completed_activities || 0
    },
    {
      id: 'stories',
      title: 'Creative Writing',
      description: 'Create stories and express yourself!',
      icon: Palette,
      color: 'from-orange-500 to-red-500',
      component: MontessoriStories,
      level: montessoriProgress?.modules.stories.level || 1,
      completed: montessoriProgress?.modules.stories.stories_created || 0
    },
    {
      id: 'practical_life',
      title: 'Practical Life Skills',
      description: 'Learn everyday skills and independence!',
      icon: HandHeart,
      color: 'from-amber-500 to-yellow-500',
      component: MontessoriPracticalLife,
      level: montessoriProgress?.modules.practical_life.level || 1,
      completed: montessoriProgress?.modules.practical_life.completed_activities || 0
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (currentModule) {
    const ModuleComponent = currentModule.component;
    return (
      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl min-h-[600px]">
        <Button
          onClick={() => setCurrentModule(null)}
          variant="outline"
          className="mb-4"
        >
          ← Back to Montessori Modules
        </Button>
        
        <ModuleComponent
          progress={montessoriProgress?.modules[currentModule.id]}
          onComplete={(activityData) => {
            updateProgress(currentModule.id, activityData);
            toast.success(`Great job! +10 points earned!`);
          }}
          childAge={user?.kids_studio_stats?.child_age || 5}
          childName={user?.full_name || 'Friend'}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl min-h-[600px]">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block"
        >
          <div className="relative w-20 h-20 mx-auto mb-4">
            <HandHeart className="w-20 h-20 text-amber-600" />
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
        </motion.div>
        
        <h2 className="text-3xl font-bold text-amber-900 mb-2">Montessori Learning Space</h2>
        <p className="text-amber-700 max-w-2xl mx-auto">
          Self-directed learning activities that adapt to your progress. Learn at your own pace!
        </p>
        
        {/* Overall Progress */}
        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 px-4 py-2">
            <Star className="w-4 h-4 mr-1" />
            Level {montessoriProgress?.current_level || 1}
          </Badge>
          <Badge className="bg-green-100 text-green-800 border-green-300 px-4 py-2">
            <Trophy className="w-4 h-4 mr-1" />
            {montessoriProgress?.total_activities_completed || 0} Activities
          </Badge>
        </div>
      </div>

      {/* AI Learning Path */}
      <Card className="mb-8 border-2 border-amber-300 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI Personalized Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!learningPath ? (
            <div className="text-center py-6">
              <Wand2 className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-gray-700 mb-4">
                Let AI analyze your progress and create a personalized learning path!
              </p>
              <Button
                onClick={generatePersonalizedLearningPath}
                disabled={isGeneratingPath}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isGeneratingPath ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Your Path...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate My Learning Path
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Strengths */}
              {learningPath.strengths?.length > 0 && (
                <div>
                  <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Your Strengths:
                  </h4>
                  <div className="space-y-1">
                    {learningPath.strengths.map((strength, idx) => (
                      <p key={idx} className="text-sm text-gray-700">
                        ✨ {strength}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Focus Areas */}
              {learningPath.focus_areas?.length > 0 && (
                <div>
                  <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Areas to Focus On:
                  </h4>
                  <div className="space-y-1">
                    {learningPath.focus_areas.map((area, idx) => (
                      <p key={idx} className="text-sm text-gray-700">
                        🎯 {area}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Activities */}
              {learningPath.recommended_activities?.length > 0 && (
                <div>
                  <h4 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Recommended Next Steps:
                  </h4>
                  <div className="space-y-2">
                    {learningPath.recommended_activities.slice(0, 5).map((activity, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border-2 border-purple-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{activity.activity_name}</p>
                            <p className="text-xs text-gray-600 mt-1">{activity.why_recommended}</p>
                          </div>
                          <Badge className={`${
                            activity.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            activity.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {activity.difficulty}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={generatePersonalizedLearningPath}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh Learning Path
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => {
          const Icon = module.icon;
          const isLocked = module.level > montessoriProgress.current_level + 2;
          
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: isLocked ? 1 : 1.05, y: isLocked ? 0 : -5 }}
              whileTap={{ scale: isLocked ? 1 : 0.98 }}
            >
              <Card 
                className={`cursor-pointer h-full border-2 transition-all duration-300 ${
                  isLocked 
                    ? 'opacity-60 cursor-not-allowed bg-gray-100 border-gray-300' 
                    : 'hover:shadow-xl border-amber-300 bg-white'
                }`}
                onClick={() => !isLocked && setCurrentModule(module)}
              >
                <CardContent className="p-6">
                  {/* Module Icon */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${module.color} flex items-center justify-center`}>
                    {isLocked ? (
                      <Lock className="w-8 h-8 text-white" />
                    ) : (
                      <Icon className="w-8 h-8 text-white" />
                    )}
                  </div>

                  {/* Module Title */}
                  <h3 className="font-bold text-xl text-center text-gray-900 mb-2">
                    {module.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-center text-gray-600 mb-4">
                    {module.description}
                  </p>

                  {/* Progress Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Level</span>
                      <Badge className="bg-amber-100 text-amber-800">
                        {module.level}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-bold text-gray-900">{module.completed}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4">
                    {isLocked ? (
                      <Badge className="w-full justify-center bg-gray-200 text-gray-600">
                        <Lock className="w-3 h-3 mr-1" />
                        Unlock at Level {module.level - 1}
                      </Badge>
                    ) : (
                      <Button className={`w-full bg-gradient-to-r ${module.color} hover:opacity-90`}>
                        <Play className="w-4 h-4 mr-2" />
                        Start Learning
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Overview */}
      <Card className="mt-8 border-2 border-amber-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Your Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(montessoriProgress?.modules || {}).map(([key, data]) => (
              <div key={key} className="text-center p-3 bg-white rounded-lg border-2 border-amber-200">
                <p className="text-xs text-gray-600 mb-1 capitalize">{key.replace('_', ' ')}</p>
                <p className="text-2xl font-bold text-amber-700">L{data.level}</p>
                <p className="text-xs text-gray-500 mt-1">{data.completed_activities} done</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
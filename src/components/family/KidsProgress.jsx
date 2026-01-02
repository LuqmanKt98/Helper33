import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HandTracingProgress from '../kids_studio/HandTracingProgress';
import KidsJournalProgress from '../kids_studio/KidsJournalProgress';
import { BookOpen, Heart, GraduationCap, Target, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

export default function KidsProgress({ familyMembers }) {
  const [selectedChild, setSelectedChild] = useState(null);

  // Filter for child members
  const childMembers = familyMembers.filter(member => 
    member.role === 'ChildMember' || (member.age && member.age < 18)
  );

  useEffect(() => {
    if (childMembers.length > 0 && !selectedChild) {
      setSelectedChild(childMembers[0]);
    }
  }, [childMembers.length]);

  // Load the child's ChildProgress record to sync with User data
  const { data: childProgress } = useQuery({
    queryKey: ['childProgress', selectedChild?.id],
    queryFn: async () => {
      if (!selectedChild) return null;
      const progressRecords = await base44.entities.ChildProgress.filter({ 
        child_member_id: selectedChild.id 
      });
      return progressRecords[0] || null;
    },
    enabled: !!selectedChild
  });

  // Load user data if child has user_id
  const { data: childUser } = useQuery({
    queryKey: ['childUser', selectedChild?.user_id],
    queryFn: async () => {
      if (!selectedChild?.user_id) return null;
      try {
        const users = await base44.entities.User.filter({ id: selectedChild.user_id });
        return users[0] || null;
      } catch {
        return null;
      }
    },
    enabled: !!selectedChild?.user_id
  });

  if (childMembers.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No children in the family yet</h3>
          <p className="text-sm text-gray-500 mt-2">Add child members to track their progress!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-purple-800 mb-2">Kids Progress Tracker 📊</h2>
        <p className="text-gray-600">Monitor your children's learning and wellbeing journey</p>
      </div>

      {/* Child Selector */}
      {childMembers.length > 1 && (
        <div className="flex gap-3 flex-wrap justify-center">
          {childMembers.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all shadow-md ${
                selectedChild?.id === child.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: selectedChild?.id === child.id ? 'rgba(255,255,255,0.3)' : child.color || '#8b5cf6' }}
              >
                {child.emoji || '👤'}
              </div>
              <span>{child.name}</span>
            </button>
          ))}
        </div>
      )}

      {selectedChild && (
        <>
          {/* Child Header Card */}
          <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg"
                  style={{ backgroundColor: selectedChild.color || '#8b5cf6' }}
                >
                  {selectedChild.emoji || '👤'}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800">{selectedChild.name}</h3>
                  <p className="text-gray-600">Age: {selectedChild.age}</p>
                  {selectedChild.user_id && (
                    <Badge className="bg-green-100 text-green-700 mt-1">
                      Active Account
                    </Badge>
                  )}
                </div>
                {childProgress && (
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Overall Progress</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {childProgress.overall_progress_score || 0}%
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress Tabs */}
          <Tabs defaultValue="journal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="journal" className="gap-2">
                <Heart className="w-4 h-4" />
                Feelings Journal
              </TabsTrigger>
              <TabsTrigger value="letters" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Letter Progress
              </TabsTrigger>
              <TabsTrigger value="skills" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Learning Skills
              </TabsTrigger>
            </TabsList>

            <TabsContent value="journal">
              <KidsJournalProgress childMemberId={selectedChild.id} />
            </TabsContent>

            <TabsContent value="letters">
              <HandTracingProgress 
                mode="parent"
                childMemberId={selectedChild.id}
                completedLetters={childUser?.hand_tracing_progress?.completed_letters || childProgress?.module_progress?.tracing?.letters_traced || []}
              />
            </TabsContent>

            <TabsContent value="skills">
              {childProgress ? (
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-6 h-6 text-blue-600" />
                      Learning Skills Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Module Progress */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {childProgress.module_progress && Object.entries(childProgress.module_progress).map(([moduleName, moduleData]) => (
                        <Card key={moduleName} className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                          <CardContent className="p-4">
                            <h4 className="font-bold text-gray-800 capitalize mb-2 flex items-center gap-2">
                              {moduleName === 'math' && <span>🔢</span>}
                              {moduleName === 'letters' && <span>📝</span>}
                              {moduleName === 'shapes' && <span>🔷</span>}
                              {moduleName === 'creative_writing' && <span>✍️</span>}
                              {moduleName.replace('_', ' ')}
                            </h4>
                            <div className="space-y-2 text-sm">
                              {moduleData.level && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Level:</span>
                                  <Badge>{moduleData.level}</Badge>
                                </div>
                              )}
                              {moduleData.accuracy_rate !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Accuracy:</span>
                                  <span className="font-bold text-green-600">{Math.round(moduleData.accuracy_rate)}%</span>
                                </div>
                              )}
                              {moduleData.last_practiced && (
                                <div className="text-xs text-gray-500">
                                  Last practiced: {new Date(moduleData.last_practiced).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Achievements */}
                    {childProgress.achievements && childProgress.achievements.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <Award className="w-5 h-5 text-yellow-500" />
                          Recent Achievements
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {childProgress.achievements.slice(0, 4).map((achievement, idx) => (
                            <div key={idx} className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
                              <div className="font-semibold text-gray-800">{achievement.achievement_name}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(achievement.earned_date).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weekly Summary */}
                    {childProgress.weekly_summary && (
                      <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{childProgress.weekly_summary.activities_completed}</div>
                          <div className="text-xs text-gray-600">Activities</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{childProgress.weekly_summary.total_time_minutes}m</div>
                          <div className="text-xs text-gray-600">Learning Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{childProgress.weekly_summary.points_earned}</div>
                          <div className="text-xs text-gray-600">Points</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="text-center py-12">
                    <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No learning progress data yet. Start exploring Kids Creative Studio!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Sparkles,
  UserPlus,
  Target,
  Heart,
  Users,
  Star,
  Filter,
  Search,
  X,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function BuddyMatchmaking({ currentUser, existingBuddies = [] }) {
  const queryClient = useQueryClient();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    goalCategories: [],
    supportTypes: [],
    journeyStage: 'all',
    activityLevel: 'all',
    checkInFrequency: 'all'
  });

  const { data: userProfile } = useQuery({
    queryKey: ['communityProfile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserCommunityProfile.filter({
        created_by: currentUser.email
      });
      return profiles[0];
    },
    enabled: !!currentUser
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allCommunityProfiles'],
    queryFn: () => base44.entities.UserCommunityProfile.list('-last_active'),
    enabled: !!currentUser
  });

  const calculateCompatibility = (profile) => {
    if (!userProfile) return 50;
    
    let score = 0;
    let maxScore = 0;

    const sharedInterests = (userProfile.interests || []).filter(i => 
      (profile.interests || []).includes(i)
    );
    maxScore += 30;
    score += (sharedInterests.length / Math.max(userProfile.interests?.length || 1, 1)) * 30;

    const sharedGoals = (userProfile.goal_categories || []).filter(g => 
      (profile.goal_categories || []).includes(g)
    );
    maxScore += 25;
    score += (sharedGoals.length / Math.max(userProfile.goal_categories?.length || 1, 1)) * 25;

    const sharedSupport = (userProfile.support_preferences || []).filter(s => 
      (profile.support_preferences || []).includes(s)
    );
    maxScore += 20;
    score += (sharedSupport.length / Math.max(userProfile.support_preferences?.length || 1, 1)) * 20;

    maxScore += 15;
    if (userProfile.journey_stage === profile.journey_stage) {
      score += 15;
    } else {
      const stageOrder = ['just_started', 'building_momentum', 'consistent', 'thriving', 'maintaining'];
      const userIdx = stageOrder.indexOf(userProfile.journey_stage);
      const profileIdx = stageOrder.indexOf(profile.journey_stage);
      const diff = Math.abs(userIdx - profileIdx);
      score += Math.max(0, 15 - (diff * 5));
    }

    maxScore += 10;
    if (userProfile.activity_level === profile.activity_level) {
      score += 10;
    } else {
      score += 5;
    }

    return Math.round((score / maxScore) * 100);
  };

  const potentialMatches = allProfiles
    .filter(profile => {
      if (profile.created_by === currentUser?.email) return false;
      if (existingBuddies.some(b => 
        b.buddy_email === profile.created_by || b.requester_email === profile.created_by
      )) return false;
      if (!profile.is_open_to_new_connections) return false;
      if (!profile.matchmaking_enabled) return false;
      if (searchTerm && !profile.display_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.goalCategories.length > 0) {
        const hasMatch = filters.goalCategories.some(cat => 
          (profile.goal_categories || []).includes(cat)
        );
        if (!hasMatch) return false;
      }
      if (filters.supportTypes.length > 0) {
        const hasMatch = filters.supportTypes.some(type => 
          (profile.support_preferences || []).includes(type)
        );
        if (!hasMatch) return false;
      }
      if (filters.journeyStage !== 'all' && profile.journey_stage !== filters.journeyStage) {
        return false;
      }
      if (filters.activityLevel !== 'all' && profile.activity_level !== filters.activityLevel) {
        return false;
      }
      if (filters.checkInFrequency !== 'all') {
        const preferredFreq = profile.buddy_preferences?.preferred_check_in_frequency;
        if (preferredFreq !== filters.checkInFrequency) return false;
      }
      return true;
    })
    .map(profile => {
      const compatibilityScore = calculateCompatibility(profile);
      const sharedInterests = (userProfile.interests || []).filter(i => 
        (profile.interests || []).includes(i)
      );
      const sharedGoals = (userProfile.goal_categories || []).filter(g => 
        (profile.goal_categories || []).includes(g)
      );
      return {
        ...profile,
        compatibilityScore,
        sharedInterests,
        sharedGoals
      };
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, 20);

  const requestBuddyMutation = useMutation({
    mutationFn: (data) => base44.entities.BuddyConnection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['buddyConnections']);
      setShowRequestModal(false);
      setSelectedMatch(null);
      setConnectionMessage('');
      toast.success('Buddy request sent! 🤝');
    }
  });

  const handleSendRequest = () => {
    if (!connectionMessage.trim()) {
      toast.error('Please add a message to your request');
      return;
    }

    requestBuddyMutation.mutate({
      requester_email: currentUser.email,
      requester_name: currentUser.full_name,
      requester_avatar: currentUser.avatar_url,
      buddy_email: selectedMatch.created_by,
      buddy_name: selectedMatch.display_name,
      buddy_avatar: selectedMatch.avatar_url,
      connection_type: 'goal_accountability',
      connection_message: connectionMessage,
      status: 'pending',
      compatibility_score: selectedMatch.compatibilityScore
    });
  };

  const clearFilters = () => {
    setFilters({
      goalCategories: [],
      supportTypes: [],
      journeyStage: 'all',
      activityLevel: 'all',
      checkInFrequency: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = 
    filters.goalCategories.length > 0 ||
    filters.supportTypes.length > 0 ||
    filters.journeyStage !== 'all' ||
    filters.activityLevel !== 'all' ||
    filters.checkInFrequency !== 'all' ||
    searchTerm !== '';

  if (!userProfile || !userProfile.profile_completed) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Your Profile First</h3>
          <p className="text-gray-600 mb-4">
            Set up your community profile to get personalized buddy matches
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-purple-600" />
            Discover Your Perfect Match
          </h3>
          <p className="text-gray-600 mt-1">
            AI-powered matchmaking based on your goals and preferences
          </p>
        </div>
      </div>

      <Card className="bg-white border-2 border-purple-200">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
              
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value && !filters.goalCategories.includes(e.target.value)) {
                    setFilters({
                      ...filters,
                      goalCategories: [...filters.goalCategories, e.target.value]
                    });
                  }
                }}
                className="text-sm border rounded-lg px-3 py-1"
              >
                <option value="">+ Goal Focus</option>
                <option value="emotional_healing">Emotional Healing</option>
                <option value="daily_functioning">Daily Functioning</option>
                <option value="relationships">Relationships</option>
                <option value="self_care">Self Care</option>
                <option value="habit_building">Habit Building</option>
                <option value="personal_growth">Personal Growth</option>
              </select>

              <select
                value={filters.journeyStage}
                onChange={(e) => setFilters({ ...filters, journeyStage: e.target.value })}
                className="text-sm border rounded-lg px-3 py-1"
              >
                <option value="all">Any Stage</option>
                <option value="just_started">Just Started</option>
                <option value="building_momentum">Building Momentum</option>
                <option value="consistent">Consistent</option>
                <option value="thriving">Thriving</option>
              </select>

              <select
                value={filters.activityLevel}
                onChange={(e) => setFilters({ ...filters, activityLevel: e.target.value })}
                className="text-sm border rounded-lg px-3 py-1"
              >
                <option value="all">Any Activity</option>
                <option value="very_active">Very Active</option>
                <option value="active">Active</option>
                <option value="moderate">Moderate</option>
                <option value="occasional">Occasional</option>
              </select>

              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-purple-600"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {filters.goalCategories.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {filters.goalCategories.map(cat => (
                  <Badge
                    key={cat}
                    className="bg-purple-100 text-purple-800 flex items-center gap-1"
                  >
                    {cat.replace(/_/g, ' ')}
                    <button
                      onClick={() => setFilters({
                        ...filters,
                        goalCategories: filters.goalCategories.filter(c => c !== cat)
                      })}
                      className="ml-1 hover:bg-purple-200 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Found <span className="font-bold text-purple-600">{potentialMatches.length}</span> potential matches
        </p>
        {potentialMatches.length > 0 && (
          <Badge className="bg-green-100 text-green-800">
            Top matches sorted by compatibility
          </Badge>
        )}
      </div>

      {potentialMatches.length === 0 ? (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Matches Found</h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your filters or search terms'
                : 'Check back later as more users join the community'
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {potentialMatches.map((match) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
            >
              <Card className="bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {match.avatar_url ? (
                        <img
                          src={match.avatar_url}
                          alt={match.display_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{match.display_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            {match.journey_stage?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className={`text-2xl font-bold ${
                        match.compatibilityScore >= 80 ? 'text-green-600' :
                        match.compatibilityScore >= 60 ? 'text-blue-600' :
                        match.compatibilityScore >= 40 ? 'text-amber-600' :
                        'text-gray-600'
                      }`}>
                        {match.compatibilityScore}%
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className={`w-4 h-4 ${
                          match.compatibilityScore >= 80 ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <span className="text-xs text-gray-600">Match</span>
                      </div>
                    </div>
                  </div>

                  {match.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{match.bio}</p>
                  )}

                  {match.sharedInterests && match.sharedInterests.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-pink-500" />
                        Shared Interests ({match.sharedInterests.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {match.sharedInterests.slice(0, 3).map(interest => (
                          <Badge key={interest} className="bg-pink-100 text-pink-800 text-xs">
                            {interest}
                          </Badge>
                        ))}
                        {match.sharedInterests.length > 3 && (
                          <Badge className="bg-pink-100 text-pink-800 text-xs">
                            +{match.sharedInterests.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {match.sharedGoals && match.sharedGoals.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Target className="w-3 h-3 text-blue-500" />
                        Shared Goals ({match.sharedGoals.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {match.sharedGoals.slice(0, 2).map(goal => (
                          <Badge key={goal} className="bg-blue-100 text-blue-800 text-xs">
                            {goal.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {match.sharedGoals.length > 2 && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            +{match.sharedGoals.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 bg-purple-50 rounded-lg text-center">
                      <div className="text-sm font-bold text-purple-600">
                        {match.activity_level}
                      </div>
                      <div className="text-xs text-gray-600">Activity</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-center">
                      <div className="text-sm font-bold text-blue-600">
                        {match.buddy_preferences?.preferred_check_in_frequency || 'weekly'}
                      </div>
                      <div className="text-xs text-gray-600">Check-ins</div>
                    </div>
                  </div>

                  {match.compatibilityScore >= 60 && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200 mb-3">
                      <p className="text-xs font-medium text-green-800 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {match.compatibilityScore >= 80 ? 'Excellent' :
                         match.compatibilityScore >= 70 ? 'Great' : 'Good'} match because:
                      </p>
                      <ul className="text-xs text-green-700 mt-1 space-y-1">
                        {match.sharedInterests && match.sharedInterests.length > 0 && (
                          <li>• {match.sharedInterests.length} shared interest{match.sharedInterests.length > 1 ? 's' : ''}</li>
                        )}
                        {match.sharedGoals && match.sharedGoals.length > 0 && (
                          <li>• {match.sharedGoals.length} similar goal{match.sharedGoals.length > 1 ? 's' : ''}</li>
                        )}
                        {userProfile.journey_stage === match.journey_stage && (
                          <li>• Same journey stage</li>
                        )}
                      </ul>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <Button
                    onClick={() => {
                      setSelectedMatch(match);
                      setShowRequestModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Send Request
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Buddy Request</DialogTitle>
          </DialogHeader>

          {selectedMatch && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                {selectedMatch.avatar_url ? (
                  <img
                    src={selectedMatch.avatar_url}
                    alt={selectedMatch.display_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{selectedMatch.display_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {selectedMatch.compatibilityScore}% Compatible
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Why would you like to be accountability buddies?
                </label>
                <Textarea
                  value={connectionMessage}
                  onChange={(e) => setConnectionMessage(e.target.value)}
                  placeholder="Share a bit about your goals and why you think you'd be great buddies..."
                  rows={4}
                />
              </div>

              {selectedMatch.compatibilityScore >= 70 && selectedMatch.sharedGoals && selectedMatch.sharedGoals.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-medium text-blue-800 mb-1">💡 Suggestion:</p>
                  <p className="text-xs text-blue-700">
                    "I noticed we're both working on {selectedMatch.sharedGoals[0]?.replace(/_/g, ' ') || 'similar goals'}
                    {userProfile.interests && userProfile.interests.length > 0 && ` and share an interest in ${userProfile.interests[0]}`}. 
                    I'd love to support each other on this journey!"
                  </p>
                  <Button
                    onClick={() => setConnectionMessage(
                      `Hi! I noticed we're both working on ${selectedMatch.sharedGoals[0]?.replace(/_/g, ' ') || 'similar goals'}${userProfile.interests && userProfile.interests.length > 0 ? ` and share an interest in ${userProfile.interests[0]}` : ''}. I'd love to support each other on this journey!`
                    )}
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-blue-600"
                  >
                    Use this message
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => {
                setShowRequestModal(false);
                setSelectedMatch(null);
                setConnectionMessage('');
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendRequest}
              disabled={requestBuddyMutation.isPending || !connectionMessage.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

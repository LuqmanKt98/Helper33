import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Lock,
  Globe,
  X,
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const CIRCLE_TYPES = [
  { value: 'grief_support', label: 'Grief Support', icon: '💜', color: 'purple' },
  { value: 'life_transitions', label: 'Life Transitions', icon: '🌱', color: 'green' },
  { value: 'wellness_journey', label: 'Wellness Journey', icon: '🌟', color: 'blue' },
  { value: 'parent_support', label: 'Parent Support', icon: '👶', color: 'pink' },
  { value: 'career_growth', label: 'Career Growth', icon: '📈', color: 'indigo' },
  { value: 'general_support', label: 'General Support', icon: '🤝', color: 'amber' }
];

export default function CircleDiscovery({ user }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const { data: circles = [] } = useQuery({
    queryKey: ['supportCircles'],
    queryFn: () => base44.entities.SupportCircle.filter({ is_active: true }),
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ['circleMemberships'],
    queryFn: () => base44.entities.CircleMembership.filter({
      created_by: user?.email
    }),
    enabled: !!user
  });

  const joinCircleMutation = useMutation({
    mutationFn: (data) => base44.entities.CircleMembership.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['circleMemberships']);
      setShowJoinModal(false);
      setSelectedCircle(null);
      setDisplayName('');
      toast.success('Joined circle! 🎉');
    }
  });

  const handleJoinCircle = () => {
    if (!displayName.trim()) {
      toast.error('Please enter a display name');
      return;
    }

    joinCircleMutation.mutate({
      circle_id: selectedCircle.id,
      display_name: displayName,
      is_anonymous: isAnonymous,
      status: selectedCircle.is_private ? 'pending' : 'active'
    });
  };

  // Filter circles
  const filteredCircles = circles.filter(circle => {
    if (searchTerm && !circle.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedType !== 'all' && circle.circle_type !== selectedType) {
      return false;
    }
    return true;
  });

  // Sort by relevance and activity
  const sortedCircles = filteredCircles.sort((a, b) => {
    // Prioritize circles with more members
    return (b.member_count || 0) - (a.member_count || 0);
  });

  const isAlreadyMember = (circleId) => {
    return myMemberships.some(m => m.circle_id === circleId && m.status === 'active');
  };

  const getCircleTypeInfo = (type) => {
    return CIRCLE_TYPES.find(t => t.value === type) || CIRCLE_TYPES[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Globe className="w-7 h-7 text-blue-600" />
          Discover Support Circles
        </h3>
        <p className="text-gray-600 mt-1">
          Find communities of people on similar journeys
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white border-2 border-blue-200">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search circles by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type filters */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Filter className="w-4 h-4" />
                Filter by Type:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedType === 'all'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Types
                </button>
                {CIRCLE_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                      selectedType === type.value
                        ? `bg-${type.color}-600 text-white`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {(searchTerm || selectedType !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                }}
                variant="ghost"
                size="sm"
                className="text-blue-600"
              >
                <X className="w-4 h-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-bold text-blue-600">{sortedCircles.length}</span> circle{sortedCircles.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Circle Cards */}
      {sortedCircles.length === 0 ? (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Circles Found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {sortedCircles.map((circle) => {
            const typeInfo = getCircleTypeInfo(circle.circle_type);
            const isMember = isAlreadyMember(circle.id);

            return (
              <motion.div
                key={circle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
              >
                <Card className={`bg-white border-2 hover:shadow-xl transition-all ${
                  isMember ? 'border-green-300' : 'border-blue-200 hover:border-blue-400'
                }`}>
                  <CardHeader>
                    <div className="flex items-start gap-3 mb-3">
                      {circle.image_url ? (
                        <img
                          src={circle.image_url}
                          alt={circle.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-lg bg-gradient-to-br from-${typeInfo.color}-400 to-${typeInfo.color}-600 flex items-center justify-center text-3xl`}>
                          {typeInfo.icon}
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{circle.name}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`bg-${typeInfo.color}-100 text-${typeInfo.color}-800 text-xs`}>
                            {typeInfo.label}
                          </Badge>
                          {circle.is_private ? (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              Private
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <Globe className="w-3 h-3 mr-1" />
                              Public
                            </Badge>
                          )}
                          {isMember && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Member
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <CardDescription className="line-clamp-2">
                      {circle.description}
                    </CardDescription>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {circle.member_count || 0}
                        </div>
                        <div className="text-xs text-gray-600">Members</div>
                      </div>
                      <div className="p-2 bg-purple-50 rounded-lg text-center">
                        <div className="text-lg font-bold text-purple-600">
                          <MessageCircle className="w-5 h-5 mx-auto" />
                        </div>
                        <div className="text-xs text-gray-600">Active</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {isMember ? (
                      <Button
                        className="w-full bg-green-600"
                        disabled
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Already a Member
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedCircle(circle);
                          setShowJoinModal(true);
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {circle.is_private ? 'Request to Join' : 'Join Circle'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Join Circle Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Join {selectedCircle?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedCircle && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>About this circle:</strong>
                </p>
                <p className="text-sm text-blue-800">
                  {selectedCircle.description}
                </p>
                {selectedCircle.is_private && (
                  <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Your request will be reviewed by moderators
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Display Name in This Circle
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How you want to appear in this circle"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-700">
                  Join anonymously (your real identity won't be shown)
                </label>
              </div>

              {/* Guidelines preview */}
              {selectedCircle.guidelines && selectedCircle.guidelines.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-medium text-gray-900 mb-2">Community Guidelines:</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {selectedCircle.guidelines.slice(0, 3).map((guideline, idx) => (
                      <li key={idx}>• {guideline}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => {
                setShowJoinModal(false);
                setSelectedCircle(null);
                setDisplayName('');
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinCircle}
              disabled={joinCircleMutation.isPending || !displayName.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {selectedCircle?.is_private ? 'Request to Join' : 'Join Circle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
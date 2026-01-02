import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Search,
  UserPlus,
  UserMinus,
  BookOpen,
  MessageCircle,
  Heart,
  Loader2,
  Globe,
  Lock,
  Settings
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function CommunityDiscovery({ currentUser }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInterest, setFilterInterest] = useState('all');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  const { data: communityProfiles = [], isLoading } = useQuery({
    queryKey: ['community-profiles'],
    queryFn: async () => {
      return await base44.entities.CommunityProfile.list('-created_date', 100);
    }
  });

  const { data: currentProfile } = useQuery({
    queryKey: ['my-community-profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      const profiles = await base44.entities.CommunityProfile.filter({ 
        created_by: currentUser.email 
      });
      return profiles[0] || null;
    },
    enabled: !!currentUser
  });

  const createProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      return await base44.entities.CommunityProfile.create({
        ...profileData,
        stats: {
          posts_count: 0,
          comments_count: 0,
          books_completed: 0,
          joined_date: new Date().toISOString()
        },
        following: [],
        followers: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-community-profile']);
      queryClient.invalidateQueries(['community-profiles']);
      toast.success('🎉 Profile created!');
    }
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: async (settings) => {
      return await base44.entities.CommunityProfile.update(currentProfile.id, {
        privacy_settings: settings
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-community-profile']);
      toast.success('🔒 Privacy settings updated!');
      setShowPrivacySettings(false);
    }
  });

  const followUserMutation = useMutation({
    mutationFn: async ({ profileId, targetUserId }) => {
      // Update current user's following
      const currentFollowing = currentProfile.following || [];
      await base44.entities.CommunityProfile.update(currentProfile.id, {
        following: [...currentFollowing, targetUserId]
      });

      // Update target user's followers
      const targetProfile = communityProfiles.find(p => p.id === profileId);
      const targetFollowers = targetProfile.followers || [];
      await base44.entities.CommunityProfile.update(profileId, {
        followers: [...targetFollowers, currentUser.id]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['community-profiles']);
      queryClient.invalidateQueries(['my-community-profile']);
      toast.success('✨ Now following!');
    }
  });

  const unfollowUserMutation = useMutation({
    mutationFn: async ({ profileId, targetUserId }) => {
      // Update current user's following
      const currentFollowing = currentProfile.following || [];
      await base44.entities.CommunityProfile.update(currentProfile.id, {
        following: currentFollowing.filter(id => id !== targetUserId)
      });

      // Update target user's followers
      const targetProfile = communityProfiles.find(p => p.id === profileId);
      const targetFollowers = targetProfile.followers || [];
      await base44.entities.CommunityProfile.update(profileId, {
        followers: targetFollowers.filter(id => id !== currentUser.id)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['community-profiles']);
      queryClient.invalidateQueries(['my-community-profile']);
      toast.success('Unfollowed');
    }
  });

  // Filter profiles based on privacy settings
  const visibleProfiles = communityProfiles.filter(profile => {
    const privacy = profile.privacy_settings?.profile_visibility || 'community_only';
    
    // Public profiles are always visible
    if (privacy === 'public') return true;
    
    // Private profiles only visible to self
    if (privacy === 'private') {
      return profile.created_by === currentUser?.email;
    }
    
    // Community only - visible to logged in users
    if (privacy === 'community_only') {
      return !!currentUser;
    }
    
    return true;
  });

  const filteredProfiles = visibleProfiles.filter(profile => {
    const matchesSearch = 
      profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesInterest = 
      filterInterest === 'all' || 
      profile.interests?.includes(filterInterest);
    
    return matchesSearch && matchesInterest;
  });

  const isFollowing = (profileId) => {
    const targetProfile = communityProfiles.find(p => p.id === profileId);
    return currentProfile?.following?.includes(targetProfile?.created_by);
  };

  if (!currentProfile && currentUser) {
    return <CreateProfilePrompt onCreateProfile={(data) => createProfileMutation.mutate(data)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Community Members
          </h2>
          <p className="text-sm text-gray-600">
            {filteredProfiles.length} seekers on this spiritual journey
          </p>
        </div>
        
        {currentProfile && (
          <Button
            onClick={() => setShowPrivacySettings(true)}
            variant="outline"
            className="border-2 border-purple-300 text-purple-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Privacy Settings
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <Card className="border-2 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-purple-200"
              />
            </div>
            
            <select
              value={filterInterest}
              onChange={(e) => setFilterInterest(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-purple-300 text-purple-700 bg-white hover:bg-purple-50"
            >
              <option value="all">All Interests</option>
              <option value="meditation">Meditation</option>
              <option value="reading">Reading</option>
              <option value="prayer">Prayer</option>
              <option value="mindfulness">Mindfulness</option>
              <option value="philosophy">Philosophy</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Members Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
        </div>
      ) : filteredProfiles.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="pt-6 text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No members found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map((profile, idx) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              currentUser={currentUser}
              currentProfile={currentProfile}
              isFollowing={isFollowing(profile.id)}
              onFollow={() => followUserMutation.mutate({ 
                profileId: profile.id, 
                targetUserId: profile.created_by 
              })}
              onUnfollow={() => unfollowUserMutation.mutate({ 
                profileId: profile.id, 
                targetUserId: profile.created_by 
              })}
              onClick={() => setSelectedProfile(profile)}
              delay={idx * 0.05}
            />
          ))}
        </div>
      )}

      {/* Privacy Settings Modal */}
      <AnimatePresence>
        {showPrivacySettings && currentProfile && (
          <PrivacySettingsModal
            settings={currentProfile.privacy_settings || {}}
            onSave={(settings) => updatePrivacyMutation.mutate(settings)}
            onClose={() => setShowPrivacySettings(false)}
            isLoading={updatePrivacyMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <ProfileDetailModal
            profile={selectedProfile}
            currentUser={currentUser}
            isFollowing={isFollowing(selectedProfile.id)}
            onFollow={() => followUserMutation.mutate({ 
              profileId: selectedProfile.id, 
              targetUserId: selectedProfile.created_by 
            })}
            onUnfollow={() => unfollowUserMutation.mutate({ 
              profileId: selectedProfile.id, 
              targetUserId: selectedProfile.created_by 
            })}
            onClose={() => setSelectedProfile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileCard({ profile, currentUser, currentProfile, isFollowing, onFollow, onUnfollow, onClick, delay }) {
  const isOwnProfile = profile.created_by === currentUser?.email;
  const privacy = profile.privacy_settings?.profile_visibility || 'community_only';
  
  const privacyIcon = {
    public: Globe,
    community_only: Users,
    private: Lock
  }[privacy];
  
  const PrivacyIcon = privacyIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
    >
      <Card 
        className="border-2 border-purple-200 hover:shadow-xl transition-all cursor-pointer"
        onClick={onClick}
      >
        <CardContent className="pt-6">
          {/* Avatar */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                {profile.display_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{profile.display_name}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <PrivacyIcon className="w-3 h-3" />
                  {privacy === 'public' && 'Public'}
                  {privacy === 'community_only' && 'Community'}
                  {privacy === 'private' && 'Private'}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{profile.bio}</p>
          )}

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {profile.interests.slice(0, 3).map((interest, idx) => (
                <Badge key={idx} className="bg-purple-100 text-purple-700 text-xs">
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 3 && (
                <Badge className="bg-gray-100 text-gray-600 text-xs">
                  +{profile.interests.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {profile.stats?.posts_count || 0}
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {profile.stats?.books_completed || 0}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {profile.followers?.length || 0}
            </div>
          </div>

          {/* Follow Button */}
          {!isOwnProfile && currentProfile && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                isFollowing ? onUnfollow() : onFollow();
              }}
              className={`w-full ${
                isFollowing 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              }`}
              size="sm"
            >
              {isFollowing ? (
                <><UserMinus className="w-3 h-3 mr-2" /> Following</>
              ) : (
                <><UserPlus className="w-3 h-3 mr-2" /> Follow</>
              )}
            </Button>
          )}
          
          {isOwnProfile && (
            <Badge className="w-full justify-center bg-blue-500 text-white">
              Your Profile
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CreateProfilePrompt({ onCreateProfile }) {
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    interests: []
  });

  const interestOptions = ['meditation', 'reading', 'prayer', 'mindfulness', 'philosophy', 'yoga', 'journaling'];

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Create Your Community Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Join the community and connect with fellow spiritual seekers
        </p>

        <Input
          placeholder="Display name"
          value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          className="border-2 border-purple-200"
        />

        <Input
          placeholder="Bio (optional)"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="border-2 border-purple-200"
        />

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Interests</label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <Badge
                key={interest}
                onClick={() => {
                  const newInterests = formData.interests.includes(interest)
                    ? formData.interests.filter(i => i !== interest)
                    : [...formData.interests, interest];
                  setFormData({ ...formData, interests: newInterests });
                }}
                className={`cursor-pointer ${
                  formData.interests.includes(interest)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={() => onCreateProfile(formData)}
          disabled={!formData.display_name.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
        >
          Create Profile
        </Button>
      </CardContent>
    </Card>
  );
}

function PrivacySettingsModal({ settings, onSave, onClose, isLoading }) {
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: settings.profile_visibility || 'community_only',
    show_reading_list: settings.show_reading_list !== false,
    show_activity: settings.show_activity !== false,
    allow_messages: settings.allow_messages !== false,
    show_online_status: settings.show_online_status || false
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-purple-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Profile Visibility
              </label>
              <select
                value={privacySettings.profile_visibility}
                onChange={(e) => setPrivacySettings({ ...privacySettings, profile_visibility: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-purple-200"
              >
                <option value="public">🌍 Public - Anyone can see</option>
                <option value="community_only">👥 Community Only - Logged in users</option>
                <option value="private">🔒 Private - Only you</option>
              </select>
            </div>

            {['show_reading_list', 'show_activity', 'allow_messages', 'show_online_status'].map((key) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700">
                  {key === 'show_reading_list' && 'Show Reading List'}
                  {key === 'show_activity' && 'Show Activity'}
                  {key === 'allow_messages' && 'Allow Messages'}
                  {key === 'show_online_status' && 'Show Online Status'}
                </span>
                <input
                  type="checkbox"
                  checked={privacySettings[key]}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, [key]: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-purple-300 text-purple-600 focus:ring-purple-500"
                />
              </label>
            ))}

            <div className="flex gap-2 pt-4">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => onSave(privacySettings)}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function ProfileDetailModal({ profile, currentUser, isFollowing, onFollow, onUnfollow, onClose }) {
  const isOwnProfile = profile.created_by === currentUser?.email;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        <Card className="border-2 border-purple-300">
          <CardContent className="pt-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                {profile.display_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.display_name}</h2>
                <p className="text-sm text-gray-600 mb-3">{profile.bio}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">{profile.followers?.length || 0}</span> followers
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{profile.following?.length || 0}</span> following
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="pt-6 text-center">
                  <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{profile.stats?.posts_count || 0}</p>
                  <p className="text-xs text-gray-600">Posts</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50">
                <CardContent className="pt-6 text-center">
                  <BookOpen className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{profile.stats?.books_completed || 0}</p>
                  <p className="text-xs text-gray-600">Books</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="pt-6 text-center">
                  <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{profile.stats?.comments_count || 0}</p>
                  <p className="text-xs text-gray-600">Comments</p>
                </CardContent>
              </Card>
            </div>

            {/* Interests */}
            {profile.interests?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, idx) => (
                    <Badge key={idx} className="bg-purple-100 text-purple-700">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Close
              </Button>
              {!isOwnProfile && currentUser && (
                <Button
                  onClick={isFollowing ? onUnfollow : onFollow}
                  className={`flex-1 ${
                    isFollowing 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  }`}
                >
                  {isFollowing ? (
                    <><UserMinus className="w-4 h-4 mr-2" /> Unfollow</>
                  ) : (
                    <><UserPlus className="w-4 h-4 mr-2" /> Follow</>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
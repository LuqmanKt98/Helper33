import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  MessageCircle,
  Trophy,
  UserPlus,
  Search,
  Mail,
  CheckCircle,
  X,
  Clock,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FriendsList({ friends }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const queryClient = useQueryClient();

  const { user: authUser } = useAuth();

  const { data: user } = useQuery({
    queryKey: ['user', authUser?.id],
    queryFn: async () => {
      if (!authUser) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!authUser
  });

  // Fetch pending friend requests
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['pendingFriendRequests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          requester:profiles!requester_id(id, email, full_name, avatar_url),
          receiver:profiles!receiver_id(id, email, full_name, avatar_url)
        `)
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Accept friend request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingFriendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      toast.success('Friend request accepted! 🎉');
    }
  });

  // Decline friend request mutation
  const declineRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'declined' })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingFriendRequests'] });
      toast.success('Request declined');
    }
  });

  const filteredFriends = friends.filter(friend => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      friend.name?.toLowerCase().includes(query) ||
      friend.email?.toLowerCase().includes(query)
    );
  });

  const receivedRequests = pendingRequests.filter(r => r.receiver_id === user?.id);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pending Requests */}
      {receivedRequests.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Mail className="w-5 h-5" />
              Friend Requests ({receivedRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {receivedRequests.map(request => (
              <div key={request.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {request.requester.full_name?.[0] || 'U'}
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-sm">{request.requester.full_name}</h4>
                  <p className="text-xs text-gray-600">{request.requester.email}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => acceptRequestMutation.mutate(request.id)}
                    disabled={acceptRequestMutation.isPending}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => declineRequestMutation.mutate(request.id)}
                    disabled={declineRequestMutation.isPending}
                    size="sm"
                    variant="outline"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      {filteredFriends.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'No friends found' : 'No Friends Yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Try a different search term'
                : 'Search above to find and connect with other DobryLife users!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              My Friends ({filteredFriends.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredFriends.map((friend, idx) => (
                <motion.div
                  key={friend.email}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt={friend.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            friend.name?.charAt(0) || 'U'
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{friend.name}</h4>
                          <p className="text-xs text-gray-600">{friend.email}</p>
                          {friend.since && (
                            <p className="text-xs text-gray-500 mt-1">
                              Friends since {format(new Date(friend.since), 'MMM yyyy')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link to={createPageUrl('UserProfile') + `?user=${friend.email}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Trophy className="w-4 h-4 mr-2" />
                            Profile
                          </Button>
                        </Link>
                        <Link to={createPageUrl('Messages') + `?user=${friend.email}`} className="flex-1">
                          <Button size="sm" className="w-full bg-purple-600">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
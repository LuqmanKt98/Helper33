import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, Search, MessageSquare, UserCheck,
  UserMinus, X, Check, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const FriendCard = ({ friend, onMessage, onRemove, type = 'friend' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02 }}
    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-all shadow-sm hover:shadow-md"
  >
    <div className="flex items-center gap-3">
      {friend.requester_avatar || friend.receiver_avatar || friend.buddy_avatar ? (
        <img
          src={friend.requester_avatar || friend.receiver_avatar || friend.buddy_avatar}
          alt={friend.requester_name || friend.receiver_name || friend.buddy_name}
          className="w-12 h-12 rounded-full object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
          {(friend.requester_name || friend.receiver_name || friend.buddy_name)?.[0]}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">
          {friend.requester_name || friend.receiver_name || friend.buddy_name}
        </p>
        {type === 'pending' && friend.message && (
          <p className="text-xs text-gray-600 truncate">{friend.message}</p>
        )}
        {type === 'friend' && friend.accepted_at && (
          <p className="text-xs text-gray-500">
            Friends since {new Date(friend.accepted_at).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        {type === 'friend' && (
          <>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onMessage(friend)}
              className="hover:bg-purple-100"
              title="Send message"
            >
              <MessageSquare className="w-4 h-4 text-purple-600" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onRemove(friend)}
              className="hover:bg-red-100"
              title="Remove friend"
            >
              <UserMinus className="w-4 h-4 text-red-600" />
            </Button>
          </>
        )}
      </div>
    </div>
  </motion.div>
);

export default function FriendsList({ showHeader = true }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return profile;
    }
  });

  const { data: friendRequests = [] } = useQuery({
    queryKey: ['friendRequests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          requester:requester_id (id, full_name, avatar_url),
          receiver:receiver_id (id, full_name, avatar_url)
        `)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) throw error;

      return data.map(r => {
        const isRequester = r.requester_id === user.id;
        const other = isRequester ? r.receiver : r.requester;
        return {
          ...r,
          buddy_name: other?.full_name || 'User',
          buddy_avatar: other?.avatar_url
        };
      });
    },
    enabled: !!user
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['pendingRequests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          requester:requester_id (id, full_name, avatar_url)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      return data.map(r => ({
        ...r,
        requester_name: r.requester?.full_name || 'User',
        requester_avatar: r.requester?.avatar_url
      }));
    },
    enabled: !!user
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      const { error } = await supabase
        .from('friend_requests')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      toast.success('Friend request accepted!');
    }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      const { error } = await supabase
        .from('friend_requests')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      toast.success('Request declined');
    }
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friend) => {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', friend.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast.success('Friend removed');
    }
  });

  const handleMessage = (friend) => {
    // Navigate to messages page
    window.location.href = createPageUrl('Messages');
  };

  const filteredFriends = friendRequests.filter(f => {
    const name = f.requester_email === user?.email ? f.receiver_name : f.requester_name;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Friends & Connections</h2>
            <p className="text-gray-600">Manage your network</p>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-2 border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-purple-600" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map(request => (
              <div key={request.id} className="p-4 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                    {request.requester_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{request.requester_name}</p>
                    {request.message && (
                      <p className="text-sm text-gray-600">{request.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptRequestMutation.mutate(request.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectRequestMutation.mutate(request.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" />
              My Friends ({friendRequests.length})
            </CardTitle>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFriends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No friends yet</h3>
              <p className="text-gray-500 mb-4">Start connecting with others in the community!</p>
              <Link to={createPageUrl('Community')}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Discover People
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredFriends.map(friend => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onMessage={handleMessage}
                  onRemove={(f) => removeFriendMutation.mutate(f)}
                  type="friend"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
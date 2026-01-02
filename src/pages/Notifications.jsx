import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, BellOff, MessageSquare, UserPlus, Calendar, AlertCircle, 
  CheckCircle, Trash2, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

const NotificationIcon = ({ type }) => {
  const icons = {
    new_message: MessageSquare,
    friend_request: UserPlus,
    connection_request: UserPlus,
    event_reminder: Calendar,
    task_reminder: CheckCircle,
    mention: MessageSquare,
    comment: MessageSquare,
    reaction: '❤️',
    system_update: AlertCircle,
    achievement: '🏆',
    marketplace_order: '🛍️',
    consultation_offer: '💼',
    challenge_invite: '🎯',
    buddy_checkin: '👋'
  };

  const Icon = icons[type];
  
  if (typeof Icon === 'string') {
    return <span className="text-2xl">{Icon}</span>;
  }
  
  return Icon ? <Icon className="w-5 h-5" /> : <Bell className="w-5 h-5" />;
};

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const priorityColors = {
    low: 'border-l-gray-400',
    normal: 'border-l-blue-400',
    high: 'border-l-orange-400',
    urgent: 'border-l-red-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
    >
      <Card 
        className={`mb-3 border-l-4 ${priorityColors[notification.priority]} ${
          !notification.is_read ? 'bg-blue-50/50 shadow-md' : 'bg-white/50'
        } hover:shadow-lg transition-all cursor-pointer`}
        onClick={() => !notification.is_read && onMarkRead(notification.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              notification.sender_avatar ? 'bg-transparent' : 'bg-gradient-to-br from-purple-400 to-pink-400'
            }`}>
              {notification.sender_avatar ? (
                <img src={notification.sender_avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <NotificationIcon type={notification.type} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className={`text-sm font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notification.title}
                  </h4>
                  {notification.sender_name && (
                    <p className="text-xs text-gray-500 mb-1">from {notification.sender_name}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(notification.created_date)}</span>
              </div>
              
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              
              {/* Action Button */}
              {notification.action_url && (
                <Link to={notification.action_url}>
                  <Button size="sm" variant="outline" className="mt-3">
                    {notification.action_text || 'View'}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {!notification.is_read && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkRead(notification.id);
                  }}
                  title="Mark as read"
                  className="h-8 w-8 hover:bg-blue-100"
                >
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                title="Delete"
                className="h-8 w-8 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Notifications() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const notifs = await base44.entities.Notification.filter(
        { recipient_email: user.email },
        '-created_date',
        100
      );
      return notifs;
    },
    enabled: !!user,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      await base44.entities.Notification.update(notificationId, {
        is_read: true,
        read_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Marked as read');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (notificationId) => {
      await base44.entities.Notification.delete(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifs = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifs.map(n => 
          base44.entities.Notification.update(n.id, {
            is_read: true,
            read_at: new Date().toISOString()
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    }
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const readNotifs = notifications.filter(n => n.is_read);
      await Promise.all(
        readNotifs.map(n => base44.entities.Notification.delete(n.id))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All read notifications deleted');
    }
  });

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Notifications - Helper33"
        description="Stay updated with your Helper33 notifications"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-600">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={unreadCount === 0 || markAllReadMutation.isLoading}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteAllMutation.mutate()}
                  disabled={notifications.filter(n => n.is_read).length === 0 || deleteAllMutation.isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Read
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <Tabs value={filter} onValueChange={setFilter} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="all">
                  All ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="read">
                  Read ({notifications.length - unreadCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Notifications List */}
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-16"
              >
                <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={(id) => markReadMutation.mutate(id)}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
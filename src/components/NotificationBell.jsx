import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function NotificationBell() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const notifs = await base44.entities.Notification.filter(
        { recipient_email: user.email, is_read: false },
        '-created_date',
        50
      );
      return notifs;
    },
    enabled: !!user,
    refetchInterval: 30000
  });

  const unreadCount = notifications.length;

  if (!user) return null;

  return (
    <Link to={createPageUrl('Notifications')}>
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-orange-50 transition-all"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          </motion.div>
        )}
      </Button>
    </Link>
  );
}
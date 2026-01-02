import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import BadgeNotification from '@/components/badges/BadgeNotification';

export default function BadgeNotificationManager() {
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);

  const { data: newBadges = [] } = useQuery({
    queryKey: ['new-badges'],
    queryFn: async () => {
      const badges = await base44.entities.UserBadge.filter({ is_new: true });
      return badges;
    },
    refetchInterval: 10000 // Check every 10 seconds
  });

  useEffect(() => {
    if (newBadges.length > 0 && notificationQueue.length === 0 && !currentNotification) {
      setNotificationQueue(newBadges);
    }
  }, [newBadges]);

  useEffect(() => {
    if (notificationQueue.length > 0 && !currentNotification) {
      const [nextBadge, ...rest] = notificationQueue;
      setCurrentNotification(nextBadge);
      setNotificationQueue(rest);
    }
  }, [notificationQueue, currentNotification]);

  const handleClose = async () => {
    if (currentNotification) {
      // Mark badge as no longer new
      await base44.entities.UserBadge.update(currentNotification.id, {
        is_new: false
      });
      
      setCurrentNotification(null);
    }
  };

  if (!currentNotification) return null;

  return <BadgeNotification badge={currentNotification} onClose={handleClose} />;
}
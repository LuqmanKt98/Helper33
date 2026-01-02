import React from 'react';
import NotificationSettings from '@/components/womens_health/NotificationSettings';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function WomensHealthNotifications() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
      <NotificationSettings onClose={() => navigate(createPageUrl('WomensHealthHub'))} />
    </div>
  );
}
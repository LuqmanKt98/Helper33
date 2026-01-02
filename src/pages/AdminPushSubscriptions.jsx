import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  XCircle,
  Smartphone,
  RefreshCw,
  Clock,
  AlertCircle
} from 'lucide-react';
import moment from 'moment';

export default function AdminPushSubscriptions() {
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: subscriptions, isLoading, refetch } = useQuery({
    queryKey: ['pushSubscriptions', selectedUser],
    queryFn: async () => {
      const subs = await base44.asServiceRole.entities.PushSubscription.list('-created_date', 100);
      return subs;
    },
    enabled: user?.role === 'admin'
  });

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-center text-gray-700">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const groupedSubs = subscriptions?.reduce((acc, sub) => {
    const email = sub.created_by;
    if (!acc[email]) acc[email] = [];
    acc[email].push(sub);
    return acc;
  }, {}) || {};

  const totalSubs = subscriptions?.length || 0;
  const activeSubs = subscriptions?.filter(s => s.is_active).length || 0;
  const inactiveSubs = totalSubs - activeSubs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
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
                <h1 className="text-3xl font-bold text-gray-900">Push Subscriptions</h1>
                <p className="text-gray-600">Admin debug & management</p>
              </div>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Subscriptions</p>
                    <p className="text-3xl font-bold text-gray-900">{totalSubs}</p>
                  </div>
                  <Smartphone className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-3xl font-bold text-green-600">{activeSubs}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Inactive</p>
                    <p className="text-3xl font-bold text-gray-400">{inactiveSubs}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Subscriptions by User */}
        <div className="space-y-4">
          {Object.entries(groupedSubs).map(([email, subs]) => (
            <Card key={email}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{email}</span>
                  <Badge>{subs.length} device(s)</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subs.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-gray-900">
                            {sub.device_name || `${sub.platform} device`}
                          </span>
                          {sub.is_active ? (
                            <Badge className="bg-green-100 text-green-700 border-green-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-gray-300 text-gray-600">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Created: {moment(sub.created_date).format('MMM D, YYYY h:mm A')}
                        </p>
                        {sub.last_sent_at && (
                          <p className="text-xs text-gray-600 mb-1">
                            Last sent: {moment(sub.last_sent_at).format('MMM D, YYYY h:mm A')}
                            {sub.last_send_status && (
                              <span className={`ml-2 ${sub.last_send_status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                ({sub.last_send_status})
                              </span>
                            )}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 font-mono truncate max-w-md">
                          {sub.subscription_endpoint}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading subscriptions...</p>
          </div>
        )}

        {!isLoading && totalSubs === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No push subscriptions yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Video,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  Calendar,
  Clock,
  Users,
  Zap,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function ZoomConnect() {
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: zoomIntegration, isLoading } = useQuery({
    queryKey: ['zoomIntegration', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const integrations = await base44.entities.PlatformIntegration.filter({
        created_by: user.email,
        platform_name: 'zoom'
      });
      return integrations[0] || null;
    },
    enabled: !!user,
    refetchInterval: 10000
  });

  // Check URL for OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');

    if (success === 'zoom') {
      toast.success('✅ Zoom connected successfully!');
      queryClient.invalidateQueries({ queryKey: ['zoomIntegration'] });
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      toast.error(`Connection failed: ${error}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [queryClient]);

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (zoomIntegration) {
        await base44.entities.PlatformIntegration.update(zoomIntegration.id, {
          is_connected: false,
          access_token: '',
          refresh_token: '',
          sync_status: 'idle'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zoomIntegration'] });
      toast.success('Zoom disconnected');
    }
  });

  const handleConnect = () => {
    setConnecting(true);
    window.location.href = '/api/zoomAuth';
  };

  const isConnected = zoomIntegration?.is_connected;
  const isTokenExpiring = zoomIntegration?.token_expires_at && 
    new Date(zoomIntegration.token_expires_at) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  if (isLoading) {
    return (
      <Card className="border-2 border-blue-300">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`border-4 shadow-2xl ${
        isConnected 
          ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50' 
          : 'border-gray-300 bg-white'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={isConnected ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                  isConnected 
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                    : 'bg-gray-200'
                }`}
              >
                <Video className={`w-8 h-8 ${isConnected ? 'text-white' : 'text-gray-500'}`} />
              </motion.div>
              <div>
                <CardTitle className="text-2xl mb-1 flex items-center gap-2">
                  📹 Zoom Video Meetings
                  {isConnected && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Automatically create video meetings for your appointments
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isConnected ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Connection Status */}
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-6 border-2 border-blue-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-blue-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Your Zoom is Connected!
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/60 rounded-lg p-3">
                        <p className="text-gray-600 mb-1">Account Email</p>
                        <p className="font-semibold text-gray-900">{zoomIntegration.platform_email || 'Connected'}</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3">
                        <p className="text-gray-600 mb-1">User ID</p>
                        <p className="font-semibold text-gray-900 truncate">{zoomIntegration.platform_user_id || 'N/A'}</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3">
                        <p className="text-gray-600 mb-1">Connection Status</p>
                        <p className="font-semibold text-green-700">✅ Active</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3">
                        <p className="text-gray-600 mb-1">Token Status</p>
                        <p className={`font-semibold ${isTokenExpiring ? 'text-yellow-700' : 'text-green-700'}`}>
                          {isTokenExpiring ? '⚠️ Expiring Soon' : '✓ Valid'}
                        </p>
                      </div>
                    </div>

                    {isTokenExpiring && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 flex items-start gap-2"
                      >
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-900">
                          Your Zoom token expires soon. Reconnect to continue automatic meeting creation.
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 mb-3">✨ What's Enabled:</h4>
                {[
                  { icon: Calendar, text: 'Automatic meeting creation for new appointments', color: 'text-blue-600' },
                  { icon: Clock, text: 'Meeting details sent in confirmation emails', color: 'text-purple-600' },
                  { icon: Users, text: 'Waiting room enabled for security', color: 'text-green-600' },
                  { icon: Zap, text: 'One-click join links for clients', color: 'text-amber-600' }
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 bg-white p-4 rounded-lg border-2 border-gray-200"
                  >
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    <span className="text-gray-700">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  variant="outline"
                  className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  {disconnectMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Disconnect Zoom
                </Button>
                {isTokenExpiring && (
                  <Button
                    onClick={handleConnect}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reconnect Zoom
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Benefits */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-300">
                <h3 className="font-bold text-lg text-blue-900 mb-4">🎯 Why Connect Zoom?</h3>
                <div className="space-y-3">
                  {[
                    '📅 Automatically create meetings when clients book',
                    '✉️ Meeting links sent in confirmation emails',
                    '⏰ No manual meeting setup required',
                    '🔒 Secure waiting rooms for all sessions',
                    '📊 Professional consultation experience'
                  ].map((benefit, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Connect Button */}
              <div className="text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleConnect}
                    disabled={connecting}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-xl px-8 py-6"
                  >
                    {connecting ? (
                      <><Loader2 className="w-6 h-6 mr-3 animate-spin" />Connecting...</>
                    ) : (
                      <>
                        <Video className="w-6 h-6 mr-3" />
                        Connect Zoom Account
                        <ExternalLink className="w-5 h-5 ml-3" />
                      </>
                    )}
                  </Button>
                </motion.div>
                <p className="text-sm text-gray-500 mt-4">
                  You'll be redirected to Zoom to authorize the connection
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
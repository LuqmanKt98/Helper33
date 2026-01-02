import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  CheckCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Zap,
  Clock,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { googleCalendarSync } from '@/functions/googleCalendarSync';

export default function GoogleCalendarSync() {
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: integration, isLoading } = useQuery({
    queryKey: ['googleIntegration', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const integrations = await base44.entities.PlatformIntegration.filter({
        created_by: user.email,
        platform_name: 'google'
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

    if (success === 'google') {
      toast.success('✅ Google Calendar connected successfully!');
      queryClient.invalidateQueries({ queryKey: ['googleIntegration'] });
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      toast.error(`Connection failed: ${error}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [queryClient]);

  const isConnected = integration?.is_connected;

  const handleConnect = () => {
    setConnecting(true);
    window.location.href = '/api/googleAuth';
  };

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (integration) {
        await base44.entities.PlatformIntegration.update(integration.id, {
          is_connected: false,
          access_token: null,
          refresh_token: null,
          sync_status: 'idle'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['googleIntegration'] });
      toast.success('Google Calendar disconnected');
    },
    onError: (error) => {
      toast.error('Failed to disconnect: ' + error.message);
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }) => {
      if (!integration) return;
      
      return base44.entities.PlatformIntegration.update(integration.id, {
        sync_settings: {
          ...integration.sync_settings,
          [key]: value
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['googleIntegration'] });
      toast.success('Settings updated');
    }
  });

  const syncNowMutation = useMutation({
    mutationFn: async (action = 'sync_to_google') => {
      if (!integration) return;

      await base44.entities.PlatformIntegration.update(integration.id, {
        sync_status: 'syncing'
      });

      const response = await googleCalendarSync({ 
        action,
        event_data: action === 'sync_from_google' ? null : { /* event data if needed */ }
      });

      await base44.entities.PlatformIntegration.update(integration.id, {
        sync_status: 'success',
        last_sync: new Date().toISOString()
      });

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['googleIntegration'] });
      toast.success(data?.message || '✅ Calendar synced successfully!');
    },
    onError: (error) => {
      toast.error('Sync failed: ' + error.message);
      if (integration) {
        base44.entities.PlatformIntegration.update(integration.id, {
          sync_status: 'error',
          sync_error: error.message
        });
      }
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className={`border-2 transition-all ${
        isConnected 
          ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' 
          : 'border-purple-300 bg-white'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl shadow-lg">
                📅
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Google Calendar
                  {isConnected && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Sync your Helper33 tasks and events
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isConnected ? (
            <div className="space-y-4">
              {/* Sync Info */}
              <div className="p-3 bg-white rounded-xl border-2 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">Sync Status</span>
                  {integration?.sync_status === 'syncing' ? (
                    <Badge className="bg-blue-500">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Syncing...
                    </Badge>
                  ) : integration?.sync_status === 'success' ? (
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline">Idle</Badge>
                  )}
                </div>
                {integration?.platform_email && (
                  <p className="text-xs text-gray-600">
                    Connected as: <span className="font-semibold">{integration.platform_email}</span>
                  </p>
                )}
                {integration?.last_sync && (
                  <p className="text-xs text-green-700 mt-1">
                    Last synced: {new Date(integration.last_sync).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Sync Settings */}
              <div className="space-y-3 p-4 bg-white rounded-xl border-2 border-blue-200">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <Settings className="w-4 h-4 text-blue-600" />
                  Sync Settings
                </h4>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Auto-sync enabled</Label>
                  <Switch
                    checked={integration?.sync_settings?.auto_sync_enabled ?? true}
                    onCheckedChange={(checked) => 
                      updateSettingMutation.mutate({ key: 'auto_sync_enabled', value: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Sync tasks to calendar</Label>
                  <Switch
                    checked={integration?.sync_settings?.sync_tasks_to_calendar ?? true}
                    onCheckedChange={(checked) => 
                      updateSettingMutation.mutate({ key: 'sync_tasks_to_calendar', value: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Import calendar events</Label>
                  <Switch
                    checked={integration?.sync_settings?.sync_events_from_calendar ?? false}
                    onCheckedChange={(checked) => 
                      updateSettingMutation.mutate({ key: 'sync_events_from_calendar', value: checked })
                    }
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => syncNowMutation.mutate('sync_to_google')}
                  disabled={syncNowMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {syncNowMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Syncing...</>
                  ) : (
                    <><RefreshCw className="w-4 h-4 mr-2" />Sync Now</>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    if (confirm('Disconnect from Google Calendar?')) {
                      disconnectMutation.mutate();
                    }
                  }}
                  variant="outline"
                  className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                  disabled={disconnectMutation.isPending}
                >
                  {disconnectMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Disconnect'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Why Connect?
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Automatically sync Helper33 tasks to Google Calendar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>View wellness reminders alongside your daily schedule</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Get calendar notifications for important tasks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Import calendar events to Helper33 (optional)</span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-xl py-6"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5 mr-2" />
                    Connect Google Calendar
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">
                  <strong>Secure OAuth:</strong> We'll redirect you to Google to authorize access. Your credentials are never stored on our servers.
                </p>
              </div>
            </div>
          )}

          {/* How It Works */}
          {!isConnected && (
            <div className="mt-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
              <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                How It Works
              </h4>
              <ol className="space-y-2 text-xs text-purple-800 list-decimal list-inside">
                <li>Click "Connect Google Calendar" above</li>
                <li>Sign in to your Google account</li>
                <li>Grant calendar access permissions</li>
                <li>Your tasks will automatically sync to Google Calendar</li>
                <li>Get reminders from both Helper33 and Google</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
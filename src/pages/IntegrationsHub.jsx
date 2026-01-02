import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Zap, Calendar, Share2, CheckCircle, AlertCircle, ExternalLink, Unplug, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import GoogleCalendarSync from '@/components/integrations/GoogleCalendarSync';
import ZoomConnect from '@/components/integrations/ZoomConnect';
import ZapierIntegration from '@/components/integrations/ZapierIntegration';

const IntegrationCard = ({ integration, onConnect, onDisconnect, onConfigure }) => {
  const statusColors = {
    connected: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    disconnected: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const status = integration.is_connected ? 
    (integration.sync_status === 'error' ? 'error' : 'connected') : 
    'disconnected';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="h-full border-2 shadow-lg hover:shadow-xl transition-all">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${integration.bgColor}`}>
                {integration.icon}
              </div>
              <div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <p className="text-sm text-gray-600">{integration.description}</p>
              </div>
            </div>
            <Badge className={statusColors[status]}>
              {status === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
              {status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {integration.is_connected ? (
            <>
              <div className="text-sm text-gray-600 space-y-1 p-3 bg-green-50 rounded-lg">
                <p>✓ Connected as: <span className="font-semibold">{integration.platform_email || integration.platform_username}</span></p>
                {integration.last_sync && (
                  <p>Last synced: {new Date(integration.last_sync).toLocaleString()}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => onDisconnect(integration)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Unplug className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={() => onConnect(integration)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Connect {integration.name}
            </Button>
          )}

          {/* Features */}
          {integration.features && integration.features.length > 0 && (
            <div className="pt-3 border-t">
              <p className="text-xs font-semibold text-gray-700 mb-2">Features:</p>
              <div className="flex flex-wrap gap-1">
                {integration.features.map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function IntegrationsHub() {
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.PlatformIntegration.filter({ created_by: user.email });
    },
    enabled: !!user,
    refetchInterval: 10000
  });

  // Check for OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');
    const integration = params.get('integration');

    if (success) {
      toast.success(`✅ ${success.charAt(0).toUpperCase() + success.slice(1)} connected successfully!`);
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      toast.error(`Connection failed: ${error}`);
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Handle deep linking to specific integration
    if (integration === 'zapier') {
      setSelectedIntegration('zapier');
    }
  }, [queryClient]);

  const availableIntegrations = [
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Share updates to Facebook',
      icon: '👍',
      bgColor: 'bg-blue-100',
      platform: 'facebook',
      features: ['Social Sharing', 'Profile Sync']
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      description: 'Post updates to Twitter',
      icon: '🐦',
      bgColor: 'bg-sky-50',
      platform: 'twitter',
      features: ['Tweet Posting', 'Social Sharing']
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Share professional updates',
      icon: '💼',
      bgColor: 'bg-blue-50',
      platform: 'linkedin',
      features: ['Professional Sharing', 'Network Sync']
    }
  ];

  const enrichedIntegrations = availableIntegrations.map(avail => {
    const userIntegration = integrations.find(i => i.platform_name === avail.platform);
    return {
      ...avail,
      ...userIntegration,
      is_connected: userIntegration?.is_connected || false
    };
  });

  const handleConnect = async (integration) => {
    toast.info(`${integration.name} integration coming soon! Currently supporting Google Calendar, Zoom, and Zapier.`);
  };

  const disconnectMutation = useMutation({
    mutationFn: async (integration) => {
      await base44.entities.PlatformIntegration.update(integration.id, {
        is_connected: false,
        access_token: null,
        refresh_token: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration disconnected');
    },
    onError: (error) => {
      toast.error('Failed to disconnect');
    }
  });

  const handleDisconnect = async (integration) => {
    if (confirm(`Disconnect from ${integration.name}?`)) {
      disconnectMutation.mutate(integration);
    }
  };

  const handleConfigure = (integration) => {
    toast.info('Configuration settings coming soon');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  // If Zapier is selected, show only Zapier component
  if (selectedIntegration === 'zapier') {
    return (
      <>
        <SEO 
          title="Zapier Integration - Helper33"
          description="Connect Helper33 to 6,000+ apps with Zapier automation"
        />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <div className="p-4">
            <Button
              onClick={() => setSelectedIntegration(null)}
              variant="outline"
              className="mb-4"
            >
              ← Back to All Integrations
            </Button>
          </div>
          <ZapierIntegration />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Integrations - Helper33"
        description="Connect Helper33 with your favorite apps and services"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Integrations Hub</h1>
                <p className="text-gray-600">Connect your favorite apps and automate your workflow</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-8">
            {/* Zapier - Featured Integration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-2 border-orange-300 shadow-2xl bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedIntegration('zapier')}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-bl-full" />
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-xl"
                      >
                        <Zap className="w-8 h-8 text-white" />
                      </motion.div>
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          Zapier Integration
                          <Badge className="bg-gradient-to-r from-orange-600 to-orange-500 text-white">
                            🔥 Popular
                          </Badge>
                        </CardTitle>
                        <p className="text-gray-600 mt-1">Connect to 6,000+ apps with automated workflows</p>
                      </div>
                    </div>
                    <ExternalLink className="w-6 h-6 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Google Sheets', 'Slack', 'Gmail', 'Notion', 'Airtable', 'Trello', 'Asana', 'Salesforce'].map((app, idx) => (
                      <motion.div
                        key={app}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-2 p-2 bg-white rounded-lg border-2 border-orange-200 text-sm"
                      >
                        <Zap className="w-4 h-4 text-orange-600" />
                        <span className="font-semibold text-gray-700 truncate">{app}</span>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    + thousands more apps available through Zapier
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Primary Integrations - Full Cards */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Calendar & Video
              </h2>
              <GoogleCalendarSync />
              <ZoomConnect />
            </div>

            {/* Social Media Integrations */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Share2 className="w-6 h-6 text-pink-600" />
                Social Media Integrations
                <Badge variant="outline" className="text-xs">Coming Soon</Badge>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrichedIntegrations.map((integration, index) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    onConfigure={handleConfigure}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
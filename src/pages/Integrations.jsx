import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Loader2, AlertCircle, ExternalLink, Video, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Integrations() {
  const [isConnectingZoom, setIsConnectingZoom] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  // Zoom Handlers
  const handleZoomConnect = async () => {
    setIsConnectingZoom(true);
    try {
      const response = await base44.functions.invoke('zoomAuth', { mode: 'redirect' });
      
      if (response.data?.url) {
        localStorage.setItem('zoom_oauth_state', response.data.state);
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error connecting Zoom:', error);
      toast.error('Failed to connect Zoom');
      setIsConnectingZoom(false);
    }
  };

  const handleZoomDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Zoom?')) {
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        zoom_auth: null
      });
      toast.success('Zoom disconnected');
    } catch (error) {
      console.error('Error disconnecting Zoom:', error);
      toast.error('Failed to disconnect');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const isZoomConnected = !!user?.zoom_auth?.access_token;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-2">Connect your favorite apps to DobryLife</p>
        </div>

        {/* Google Calendar Integration - Coming Soon */}
        <Card className="border-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Clock className="w-3 h-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
          
          <CardHeader className="opacity-60">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-red-500 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Google Calendar
                  </CardTitle>
                  <CardDescription>
                    Sync your tasks with Google Calendar and get reminders
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 opacity-60">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">✨ Upcoming Features:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• View tasks in Google Calendar</li>
                <li>• Get reminders on all your devices</li>
                <li>• Auto-sync when tasks are created/updated</li>
                <li>• Color-coded by priority</li>
              </ul>
            </div>

            <Button 
              disabled
              className="w-full bg-gradient-to-r from-blue-500 to-red-500 opacity-50 cursor-not-allowed"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Zoom Integration */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Zoom
                    {isZoomConnected ? (
                      <Badge className="bg-green-500">Connected</Badge>
                    ) : (
                      <Badge variant="outline">Not Connected</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Create Zoom meetings for family events and video calls
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isZoomConnected ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">✨ Benefits:</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Create Zoom meetings directly from DobryLife</li>
                    <li>• Auto-generate meeting links for family events</li>
                    <li>• Schedule video calls with family members</li>
                    <li>• Seamless video conferencing integration</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleZoomConnect}
                  disabled={isConnectingZoom}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-400"
                >
                  {isConnectingZoom ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      Connect Zoom
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-green-900">Connected Successfully!</h4>
                  </div>
                  <p className="text-sm text-green-800">
                    You can now create Zoom meetings from DobryLife
                  </p>
                  {user.zoom_auth.connected_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Connected: {new Date(user.zoom_auth.connected_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <Button 
                  onClick={handleZoomDisconnect}
                  variant="outline"
                  className="w-full text-red-600 hover:bg-red-50"
                >
                  Disconnect Zoom
                </Button>

                <a 
                  href="https://zoom.us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  Open Zoom
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              How Integrations Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-amber-800">
            <div>
              <p className="font-semibold mb-1">📅 Google Calendar (Coming Soon):</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Tasks with due dates will sync automatically</li>
                <li>Reminders will be set based on task settings</li>
                <li>Color-coded by priority for easy viewing</li>
                <li>Real-time updates between DobryLife and Google Calendar</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">🎥 Zoom:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Create instant or scheduled Zoom meetings</li>
                <li>Meeting links are automatically generated</li>
                <li>Perfect for family video calls and events</li>
                <li>Secure and easy to use</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
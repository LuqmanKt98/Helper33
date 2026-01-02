import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  Shield,
  Zap,
  Loader2
} from 'lucide-react';
import ZoomConnect from '@/components/integrations/ZoomConnect';

export default function Settings() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
            >
              <SettingsIcon className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ⚙️ Settings
              </h1>
              <p className="text-gray-600">Manage your account and integrations</p>
            </div>
          </div>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-4 border-purple-300 shadow-2xl">
            <Tabs defaultValue="integrations" className="w-full">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 border-b-4 border-purple-300">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 bg-white/60 p-2">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="integrations" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Integrations
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Privacy
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="p-6">
                {/* Profile Tab */}
                <TabsContent value="profile">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">👤 Profile Settings</h3>
                    <p className="text-gray-600">Manage your profile information and preferences</p>
                    <Card className="bg-blue-50 border-2 border-blue-300">
                      <CardContent className="p-6">
                        <p className="text-gray-700">
                          <strong>Name:</strong> {user?.full_name || 'Not set'}
                        </p>
                        <p className="text-gray-700 mt-2">
                          <strong>Email:</strong> {user?.email}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">🔔 Notification Settings</h3>
                    <p className="text-gray-600">Control how and when you receive notifications</p>
                    <Card className="bg-yellow-50 border-2 border-yellow-300">
                      <CardContent className="p-6 text-center">
                        <Bell className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                        <p className="text-gray-700">Notification preferences coming soon!</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Integrations Tab */}
                <TabsContent value="integrations">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">🔌 Integrations</h3>
                      <p className="text-gray-600 mb-6">Connect external services to enhance your Helper33 experience</p>
                    </div>

                    {/* Zoom Integration */}
                    <ZoomConnect />

                    {/* More integrations can be added here */}
                    <Card className="border-2 border-gray-300 bg-gray-50">
                      <CardContent className="p-8 text-center">
                        <Palette className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-2 font-semibold">More Integrations Coming Soon</p>
                        <p className="text-sm text-gray-500">
                          Google Calendar, Slack, and more are on the way!
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Privacy Tab */}
                <TabsContent value="privacy">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">🔒 Privacy & Security</h3>
                    <p className="text-gray-600">Your data protection and privacy settings</p>
                    <Card className="bg-green-50 border-2 border-green-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                          <Shield className="w-8 h-8 text-green-600 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-green-900 mb-2">Your Data is Protected</p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              All your data is encrypted, only you can access your personal information,
                              and we never share your data with third parties.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
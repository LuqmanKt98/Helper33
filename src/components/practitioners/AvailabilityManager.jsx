import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Link as LinkIcon, ExternalLink, Save, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AvailabilityManager({ practitionerId }) {
  const queryClient = useQueryClient();
  const [schedulingLink, setSchedulingLink] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['practitionerProfile', practitionerId],
    queryFn: async () => {
      const profiles = await base44.entities.PractitionerProfile.filter({ id: practitionerId });
      return profiles[0];
    }
  });

  useEffect(() => {
    if (profile?.scheduling_link) {
      setSchedulingLink(profile.scheduling_link);
    }
  }, [profile]);

  const updateLinkMutation = useMutation({
    mutationFn: async (link) => {
      await base44.entities.PractitionerProfile.update(practitionerId, { scheduling_link: link });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['practitionerProfile', practitionerId]);
      toast.success('Scheduling link updated! 🔗');
    },
    onError: () => {
      toast.error('Failed to update link');
    }
  });

  return (
    <div className="space-y-6">
      {/* Scheduling Link Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-purple-600" />
              Custom Scheduling Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/80 rounded-lg p-4 border-2 border-purple-200">
              <p className="text-sm text-gray-700 mb-3">
                <strong>🔗 Booking Integration:</strong> Add your Calendly, Google Calendar, Zoom, or any scheduling link here. 
                Clients will be directed to this link to book appointments with you.
              </p>
              <div className="flex gap-2">
                <Input
                  value={schedulingLink}
                  onChange={(e) => setSchedulingLink(e.target.value)}
                  placeholder="https://calendly.com/your-link"
                  className="border-2 border-purple-300"
                />
                <Button 
                  onClick={() => updateLinkMutation.mutate(schedulingLink)}
                  disabled={updateLinkMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {updateLinkMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
              {profile?.scheduling_link && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 flex items-center gap-2 text-sm text-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Active link:</span>
                  <a 
                    href={profile.scheduling_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline flex items-center gap-1 hover:text-green-800 truncate max-w-xs"
                  >
                    {profile.scheduling_link}
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Coming Soon - Manual Availability */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white px-4 py-1 rounded-bl-lg font-bold text-sm shadow-lg">
            COMING SOON
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-5 h-5" />
              Manual Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                <Sparkles className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Manual Availability Coming Soon!</h3>
              <p className="text-gray-600 mb-4">
                We're building an advanced in-app booking system where you can set your weekly hours directly in Helper33.
              </p>
              <div className="bg-white/80 rounded-lg p-4 text-left">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>🎯 What's coming:</strong>
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Set custom working hours for each day</li>
                  <li>• Define session duration and break times</li>
                  <li>• Automatic slot generation for clients</li>
                  <li>• Real-time booking management</li>
                  <li>• Calendar sync integration</li>
                </ul>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                For now, please use your custom scheduling link (Calendly, Zoom, Google Calendar, etc.)
              </p>
            </div>

            {/* Preview of what's coming */}
            <div className="opacity-40 pointer-events-none relative">
              <div className="absolute inset-0 backdrop-blur-sm z-10"></div>
              <div className="space-y-2">
                <div className="p-4 rounded-xl border-2 border-gray-300 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <h4 className="font-bold text-gray-800">Monday</h4>
                        <p className="text-xs text-gray-600">9:00 AM - 5:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl border-2 border-gray-300 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <h4 className="font-bold text-gray-800">Tuesday</h4>
                        <p className="text-xs text-gray-600">9:00 AM - 5:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
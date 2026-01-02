import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Upload, 
  Save, 
  Phone, 
  Calendar, 
  Shield,
  Bell,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

export default function ProfileEditor({ user, onUpdate }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    preferred_name: user?.preferred_name || '',
    bio: user?.bio || '',
    phone_number: user?.phone_number || '',
    profile_emoji: user?.profile_emoji || '😊',
    avatar_url: user?.avatar_url || ''
  });
  const [uploading, setUploading] = useState(false);

  const { data: integrations = [] } = useQuery({
    queryKey: ['platformIntegrations'],
    queryFn: () => base44.entities.PlatformIntegration.list('-updated_date'),
    initialData: []
  });

  const googleCalendar = integrations.find(i => i.platform_name === 'google' && i.is_connected);
  const zoomIntegration = integrations.find(i => i.platform_name === 'zoom' && i.is_connected);

  useEffect(() => {
    setFormData({
      full_name: user?.full_name || '',
      preferred_name: user?.preferred_name || '',
      bio: user?.bio || '',
      phone_number: user?.phone_number || '',
      profile_emoji: user?.profile_emoji || '😊',
      avatar_url: user?.avatar_url || ''
    });
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.auth.updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      queryClient.invalidateQueries(['currentUser']);
      toast.success('✅ Profile updated successfully!');
      if (onUpdate) onUpdate();
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, avatar_url: file_url });
      toast.success('Image uploaded! Click Save to apply.');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const emojiOptions = ['😊', '🌟', '💚', '🎯', '🦋', '🌈', '✨', '💪', '🧘', '❤️', '🌸', '🔥', '⚡', '🎨', '🌻'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="text-center">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative inline-block mb-4"
          >
            {formData.avatar_url ? (
              <img
                src={formData.avatar_url}
                alt="Profile"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-purple-300 shadow-2xl"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center border-4 border-purple-300 shadow-2xl">
                <span className="text-6xl">{formData.profile_emoji}</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="avatar-upload"
              disabled={uploading}
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center cursor-pointer hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg border-2 border-white touch-manipulation"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-white" />
              )}
            </label>
          </motion.div>
          <p className="text-xs text-gray-500">Click camera to upload photo</p>
        </div>

        {/* Emoji Selector */}
        <div className="space-y-2">
          <Label className="font-semibold text-gray-800">Profile Emoji</Label>
          <div className="flex flex-wrap gap-2 justify-center">
            {emojiOptions.map(emoji => (
              <motion.button
                key={emoji}
                type="button"
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setFormData({ ...formData, profile_emoji: emoji })}
                className={`w-12 h-12 sm:w-14 sm:h-14 text-2xl sm:text-3xl rounded-xl border-2 transition-all touch-manipulation ${
                  formData.profile_emoji === emoji
                    ? 'border-purple-500 bg-purple-100 shadow-lg scale-110'
                    : 'border-gray-300 bg-white hover:border-purple-300'
                }`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name" className="font-semibold text-gray-800">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Your full name"
              className="border-2 border-purple-200 focus:border-purple-400 touch-manipulation min-h-[44px]"
            />
          </div>

          <div>
            <Label htmlFor="preferred_name" className="font-semibold text-gray-800">Preferred Name</Label>
            <Input
              id="preferred_name"
              value={formData.preferred_name}
              onChange={(e) => setFormData({ ...formData, preferred_name: e.target.value })}
              placeholder="What should we call you?"
              className="border-2 border-purple-200 focus:border-purple-400 touch-manipulation min-h-[44px]"
            />
            <p className="text-xs text-gray-500 mt-1">This is how we'll address you in the app</p>
          </div>

          <div>
            <Label htmlFor="phone_number" className="font-semibold text-gray-800 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
              <Badge className="bg-blue-100 text-blue-700 text-xs">For SMS</Badge>
            </Label>
            <Input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="border-2 border-purple-200 focus:border-purple-400 touch-manipulation min-h-[44px]"
            />
            <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
          </div>

          <div>
            <Label htmlFor="bio" className="font-semibold text-gray-800">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="border-2 border-purple-200 focus:border-purple-400 h-24"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right mt-1">{formData.bio?.length || 0}/500</p>
          </div>
        </div>

        {/* Connected Services Info */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
            <Shield className="w-5 h-5 text-purple-600" />
            Connected Services
          </h3>

          {/* Google Calendar */}
          <motion.div
            whileHover={{ scale: 1.02, x: 5 }}
            className={`p-4 rounded-xl border-2 transition-all ${
              googleCalendar 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Google Calendar</p>
                  <p className="text-xs text-gray-600">Sync your tasks & events</p>
                </div>
              </div>
              {googleCalendar ? (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-600">
                  Not Connected
                </Badge>
              )}
            </div>
            {googleCalendar && googleCalendar.last_sync && (
              <p className="text-xs text-green-700 mt-2">
                Last synced: {new Date(googleCalendar.last_sync).toLocaleString()}
              </p>
            )}
          </motion.div>

          {/* Zoom */}
          <motion.div
            whileHover={{ scale: 1.02, x: 5 }}
            className={`p-4 rounded-xl border-2 transition-all ${
              zoomIntegration 
                ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-2xl">📹</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Zoom Meetings</p>
                  <p className="text-xs text-gray-600">Video consultations & calls</p>
                </div>
              </div>
              {zoomIntegration ? (
                <Badge className="bg-blue-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-600">
                  Not Connected
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Notifications Link */}
          <motion.div
            whileHover={{ scale: 1.02, x: 5 }}
            onClick={() => window.location.href = createPageUrl('NotificationSettings')}
            className="p-4 rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 cursor-pointer hover:border-purple-400 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                  <Bell className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Notification Settings</p>
                  <p className="text-xs text-gray-600">Configure push, SMS & email</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-purple-600" />
            </div>
            {user?.notification_settings && (
              <div className="flex gap-2 mt-2">
                {user.notification_settings.push_enabled && (
                  <Badge variant="outline" className="text-xs">📲 Push</Badge>
                )}
                {user.notification_settings.sms_enabled && (
                  <Badge variant="outline" className="text-xs">💬 SMS</Badge>
                )}
                {user.notification_settings.email_enabled && (
                  <Badge variant="outline" className="text-xs">📧 Email</Badge>
                )}
              </div>
            )}
          </motion.div>

          {/* Manage All Integrations */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="button"
              onClick={() => window.location.href = createPageUrl('IntegrationsHub')}
              variant="outline"
              className="w-full border-2 border-purple-300 hover:bg-purple-50 touch-manipulation min-h-[44px]"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Manage All Integrations
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>

        {/* Save Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white shadow-2xl py-6 text-lg font-bold touch-manipulation"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Profile Changes
              </>
            )}
          </Button>
        </motion.div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-semibold mb-1">Your Privacy Matters</p>
              <p>Your profile information is encrypted and only visible to you. Phone number is only used for SMS notifications if enabled.</p>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
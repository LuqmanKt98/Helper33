import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { User, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientProfileEditor({ user }) {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: user.full_name || '',
    preferred_name: user.preferred_name || '',
    phone_number: user.phone_number || '',
    bio: user.bio || '',
    preferred_language: user.preferred_language || 'English',
    timezone: user.timezone || ''
  });

  const queryClient = useQueryClient();

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(profile);
      queryClient.invalidateQueries(['currentUser']);
      toast.success('Profile updated! ✨');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Full Name</label>
            <Input
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="border-2 border-purple-300"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Preferred Name (Optional)</label>
            <Input
              value={profile.preferred_name}
              onChange={(e) => setProfile({ ...profile, preferred_name: e.target.value })}
              placeholder="What should we call you?"
              className="border-2 border-purple-300"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Phone Number</label>
            <Input
              value={profile.phone_number}
              onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
              placeholder="(555) 123-4567"
              className="border-2 border-purple-300"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">About Me (Optional)</label>
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell practitioners a bit about yourself..."
              rows={4}
              className="border-2 border-purple-300"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Preferred Language</label>
            <select
              value={profile.preferred_language}
              onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value })}
              className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Chinese">Chinese</option>
              <option value="Arabic">Arabic</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Timezone</label>
            <Input
              value={profile.timezone}
              onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
              placeholder="America/New_York"
              className="border-2 border-purple-300"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
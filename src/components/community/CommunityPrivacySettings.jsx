
import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Eye,
  EyeOff,
  User,
  MapPin,
  Image,
  FileText,
  Users,
  UserPlus,
  Search,
  Lock,
  Sparkles,
  CheckCircle,
  QrCode,
  Share2,
  Copy,
  AlertCircle,
  Phone,
  Mail,
  MessageCircle,
  Facebook,
  Twitter,
  Send,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import ContactSync from './ContactSync';

export default function CommunityPrivacySettings({ user, onClose }) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showContactSync, setShowContactSync] = useState(false);
  const queryClient = useQueryClient();

  const { data: communityProfile } = useQuery({
    queryKey: ['communityProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserCommunityProfile.list();
      return profiles[0];
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['communityProfile']);
      toast.success('Privacy settings updated!');
    }
  });

  const privacy = user.community_privacy || {
    is_visible: false,
    is_fully_anonymous: true,
    show_avatar: false,
    show_bio: false,
    show_location: false,
    show_activity: true,
    allow_friend_requests: true,
    allow_buddy_requests: true,
    discoverable_by: 'nobody'
  };

  const handleVisibilityModeChange = (mode) => {
    let newPrivacy = { ...privacy };

    if (mode === 'invisible') {
      newPrivacy = {
        ...newPrivacy,
        is_visible: false,
        is_fully_anonymous: true,
        can_be_discovered: false,
        discoverable_by: 'nobody',
        show_avatar: false,
        show_bio: false,
        show_location: false
      };
    } else if (mode === 'anonymous') {
      newPrivacy = {
        ...newPrivacy,
        is_visible: false,
        is_fully_anonymous: true,
        can_be_discovered: false,
        discoverable_by: 'nobody',
        show_avatar: false,
        show_bio: false,
        show_activity: true
      };
    } else if (mode === 'semi_visible') {
      newPrivacy = {
        ...newPrivacy,
        is_visible: true,
        is_fully_anonymous: false,
        can_be_discovered: true,
        discoverable_by: 'contacts_only',
        show_avatar: true,
        show_bio: false
      };
    } else if (mode === 'fully_visible') {
      newPrivacy = {
        ...newPrivacy,
        is_visible: true,
        is_fully_anonymous: false,
        can_be_discovered: true,
        discoverable_by: 'everyone',
        show_avatar: true,
        show_bio: true,
        show_location: true
      };
    }

    updateUserMutation.mutate({ community_privacy: newPrivacy });
  };

  const handlePrivacyChange = (key, value) => {
    const updatedPrivacy = { ...privacy, [key]: value };
    
    if (key === 'is_fully_anonymous' && value === true) {
      updatedPrivacy.show_avatar = false;
      updatedPrivacy.show_bio = false;
      updatedPrivacy.is_visible = false;
      updatedPrivacy.discoverable_by = 'nobody';
    }
    
    if (key === 'is_visible' && value === true) {
      updatedPrivacy.is_fully_anonymous = false;
    }

    if (key === 'discoverable_by' && value !== 'nobody') {
      updatedPrivacy.is_visible = true;
      updatedPrivacy.is_fully_anonymous = false;
    }

    updateUserMutation.mutate({ community_privacy: updatedPrivacy });
  };

  const generateInviteCodeIfNeeded = async () => {
    if (!user.invite_code) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await base44.auth.updateMe({ invite_code: code });
      queryClient.invalidateQueries(['currentUser']);
      toast.success('Invite code generated!');
      return code;
    }
    return user.invite_code;
  };

  const getShareLink = async () => {
    const code = await generateInviteCodeIfNeeded();
    return `${window.location.origin}?connect=${code}`;
  };

  const getShareMessage = () => {
    const userName = user.preferred_name || user.full_name?.split(' ')[0] || 'Someone';
    return `Hey! ${userName} invited you to connect on Helper33 - a wellness & support app. Join me on my journey! 💜`;
  };

  const copyInviteCode = async () => {
    const code = await generateInviteCodeIfNeeded();
    navigator.clipboard.writeText(code);
    toast.success('Invite code copied! 📋');
  };

  const copyProfileLink = async () => {
    const link = await getShareLink();
    navigator.clipboard.writeText(link);
    toast.success('Profile link copied! 🔗');
  };

  const shareViaText = async () => {
    const link = await getShareLink();
    const message = getShareMessage();
    const smsBody = encodeURIComponent(`${message}\n\n${link}`);
    window.open(`sms:?body=${smsBody}`, '_blank');
    toast.success('Opening messages... 💬');
  };

  const shareViaEmail = async () => {
    const link = await getShareLink();
    const message = getShareMessage();
    const subject = encodeURIComponent('Join me on Helper33! 💜');
    const body = encodeURIComponent(`${message}\n\n${link}\n\nHelper33 is a compassionate wellness companion with AI support, mindfulness tools, and community features.`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    toast.success('Opening email... 📧');
  };

  const shareViaWhatsApp = async () => {
    const link = await getShareLink();
    const message = getShareMessage();
    const text = encodeURIComponent(`${message}\n\n${link}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    toast.success('Opening WhatsApp... 💚');
  };

  const shareViaFacebook = async () => {
    const link = await getShareLink();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank');
    toast.success('Opening Facebook... 📘');
  };

  const shareViaTwitter = async () => {
    const link = await getShareLink();
    const message = getShareMessage();
    const text = encodeURIComponent(message);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(link)}`, '_blank');
    toast.success('Opening Twitter... 🐦');
  };

  const shareViaNative = async () => {
    if (navigator.share) {
      const link = await getShareLink();
      const message = getShareMessage();
      try {
        await navigator.share({
          title: 'Join me on Helper33!',
          text: message,
          url: link
        });
        toast.success('Shared successfully! ✨');
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Sharing failed');
        }
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const getCurrentMode = () => {
    if (!privacy.is_visible && privacy.is_fully_anonymous && privacy.discoverable_by === 'nobody') {
      return privacy.show_activity ? 'anonymous' : 'invisible';
    }
    if (privacy.is_visible && privacy.discoverable_by === 'contacts_only') return 'semi_visible';
    if (privacy.is_visible && privacy.discoverable_by === 'everyone') return 'fully_visible';
    return 'anonymous';
  };

  const currentMode = getCurrentMode();

  return (
    <div className="space-y-6">
      {/* Contact Sync Modal */}
      <AnimatePresence>
        {showContactSync && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowContactSync(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
            >
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Phone className="w-7 h-7" />
                  Contact Sync
                </h2>
                <p className="text-blue-100">Find and connect with friends already on Helper33</p>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <ContactSync user={user} onClose={() => setShowContactSync(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Menu Modal */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowShareMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                💜 Share Your Connection Link
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <ShareButton
                  icon={MessageCircle}
                  label="Text Message"
                  color="from-green-500 to-emerald-500"
                  onClick={shareViaText}
                />
                <ShareButton
                  icon={Mail}
                  label="Email"
                  color="from-blue-500 to-cyan-500"
                  onClick={shareViaEmail}
                />
                <ShareButton
                  icon={Send}
                  label="WhatsApp"
                  color="from-green-600 to-green-500"
                  onClick={shareViaWhatsApp}
                />
                <ShareButton
                  icon={Facebook}
                  label="Facebook"
                  color="from-blue-600 to-blue-500"
                  onClick={shareViaFacebook}
                />
                <ShareButton
                  icon={Twitter}
                  label="Twitter"
                  color="from-sky-500 to-blue-400"
                  onClick={shareViaTwitter}
                />
                <ShareButton
                  icon={Copy}
                  label="Copy Link"
                  color="from-purple-500 to-pink-500"
                  onClick={() => {
                    copyProfileLink();
                    setShowShareMenu(false);
                  }}
                />
              </div>

              <Button
                onClick={() => setShowShareMenu(false)}
                variant="outline"
                className="w-full mt-4"
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Display Modal */}
      <AnimatePresence>
        {showQRCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowQRCode(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-center mb-4">📱 Your Connection Code</h3>
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-8 rounded-xl mb-4 border-4 border-purple-300">
                <div className="text-center">
                  <p className="text-sm text-purple-700 mb-2 font-semibold">Your Invite Code</p>
                  <p className="text-5xl font-bold text-purple-900 mb-4 tracking-wider">
                    {user.invite_code || 'SETUP'}
                  </p>
                  <p className="text-xs text-purple-600">
                    Others can enter this code to connect with you
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={copyInviteCode} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
                <Button onClick={copyProfileLink} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
              <Button 
                onClick={() => {
                  setShowQRCode(false);
                  setShowShareMenu(true);
                }} 
                className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </Button>
              <Button onClick={() => setShowQRCode(false)} variant="outline" className="w-full mt-2">
                Done
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border-4 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            Choose Your Privacy Mode
          </CardTitle>
          <CardDescription>
            Control how you appear in the community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <PrivacyModeCard
            mode="invisible"
            title="👻 Invisible"
            description="Don't appear in community at all. Use Helper33 privately."
            isActive={currentMode === 'invisible'}
            onClick={() => handleVisibilityModeChange('invisible')}
            features={['No community presence', 'Private use only', 'No one can find you']}
          />
          
          <PrivacyModeCard
            mode="anonymous"
            title="🎭 Anonymous (Emoji Only)"
            description="Participate anonymously. Others see only your emoji, no name."
            isActive={currentMode === 'anonymous'}
            onClick={() => handleVisibilityModeChange('anonymous')}
            features={['Emoji only display', 'Share achievements', 'Connect anonymously', 'Cannot view visible profiles']}
          />
          
          <PrivacyModeCard
            mode="semi_visible"
            title="🔒 Semi-Visible (Contacts Only)"
            description="Visible to contacts only. Show name and avatar."
            isActive={currentMode === 'semi_visible'}
            onClick={() => handleVisibilityModeChange('semi_visible')}
            features={['Contacts can find you', 'Show name & avatar', 'View other visible profiles', 'Code sharing']}
          />
          
          <PrivacyModeCard
            mode="fully_visible"
            title="🌟 Fully Visible"
            description="Discoverable by everyone. Full profile visibility."
            isActive={currentMode === 'fully_visible'}
            onClick={() => handleVisibilityModeChange('fully_visible')}
            features={['Anyone can find you', 'Full profile visible', 'Maximum connections', 'Community leader']}
          />
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`border-2 ${
          currentMode === 'invisible' ? 'border-gray-400 bg-gray-50' :
          currentMode === 'anonymous' ? 'border-blue-400 bg-blue-50' :
          currentMode === 'semi_visible' ? 'border-purple-400 bg-purple-50' :
          'border-green-400 bg-green-50'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg">
                {privacy.is_fully_anonymous ? user.profile_emoji || '🎭' : (
                  user.avatar_url ? (
                    <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" alt="Avatar" />
                  ) : user.profile_emoji || '😊'
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  How Others See You:
                </h3>
                <p className="text-2xl font-bold text-purple-600">
                  {privacy.is_fully_anonymous 
                    ? `${user.profile_emoji || '🎭'}` 
                    : user.preferred_name || user.full_name?.split(' ')[0] || 'You'
                  }
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <InfoBadge
                icon={privacy.is_visible ? Eye : EyeOff}
                label="Visibility"
                value={privacy.is_visible ? 'Visible' : 'Hidden'}
                active={privacy.is_visible}
              />
              <InfoBadge
                icon={User}
                label="Display"
                value={privacy.is_fully_anonymous ? 'Emoji Only' : 'Name Shown'}
                active={!privacy.is_fully_anonymous}
              />
              <InfoBadge
                icon={Search}
                label="Discoverable"
                value={
                  privacy.discoverable_by === 'everyone' ? 'Everyone' :
                  privacy.discoverable_by === 'contacts_only' ? 'Contacts Only' :
                  'Nobody'
                }
                active={privacy.discoverable_by !== 'nobody'}
              />
              <InfoBadge
                icon={Image}
                label="Avatar"
                value={privacy.show_avatar && !privacy.is_fully_anonymous ? 'Shown' : 'Hidden'}
                active={privacy.show_avatar && !privacy.is_fully_anonymous}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {currentMode !== 'invisible' && (
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Ways to Connect
            </CardTitle>
            <CardDescription>
              Choose how others can find and connect with you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={async () => {
                await generateInviteCodeIfNeeded();
                setShowQRCode(true);
              }}
              className="w-full justify-start bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg py-6"
            >
              <QrCode className="w-5 h-5 mr-3" />
              <div className="text-left flex-1">
                <div className="font-bold">Show Connection Code</div>
                <div className="text-xs text-white/80">Share your 6-character code</div>
              </div>
              <Share2 className="w-5 h-5" />
            </Button>

            <div className="grid md:grid-cols-3 gap-3">
              <Button
                onClick={copyInviteCode}
                variant="outline"
                className="justify-start border-2 border-blue-300 h-auto py-4 hover:bg-blue-50 hover:scale-105 transition-all"
              >
                <Copy className="w-5 h-5 mr-2 text-blue-600" />
                <div className="text-left">
                  <div className="font-bold text-sm">Copy Code</div>
                  <div className="text-xs text-gray-600">{user.invite_code || 'Generate'}</div>
                </div>
              </Button>

              <Button
                onClick={copyProfileLink}
                variant="outline"
                className="justify-start border-2 border-purple-300 h-auto py-4 hover:bg-purple-50 hover:scale-105 transition-all"
              >
                <Copy className="w-5 h-5 mr-2 text-purple-600" />
                <div className="text-left">
                  <div className="font-bold text-sm">Copy Link</div>
                  <div className="text-xs text-gray-600">Direct link</div>
                </div>
              </Button>

              <Button
                onClick={shareViaNative}
                className="justify-start border-2 border-pink-300 h-auto py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 hover:scale-105 transition-all shadow-lg"
              >
                <Share2 className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-bold text-sm">Share Link</div>
                  <div className="text-xs text-white/80">Via apps</div>
                </div>
              </Button>
            </div>

            {/* Quick Share Buttons */}
            <div className="p-4 bg-white rounded-xl border-2 border-purple-200">
              <p className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Quick Share To:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <motion.button
                  onClick={shareViaText}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <MessageCircle className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xs font-semibold">Text</p>
                </motion.button>

                <motion.button
                  onClick={shareViaEmail}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Mail className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xs font-semibold">Email</p>
                </motion.button>

                <motion.button
                  onClick={shareViaWhatsApp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-lg bg-gradient-to-br from-green-600 to-green-500 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Send className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xs font-semibold">WhatsApp</p>
                </motion.button>

                <motion.button
                  onClick={shareViaFacebook}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Facebook className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xs font-semibold">Facebook</p>
                </motion.button>

                <motion.button
                  onClick={shareViaTwitter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-lg bg-gradient-to-br from-sky-500 to-blue-400 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Twitter className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xs font-semibold">Twitter</p>
                </motion.button>

                <motion.button
                  onClick={() => setShowShareMenu(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <MoreHorizontal className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xs font-semibold">More</p>
                </motion.button>
              </div>
            </div>

            {/* Contact Sync Button */}
            {currentMode !== 'anonymous' && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => setShowContactSync(true)}
                  className="w-full justify-start border-2 border-green-300 h-auto py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg"
                >
                  <Phone className="w-5 h-5 mr-3" />
                  <div className="text-left flex-1">
                    <div className="font-bold text-sm">
                      {user.contacts_synced ? 'Manage Synced Contacts' : 'Sync Contacts'}
                    </div>
                    <div className="text-xs text-white/90">
                      {user.contacts_synced ? 'View and manage connections' : 'Find friends already on Helper33'}
                    </div>
                  </div>
                  {user.contacts_synced && (
                    <Badge className="bg-white/20 text-white">Active</Badge>
                  )}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}

      {!privacy.is_fully_anonymous && (
        <Card className="border-2 border-purple-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-purple-600" />
              Detailed Privacy Controls
            </CardTitle>
            <CardDescription>
              Fine-tune what information is visible
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleSetting
              icon={Image}
              label="Show Profile Picture"
              description="Display your avatar to others"
              checked={privacy.show_avatar}
              onChange={(val) => handlePrivacyChange('show_avatar', val)}
            />
            
            <ToggleSetting
              icon={FileText}
              label="Show Bio"
              description="Display your bio on your profile"
              checked={privacy.show_bio}
              onChange={(val) => handlePrivacyChange('show_bio', val)}
            />
            
            <ToggleSetting
              icon={MapPin}
              label="Show Location"
              description="Show general location (country/state only)"
              checked={privacy.show_location}
              onChange={(val) => handlePrivacyChange('show_location', val)}
            />
            
            <ToggleSetting
              icon={Sparkles}
              label="Show Activity & Achievements"
              description="Share your progress in the community feed"
              checked={privacy.show_activity}
              onChange={(val) => handlePrivacyChange('show_activity', val)}
            />
            
            <ToggleSetting
              icon={UserPlus}
              label="Allow Friend Requests"
              description="Others can send you connection requests"
              checked={privacy.allow_friend_requests}
              onChange={(val) => handlePrivacyChange('allow_friend_requests', val)}
            />
            
            <ToggleSetting
              icon={Users}
              label="Allow Buddy Requests"
              description="Others can request to be accountability buddies"
              checked={privacy.allow_buddy_requests}
              onChange={(val) => handlePrivacyChange('allow_buddy_requests', val)}
            />
          </CardContent>
        </Card>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-bold mb-1">🔐 Your Privacy is Protected</p>
            <ul className="space-y-1 text-xs">
              <li>• Your real email address is never shown to other users</li>
              <li>• Only information you explicitly enable will be visible</li>
              <li>• Anonymous users can only see other anonymous users</li>
              <li>• You can change these settings anytime</li>
              <li>• Your personal data (journal, tasks, health) stays private</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {onClose && (
        <Button onClick={onClose} variant="outline" className="w-full">
          Done
        </Button>
      )}
    </div>
  );
}

function ShareButton({ icon: Icon, label, color, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`p-4 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg hover:shadow-xl transition-all`}
    >
      <Icon className="w-6 h-6 mx-auto mb-2" />
      <p className="text-sm font-semibold">{label}</p>
    </motion.button>
  );
}

function PrivacyModeCard({ mode, title, description, isActive, onClick, features }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full p-4 rounded-xl border-3 text-left transition-all ${
        isActive
          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white border-purple-700 shadow-xl'
          : 'bg-white border-gray-300 hover:border-purple-400 hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className={`font-bold text-lg ${isActive ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h4>
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <CheckCircle className="w-6 h-6 text-white fill-current" />
          </motion.div>
        )}
      </div>
      <p className={`text-sm mb-3 ${isActive ? 'text-white/90' : 'text-gray-600'}`}>
        {description}
      </p>
      <div className="space-y-1">
        {features.map((feature, idx) => (
          <div key={idx} className={`text-xs flex items-center gap-2 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
            <span className="w-1 h-1 rounded-full bg-current"></span>
            {feature}
          </div>
        ))}
      </div>
    </motion.button>
  );
}

function ToggleSetting({ icon: Icon, label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3 flex-1">
        <Icon className="w-5 h-5 text-purple-600" />
        <div>
          <p className="font-semibold text-gray-900 text-sm">{label}</p>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
      </label>
    </div>
  );
}

function InfoBadge({ icon: Icon, label, value, active }) {
  return (
    <div className={`p-3 rounded-lg border-2 ${
      active 
        ? 'bg-purple-100 border-purple-300' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${active ? 'text-purple-600' : 'text-gray-500'}`} />
        <p className="text-xs font-semibold text-gray-600">{label}</p>
      </div>
      <p className={`text-sm font-bold ${active ? 'text-purple-900' : 'text-gray-700'}`}>
        {value}
      </p>
    </div>
  );
}

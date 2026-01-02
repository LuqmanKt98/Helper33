import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import {
  Mail,
  Send,
  Copy,
  CheckCircle,
  UserPlus,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function InviteFriends({ user }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sentInvites, setSentInvites] = useState([]);
  const queryClient = useQueryClient();

  const inviteLink = `${window.location.origin}/?ref=${user?.invite_code || user?.id}`;

  const sendInviteMutation = useMutation({
    mutationFn: async ({ inviteeEmail, inviteeName, personalMessage }) => {
      // Create invite record
      const invite = await base44.entities.CommunityInvite.create({
        inviter_email: user.email,
        inviter_name: user.preferred_name || user.full_name,
        invitee_email: inviteeEmail,
        invitee_name: inviteeName,
        personal_message: personalMessage,
        invite_type: 'general',
        sent_at: new Date().toISOString(),
        email_sent: false
      });

      // Send email notification
      try {
        await base44.integrations.Core.SendEmail({
          to: inviteeEmail,
          subject: `${user.preferred_name || user.full_name} invited you to Helper33! 💜`,
          body: `Hi ${inviteeName || 'there'}!

${user.preferred_name || user.full_name} has invited you to join Helper33 - an AI-powered wellness and support community.

${personalMessage ? `Personal message from ${user.preferred_name || user.full_name}:\n"${personalMessage}"\n\n` : ''}

Helper33 offers:
🧠 AI Wellness Coaching & Mental Health Support
👨‍👩‍👧‍👦 Family Hub & Task Management
📚 Student AI Tutoring & Homework Help
🎨 Kids Creative Studio (COPPA-compliant)
💼 Business AI Tools & Social Media Manager
🍳 Meal Planning & Recipe Generator
🌟 And 33+ more AI tools!

Join the community today:
${inviteLink}

Looking forward to seeing you there!

---
Helper33 Team
Making AI helpful for everyday life 💜`
        });

        // Update invite to mark email sent
        await base44.entities.CommunityInvite.update(invite.id, {
          email_sent: true
        });
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }

      return invite;
    },
    onSuccess: (invite) => {
      queryClient.invalidateQueries(['communityInvites']);
      setSentInvites([...sentInvites, invite]);
      setEmail('');
      setName('');
      setMessage('');
      toast.success(`🎉 Invitation sent to ${invite.invitee_email}!`);
    },
    onError: (error) => {
      toast.error('Failed to send invite. Please try again.');
      console.error('Invite error:', error);
    }
  });

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied! 📋');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join me on Helper33! 💜');
    const body = encodeURIComponent(`Hi!

I've been using Helper33 and thought you might enjoy it too!

It's an amazing AI-powered platform with 33+ tools for wellness, family management, learning, and more. All designed to make everyday life easier and more meaningful.

Join me here: ${inviteLink}

Hope to see you there! 💜`);

    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSendInvite = () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    sendInviteMutation.mutate({
      inviteeEmail: email.trim(),
      inviteeName: name.trim(),
      personalMessage: message.trim()
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UserPlus className="w-6 h-6 text-purple-600" />
              Invite Friends to Helper33
            </CardTitle>
            <CardDescription>
              Share the gift of AI-powered wellness and support with people you care about
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Share Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={copyInviteLink}
                variant="outline"
                className="border-2 border-purple-300 hover:bg-purple-50 h-auto py-4"
              >
                <LinkIcon className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <p className="font-semibold">Copy Invite Link</p>
                  <p className="text-xs text-gray-500">Share anywhere</p>
                </div>
              </Button>

              <Button
                onClick={shareViaEmail}
                variant="outline"
                className="border-2 border-blue-300 hover:bg-blue-50 h-auto py-4"
              >
                <Mail className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <p className="font-semibold">Share via Email</p>
                  <p className="text-xs text-gray-500">Send to multiple</p>
                </div>
              </Button>
            </div>

            {/* Your Invite Code */}
            <div className="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl border-2 border-indigo-300">
              <p className="text-sm font-semibold text-indigo-900 mb-2">Your Personal Invite Code:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-2xl font-bold text-center bg-white p-3 rounded-lg border-2 border-indigo-400 text-indigo-900 tracking-widest">
                  {user?.invite_code || 'HELPER'}
                </code>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(user?.invite_code || '');
                    toast.success('Code copied!');
                  }}
                  size="icon"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Direct Email Invite Form */}
            <div className="space-y-4 p-4 bg-white rounded-xl border-2 border-purple-200">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                Send Personal Invitation
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="border-2 border-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Their Name (optional)
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="border-2 border-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Personal Message (optional)
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="I think you'd really enjoy Helper33! It's been so helpful for me..."
                    className="h-24 border-2 border-purple-200"
                  />
                </div>

                <Button
                  onClick={handleSendInvite}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                  disabled={sendInviteMutation.isPending}
                >
                  {sendInviteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Invite...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Invitation Email
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Recently Sent Invites */}
            {sentInvites.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Recently Sent ({sentInvites.length})
                </h4>
                <div className="space-y-2">
                  {sentInvites.map((invite, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-green-50 border-2 border-green-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{invite.invitee_email}</p>
                          <p className="text-xs text-gray-600">Sent just now</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
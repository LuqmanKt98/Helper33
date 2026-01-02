import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, UserPlus, Trash2, CheckCircle, Clock, XCircle, Copy, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { format } from 'date-fns';

const MAX_FAMILY_MEMBERS = 5;

export default function FamilySharingManager({ user }) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    relationship: ''
  });
  const queryClient = useQueryClient();

  const hasActiveSubscription = user?.subscription_status === 'active' && 
    (user?.plan_type?.includes('pro') || user?.plan_type?.includes('executive'));

  const { data: familyMembers = [], isLoading } = useQuery({
    queryKey: ['family-subscription-members'],
    queryFn: () => base44.entities.FamilySubscriptionMember.filter({
      primary_user_email: user?.email
    }),
    enabled: !!user?.email && hasActiveSubscription
  });

  const inviteMutation = useMutation({
    mutationFn: async (data) => {
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const invitation = await base44.entities.FamilySubscriptionMember.create({
        primary_user_email: user.email,
        primary_user_name: user.full_name,
        member_email: data.email,
        member_name: data.name,
        invitation_code: inviteCode,
        relationship: data.relationship,
        status: 'pending',
        invited_at: new Date().toISOString()
      });

      const inviteUrl = `${window.location.origin}/AcceptFamilyInvite?code=${inviteCode}`;

      await base44.integrations.Core.SendEmail({
        to: data.email,
        subject: `${user.full_name} invited you to join DobryLife Family Plan!`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #7c3aed; margin-bottom: 10px;">💜 You're Invited to DobryLife!</h1>
            </div>
            
            <div style="background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%); padding: 30px; border-radius: 15px; margin-bottom: 20px;">
              <h2 style="color: #581c87; margin-top: 0;">Hi ${data.name}!</h2>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                <strong>${user.full_name}</strong> has invited you to join their DobryLife Family Plan!
              </p>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                This means you'll get full access to all DobryLife features including:
              </p>
              <ul style="color: #4a5568; font-size: 15px; line-height: 1.8;">
                <li>✨ AI Grief Coach & Life Coach</li>
                <li>📓 Unlimited Journaling & Writing Tools</li>
                <li>🎯 Life Organizer & Habit Tracker</li>
                <li>💗 Wellness & Mindfulness Tools</li>
                <li>👨‍👩‍👧‍👦 Family Hub & Coordination</li>
                <li>📚 Ruby's Books & Premium Content</li>
                <li>🌸 Women's Health Tracking</li>
                <li>And so much more!</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px;">
                Accept Invitation
              </a>
            </div>

            <div style="background: #f7fafc; padding: 20px; border-radius: 10px; margin-top: 20px;">
              <p style="color: #4a5568; font-size: 14px; margin: 0;">
                Your invitation code: <strong style="color: #7c3aed; font-size: 16px;">${inviteCode}</strong>
              </p>
              <p style="color: #718096; font-size: 12px; margin-top: 10px;">
                This invitation is personal to you. Please don't share this link with others.
              </p>
            </div>
          </div>
        `
      });

      return invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-subscription-members'] });
      toast.success('Invitation sent! 📧');
      setShowInviteModal(false);
      setInviteForm({ email: '', name: '', relationship: '' });
    },
    onError: (error) => {
      toast.error('Failed to send invitation');
      console.error(error);
    }
  });

  const revokeMutation = useMutation({
    mutationFn: async (memberId) => {
      return await base44.entities.FamilySubscriptionMember.update(memberId, {
        status: 'revoked'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-subscription-members'] });
      toast.success('Access revoked');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (memberId) => {
      return await base44.entities.FamilySubscriptionMember.delete(memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-subscription-members'] });
      toast.success('Invitation removed');
    }
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.name) {
      toast.error('Please fill in all required fields');
      return;
    }
    inviteMutation.mutate(inviteForm);
  };

  const activeMembersCount = familyMembers.filter(m => m.status === 'accepted').length;
  const pendingMembersCount = familyMembers.filter(m => m.status === 'pending').length;
  const availableSlots = MAX_FAMILY_MEMBERS - activeMembersCount - pendingMembersCount;

  if (!hasActiveSubscription) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="p-8 text-center">
          <Users className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Family Sharing</h3>
          <p className="text-gray-600 mb-4">
            Share DobryLife with up to 5 family members!
          </p>
          <p className="text-sm text-purple-700 mb-6">
            Available with Pro and Executive plans
          </p>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            Upgrade to Enable Family Sharing
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Family Sharing
          </CardTitle>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            {activeMembersCount + pendingMembersCount} / {MAX_FAMILY_MEMBERS} Used
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Share the love!</strong> Invite up to {MAX_FAMILY_MEMBERS} family members to access all DobryLife features 
            with your {user.plan_type} subscription. They'll get their own account with full access.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">{activeMembersCount}</div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-700">{pendingMembersCount}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <UserPlus className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{availableSlots}</div>
            <div className="text-xs text-gray-600">Available</div>
          </div>
        </div>

        {availableSlots > 0 && (
          <Button
            onClick={() => setShowInviteModal(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Invite Family Member ({availableSlots} slots left)
          </Button>
        )}

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Family Members</h3>
          <AnimatePresence>
            {familyMembers.length > 0 ? (
              familyMembers.map((member, idx) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                            {member.member_name?.charAt(0) || 'F'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{member.member_name || 'Family Member'}</p>
                            <p className="text-sm text-gray-600">{member.member_email}</p>
                            {member.relationship && (
                              <p className="text-xs text-gray-500">{member.relationship}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {member.status === 'accepted' && (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          )}
                          {member.status === 'pending' && (
                            <Badge className="bg-yellow-500 text-white">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          {member.status === 'revoked' && (
                            <Badge className="bg-red-500 text-white">
                              <XCircle className="w-3 h-3 mr-1" />
                              Revoked
                            </Badge>
                          )}
                          
                          {member.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const inviteUrl = `${window.location.origin}/AcceptFamilyInvite?code=${member.invitation_code}`;
                                navigator.clipboard.writeText(inviteUrl);
                                toast.success('Invitation link copied!');
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {member.status !== 'revoked' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Remove ${member.member_name} from family sharing?`)) {
                                  if (member.status === 'accepted') {
                                    revokeMutation.mutate(member.id);
                                  } else {
                                    deleteMutation.mutate(member.id);
                                  }
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {member.status === 'pending' && member.invited_at && (
                        <p className="text-xs text-gray-500 mt-2">
                          Invited {format(new Date(member.invited_at), 'MMM d, yyyy')}
                        </p>
                      )}
                      {member.status === 'accepted' && member.accepted_at && (
                        <p className="text-xs text-green-600 mt-2">
                          Joined {format(new Date(member.accepted_at), 'MMM d, yyyy')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No family members invited yet</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                Invite Family Member
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="jane@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="relationship">Relationship</Label>
                <Input
                  id="relationship"
                  value={inviteForm.relationship}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, relationship: e.target.value }))}
                  placeholder="Spouse, Parent, Sibling, etc."
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  💌 We'll send them an email invitation with a secure link to join your family plan.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
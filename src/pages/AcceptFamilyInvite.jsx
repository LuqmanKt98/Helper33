import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AcceptFamilyInvite() {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      setInviteCode(code);
      loadInvitation(code);
    }
  }, []);

  const { user: authUser, logout } = useAuth();

  const { data: user } = useQuery({
    queryKey: ['user', authUser?.id],
    queryFn: async () => {
      if (!authUser) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!authUser
  });

  const loadInvitation = async (code) => {
    try {
      const { data: invitations, error: inviteError } = await supabase
        .from('family_subscription_members')
        .select('*')
        .eq('invitation_code', code);

      if (inviteError) throw inviteError;

      if (!invitations || invitations.length === 0) {
        setError('Invalid or expired invitation code');
        return;
      }

      const invite = invitations[0];

      if (invite.status === 'accepted') {
        setError('This invitation has already been accepted');
        return;
      }

      if (invite.status === 'revoked') {
        setError('This invitation has been revoked');
        return;
      }

      setInvitation(invite);
    } catch (err) {
      setError('Failed to load invitation');
      console.error(err);
    }
  };

  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        // Redirection logic should be handled by the app's auth flow
        navigate(createPageUrl('Login') + `?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }

      // Update invitation status
      const { error: inviteError } = await supabase
        .from('family_subscription_members')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          member_name: user.full_name || invitation.member_name
        })
        .eq('id', invitation.id);

      if (inviteError) throw inviteError;

      // Update user's subscription access in profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          plan_type: 'family_shared',
          family_plan_owner: invitation.primary_user_email
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      return true;
    },
    onSuccess: () => {
      navigate(createPageUrl('Dashboard'));
    }
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-white/90 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={() => navigate(createPageUrl('Home'))}
              variant="outline"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-white/90 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              You're Invited to DobryLife!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invitation Details */}
            <div className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
              <p className="text-center text-lg text-gray-800 mb-2">
                <strong className="text-purple-700">{invitation.primary_user_name}</strong> has invited you to join their DobryLife Family Plan!
              </p>
              {invitation.relationship && (
                <p className="text-center text-sm text-gray-600">
                  Relationship: {invitation.relationship}
                </p>
              )}
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">You'll get full access to:</h3>
              <div className="grid gap-2">
                {[
                  '✨ AI Grief Coach & Life Coach',
                  '📓 Unlimited Journaling & Writing Tools',
                  '🎯 Life Organizer & Habit Tracker',
                  '💗 Wellness & Mindfulness Tools',
                  '👨‍👩‍👧‍👦 Family Hub & Coordination',
                  '📚 Ruby\'s Books & Premium Content',
                  '🌸 Women\'s Health Tracking',
                  '🎮 Mindful Games & Activities',
                  '🍽️ Meal Planning & Recipes',
                  '🎨 Kids Creative Studio'
                ].map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              {!user ? (
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    You need to sign in or create an account to accept this invitation
                  </p>
                  <Button
                    onClick={() => navigate(createPageUrl('Login') + `?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6"
                  >
                    Sign In / Create Account
                  </Button>
                </div>
              ) : user.email === invitation.member_email ? (
                <Button
                  onClick={() => acceptMutation.mutate()}
                  disabled={acceptMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6"
                >
                  {acceptMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Accept Invitation
                    </>
                  )}
                </Button>
              ) : (
                <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                  <p className="text-sm text-yellow-800 text-center">
                    This invitation was sent to <strong>{invitation.member_email}</strong>.
                    You're currently signed in as <strong>{user.email}</strong>.
                    Please sign in with the correct account to accept.
                  </p>
                  <Button
                    onClick={() => logout()}
                    variant="outline"
                    className="w-full mt-3"
                  >
                    Sign Out & Try Again
                  </Button>
                </div>
              )}
            </div>

            {/* Support Note */}
            <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <p className="text-xs text-blue-800 text-center">
                💙 Questions? Contact us at support@dobry.life
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, ExternalLink, Loader2, Users } from 'lucide-react'; // Added Users icon
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQueryClient } from '@tanstack/react-query'; // Added useQueryClient
import { Card, CardContent } from '@/components/ui/card'; // Added Card components

export default function SubscriptionManager({ user }) {
  const queryClient = useQueryClient(); // Initialized useQueryClient
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isManaging, setIsManaging] = useState(false); // Added isManaging state

  // Check if user is on a family shared plan
  const isFamilyMember = user?.plan_type === 'family_shared';

  const handleManageSubscription = async () => {
    setIsRedirecting(true);
    try {
      const response = await base44.functions.invoke('createStripePortalSession', {
        return_url: window.location.href,
      });
      const { url } = response.data;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Could not retrieve subscription portal URL.");
      }
    } catch (error) {
      console.error("Failed to redirect to subscription portal:", error);
      alert("There was a problem accessing the subscription portal. Please try again later.");
      setIsRedirecting(false);
    }
  };

  const planName = {
    'free': 'Free Plan',
    'pro_monthly': 'Pro (Monthly)',
    'pro_yearly': 'Pro (Yearly)',
    'executive_monthly': 'Executive (Monthly)',
    'executive_yearly': 'Executive (Yearly)',
    'infinity_journal': 'Infinity Journal',
    'things_they_took': 'Things They Took Book',
    'family_shared': 'Family Shared Plan', // Added family_shared
  }[user?.plan_type] || 'Free Plan';

  const statusColor = {
    'active': 'bg-green-100 text-green-800',
    'cancelled': 'bg-yellow-100 text-yellow-800',
    'past_due': 'bg-red-100 text-red-800',
    'free': 'bg-blue-100 text-blue-800',
    'family_shared': 'bg-purple-100 text-purple-800', // Added family_shared
  }[user?.subscription_status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      {isFamilyMember && (
        <Card className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-green-700 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-green-900 mb-1">Family Plan Member</h3>
                <p className="text-sm text-green-800">
                  You have full access to DobryLife through <strong>{user.family_plan_owner}</strong>'s family plan.
                  Enjoy all premium features! 💚
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Your Subscription</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="font-semibold text-gray-700">{planName}</span>
              <Badge className={`${statusColor} capitalize`}>{user?.subscription_status || 'Free'}</Badge>
            </div>
          </div>
          {user?.plan_type === 'free' || isFamilyMember ? ( // Conditionally hide "Upgrade" button for family members
            <Button asChild className="bg-gradient-to-r from-green-500 to-emerald-600 text-white" disabled={isFamilyMember}>
              <Link to={createPageUrl('Upgrade')}>
                <Rocket className="w-4 h-4 mr-2" /> {isFamilyMember ? 'Premium Access (Family)' : 'Upgrade to Pro'}
              </Link>
            </Button>
          ) : (
            <Button onClick={handleManageSubscription} disabled={isRedirecting}>
              {isRedirecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Manage Subscription
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

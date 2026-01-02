import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Phone, 
  Mail,
  Copy,
  DollarSign,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

// Common cancellation guides for popular services
const CANCELLATION_GUIDES = {
  netflix: {
    name: 'Netflix',
    link: 'https://www.netflix.com/cancelplan',
    phone: '1-866-579-7172',
    steps: [
      'Sign in to Netflix.com',
      'Click on your profile icon (top right)',
      'Select "Account"',
      'Under Membership & Billing, click "Cancel Membership"',
      'Confirm cancellation',
      'You\'ll have access until the end of your billing period'
    ]
  },
  spotify: {
    name: 'Spotify',
    link: 'https://www.spotify.com/account/subscription/',
    steps: [
      'Log into your Spotify account',
      'Go to Account page',
      'Click "Change or Cancel"',
      'Select "Cancel Premium"',
      'Follow the prompts to confirm',
      'Premium features remain until billing cycle ends'
    ]
  },
  'amazon prime': {
    name: 'Amazon Prime',
    link: 'https://www.amazon.com/mc/manageprimemembership',
    phone: '1-888-280-4331',
    steps: [
      'Go to Amazon.com and sign in',
      'Click "Account & Lists" then "Prime Membership"',
      'Click "Update, Cancel and More"',
      'Select "End Membership"',
      'Confirm cancellation',
      'You may be eligible for a refund if unused'
    ]
  },
  'apple music': {
    name: 'Apple Music',
    steps: [
      'Open Settings on your iPhone/iPad',
      'Tap your name at the top',
      'Tap "Subscriptions"',
      'Select Apple Music',
      'Tap "Cancel Subscription"',
      'Confirm cancellation'
    ]
  },
  hulu: {
    name: 'Hulu',
    link: 'https://secure.hulu.com/account',
    steps: [
      'Go to Hulu.com and log in',
      'Click your name, then "Account"',
      'Under "Your Subscription", click "Cancel"',
      'Follow prompts to confirm',
      'Access continues until billing date'
    ]
  },
  'disney+': {
    name: 'Disney+',
    link: 'https://www.disneyplus.com/account',
    steps: [
      'Log in to DisneyPlus.com',
      'Go to your Profile',
      'Select "Account"',
      'Click "Cancel Subscription"',
      'Confirm your cancellation',
      'Service continues until period ends'
    ]
  },
  'youtube premium': {
    name: 'YouTube Premium',
    link: 'https://www.youtube.com/paid_memberships',
    steps: [
      'Go to youtube.com/paid_memberships',
      'Find YouTube Premium',
      'Click "Manage Membership"',
      'Select "Cancel membership"',
      'Confirm cancellation',
      'Benefits last until billing cycle ends'
    ]
  }
};

export default function CancellationGuideModal({ subscription, open, onClose, onCancel }) {
  const [customLink, setCustomLink] = useState(subscription?.cancellation_link || '');
  const [confirmedCancel, setConfirmedCancel] = useState(false);

  const serviceName = subscription?.service_name?.toLowerCase();
  const guide = CANCELLATION_GUIDES[serviceName] || null;

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleMarkCancelled = () => {
    onCancel({
      ...subscription,
      cancellation_status: 'cancelled',
      cancellation_date: new Date().toISOString().split('T')[0],
      is_active: false
    });
    onClose();
  };

  const calculateSavings = () => {
    const amount = subscription?.amount || 0;
    const cycle = subscription?.billing_cycle;
    
    if (cycle === 'monthly') return amount * 12;
    if (cycle === 'yearly') return amount;
    if (cycle === 'quarterly') return amount * 4;
    if (cycle === 'weekly') return amount * 52;
    return 0;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            Cancel {subscription?.service_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Savings Calculation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-700 font-semibold">Potential Annual Savings</p>
                <p className="text-3xl font-bold text-emerald-900">${calculateSavings().toFixed(2)}</p>
              </div>
            </div>
            <p className="text-sm text-emerald-700">
              By canceling this subscription, you could save this much per year!
            </p>
          </motion.div>

          {/* Guided Steps */}
          {guide ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                Step-by-Step Cancellation Guide
              </h3>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 mb-6">
                {guide.link && (
                  <motion.a
                    href={guide.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Cancellation Page
                    </Button>
                  </motion.a>
                )}
                {guide.phone && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="border-2"
                      onClick={() => handleCopyToClipboard(guide.phone)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {guide.phone}
                      <Copy className="w-3 h-3 ml-2 opacity-60" />
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {guide.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 flex-1 pt-1">{step}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-bold text-lg mb-4">Custom Cancellation</h3>
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-800 mb-2">
                  <strong>We don't have specific cancellation steps for {subscription?.service_name}.</strong>
                </p>
                <p className="text-sm text-amber-700">
                  Try these general steps:
                </p>
              </div>

              <div className="space-y-3">
                {[
                  'Visit the service\'s website or app',
                  'Log into your account',
                  'Look for Account Settings or Subscription',
                  'Find "Cancel" or "Manage Subscription"',
                  'Follow the cancellation prompts',
                  'Save confirmation email/number'
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 text-sm pt-1">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Label>Add Cancellation Link (Optional)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="https://service.com/cancel"
                    value={customLink}
                    onChange={(e) => setCustomLink(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (customLink) {
                        window.open(customLink, '_blank');
                      }
                    }}
                    disabled={!customLink}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Important Notes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-50 border border-blue-300 rounded-lg p-4"
          >
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Important Reminders
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>You typically keep access until your current billing period ends</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Save any confirmation emails or cancellation numbers</span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Check if you're eligible for a refund for unused time</span>
              </li>
            </ul>
          </motion.div>

          {/* Confirmation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border-t pt-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="confirm-cancel"
                checked={confirmedCancel}
                onChange={(e) => setConfirmedCancel(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300"
              />
              <label htmlFor="confirm-cancel" className="text-sm text-gray-700 cursor-pointer">
                I have successfully cancelled this subscription
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={handleMarkCancelled}
                disabled={!confirmedCancel}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Cancelled
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
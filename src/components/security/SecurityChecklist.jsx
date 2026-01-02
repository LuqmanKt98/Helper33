import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SecurityChecklist() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: twoFASettings } = useQuery({
    queryKey: ['twoFASettings', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const settings = await base44.entities.TwoFactorAuth.filter({ user_email: user.email });
      return settings[0] || null;
    },
    enabled: !!user
  });

  const { data: pushSubscriptions } = useQuery({
    queryKey: ['pushSubscriptions', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.PushSubscription.filter({ created_by: user?.email });
      return subs;
    },
    enabled: !!user
  });

  const securityItems = [
    {
      id: 'password',
      title: 'Strong Password',
      description: 'Password should be at least 8 characters',
      completed: true, // Enforced by auth system
      critical: true
    },
    {
      id: '2fa',
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      completed: twoFASettings?.is_enabled || false,
      critical: true,
      action: 'Security'
    },
    {
      id: 'gdpr',
      title: 'Privacy Consent',
      description: 'Review and manage your data processing preferences',
      completed: !!user?.gdpr_consent,
      critical: false,
      action: 'Security'
    },
    {
      id: 'notifications',
      title: 'Secure Notifications',
      description: 'Enable encrypted push notifications',
      completed: pushSubscriptions?.length > 0,
      critical: false,
      action: 'NotificationSettings'
    },
    {
      id: 'payment',
      title: 'Payment Security',
      description: 'Verified payment method with Stripe',
      completed: !!user?.stripe_customer_id,
      critical: false,
      action: 'AccountManager'
    }
  ];

  const completedCount = securityItems.filter(item => item.completed).length;
  const completionPercentage = Math.round((completedCount / securityItems.length) * 100);

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Security Checklist
          </CardTitle>
          <Badge className={
            completionPercentage === 100 ? 'bg-green-500' :
            completionPercentage >= 60 ? 'bg-yellow-500' :
            'bg-red-500'
          }>
            {completedCount}/{securityItems.length} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Security Score</span>
            <span className="text-sm font-bold text-purple-600">{completionPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                completionPercentage === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                completionPercentage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-red-500 to-rose-500'
              }`}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          {securityItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-xl border-2 transition-all ${
                item.completed 
                  ? 'bg-white border-green-200' 
                  : item.critical 
                    ? 'bg-red-50 border-red-300'
                    : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : item.critical ? (
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                </div>
                {!item.completed && item.action && (
                  <Link to={createPageUrl(item.action)}>
                    <Button size="sm" variant="outline" className="border-purple-300 hover:bg-purple-50">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {completionPercentage < 100 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <p className="text-sm text-gray-700 text-center">
              <strong>💡 Tip:</strong> Complete all security steps to protect your account and data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
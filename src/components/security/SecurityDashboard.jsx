import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Shield, Lock, Key, CheckCircle, Eye,
  FileText, Smartphone, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SecurityDashboard() {
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

  const securityFeatures = [
    {
      title: 'Two-Factor Authentication',
      description: '2FA adds an extra layer of security',
      icon: Key,
      status: twoFASettings?.is_enabled ? 'enabled' : 'disabled',
      action: 'Security',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Data Encryption',
      description: 'All data encrypted at rest and in transit',
      icon: Lock,
      status: 'enabled',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Push Notifications',
      description: `${pushSubscriptions?.length || 0} active device(s)`,
      icon: Smartphone,
      status: pushSubscriptions?.length > 0 ? 'enabled' : 'disabled',
      action: 'NotificationSettings',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Privacy Controls',
      description: 'GDPR compliant data management',
      icon: Eye,
      status: user?.gdpr_consent ? 'configured' : 'pending',
      action: 'Security',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const securityScore = [
    twoFASettings?.is_enabled ? 25 : 0,
    user?.gdpr_consent ? 25 : 0,
    pushSubscriptions?.length > 0 ? 25 : 0,
    25 // Base encryption score
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className={`border-2 ${
          securityScore >= 75 ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' :
          securityScore >= 50 ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50' :
          'border-red-300 bg-gradient-to-br from-red-50 to-rose-50'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Security Score</h3>
                <p className="text-sm text-gray-600">Your account security rating</p>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${
                  securityScore >= 75 ? 'text-green-600' :
                  securityScore >= 50 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {securityScore}%
                </div>
                <Badge className={
                  securityScore >= 75 ? 'bg-green-500' :
                  securityScore >= 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }>
                  {securityScore >= 75 ? 'Excellent' :
                   securityScore >= 50 ? 'Good' :
                   'Needs Improvement'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Features Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {securityFeatures.map((feature, idx) => {
          const Icon = feature.icon;
          const isEnabled = feature.status === 'enabled' || feature.status === 'configured';

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="border-2 border-gray-200 hover:border-purple-300 transition-all h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className={isEnabled ? 'bg-green-500' : 'bg-gray-400'}>
                      {isEnabled ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                      ) : (
                        'Inactive'
                      )}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                  {feature.action && !isEnabled && (
                    <Link to={createPageUrl(feature.action)}>
                      <Button variant="outline" size="sm" className="w-full">
                        Configure
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      {user?.role === 'admin' && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Admin Security Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-3">
            <Link to={createPageUrl('SecurityAudit')}>
              <Button variant="outline" className="w-full justify-start border-purple-300">
                <FileText className="w-4 h-4 mr-2" />
                Security Audit
              </Button>
            </Link>
            <Link to={createPageUrl('AdminAuditLogs')}>
              <Button variant="outline" className="w-full justify-start border-purple-300">
                <Activity className="w-4 h-4 mr-2" />
                Audit Logs
              </Button>
            </Link>
            <Link to={createPageUrl('Security')}>
              <Button variant="outline" className="w-full justify-start border-purple-300">
                <Lock className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
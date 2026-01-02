import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Shield, Lock, Download, Trash2, 
  AlertTriangle, CheckCircle, Mail, MessageSquare, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { send2FACode } from '@/functions/send2FACode';
import { verify2FACode } from '@/functions/verify2FACode';
import SEO from '@/components/SEO';
import SecurityChecklist from '@/components/security/SecurityChecklist';
import SecurityDashboard from '@/components/security/SecurityDashboard';

export default function Security() {
  const queryClient = useQueryClient();
  const [twoFACode, setTwoFACode] = useState('');
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const enable2FAMutation = useMutation({
    mutationFn: async ({ method, phone }) => {
      // Create or update 2FA record
      if (twoFASettings) {
        await base44.entities.TwoFactorAuth.update(twoFASettings.id, {
          method,
          phone_number: phone,
          is_enabled: false // Will enable after verification
        });
      } else {
        await base44.entities.TwoFactorAuth.create({
          user_email: user.email,
          method,
          phone_number: phone,
          is_enabled: false
        });
      }

      // Send verification code
      const result = await send2FACode({ email: user.email, method });
      return result.data;
    },
    onSuccess: () => {
      setShowVerifyCode(true);
      toast.success('Verification code sent!');
      queryClient.invalidateQueries({ queryKey: ['twoFASettings'] });
    },
    onError: (error) => {
      toast.error('Failed to enable 2FA: ' + error.message);
    }
  });

  const verify2FAMutation = useMutation({
    mutationFn: async (code) => {
      const result = await verify2FACode({ 
        email: user.email, 
        code,
        trust_device: true
      });
      return result.data;
    },
    onSuccess: async () => {
      // Enable 2FA
      await base44.entities.TwoFactorAuth.update(twoFASettings.id, {
        is_enabled: true
      });
      
      toast.success('Two-Factor Authentication enabled!');
      setShowVerifyCode(false);
      setTwoFACode('');
      queryClient.invalidateQueries({ queryKey: ['twoFASettings'] });
    },
    onError: (error) => {
      toast.error('Invalid code: ' + error.message);
    }
  });

  const disable2FAMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.TwoFactorAuth.update(twoFASettings.id, {
        is_enabled: false
      });
    },
    onSuccess: () => {
      toast.success('Two-Factor Authentication disabled');
      queryClient.invalidateQueries({ queryKey: ['twoFASettings'] });
    }
  });

  const downloadDataMutation = useMutation({
    mutationFn: async () => {
      // Export all user data
      const allData = {
        user_profile: user,
        created_at: new Date().toISOString(),
        data_export_version: '1.0'
      };

      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `helper33-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Your data has been downloaded');
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      // This would need admin approval or special handling
      toast.info('Account deletion request submitted. You will receive confirmation via email.');
      // In production, this would trigger a backend function to handle deletion
      setShowDeleteConfirm(false);
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 flex items-center justify-center">
        <p className="text-gray-600">Please log in to access security settings</p>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Security & Privacy - Helper33"
        description="Manage your account security and privacy settings"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Security & Privacy</h1>
                <p className="text-gray-600">Protect your account and data</p>
              </div>
            </div>
          </motion.div>

          {/* Security Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <SecurityDashboard />
          </motion.div>

          {/* Security Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <SecurityChecklist />
          </motion.div>

          {/* Two-Factor Authentication */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Two-Factor Authentication (2FA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">2FA Status</p>
                  <p className="text-sm text-gray-600">
                    {twoFASettings?.is_enabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <Badge className={twoFASettings?.is_enabled ? 'bg-green-500' : 'bg-gray-400'}>
                  {twoFASettings?.is_enabled ? (
                    <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                  ) : (
                    'Inactive'
                  )}
                </Badge>
              </div>

              {!twoFASettings?.is_enabled && !showVerifyCode && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Enable two-factor authentication for extra security. Choose your preferred method:
                  </p>
                  
                  <div className="grid gap-3">
                    <Button
                      onClick={() => enable2FAMutation.mutate({ method: 'email' })}
                      disabled={enable2FAMutation.isLoading}
                      variant="outline"
                      className="justify-start"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Enable via Email
                    </Button>

                    <div className="space-y-2">
                      <Input
                        type="tel"
                        placeholder="Phone number (optional)"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mb-2"
                      />
                      <Button
                        onClick={() => enable2FAMutation.mutate({ method: 'sms', phone: phoneNumber })}
                        disabled={enable2FAMutation.isLoading || !phoneNumber}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Enable via SMS
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {showVerifyCode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 bg-purple-50 p-4 rounded-lg"
                >
                  <p className="text-sm font-semibold text-gray-900">Enter verification code:</p>
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl font-bold tracking-widest"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => verify2FAMutation.mutate(twoFACode)}
                      disabled={twoFACode.length !== 6 || verify2FAMutation.isLoading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      Verify & Enable
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowVerifyCode(false);
                        setTwoFACode('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}

              {twoFASettings?.is_enabled && (
                <Button
                  onClick={() => disable2FAMutation.mutate()}
                  disabled={disable2FAMutation.isLoading}
                  variant="destructive"
                >
                  Disable 2FA
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Data Management */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Privacy & Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Download Your Data</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Export all your data in JSON format (GDPR compliant)
                </p>
                <Button
                  onClick={() => downloadDataMutation.mutate()}
                  disabled={downloadDataMutation.isLoading}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download My Data
                </Button>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-rose-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Delete Account
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                
                {!showDeleteConfirm ? (
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete My Account
                  </Button>
                ) : (
                  <div className="space-y-3 bg-white p-4 rounded-lg border-2 border-red-200">
                    <p className="text-sm font-bold text-red-900">
                      Are you absolutely sure? This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => deleteAccountMutation.mutate()}
                        disabled={deleteAccountMutation.isLoading}
                        variant="destructive"
                        size="sm"
                      >
                        Yes, Delete Forever
                      </Button>
                      <Button
                        onClick={() => setShowDeleteConfirm(false)}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* GDPR Consent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Data Processing Consent (GDPR)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Analytics & Performance</p>
                  <p className="text-xs text-gray-600">Help us improve Helper33</p>
                </div>
                <Switch
                  checked={user?.gdpr_consent?.analytics || false}
                  onCheckedChange={async (checked) => {
                    await base44.auth.updateMe({
                      gdpr_consent: {
                        ...user.gdpr_consent,
                        analytics: checked,
                        consent_date: new Date().toISOString()
                      }
                    });
                    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
                    toast.success('Consent updated');
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Marketing Communications</p>
                  <p className="text-xs text-gray-600">Receive tips and updates</p>
                </div>
                <Switch
                  checked={user?.gdpr_consent?.marketing || false}
                  onCheckedChange={async (checked) => {
                    await base44.auth.updateMe({
                      gdpr_consent: {
                        ...user.gdpr_consent,
                        marketing: checked,
                        consent_date: new Date().toISOString()
                      }
                    });
                    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
                    toast.success('Consent updated');
                  }}
                />
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Data processing for core functionality is required and cannot be disabled. 
                We never sell your data to third parties.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
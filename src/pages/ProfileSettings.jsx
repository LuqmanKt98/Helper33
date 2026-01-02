import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User as UserEntity } from '@/entities/all';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { 
  User, 
  Phone, 
  Shield, 
  Save, 
  Loader2, 
  CheckCircle,
  Info,
  TestTube,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import ProfileEditor from '@/components/account/ProfileEditor';
import TwilioSetupGuide from '@/components/TwilioSetupGuide';

const COUNTRIES = {
  "United States": { flag: "🇺🇸", code: "+1" },
  "United Kingdom": { flag: "🇬🇧", code: "+44" },
  "Canada": { flag: "🇨🇦", code: "+1" },
  "Australia": { flag: "🇦🇺", code: "+61" },
  "India": { flag: "🇮🇳", code: "+91" },
  "Ghana": { flag: "🇬🇭", code: "+233" },
  "Nigeria": { flag: "🇳🇬", code: "+234" },
  "Kenya": { flag: "🇰🇪", code: "+254" },
  "South Africa": { flag: "🇿🇦", code: "+27" },
};

export default function ProfileSettings() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => UserEntity.me(),
  });

  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('United States');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testingSMS, setTestingSMS] = useState(false);
  const [testingAll, setTestingAll] = useState(false);
  const [showTwilioGuide, setShowTwilioGuide] = useState(false);

  useEffect(() => {
    if (user) {
      setPhoneNumber(user.phone_number || '');
      setPhoneVerified(!!user.phone_number);
      
      if (user.location_settings?.country) {
        setCountry(user.location_settings.country);
      }
    }
  }, [user]);

  const handleSavePhone = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsSaving(true);
    try {
      // Format phone number with country code
      const countryCode = COUNTRIES[country]?.code || '+1';
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith(countryCode.replace('+', '')) 
        ? `+${cleanPhone}` 
        : `${countryCode}${cleanPhone}`;

      await UserEntity.updateMyUserData({
        phone_number: formattedPhone,
        prefers_sms: true,
        notification_settings: {
          ...(user.notification_settings || {}),
          sms_enabled: true
        }
      });
      
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      setPhoneVerified(true);
      toast.success('✅ Phone number saved! SMS notifications are now enabled.');
    } catch (error) {
      console.error('Error saving phone:', error);
      toast.error('Failed to save phone number');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSMS = async () => {
    if (!phoneNumber.trim() || !phoneVerified) {
      toast.error('Please save your phone number first');
      return;
    }

    setTestingSMS(true);
    try {
      const result = await base44.functions.invoke('sendSMS', {
        to: user.phone_number,
        body: 'DobryLife Test: Your SMS notifications are working! 🎉\n\nYou will receive task reminders, event alerts, and emergency notifications via SMS.'
      });

      console.log('SMS Test Result:', result?.data);

      if (result?.data?.success !== false) {
        toast.success('✅ Test SMS sent! Check your phone in a few seconds.', { duration: 8000 });
      } else {
        if (result?.data?.trial_account) {
          setShowTwilioGuide(true);
          toast.error('Phone number needs verification on Twilio. See instructions below.', { duration: 6000 });
        } else {
          toast.error(`SMS Error: ${result?.data?.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Test SMS error:', error);
      toast.error('Failed to send test SMS. Check console for details.');
    } finally {
      setTestingSMS(false);
    }
  };

  const handleTestAllNotifications = async () => {
    if (!user) return;

    setTestingAll(true);
    try {
      toast.loading('Testing all notification channels...', { id: 'test-all' });

      const result = await base44.functions.invoke('testTaskReminder', {
        userId: user.id
      });

      console.log('All Channels Test Result:', result?.data);

      toast.dismiss('test-all');

      if (result?.data?.success) {
        const notifResult = result.data.notification_result;
        const messages = [];

        if (notifResult?.results?.push?.attempted) {
          messages.push(notifResult.results.push.success 
            ? '✅ Push: Working' 
            : '❌ Push: Failed - ' + (notifResult.results.push.error || 'Unknown error')
          );
        }

        if (notifResult?.results?.sms?.attempted) {
          messages.push(notifResult.results.sms.success 
            ? '✅ SMS: Working' 
            : '❌ SMS: Failed - ' + (notifResult.results.sms.error || 'Unknown error')
          );
        }

        if (notifResult?.results?.email?.attempted) {
          messages.push(notifResult.results.email.success 
            ? '✅ Email: Working' 
            : '❌ Email: Failed - ' + (notifResult.results.email.error || 'Unknown error')
          );
        }

        toast.success(
          <div>
            <p className="font-bold mb-2">Notification Test Results:</p>
            {messages.map((msg, i) => <p key={i} className="text-sm">{msg}</p>)}
          </div>,
          { duration: 10000 }
        );

        if (notifResult?.results?.sms?.trial_account) {
          setShowTwilioGuide(true);
        }
      } else {
        toast.error('Test failed. Check console for details.');
      }
    } catch (error) {
      console.error('Test All error:', error);
      toast.dismiss('test-all');
      toast.error('Failed to test notifications');
    } finally {
      setTestingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const countryCode = COUNTRIES[country]?.code || '+1';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your personal information and notifications</p>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Phone className="w-4 h-4 mr-2" />
            Contact & SMS
          </TabsTrigger>
          <TabsTrigger value="emergency">
            <Shield className="w-4 h-4 mr-2" />
            Emergency
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your display name and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileEditor user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  SMS Notifications Setup
                </CardTitle>
                <CardDescription>
                  Add your phone number to receive task reminders and alerts via SMS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Why SMS Section */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-2">Why add your phone number?</p>
                      <ul className="list-disc ml-4 space-y-1">
                        <li>📅 Receive task reminders even without internet</li>
                        <li>🚨 Get emergency alerts from family members</li>
                        <li>⏰ Event notifications sent directly to your phone</li>
                        <li>💪 Never miss important reminders</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Phone Number Form */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COUNTRIES).map(([name, { flag, code }]) => (
                          <SelectItem key={name} value={name}>
                            {flag} {name} ({code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2 mt-2">
                      <div className="w-24">
                        <Input value={countryCode} disabled className="bg-gray-100 text-center font-mono" />
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="1234567890"
                        className="flex-1 font-mono"
                      />
                    </div>
                    {phoneVerified && (
                      <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Phone number saved and SMS enabled
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={handleSavePhone} 
                      disabled={isSaving || !phoneNumber}
                      className="bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Phone Number
                        </>
                      )}
                    </Button>

                    {phoneVerified && (
                      <>
                        <Button 
                          variant="outline"
                          onClick={handleTestSMS}
                          disabled={testingSMS}
                        >
                          {testingSMS ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Phone className="w-4 h-4 mr-2" />
                              Test SMS Only
                            </>
                          )}
                        </Button>

                        <Button 
                          variant="outline"
                          onClick={handleTestAllNotifications}
                          disabled={testingAll}
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          {testingAll ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            <>
                              <TestTube className="w-4 h-4 mr-2" />
                              Test All Channels
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Twilio Setup Guide */}
                {showTwilioGuide && <TwilioSetupGuide />}

                {/* How it Works */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>How SMS reminders work:</strong>
                    <ul className="list-disc ml-4 mt-2 text-sm space-y-1">
                      <li>When you set a reminder on a task, we'll send you an SMS at the specified time</li>
                      <li>Emergency alerts from family are sent immediately</li>
                      <li>Event reminders are sent 15 minutes before start time (customizable)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Email Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label>Email Address</Label>
                <Input 
                  value={user?.email || ''} 
                  disabled 
                  className="mt-2 bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Email cannot be changed. Contact support if needed.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Emergency Tab */}
        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Emergency Contacts
              </CardTitle>
              <CardDescription>
                Set up emergency contacts and location information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  For full emergency contact management, please visit the{' '}
                  <a href="/Account" className="text-blue-600 underline font-semibold">Account Settings</a> page.
                </AlertDescription>
              </Alert>

              <Button asChild className="bg-gradient-to-r from-red-600 to-orange-600">
                <a href="/Account">
                  <Shield className="w-4 h-4 mr-2" />
                  Manage Emergency Settings
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
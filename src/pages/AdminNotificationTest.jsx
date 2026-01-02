import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, CheckCircle, XCircle, User, Bell, Mail, MessageSquare, ArrowRight, Flame, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import FirebaseManager from '@/components/push/FirebaseManager';

export default function AdminNotificationTest() {
  const [title, setTitle] = useState('🔔 AppMySite Verification');
  const [message, setMessage] = useState('This is a verification test notification for AppMySite setup.');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedChannels, setSelectedChannels] = useState(['push', 'sms', 'email']);
  const [isSending, setIsSending] = useState(false);
  const [results, setResults] = useState(null);
  const [provider, setProvider] = useState('onesignal'); // 'onesignal' or 'firebase'
  const [firebaseConfig, setFirebaseConfig] = useState('');
  const [serviceAccount, setServiceAccount] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      return allUsers;
    }
  });

  const { data: currentUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const testDirectSMS = async () => {
    const testPhone = prompt('Enter phone number to test (format: +1234567890):');
    if (!testPhone) return;

    setIsSending(true);
    try {
      console.log('📱 Testing direct SMS to:', testPhone);
      
      const response = await base44.functions.invoke('sendSMS', {
        to: testPhone,
        body: 'Direct SMS test from DobryLife admin panel. If you received this, SMS is working!'
      });

      console.log('📬 SMS Response:', response.data);

      if (response.data.success) {
        toast.success('✅ SMS sent! Check your phone.', {
          description: `SID: ${response.data.sid}`
        });
      } else {
        toast.error('❌ SMS failed: ' + response.data.error, {
          description: response.data.details || 'No additional details provided.'
        });
      }
    } catch (error) {
      console.error('❌ SMS Test Error:', error);
      toast.error('Error: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const sendTestNotification = async () => {
    if (!title || !message) {
      toast.error('Please enter title and message');
      return;
    }

    if (selectedChannels.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }

    if (provider === 'firebase' && !serviceAccount) {
      toast.error('Please provide Firebase Service Account JSON for backend sending');
      return;
    }

    setIsSending(true);
    setResults(null);

    try {
      const targetUsers = selectedUser === 'all' 
        ? users 
        : users.filter(u => u.id === selectedUser);

      console.log('📤 Sending to users:', targetUsers.map(u => ({ 
        id: u.id, 
        email: u.email, 
        phone: u.phone_number,
        sms_enabled: u.notification_settings?.sms_enabled,
        push_enabled: u.notification_settings?.push_enabled,
        email_enabled: u.notification_settings?.email_enabled
      })));

      const allResults = [];

      for (const user of targetUsers) {
        try {
          console.log(`📬 Sending to ${user.email}...`);
          
          let response;
          if (provider === 'firebase') {
            // Temporary direct call to firebase function (to be created)
             response = await base44.functions.invoke('sendPushNotificationFCM', {
                userId: user.id,
                title,
                body: message,
                serviceAccount: JSON.parse(serviceAccount) // Passing directly for testing
             });
          } else {
             response = await base44.functions.invoke('sendMultiChannelNotification', {
              userId: user.id,
              title: title,
              body: message,
              data: { type: 'admin_test' },
              channels: selectedChannels,
              priority: 'high',
              force: true
            });
          }

          console.log(`✅ Response for ${user.email}:`, response.data);

          allResults.push({
            user: user.email,
            name: user.full_name,
            phone: user.phone_number,
            ...response.data
          });
        } catch (error) {
          console.error(`❌ Error sending to ${user.email}:`, error);
          allResults.push({
            user: user.email,
            name: user.full_name,
            success: false,
            error: error.message
          });
        }
      }

      setResults(allResults);

      const successCount = allResults.filter(r => r.success).length;
      if (successCount > 0) {
        toast.success(`Sent to ${successCount}/${targetUsers.length} users!`);
      } else {
        toast.error('All notifications failed. Check results below.');
      }

    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to send notifications: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {provider === 'firebase' && firebaseConfig && (
        <FirebaseManager config={firebaseConfig} />
      )}
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Notification Test</h1>
          <p className="text-gray-600 mt-2">Send test notifications to users via Push, SMS, and Email</p>
        </div>

        {/* Provider Selection */}
        <Card>
          <CardContent className="p-4">
             <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700">Push Provider:</span>
                <div className="flex gap-2">
                  <Button 
                    variant={provider === 'onesignal' ? 'default' : 'outline'}
                    onClick={() => setProvider('onesignal')}
                    className="gap-2"
                  >
                    <Bell className="w-4 h-4" /> OneSignal (Default)
                  </Button>
                  <Button 
                    variant={provider === 'firebase' ? 'default' : 'outline'}
                    onClick={() => setProvider('firebase')}
                    className="gap-2"
                  >
                    <Flame className="w-4 h-4" /> Firebase FCM
                  </Button>
                </div>
             </div>
          </CardContent>
        </Card>

        {provider === 'firebase' && (
           <Card className="border-orange-200 bg-orange-50">
             <CardHeader>
               <CardTitle className="text-orange-800 flex items-center gap-2">
                 <Settings className="w-5 h-5" /> Firebase Configuration
               </CardTitle>
               <CardDescription className="text-orange-700">
                 To use Firebase directly, we need your configuration.
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-orange-800 uppercase mb-1">
                    1. Firebase Config Object (for Frontend)
                  </label>
                  <Textarea 
                    placeholder='{"apiKey": "...", "authDomain": "...", "projectId": "...", "messagingSenderId": "...", "appId": "..."}'
                    value={firebaseConfig}
                    onChange={(e) => setFirebaseConfig(e.target.value)}
                    className="font-mono text-xs bg-white"
                    rows={4}
                  />
                  <p className="text-xs text-orange-600 mt-1">
                    Copy this from Firebase Console -&gt; Project Settings -&gt; General -&gt; Your apps -&gt; Web app
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-orange-800 uppercase mb-1">
                    2. Service Account JSON (for Backend)
                  </label>
                  <Textarea 
                    placeholder='{"type": "service_account", "project_id": "...", ...}'
                    value={serviceAccount}
                    onChange={(e) => setServiceAccount(e.target.value)}
                    className="font-mono text-xs bg-white"
                    rows={4}
                  />
                  <p className="text-xs text-orange-600 mt-1">
                    Copy content of the <code>google-services.json</code> or Service Account JSON you downloaded.
                  </p>
                </div>
             </CardContent>
           </Card>
        )}

        {/* Quick SMS Test Button */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Quick SMS Test
            </CardTitle>
            <CardDescription>
              Test SMS delivery directly without user setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testDirectSMS}
              disabled={isSending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" /> Test SMS Now
                </>
              )}
            </Button>
            <p className="text-xs text-gray-600 mt-2">
              💡 This will prompt for a phone number and send a test SMS immediately
            </p>
          </CardContent>
        </Card>

        {/* AppMySite Verification Helper */}
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" />
              AppMySite Verification
            </CardTitle>
            <CardDescription>
              Send a test push to yourself to verify AppMySite setup. Make sure you have allowed notifications in the app first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                setTitle('AppMySite Verification');
                setMessage('This is a verification test to complete the AppMySite setup checklist.');
                setSelectedChannels(['push']);
                setSelectedUser(currentUser?.id || 'all');
                setTimeout(() => sendTestNotification(), 500);
              }}
              disabled={isSending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" /> Send Verification Push
                </>
              )}
            </Button>
            <p className="text-xs text-gray-600 mt-2">
              💡 Sends a push notification to your account. This usually completes the "Notification" step in AppMySite dashboard.
            </p>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-800">
              <strong>Important:</strong> Since you just uploaded Firebase files, you usually need to <strong>Rebuild your App</strong> in AppMySite (under "Download" {'>'} "Rebuild") for notifications to start working on Android.
            </div>
          </CardContent>
        </Card>

        {/* Guide Link */}
        <Card className="border-2 border-blue-100 bg-blue-50">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="font-bold text-lg text-blue-900">Stuck on Firebase Config?</h3>
              <p className="text-sm text-blue-700">
                Need "Google Firebase configuration" or "Service Account" files?
              </p>
            </div>
            <Link to="/AppSetupGuide">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Open Setup Guide <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Setup</CardTitle>
            <CardDescription>Configure and send test notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Send To</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    📢 All Users ({users.length})
                  </SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email} 
                      {user.phone_number && ` - ${user.phone_number}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Channel Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Channels</label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedChannels.includes('push') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedChannels(prev => 
                      prev.includes('push') 
                        ? prev.filter(c => c !== 'push')
                        : [...prev, 'push']
                    );
                  }}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Push
                </Button>
                <Button
                  variant={selectedChannels.includes('sms') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedChannels(prev => 
                      prev.includes('sms') 
                        ? prev.filter(c => c !== 'sms')
                        : [...prev, 'sms']
                    );
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  SMS
                </Button>
                <Button
                  variant={selectedChannels.includes('email') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedChannels(prev => 
                      prev.includes('email') 
                        ? prev.filter(c => c !== 'email')
                        : [...prev, 'email']
                    );
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Notification message"
                rows={4}
              />
            </div>

            {/* Send Button */}
            <Button
              onClick={sendTestNotification}
              disabled={isSending}
              className="w-full"
              size="lg"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Test Notification
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Delivery Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {result.name || result.user}
                        </p>
                        <p className="text-xs text-gray-500">{result.user}</p>
                        {result.phone && (
                          <p className="text-xs text-gray-500">📱 {result.phone}</p>
                        )}
                      </div>
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>

                    {/* Channel Results */}
                    {result.results && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {/* Push */}
                        {result.results.push && (
                          <div className={`p-2 rounded text-xs ${
                            result.results.push.sent ? 'bg-green-50' : 'bg-red-50'
                          }`}>
                            <div className="flex items-center gap-1 mb-1">
                              <Bell className="w-3 h-3" />
                              <span className="font-semibold">Push</span>
                            </div>
                            {result.results.push.sent ? (
                              <span className="text-green-700">✅ Sent</span>
                            ) : (
                              <span className="text-red-700">❌ {result.results.push.error || 'Failed'}</span>
                            )}
                          </div>
                        )}

                        {/* SMS */}
                        {result.results.sms && (
                          <div className={`p-2 rounded text-xs ${
                            result.results.sms.sent ? 'bg-green-50' : 'bg-red-50'
                          }`}>
                            <div className="flex items-center gap-1 mb-1">
                              <MessageSquare className="w-3 h-3" />
                              <span className="font-semibold">SMS</span>
                            </div>
                            {result.results.sms.sent ? (
                              <span className="text-green-700">✅ Sent</span>
                            ) : (
                              <span className="text-red-700">❌ {result.results.sms.error || 'Failed'}</span>
                            )}
                          </div>
                        )}

                        {/* Email */}
                        {result.results.email && (
                          <div className={`p-2 rounded text-xs ${
                            result.results.email.sent ? 'bg-green-50' : 'bg-red-50'
                          }`}>
                            <div className="flex items-center gap-1 mb-1">
                              <Mail className="w-3 h-3" />
                              <span className="font-semibold">Email</span>
                            </div>
                            {result.results.email.sent ? (
                              <span className="text-green-700">✅ Sent</span>
                            ) : (
                              <span className="text-red-700">❌ {result.results.email.error || 'Failed'}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error Message */}
                    {result.error && (
                      <p className="text-xs text-red-600 mt-2">{result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Users ({users.length})</CardTitle>
            <CardDescription>Users who can receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.full_name || 'No Name'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    {user.phone_number && (
                      <p className="text-xs text-gray-500">📱 {user.phone_number}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {user.onesignal_player_id && (
                      <Badge variant="outline" className="text-xs">
                        <Bell className="w-3 h-3 mr-1" /> Push
                      </Badge>
                    )}
                    {user.phone_number && (
                      <Badge variant="outline" className="text-xs">
                        <MessageSquare className="w-3 h-3 mr-1" /> SMS
                      </Badge>
                    )}
                    {user.email && (
                      <Badge variant="outline" className="text-xs">
                        <Mail className="w-3 h-3 mr-1" /> Email
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
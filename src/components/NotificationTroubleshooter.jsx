import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Loader2, ExternalLink, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationTroubleshooter() {
  const [verification, setVerification] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  const runVerification = async () => {
    setIsVerifying(true);
    try {
      const response = await base44.functions.invoke('verifyNotificationSetup');
      setVerification(response.data);
      
      const summary = response.data.summary;
      if (summary.onesignal === '✅ Working' && summary.sendgrid === '✅ Working') {
        toast.success('All notification services are working perfectly!');
      } else {
        toast.warning('Some services need attention - check details below');
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Admin access required for detailed diagnostics');
      } else {
        toast.error('Verification failed: ' + error.message);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusColor = (status) => {
    if (status.includes('✅')) return 'bg-green-50 border-green-200';
    if (status.includes('❌')) return 'bg-red-50 border-red-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  const getStatusIcon = (status) => {
    if (status.includes('✅')) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status.includes('❌')) return <XCircle className="w-5 h-5 text-red-600" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
  };

  return (
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Notification Setup Troubleshooter
        </CardTitle>
        <CardDescription>
          Use this tool to diagnose and fix notification setup issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runVerification} 
          disabled={isVerifying} 
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Verification...
            </>
          ) : (
            'Run Detailed Verification (Admin Only)'
          )}
        </Button>

        {verification && (
          <div className="space-y-4 mt-4">
            {/* OneSignal Status */}
            <Alert className={getStatusColor(verification.summary.onesignal)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <AlertTitle className="flex items-center gap-2">
                    {getStatusIcon(verification.summary.onesignal)}
                    <span>OneSignal (Push Notifications)</span>
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="space-y-2 text-sm">
                      {/* Environment Variables */}
                      <div className="bg-white/50 p-3 rounded">
                        <p className="font-semibold mb-2 flex items-center justify-between">
                          Environment Variables:
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowKeys(!showKeys)}
                          >
                            {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span>ONESIGNAL_APP_ID:</span>
                            <div className="flex items-center gap-2">
                              {verification.environment_variables.onesignal.ONESIGNAL_APP_ID.set ? (
                                <>
                                  <code className="bg-white px-2 py-1 rounded">
                                    {showKeys ? verification.environment_variables.onesignal.ONESIGNAL_APP_ID.value : '••••••••••••'}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(verification.environment_variables.onesignal.ONESIGNAL_APP_ID.value)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </>
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>ONESIGNAL_API_KEY:</span>
                            <div className="flex items-center gap-2">
                              {verification.environment_variables.onesignal.ONESIGNAL_API_KEY.set ? (
                                <>
                                  <code className="bg-white px-2 py-1 rounded text-xs">
                                    {showKeys ? verification.environment_variables.onesignal.ONESIGNAL_API_KEY.value : '••••••••••••'}
                                  </code>
                                  <span className="text-xs text-gray-500">
                                    ({verification.environment_variables.onesignal.ONESIGNAL_API_KEY.length} chars)
                                  </span>
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </>
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* API Test Results */}
                      {verification.api_tests.onesignal.error && (
                        <div className="p-3 bg-red-100 rounded border border-red-200">
                          <p className="font-semibold text-red-900">API Error:</p>
                          <p className="text-xs text-red-800 mt-1">{verification.api_tests.onesignal.error}</p>
                        </div>
                      )}

                      {verification.api_tests.onesignal.details && (
                        <div className="p-3 bg-green-100 rounded border border-green-200">
                          <p className="font-semibold text-green-900 mb-1">Connected Successfully!</p>
                          <div className="text-xs text-green-800 space-y-1">
                            <p>App: {verification.api_tests.onesignal.details.app_name}</p>
                            <p>Players: {verification.api_tests.onesignal.details.messageable_players}</p>
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {verification.recommendations
                        .filter(r => r.service === 'OneSignal')
                        .map((rec, i) => (
                          <div key={i} className="p-3 bg-yellow-50 rounded border border-yellow-200">
                            <p className="font-semibold text-yellow-900">{rec.issue}</p>
                            <p className="text-xs text-yellow-800 mt-1">{rec.solution}</p>
                            {rec.steps && (
                              <ol className="list-decimal list-inside text-xs text-yellow-800 mt-2 space-y-1">
                                {rec.steps.map((step, j) => (
                                  <li key={j}>{step}</li>
                                ))}
                              </ol>
                            )}
                          </div>
                        ))}
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            {/* SendGrid Status */}
            <Alert className={getStatusColor(verification.summary.sendgrid)}>
              {getStatusIcon(verification.summary.sendgrid)}
              <AlertTitle>SendGrid (Email Notifications)</AlertTitle>
              <AlertDescription>
                <div className="space-y-2 text-sm mt-2">
                  <div className="flex items-center justify-between">
                    <span>SENDGRID_API_KEY:</span>
                    {verification.environment_variables.sendgrid.SENDGRID_API_KEY.set ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  {verification.api_tests.sendgrid.error && (
                    <p className="text-xs text-red-600">{verification.api_tests.sendgrid.error}</p>
                  )}
                  {verification.api_tests.sendgrid.details && (
                    <div className="p-2 bg-green-100 rounded">
                      <p className="text-xs text-green-800">
                        Connected as: {verification.api_tests.sendgrid.details.email}
                      </p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Twilio Status */}
            <Alert className={getStatusColor(verification.summary.twilio)}>
              {getStatusIcon(verification.summary.twilio)}
              <AlertTitle>Twilio (SMS Notifications) - Optional</AlertTitle>
              <AlertDescription>
                <div className="space-y-2 text-sm mt-2">
                  {verification.api_tests.twilio.error === 'Credentials not set (optional)' ? (
                    <p className="text-xs">SMS is optional. You can add it later if needed.</p>
                  ) : verification.api_tests.twilio.details ? (
                    <div className="p-2 bg-green-100 rounded">
                      <p className="text-xs text-green-800">
                        Account: {verification.api_tests.twilio.details.account_name}
                      </p>
                      <p className="text-xs text-green-800">
                        Status: {verification.api_tests.twilio.details.account_status}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-red-600">{verification.api_tests.twilio.error}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Quick Fix Guide */}
            {verification.summary.onesignal.includes('❌') && (
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-900">🔧 Quick Fix for OneSignal:</h4>
                <ol className="list-decimal list-inside text-sm space-y-2 text-blue-800">
                  <li>
                    Go to <a 
                      href="https://dashboard.onesignal.com/apps/4a798c34-90cc-47d2-9c0f-bb350eafb514/settings/keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      OneSignal Settings <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Find the <strong>"REST API Key"</strong> (NOT "User Auth Key")</li>
                  <li>Copy the REST API Key</li>
                  <li>
                    Go to Dashboard → Settings → Environment Variables
                    <div className="ml-6 mt-2 space-y-1">
                      <div className="flex items-center gap-2 bg-white p-2 rounded">
                        <code className="text-xs flex-1">ONESIGNAL_API_KEY = [paste your REST API Key here]</code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard('ONESIGNAL_API_KEY')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </li>
                  <li>Save and run this verification again</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
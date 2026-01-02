import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function TwilioSetupGuide() {
  const [showDetails, setShowDetails] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="w-6 h-6 text-orange-600" />
            <div>
              <CardTitle className="text-orange-900">SMS Setup Required</CardTitle>
              <CardDescription className="text-orange-700">
                Twilio trial account detected - verify your phone number to receive SMS
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-orange-300 text-orange-700">
            Trial Account
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Status:</strong> SMS messages can only be sent to verified phone numbers while using a Twilio trial account.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Quick Setup Steps:</h4>
          
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
              <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium">Go to Twilio Console</p>
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-blue-600"
                  asChild
                >
                  <a 
                    href="https://console.twilio.com/us1/develop/phone-numbers/manage/verified" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Open Twilio Verified Numbers <ExternalLink className="w-3 h-3 ml-1 inline" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
              <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium">Click "Add a new Caller ID"</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
              <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium">Enter your phone number</p>
                <p className="text-sm text-gray-600 mt-1">
                  Use the same number you saved in DobryLife profile settings
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
              <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                4
              </div>
              <div className="flex-1">
                <p className="font-medium">Verify with SMS code</p>
                <p className="text-sm text-gray-600 mt-1">
                  You'll receive a verification code via SMS - enter it to complete setup
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200 bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-green-900">Test in DobryLife</p>
                <p className="text-sm text-green-700 mt-1">
                  Return to Profile Settings and click "Test SMS" to verify it's working!
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-4"
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show Upgrade Options
            </>
          )}
        </Button>

        {showDetails && (
          <div className="mt-4 p-4 bg-white rounded-lg border space-y-3">
            <h5 className="font-semibold text-gray-900">Upgrade to Full Twilio Account</h5>
            <p className="text-sm text-gray-600">
              To send SMS to any number without verification:
            </p>
            <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
              <li>Add $20 to your Twilio account</li>
              <li>This automatically upgrades you from trial to full account</li>
              <li>No more number verification required</li>
              <li>Send SMS to anyone instantly</li>
            </ul>
            <Button 
              variant="default"
              className="w-full bg-gradient-to-r from-orange-600 to-red-600"
              asChild
            >
              <a 
                href="https://console.twilio.com/us1/billing/manage-billing/billing-overview" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Upgrade Twilio Account <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
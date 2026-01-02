import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle, Scale, Shield } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600">Last updated: January 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Helper33</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-gray-700">
              <p>
                By using Helper33, you agree to these terms. Please read them carefully. 
                Our service is designed to support your wellness journey with care and respect.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-500" />
                Acceptable Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 text-sm">
              <p>You agree to:</p>
              <ul className="space-y-2 ml-4">
                <li>• Use Helper33 for personal wellness and growth</li>
                <li>• Respect other community members</li>
                <li>• Keep your account secure</li>
                <li>• Provide accurate information</li>
                <li>• Not misuse or abuse the service</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Important Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 text-sm">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="font-semibold mb-2">Not a Substitute for Professional Care</p>
                <p>
                  Helper33's AI coaches and wellness tools are designed to support your well-being, 
                  but they are not a replacement for professional medical advice, therapy, or counseling. 
                  If you're experiencing a mental health crisis, please contact a qualified healthcare provider 
                  or emergency services immediately.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">Service Availability</p>
                <p>
                  We strive to keep Helper33 available 24/7, but we don't guarantee uninterrupted access. 
                  We may need to perform maintenance or updates from time to time.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Your Data Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 text-sm">
              <p>
                You retain all rights to your content and data. You can export or delete your data at any time 
                from your account settings. See our Privacy Policy for more details.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 text-sm">
              <p>
                We may update these terms from time to time. We'll notify you of any significant changes 
                via email or in-app notification. Continued use of Helper33 after changes means you accept the new terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 text-sm">
              <p>
                Questions about these terms? Please reach out through our feedback form.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
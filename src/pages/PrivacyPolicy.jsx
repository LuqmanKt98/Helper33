
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Eye, Users } from 'lucide-react';
// Assuming SEO component exists at '@/components/SEO'
// In a real-world scenario, you might use a library like Next.js's <Head> or React Helmet for SEO.
import SEO from '@/components/SEO'; 

export default function PrivacyPolicy() {
  return (
    <>
      <SEO 
        title="Privacy Policy - Helper33"
        description="Privacy policy and data protection practices for Helper33"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-10 h-10 text-emerald-600" />
                <CardTitle className="text-3xl font-bold text-gray-900">Privacy Policy</CardTitle>
              </div>
              <CardDescription className="text-base">
                Last Updated: November 5, 2025
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                At Helper33, we take your privacy seriously. This policy explains how we collect, 
                use, and protect your personal information.
              </p>

              {/* The following sections were previously individual Cards, now they are direct children
                  of the main CardContent, maintaining their internal Card structure for presentation. */}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    Information We Collect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold mb-2">Account Information</h3>
                    <p className="text-sm">Name, email address, and profile information you provide when creating your account.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Wellness Data</h3>
                    <p className="text-sm">Mood tracking, journal entries, task completion, and other wellness metrics you choose to log.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Usage Information</h3>
                    <p className="text-sm">How you interact with the app, pages visited, and features used to improve your experience.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-green-500" />
                    How We Protect Your Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>All data is encrypted in transit and at rest</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>We never sell your personal information to third parties</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Journal entries and private reflections are only visible to you</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Industry-standard security practices and regular audits</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    Your Rights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-gray-700 text-sm">
                  <p>You have the right to:</p>
                  <ul className="space-y-2 ml-4">
                    <li>• Access all your personal data</li>
                    <li>• Export your data at any time</li>
                    <li>• Delete your account and all associated data</li>
                    <li>• Opt out of non-essential communications</li>
                    <li>• Update or correct your information</li>
                  </ul>
                </CardContent>
              </Card>

              <section className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-emerald-900 mb-3">Contact Us About Privacy</h2>
                <p className="text-emerald-800 mb-2">
                  Questions or concerns about your privacy?
                </p>
                <p className="text-emerald-800">
                  <strong>Privacy Team:</strong>{' '}
                  <a href="mailto:support@helper33.com" className="underline font-semibold hover:text-emerald-900">
                    support@helper33.com
                  </a>
                </p>
                <p className="text-emerald-800 mt-2">
                  <strong>Website:</strong>{' '}
                  <a href="https://www.helper33.com" className="underline font-semibold hover:text-emerald-900" target="_blank" rel="noopener noreferrer">
                    www.helper33.com
                  </a>
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

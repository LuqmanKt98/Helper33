import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, ExternalLink, FileJson, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function AppSetupGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link to={createPageUrl('AdminNotificationTest')}>
            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-indigo-600">
              ← Back to Notification Test
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">AppMySite & Firebase Setup Guide</h1>
          <p className="text-gray-600 mt-2">Follow these steps to get the required files for your AppMySite configuration.</p>
          
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4 rounded-r">
            <p className="text-sm text-amber-800">
              <strong>Important Clarification:</strong> You are <strong>NOT</strong> moving your app to Firebase. Your app is built and hosted here on <strong>Base44</strong>.
              <br/><br/>
              AppMySite (the tool making your mobile app) just <em>requires</em> a connection to Firebase specifically to send <strong>Push Notifications</strong> to Android devices. You only need to create a project there to get the "keys" (JSON files) so AppMySite can talk to Google's notification servers.
            </p>
          </div>
        </div>

        <Card className="border-2 border-indigo-100 shadow-lg">
          <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-6 h-6 text-indigo-600" />
              Step 1: Get "Google Firebase Configuration" File
            </CardTitle>
            <CardDescription>
              This is the <code className="bg-white px-1 py-0.5 rounded border text-xs">google-services.json</code> file.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <p className="font-medium">Go to Firebase Console</p>
                  <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mt-1">
                    Open Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <p className="font-medium">Create a Project</p>
                  <p className="text-sm text-gray-600">Click "Add project" and name it "Helper33" (or similar). Toggle Google Analytics off to make setup faster (optional).</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <p className="font-medium">Add Android App</p>
                  <p className="text-sm text-gray-600">Click the Android icon (<span className="inline-block align-middle text-green-600">🤖</span>) on the project overview page.</p>
                  <div className="mt-2 bg-slate-100 p-3 rounded-md border border-slate-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Use this Package Name:</p>
                    <p className="font-mono text-sm font-bold text-slate-800 select-all">app.helper33.android</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">4</div>
                <div>
                  <p className="font-medium">Download Config File</p>
                  <p className="text-sm text-gray-600">Click "Register App", then <strong>Download google-services.json</strong>.</p>
                  <p className="text-sm text-green-600 font-medium mt-1">✅ Upload this file to "Google Firebase configuration" in AppMySite.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-100 shadow-lg">
          <CardHeader className="bg-amber-50/50 border-b border-amber-100">
            <CardTitle className="flex items-center gap-2">
              <Key className="w-6 h-6 text-amber-600" />
              Step 2: Get "Google Firebase Service Account" File
            </CardTitle>
            <CardDescription>
              This is a private key JSON file for backend communication.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <p className="font-medium">Go to Project Settings</p>
                  <p className="text-sm text-gray-600">In Firebase Console, click the Gear icon ⚙️ next to "Project Overview" and select <strong>Project settings</strong>.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <p className="font-medium">Service Accounts Tab</p>
                  <p className="text-sm text-gray-600">Click on the <strong>Service accounts</strong> tab.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <p className="font-medium">Generate Private Key</p>
                  <p className="text-sm text-gray-600">Click the blue button <strong>Generate new private key</strong>, then confirm by clicking "Generate Key".</p>
                  <p className="text-sm text-green-600 font-medium mt-1">✅ Upload this JSON file to "Google Firebase Service Account" in AppMySite.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <div className="mt-1 text-blue-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">After Uploading</h4>
            <p className="text-sm text-blue-700">
              Once both files are uploaded to AppMySite, click "Save". Then go back to the "Notification" checklist item in AppMySite dashboard and refresh/verify.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
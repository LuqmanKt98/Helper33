import React from 'react';
import ReminderSettings from '@/components/wellness/ReminderSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function WellnessReminderSettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost" className="gap-2">
            <Link to={createPageUrl('Wellness')}>
              <ArrowLeft className="w-4 h-4" />
              Back to Wellness
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Wellness Reminders
              </h1>
              <p className="text-gray-600">
                Customize gentle nudges for your wellbeing
              </p>
            </div>
          </div>
        </div>

        {/* Settings Component */}
        <ReminderSettings />

        {/* Help Section */}
        <Card className="mt-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              How Reminders Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2" />
              <p>
                <strong>In-App Alerts:</strong> Beautiful pop-ups when you're using DobryLife
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2" />
              <p>
                <strong>Push Notifications:</strong> Gentle reminders even when the app is closed
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2" />
              <p>
                <strong>Smart Timing:</strong> Reminders respect your quiet hours and activity patterns
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2" />
              <p>
                <strong>Goal-Based:</strong> Suggested reminders align with your personal goals
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
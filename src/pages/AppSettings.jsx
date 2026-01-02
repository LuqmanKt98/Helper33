import React from 'react';
import AppSettingsManager from '@/components/settings/AppSettingsManager';
import { motion } from 'framer-motion';
import { Sparkles, Palette } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AppSettingsPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <header>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">App Settings</h1>
          <p className="mt-2 text-lg text-gray-600">Customize your DobryLife experience.</p>
        </header>

        {/* Location Guide Banner */}
        <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <Palette className="h-5 w-5 text-purple-600" />
          <AlertDescription className="text-sm text-gray-700">
            <strong className="font-semibold text-purple-900">✨ Theme Customization Available!</strong>
            <br />
            You can now personalize your app's appearance with therapeutic color themes below. 
            All 9 original themes created by our team are preserved - you can always switch back to any of them!
          </AlertDescription>
        </Alert>

        {/* How to Access Guide */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-100"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">How to Access Your Theme Settings</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>📱 Mobile:</strong> Tap your profile picture (top right) → App Settings</p>
                <p><strong>💻 Desktop:</strong> Click your profile picture (top right) → App Settings</p>
                <p className="pt-2 border-t border-gray-200 mt-3">
                  <strong className="text-purple-700">💡 Tip:</strong> All changes are saved to your account and sync across all your devices!
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <AppSettingsManager />

      </motion.div>
    </div>
  );
}
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotificationDisabledBanner({ compact = false }) {
  // Notifications are now enabled - show success message or nothing
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <Alert className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400">
          <CheckCircle className="h-4 w-4 text-green-700" />
          <AlertDescription className="text-sm text-green-900 font-semibold">
            ✅ Notifications are enabled - You'll receive reminders and updates
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return null; // Don't show banner on full pages
}
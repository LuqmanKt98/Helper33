import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import CoachingPreferencesComponent from '../components/coaching/CoachingPreferences';

export default function CoachingPreferencesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button asChild variant="ghost" className="gap-2 mb-6">
          <Link to={createPageUrl('CoachingProgress')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Coaching
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CoachingPreferencesComponent />
        </motion.div>
      </div>
    </div>
  );
}
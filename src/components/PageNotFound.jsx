import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function PageNotFound() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(createPageUrl('Home'), { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleGoHome = () => {
    navigate(createPageUrl('Home'), { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        {/* 404 Animation */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-6"
        >
          <div className="text-9xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            404
          </div>
        </motion.div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          Sorry, the page you're looking for doesn't exist or isn't available yet.
        </p>

        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Search className="w-5 h-5 text-purple-600" />
            </motion.div>
            <p className="text-sm text-gray-700">
              Redirecting to homepage in{' '}
              <span className="font-bold text-purple-600 text-lg">{countdown}</span>{' '}
              seconds...
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleGoHome}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Homepage Now
          </Button>

          <Button
            onClick={handleGoBack}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Need help? Try these:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="text-purple-600 hover:text-purple-700"
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(createPageUrl('About'))}
              className="text-purple-600 hover:text-purple-700"
            >
              About
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(createPageUrl('Account'))}
              className="text-purple-600 hover:text-purple-700"
            >
              Account
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
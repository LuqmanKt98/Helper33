import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = React.useState('processing');
  const [message, setMessage] = React.useState('Connecting your account...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');

    if (success) {
      setStatus('success');
      setMessage(`Successfully connected ${success}!`);
      setTimeout(() => {
        navigate(createPageUrl('IntegrationsHub'));
      }, 2000);
    } else if (error) {
      setStatus('error');
      setMessage(`Connection failed: ${error}`);
      setTimeout(() => {
        navigate(createPageUrl('IntegrationsHub'));
      }, 3000);
    } else {
      // Still processing
      setTimeout(() => {
        navigate(createPageUrl('IntegrationsHub'));
      }, 5000);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connecting...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">Connected!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Connection Failed</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
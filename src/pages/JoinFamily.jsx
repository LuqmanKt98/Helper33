import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomInputOTP from '@/components/ui/CustomInputOTP';
import { Button } from '@/components/ui/button';
import { Loader2, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const MAX_ATTEMPTS = 4;

export default function JoinFamily() {
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [inviteDetails, setInviteDetails] = useState(null);
  const [user, setUser] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const { user: authUser, login } = useAuth();

  // Check if user is logged in
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    } else {
      setUser(null);
    }
  }, [authUser]);

  // Auto-fill code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlCode = urlParams.get('code');
    if (urlCode && urlCode.length === 8) {
      setCode(urlCode);
      validateCode(urlCode);
    }
  }, [location]);

  // Check if locked out
  useEffect(() => {
    if (failedAttempts >= MAX_ATTEMPTS) {
      setIsLocked(true);
      toast.error(`Too many failed attempts. Redirecting to home page...`);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate(createPageUrl('Home'));
      }, 3000);
    }
  }, [failedAttempts, navigate]);

  const validateCode = async (codeToValidate) => {
    if (!codeToValidate || codeToValidate.length !== 8) return;
    if (isLocked) return;

    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('validateFamilyInvite', {
        body: { code: codeToValidate }
      });

      if (data?.valid) {
        setInviteDetails(data);
        toast.success(`Valid invite from ${data.familyOwnerName}!`);
        setFailedAttempts(0); // Reset attempts on success
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        const remainingAttempts = MAX_ATTEMPTS - newAttempts;
        if (remainingAttempts > 0) {
          toast.error(`Invalid invite code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`);
        }

        setInviteDetails(null);
        setCode(''); // Clear the code for retry
      }
    } catch (error) {
      console.error('Error validating code:', error);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      const remainingAttempts = MAX_ATTEMPTS - newAttempts;
      if (remainingAttempts > 0) {
        toast.error(`Unable to validate code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`);
      }

      setInviteDetails(null);
      setCode('');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCodeChange = (newCode) => {
    if (isLocked) return;
    setCode(newCode);
    if (newCode.length === 8) {
      validateCode(newCode);
    }
  };

  const handleJoin = async () => {
    if (isLocked) return;

    if (!user) {
      toast.info('Please log in to join a family');
      const returnUrl = `${window.location.pathname}?code=${code}`;
      navigate(createPageUrl('Login') + `?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (!code || code.length !== 8) {
      toast.error('Please enter a valid 8-character invite code');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('acceptFamilyInvite', {
        body: { code }
      });

      if (data?.success) {
        setIsSuccess(true);
        toast.success(data.message || 'Successfully joined family!');

        // Redirect to family hub after 2 seconds
        setTimeout(() => {
          navigate(createPageUrl('Family'));
        }, 2000);
      } else {
        throw new Error(response.data?.error || 'Failed to join family');
      }
    } catch (error) {
      console.error('Error joining family:', error);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      const remainingAttempts = MAX_ATTEMPTS - newAttempts;
      if (remainingAttempts > 0) {
        toast.error(`${error.message}. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`);
      }

      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="w-full max-w-md shadow-2xl bg-white/90 backdrop-blur-xl border-white/80">
            <CardContent className="pt-12 pb-8 px-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mb-6 shadow-lg"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome to the Family!</h2>
              <p className="text-gray-600 mb-4">You've successfully joined the family hub.</p>
              <p className="text-sm text-gray-500">Redirecting you now...</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="w-full max-w-md shadow-2xl bg-white/90 backdrop-blur-xl border-red-200">
            <CardContent className="pt-12 pb-8 px-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg"
              >
                <AlertTriangle className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Too Many Attempts</h2>
              <p className="text-gray-600 mb-4">You've exceeded the maximum number of attempts to join a family.</p>
              <p className="text-sm text-gray-500">Redirecting to home page for security...</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl bg-white/80 backdrop-blur-xl border-white/80">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Join a Family</CardTitle>
            <CardDescription className="text-gray-600 pt-2">
              Enter the 8-character invite code to join a family hub
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            {/* Failed attempts warning */}
            <AnimatePresence>
              {failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {MAX_ATTEMPTS - failedAttempts} attempt{MAX_ATTEMPTS - failedAttempts === 1 ? '' : 's'} remaining before redirect
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Invite details */}
            <AnimatePresence>
              {inviteDetails && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <p className="text-sm text-green-800">
                    <strong>✓ Valid invite from:</strong> {inviteDetails.familyOwnerName}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Code input */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Enter Invite Code
              </label>
              <CustomInputOTP
                length={8}
                value={code}
                onChange={handleCodeChange}
              />
            </div>

            {/* Join button */}
            <Button
              onClick={handleJoin}
              disabled={isLoading || isValidating || !inviteDetails || code.length < 8}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining Family...
                </>
              ) : isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Join Family'
              )}
            </Button>

            {!user && (
              <p className="text-xs text-center text-gray-500">
                You'll be asked to log in or create an account before joining
              </p>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('Home'))}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
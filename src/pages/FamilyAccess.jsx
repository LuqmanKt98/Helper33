import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomInputOTP from '@/components/ui/CustomInputOTP';
import { Button } from '@/components/ui/button';
import { Loader2, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function FamilyAccess() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit access code.');
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await base44.functions.invoke('validateAccessCode', { access_code: code });
      if (data.success && data.familyId) {
        toast.success('Access granted! Loading shared view...');
        // Store session access info
        sessionStorage.setItem('sharedAccessFamilyId', data.familyId);
        sessionStorage.setItem('sharedAccessMemberName', data.memberName);
        window.location.href = createPageUrl(`SharedView?familyId=${data.familyId}`);
      } else {
        throw new Error(data.error || 'Invalid access code.');
      }
    } catch (error) {
      toast.error(error.message || 'Invalid access code. Please try again.');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-md shadow-2xl bg-white/70 backdrop-blur-xl border-white/80">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                <KeyRound className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Family Access</CardTitle>
            <CardDescription className="text-gray-600 pt-2">
              Enter the 6-digit code provided by your family admin to view the shared schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-8 p-8">
            <CustomInputOTP length={6} value={code} onChange={setCode} />
            <Button onClick={handleSubmit} disabled={isLoading || code.length < 6} className="w-full" size="lg">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Continue'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Shield, ArrowLeft, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function VideoCallPage() {
  const navigate = useNavigate();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  if (userLoading) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Video className="w-12 h-12" />
          </motion.div>
          <p className="text-slate-300">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 text-center p-8 max-w-md"
        >
          <Shield className="w-16 h-16 text-blue-400" />
          <h2 className="text-2xl font-bold">Access Restricted</h2>
          <p className="text-slate-300">
            Video calling is currently available to administrators only. This feature will be available to all users soon.
          </p>
          <Button onClick={() => navigate('/')} className="mt-4 bg-white text-purple-900 hover:bg-purple-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-4 border-purple-300 bg-gradient-to-br from-white to-purple-50 shadow-2xl">
            <CardContent className="p-12 text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-xl"
              >
                <Video className="w-12 h-12 text-white" />
              </motion.div>

              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Video Calling Coming Soon
              </h1>
              
              <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
                We're working on bringing you secure, high-quality video calling for family connections and support sessions.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-semibold text-purple-900">Secure & Private</p>
                  <p className="text-sm text-purple-700">End-to-end encrypted calls</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-blue-900">Family Friendly</p>
                  <p className="text-sm text-blue-700">Connect with loved ones</p>
                </div>

                <div className="p-4 bg-indigo-50 rounded-lg">
                  <Sparkles className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <p className="font-semibold text-indigo-900">HD Quality</p>
                  <p className="text-sm text-indigo-700">Crystal clear video & audio</p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl border-2 border-purple-300">
                <p className="text-sm text-purple-900 mb-2">
                  <strong>Want to stay updated?</strong>
                </p>
                <p className="text-sm text-purple-800">
                  This feature is in active development. We'll notify you when it's ready!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Gift, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function DonateButtonFloating() {
  const handleDonate = () => {
    window.open('https://donorbox.org/helper33', '_blank');
    toast.success('Opening donation page... Thank you for your support! 💚');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-6 right-6 z-30"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={handleDonate}
        size="lg"
        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-2xl hover:shadow-3xl rounded-full px-6 py-6 flex items-center gap-2"
      >
        <Heart className="w-5 h-5 animate-pulse" />
        <span className="font-bold hidden sm:inline">Support Us</span>
      </Button>
    </motion.div>
  );
}

export function DonateCard({ compact = false }) {
  const handleDonate = () => {
    window.open('https://donorbox.org/helper33', '_blank');
    toast.success('Opening donation page... Thank you for your support! 💚');
  };

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Love Helper33?</h3>
                <p className="text-sm text-gray-600">Support our mission 💚</p>
              </div>
            </div>
            <Button
              onClick={handleDonate}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
            >
              <Gift className="w-4 h-4 mr-2" />
              Donate
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 border-2 border-rose-200 shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Heart className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
              Support Helper33
            </CardTitle>
            <CardDescription className="text-base">
              Help us keep the platform free & accessible
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700 leading-relaxed">
          Helper33 is a passion project dedicated to making mental wellness support accessible to everyone. 
          Your donation helps us continue developing new features, improving AI support, and keeping the platform free for those who need it most.
        </p>
        
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/60 rounded-lg">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <div className="font-bold text-gray-900">Free Access</div>
            <div className="text-sm text-gray-600">For everyone</div>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-lg">
            <Heart className="w-6 h-6 mx-auto mb-2 text-rose-500" />
            <div className="font-bold text-gray-900">24/7 Support</div>
            <div className="text-sm text-gray-600">Always available</div>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-lg">
            <Gift className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <div className="font-bold text-gray-900">New Features</div>
            <div className="text-sm text-gray-600">Constantly improving</div>
          </div>
        </div>

        <Button
          onClick={handleDonate}
          size="lg"
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl text-lg py-6"
        >
          <Heart className="w-5 h-5 mr-2 animate-pulse" />
          Make a Donation
        </Button>

        <p className="text-xs text-center text-gray-500">
          Your support is deeply appreciated and helps us continue our mission 💚
        </p>
      </CardContent>
    </Card>
  );
}
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Download, 
  Star, 
  Users, 
  Shield,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { isAppMySite } from '@/components/hooks/useAppMySite';

export default function MobileAppPromo() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [isVisible, setIsVisible] = useState(!isAppMySite());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      // Send notification email
      await base44.functions.invoke('sendExternalEmail', {
        to: 'contact@dobrylife.com',
        subject: 'Mobile App Interest',
        body: `New mobile app interest from: ${email}
        
Timestamp: ${new Date().toISOString()}
        
Please add to the early access list.`
      });
      
      setIsSubmitted(true);
      setEmail('');
    } catch (error) {
      console.error('Failed to submit email:', error);
      alert('Failed to submit. Please email us directly at contact@dobrylife.com');
    }
    setIsSubmitting(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleDownload = (platform) => {
    const links = {
      ios: 'https://apps.apple.com/app/dobrylife-compassionate-ai-care/id123456789',
      android: 'https://play.google.com/store/apps/details?id=com.dobrylife.app'
    };
    
    alert(`Opening ${platform} app store... (Demo mode)`);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <Card className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 border-0 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-white">
                <h3 className="font-bold text-lg mb-1">Get the DobryLife App</h3>
                <p className="text-sm text-white/90 mb-3">
                  Access your compassionate AI care anywhere with offline support and push notifications.
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-white/20 text-white border-0 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    4.9 Rating
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    50K+ Users
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Secure
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownload('ios')}
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    iOS
                  </Button>
                  <Button
                    onClick={() => handleDownload('android')}
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Android
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
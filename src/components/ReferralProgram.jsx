
import React, { useState } from 'react';
import { useTranslation } from '@/components/Translations';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Gift, Copy, Check, Share2, Mail, MessageSquare, Users, Sparkles, Heart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingParticle = ({ delay, x, y, duration }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [0, -30, 0],
      opacity: [0, 1, 0],
      scale: [0.5, 1, 0.5],
    }}
    transition={{
      duration: duration,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut"
    }}
  />
);

export default function ReferralProgram() {
  const [copied, setCopied] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { t } = useTranslation(user);

  const referralLink = user ? `https://www.helper33.com?ref=${user.id}` : '';
  const shareMessage = `I've been using Helper33 - a compassionate AI platform that helps with daily life management, wellness, and family coordination. It's been really helpful! Check it out: ${referralLink}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!', {
      icon: '✨',
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform) => {
    const encodedMessage = encodeURIComponent(shareMessage);
    const encodedUrl = encodeURIComponent(referralLink);
    
    const urls = {
      email: `mailto:?subject=${encodeURIComponent('Check out Helper33')}&body=${encodedMessage}`,
      sms: `sms:?body=${encodedMessage}`,
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank');
      toast.success(`Opening ${platform}...`, { icon: '🚀' });
    }
  };

  if (isLoading) return null;

  const shareButtons = [
    { id: 'email', icon: Mail, label: t('dashboard.email'), gradient: 'from-blue-500 to-cyan-500' },
    { id: 'sms', icon: MessageSquare, label: t('dashboard.sms'), gradient: 'from-green-500 to-emerald-500' },
    { id: 'whatsapp', icon: MessageSquare, label: t('dashboard.whatsapp'), gradient: 'from-green-400 to-teal-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-2 border-transparent bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 shadow-xl">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <FloatingParticle
              key={i}
              delay={i * 0.5}
              x={Math.random() * 100}
              y={Math.random() * 100}
              duration={3 + Math.random() * 2}
            />
          ))}
          
          {/* Gradient Orbs */}
          <motion.div
            className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>

        <CardHeader className="relative z-10">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <motion.div 
              className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Gift className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {t('dashboard.shareHelper')}
              </CardTitle>
              <CardDescription className="text-base font-medium text-gray-600">
                {t('dashboard.shareHelperDesc')}
              </CardDescription>
            </div>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
          {/* Referral Link Section */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50"
          >
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Users className="w-5 h-5 text-purple-600" />
              </motion.div>
              <p className="font-bold text-gray-800">{t('dashboard.yourReferralLink')}</p>
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 relative group">
                <Input 
                  value={referralLink} 
                  readOnly 
                  className="font-mono text-sm pr-10 border-2 border-purple-200 focus:border-purple-400 bg-white/90 transition-all duration-300 group-hover:shadow-md"
                />
                <motion.div
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </motion.div>
              </div>
              
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={copyToClipboard}
                  className={`relative overflow-hidden ${
                    copied 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  } shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        {t('dashboard.copied')}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        {t('dashboard.copy')}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Share Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-gray-700">
              <Share2 className="w-5 h-5 text-purple-600" />
              <p className="font-bold">{t('dashboard.shareVia')}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {shareButtons.map((btn, index) => (
                <motion.div
                  key={btn.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setHoveredButton(btn.id)}
                  onHoverEnd={() => setHoveredButton(null)}
                >
                  <Button 
                    onClick={() => shareVia(btn.id)} 
                    className={`w-full relative overflow-hidden bg-gradient-to-r ${btn.gradient} shadow-lg hover:shadow-xl transition-all duration-300 group`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      animate={hoveredButton === btn.id ? { x: '100%' } : { x: '-100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    <btn.icon className="w-5 h-5 mr-2 relative z-10 group-hover:scale-110 transition-transform" />
                    <span className="relative z-10 font-semibold">{btn.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Info Box with Animation */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 shadow-md"
          >
            <motion.div
              className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-300/30 to-orange-300/30 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="relative z-10 flex items-start gap-3">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              </motion.div>
              <div>
                <p className="font-bold text-amber-900 mb-1 flex items-center gap-2">
                  {t('dashboard.spreadCompassion')}
                  <Star className="w-4 h-4 text-yellow-500" />
                </p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  {t('dashboard.spreadCompassionDesc')}
                </p>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Lock, Sparkles, Construction, Heart, Shield, Mail, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CryMeARiverBook() {
  const navigate = useNavigate();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  // Check if user is a DobryLife Impact Partner
  const isImpactPartner = user?.role === 'admin' || user?.subscription_status === 'executive';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isImpactPartner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center p-6">
        <div className="floating-droplets">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="droplet" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 5}s`
            }}></span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full relative z-10"
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
            <CardContent className="p-12 text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 3, -3, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="flex justify-center mb-6"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg relative">
                  <Lock className="w-12 h-12 text-white" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-blue-400"
                  />
                </div>
              </motion.div>

              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                A Prayer for Those Who Profited from Our Pain
              </h1>

              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-6 py-3 rounded-full border-2 border-amber-300 mb-6">
                <Shield className="w-5 h-5 text-amber-600" />
                <span className="text-amber-800 font-semibold">DobryLife Impact Partners Only</span>
              </div>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                This profound work is currently available exclusively to our DobryLife Impact Partners — those who support our mission to create healing spaces for all.
              </p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-xl border-2 border-blue-200 mb-8"
              >
                <Heart className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-blue-900 mb-3">Become an Impact Partner</h3>
                <p className="text-blue-700 mb-6 leading-relaxed">
                  Join our Executive tier to access exclusive content, including this powerful prayer, advanced features, and priority support for your healing journey.
                </p>
                <Button
                  onClick={() => navigate(createPageUrl('Upgrade'))}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8"
                >
                  Learn About Executive Access
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
              >
                {[
                  { icon: Droplets, text: "Healing Words", color: "from-blue-400 to-cyan-500" },
                  { icon: Heart, text: "Justice & Peace", color: "from-rose-400 to-pink-500" },
                  { icon: Sparkles, text: "Karmic Balance", color: "from-purple-400 to-indigo-500" }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + (idx * 0.1) }}
                    className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => navigate(createPageUrl('BookStudio'))}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Books
                </Button>
                
                <Button
                  onClick={() => window.open('mailto:support@dobrylife.com?subject=Executive%20Access%20Inquiry', '_blank')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <style jsx>{`
          .floating-droplets {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
            pointer-events: none;
          }

          .droplet {
            position: absolute;
            top: -20px;
            width: 8px;
            height: 12px;
            background: linear-gradient(to bottom, rgba(59, 130, 246, 0.4), rgba(6, 182, 212, 0.4));
            border-radius: 50% 50% 50% 0;
            transform: rotate(45deg);
            animation: fall linear infinite;
          }

          @keyframes fall {
            to {
              transform: translateY(100vh) rotate(405deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // For Impact Partners - Show Work in Progress
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center p-6">
      <div className="floating-droplets">
        {[...Array(12)].map((_, i) => (
          <span key={i} className="droplet" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${10 + Math.random() * 5}s`
          }}></span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full relative z-10"
      >
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="p-12 text-center">
            <motion.div
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="flex justify-center mb-6"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg">
                <Construction className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 px-6 py-3 rounded-full border-2 border-orange-300 mb-6">
                <Sparkles className="w-5 h-5 text-orange-600" />
                <span className="text-orange-800 font-semibold text-lg">Work in Progress</span>
              </div>
            </motion.div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              A Prayer for Those Who Profited from Our Pain
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Thank you for being a DobryLife Impact Partner. We're carefully crafting this profound work with the care and attention it deserves. This prayer explores themes of karma, justice, healing, and letting the universe return what was sown.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-blue-100 to-cyan-100 p-8 rounded-xl border-2 border-blue-200 mb-8"
            >
              <Droplets className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-blue-900 mb-3">What to Expect</h3>
              <div className="text-left space-y-3 text-blue-700">
                <p className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>A powerful prayer addressing those who profited from pain and suffering</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Reflection on justice, karma, and the law of the universe</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Guided meditations and healing practices</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Audio narration for deep contemplation</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl border-2 border-purple-200 mb-8"
            >
              <div className="flex items-start gap-3">
                <Heart className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h4 className="font-bold text-purple-900 mb-2">Thank You for Your Support</h4>
                  <p className="text-purple-700 text-sm leading-relaxed">
                    As an Impact Partner, your support makes it possible for us to create these healing resources. We'll notify you as soon as this work is ready. 💜
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate(createPageUrl('BookStudio'))}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Books
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <style jsx>{`
        .floating-droplets {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .droplet {
          position: absolute;
          top: -20px;
          width: 8px;
          height: 12px;
          background: linear-gradient(to bottom, rgba(59, 130, 246, 0.4), rgba(6, 182, 212, 0.4));
          border-radius: 50% 50% 50% 0;
          transform: rotate(45deg);
          animation: fall linear infinite;
        }

        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(405deg);
          }
        }
      `}</style>
    </div>
  );
}
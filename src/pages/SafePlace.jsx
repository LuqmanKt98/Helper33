
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Volume2, VolumeX, MessageCircle, Book, ArrowLeft, Phone, MessageSquare, Bookmark, X } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import BeachEnvironment from '@/components/safe_place/BeachEnvironment';
import ForestEnvironment from '@/components/safe_place/ForestEnvironment';
import MountainEnvironment from '@/components/safe_place/MountainEnvironment';
import CozyRoomEnvironment from '@/components/safe_place/CozyRoomEnvironment';
import FireplaceEnvironment from '@/components/safe_place/FireplaceEnvironment';
import QuoteCarousel from '@/components/safe_place/QuoteCarousel';
import SurvivorStories from '@/components/safe_place/SurvivorStories';
import { useTranslation } from '@/components/Translations';

const ENVIRONMENTS = [
  { id: 'beach', name: 'Beach Serenity', icon: '🌊', description: 'Calm turquoise waves and ocean sounds', color: 'from-cyan-400 to-blue-500', component: BeachEnvironment },
  { id: 'forest', name: 'Forest Harmony', icon: '🌲', description: 'Sunlight through trees and birdsong', color: 'from-green-400 to-emerald-600', component: ForestEnvironment },
  { id: 'mountain', name: 'Mountain Peace', icon: '🏔️', description: 'High-altitude calm and sunrise glow', color: 'from-purple-400 to-indigo-500', component: MountainEnvironment },
  { id: 'cozy', name: 'Cozy Room', icon: '🕯️', description: 'Soft blankets and peaceful piano', color: 'from-amber-400 to-orange-500', component: CozyRoomEnvironment },
  { id: 'fireplace', name: 'Fireplace Haven', icon: '🔥', description: 'Warm fire and gentle rain', color: 'from-rose-400 to-red-500', component: FireplaceEnvironment }
];

export default function SafePlace() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showQuotes, setShowQuotes] = useState(true);
  const [showStories, setShowStories] = useState(false);
  const [showEmergencyOverlay, setShowEmergencyOverlay] = useState(false);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const audioRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { t, isRTL } = useTranslation(user);

  useEffect(() => {
    if (user?.app_settings?.saved_safe_place_quotes) {
      setSavedQuotes(user.app_settings.saved_safe_place_quotes);
    }
  }, [user]);

  const saveQuoteMutation = useMutation({
    mutationFn: async (quote) => {
      const updated = [...new Set([...savedQuotes, quote])];
      await base44.auth.updateMe({
        app_settings: {
          ...(user?.app_settings || {}),
          saved_safe_place_quotes: updated
        }
      });
      return updated;
    },
    onSuccess: (updated) => {
      setSavedQuotes(updated);
      queryClient.invalidateQueries(['user']);
      toast.success(t('safePlace.quoteSavedToast'));
    }
  });

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const EnvironmentComponent = selectedEnvironment ? ENVIRONMENTS.find(e => e.id === selectedEnvironment)?.component : null;

  if (!selectedEnvironment) {
    return (
      <>
        <SEO
          title="Safe Place - Helper33 | Immersive Calming Environments for Anxiety Relief"
          description="Find peace in virtual safe spaces. Immersive 3D environments with soothing sounds - beach, forest, mountains, cozy room, and fireplace. Perfect for anxiety relief and meditation."
          keywords="anxiety relief, calming environments, virtual safe space, meditation environments, stress relief, nature sounds, peaceful environments, mental health sanctuary"
        />
        <div className={`min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-rose-50 p-6 ${isRTL ? 'rtl' : ''}`}>
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <Button onClick={() => navigate(createPageUrl('CrisisHub'))} variant="outline" className="mb-6">
                {isRTL ? <span className="ml-2">{t('safePlace.backToCrisis')}</span> : <ArrowLeft className="w-4 h-4 mr-2" />}
                {!isRTL ? <span className="ml-2">{t('safePlace.backToCrisis')}</span> : <ArrowLeft className="w-4 h-4 mr-2" />}
              </Button>
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }} className="inline-block mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-2xl">
                  <Heart className="w-12 h-12 text-white fill-current" />
                </div>
              </motion.div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">{t('safePlace.title')}</h1>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">{t('safePlace.subtitle')}</p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-6 bg-white/60 backdrop-blur-md rounded-2xl border-2 border-purple-200 shadow-xl max-w-3xl mx-auto">
                <p className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent mb-3">{t('safePlace.youAreSafe')}</p>
              </motion.div>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {ENVIRONMENTS.map((env, i) => (
                <motion.div key={env.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}>
                  <Card onClick={() => setSelectedEnvironment(env.id)} className="cursor-pointer bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all group">
                    <div className={`h-2 bg-gradient-to-r ${env.color}`} />
                    <CardContent className="p-6">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${env.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <span className="text-4xl">{env.icon}</span>
                      </div>
                      <h3 className="text-xl font-bold text-center mb-2">{t(`safePlace.${env.id}`) || env.name}</h3>
                      <p className="text-sm text-gray-600 text-center mb-4">{t(`safePlace.${env.id}Desc`) || env.description}</p>
                      <Button className={`w-full bg-gradient-to-r ${env.color} text-white`}>{t('safePlace.enterSpace')}</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300">
                <CardContent className="p-6">
                  <Bookmark className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="text-lg font-bold text-purple-900 mb-2">{t('safePlace.strengthVault')}</h3>
                  <p className="text-sm text-purple-800 mb-4">{savedQuotes.length} {t('safePlace.savedQuotes')}</p>
                  {savedQuotes.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {savedQuotes.map((q, idx) => (
                        <div key={idx} className="p-3 bg-white/60 rounded-lg text-sm italic">"{q}"</div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-rose-100 to-red-100 border-2 border-rose-300">
                <CardContent className="p-6">
                  <Phone className="w-8 h-8 text-rose-600 mb-3" />
                  <h3 className="text-lg font-bold text-rose-900 mb-2">{t('safePlace.needHelpNow')}</h3>
                  <div className="space-y-2 mt-4">
                    <a href="tel:988"><Button className="w-full bg-rose-600 hover:bg-rose-700 text-white">{isRTL ? <span className="ml-2">{t('crisis.callNow')} 988</span> : <Phone className="w-4 h-4 mr-2" />}{!isRTL ? <span className="ml-2">{t('crisis.callNow')} 988</span> : <Phone className="w-4 h-4 mr-2" />}</Button></a>
                    <a href="sms:741741&body=HOME"><Button className="w-full bg-rose-600 hover:bg-rose-700 text-white">{isRTL ? <span className="ml-2">{t('crisis.textNow')} 741741</span> : <MessageSquare className="w-4 h-4 mr-2" />}{!isRTL ? <span className="ml-2">{t('crisis.textNow')} 741741</span> : <MessageSquare className="w-4 h-4 mr-2" />}</Button></a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title={`${ENVIRONMENTS.find(e => e.id === selectedEnvironment)?.name} - Safe Place`} />
      <div className={`min-h-screen relative overflow-hidden ${isRTL ? 'rtl' : ''}`}>
        {EnvironmentComponent && <EnvironmentComponent soundEnabled={soundEnabled} audioRef={audioRef} />}
        <div className={`fixed top-6 ${isRTL ? 'left-6' : 'right-6'} z-50 flex flex-col gap-3`}>
          <Button onClick={() => setSelectedEnvironment(null)} variant="outline" size="icon" className="bg-white/80 backdrop-blur-md shadow-lg"><ArrowLeft className="w-5 h-5" /></Button>
          <Button onClick={toggleSound} variant="outline" size="icon" className="bg-white/80 backdrop-blur-md shadow-lg">{soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}</Button>
          <Button onClick={() => setShowQuotes(!showQuotes)} variant="outline" size="icon" className={`backdrop-blur-md shadow-lg ${showQuotes ? 'bg-purple-500 text-white' : 'bg-white/80'}`}><MessageCircle className="w-5 h-5" /></Button>
          <Button onClick={() => setShowStories(!showStories)} variant="outline" size="icon" className={`backdrop-blur-md shadow-lg ${showStories ? 'bg-purple-500 text-white' : 'bg-white/80'}`}><Book className="w-5 h-5" /></Button>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`fixed top-6 ${isRTL ? 'right-6' : 'left-6'} z-40 max-w-md`}>
          <Card className="bg-white/60 backdrop-blur-md border-0 shadow-xl"><CardContent className="p-4"><p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent">{t('safePlace.youAreSafeHere')}</p></CardContent></Card>
        </motion.div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50`}>
          <Button onClick={() => setShowEmergencyOverlay(true)} size="lg" className="bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-2xl rounded-full px-6 py-6 animate-pulse">{isRTL ? <span className="ml-2">{t('safePlace.needHelpNow')}</span> : <Phone className="w-6 h-6 mr-2" />}{!isRTL ? <span className="ml-2">{t('safePlace.needHelpNow')}</span> : <Phone className="w-6 h-6 mr-2" />}</Button>
        </motion.div>
        <AnimatePresence>
          {showQuotes && <QuoteCarousel onSaveQuote={saveQuoteMutation.mutate} savedQuotes={savedQuotes} />}
        </AnimatePresence>
        <AnimatePresence>
          {showStories && <SurvivorStories onClose={() => setShowStories(false)} />}
        </AnimatePresence>
        <AnimatePresence>
          {showEmergencyOverlay && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowEmergencyOverlay(false)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
                <div className="bg-gradient-to-r from-rose-500 to-red-500 text-white p-6">
                  <div className="flex justify-between mb-3"><h2 className="text-2xl font-bold">{t('emergencyOverlay.notAlone')}</h2><Button onClick={() => setShowEmergencyOverlay(false)} size="icon" variant="ghost" className="text-white"><X className="w-5 h-5" /></Button></div>
                  <p className="text-rose-100">{t('emergencyOverlay.helpAvailable')}</p>
                </div>
                <div className="p-6 space-y-4">
                  <a href="tel:988"><Button size="lg" className="w-full bg-rose-600 text-white py-6">{isRTL ? <span className="ml-3">{t('crisis.callNow')} 988</span> : <Phone className="w-6 h-6 mr-3" />}{!isRTL ? <span className="ml-3">{t('crisis.callNow')} 988</span> : <Phone className="w-6 h-6 mr-3" />}</Button></a>
                  <a href="sms:741741&body=HOME"><Button size="lg" className="w-full bg-rose-600 text-white py-6">{isRTL ? <span className="ml-3">{t('crisis.textNow')} 741741</span> : <MessageSquare className="w-6 h-6 mr-3" />}{!isRTL ? <span className="ml-3">{t('crisis.textNow')} 741741</span> : <MessageSquare className="w-6 h-6 mr-3" />}</Button></a>
                  <Button onClick={() => navigate(createPageUrl('CrisisHub'))} variant="outline" className="w-full">{t('crisis.allResources')}</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

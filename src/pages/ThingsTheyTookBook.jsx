import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Lock,
  ShoppingCart,
  Loader2,
  Key,
  CheckCircle,
  X,
  BookHeart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import SimpleBookNavigation from '@/components/books/SimpleBookNavigation';
import BookAudioPlayer from '@/components/books/BookAudioPlayer';
import ThingsTheyTookContent, { sections } from '@/components/books/ThingsTheyTookContent';
import toast from 'react-hot-toast';

// First 5 sections are free preview (0-4)
const FREE_SECTIONS = ['dedication', 'toc', 'authors-note', 'chapter-1', 'chapter-2'];

export default function ThingsTheyTookBook() {
  const queryClient = useQueryClient();
  const [currentSectionId, setCurrentSectionId] = useState(sections[0].id);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [showPreviewPopup, setShowPreviewPopup] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  // Check if user has purchased the book
  const hasBookAccess = user && (
    user.role === 'admin' ||
    user.things_they_took_purchased === true ||
    user.access_code === '6060' ||
    (user.subscription_status === 'active' && 
     (user.plan_type === 'executive_monthly' || user.plan_type === 'executive_yearly'))
  );

  const isSectionLocked = (sectionId) => {
    if (hasBookAccess) return false;
    return !FREE_SECTIONS.includes(sectionId);
  };

  // Show preview popup on mount if user doesn't have access
  useEffect(() => {
    if (!isLoading && !hasBookAccess) {
      const hasSeenPopup = sessionStorage.getItem('thingsTheyTookPreviewPopupSeen');
      if (!hasSeenPopup) {
        setTimeout(() => setShowPreviewPopup(true), 1000);
      }
    }
  }, [isLoading, hasBookAccess]);

  // Check for purchase success in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('purchase') === 'success') {
      toast.success('🎉 Book unlocked! Enjoy the full story.', { duration: 5000 });
      base44.auth.updateMe({ things_they_took_purchased: true }).then(() => {
        queryClient.invalidateQueries(['user']);
      });
      window.history.replaceState({}, '', createPageUrl('ThingsTheyTookBook'));
    }
  }, []);

  const handleClosePopup = () => {
    setShowPreviewPopup(false);
    sessionStorage.setItem('thingsTheyTookPreviewPopupSeen', 'true');
  };

  const applyAccessCodeMutation = useMutation({
    mutationFn: async (code) => {
      if (code !== '6060') {
        throw new Error('Invalid access code');
      }
      await base44.auth.updateMe({ access_code: code });
    },
    onSuccess: () => {
      toast.success('Access code applied! Full book unlocked.');
      queryClient.invalidateQueries(['user']);
      setShowCodeInput(false);
      setAccessCode('');
    },
    onError: (error) => {
      toast.error(error.message || 'Invalid access code');
    }
  });

  const handleApplyCode = () => {
    if (!accessCode.trim()) {
      toast.error('Please enter an access code');
      return;
    }
    applyAccessCodeMutation.mutate(accessCode);
  };

  const handlePurchaseBook = () => {
    const currentOrigin = window.location.origin;
    const successUrl = `${currentOrigin}${createPageUrl('BookStudio')}?purchase=success&book=things_they_took`;
    const cancelUrl = `${currentOrigin}${createPageUrl('BookStudio')}?purchase=cancelled`;
    window.location.href = `https://buy.stripe.com/14A9ATg4YbOH5Gv27McAo01?client_reference_id=${user?.id || 'guest'}&success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
  };

  const currentIndex = sections.findIndex(s => s.id === currentSectionId);

  const handleNext = () => {
    const nextSection = sections[currentIndex + 1];
    if (nextSection && isSectionLocked(nextSection.id)) {
      toast.info('🔒 Locked Content', {
        description: 'Purchase the book for $14.99 to unlock all chapters.',
        action: {
          label: 'Buy Now - $14.99',
          onClick: () => handlePurchaseBook()
        },
        duration: 6000
      });
      return;
    }

    if (currentIndex < sections.length - 1) {
      stopAudio();
      setCurrentSectionId(sections[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      stopAudio();
      setCurrentSectionId(sections[currentIndex - 1].id);
    }
  };
  
  const handleSelectSection = (sectionId) => {
    if (isSectionLocked(sectionId)) {
      toast.info('🔒 Locked Content', {
        description: 'Purchase the book for $14.99 to unlock all chapters.',
        action: {
          label: 'Buy Now - $14.99',
          onClick: () => handlePurchaseBook()
        },
        duration: 6000
      });
      return;
    }
    stopAudio();
    setCurrentSectionId(sectionId);
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  const playWithBrowserTTS = (text) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      setIsGeneratingAudio(false);
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && (voice.name.includes('Natural') || voice.name.includes('Premium'))
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsGeneratingAudio(false);
      setIsPlayingAudio(true);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
    };

    utterance.onerror = () => {
      console.error('Browser TTS error');
      setIsGeneratingAudio(false);
      setIsPlayingAudio(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayAudio = async () => {
    if (isPlayingAudio) {
      if (currentAudio) {
        currentAudio.pause();
        setIsPlayingAudio(false);
      } else if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        setIsPlayingAudio(false);
      }
      return;
    }

    if (currentAudio && !isPlayingAudio) {
      currentAudio.play();
      setIsPlayingAudio(true);
      return;
    }
    
    if (!isPlayingAudio && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlayingAudio(true);
      return;
    }

    setIsGeneratingAudio(true);
    
    const sectionText = getSectionText(currentSectionId);
    
    if (!sectionText) {
      console.warn('No content to narrate');
      setIsGeneratingAudio(false);
      return;
    }

    try {
      const response = await base44.functions.invoke('generateStandardSpeech', {
        text: sectionText,
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true
      });

      if (response.data?.fallback || response.data?.error) {
        console.log('Using browser TTS fallback');
        playWithBrowserTTS(sectionText);
        return;
      }

      if (response.data && response.data.audio_base64) {
        const audioBlob = base64ToBlob(response.data.audio_base64, 'audio/mpeg');
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsPlayingAudio(false);
          setCurrentAudio(null);
        };
        
        audio.onerror = () => {
          console.log('Audio playback failed, using browser TTS');
          playWithBrowserTTS(sectionText);
        };
        
        setCurrentAudio(audio);
        audio.play();
        setIsPlayingAudio(true);
        setIsGeneratingAudio(false);
      } else {
        throw new Error('No audio data received');
      }
    } catch (error) {
      console.log('Audio generation failed, using browser TTS:', error);
      playWithBrowserTTS(sectionText);
    }
  };

  const base64ToBlob = (base64, contentType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  };

  const getSectionText = (sectionId) => {
    const sectionTexts = {
      'dedication': 'For Yuriy — My love, my mirror, my light. Even in death, you remain the reason I rise. And for our children — May you always know that love endures, even through the unthinkable.',
      'authors-note': 'Author\'s Note. This book was written through grief — not from it. Each word carries the weight of love, betrayal, and faith; each page, the breath of a soul still learning to stand after loss. When the world broke open, I turned to writing. What began as letters to Yuriy became confessions, poems, and prayers. I wrote to remember. I wrote to heal. I wrote because silence was too loud. If these words find you, may they remind you that healing is not forgetting. It\'s remembering differently. It\'s learning to love again in a world that once shattered you.',
      'chapter-1': 'Chapter One: Dear Husband. You know, they always say, "We felt their presence at the funeral." But my heart was heavy, my eyes a river of salt— and though the room overflowed with bodies, I could not feel you. Did you know, my love, that many who stood there in black had already betrayed you? Smiles on their lips, knives tucked behind their backs. The one who stood up to speak— not for you, but for the sound of their own voice, for the attention it could buy them. How quickly they shifted, like shadows bending in the light. To the police they said, "I am family." At the funeral: "We were partners." At the meetings, erasing your name: "I worked with him, but I hardly knew him." Yes— isn\'t it a cruel shift? One man, many masks, all worn in your absence. And I sat there, holding grief like fire in my hands, wondering if the world would ever show you the loyalty you deserved.',
      'chapter-2': 'Chapter Two: What They Took. I don\'t even know how to make this make sense. In my culture, to touch the belongings of the dead so soon after breath has left— it is forbidden. But hours after your passing, a necklace was snatched from its rightful place. They said it was for memory, to remember you, Mama Ira. But I remember your words: how you dreamed of passing those jewels down— your grandmother\'s to your mother\'s, your mother\'s to you— and finally to your granddaughter. You smiled when she was born, our first girl after so many sons. You said, "At last, someone to inherit the treasures of women." How then, could someone steal them before the tears had even dried?',
    };

    return sectionTexts[sectionId] || '';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/8b40ee2d5_ChatGPTImageOct21202503_19_34AM2.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Preview Popup */}
      <AnimatePresence>
        {showPreviewPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClosePopup}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClosePopup}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center"
                >
                  <BookHeart className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  📖 Read First 5 Chapters Free
                </h3>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  Experience Ruby's journey through loss and resilience. <strong className="text-amber-600">First 5 chapters completely free</strong> — no account needed!
                </p>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-4 border-2 border-amber-200">
                  <div className="flex items-center justify-center gap-2 text-amber-700 font-semibold mb-2">
                    <Lock className="w-5 h-5" />
                    <span>Full Book: $14.99 (One-Time)</span>
                  </div>
                  <p className="text-sm text-amber-600">
                    Unlock all chapters + lifetime access
                  </p>
                </div>

                <Button
                  onClick={handleClosePopup}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  Start Reading Preview
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="relative z-10">
        <motion.header 
          className="bg-amber-900/80 backdrop-blur-md shadow-lg sticky top-0 z-20 border-b border-amber-700/50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-3">
              <Button asChild variant="ghost" className="text-amber-100 hover:bg-amber-800/50 hover:text-white">
                <Link to={createPageUrl('BookStudio')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Library
                </Link>
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-amber-200" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-amber-100 font-serif">The Things They Took</h1>
                  <p className="text-xs sm:text-sm text-amber-200/80 italic">The Love That Stayed</p>
                  {!hasBookAccess && (
                    <Badge className="mt-2 bg-amber-500 text-white border-2 border-amber-300">
                      🔒 Preview: First 5 Chapters Free
                    </Badge>
                  )}
                </div>
              </div>
              <SimpleBookNavigation 
                sections={sections} 
                currentSectionId={currentSectionId}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onSelectSection={handleSelectSection}
              />
            </div>
          </div>
        </motion.header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!hasBookAccess && isSectionLocked(currentSectionId) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-4 border-amber-300 rounded-2xl p-8 text-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Lock className="w-10 h-10 text-white" />
              </motion.div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🔐 Unlock the Full Story
              </h3>
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                You've reached the end of the preview. Continue Ruby's powerful journey of love, loss, and resilience.
              </p>

              {!showCodeInput ? (
                <div className="space-y-4">
                      <Button
                        onClick={handlePurchaseBook}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white h-14 text-lg px-8 shadow-lg"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Buy Full Book - $9.99
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-2 border-amber-400 text-amber-700 hover:bg-amber-50 h-12"
                      >
                        <Link to={createPageUrl('Checkout')}>
                          View Checkout Page
                        </Link>
                      </Button>
                  
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-sm text-gray-500">or</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowCodeInput(true)}
                    className="border-2 border-amber-400 text-amber-700 hover:bg-amber-50 h-12"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    I Have an Access Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-w-sm mx-auto">
                  <Input
                    placeholder="Enter access code (e.g., 6060)"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="border-2 border-amber-300 focus:ring-amber-500 h-12"
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyCode()}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleApplyCode}
                      disabled={applyAccessCodeMutation.isPending}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 h-12"
                    >
                      {applyAccessCodeMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
                      ) : (
                        <><CheckCircle className="w-4 h-4 mr-2" /> Apply Code</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCodeInput(false)}
                      className="border-2 border-amber-300 h-12"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          <BookAudioPlayer 
            sectionId={currentSectionId}
            page={currentIndex}
            totalPages={sections.length}
            onPlay={handlePlayAudio}
            isLoading={isGeneratingAudio}
            isPlaying={isPlayingAudio}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSectionId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className={`bg-amber-50/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 border border-amber-200/50 relative overflow-hidden ${
                isSectionLocked(currentSectionId) ? 'filter blur-md pointer-events-none' : ''
              }`}
            >
              {isSectionLocked(currentSectionId) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
                  <div className="text-center">
                    <Lock className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900">Locked Content</h3>
                  </div>
                </div>
              )}
              <ThingsTheyTookContent sectionId={currentSectionId} />
            </motion.div>
          </AnimatePresence>

          <motion.div 
            className="max-w-3xl mx-auto mt-8 flex justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={currentIndex === 0}
              className="bg-white/80 backdrop-blur-sm hover:bg-white border-amber-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-white/90 bg-amber-900/60 px-4 py-2 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {sections.length}
            </span>
            <Button 
              onClick={handleNext} 
              disabled={currentIndex === sections.length - 1}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </main>
      </div>

      <footer className="relative z-10 py-6 bg-amber-900/80 backdrop-blur-md mt-12">
        <p className="text-center text-sm text-amber-50/90">
          © 2025 Ruby Dobry — The Things They Took: The Love That Stayed. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
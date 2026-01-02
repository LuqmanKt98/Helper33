import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Menu, Lock, Sparkles, BookHeart, ShoppingCart, Loader2, Key, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import InfinityContent, { sectionPages } from '@/components/books/InfinityContent';
import BookNavigation from '@/components/books/BookNavigation';
import BookAudioPlayer from '@/components/books/BookAudioPlayer';
import BookPageNavigation from '@/components/books/BookPageNavigation';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';

const coverImage = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/4f38e237d_infinitybooky.jpg";

const orderedSections = Object.keys(sectionPages);

export default function InfinityBook() {
  const queryClient = useQueryClient();
  const [currentSectionId, setCurrentSectionId] = useState(orderedSections[0]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [showPreviewPopup, setShowPreviewPopup] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const contentRef = useRef(null);
  const audioRef = useRef(null);
  const audioCacheRef = useRef({});
  const utteranceRef = useRef(null);

  const [audioState, setAudioState] = useState({
    isLoading: false,
    isPlaying: false,
    sectionId: null,
    page: null,
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  // Check if user has purchased the book
  const hasBookAccess = user && (
    user.role === 'admin' ||
    user.infinity_book_purchased === true ||
    user.access_code === '6060' ||
    (user.subscription_status === 'active' && 
     (user.plan_type === 'executive_monthly' || user.plan_type === 'executive_yearly'))
  );

  const maxPreviewPage = hasBookAccess ? Infinity : 4; // First 5 pages (0-4)

  // Show preview popup on mount if user doesn't have access
  useEffect(() => {
    if (!isLoading && !hasBookAccess) {
      const hasSeenPopup = sessionStorage.getItem('infinityPreviewPopupSeen');
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
      // Update user to reflect purchase
      base44.auth.updateMe({ infinity_book_purchased: true }).then(() => {
        queryClient.invalidateQueries(['user']);
      });
      // Clean URL
      window.history.replaceState({}, '', createPageUrl('InfinityBook'));
    }
  }, []);

  const handleClosePopup = () => {
    setShowPreviewPopup(false);
    sessionStorage.setItem('infinityPreviewPopupSeen', 'true');
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

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
      }
      Object.values(audioCacheRef.current).forEach(URL.revokeObjectURL);
      audioCacheRef.current = {};
    };
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
    }
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    setAudioState({ isLoading: false, isPlaying: false, sectionId: null, page: null });
  };

  const playWithBrowserTTS = (text, sectionId, page) => {
    if (!('speechSynthesis' in window)) {
      setAudioState({ isLoading: false, isPlaying: false, sectionId: null, page: null });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      setAudioState({ isLoading: false, isPlaying: true, sectionId, page });
      utteranceRef.current = utterance;
    };

    utterance.onend = () => {
      setAudioState({ isLoading: false, isPlaying: false, sectionId: null, page: null });
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      setAudioState({ isLoading: false, isPlaying: false, sectionId: null, page: null });
      utteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  };

  const playAudio = (url, sectionId, page) => {
    stopAudio();
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.oncanplaythrough = () => {
      audio.play();
      setAudioState({ isLoading: false, isPlaying: true, sectionId, page });
    };

    audio.onended = () => {
      setAudioState({ isLoading: false, isPlaying: false, sectionId: null, page: null });
    };

    audio.onerror = () => {
      setTimeout(() => {
        if (contentRef.current) {
          const pageContent = contentRef.current.querySelector(`[data-page-content="${page}"]`);
          if (pageContent) {
            const paragraphs = Array.from(pageContent.querySelectorAll('[data-speakable="true"]'));
            let textToSpeak = paragraphs.map(p => p.textContent).join(' \n\n').trim();
            if (!textToSpeak) textToSpeak = pageContent.innerText.trim();
            if (textToSpeak) {
              playWithBrowserTTS(textToSpeak, sectionId, page);
            }
          }
        }
      }, 100);
    };
  };

  const handlePlayAudio = async (sectionId, page) => {
    const cacheKey = `${sectionId}-${page}`;

    if (audioState.isPlaying && audioState.sectionId === sectionId && audioState.page === page) {
      if (audioRef.current) {
        audioRef.current.pause();
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      } else if (utteranceRef.current) {
        window.speechSynthesis.pause();
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      }
      return;
    }

    if (!audioState.isPlaying && audioState.sectionId === sectionId && audioState.page === page) {
      if (audioRef.current) {
        audioRef.current.play();
        setAudioState(prev => ({ ...prev, isPlaying: true }));
      } else if (utteranceRef.current) {
        window.speechSynthesis.resume();
        setAudioState(prev => ({ ...prev, isPlaying: true }));
      }
      return;
    }

    if (audioCacheRef.current[cacheKey]) {
      playAudio(audioCacheRef.current[cacheKey], sectionId, page);
      return;
    }

    setAudioState({ isLoading: true, isPlaying: false, sectionId, page });

    setTimeout(async () => {
      if (!contentRef.current) return;

      const pageContent = contentRef.current.querySelector(`[data-page-content="${page}"]`);
      if (!pageContent) {
        setAudioState({ isLoading: false, isPlaying: false, sectionId: null, page: null });
        return;
      }

      const paragraphs = Array.from(pageContent.querySelectorAll('[data-speakable="true"]'));
      let textToSpeak = paragraphs.map(p => p.textContent).join(' \n\n').trim();
      if (!textToSpeak) textToSpeak = pageContent.innerText.trim();

      if (!textToSpeak) {
        setAudioState({ isLoading: false, isPlaying: false, sectionId: null, page: null });
        return;
      }

      try {
        const { data } = await base44.functions.invoke('generateStandardSpeech', {
          text: textToSpeak,
          voiceId: '21m00Tcm4TlvDqDq8ikWAM',
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
        });

        if (data?.fallback || data?.error) {
          playWithBrowserTTS(textToSpeak, sectionId, page);
          return;
        }

        if (data && data.audio_base64) {
          const byteCharacters = atob(data.audio_base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const audioBlob = new Blob([byteArray], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          audioCacheRef.current[cacheKey] = audioUrl;
          playAudio(audioUrl, sectionId, page);
        } else {
          playWithBrowserTTS(textToSpeak, sectionId, page);
        }
      } catch (error) {
        playWithBrowserTTS(textToSpeak, sectionId, page);
      }
    }, 100);
  };

  const handlePurchaseBook = () => {
    const currentOrigin = window.location.origin;
    const successUrl = `${currentOrigin}${createPageUrl('BookStudio')}?purchase=success&book=infinity`;
    window.location.href = `https://buy.stripe.com/eVq9AT3ic5qj6Kz27McAo00?client_reference_id=${user?.id || 'guest'}&success_url=${encodeURIComponent(successUrl)}`;
  };

  const handleSetSection = (section, page = 0) => {
    if (!hasBookAccess) {
      const sectionIndex = orderedSections.indexOf(section);
      if (sectionIndex > 0 || (sectionIndex === 0 && page > maxPreviewPage)) {
        toast.info('🔒 Locked Content', {
          description: 'Purchase the book for $14.99 to unlock all pages.',
          action: {
            label: 'Buy Now - $14.99',
            onClick: () => handlePurchaseBook()
          },
          duration: 6000
        });
        return;
      }
    }

    setCurrentSectionId(section);
    setCurrentPage(page);
    setIsMobileNavOpen(false);
    stopAudio();
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentSectionIndex = orderedSections.indexOf(currentSectionId);
  const totalPagesInSection = sectionPages[currentSectionId]?.length || 1;
  const isFirstPageOverall = currentSectionIndex === 0 && currentPage === 0;
  const isLastPageOverall = currentSectionIndex === orderedSections.length - 1 && currentPage === totalPagesInSection - 1;

  const handleNext = () => {
    if (!hasBookAccess && currentPage >= maxPreviewPage) {
      handlePurchaseBook();
      return;
    }

    if (currentPage < totalPagesInSection - 1) {
      handleSetSection(currentSectionId, currentPage + 1);
    } else if (currentSectionIndex < orderedSections.length - 1) {
      const nextSection = orderedSections[currentSectionIndex + 1];
      handleSetSection(nextSection, 0);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      handleSetSection(currentSectionId, currentPage - 1);
    } else if (currentSectionIndex > 0) {
      const prevSectionId = orderedSections[currentSectionIndex - 1];
      const lastPageOfPrevSection = (sectionPages[prevSectionId]?.length || 1) - 1;
      handleSetSection(prevSectionId, lastPageOfPrevSection);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('${coverImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
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
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <BookHeart className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  📖 Read First 5 Pages Free
                </h3>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  Experience Ruby's profound journey. <strong className="text-purple-600">First 5 pages completely free</strong> — no account needed!
                </p>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-4 border-2 border-amber-200">
                  <div className="flex items-center justify-center gap-2 text-amber-700 font-semibold mb-2">
                    <Lock className="w-5 h-5" />
                    <span>Full Book: $14.99 (One-Time)</span>
                  </div>
                  <p className="text-sm text-amber-600">
                    Unlock all pages + lifetime access
                  </p>
                </div>

                <Button
                  onClick={handleClosePopup}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Start Reading Preview
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <header className="bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button asChild variant="ghost" className="text-white hover:bg-white/20 hover:text-white">
              <Link to={createPageUrl('BookStudio')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Link>
            </Button>

            <div className="text-center">
              <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight drop-shadow-lg">Infinity</h1>
              <p className="text-sm md:text-lg text-white/90 mt-1">By Ruby Dobry</p>
              {!hasBookAccess && (
                <Badge className="mt-2 bg-amber-500 text-white border-2 border-amber-300">
                  🔒 Preview: First 5 Pages Free
                </Badge>
              )}
            </div>

            <div className="lg:hidden">
              <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-72">
                  <BookNavigation 
                    currentSection={currentSectionId} 
                    currentPage={currentPage}
                    setSection={handleSetSection} 
                    onPlayAudio={(sectionId) => handlePlayAudio(sectionId, currentPage)}
                    audioState={audioState}
                    hasFullAccess={hasBookAccess}
                    maxPreviewPage={maxPreviewPage}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
        
        <div className="flex max-w-7xl mx-auto">
          <aside className="hidden lg:block w-72 flex-shrink-0 p-6 max-h-[calc(100vh-100px)] overflow-y-auto">
            <div className="bg-white/90 backdrop-blur-lg rounded-lg shadow-xl">
              <BookNavigation 
                currentSection={currentSectionId} 
                currentPage={currentPage}
                setSection={handleSetSection}
                onPlayAudio={(sectionId) => handlePlayAudio(sectionId, currentPage)}
                audioState={audioState}
                hasFullAccess={hasBookAccess}
                maxPreviewPage={maxPreviewPage}
              />
            </div>
          </aside>

          <main className="flex-grow p-4 sm:p-6 md:p-10 overflow-y-auto" ref={contentRef}>
            {!hasBookAccess && currentPage >= maxPreviewPage - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-4 border-purple-300 rounded-2xl p-8 text-center shadow-2xl"
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
                  You've reached the end of the preview. Continue Ruby's profound journey through love, loss, and infinite connection.
                </p>

                {!showCodeInput ? (
                  <div className="space-y-4">
                        <Button
                          onClick={handlePurchaseBook}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-14 text-lg px-8 shadow-lg"
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Buy Full Book - $14.99
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-2 border-purple-400 text-purple-700 hover:bg-purple-50 h-12"
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
                          <><Sparkles className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
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
              page={currentPage}
              totalPages={totalPagesInSection}
              onPlay={() => handlePlayAudio(currentSectionId, currentPage)}
              isLoading={audioState.isLoading && audioState.sectionId === currentSectionId && audioState.page === currentPage}
              isPlaying={audioState.isPlaying && audioState.sectionId === currentSectionId && audioState.page === currentPage}
            />

            <motion.div 
              key={`${currentSectionId}-${currentPage}`}
              className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12 w-full max-w-3xl mx-auto border border-white/50 relative overflow-hidden ${
                !hasBookAccess && currentPage > maxPreviewPage ? 'filter blur-md pointer-events-none' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {!hasBookAccess && currentPage > maxPreviewPage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
                  <div className="text-center">
                    <Lock className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900">Locked Content</h3>
                  </div>
                </div>
              )}
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Written by <span className="font-semibold text-purple-600">Ruby Dobry</span>
              </p>
              <InfinityContent section={currentSectionId} page={currentPage} />
            </motion.div>

            <BookPageNavigation
              onPrevious={handlePrevious}
              onNext={handleNext}
              isFirstPage={isFirstPageOverall}
              isLastPage={isLastPageOverall}
            />
          </main>
        </div>
      </div>

      <footer className="relative z-10 py-6 bg-black/40 backdrop-blur-md">
        <p className="text-center text-sm text-white/90">
          © 2025 Ruby Dobry — Infinity: A Story of Love Beyond Loss. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
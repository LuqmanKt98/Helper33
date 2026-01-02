
import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Sparkles, Lock, Star, Loader2, RefreshCw } from 'lucide-react';
import { useNotifications as useSounds } from '../SoundManager';
import { toast } from 'sonner';
import { initializeStickers } from '@/functions/initializeStickers';

const StickerScene = ({ placedStickers, onPlaceSticker }) => {
    const sceneRef = useRef(null);

    return (
        <div 
            ref={sceneRef}
            onClick={(e) => {
                if (!sceneRef.current) return;
                const rect = sceneRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                onPlaceSticker({ x, y });
            }}
            className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-br from-sky-200 via-green-200 to-yellow-200 rounded-2xl shadow-inner overflow-hidden cursor-copy border-4 border-white"
        >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/light-paper-fibers.png')] opacity-50"></div>
            
            {placedStickers.map((sticker) => (
                <motion.div
                    key={sticker.instanceId}
                    drag
                    dragMomentum={false}
                    className="absolute w-20 h-20 cursor-grab active:cursor-grabbing"
                    style={{
                        left: sticker.x,
                        top: sticker.y,
                        translateX: '-50%',
                        translateY: '-50%',
                    }}
                    initial={{ scale: 0, rotate: (Math.random() - 0.5) * 15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {typeof sticker.image_url === 'string' && sticker.image_url.startsWith('http') ? (
                    <img 
                      src={sticker.image_url} 
                      alt={sticker.name} 
                      className="w-full h-full object-contain drop-shadow-lg" 
                    />
                  ) : (
                    <div className="text-6xl drop-shadow-lg text-center">
                      {sticker.image_url || '⭐'}
                    </div>
                  )}
                </motion.div>
            ))}
            
            {placedStickers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-dashed border-gray-400">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-semibold">Click a sticker, then click here to place it!</p>
                </div>
              </div>
            )}
        </div>
    );
};

export default function StickerBook({ onComplete }) {
  const [placedStickers, setPlacedStickers] = useState([]);
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { playSound } = useSounds();

  // Fetch all stickers from database
  const { data: allStickers = [], isLoading: isLoadingStickers, refetch: refetchStickers } = useQuery({
    queryKey: ['allStickers'],
    queryFn: async () => {
      const stickers = await base44.entities.Sticker.list();
      console.log('🎨 Fetched stickers from DB:', stickers.length);
      return stickers || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true
  });

  // Fetch user to get unlocked stickers
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 1000 * 60 * 5
  });

  // Get unlocked sticker IDs from user stats
  const unlockedStickerIds = user?.kids_studio_stats?.unlocked_stickers || [];

  console.log('🎯 StickerBook Debug:', {
    allStickersCount: allStickers.length,
    unlockedStickerIds: unlockedStickerIds,
    unlockedCount: unlockedStickerIds.length,
    userStatsStickersEarned: user?.kids_studio_stats?.stickers_earned
  });

  // Filter unlocked and locked stickers
  const availableStickers = allStickers.filter(s => unlockedStickerIds.includes(s.id));
  const lockedStickers = allStickers.filter(s => !unlockedStickerIds.includes(s.id));

  console.log('🎨 Filtered Results:', {
    availableCount: availableStickers.length,
    lockedCount: lockedStickers.length,
    availableStickers: availableStickers.map(s => ({ id: s.id, name: s.name }))
  });

  // Initialize stickers if database is empty
  const handleInitializeStickers = async () => {
    setIsInitializing(true);
    try {
      toast.info('Initializing sticker collection...');
      const response = await initializeStickers();
      
      if (response.data?.success) {
        toast.success(`Created ${response.data.count} stickers! 🎉`);
        await refetchStickers();
      } else {
        toast.error('Failed to initialize stickers');
      }
    } catch (error) {
      console.error('Error initializing stickers:', error);
      toast.error('Could not initialize stickers. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSelectSticker = (stickerId) => {
    setSelectedStickerId(stickerId);
    playSound('click');
  };

  const handlePlaceSticker = ({ x, y }) => {
    if (!selectedStickerId) return;

    const stickerDetails = allStickers.find(s => s.id === selectedStickerId);
    if (stickerDetails) {
      setPlacedStickers(prev => [
        ...prev,
        {
          ...stickerDetails,
          x,
          y,
          instanceId: `sticker-${Date.now()}-${Math.random()}`
        }
      ]);
      playSound('pop');
    }
  };

  const handleClearScene = () => {
    setPlacedStickers([]);
    playSound('error');
  };

  const isLoading = isLoadingStickers || isLoadingUser || isInitializing;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
        <span className="text-lg text-purple-700">Loading stickers...</span>
        {isInitializing && (
          <p className="text-sm text-gray-600">Setting up your sticker collection... ✨</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-xl w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-yellow-500" />
          <h2 className="text-3xl font-bold text-amber-800">Create a Sticker Scene!</h2>
        </div>
        <p className="text-amber-700 font-semibold">Click a sticker below, then click on the scene to place it.</p>
        
        {/* Stats */}
        <div className="flex justify-center gap-4 mt-3">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-4 py-2">
            <Star className="w-4 h-4 mr-1" />
            {availableStickers.length} Unlocked
          </Badge>
          <Badge className="bg-gradient-to-r from-gray-500 to-slate-500 text-white text-sm px-4 py-2">
            <Lock className="w-4 h-4 mr-1" />
            {lockedStickers.length} Locked
          </Badge>
        </div>
      </div>

      {/* Interactive Sticker Scene */}
      <StickerScene 
        placedStickers={placedStickers} 
        onPlaceSticker={handlePlaceSticker}
      />
      
      {/* Action Button */}
      <div className="flex justify-center mt-4">
        <Button 
          onClick={handleClearScene}
          disabled={placedStickers.length === 0}
          className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-xl disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Scene & Start Over
        </Button>
      </div>
      
      {/* Sticker Collection */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-amber-800 mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          Your Unlocked Stickers
        </h3>
        
        {availableStickers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 bg-white/70 rounded-2xl border-4 border-dashed border-amber-300"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🎁
            </motion.div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">
              {allStickers.length === 0 ? 'Setting up stickers...' : 'No Stickers Yet!'}
            </h4>
            <p className="text-gray-600 mb-4">
              {allStickers.length === 0 
                ? 'Initializing your sticker collection...' 
                : 'Complete activities and challenges to unlock stickers!'}
            </p>
            
            {/* Show initialization button if no stickers exist in database */}
            {allStickers.length === 0 ? (
              <div className="space-y-4">
                <Button
                  onClick={handleInitializeStickers}
                  disabled={isInitializing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl disabled:opacity-50"
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Stickers...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Initialize Sticker Collection
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-600">
                  Click above to create your sticker collection! ✨
                </p>
              </div>
            ) : (
              <Badge className="bg-purple-600 text-white text-lg px-6 py-3">
                Play games to earn stickers! 🎮
              </Badge>
            )}
            
            {/* Show helpful message if user has earned stickers but DB is empty */}
            {unlockedStickerIds.length > 0 && allStickers.length === 0 && (
              <div className="mt-4 p-4 bg-blue-100 rounded-lg border-2 border-blue-400 text-sm max-w-md mx-auto">
                <p className="text-blue-800 font-semibold mb-2">
                  🎉 Great news! You've earned {unlockedStickerIds.length} stickers!
                </p>
                <p className="text-blue-700">
                  Click the button above to see them all! ⬆️
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 p-4 bg-white/70 rounded-xl shadow-md">
            {availableStickers.map((sticker, idx) => (
              <motion.div
                key={sticker.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05, type: 'spring' }}
                onClick={() => handleSelectSticker(sticker.id)}
                className={`relative p-3 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                  selectedStickerId === sticker.id 
                    ? 'bg-gradient-to-br from-yellow-300 to-orange-300 shadow-2xl scale-110 ring-4 ring-yellow-400' 
                    : 'bg-white hover:bg-yellow-50 shadow-sm hover:shadow-lg hover:scale-105'
                }`}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Sticker Image */}
                {typeof sticker.image_url === 'string' && sticker.image_url.startsWith('http') ? (
                  <img 
                    src={sticker.image_url} 
                    alt={sticker.name} 
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain" 
                  />
                ) : (
                  <div className="text-4xl sm:text-5xl">
                    {sticker.image_url || '⭐'}
                  </div>
                )}
                
                {/* Sticker Name */}
                <p className="text-xs font-bold text-amber-900 mt-2 text-center line-clamp-1">
                  {sticker.name}
                </p>
                
                {/* Rarity Badge */}
                {sticker.rarity && (
                  <Badge 
                    className={`text-xs mt-1 ${
                      sticker.rarity === 'epic' 
                        ? 'bg-purple-600 text-white' 
                        : sticker.rarity === 'rare' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-600 text-white'
                    }`}
                  >
                    {sticker.rarity}
                  </Badge>
                )}
                
                {/* Selection Indicator */}
                {selectedStickerId === sticker.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Locked Stickers Preview */}
      {lockedStickers.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-500" />
            Locked Stickers ({lockedStickers.length} more to unlock!)
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 p-4 bg-gray-100 rounded-xl">
            {lockedStickers.slice(0, 16).map((sticker, idx) => (
              <motion.div
                key={sticker.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="relative p-3 rounded-xl bg-gray-200 flex flex-col items-center justify-center opacity-50 grayscale"
              >
                {typeof sticker.image_url === 'string' && sticker.image_url.startsWith('http') ? (
                  <img 
                    src={sticker.image_url} 
                    alt="Locked" 
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain" 
                  />
                ) : (
                  <div className="text-4xl sm:text-5xl">
                    {sticker.image_url || '❓'}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-xs font-semibold text-gray-600 mt-2">???</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-3 font-semibold">
            🎮 Play more activities to unlock these stickers!
          </p>
        </div>
      )}

      {/* Helpful Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 border-4 border-purple-300 rounded-2xl p-6 text-center"
      >
        <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3" />
        <h4 className="font-bold text-purple-900 text-lg mb-2">💡 Pro Tip!</h4>
        <p className="text-purple-800">
          Drag stickers around on the scene to arrange them perfectly! 
          Each sticker you earn stays in your collection forever! 🌟
        </p>
      </motion.div>
    </div>
  );
}

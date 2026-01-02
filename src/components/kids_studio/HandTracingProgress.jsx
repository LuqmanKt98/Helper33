import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Hand,
  Star,
  CheckCircle,
  Award,
  Sparkles,
  Heart,
  Trophy,
  Printer,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { User } from '@/entities/User';
import { UploadFile } from '@/integrations/Core';
import { useNotifications as useSounds } from '../SoundManager';

const letterActivities = {
  A: { word: 'Apple', emoji: '🍎', color: '#ef4444' },
  B: { word: 'Bee', emoji: '🐝', color: '#eab308' },
  C: { word: 'Cat', emoji: '🐱', color: '#f97316' },
  D: { word: 'Dog', emoji: '🐶', color: '#a855f7' },
  E: { word: 'Elephant', emoji: '🐘', color: '#6366f1' },
  F: { word: 'Fish', emoji: '🐠', color: '#06b6d4' },
  G: { word: 'Grapes', emoji: '🍇', color: '#8b5cf6' },
  H: { word: 'Heart', emoji: '❤️', color: '#ec4899' },
  I: { word: 'Ice Cream', emoji: '🍦', color: '#f472b6' },
  J: { word: 'Jellyfish', emoji: '🪼', color: '#06b6d4' },
  K: { word: 'Kite', emoji: '🪁', color: '#f59e0b' },
  L: { word: 'Lion', emoji: '🦁', color: '#f59e0b' },
  M: { word: 'Moon', emoji: '🌙', color: '#fbbf24' },
  N: { word: 'Nest', emoji: '🪺', color: '#92400e' },
  O: { word: 'Orange', emoji: '🍊', color: '#f97316' },
  P: { word: 'Pizza', emoji: '🍕', color: '#ef4444' },
  Q: { word: 'Queen', emoji: '👑', color: '#eab308' },
  R: { word: 'Rainbow', emoji: '🌈', color: '#ec4899' },
  S: { word: 'Star', emoji: '⭐', color: '#fbbf24' },
  T: { word: 'Tree', emoji: '🌳', color: '#22c55e' },
  U: { word: 'Umbrella', emoji: '☂️', color: '#3b82f6' },
  V: { word: 'Violin', emoji: '🎻', color: '#a855f7' },
  W: { word: 'Watermelon', emoji: '🍉', color: '#22c55e' },
  X: { word: 'Xylophone', emoji: '🎵', color: '#06b6d4' },
  Y: { word: 'Yarn', emoji: '🧶', color: '#ec4899' },
  Z: { word: 'Zebra', emoji: '🦓', color: '#64748b' }
};

const badges = [
  { id: 'first_hand', name: 'First Hand!', icon: '✋', requirement: 1, description: 'Completed your first letter!' },
  { id: 'creative_hands', name: 'Helping Hands Hero', icon: '🎨', requirement: 5, description: 'Completed 5 letters!' },
  { id: 'color_star', name: 'Creative Colorist', icon: '⭐', requirement: 10, description: 'Completed 10 letters!' },
  { id: 'focused_learner', name: 'Alphabet Explorer', icon: '🎯', requirement: 15, description: 'Completed 15 letters!' },
  { id: 'almost_there', name: 'Almost There!', icon: '🚀', requirement: 20, description: 'Completed 20 letters!' },
  { id: 'alphabet_master', name: 'Alphabet Master', icon: '🏆', requirement: 26, description: 'Completed all 26 letters!' }
];

const encouragementMessages = [
  "Your hands made something beautiful today!",
  "Keep tracing and shining, little artist!",
  "You're doing amazing! Every letter is a step forward!",
  "What a wonderful job! Your helping hands are learning so much!",
  "Fantastic work! You should be so proud!"
];

export default function HandTracingProgress({ onLetterSelect, mode = 'child' }) {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({
    completed_letters: [],
    letter_photos: {}, // { 'A': ['url1', 'url2'], 'B': ['url1'] }
    encouragements: [],
    earned_badges: []
  });
  const [showCelebration, setShowCelebration] = useState(null);
  const [encouragementText, setEncouragementText] = useState('');
  const [selectedLetterForAction, setSelectedLetterForAction] = useState(null);
  const [actionMode, setActionMode] = useState(null); // 'upload', 'print', 'view', 'encourage'
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryLetter, setGalleryLetter] = useState(null);
  const { playSound } = useSounds();

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      const handTracingProgress = userData.hand_tracing_progress || {
        completed_letters: [],
        letter_photos: {},
        encouragements: [],
        earned_badges: []
      };
      setProgress(handTracingProgress);
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  const markLetterComplete = async (letter, photoUrl = null) => {
    const newCompleted = progress.completed_letters.includes(letter) 
      ? progress.completed_letters 
      : [...progress.completed_letters, letter];
    
    const newPhotos = { ...progress.letter_photos };
    if (photoUrl) {
      if (!newPhotos[letter]) {
        newPhotos[letter] = [];
      }
      newPhotos[letter].push(photoUrl);
    }

    const newBadges = [...progress.earned_badges];

    // Check for new badges
    badges.forEach(badge => {
      if (newCompleted.length >= badge.requirement && !newBadges.includes(badge.id)) {
        newBadges.push(badge.id);
      }
    });

    const updatedProgress = {
      ...progress,
      completed_letters: newCompleted,
      letter_photos: newPhotos,
      earned_badges: newBadges
    };

    try {
      await User.updateMyUserData({
        hand_tracing_progress: updatedProgress
      });
      setProgress(updatedProgress);

      // Show celebration
      const activity = letterActivities[letter];
      const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
      const letterMessage = `You finished ${letter} for ${activity.word} — ${activity.word === 'Bee' ? 'buzz-tastic' : 'amazing'}!`;
      
      setShowCelebration({
        letter,
        message: letterMessage,
        encouragement: randomMessage,
        newBadge: newBadges.length > progress.earned_badges.length ? badges.find(b => b.id === newBadges[newBadges.length - 1]) : null
      });

      playSound('complete');

      setTimeout(() => {
        setShowCelebration(null);
      }, 6000);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handlePhotoUpload = async (letter) => {
    if (!selectedFile) return;
    
    setUploadingPhoto(true);
    try {
      const { file_url } = await UploadFile({ file: selectedFile });
      await markLetterComplete(letter, file_url);
      setSelectedFile(null);
      setActionMode(null);
      setSelectedLetterForAction(null);
      playSound('success');
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePrintWorksheet = (letter) => {
    const activity = letterActivities[letter];
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Letter ${letter} - ${activity.word} Worksheet</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body {
            font-family: 'Comic Sans MS', cursive;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid ${activity.color};
            padding-bottom: 20px;
          }
          .letter-title {
            font-size: 72px;
            color: ${activity.color};
            margin: 0;
          }
          .word-title {
            font-size: 36px;
            color: #666;
            margin: 10px 0;
          }
          .emoji {
            font-size: 64px;
          }
          .instructions {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
          }
          .instructions h3 {
            color: ${activity.color};
            margin-top: 0;
          }
          .instructions ol {
            line-height: 1.8;
          }
          .drawing-area {
            border: 3px dashed ${activity.color};
            min-height: 400px;
            margin: 20px 0;
            border-radius: 15px;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 20px,
              #f3f4f6 20px,
              #f3f4f6 21px
            );
            position: relative;
          }
          .helper-text {
            position: absolute;
            top: 20px;
            left: 20px;
            color: #9ca3af;
            font-size: 18px;
          }
          .reflection {
            margin-top: 30px;
            padding: 20px;
            background: #fef3c7;
            border-radius: 10px;
          }
          .reflection textarea {
            width: 100%;
            min-height: 100px;
            border: 2px solid ${activity.color};
            border-radius: 8px;
            padding: 10px;
            font-family: 'Comic Sans MS', cursive;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="emoji">${activity.emoji}</div>
          <h1 class="letter-title">${letter} ${letter.toLowerCase()}</h1>
          <h2 class="word-title">${activity.word}</h2>
        </div>
        
        <div class="instructions">
          <h3>✋ How to Complete This Activity:</h3>
          <ol>
            <li>Place your hand flat in the drawing area below</li>
            <li>Trace around your hand with a pencil or crayon</li>
            <li>Draw the letter <strong>${letter}</strong> inside or around your hand</li>
            <li>Draw a ${activity.word} ${activity.emoji} somewhere on the page</li>
            <li>Color everything with your favorite colors!</li>
          </ol>
        </div>
        
        <div class="drawing-area">
          <div class="helper-text">
            ✋ Trace your hand here!<br>
            Draw letter ${letter}<br>
            Draw ${activity.word} ${activity.emoji}
          </div>
        </div>
        
        <div class="reflection">
          <h3 style="color: ${activity.color}; margin-top: 0;">💬 Think & Write:</h3>
          <p><strong>"My hands can help with ________________"</strong></p>
          <p style="margin-top: 20px; line-height: 2em;">
            __________________________________________<br>
            __________________________________________<br>
            __________________________________________<br>
          </p>
        </div>
        
        <div class="footer">
          <p>🌈 DobryLife Kids Studio • Letter ${letter} Worksheet</p>
          <p style="margin-top: 20px;" class="no-print">
            <button onclick="window.print()" style="background: ${activity.color}; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 18px; cursor: pointer; font-family: 'Comic Sans MS', cursive;">
              🖨️ Print This Worksheet
            </button>
          </p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    playSound('click');
  };

  const addEncouragement = async (letter) => {
    if (!encouragementText.trim()) return;

    const newEncouragement = {
      letter,
      from: user.full_name || 'Family',
      message: encouragementText,
      emoji: '❤️',
      date: new Date().toISOString()
    };

    const updatedProgress = {
      ...progress,
      encouragements: [...progress.encouragements, newEncouragement]
    };

    try {
      await User.updateMyUserData({
        hand_tracing_progress: updatedProgress
      });
      setProgress(updatedProgress);
      setEncouragementText('');
      setActionMode(null);
      setSelectedLetterForAction(null);
      playSound('success');
    } catch (error) {
      console.error("Error saving encouragement:", error);
    }
  };

  const completionPercentage = (progress.completed_letters.length / 26) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Hand className="w-6 h-6" />
            A–Z Hand Tracing Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-purple-700">
                  {progress.completed_letters.length} of 26 Letters Complete
                </span>
                <span className="text-sm font-bold text-purple-800">
                  {Math.round(completionPercentage)}%
                </span>
              </div>
              <Progress value={completionPercentage} className="h-4 bg-purple-100">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-500 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                />
              </Progress>
            </div>

            {/* Badges */}
            {progress.earned_badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {progress.earned_badges.map(badgeId => {
                  const badge = badges.find(b => b.id === badgeId);
                  return (
                    <motion.div
                      key={badgeId}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 bg-yellow-100 border-2 border-yellow-300 rounded-full px-3 py-1"
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <span className="text-sm font-bold text-yellow-800">{badge.name}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Affirmation */}
            <div className="bg-white/80 p-4 rounded-lg border-2 border-purple-100">
              <p className="text-center text-purple-700 font-medium">
                💬 {encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Letter Board */}
      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Sparkles className="w-5 h-5" />
            Your Alphabet Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-w-6xl mx-auto">
            {Object.keys(letterActivities).map((letter) => {
              const isCompleted = progress.completed_letters.includes(letter);
              const activity = letterActivities[letter];
              const letterEncouragements = progress.encouragements.filter(e => e.letter === letter);
              const hasPhotos = progress.letter_photos[letter] && progress.letter_photos[letter].length > 0;

              return (
                <motion.div
                  key={letter}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <button
                    onClick={() => {
                      if (mode === 'child') {
                        setSelectedLetterForAction(letter);
                        setActionMode('menu');
                      } else {
                        setSelectedLetterForAction(letter);
                        setActionMode('encourage');
                      }
                    }}
                    className={`w-full aspect-square rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center p-3 relative ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-400' 
                        : 'bg-white border-2 border-gray-200 hover:border-purple-300'
                    }`}
                    style={{ backgroundColor: isCompleted ? `${activity.color}20` : undefined }}
                  >
                    {isCompleted && (
                      <CheckCircle className="absolute top-1 right-1 w-4 h-4 text-green-600" />
                    )}
                    {hasPhotos && (
                      <ImageIcon className="absolute top-1 left-1 w-4 h-4 text-blue-600" />
                    )}
                    <div className="text-2xl font-bold mb-1" style={{ color: isCompleted ? '#059669' : activity.color }}>
                      {letter}
                    </div>
                    <div className="text-lg">{activity.emoji}</div>
                    {letterEncouragements.length > 0 && (
                      <Heart className="absolute bottom-1 right-1 w-3 h-3 text-pink-500 fill-pink-500" />
                    )}
                  </button>

                  {/* Indicators */}
                  {letterEncouragements.length > 0 && (
                    <div className="absolute -top-1 -left-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {letterEncouragements.length}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Letter Action Menu */}
      {actionMode === 'menu' && selectedLetterForAction && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Sparkles className="w-5 h-5" />
              Letter {selectedLetterForAction} - {letterActivities[selectedLetterForAction].word}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handlePrintWorksheet(selectedLetterForAction)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Worksheet
              </Button>
              
              <Button
                onClick={() => setActionMode('upload')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Upload Photo
              </Button>
              
              {progress.letter_photos[selectedLetterForAction] && progress.letter_photos[selectedLetterForAction].length > 0 && (
                <Button
                  onClick={() => {
                    setGalleryLetter(selectedLetterForAction);
                    setShowGallery(true);
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  View Gallery ({progress.letter_photos[selectedLetterForAction].length})
                </Button>
              )}
              
              {!progress.completed_letters.includes(selectedLetterForAction) && (
                <Button
                  onClick={() => markLetterComplete(selectedLetterForAction)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Complete
                </Button>
              )}
            </div>
            
            <Button
              onClick={() => {
                setActionMode(null);
                setSelectedLetterForAction(null);
              }}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Photo Section */}
      {actionMode === 'upload' && selectedLetterForAction && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Camera className="w-5 h-5" />
              Upload Your {letterActivities[selectedLetterForAction].word} Artwork!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                Take a photo of your finished Letter {selectedLetterForAction} artwork and upload it here!
              </p>
              
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="mb-4"
              />
              
              {selectedFile && (
                <p className="text-sm text-gray-600 mb-2">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setActionMode('menu');
                  setSelectedFile(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => handlePhotoUpload(selectedLetterForAction)}
                disabled={!selectedFile || uploadingPhoto}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                {uploadingPhoto ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Complete
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family View - Encouragement Section */}
      {mode === 'family' && actionMode === 'encourage' && selectedLetterForAction && (
        <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-800">
              <Heart className="w-5 h-5" />
              Leave Encouragement for Letter {selectedLetterForAction}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Show existing encouragements */}
            {progress.encouragements
              .filter(e => e.letter === selectedLetterForAction)
              .map((enc, idx) => (
                <div key={idx} className="bg-white/80 p-3 rounded-lg border border-pink-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{enc.emoji || '❤️'}</span>
                    <span className="text-sm font-semibold text-gray-800">{enc.from}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(enc.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{enc.message}</p>
                </div>
              ))}

            {/* Add new encouragement */}
            <div className="space-y-2">
              <Textarea
                value={encouragementText}
                onChange={(e) => setEncouragementText(e.target.value)}
                placeholder="Write a message of encouragement...

Examples:
• Great job on letter Z! You're amazing!
• I love how creative your hand tracing is!
• Keep up the wonderful work!"
                className="min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setActionMode(null);
                    setSelectedLetterForAction(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => addEncouragement(selectedLetterForAction)}
                  disabled={!encouragementText.trim()}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Send Encouragement
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Gallery Modal */}
      {showGallery && galleryLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-2xl w-full bg-white max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Letter {galleryLetter} - Photo Gallery
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowGallery(false);
                    setGalleryLetter(null);
                  }}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {progress.letter_photos[galleryLetter]?.map((photoUrl, idx) => (
                  <div key={idx} className="relative aspect-square">
                    <img
                      src={photoUrl}
                      alt={`Letter ${galleryLetter} artwork ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg border-2 border-purple-200"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <Card className="max-w-md w-full bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 border-4 border-yellow-300">
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="text-8xl mb-4"
                >
                  {letterActivities[showCelebration.letter].emoji}
                </motion.div>

                <div className="flex justify-center gap-2 mb-4">
                  <Star className="w-8 h-8 text-yellow-500 animate-bounce" />
                  <Trophy className="w-8 h-8 text-orange-500 animate-pulse" />
                  <Star className="w-8 h-8 text-yellow-500 animate-bounce" style={{animationDelay: '0.2s'}} />
                </div>

                <h3 className="text-3xl font-bold text-orange-800 mb-3">
                  🎉 Awesome Job! 🎉
                </h3>

                <p className="text-lg text-gray-700 mb-2">
                  {showCelebration.message}
                </p>
                
                <p className="text-md text-purple-700 font-medium mb-4">
                  {showCelebration.encouragement}
                </p>

                {showCelebration.newBadge && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/80 p-4 rounded-xl border-2 border-yellow-300 mb-4"
                  >
                    <Award className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                    <p className="font-bold text-purple-800 mb-1">New Badge Earned!</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl">{showCelebration.newBadge.icon}</span>
                      <span className="text-lg font-bold text-gray-800">
                        {showCelebration.newBadge.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {showCelebration.newBadge.description}
                    </p>
                  </motion.div>
                )}

                <Button
                  onClick={() => setShowCelebration(null)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  Continue Learning!
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
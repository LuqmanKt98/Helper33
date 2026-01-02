
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, CheckCircle, Star, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import AITutor from '../AITutor';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const letterWords = {
  A: ['Apple', 'Ant', 'Airplane'],
  B: ['Ball', 'Bear', 'Banana'],
  C: ['Cat', 'Car', 'Cake'],
  D: ['Dog', 'Duck', 'Door'],
  E: ['Elephant', 'Egg', 'Earth'],
  F: ['Fish', 'Frog', 'Flower'],
  G: ['Giraffe', 'Grapes', 'Guitar'],
  H: ['House', 'Horse', 'Hat'],
  I: ['Ice Cream', 'Igloo', 'Insect'],
  J: ['Jellyfish', 'Jump', 'Juice'],
  K: ['Kite', 'Kangaroo', 'Key'],
  L: ['Lion', 'Leaf', 'Lamp'],
  M: ['Moon', 'Monkey', 'Mouse'],
  N: ['Nest', 'Nose', 'Nut'],
  O: ['Orange', 'Owl', 'Ocean'],
  P: ['Penguin', 'Pizza', 'Piano'],
  Q: ['Queen', 'Quilt', 'Question'],
  R: ['Rainbow', 'Rabbit', 'Ring'],
  S: ['Sun', 'Snake', 'Star'],
  T: ['Tree', 'Tiger', 'Turtle'],
  U: ['Umbrella', 'Under', 'Up'],
  V: ['Violin', 'Vase', 'Volcano'],
  W: ['Whale', 'Water', 'Window'],
  X: ['X-ray', 'Xylophone', 'Fox (X sound)'],
  Y: ['Yellow', 'Yak', 'Yo-yo'],
  Z: ['Zebra', 'Zoo', 'Zipper']
};

// Define the shapes array for the new speakShape function
const shapes = [
  { name: 'Circle', sides: 0 },
  { name: 'Square', sides: 4 },
  { name: 'Triangle', sides: 3 },
  { name: 'Rectangle', sides: 4 },
  { name: 'Star', sides: 10 }, // 5 points, 10 edges
  { name: 'Heart', sides: 'no defined' },
  { name: 'Oval', sides: 0 },
  { name: 'Diamond', sides: 4 }
];

// Placeholder for playSound and shake animation logic as they are not defined in the original code
// In a real application, these would be imported or defined elsewhere.
const playSound = (type) => {
  console.log(`Placeholder: Playing sound of type "${type}"`);
  // Example: new Audio(`/sounds/${type}.mp3`).play();
};
const triggerShakeAnimation = () => {
  console.log('Placeholder: Triggering shake animation');
  // Example: Add a CSS class for a short duration to trigger a shake effect
};

export default function MontessoriLetters({ progress = {}, onComplete, childAge = 6, onSpeakText }) {
  const [currentLetter, setCurrentLetter] = useState(null);
  const [activityType, setActivityType] = useState('recognition');
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [learningGaps, setLearningGaps] = useState([]);

  const masteredLetters = progress?.mastered_letters || [];
  const level = progress?.level || 1;
  const totalActivities = 5;

  useEffect(() => {
    selectNewLetter();
  }, []);

  useEffect(() => {
    // Identify which letters child struggles with
    const gaps = [];
    if (progress.letter_mistakes) {
      Object.entries(progress.letter_mistakes).forEach(([letter, count]) => {
        if (count > 2) gaps.push(`Letter ${letter}`);
      });
    }
    setLearningGaps(gaps);
  }, [progress]);

  const selectNewLetter = () => {
    // Pick a letter they haven't mastered yet, or random if all mastered
    const unmastered = alphabet.filter(l => !masteredLetters.includes(l));
    const letterPool = unmastered.length > 0 ? unmastered : alphabet;
    const randomLetter = letterPool[Math.floor(Math.random() * letterPool.length)];
    
    setCurrentLetter(randomLetter);
    setShowAnswer(false);
  };

  const speakLetter = (letter) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const word = letterWords[letter];
        const utterance = new SpeechSynthesisUtterance(
          `${letter}. ${letter} is for ${word[0]}. ${letter.toLowerCase()}.`
        );
        utterance.rate = 0.8;
        utterance.pitch = 1.4;
        utterance.onerror = () => console.log('Voice not available');
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.log('Voice synthesis unavailable');
      }
    }
  };

  const speakShape = (shapeName) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const shapeData = shapes.find(s => s.name === shapeName);
        const utterance = new SpeechSynthesisUtterance(
          `This is a ${shapeName}. ${shapeName} has ${shapeData?.sides || 'no'} sides.`
        );
        utterance.rate = 0.8;
        utterance.pitch = 1.4;
        utterance.onerror = () => {
          // Silently handle TTS errors
          console.log('Voice not available');
        };
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        // Silently fail
        console.log('Voice synthesis unavailable');
      }
    }
  };

  const handleLetterClick = (clickedLetter) => {
    const targetLetter = currentLetter; // For this activity, the current displayed letter is the target
    
    if (clickedLetter === targetLetter) {
      setCorrect(prev => prev + 1);
      setShowAnswer(true);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 }
      });

      // Report success to AI Tutor
      if (window.aiTutorReportSuccess) {
        window.aiTutorReportSuccess();
      }
      
      setTimeout(() => {
        const newCompleted = completed + 1;
        setCompleted(newCompleted);
        
        if (newCompleted >= totalActivities) {
          setSessionDone(true);
          const isMastered = !masteredLetters.includes(currentLetter);
          onComplete({ 
            score: Math.round(correct / totalActivities * 100),
            masteredLetter: isMastered ? currentLetter : null
          });
        } else {
          selectNewLetter();
        }
      }, 2000);
    } else {
      playSound('error');
      
      // Report error to AI Tutor
      if (window.aiTutorReportError) {
        window.aiTutorReportError();
      }
      
      triggerShakeAnimation(); // Placeholder for shake animation logic
    }
  };

  if (sessionDone) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Amazing Learning! 🎉</h3>
        <p className="text-xl text-gray-700 mb-2">
          You got {correct} out of {totalActivities} correct!
        </p>
        
        {!masteredLetters.includes(currentLetter) && (
          <Badge className="bg-purple-100 text-purple-700 px-4 py-2 text-lg mt-4">
            <Star className="w-5 h-5 mr-2" />
            New Letter Mastered: {currentLetter}!
          </Badge>
        )}
        
        <Button
          onClick={() => {
            setCompleted(0);
            setCorrect(0);
            setSessionDone(false);
            selectNewLetter();
          }}
          className="mt-6 bg-purple-500 hover:bg-purple-600"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Learn More Letters
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* AI Tutor Integration */}
      <AITutor
        childName={progress.child_name || 'friend'}
        childAge={childAge}
        currentModule="letters"
        currentActivity={{
          name: `Learning Letter ${currentLetter}`,
          concept: `Letter ${currentLetter} and its sound`
        }}
        learningGaps={learningGaps}
        interests={progress.interests || ['reading', 'words']}
        recentProgress={{
          correct: correct,
          total: completed,
          currentLetter: currentLetter
        }}
        onSpeakResponse={speakLetter}
        compact={true}
      />

      {/* Progress */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-purple-700 mb-2">Letter Learning - Level {level}</h2>
        <p className="text-gray-600">Activity {completed + 1} of {totalActivities}</p>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completed / totalActivities) * 100}%` }}
          />
        </div>
      </div>

      {/* Letter Display */}
      {currentLetter && (
        <Card className="border-4 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mb-6"
            >
              <div className="text-9xl font-bold text-purple-700 mb-4">
                {currentLetter}
              </div>
              <div className="text-6xl mb-4">
                {currentLetter.toLowerCase()}
              </div>
            </motion.div>

            <Button
              onClick={() => speakLetter(currentLetter)}
              className="mb-6 bg-blue-500 hover:bg-blue-600"
              size="lg"
            >
              <Volume2 className="w-6 h-6 mr-2" />
              Say the Letter
            </Button>

            {/* Example Words */}
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-700 mb-3">
                {currentLetter} is for:
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                {letterWords[currentLetter]?.map((word, idx) => (
                  <Badge key={idx} className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {!showAnswer ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    onClick={() => handleLetterClick(currentLetter)} // Changed to call handleLetterClick
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-xl py-6"
                  >
                    <CheckCircle className="w-6 h-6 mr-2" />
                    I Know This Letter!
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-4"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-green-700">Perfect! ⭐</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Mastered Letters */}
      {masteredLetters.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg border-2 border-purple-200">
          <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Letters You've Mastered: {masteredLetters.length}/26
          </p>
          <div className="flex flex-wrap gap-2">
            {masteredLetters.map(letter => (
              <Badge key={letter} className="bg-green-100 text-green-800">
                {letter}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

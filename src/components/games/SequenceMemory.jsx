
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Play, Repeat, Award } from "lucide-react";

const SequenceMemory = ({ onComplete }) => {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [startTime, setStartTime] = useState(null); // New state for tracking game start time

  const buttons = [
    { id: 1, color: "bg-red-400", sound: "C4" },
    { id: 2, color: "bg-blue-400", sound: "D4" },
    { id: 3, color: "bg-green-400", sound: "E4" },
    { id: 4, color: "bg-yellow-400", sound: "F4" }
  ];

  const generateNewSequence = useCallback(() => {
    const newSequence = [];
    for (let i = 0; i < currentLevel + 2; i++) {
      newSequence.push(Math.floor(Math.random() * 4) + 1);
    }
    setSequence(newSequence);
    setPlayerSequence([]);
  }, [currentLevel]);

  const showSequence = useCallback(async () => {
    setIsShowingSequence(true);
    setIsPlayerTurn(false);

    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveButton(sequence[i]);
      await new Promise(resolve => setTimeout(resolve, 400));
      setActiveButton(null);
    }

    setIsShowingSequence(false);
    setIsPlayerTurn(true);
  }, [sequence]);

  const handleButtonClick = (buttonId) => {
    if (!isPlayerTurn) return;

    const newPlayerSequence = [...playerSequence, buttonId];
    setPlayerSequence(newPlayerSequence);

    // Check if correct so far
    const isCorrect = sequence[newPlayerSequence.length - 1] === buttonId;

    if (!isCorrect) {
      setGameOver(true);
      setIsPlayerTurn(false);
      
      // Update streak
      (async () => {
        try {
          const { base44 } = await import('@/api/base44Client');
          const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
          await base44.functions.invoke('updateMindfulStreak', {
            item_key: 'sequence_memory',
            item_type: 'game',
            duration_seconds: duration
          });
        } catch (error) {
          console.error('Error updating streak:', error);
        }
      })();
      
      if (onComplete) onComplete();
      return;
    }

    // Check if sequence complete
    if (newPlayerSequence.length === sequence.length) {
      setScore(prev => prev + currentLevel);
      setCurrentLevel(prev => prev + 1);
      
      setTimeout(() => {
        generateNewSequence();
      }, 1000);
      
      setIsPlayerTurn(false);
    }
  };

  const startGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setGameOver(false);
    setPlayerSequence([]);
    setStartTime(Date.now()); // Set start time when game begins
    generateNewSequence();
  };

  useEffect(() => {
    if (sequence.length > 0 && !gameOver) {
      showSequence();
    }
  }, [sequence, gameOver, showSequence]);

  useEffect(() => {
    if (currentLevel > 1 && sequence.length > 0) {
      setTimeout(() => {
        showSequence();
      }, 1500);
    }
  }, [currentLevel, sequence.length, showSequence]);

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
      {sequence.length === 0 && !gameOver ? (
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Sequence Memory</h3>
          <p className="text-gray-600 mb-6">Watch the pattern, then repeat it back!</p>
          <Button onClick={startGame} size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500">
            <Play className="w-4 h-4 mr-2" />
            Start Game
          </Button>
        </div>
      ) : (
        <>
          {/* Game Stats */}
          <div className="flex gap-4 mb-6">
            <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
              Level: {currentLevel}
            </Badge>
            <Badge className="bg-pink-100 text-pink-800 text-lg px-4 py-2">
              Score: {score}
            </Badge>
          </div>

          {/* Status */}
          <div className="text-center mb-6">
            {isShowingSequence && (
              <div className="text-lg font-semibold text-purple-600 animate-pulse">
                👀 Watch carefully...
              </div>
            )}
            {isPlayerTurn && (
              <div className="text-lg font-semibold text-green-600">
                🎯 Your turn! ({playerSequence.length}/{sequence.length})
              </div>
            )}
          </div>

          {/* Game Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {buttons.map((button) => (
              <motion.button
                key={button.id}
                onClick={() => handleButtonClick(button.id)}
                className={`w-24 h-24 rounded-xl border-4 border-white shadow-lg ${button.color} 
                  ${activeButton === button.id ? 'brightness-150 scale-110' : 'hover:scale-105'}
                  ${!isPlayerTurn ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                  transition-all duration-200`}
                whileTap={{ scale: 0.95 }}
                animate={{
                  scale: activeButton === button.id ? 1.1 : 1,
                  brightness: activeButton === button.id ? 1.5 : 1
                }}
              />
            ))}
          </div>

          {/* Game Over */}
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Well Done!</h3>
              <p className="text-gray-600 mb-4">You reached Level {currentLevel} with {score} points!</p>
              <Button onClick={startGame} variant="outline">
                <Repeat className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default SequenceMemory;

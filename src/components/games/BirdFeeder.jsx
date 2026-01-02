
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bird, Baby, Award, Repeat } from 'lucide-react';

const BirdFeeder = () => {
  const [level, setLevel] = useState(1);
  const [feeds, setFeeds] = useState(0);
  const [babySize, setBabySize] = useState(40);
  const [motherPos, setMotherPos] = useState({ x: 50, y: 250 });
  const [foodPos, setFoodPos] = useState({ x: 300, y: 50 });
  const [hasFood, setHasFood] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [gameState, setGameState] = useState('start'); // start, playing, finished
  const gameAreaRef = useRef(null);

  const levelConfig = {
    1: { obstacles: 0, speed: 5 },
    2: { obstacles: 3, speed: 4 },
    3: { obstacles: 5, speed: 3 }
  };

  const setupLevel = (newLevel) => {
    setLevel(newLevel);
    setFeeds(0);
    setBabySize(40);
    setMotherPos({ x: 50, y: 250 });
    setFoodPos({ x: 300, y: 50 });
    setHasFood(false);
    setGameState('playing');

    const newObstacles = [];
    for (let i = 0; i < levelConfig[newLevel].obstacles; i++) {
      newObstacles.push({
        x: 100 + Math.random() * 200,
        y: 50 + Math.random() * 150,
        vx: newLevel === 3 ? (Math.random() - 0.5) * 1 : 0, // Moving obstacles for level 3
      });
    }
    setObstacles(newObstacles);
  };
  
  // Game loop for moving obstacles
  useEffect(() => {
    let animationFrameId;
    if (gameState === 'playing' && level === 3) {
      const animate = () => {
        setObstacles(prev => prev.map(obs => {
          let newX = obs.x + obs.vx;
          if (newX < 50 || newX > 350) obs.vx *= -1; // Bounce off walls
          return { ...obs, x: newX };
        }));
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, level]);

  const handleAreaClick = (e) => {
    if (gameState !== 'playing') return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMotherPos({ x, y });
  };
  
  // Collision detection
  useEffect(() => {
    if (gameState !== 'playing') return;

    // Check food collection
    if (!hasFood) {
      const distToFood = Math.hypot(motherPos.x - foodPos.x, motherPos.y - foodPos.y);
      if (distToFood < 25) {
        setHasFood(true);
      }
    } else {
      // Check baby feeding
      const distToBaby = Math.hypot(motherPos.x - 50, motherPos.y - 50);
      if (distToBaby < babySize / 2 + 10) {
        setFeeds(prev => prev + 1);
        setBabySize(prev => prev + 5);
        setHasFood(false);
        setFoodPos({
          x: 100 + Math.random() * 250,
          y: 50 + Math.random() * 200
        });
      }
    }

    // Check obstacle collision
    obstacles.forEach(obs => {
      const distToObstacle = Math.hypot(motherPos.x - obs.x, motherPos.y - obs.y);
      if (distToObstacle < 25) {
        // Reset position on hit
        setMotherPos({ x: 50, y: 250 });
        setHasFood(false);
      }
    });

    if (feeds >= 5) {
      setGameState('finished');
    }
  }, [motherPos, hasFood, gameState, babySize, feeds, obstacles, foodPos]);

  const restartGame = () => {
    setGameState('start');
  };

  return (
    <div className="flex flex-col items-center p-4">
      {gameState === 'start' && (
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Feed the Baby Bird</h3>
          <p className="text-gray-600 mb-6">Help the mother bird collect food and feed her hungry baby.</p>
          <div className="flex gap-4">
            <Button onClick={() => setupLevel(1)}>Level 1</Button>
            <Button onClick={() => setupLevel(2)} variant="secondary">Level 2</Button>
            <Button onClick={() => setupLevel(3)} variant="destructive">Level 3</Button>
          </div>
        </div>
      )}
      
      {gameState === 'playing' && (
        <>
          <div className="flex gap-4 mb-4">
            <Badge className="text-lg">Level: {level}</Badge>
            <Badge className="text-lg">Feeds: {feeds} / 5</Badge>
          </div>
          <div
            ref={gameAreaRef}
            onClick={handleAreaClick}
            className="relative w-[400px] h-[300px] bg-sky-200 rounded-lg overflow-hidden cursor-pointer"
          >
            {/* Baby Bird */}
            <motion.div
              animate={{ scale: babySize / 40 }}
              className="absolute top-[30px] left-[30px]"
            >
              <Baby className="text-yellow-600" style={{ width: babySize, height: babySize }} />
            </motion.div>
            
            {/* Mother Bird */}
            <motion.div
              className="absolute"
              animate={{ x: motherPos.x - 15, y: motherPos.y - 15 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            >
              <Bird className="text-blue-500 w-8 h-8" />
              {hasFood && <div className="absolute top-2 left-5 w-2 h-2 bg-red-500 rounded-full" />}
            </motion.div>
            
            {/* Food */}
            <AnimatePresence>
              {!hasFood && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute w-4 h-4 bg-red-500 rounded-full"
                  style={{ left: foodPos.x, top: foodPos.y }}
                />
              )}
            </AnimatePresence>

            {/* Obstacles */}
            {obstacles.map((obs, i) => (
              <motion.div
                key={i}
                className="absolute w-6 h-12 bg-amber-800 rounded-sm"
                animate={{ x: obs.x, y: obs.y }}
              />
            ))}
          </div>
        </>
      )}

      {gameState === 'finished' && (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
        >
          <Award className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Great Job!</h2>
          <p className="text-gray-600 mb-4">You successfully fed the baby bird!</p>
          <Button onClick={restartGame}>
            <Repeat className="w-4 h-4 mr-2" /> Play Again
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default BirdFeeder;

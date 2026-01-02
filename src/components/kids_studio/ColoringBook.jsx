
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Repeat, Sparkles } from 'lucide-react';
import { useNotifications as useSounds } from '../SoundManager';
import { coloringPages } from './coloringPagesData';

const colors = ['#FF6666', '#66B3FF', '#FFD700', '#99FF99', '#FF99FF', '#FFA500'];

export default function ColoringBook({ onComplete }) {
  const canvasRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [pageIndex, setPageIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [coloredPaths, setColoredPaths] = useState({});
  const [tracedPath, setTracedPath] = useState('');
  const [pointerPos, setPointerPos] = useState({ x: -100, y: -100 });
  const [smoothedPointerPos, setSmoothedPointerPos] = useState({ x: -100, y: -100 });
  const [inputType, setInputType] = useState('mouse');
  const [lastCollectionTime, setLastCollectionTime] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const { playSound } = useSounds();
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);

  // Create fun coloring sound effect
  const playColorSound = () => {
    // First play the built-in pop sound
    playSound('pop');

    // Then add a delightful magical "bloop" sound for kids
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Create a playful ascending tone
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
      
      // Envelope for a "bloop" effect
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.error('Error playing color sound:', error);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.pitch = 1.3;
            utterance.rate = 1.0;
            utterance.volume = 0.9;
            utterance.lang = 'en-US';
            utterance.onerror = () => {
                // Silently handle errors - voice is optional
                console.log('Voice not available');
            };
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            // Silently fail - voice is just an enhancement
            console.log('Voice feature unavailable');
        }
    }
  };

  // Reset colored paths when page changes
  useEffect(() => {
    setColoredPaths({});
    setIsFinished(false);
  }, [pageIndex]);

  const handleFill = (e) => {
    if (isFinished) return;
    
    const target = e.target;
    
    // Find the fillable element (either the clicked element or its parent)
    const fillableElement = target.closest('[data-fillable="true"]');
    
    if (fillableElement) {
      // Find the actual SVG shape within the fillable group
      const shape = fillableElement.querySelector('path, circle, rect, ellipse, polygon');
      
      if (shape) {
        const shapeId = shape.getAttribute('data-shape-id') || `shape-${Math.random()}`;
        
        // Check if this shape is already colored
        const currentFill = shape.getAttribute('fill');
        const isAlreadyColored = currentFill && currentFill !== 'none' && currentFill !== 'transparent' && currentFill !== 'white';
        
        // Set ID if not present
        if (!shape.getAttribute('data-shape-id')) {
          shape.setAttribute('data-shape-id', shapeId);
        }
        
        // Apply the color
        shape.setAttribute('fill', selectedColor);
        
        // Track colored paths
        setColoredPaths(prev => ({
          ...prev,
          [shapeId]: selectedColor
        }));
        
        // Play delightful sound effect for kids
        playColorSound();
        
        // Add a fun visual sparkle effect at tap point
        const rect = shape.getBoundingClientRect();
        const x = e.clientX || (e.touches && e.touches[0].clientX) || rect.left + rect.width / 2;
        const y = e.clientY || (e.touches && e.touches[0].clientY) || rect.top + rect.height / 2;
        
        createSparkle(x, y);
        
        checkCompletion();
      }
    }
  };
  
  const createSparkle = (x, y) => {
    const sparkle = document.createElement('div');
    sparkle.className = 'fixed pointer-events-none z-50';
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.transform = 'translate(-50%, -50%)';
    sparkle.innerHTML = '✨';
    sparkle.style.fontSize = '24px';
    sparkle.style.animation = 'sparkle-fade 0.6s ease-out forwards';
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
      sparkle.remove();
    }, 600);
  };
  
  const checkCompletion = () => {
    const svgContainer = canvasRef.current;
    if (!svgContainer) return;
    
    // Wait a bit for state to update
    setTimeout(() => {
      const allShapes = svgContainer.querySelectorAll('[data-fillable="true"] path, [data-fillable="true"] circle, [data-fillable="true"] rect, [data-fillable="true"] ellipse, [data-fillable="true"] polygon');
      const coloredShapes = Array.from(allShapes).filter(shape => {
        const fill = shape.getAttribute('fill');
        return fill && fill !== 'none' && fill !== 'transparent' && fill !== 'white';
      });
      
      if (allShapes.length > 0 && coloredShapes.length === allShapes.length) {
        setIsFinished(true);
        playSound('complete');
        onComplete(20, 'heart-sticker');
        speak(coloringPages[pageIndex].name);
      }
    }, 100);
  };

  const reset = () => {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (error) {
      // Silently fail
    }
    
    setIsFinished(false);
    setColoredPaths({});
    
    // Remove fill attribute from all shapes
    const svgContainer = canvasRef.current;
    if (svgContainer) {
      const allShapes = svgContainer.querySelectorAll('[data-fillable="true"] path, [data-fillable="true"] circle, [data-fillable="true"] rect, [data-fillable="true"] ellipse, [data-fillable="true"] polygon');
      allShapes.forEach(shape => {
        shape.removeAttribute('fill');
        shape.setAttribute('fill', 'white');
      });
    }
  };

  const nextPage = () => {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (error) {
      // Silently fail
    }
    
    reset();
    setPageIndex(prev => (prev + 1) % coloringPages.length);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-inner w-full h-full font-comic-sans text-center relative">
      <style>{`
        @keyframes sparkle-fade {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.5) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5) rotate(360deg);
          }
        }
      `}</style>
      
      <div className="flex justify-between items-center w-full mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 drop-shadow-sm flex items-center gap-3">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
          Digital Coloring Book
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full max-w-6xl">
        {/* Left Column: Color Palette and Controls */}
        <div className="flex flex-col items-center gap-6 p-4 sm:p-6 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg border-2 border-purple-200">
          <div className="w-full">
            <h3 className="text-lg sm:text-xl font-semibold text-purple-600 mb-3">Color the {coloringPages[pageIndex].name}!</h3>
            <p className="text-sm text-purple-600 mb-4">Click on the picture to color it in!</p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {colors.map(color => (
                <motion.button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    playSound('click');
                  }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full cursor-pointer border-4 transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{ 
                    backgroundColor: color, 
                    borderColor: selectedColor === color ? '#9333ea' : 'white',
                    transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)'
                  }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Select ${color} color`}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
              <Button 
                onClick={reset} 
                variant="outline" 
                className="w-full border-purple-300 hover:bg-purple-50 text-purple-700"
              >
                <Repeat className="w-4 h-4 mr-2"/> 
                Reset Current Page
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="mt-4 p-3 bg-purple-100 rounded-lg">
              <div className="flex items-center justify-between text-sm text-purple-700 mb-2">
                <span className="font-medium">Your Progress:</span>
                <span className="font-bold">{Object.keys(coloredPaths).length} areas colored</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(Object.keys(coloredPaths).length / (canvasRef.current?.querySelectorAll('[data-fillable="true"] path, [data-fillable="true"] circle, [data-fillable="true"] rect, [data-fillable="true"] ellipse, [data-fillable="true"] polygon').length || 1)) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Coloring Area */}
        <div className="relative flex justify-center items-center p-4 sm:p-6 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg border-2 border-purple-200">
          <div 
            ref={canvasRef}
            onClick={handleFill}
            className="w-full max-w-md aspect-square bg-white rounded-xl shadow-md p-4 border-4 border-purple-200 cursor-pointer overflow-hidden hover:border-purple-400 transition-colors"
            style={{ stroke: '#333', strokeWidth: '2' }}
            dangerouslySetInnerHTML={{ __html: coloringPages[pageIndex].svg }}
          />
        </div>
      </div>

      <AnimatePresence>
        {isFinished && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-500/95 to-pink-500/95 backdrop-blur-sm z-10 p-6 rounded-2xl"
          >
            <div className="text-center p-6 sm:p-10 bg-white rounded-2xl shadow-2xl max-w-md">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <CheckCircle className="w-20 h-20 sm:w-24 sm:h-24 text-green-500 mx-auto mb-4" />
              </motion.div>
              
              <h3 className="font-bold text-3xl sm:text-4xl text-green-600 mb-3">So Beautiful!</h3>
              <p className="text-lg sm:text-xl text-gray-700 mb-2">You colored the {coloringPages[pageIndex].name}!</p>
              <p className="text-base sm:text-lg text-purple-600 font-semibold mb-6">🎨 You earned 20 points & a sticker! 🎨</p>
              
              <Button 
                onClick={nextPage} 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-8 py-6 rounded-xl shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Next Picture
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

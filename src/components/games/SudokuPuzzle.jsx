import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Repeat, Award, Grid3X3, Eye, EyeOff, Zap, Trophy, Star, Timer, Target, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../SoundManager';

const SudokuPuzzle = ({ onComplete }) => {
  const { playSound } = useNotifications();
  const [puzzle, setPuzzle] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [solution, setSolution] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [initialPuzzle, setInitialPuzzle] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [selectedCell, setSelectedCell] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [difficulty, setDifficulty] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [perfectCells, setPerfectCells] = useState(0);

  useEffect(() => {
    let timer;
    if (startTime && !isCompleted) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, isCompleted]);

  const generateCompleteSudoku = () => {
    const grid = Array(9).fill().map(() => Array(9).fill(0));
    
    const isValid = (grid, row, col, num) => {
      for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
      }
      for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
      }
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          if (grid[r][c] === num) return false;
        }
      }
      return true;
    };
    
    const solve = (grid) => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === 0) {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            for (const num of numbers) {
              if (isValid(grid, row, col, num)) {
                grid[row][col] = num;
                if (solve(grid)) return true;
                grid[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };
    
    solve(grid);
    return grid;
  };

  const createPuzzle = (solution, difficulty) => {
    const puzzle = solution.map(row => [...row]);
    const difficultyLevels = {
      easy: 35,
      medium: 45,
      hard: 55
    };
    
    const cellsToRemove = difficultyLevels[difficulty];
    let removed = 0;
    
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        removed++;
      }
    }
    
    return puzzle;
  };

  const generateNewPuzzle = useCallback((diff) => {
    const newSolution = generateCompleteSudoku();
    const newPuzzle = createPuzzle(newSolution, diff);
    
    setSolution(newSolution);
    setPuzzle(newPuzzle);
    setInitialPuzzle(newPuzzle.map(row => [...row]));
    setSelectedCell(null);
    setMistakes(0);
    setIsCompleted(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setScore(0);
    setStreak(0);
    setPerfectCells(0);
    playSound('notification');
  }, [playSound]);

  const handleCellClick = (row, col) => {
    if (initialPuzzle[row][col] === 0 && !isCompleted) {
      setSelectedCell([row, col]);
      playSound('click');
    }
  };

  const handleNumberInput = (num) => {
    if (!selectedCell) return;
    
    const [row, col] = selectedCell;
    if (initialPuzzle[row][col] !== 0) return;
    
    const newPuzzle = [...puzzle];
    newPuzzle[row][col] = num;
    
    if (solution[row][col] === num && num !== 0) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setPerfectCells(prev => prev + 1);
      const points = 10 * (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2) * (1 + Math.floor(newStreak / 3));
      setScore(prev => prev + Math.round(points));
      playSound('success');
    } else if (solution[row][col] !== num && num !== 0) {
      setMistakes(prev => prev + 1);
      setStreak(0);
      playSound('error');
    }
    
    setPuzzle(newPuzzle);
    
    const isComplete = newPuzzle.every((row, r) => 
      row.every((cell, c) => cell === solution[r][c])
    );
    
    if (isComplete) {
      setIsCompleted(true);
      playSound('achievement');
      
      (async () => {
        try {
          const { base44 } = await import('@/api/base44Client');
          await base44.functions.invoke('updateMindfulStreak', {
            item_key: 'sudoku',
            item_type: 'game',
            duration_seconds: elapsedTime
          });
        } catch (error) {
          console.error('Error updating streak:', error);
        }
      })();
      
      if (onComplete) onComplete();
    }
  };

  const getPossibleNumbers = (row, col) => {
    const possible = [];
    for (let num = 1; num <= 9; num++) {
      let valid = true;
      
      for (let c = 0; c < 9; c++) {
        if (puzzle[row][c] === num) {
          valid = false;
          break;
        }
      }
      
      if (valid) {
        for (let r = 0; r < 9; r++) {
          if (puzzle[r][col] === num) {
            valid = false;
            break;
          }
        }
      }
      
      if (valid) {
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
          for (let c = boxCol; c < boxCol + 3; c++) {
            if (puzzle[r][c] === num) {
              valid = false;
              break;
            }
          }
          if (!valid) break;
        }
      }
      
      if (valid) possible.push(num);
    }
    return possible;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!difficulty) {
    return (
      <div className="flex flex-col items-center p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-2xl max-w-4xl mx-auto relative overflow-hidden min-h-[500px]">
        <motion.div className="absolute top-0 left-0 w-40 h-40 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.3, 1], x: [0, 50, 0], y: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center relative z-10 w-full py-6">
          <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl relative">
            <Grid3X3 className="w-10 h-10 text-white" />
            <motion.div className="absolute inset-0 rounded-full bg-white/30" animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
          </motion.div>
          
          <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Sudoku Challenge
          </h3>
          <p className="text-gray-700 mb-2 text-base">Classic logic puzzle for cognitive enhancement</p>
          <p className="text-sm text-indigo-600 mb-6 flex items-center justify-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="font-semibold">Boosts logical thinking and problem-solving skills</span>
          </p>
          
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-indigo-200 mb-6 max-w-md mx-auto">
            <CardContent className="p-4">
              <h4 className="font-bold text-indigo-900 mb-2 flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Cognitive Benefits
              </h4>
              <div className="grid grid-cols-2 gap-2 text-left text-xs text-gray-700">
                {[
                  { icon: "🧠", text: "Memory enhancement" },
                  { icon: "🎯", text: "Focus improvement" },
                  { icon: "⚡", text: "Quick thinking" },
                  { icon: "✨", text: "Pattern recognition" }
                ].map((benefit, idx) => (
                  <motion.div key={idx} className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                    <span className="text-lg">{benefit.icon}</span>
                    <span>{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { level: 'easy', label: 'Beginner', desc: '35 clues', color: 'from-green-400 to-emerald-500', icon: Target },
              { level: 'medium', label: 'Medium', desc: '45 clues', color: 'from-blue-400 to-purple-500', icon: Zap },
              { level: 'hard', label: 'Expert', desc: '55 clues', color: 'from-orange-400 to-red-500', icon: Trophy }
            ].map(({ level, label, desc, color, icon: Icon }, idx) => (
              <motion.div key={level} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                <Card className="cursor-pointer hover:shadow-2xl transition-all bg-white/90 backdrop-blur-sm border-2 border-indigo-200 hover:border-indigo-400"
                  onClick={() => {
                    setDifficulty(level);
                    generateNewPuzzle(level);
                  }}>
                  <CardContent className="p-4 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-base font-bold text-gray-800 mb-1">{label}</h4>
                    <p className="text-indigo-600 font-semibold text-sm">{desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
      <motion.div className="absolute top-0 right-0 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />

      <AnimatePresence mode="wait">
        {isCompleted ? (
          <motion.div key="completed" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="text-center relative z-10">
            <Card className="bg-gradient-to-br from-indigo-100 to-purple-100 border-4 border-indigo-300 shadow-2xl">
              <CardContent className="p-6">
                <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: 3 }}>
                  <Award className="w-20 h-20 text-yellow-500 mx-auto mb-3" />
                </motion.div>
                <h2 className="text-3xl font-bold text-indigo-900 mb-2">Puzzle Complete! 🎉</h2>
                <p className="text-gray-600 mb-4">You solved the {difficulty} puzzle!</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Score", value: score, color: "indigo" },
                    { label: "Time", value: formatTime(elapsedTime), color: "blue" },
                    { label: "Mistakes", value: mistakes, color: "red" },
                    { label: "Perfect", value: perfectCells, color: "green" }
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/70 rounded-lg p-3">
                      <p className={`text-xl font-bold text-${stat.color}-700`}>{stat.value}</p>
                      <p className="text-xs text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-center">
                  <Button onClick={() => generateNewPuzzle(difficulty)} className="bg-gradient-to-r from-indigo-500 to-purple-500">
                    <Repeat className="w-4 h-4 mr-2" />Play Again
                  </Button>
                  <Button onClick={() => setDifficulty(null)} variant="outline">Change Difficulty</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1">
                  <Trophy className="w-3 h-3 mr-1" />{score}
                </Badge>
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1">
                  <Timer className="w-3 h-3 mr-1" />{formatTime(elapsedTime)}
                </Badge>
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1">
                  ❌ {mistakes}
                </Badge>
                {streak > 2 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 animate-pulse">
                      🔥 {streak}
                    </Badge>
                  </motion.div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => setShowHints(!showHints)} variant="outline" size="sm">
                  {showHints ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button onClick={() => generateNewPuzzle(difficulty)} variant="outline" size="sm">
                  <Repeat className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-9 gap-0 border-4 border-indigo-600 mb-4 bg-white rounded-xl overflow-hidden shadow-2xl mx-auto" style={{ maxWidth: '450px' }}>
              {puzzle.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const isInitial = initialPuzzle[rowIndex][colIndex] !== 0;
                  const isSelected = selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex;
                  const isCorrect = !isInitial && cell !== 0 && solution[rowIndex][colIndex] === cell;
                  const isWrong = !isInitial && cell !== 0 && solution[rowIndex][colIndex] !== cell;
                  
                  let className = "aspect-square flex items-center justify-center text-base md:text-lg font-bold cursor-pointer transition-all border border-gray-300 ";
                  
                  if (rowIndex % 3 === 0) className += "border-t-2 border-t-indigo-600 ";
                  if (colIndex % 3 === 0) className += "border-l-2 border-l-indigo-600 ";
                  if (rowIndex === 8) className += "border-b-2 border-b-indigo-600 ";
                  if (colIndex === 8) className += "border-r-2 border-r-indigo-600 ";
                  
                  if (isInitial) {
                    className += "bg-indigo-50 text-indigo-900 font-bold ";
                  } else if (isSelected) {
                    className += "bg-blue-200 text-blue-900 ring-2 ring-blue-500 ";
                  } else if (isCorrect) {
                    className += "bg-green-50 text-green-700 ";
                  } else if (isWrong) {
                    className += "bg-red-50 text-red-700 animate-pulse ";
                  } else {
                    className += "bg-white hover:bg-indigo-50 ";
                  }
                  
                  return (
                    <motion.div key={`${rowIndex}-${colIndex}`} className={className}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      {cell !== 0 ? cell : 
                        (showHints && isSelected) ?
                          <div className="text-[10px] text-indigo-400 font-normal">
                            {getPossibleNumbers(rowIndex, colIndex).slice(0, 4).join('')}
                          </div> : ''
                      }
                    </motion.div>
                  );
                })
              )}
            </div>

            <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <motion.div key={num} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button onClick={() => handleNumberInput(num)} disabled={!selectedCell}
                    className="w-full h-14 text-xl font-bold bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                    {num}
                  </Button>
                </motion.div>
              ))}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button onClick={() => handleNumberInput(0)} disabled={!selectedCell} variant="outline"
                  className="w-full h-14 font-bold border-2 border-indigo-300">
                  Clear
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SudokuPuzzle;
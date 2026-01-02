import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ColorMatch from '@/components/games/ColorMatch';
import SequenceMemory from '@/components/games/SequenceMemory';
import FidgetBubbles from '@/components/games/FidgetBubbles';
import SudokuPuzzle from '@/components/games/SudokuPuzzle';
import SimpleRacing3D from '@/components/games/SimpleRacing3D';

const GAMES = [
  { id: 'color', name: 'Color Match', icon: '🎨', color: 'from-blue-500 to-indigo-500', component: ColorMatch },
  { id: 'sequence', name: 'Sequence Memory', icon: '🧠', color: 'from-purple-500 to-pink-500', component: SequenceMemory },
  { id: 'bubbles', name: 'Fidget Bubbles', icon: '🫧', color: 'from-cyan-500 to-blue-500', component: FidgetBubbles },
  { id: 'sudoku', name: 'Sudoku Puzzle', icon: '🔢', color: 'from-indigo-500 to-purple-600', component: SudokuPuzzle },
  { id: 'racing', name: '3D Speed Racing', icon: '🏎️', color: 'from-red-500 to-orange-600', component: SimpleRacing3D }
];

export default function MindfulGames() {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(null);

  if (selectedGame) {
    const GameComponent = selectedGame.component;
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => setSelectedGame(null)}
            className="mb-6 bg-white/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
          <GameComponent />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to={createPageUrl('MindfulnessHub')}>
            <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Mindfulness Hub
            </Button>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Mindful Games & Activities
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Enhance focus, memory, and mindfulness through engaging activities
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {GAMES.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                onClick={() => setSelectedGame(game)}
                className="cursor-pointer hover:shadow-2xl transition-all border-2 hover:border-purple-400 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-6 md:p-8 text-center">
                  <motion.div 
                    className={`w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br ${game.color} flex items-center justify-center shadow-lg`}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-4xl md:text-5xl">{game.icon}</span>
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{game.name}</h3>
                  <Button className={`w-full bg-gradient-to-r ${game.color} text-white hover:shadow-lg transition-all`}>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
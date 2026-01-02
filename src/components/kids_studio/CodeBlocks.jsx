import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Trash2, Save, Code, RotateCcw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const CODE_BLOCKS = [
  { 
    id: 'move_right', 
    label: 'Move Right ➡️', 
    color: 'from-blue-400 to-blue-600',
    action: (char) => ({ x: char.x + 50, y: char.y })
  },
  { 
    id: 'move_left', 
    label: 'Move Left ⬅️', 
    color: 'from-green-400 to-green-600',
    action: (char) => ({ x: char.x - 50, y: char.y })
  },
  { 
    id: 'move_up', 
    label: 'Move Up ⬆️', 
    color: 'from-purple-400 to-purple-600',
    action: (char) => ({ x: char.x, y: char.y - 50 })
  },
  { 
    id: 'move_down', 
    label: 'Move Down ⬇️', 
    color: 'from-orange-400 to-orange-600',
    action: (char) => ({ x: char.x, y: char.y + 50 })
  },
  { 
    id: 'jump', 
    label: 'Jump! 🦘', 
    color: 'from-pink-400 to-pink-600',
    action: (char) => ({ x: char.x, y: char.y, jump: true })
  },
  { 
    id: 'spin', 
    label: 'Spin 🔄', 
    color: 'from-yellow-400 to-orange-500',
    action: (char) => ({ x: char.x, y: char.y, spin: true })
  }
];

export default function CodeBlocks({ onComplete, childName = "friend" }) {
  const [program, setProgram] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [characterPos, setCharacterPos] = useState({ x: 150, y: 150 });
  const [currentStep, setCurrentStep] = useState(0);

  const addBlock = (block) => {
    setProgram([...program, { ...block, id: Date.now() }]);
    toast.success('Block added! 🎯');
  };

  const removeBlock = (index) => {
    setProgram(program.filter((_, i) => i !== index));
  };

  const runProgram = async () => {
    if (program.length === 0) {
      toast.error('Add code blocks first!');
      return;
    }

    setIsRunning(true);
    setCurrentStep(0);
    
    let pos = { x: 150, y: 150 };

    for (let i = 0; i < program.length; i++) {
      setCurrentStep(i);
      const block = program[i];
      const newPos = block.action(pos);
      
      setCharacterPos(newPos);
      
      if (newPos.jump) {
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (newPos.spin) {
        await new Promise(resolve => setTimeout(resolve, 800));
      } else {
        await new Promise(resolve => setTimeout(resolve, 600));
      }
      
      pos = { x: newPos.x, y: newPos.y };
    }

    setIsRunning(false);
    setCurrentStep(-1);
    toast.success('Program complete! 🎉');
  };

  const resetProgram = () => {
    setProgram([]);
    setCharacterPos({ x: 150, y: 150 });
    setCurrentStep(-1);
    setIsRunning(false);
    toast.success('Ready for a new program!');
  };

  const saveProgram = () => {
    if (program.length < 3) {
      toast.error('Add at least 3 blocks before saving!');
      return;
    }

    toast.success('Code saved! You\'re a programmer! 👨‍💻');
    if (onComplete) onComplete(20, null);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <Card className="border-4 border-green-300 bg-gradient-to-br from-green-50 to-blue-50">
        <CardContent className="p-6 space-y-6">
          <h3 className="text-3xl font-bold text-center text-green-800 flex items-center justify-center gap-3">
            <Code className="w-8 h-8" />
            Code Blocks
            <Sparkles className="w-8 h-8" />
          </h3>

          <p className="text-center text-gray-700 font-semibold">
            Drag blocks to make the robot move! 🤖
          </p>

          {/* Animation Stage */}
          <div className="h-80 bg-gradient-to-br from-sky-200 to-blue-300 rounded-2xl relative overflow-hidden border-4 border-white shadow-xl">
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20">
              {[...Array(36)].map((_, i) => (
                <div key={i} className="border border-white/50" />
              ))}
            </div>
            
            <motion.div
              animate={{
                x: characterPos.x,
                y: characterPos.y,
                rotate: characterPos.spin ? 360 : 0,
                scale: characterPos.jump ? [1, 1.3, 1] : 1
              }}
              transition={{ duration: 0.5 }}
              className="absolute text-6xl drop-shadow-2xl"
              style={{ left: 0, top: 0 }}
            >
              🤖
            </motion.div>

            <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg p-2">
              <div className="text-xs text-gray-600">Position: ({Math.round(characterPos.x)}, {Math.round(characterPos.y)})</div>
            </div>
          </div>

          {/* Code Blocks Palette */}
          <div>
            <h4 className="font-bold text-green-800 mb-3 text-lg">Pick Code Blocks:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CODE_BLOCKS.map((block) => (
                <button
                  key={block.id}
                  onClick={() => addBlock(block)}
                  disabled={isRunning}
                  className={`p-4 rounded-xl bg-gradient-to-r ${block.color} text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50`}
                >
                  {block.label}
                </button>
              ))}
            </div>
          </div>

          {/* Program Display */}
          {program.length > 0 && (
            <div className="bg-white rounded-xl p-4 border-2 border-green-300">
              <h4 className="font-bold text-green-800 mb-3">Your Code:</h4>
              <div className="space-y-2">
                {program.map((block, idx) => (
                  <motion.div
                    key={block.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ 
                      x: 0, 
                      opacity: 1,
                      scale: currentStep === idx ? 1.05 : 1,
                      backgroundColor: currentStep === idx ? '#fef3c7' : '#ffffff'
                    }}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                      currentStep === idx ? 'border-yellow-400' : 'border-gray-200'
                    }`}
                  >
                    <div className="font-mono font-bold text-gray-500">{idx + 1}.</div>
                    <div className={`flex-1 py-2 px-4 rounded-lg bg-gradient-to-r ${block.color} text-white font-bold`}>
                      {block.label}
                    </div>
                    <button
                      onClick={() => removeBlock(idx)}
                      disabled={isRunning}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              onClick={runProgram}
              disabled={program.length === 0 || isRunning}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4"
            >
              <Play className="w-5 h-5 mr-2" />
              Run Code
            </Button>
            <Button
              onClick={resetProgram}
              disabled={program.length === 0 || isRunning}
              variant="outline"
              className="border-red-400 hover:bg-red-50 py-4"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
            <Button
              onClick={() => setProgram([])}
              disabled={program.length === 0 || isRunning}
              variant="outline"
              className="py-4"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Clear
            </Button>
            <Button
              onClick={saveProgram}
              disabled={program.length < 3}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4"
            >
              <Save className="w-5 h-5 mr-2" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
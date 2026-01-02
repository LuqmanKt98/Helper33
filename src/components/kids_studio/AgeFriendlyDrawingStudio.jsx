import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Palette, Eraser, Trash2, Download, Sparkles, Wand2, Undo } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function AgeFriendlyDrawingStudio({ onComplete, childAge = 5 }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#FF6B6B');
  const [brushSize, setBrushSize] = useState(8);
  const [mode, setMode] = useState('draw'); // 'draw' or 'erase'
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [generatingAI, setGeneratingAI] = useState(false);

  const colors = [
    { name: 'Red', value: '#FF6B6B', emoji: '❤️' },
    { name: 'Orange', value: '#FF9E5C', emoji: '🧡' },
    { name: 'Yellow', value: '#FFD93D', emoji: '💛' },
    { name: 'Green', value: '#6BCF7F', emoji: '💚' },
    { name: 'Blue', value: '#4D96FF', emoji: '💙' },
    { name: 'Purple', value: '#B565D8', emoji: '💜' },
    { name: 'Pink', value: '#FF6EC7', emoji: '💗' },
    { name: 'Brown', value: '#8B5A3C', emoji: '🤎' },
    { name: 'Black', value: '#2C2C2C', emoji: '🖤' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    setIsDrawing(true);
    ctx.beginPath();
    
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    if (mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 3;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL();
      setCanvasHistory([...canvasHistory, imageData]);
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setCanvasHistory([]);
    toast.success('Canvas cleared! Start fresh!');
  };

  const undo = () => {
    if (canvasHistory.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const previousState = canvasHistory[canvasHistory.length - 2];

    if (previousState) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = previousState;
    } else {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    setCanvasHistory(canvasHistory.slice(0, -1));
    toast.success('Undo!');
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `my-drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    confetti({ particleCount: 100, spread: 70 });
    toast.success('Drawing saved! 🎨');
    if (onComplete) onComplete(10);
  };

  const addAIMagic = async () => {
    const canvas = canvasRef.current;
    const imageDataUrl = canvas.toDataURL();

    setGeneratingAI(true);
    
    try {
      toast.info('Adding AI magic to your drawing... ✨');
      
      // This is a placeholder - would integrate with an actual AI image enhancement API
      // For now, just celebrate and award points
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 }
        });
        toast.success('Your drawing is magical! 🌟');
        setGeneratingAI(false);
        if (onComplete) onComplete(15);
      }, 2000);
      
    } catch (error) {
      toast.error('AI magic failed. But your drawing is still amazing!');
      setGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl">🎨</div>
                <div>
                  <h3 className="text-xl font-bold">Drawing Studio</h3>
                  <p className="text-sm text-white/90">Create amazing art!</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{canvasHistory.length}</div>
                  <div className="text-xs">Strokes</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Color Palette */}
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            Pick Your Colors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            {colors.map((color) => (
              <motion.button
                key={color.value}
                onClick={() => {
                  setCurrentColor(color.value);
                  setMode('draw');
                }}
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                className={`relative w-14 h-14 rounded-full transition-all ${
                  currentColor === color.value && mode === 'draw'
                    ? 'ring-4 ring-purple-400 scale-110'
                    : ''
                }`}
                style={{ backgroundColor: color.value }}
              >
                {currentColor === color.value && mode === 'draw' && (
                  <motion.div
                    className="absolute -inset-1 rounded-full border-3 border-purple-500"
                    layoutId="color-selector"
                  />
                )}
                <span className="text-xl">{color.emoji}</span>
              </motion.button>
            ))}
          </div>

          {/* Brush Size */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Brush Size: {brushSize}px</p>
            <input
              type="range"
              min="2"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Tools */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setMode('draw')}
              variant={mode === 'draw' ? 'default' : 'outline'}
              size="sm"
              className={mode === 'draw' ? 'bg-purple-600' : ''}
            >
              <Palette className="w-4 h-4 mr-2" />
              Draw
            </Button>
            <Button
              onClick={() => setMode('erase')}
              variant={mode === 'erase' ? 'default' : 'outline'}
              size="sm"
              className={mode === 'erase' ? 'bg-gray-600' : ''}
            >
              <Eraser className="w-4 h-4 mr-2" />
              Erase
            </Button>
            <Button
              onClick={undo}
              variant="outline"
              size="sm"
              disabled={canvasHistory.length === 0}
            >
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button
              onClick={clearCanvas}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="bg-white border-4 border-purple-300 shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-96 cursor-crosshair touch-none"
            style={{ touchAction: 'none' }}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={downloadDrawing}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Save Drawing
        </Button>
        <Button
          onClick={addAIMagic}
          disabled={generatingAI}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
        >
          {generatingAI ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Adding Magic...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Add AI Magic
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
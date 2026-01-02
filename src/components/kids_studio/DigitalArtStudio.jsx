import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { 
  Palette, Eraser, Trash2, Save, Wand2, Sparkles, Loader2, Undo, Redo, Circle, Square, Star 
} from 'lucide-react';
import { toast } from 'sonner';

const DRAWING_TOOLS = {
  brush: { icon: Palette, label: 'Brush', cursor: 'crosshair' },
  eraser: { icon: Eraser, label: 'Eraser', cursor: 'not-allowed' },
  circle: { icon: Circle, label: 'Circle', cursor: 'crosshair' },
  square: { icon: Square, label: 'Square', cursor: 'crosshair' },
  star: { icon: Star, label: 'Star', cursor: 'crosshair' }
};

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#FFB6C1', '#90EE90',
  '#000000', '#FFFFFF'
];

const AI_STYLES = [
  { name: 'Rainbow Magic', prompt: 'vibrant rainbow colors, magical, whimsical', emoji: '🌈' },
  { name: 'Cartoon Fun', prompt: 'bright cartoon style, fun and playful', emoji: '🎨' },
  { name: 'Sparkly Stars', prompt: 'glitter and stars, dreamy, magical', emoji: '✨' },
  { name: 'Nature Colors', prompt: 'natural colors, soft and calming', emoji: '🌿' },
  { name: 'Neon Glow', prompt: 'neon colors, glowing, vibrant', emoji: '💫' }
];

export default function DigitalArtStudio({ onComplete, childName = "friend", childAge = 6 }) {
  const canvasRef = useRef(null);
  const [currentTool, setCurrentTool] = useState('brush');
  const [brushColor, setBrushColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [isApplyingStyle, setIsApplyingStyle] = useState(false);
  const [styledImage, setStyledImage] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyStep - 1];
      setHistoryStep(historyStep - 1);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyStep + 1];
      setHistoryStep(historyStep + 1);
    }
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const coords = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    
    if (currentTool === 'brush') {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const coords = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');

    if (currentTool === 'brush' || currentTool === 'eraser') {
      ctx.strokeStyle = currentTool === 'brush' ? brushColor : '#FFFFFF';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const ctx = canvasRef.current.getContext('2d');
      ctx.globalCompositeOperation = 'source-over';
      saveToHistory();
    }
  };

  const drawShape = (shape, x, y) => {
    const ctx = canvasRef.current.getContext('2d');
    const size = brushSize * 10;
    
    ctx.fillStyle = brushColor;
    ctx.beginPath();
    
    if (shape === 'circle') {
      ctx.arc(x, y, size, 0, Math.PI * 2);
    } else if (shape === 'square') {
      ctx.rect(x - size, y - size, size * 2, size * 2);
    } else if (shape === 'star') {
      drawStar(ctx, x, y, size, 5, 0.5);
    }
    
    ctx.fill();
    saveToHistory();
  };

  const drawStar = (ctx, cx, cy, outerRadius, points, innerRadiusRatio) => {
    const innerRadius = outerRadius * innerRadiusRatio;
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / points;

    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < points; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  const handleCanvasClick = (e) => {
    if (['circle', 'square', 'star'].includes(currentTool)) {
      const coords = getCoordinates(e);
      drawShape(currentTool, coords.x, coords.y);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
    toast.success('Canvas cleared! Start fresh! 🎨');
  };

  const applyAIStyle = async (style) => {
    const canvas = canvasRef.current;
    const drawingDataUrl = canvas.toDataURL('image/png');
    
    setIsApplyingStyle(true);

    try {
      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Transform this child's drawing into ${style.prompt} style. Keep the same content but enhance it beautifully in the style described. Make it magical and age-appropriate for ${childAge} year old.`
      });

      setStyledImage(response.url);
      toast.success(`✨ ${style.name} style applied!`);
    } catch (error) {
      console.error('Error applying AI style:', error);
      toast.error('Could not apply style. Your drawing is still beautiful!');
    } finally {
      setIsApplyingStyle(false);
    }
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    const dataUrl = styledImage || canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = `${childName}_artwork_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    toast.success('Artwork saved! 🎨');
    if (onComplete) onComplete(15, null);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <Card className="border-4 border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50">
        <CardContent className="p-6 space-y-6">
          <h3 className="text-3xl font-bold text-center text-purple-800 flex items-center justify-center gap-3">
            <Palette className="w-8 h-8" />
            Digital Art Studio
            <Sparkles className="w-8 h-8" />
          </h3>

          {/* Tools */}
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(DRAWING_TOOLS).map(([key, tool]) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={key}
                  onClick={() => setCurrentTool(key)}
                  variant={currentTool === key ? 'default' : 'outline'}
                  className={currentTool === key ? 'bg-purple-600 text-white' : ''}
                >
                  <Icon className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{tool.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Color Palette */}
          <div className="flex flex-wrap gap-2 justify-center">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                className={`w-10 h-10 rounded-full border-4 ${
                  brushColor === color ? 'border-purple-600 scale-110' : 'border-gray-300'
                } transition-transform`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Brush Size */}
          <div>
            <label className="block text-sm font-bold text-purple-700 mb-2">
              Brush Size: {brushSize}px
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Canvas */}
          <div className="bg-white rounded-xl p-4 border-4 border-purple-300 shadow-lg">
            {styledImage ? (
              <div className="relative">
                <img src={styledImage} alt="Styled artwork" className="w-full rounded-lg" />
                <Button
                  onClick={() => setStyledImage(null)}
                  className="absolute top-2 right-2 bg-purple-600"
                  size="sm"
                >
                  Edit Original
                </Button>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onClick={handleCanvasClick}
                style={{ cursor: DRAWING_TOOLS[currentTool]?.cursor }}
              />
            )}
          </div>

          {/* AI Style Transfer - Only show if there's a drawing */}
          {!styledImage && history.length > 1 && (
            <div className="space-y-3">
              <h4 className="font-bold text-purple-800 text-center text-lg flex items-center justify-center gap-2">
                <Wand2 className="w-5 h-5" />
                Add AI Magic to Your Art!
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AI_STYLES.map((style) => (
                  <Button
                    key={style.name}
                    onClick={() => applyAIStyle(style)}
                    disabled={isApplyingStyle}
                    variant="outline"
                    className="border-2 border-purple-300 hover:bg-purple-50 flex-col h-auto py-3"
                  >
                    <div className="text-3xl mb-1">{style.emoji}</div>
                    <div className="text-xs font-bold">{style.name}</div>
                  </Button>
                ))}
              </div>
              {isApplyingStyle && (
                <div className="text-center text-purple-600 font-bold flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding magic to your art...
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button onClick={undo} disabled={historyStep <= 0} variant="outline">
              <Undo className="w-4 h-4 mr-1" />
              Undo
            </Button>
            <Button onClick={redo} disabled={historyStep >= history.length - 1} variant="outline">
              <Redo className="w-4 h-4 mr-1" />
              Redo
            </Button>
            <Button onClick={clearCanvas} variant="outline" className="border-red-400 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
            <Button
              onClick={saveDrawing}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold"
            >
              <Save className="w-4 h-4 mr-1" />
              Save Art
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
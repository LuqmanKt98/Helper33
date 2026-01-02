import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Palette,
  Eraser,
  RotateCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  Paintbrush,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  Wand2
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

// All 20 coloring pages from "My Mindful Journey" PDF with their quotes
const COLORING_PAGES = [
  {
    id: 'page1',
    name: 'Freedom of Mind',
    category: 'Floral',
    quote: { quote: "If it's out of your hands, it deserves freedom from your mind too.", author: "Ivan Nuru" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/b58d76dc7f24b4736c668416482ccd18f068fddf8423fcc0156c3c38f1dd9fe0.jpg'
  },
  {
    id: 'page2',
    name: 'Self Talk',
    category: 'Mandala',
    quote: { quote: "The way you speak to yourself matters.", author: "Unknown" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/1b7372621680fba22fbeb6e862ea9ea42d14759b504204e163eabce50e21e179.jpg'
  },
  {
    id: 'page3',
    name: 'Transformation',
    category: 'Floral',
    quote: { quote: "We cannot become what we want by remaining what we are.", author: "Max Depree" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/99c2250165573d620726cd6222a759752de2efcec90b14bc841055aeccc7021e.jpg'
  },
  {
    id: 'page4',
    name: 'Be Present',
    category: 'Mandala',
    quote: { quote: "Wherever you are, be there totally.", author: "Eckhart Tolle" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/958b306e5be0c4013b67c4b89d425444c8913aef36c95e09b444e82b24183bc5.jpg'
  },
  {
    id: 'page5',
    name: 'Mindful Choices',
    category: 'Mandala',
    quote: { quote: "Mindfulness gives you time. Time gives you choices. Choices, skillfully made, lead to freedom.", author: "Bhante Henepola Gunaratana" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/751a5f4597fd3804c6b0a739678f33a090a66a8004d6970b0030cfb57978868e.jpg'
  },
  {
    id: 'page6',
    name: 'This Day',
    category: 'Mandala',
    quote: { quote: "Nothing is worth more than this day. You cannot relive yesterday. Tomorrow is still beyond your reach.", author: "Johann Wolfgang von Goethe" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/0d3f4bd2e82517a2eff4dede45d98258e646662661c526cd6c7099b70c38c6c7.jpg'
  },
  {
    id: 'page7',
    name: 'You Are The Sky',
    category: 'Nature',
    quote: { quote: "You are the sky. Everything else is just the weather.", author: "Pema Chodron" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/9d63f90e834f78fdb857b685f1bfb83a893261207b7e0dce9211e0fcc600c73f.jpg'
  },
  {
    id: 'page8',
    name: 'Life Dance',
    category: 'Mandala',
    quote: { quote: "Life is a dance. Mindfulness is witnessing that dance.", author: "Amit Ray" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/f6f7ebf2fdf5e763e43262562ee779b039fd19faff18ccee49a019b6e2ed3b41.jpg'
  },
  {
    id: 'page9',
    name: 'Present Moment',
    category: 'Mandala',
    quote: { quote: "How we pay attention to the present moment largely determines the character of our experience, and therefore, the quality of our lives.", author: "Sam Harris" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/635a5df10f21c6ec1c651985d48930d21aa2e499c46b6a7a6066f85693ea9e39.jpg'
  },
  {
    id: 'page10',
    name: 'Healthy Choices',
    category: 'Floral',
    quote: { quote: "Training your mind to be in the present moment is the number one key to making healthier choices.", author: "Susan Albers" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/b5d8b29243617d06c55a187d2f25bfe1d49854ce7744bdfd68f673ba0a289dab.jpg'
  },
  {
    id: 'page11',
    name: 'Inner Sanctuary',
    category: 'Floral',
    quote: { quote: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/01aede3b4ebd4a410cc64f765729a5cd93f010ea0ff898ba34239c75ce9e7ad5.jpg'
  },
  {
    id: 'page12',
    name: 'Full Attention',
    category: 'Floral',
    quote: { quote: "Mindfulness is deliberately paying full attention to what is happening around you– in your body, heart and mind.", author: "Jan Chozen Bays" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/3fe2ad90d6d5dedf5845f23280ee6f2b6eb7874110c31c7253a8bcc8b1ab9ef3.jpg'
  },
  {
    id: 'page13',
    name: 'Breathing Anchor',
    category: 'Mandala',
    quote: { quote: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", author: "Thich Nhat Hanh" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/5ae9095708654b30ae4cdef8fd45e6de9913f3d06442710513c15f04a84558e1.jpg'
  },
  {
    id: 'page14',
    name: 'All You Have',
    category: 'Mandala',
    quote: { quote: "Realize deeply that the present moment is all you have.", author: "Eckhart Tolle" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/51743665b3a760b94da2a8ae0b9aadcfa9a4f3c0a17ea7eb8f658375ed4d200a.jpg'
  },
  {
    id: 'page15',
    name: 'Be Where You Are',
    category: 'Floral',
    quote: { quote: "Be where you are, not where you think you should be.", author: "Unknown" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/dcef78d416411f46b8a96f801a0f5d83060594ba2802235cb98220c1ab3debb3.jpg'
  },
  {
    id: 'page16',
    name: 'Climb Mountains',
    category: 'Floral',
    quote: { quote: "These mountains that you are carrying, you were only supposed to climb.", author: "Najwa Zebian" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/efebe93fd8b95b44952ef3d6fe74661b857634fe2bc3c1b87d97f83d7cbae368.jpg'
  },
  {
    id: 'page17',
    name: 'Calm Mind',
    category: 'Mandala',
    quote: { quote: "Your calm mind is the ultimate weapon against your challenges.", author: "Bryant McGill" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/fa02cf83a21488e07a82cf48f84d6ad0cdb102eee22744791cbe9818a015b8ce.jpg'
  },
  {
    id: 'page18',
    name: 'Open Mind',
    category: 'Floral',
    quote: { quote: "The mind that opens to a new idea never returns to its original size.", author: "Albert Einstein" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/1e8de6748379c0e0d593c3a464559bfad90fa4aef7d07ec1e70e51acfc6fab51.jpg'
  },
  {
    id: 'page19',
    name: 'Still Waters',
    category: 'Mandala',
    quote: { quote: "The still waters of a lake reflect the beauty around it. When the mind is still, the beauty of the self is reflected.", author: "Vanda Scaravelli" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/a5857be1af81ef10300a92944db448d4d74c6077c9f3a19b9ff8960818e95834.jpg'
  },
  {
    id: 'page20',
    name: 'Time to Relax',
    category: 'Mandala',
    quote: { quote: "Just when you feel you have no time to relax, know this is the moment you most need to relax.", author: "Matt Haig" },
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/images/84d23b882cad2dc7781b98573d85aa2bada5b7c8810740412a4a9f55d4010142.jpg'
  }
];

const COLOR_PALETTES = {
  calm: ['#E8F5E9', '#B2DFDB', '#80CBC4', '#4DB6AC', '#26A69A', '#009688', '#00897B', '#00796B'],
  warm: ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726', '#FF9800', '#FB8C00', '#F57C00'],
  cool: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2'],
  sunset: ['#FCE4EC', '#F8BBD9', '#F48FB1', '#F06292', '#EC407A', '#E91E63', '#D81B60', '#C2185B'],
  forest: ['#F1F8E9', '#DCEDC8', '#C5E1A5', '#AED581', '#9CCC65', '#8BC34A', '#7CB342', '#689F38'],
  ocean: ['#E0F7FA', '#B2EBF2', '#80DEEA', '#4DD0E1', '#26C6DA', '#00BCD4', '#00ACC1', '#0097A7'],
  lavender: ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC', '#9C27B0', '#8E24AA', '#7B1FA2'],
  earth: ['#EFEBE9', '#D7CCC8', '#BCAAA4', '#A1887F', '#8D6E63', '#795548', '#6D4C41', '#5D4037']
};

export default function InteractiveColoringBook({ onClose }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('#4DB6AC');
  const [activePalette, setActivePalette] = useState('calm');
  const [brushSize, setBrushSize] = useState(15);
  const [coloredAreas, setColoredAreas] = useState({});
  const [isErasing, setIsErasing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedImages, setGeneratedImages] = useState({});
  const baseImageRef = useRef(null);

  const currentDesign = COLORING_PAGES[currentPage];
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // Initialize canvas with image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentDesign.imageUrl) return;
    
    setImageLoaded(false);
    setLoadError(false);
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Set canvas size based on image aspect ratio
      const maxSize = 550;
      const aspectRatio = img.width / img.height;
      
      if (aspectRatio > 1) {
        canvas.width = maxSize;
        canvas.height = maxSize / aspectRatio;
      } else {
        canvas.height = maxSize;
        canvas.width = maxSize * aspectRatio;
      }
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Store base image for reset
      baseImageRef.current = img;
      setImageLoaded(true);
    };
    
    img.onerror = () => {
      // Check if we have a generated AI image for this page
      if (generatedImages[currentDesign.id]) {
        img.src = generatedImages[currentDesign.id];
        return;
      }
      setLoadError(true);
      // Fallback: create a placeholder canvas
      canvas.width = 500;
      canvas.height = 600;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Click "Generate with AI" to create a coloring page', canvas.width/2, canvas.height/2);
    };
    
    // Use generated image if available, otherwise use original URL
    const imageUrl = generatedImages[currentDesign.id] || currentDesign.imageUrl;
    img.src = imageUrl;
  }, [currentPage, currentDesign.imageUrl, generatedImages]);

  const generateAIImage = async () => {
    setIsGeneratingAI(true);
    setLoadError(false);
    
    const prompt = `Create a beautiful black and white line art coloring page design. The design should be: A detailed ${currentDesign.category.toLowerCase()} mandala or floral pattern inspired by the theme "${currentDesign.name}". Style: Clean black outlines on pure white background, suitable for adult coloring books, intricate but not overwhelming, symmetrical patterns, no shading or filled areas, only line art. The design should evoke feelings of ${currentDesign.quote?.quote?.split(' ').slice(0, 5).join(' ') || 'peace and mindfulness'}.`;
    
    try {
      const result = await base44.integrations.Core.GenerateImage({ prompt });
      
      if (result?.url) {
        setGeneratedImages(prev => ({
          ...prev,
          [currentDesign.id]: result.url
        }));
        toast.success('AI coloring page generated!');
        
        // Reload canvas with new image
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const maxSize = 550;
            const aspectRatio = img.width / img.height;
            
            if (aspectRatio > 1) {
              canvas.width = maxSize;
              canvas.height = maxSize / aspectRatio;
            } else {
              canvas.height = maxSize;
              canvas.width = maxSize * aspectRatio;
            }
            
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            baseImageRef.current = img;
            setImageLoaded(true);
            setLoadError(false);
          };
          img.onerror = () => {
            toast.error('Failed to load generated image');
            setLoadError(true);
          };
          img.src = result.url;
        }
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getCanvasPos(e);
    setLastPos(pos);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getCanvasPos(e);
    
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    
    if (isErasing) {
      // Eraser: restore original image in that area
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#FFFFFF';
      ctx.globalAlpha = 1;
    } else {
      // Use multiply blend mode to preserve black lines
      ctx.globalCompositeOperation = 'multiply';
      ctx.strokeStyle = selectedColor;
      ctx.globalAlpha = 0.6;
    }
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    
    setLastPos(pos);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const resetCurrentPage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Use stored base image if available
    if (baseImageRef.current) {
      ctx.drawImage(baseImageRef.current, 0, 0, canvas.width, canvas.height);
      toast.success('Page reset!');
    } else {
      // Reload image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        baseImageRef.current = img;
        toast.success('Page reset!');
      };
      img.src = currentDesign.imageUrl;
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `${currentDesign.name.replace(/\s+/g, '-')}-colored.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Image downloaded!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-auto"
    >
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
            >
              <Palette className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mindfulness Coloring Book
              </h1>
              <p className="text-sm text-gray-600">Relax and express yourself through color</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-red-100">
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-4">
          {/* Tools Panel */}
          <Card className="lg:col-span-1 border-2 border-purple-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Paintbrush className="w-5 h-5 text-purple-500" />
                Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tool Buttons */}
              <div className="flex gap-2">
                <Button
                  variant={!isErasing ? 'default' : 'outline'}
                  className={!isErasing ? 'bg-purple-500 hover:bg-purple-600' : ''}
                  onClick={() => setIsErasing(false)}
                >
                  <Paintbrush className="w-4 h-4 mr-2" />
                  Paint
                </Button>
                <Button
                  variant={isErasing ? 'default' : 'outline'}
                  className={isErasing ? 'bg-pink-500 hover:bg-pink-600' : ''}
                  onClick={() => setIsErasing(true)}
                >
                  <Eraser className="w-4 h-4 mr-2" />
                  Erase
                </Button>
              </div>

              {/* Color Palettes */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Color Palette</p>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(COLOR_PALETTES).map(palette => (
                    <Button
                      key={palette}
                      size="sm"
                      variant={activePalette === palette ? 'default' : 'outline'}
                      className={`text-xs capitalize ${activePalette === palette ? 'bg-purple-500' : ''}`}
                      onClick={() => setActivePalette(palette)}
                    >
                      {palette}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Colors</p>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PALETTES[activePalette].map((color, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedColor(color); setIsErasing(false); }}
                      className={`w-10 h-10 rounded-lg shadow-md transition-all ${
                        selectedColor === color && !isErasing ? 'ring-4 ring-purple-400 ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Brush Size */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Brush Size</p>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center"
                    style={{ backgroundColor: isErasing ? '#f3f4f6' : selectedColor }}
                  >
                    <div 
                      className="rounded-full bg-gray-800"
                      style={{ width: Math.min(brushSize / 2, 20), height: Math.min(brushSize / 2, 20) }}
                    />
                  </div>
                  <Slider
                    value={[brushSize]}
                    onValueChange={([val]) => setBrushSize(val)}
                    min={3}
                    max={40}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-500 w-8">{brushSize}px</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { size: 3, label: '✏️' },
                    { size: 8, label: '🖌️' },
                    { size: 15, label: '🖼️' },
                    { size: 30, label: '🎨' }
                  ].map(({ size, label }) => (
                    <Button
                      key={size}
                      size="sm"
                      variant={brushSize === size ? 'default' : 'outline'}
                      className={`flex-1 text-lg ${brushSize === size ? 'bg-purple-500' : ''}`}
                      onClick={() => setBrushSize(size)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Current Color */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div 
                  className="w-10 h-10 rounded-lg shadow-inner border-2 border-white"
                  style={{ backgroundColor: isErasing ? '#f3f4f6' : selectedColor }}
                />
                <span className="text-sm text-gray-600">
                  {isErasing ? 'Eraser Mode' : 'Selected Color'}
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={resetCurrentPage}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Page
                </Button>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600" onClick={downloadImage}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50" 
                  onClick={generateAIImage}
                  disabled={isGeneratingAI}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  {isGeneratingAI ? 'Generating...' : 'Generate New Design'}
                </Button>
              </div>

              {/* Zoom */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Zoom</p>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm flex-1 text-center">{Math.round(zoom * 100)}%</span>
                  <Button size="icon" variant="outline" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Canvas Area */}
          <Card className="lg:col-span-3 border-2 border-purple-200 bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-2 border-b">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-700">{currentDesign.category}</Badge>
                  <CardTitle className="text-lg">{currentDesign.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    {currentPage + 1} / {COLORING_PAGES.length}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(COLORING_PAGES.length - 1, currentPage + 1))}
                    disabled={currentPage === COLORING_PAGES.length - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {/* Quote Display */}
            {currentDesign.quote && (
              <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <p className="text-center text-purple-800 italic font-medium">
                  "{currentDesign.quote.quote}"
                </p>
                <p className="text-center text-purple-600 text-sm mt-1">— {currentDesign.quote.author}</p>
              </div>
            )}
            
            <CardContent className="p-4 flex items-center justify-center min-h-[500px] bg-white overflow-auto">
              {!imageLoaded && !loadError && !isGeneratingAI && (
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full"
                  />
                  <p className="text-sm text-gray-500">Loading coloring page...</p>
                </div>
              )}
              
              {isGeneratingAI && (
                <div className="flex flex-col items-center gap-4 p-8">
                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Wand2 className="w-8 h-8 text-white" />
                  </motion.div>
                  <p className="font-medium text-purple-700">AI is creating your coloring page...</p>
                  <p className="text-sm text-gray-500 text-center max-w-xs">This may take a few seconds. We're generating a unique design just for you!</p>
                </div>
              )}
              
              {loadError && !isGeneratingAI && (
                <div className="flex flex-col items-center gap-4 p-8">
                  <AlertTriangle className="w-12 h-12 text-amber-500" />
                  <p className="font-medium text-gray-700">Image not available</p>
                  <p className="text-sm text-gray-500 text-center max-w-xs">The original image couldn't be loaded. Generate a new one with AI!</p>
                  <Button 
                    onClick={generateAIImage}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate with AI
                  </Button>
                </div>
              )}
              <motion.div
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center', display: imageLoaded || loadError ? 'block' : 'none' }}
                className="touch-none"
              >
                <canvas
                  ref={canvasRef}
                  className="border-2 border-gray-200 rounded-lg shadow-inner cursor-crosshair max-w-full bg-white"
                  style={{ touchAction: 'none' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </motion.div>
            </CardContent>
          </Card>
        </div>

        {/* Page Thumbnails */}
        <Card className="mt-4 border-2 border-purple-200 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-purple-700 mb-3">📖 {COLORING_PAGES.length} Pages from "My Mindful Journey"</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {COLORING_PAGES.map((page, idx) => (
                <motion.button
                  key={page.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(idx)}
                  className={`flex-shrink-0 w-24 h-24 rounded-lg border-2 overflow-hidden transition-all ${
                    currentPage === idx 
                      ? 'border-purple-500 ring-2 ring-purple-300 shadow-lg' 
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <img 
                    src={page.imageUrl} 
                    alt={page.name}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border border-purple-200"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium text-purple-900">Mindfulness Tip</p>
              <p className="text-sm text-purple-700">
                Focus on the present moment as you color. Notice the colors you choose and how they make you feel. 
                There's no right or wrong way to color – let your creativity flow freely.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
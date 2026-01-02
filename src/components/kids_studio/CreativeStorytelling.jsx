import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { Sparkles, Wand2, BookOpen, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function CreativeStorytelling({ onComplete, childName = "friend", childAge = 6 }) {
  const [step, setStep] = useState('prompt'); // 'prompt', 'drawing', 'generating', 'story'
  const [userPrompt, setUserPrompt] = useState('');
  const [drawingImage, setDrawingImage] = useState(null);
  const [generatedStory, setGeneratedStory] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');

  const storyPrompts = [
    "A magical adventure in a candy forest",
    "A friendly dragon who's afraid of heights",
    "A talking teddy bear's secret mission",
    "The day all the toys came to life",
    "A superhero kid who can talk to animals",
    "An underwater city made of bubbles"
  ];

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#000000'];

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const generateStoryFromPrompt = async () => {
    if (!userPrompt.trim()) {
      toast.error('Please tell me what your story should be about!');
      return;
    }

    setIsGenerating(true);
    setStep('generating');

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a creative children's storyteller. Create a fun, engaging, age-appropriate story for a ${childAge}-year-old named ${childName}.

Story prompt: ${userPrompt}

Create a story that:
1. Is about 200-300 words
2. Uses simple, age-appropriate language
3. Has a positive message
4. Includes adventure and fun
5. Has a happy ending

Return JSON with:
{
  "title": "catchy story title",
  "story": "the full story with paragraphs",
  "moral": "what the story teaches"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            story: { type: "string" },
            moral: { type: "string" }
          }
        }
      });

      setStoryTitle(response.title);
      setGeneratedStory(response.story);
      setStep('story');
      toast.success('Story created! 🎉');
    } catch (error) {
      console.error('Error generating story:', error);
      toast.error('Could not create story. Please try again!');
      setStep('prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateStoryFromDrawing = async () => {
    const canvas = canvasRef.current;
    const drawingDataUrl = canvas.toDataURL('image/png');
    
    setIsGenerating(true);
    setStep('generating');

    try {
      // Upload the drawing
      const blob = await fetch(drawingDataUrl).then(r => r.blob());
      const file = new File([blob], 'drawing.png', { type: 'image/png' });
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Generate story based on drawing
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a creative children's storyteller. Look at this drawing and create a fun, engaging story about it for a ${childAge}-year-old named ${childName}.

Create a story that:
1. Is inspired by the drawing's colors and shapes
2. Is about 200-300 words
3. Uses simple, age-appropriate language
4. Has adventure and fun
5. Has a happy ending

Return JSON with:
{
  "title": "catchy story title based on the drawing",
  "story": "the full story",
  "moral": "what the story teaches"
}`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            story: { type: "string" },
            moral: { type: "string" }
          }
        }
      });

      setDrawingImage(file_url);
      setStoryTitle(response.title);
      setGeneratedStory(response.story);
      setStep('story');
      toast.success('Your drawing inspired a magical story! ✨');
    } catch (error) {
      console.error('Error generating story from drawing:', error);
      toast.error('Could not create story from drawing. Try a text prompt instead!');
      setStep('prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <AnimatePresence mode="wait">
        {step === 'prompt' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="border-4 border-purple-300 bg-purple-50">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-2xl font-bold text-purple-800 text-center flex items-center justify-center gap-2">
                  <BookOpen className="w-7 h-7" />
                  Tell Me Your Story Idea!
                </h3>
                
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="What should the story be about? (e.g., 'A brave kitten who saves the day')"
                  className="w-full h-32 p-4 border-2 border-purple-300 rounded-xl text-lg resize-none focus:border-purple-500 focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-2">
                  {storyPrompts.map((prompt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => setUserPrompt(prompt)}
                      className="text-xs border-purple-300 hover:bg-purple-100 whitespace-normal h-auto py-2"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={generateStoryFromPrompt}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 text-lg"
                  disabled={!userPrompt.trim()}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create My Story!
                </Button>

                <div className="text-center">
                  <p className="text-gray-600 font-semibold mb-2">OR</p>
                  <Button
                    onClick={() => setStep('drawing')}
                    variant="outline"
                    className="border-2 border-green-400 hover:bg-green-50"
                  >
                    <Wand2 className="w-5 h-5 mr-2" />
                    Draw My Story Instead!
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'drawing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="border-4 border-green-300 bg-green-50">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-2xl font-bold text-green-800 text-center">
                  🎨 Draw Your Story!
                </h3>

                <div className="bg-white rounded-xl p-2 border-4 border-green-300">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setBrushColor(color)}
                      className={`w-10 h-10 rounded-full border-4 ${brushColor === color ? 'border-purple-500 scale-110' : 'border-gray-300'} transition-transform`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={clearCanvas}
                    variant="outline"
                    className="flex-1 border-red-300 hover:bg-red-50"
                  >
                    Clear Drawing
                  </Button>
                  <Button
                    onClick={() => setStep('prompt')}
                    variant="outline"
                    className="flex-1"
                  >
                    Back to Prompt
                  </Button>
                </div>

                <Button
                  onClick={generateStoryFromDrawing}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-4 text-lg"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  Turn Drawing Into Story!
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'generating' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-8xl mb-6"
            >
              ✨
            </motion.div>
            <h3 className="text-3xl font-bold text-purple-800 mb-2">Creating Your Story...</h3>
            <p className="text-gray-600 text-lg">The magic is happening! ✨</p>
          </motion.div>
        )}

        {step === 'story' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="border-4 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-orange-800 mb-4">📖 {storyTitle}</h2>
                  {drawingImage && (
                    <img src={drawingImage} alt="Your drawing" className="w-64 h-auto mx-auto mb-4 rounded-xl border-4 border-white shadow-lg" />
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-yellow-300">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line text-lg">
                    {generatedStory}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setStep('prompt');
                      setUserPrompt('');
                      setGeneratedStory('');
                      setDrawingImage(null);
                      clearCanvas();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create New Story
                  </Button>
                  <Button
                    onClick={() => {
                      toast.success('Story saved! 📚');
                      if (onComplete) onComplete(15, null);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Story
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
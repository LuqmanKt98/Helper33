
import React, { useState, useEffect, useRef } from 'react';
import { ScheduledPost } from '@/entities/ScheduledPost';
import { ContentAsset } from '@/entities/ContentAsset';
import { User } from '@/entities/User';
import { SendEmail } from '@/integrations/Core';
import { UploadFile } from '@/integrations/Core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { 
  ArrowLeft, Plus, Edit, Trash2, CalendarIcon, Upload, Loader2, 
  Video, Image, CheckCircle, Sparkles, FileText,
  Presentation, BookOpen, Palette, BarChart3, Clock,
  Wand2, Layout, TrendingUp, Zap, Download, Eye, Save, Grid3X3,
  Mic, MicOff, Volume2, Square
} from 'lucide-react';
import { motion } from 'framer-motion';

import { enhancedContentAI } from "@/functions/enhancedContentAI";
import { generatePDF } from "@/functions/generatePDF";
import { generateContentImage } from "@/functions/generateContentImage";

const platforms = ["Instagram", "Facebook", "TikTok", "YouTube", "Twitter", "LinkedIn", "Pinterest"];

const contentTypes = [
  { id: 'video', label: 'Video/Reel', icon: Video, color: 'from-red-500 to-pink-600', description: 'Create engaging video content' },
  { id: 'post', label: 'Social Post', icon: Image, color: 'from-blue-500 to-cyan-600', description: 'Write and schedule posts' },
  { id: 'blog', label: 'Blog Article', icon: FileText, color: 'from-purple-500 to-indigo-600', description: 'Write long-form content' },
  { id: 'presentation', label: 'Presentation', icon: Presentation, color: 'from-orange-500 to-amber-600', description: 'Create slide decks' },
  { id: 'design', label: 'Graphics', icon: Palette, color: 'from-green-500 to-emerald-600', description: 'Design images & posters' },
  { id: 'ebook', label: 'E-book', icon: BookOpen, color: 'from-pink-500 to-rose-600', description: 'Build digital books' },
];

function AIContentGenerator({ contentType, onGenerate, onCancel }) {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('calm');
  const [audience, setAudience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  // Voice and Speech states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Setup speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; // Set language

      let currentPrompt = ''; // To accumulate text within a single listening session

      recognitionRef.current.onstart = () => {
        currentPrompt = prompt; // Capture current prompt when listening starts
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        // Update prompt with existing content + new final transcript
        setPrompt(currentPrompt + finalTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          // alert("No speech detected. Please try again.");
        } else if (event.error === 'not-allowed') {
          alert("Microphone access denied. Please enable it in your browser settings.");
        } else {
          // alert(`Speech recognition error: ${event.error}`);
        }
      };

    }
    
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();
    };
  }, [prompt]); // Dependency on prompt to ensure 'currentPrompt' in onstart is up-to-date

  const handleListenToggle = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setPrompt(""); // Clear prompt when starting new dictation
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const handleSpeakContent = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!generatedContent) {
      alert("No content to read aloud.");
      return;
    }
    
    let textToSpeak = '';
    if (typeof generatedContent === 'string') {
      textToSpeak = generatedContent;
    } else if (typeof generatedContent === 'object') {
      // Simple stringification for different content types
      if (contentType === 'video' && generatedContent.hook) {
        textToSpeak = `Hook: ${generatedContent.hook}. Introduction: ${generatedContent.intro}. Body: ${generatedContent.body}. Call to action: ${generatedContent.cta}.`;
      } else if (contentType === 'post' && generatedContent.content) {
        textToSpeak = generatedContent.content;
      } else if (contentType === 'blog' && generatedContent.title) {
        textToSpeak = `Title: ${generatedContent.title}. Meta description: ${generatedContent.metaDescription}. Outline: ${generatedContent.outline?.map(s => `${s.heading}. ${s.points?.join('. ')}`).join('. ')}`;
      } else if (contentType === 'presentation' && generatedContent.slides) {
        textToSpeak = generatedContent.slides.map(s => `Slide ${s.slideNumber}: ${s.title}. ${s.points?.join('. ')}. Notes: ${s.notes}`).join('. ');
      } else if (contentType === 'design' && generatedContent.headline) {
        textToSpeak = `Headline: ${generatedContent.headline}. Sub-headline: ${generatedContent.subHeadline}. Layout: ${generatedContent.layout}.`;
      } else if (contentType === 'ebook' && generatedContent.title) {
        textToSpeak = `E-book title: ${generatedContent.title}. Subtitle: ${generatedContent.subtitle}. Chapters: ${generatedContent.chapters?.map(c => `Chapter ${c.number}: ${c.title}. Key points: ${c.keyPoints?.join('. ')}`).join('. ')}`;
      }
    }

    if (textToSpeak.trim() === '') {
      alert("Could not extract speakable content.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
    };
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };


  const tones = ['calm', 'bold', 'educational', 'funny', 'professional', 'inspirational'];

  const generateContent = async () => {
    if (!prompt) {
      alert('Please describe what you want to create');
      return;
    }

    setIsGenerating(true);
    try {
      const { data } = await enhancedContentAI({
        content_type: contentType,
        prompt,
        tone,
        audience,
        options: {}
      });
      
      setGeneratedContent(data.content);
      
      // Auto-generate image for design content
      if (contentType === 'design' && data.content.imagePrompt) {
        setIsGeneratingImage(true);
        const imageResult = await generateContentImage({
          designBrief: data.content
        });
        setGeneratedImage(imageResult.data.image_url);
        setIsGeneratingImage(false);
      }
      
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    }
    setIsGenerating(false);
  };

  const handleExportPDF = async () => {
    try {
      const contentTitle = generatedContent.title || prompt || 'generated-content';
      const { data } = await generatePDF({
        content_type: contentType,
        data: generatedContent,
        title: contentTitle
      });
      
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contentTitle.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      alert('✅ PDF downloaded successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleSaveAsset = async () => {
    try {
      const assetTitle = generatedContent.title || prompt || 'AI Generated Content';
      await ContentAsset.create({
        content_type: contentType,
        title: assetTitle,
        status: 'draft',
        ai_generated_data: generatedContent,
        media_urls: generatedImage ? [generatedImage] : [],
        platforms_targeted: [],
        tags: [tone, contentType]
      });
      
      alert('✅ Content saved to Asset Library!');
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Failed to save content. Please try again.');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-indigo-600" />
          AI Content Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedContent ? (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                What do you want to create?
              </label>
              <div className="relative">
                <Textarea
                  placeholder="Describe your content idea... (e.g., 'A motivational video about overcoming challenges for entrepreneurs')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="h-24 pr-12"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleListenToggle}
                  className="absolute top-2 right-2 text-gray-500 hover:text-indigo-600"
                  title={isListening ? "Stop listening" : "Use microphone"}
                >
                  {isListening ? <MicOff className="w-5 h-5 text-red-500" /> : <Mic className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tone</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map(t => (
                      <SelectItem key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Target Audience</label>
                <Input
                  placeholder="e.g., entrepreneurs, parents, teens"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
              <Button 
                onClick={generateContent}
                disabled={isGenerating || isGeneratingImage}
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                {isGenerating || isGeneratingImage ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isGeneratingImage ? 'Generating Image...' : 'Generating...'}</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Generate with AI</>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 bg-white rounded-lg border-2 border-indigo-200 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-800">✨ Generated Content:</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSpeakContent}
                  className="flex items-center gap-1 text-gray-600 hover:text-indigo-700"
                  disabled={!generatedContent}
                >
                  {isSpeaking ? (
                    <>
                      <Square className="w-3 h-3" /> Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" /> Listen
                    </>
                  )}
                </Button>
              </div>
              
              {generatedImage && (
                <div className="mb-4 flex justify-center">
                  <img src={generatedImage} alt="Generated design" className="max-w-full h-auto rounded-lg shadow-md" />
                </div>
              )}
              
              <div className="prose prose-sm max-w-none">
                {contentType === 'video' && generatedContent.hook && (
                  <div className="mb-4">
                    <h5 className="font-bold text-sm text-gray-700">🎬 Hook (First 3 seconds):</h5>
                    <p className="text-gray-600">{generatedContent.hook}</p>
                    <h5 className="font-bold text-sm text-gray-700 mt-2">📝 Introduction:</h5>
                    <p className="text-gray-600">{generatedContent.intro}</p>
                    <h5 className="font-bold text-sm text-gray-700 mt-2">💡 Body:</h5>
                    <p className="text-gray-600">{generatedContent.body}</p>
                    <h5 className="font-bold text-sm text-gray-700 mt-2">📢 Call-to-Action:</h5>
                    <p className="text-gray-600">{generatedContent.cta}</p>
                    {generatedContent.hashtags && (
                      <>
                        <h5 className="font-bold text-sm text-gray-700 mt-2">#️⃣ Hashtags:</h5>
                        <p className="text-gray-600">{generatedContent.hashtags.join(' ')}</p>
                      </>
                    )}
                  </div>
                )}
                
                {contentType === 'post' && generatedContent.content && (
                  <div className="mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{generatedContent.content}</p>
                    {generatedContent.hashtags && (
                      <p className="text-blue-600 mt-2">{generatedContent.hashtags.join(' ')}</p>
                    )}
                  </div>
                )}
                
                {contentType === 'blog' && generatedContent.title && (
                  <div className="mb-4">
                    <h5 className="font-bold text-lg text-gray-800">{generatedContent.title}</h5>
                    <p className="text-sm text-gray-500 italic">{generatedContent.metaDescription}</p>
                    {generatedContent.outline && generatedContent.outline.map((section, i) => (
                      <div key={i} className="mt-3">
                        <h6 className="font-semibold text-gray-700">{section.heading}</h6>
                        <ul className="list-disc list-inside text-gray-600 text-sm">
                          {section.points?.map((point, j) => <li key={j}>{point}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                
                {contentType === 'presentation' && generatedContent.slides && (
                  <div className="space-y-3">
                    {generatedContent.slides.map((slide, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <h6 className="font-semibold text-gray-800">Slide {slide.slideNumber}: {slide.title}</h6>
                        <ul className="list-disc list-inside text-gray-600 text-sm mt-1">
                          {slide.points?.map((point, j) => <li key={j}>{point}</li>)}
                        </ul>
                        {slide.notes && <p className="text-xs text-gray-500 mt-1 italic">Notes: {slide.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
                
                {contentType === 'design' && generatedContent.headline && (
                  <div className="space-y-2">
                    <h5 className="font-bold text-xl">{generatedContent.headline}</h5>
                    <p className="text-gray-600">{generatedContent.subHeadline}</p>
                    <div className="flex gap-2 mt-2">
                      {generatedContent.colors?.map((color, i) => (
                        <div key={i} className="w-8 h-8 rounded" style={{backgroundColor: color}} title={color}></div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500"><strong>Layout:</strong> {generatedContent.layout}</p>
                  </div>
                )}
                
                {contentType === 'ebook' && generatedContent.title && (
                  <div className="space-y-3">
                    <h5 className="font-bold text-xl text-gray-800">{generatedContent.title}</h5>
                    <p className="text-gray-600">{generatedContent.subtitle}</p>
                    {generatedContent.chapters?.map((chapter, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <h6 className="font-semibold">Chapter {chapter.number}: {chapter.title}</h6>
                        <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                          {chapter.keyPoints?.map((point, j) => <li key={j}>{point}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 flex-wrap">
              <Button variant="outline" onClick={() => { setGeneratedContent(null); setGeneratedImage(null); }}>
                <Wand2 className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              
              {['blog', 'presentation', 'ebook'].includes(contentType) && (
                <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              )}
              
              <Button variant="outline" onClick={handleSaveAsset}>
                <Save className="w-4 h-4 mr-2" />
                Save to Library
              </Button>
              
              {contentType === 'post' && (
                <Button onClick={() => onGenerate(generatedContent)} className="bg-gradient-to-r from-emerald-600 to-green-600">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PostForm({ post, onSubmit, onCancel, generatedContent }) {
  const [content, setContent] = useState(post?.content || '');
  const [platform, setPlatform] = useState(post?.platform || '');
  const [postAt, setPostAt] = useState(post?.post_at ? new Date(post.post_at) : null);
  const [media, setMedia] = useState(post?.media_urls || []);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (generatedContent?.content) {
      let finalContent = generatedContent.content;
      if (generatedContent.hashtags && generatedContent.hashtags.length > 0) {
        finalContent += '\n\n' + generatedContent.hashtags.join(' ');
      }
      setContent(finalContent);
    }
  }, [generatedContent]);

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setMedia([...media, file_url]);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed. Please try again.");
    }
    setIsUploading(false);
  };

  const handleSave = async () => {
    if (!platform || !content || !postAt) {
      alert("Please fill in all required fields.");
      return;
    }
    const postData = {
      platform,
      content,
      post_at: postAt.toISOString(),
      media_urls: media,
      status: 'scheduled'
    };
    onSubmit(postData);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm p-6">
      <div className="space-y-4">
        <Select onValueChange={setPlatform} value={platform}>
          <SelectTrigger><SelectValue placeholder="Select a platform" /></SelectTrigger>
          <SelectContent>
            {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        
        <Textarea
          placeholder="Write your post content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-32"
        />
        
        <div className="flex gap-4 items-center flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {postAt ? format(postAt, 'PPP p') : 'Select post date and time'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={postAt} onSelect={setPostAt} />
              <Input 
                type="time" 
                className="mt-2 mx-3 mb-3" 
                onChange={e => {
                  if(!postAt) return;
                  const [hours, minutes] = e.target.value.split(':');
                  const newDate = new Date(postAt);
                  newDate.setHours(parseInt(hours, 10));
                  newDate.setMinutes(parseInt(minutes, 10));
                  setPostAt(newDate);
                }}
              />
            </PopoverContent>
          </Popover>
          
          <div className="relative">
            <Button asChild variant="outline">
              <label htmlFor="media-upload">
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload Media
              </label>
            </Button>
            <Input id="media-upload" type="file" className="sr-only" onChange={handleMediaUpload} disabled={isUploading} />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {media.map((url, index) => (
            <div key={index} className="relative w-20 h-20">
              <img src={url} alt="Uploaded media" className="w-full h-full object-cover rounded-md" />
              <Button 
                size="icon" 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-6 w-6" 
                onClick={() => setMedia(media.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-sky-500 to-blue-600">
            {post ? 'Update' : 'Schedule'} Post
          </Button>
        </div>
      </div>
    </Card>
  );
}

function AssetLibrary() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const fetchedAssets = await ContentAsset.list('-created_date');
      setAssets(fetchedAssets);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
    setLoading(false);
  };

  const handleDeleteAsset = async (id) => {
    if (window.confirm('Delete this asset?')) {
      await ContentAsset.delete(id);
      loadAssets();
    }
  };

  const filteredAssets = filter === 'all' 
    ? assets 
    : assets.filter(a => a.content_type === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All
        </Button>
        {contentTypes.map(type => (
          <Button 
            key={type.id}
            variant={filter === type.id ? 'default' : 'outline'}
            onClick={() => setFilter(type.id)}
            size="sm"
          >
            {type.label}
          </Button>
        ))}
      </div>

      {filteredAssets.length === 0 ? (
        <Card className="p-12 text-center">
          <Grid3X3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No assets yet</p>
          <p className="text-sm text-gray-400">Create content with AI to build your library</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map(asset => {
            const typeInfo = contentTypes.find(t => t.id === asset.content_type);
            const TypeIcon = typeInfo?.icon || FileText;
            
            return (
              <Card key={asset.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${typeInfo?.color} flex items-center justify-center`}>
                      <TypeIcon className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant={asset.status === 'published' ? 'default' : 'secondary'}>
                      {asset.status}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{asset.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {format(new Date(asset.created_date), 'MMM d, yyyy')}
                  </p>
                  
                  {asset.media_urls && asset.media_urls.length > 0 && (
                    <div className="mb-3">
                      <img 
                        src={asset.media_urls[0]} 
                        alt={asset.title} 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDeleteAsset(asset.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function InfluencerHub({ onBack }) {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [view, setView] = useState('dashboard');
  const [selectedContentType, setSelectedContentType] = useState(null);
  const [user, setUser] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await User.me();
      setUser(currentUser);
      const scheduledPosts = await ScheduledPost.list('-post_at');
      setPosts(scheduledPosts);
    };
    loadData();
  }, []);
  
  // Check for posts that need notifications
  useEffect(() => {
    const checkScheduledPosts = async () => {
      if (!user) return;
      const now = new Date();
      const upcomingPosts = posts.filter(p => 
        p.status === 'scheduled' && 
        !p.notification_sent &&
        new Date(p.post_at) <= now
      );

      for (const post of upcomingPosts) {
        try {
          await SendEmail({
            to: user.email,
            subject: `Time to post on ${post.platform}!`,
            body: `
              <p>Hi ${user.full_name || ''},</p>
              <p>It's time to publish your scheduled post for <strong>${post.platform}</strong>.</p>
              <hr>
              <h3>Content:</h3>
              <p>${post.content.replace(/\n/g, '<br>')}</p>
              ${post.media_urls?.length > 0 ? `
              <h3>Media:</h3>
              <ul>
                ${post.media_urls.map(url => `<li><a href="${url}" target="_blank">${url}</a></li>`).join('')}
              </ul>
              ` : ''}
              <hr>
              <p>You can mark this as posted in your DobryLife Content Hub.</p>
            `
          });
          await ScheduledPost.update(post.id, { notification_sent: true, status: 'notified' });
        } catch (error) {
          console.error("Failed to send notification for post:", post.id, error);
        }
      }
      
      const scheduledPosts = await ScheduledPost.list('-post_at');
      setPosts(scheduledPosts);
    };

    const interval = setInterval(checkScheduledPosts, 60000);
    return () => clearInterval(interval);
  }, [posts, user]);

  const handleSavePost = async (postData) => {
    if (editingPost) {
      await ScheduledPost.update(editingPost.id, postData);
    } else {
      await ScheduledPost.create(postData);
    }
    const scheduledPosts = await ScheduledPost.list('-post_at');
    setPosts(scheduledPosts);
    setView('list');
    setEditingPost(null);
    setGeneratedContent(null);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this scheduled post?")) {
      await ScheduledPost.delete(postId);
      setPosts(posts.filter(p => p.id !== postId));
    }
  };
  
  const handleMarkAsPosted = async (postId) => {
    await ScheduledPost.update(postId, { status: 'posted_manually' });
    const scheduledPosts = await ScheduledPost.list('-post_at');
    setPosts(scheduledPosts);
  };

  const quickActions = contentTypes;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-sky-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Content Hub</h1>
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">AI-Powered</Badge>
          </div>
          <Button 
            onClick={() => { setView('compose'); setEditingPost(null); setGeneratedContent(null); }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Quick Post
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={view} onValueChange={setView} className="mb-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-4 mx-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Scheduled ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Dashboard View */}
        {view === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Quick Actions Grid */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  Create New Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <motion.button
                      key={action.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedContentType(action.id);
                        setView('ai-generate');
                      }}
                      className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-indigo-300 transition-all text-left group"
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">{action.label}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Drafts */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    Upcoming Posts
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setView('list')}>
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No scheduled posts yet</p>
                    <p className="text-sm mt-1">Create your first post to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {posts.slice(0, 3).map((post) => (
                      <div key={post.id} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge>{post.platform}</Badge>
                              <span className="text-sm text-gray-600">{format(new Date(post.post_at), 'MMM d @ p')}</span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => {
                            setEditingPost(post);
                            setView('compose');
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Preview */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/70 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{posts.length}</div>
                    <div className="text-sm text-gray-600">Scheduled Posts</div>
                  </div>
                  <div className="p-4 bg-white/70 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">{posts.filter(p => p.status === 'posted_manually').length}</div>
                    <div className="text-sm text-gray-600">Published</div>
                  </div>
                  <div className="p-4 bg-white/70 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">{posts.filter(p => p.status === 'scheduled' && new Date(p.post_at) < new Date()).length}</div>
                    <div className="text-sm text-gray-600">Ready to Post</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* AI Generate View */}
        {view === 'ai-generate' && (
          <AIContentGenerator
            contentType={selectedContentType}
            onGenerate={(content) => {
              setGeneratedContent(content);
              if (selectedContentType === 'post') {
                setView('compose');
              }
            }}
            onCancel={() => {
              setView('dashboard');
              setSelectedContentType(null);
            }}
          />
        )}

        {/* Compose View */}
        {view === 'compose' && (
          <PostForm
            post={editingPost}
            generatedContent={generatedContent}
            onSubmit={handleSavePost}
            onCancel={() => {
              setView('dashboard');
              setEditingPost(null);
              setGeneratedContent(null);
            }}
          />
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Scheduled Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">No scheduled posts</p>
                    <p className="text-sm">Create your first post using AI or manual entry</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {posts.map(post => (
                      <Card key={post.id} className="border-l-4 border-indigo-500">
                        <CardContent className="p-4 flex justify-between items-start">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge>{post.platform}</Badge>
                              <Badge variant={post.status === 'scheduled' ? 'secondary' : post.status === 'posted_manually' ? 'default' : 'outline'}>
                                {post.status}
                              </Badge>
                              <span className="text-sm text-gray-500">{format(new Date(post.post_at), 'MMM d, yyyy @ p')}</span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                            <div className="flex flex-wrap gap-2">
                              {post.media_urls?.map((url, i) => (
                                <a href={url} key={i} target="_blank" rel="noopener noreferrer">
                                  <img src={url} alt="Media" className="w-16 h-16 object-cover rounded" />
                                </a>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Button size="sm" variant="outline" onClick={() => { setEditingPost(post); setView('compose'); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeletePost(post.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            {post.status !== 'posted_manually' && (
                              <Button size="sm" onClick={() => handleMarkAsPosted(post.id)} className="bg-emerald-600">
                                <CheckCircle className="w-4 h-4"/>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Assets View */}
        {view === 'assets' && <AssetLibrary />}

        {/* Analytics View */}
        {view === 'analytics' && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Content Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg text-gray-600 mb-2">Analytics Dashboard</p>
                <p className="text-sm text-gray-500">
                  Connect your social media accounts to track performance metrics, engagement, and insights.
                </p>
                <Button className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600">
                  Connect Platforms
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

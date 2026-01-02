
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Calendar,
  TrendingUp,
  Image as ImageIcon,
  Send,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Clock,
  Copy,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Wand2,
  CheckCircle,
  Loader2,
  X,
  Users,
  Eye,
  Heart,
  Share2,
  Activity,
  Zap,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CalendarDays,
  Save,
  Trash2,
  Edit,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import MessageBubble from '@/components/ai/MessageBubble';
import SEO from '@/components/SEO';
import { getSEOForPage } from '@/components/SEODefaults';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const PLATFORMS = {
  Instagram: { icon: Instagram, color: 'from-pink-500 to-purple-600', bestTimes: ['9AM', '1PM', '7PM'] },
  Facebook: { icon: Facebook, color: 'from-blue-500 to-blue-700', bestTimes: ['9AM', '12PM', '3PM'] },
  TikTok: { icon: MessageSquare, color: 'from-black to-gray-700', bestTimes: ['7AM', '12PM', '7PM', '10PM'] },
  YouTube: { icon: Youtube, color: 'from-red-500 to-red-700', bestTimes: ['12PM', '3PM', '6PM'] },
  Twitter: { icon: Twitter, color: 'from-sky-400 to-blue-600', bestTimes: ['8AM', '12PM', '5PM'] },
  LinkedIn: { icon: Linkedin, color: 'from-blue-600 to-blue-800', bestTimes: ['7AM', '12PM', '5PM'] }
};

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function SocialMediaManager() {
  const [activeTab, setActiveTab] = useState('ai_chat');
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const [generatedPost, setGeneratedPost] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: scheduledPosts = [] } = useQuery({
    queryKey: ['scheduledPosts'],
    queryFn: () => base44.entities.ScheduledPost.list('-created_date'),
    initialData: []
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['socialMetrics'],
    queryFn: () => base44.entities.SocialMediaMetrics.list('-metric_date'),
    initialData: []
  });

  const { data: competitors = [] } = useQuery({
    queryKey: ['competitors'],
    queryFn: () => base44.entities.CompetitorProfile.list('-created_date'),
    initialData: []
  });

  const { data: trends = [] } = useQuery({
    queryKey: ['contentTrends'],
    queryFn: () => base44.entities.ContentTrend.list('-popularity_score'),
    initialData: []
  });

  const seo = getSEOForPage('SocialMediaManager');

  // Subscribe to AI conversation
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      const unsubscribe = base44.agents.subscribeToConversation(
        conversationId,
        (data) => {
          if (!data || !data.messages) return;
          setMessages(data.messages);

          const lastMessage = data.messages[data.messages.length - 1];
          if (lastMessage?.role === 'assistant' && lastMessage?.status !== 'in_progress') {
            setIsLoading(false);
          }

          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      );

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error('Error subscribing to conversation:', error);
      setMessages([]);
      setIsLoading(false);
    }
  }, [conversationId]);

  const handleSendMessage = async () => {
    const textToSend = input.trim();
    if (!textToSend || isLoading) return;

    setInput('');
    setIsLoading(true);

    try {
      let convId = conversationId;

      if (!convId) {
        const newConv = await base44.agents.createConversation({
          agent_name: 'social_media_manager',
          metadata: {
            name: 'Social Media Strategy',
            user_email: user?.email
          }
        });

        convId = newConv.id;
        setConversationId(convId);
        setMessages([]);
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      await base44.agents.addMessage(
        { id: convId },
        { role: 'user', content: textToSend }
      );

    } catch (error) {
      console.error('Error sending message:', error);
      setInput(textToSend);
      setIsLoading(false);
      toast.error('Failed to send message');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const quickPrompts = [
    "Generate 5 Instagram post ideas for wellness content",
    "Write a caption for a motivational Monday post",
    "What's the best time to post on TikTok?",
    "Analyze my recent posts and give me recommendations",
    "Create a 30-day content calendar outline",
    "Help me design a content series about mental health",
    "What content trends should I capitalize on?",
    "Analyze my competitor's strategy and suggest improvements"
  ];

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
  };

  const generatePostImage = async (prompt) => {
    setIsGeneratingImage(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Social media post image: ${prompt}. High quality, engaging, professional, eye-catching design suitable for Instagram/Facebook. Vibrant colors, clean composition.`
      });
      
      setGeneratedPost(prev => ({ ...prev, image_url: result.url }));
      toast.success('Image generated! ✨');
    } catch (error) {
      console.error('Error generating image:', error);
      
      if (error.message?.includes('402') || error.message?.includes('Payment Required')) {
        toast.error('Image generation requires payment setup. Please use a placeholder or upload your own image.', {
          duration: 5000
        });
      } else {
        toast.error('Failed to generate image. Try uploading your own or using a placeholder.');
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        url="https://www.helper33.com/SocialMediaManager"
        structuredData={seo.structuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-xl rounded-full border border-purple-200/50 mb-4 shadow-xl">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                AI Social Media Manager
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Your AI
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent ml-3">
                Content Strategist
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Generate engaging content, optimize posting times, analyze performance, and grow your social presence with AI.
            </p>

            {/* WhatsApp Access */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block mt-4"
            >
              <a
                href={base44.agents.getWhatsAppConnectURL('social_media_manager')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
                  }}
                >
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp Assistant
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-7 max-w-6xl mx-auto mb-8 bg-white/70 backdrop-blur-xl border border-purple-200/30 shadow-lg">
              <TabsTrigger value="ai_chat" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">AI Chat</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                <Lightbulb className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Generate</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                <CalendarDays className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="competitors" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                <Search className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Competitors</span>
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Trends</span>
              </TabsTrigger>
            </TabsList>

            {/* AI Chat Tab */}
            <TabsContent value="ai_chat">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Quick Actions Sidebar */}
                <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {quickPrompts.map((prompt, idx) => (
                      <Button
                        key={idx}
                        onClick={() => handleQuickPrompt(prompt)}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-purple-50 border-purple-200 break-words whitespace-normal"
                      >
                        <Sparkles className="w-4 h-4 mr-2 flex-shrink-0 text-purple-600" />
                        <span className="text-sm leading-snug">{prompt}</span>
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Chat Interface */}
                <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-2 border-purple-200 flex flex-col h-[700px]">
                  <CardHeader className="border-b border-purple-200/50">
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <span className="break-words">Social Media AI Assistant</span>
                    </CardTitle>
                    <CardDescription className="break-words">
                      Get personalized content ideas, captions, and strategy recommendations
                    </CardDescription>
                  </CardHeader>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 && !isLoading && (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Sparkles className="w-16 h-16 text-purple-300 mb-4" />
                        <h3 className="font-semibold text-lg text-gray-700 mb-2">
                          Let's Create Amazing Content!
                        </h3>
                        <p className="text-sm text-gray-500 max-w-md">
                          I can help you brainstorm ideas, write captions, find the best posting times, 
                          and grow your social media presence. What would you like to work on?
                        </p>
                      </div>
                    )}

                    {messages.map((msg, idx) => (
                      <MessageBubble key={msg.id || idx} message={msg} />
                    ))}

                    {isLoading && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                        <span className="text-sm">Creating content magic...</span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-purple-200/50">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Ask for post ideas, captions, strategy advice..."
                        className="flex-1 border-2 border-purple-300 focus:border-purple-500"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Quick Generate Tab */}
            <TabsContent value="content">
              <QuickGenerateSection user={user} onImageGenerate={generatePostImage} />
            </TabsContent>

            {/* Content Calendar Tab */}
            <TabsContent value="calendar">
              <ContentCalendarSection trends={trends} queryClient={queryClient} />
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule">
              <ScheduleSection scheduledPosts={scheduledPosts} />
            </TabsContent>

            {/* Advanced Analytics Tab */}
            <TabsContent value="analytics">
              <AdvancedAnalyticsSection 
                scheduledPosts={scheduledPosts} 
                metrics={metrics}
                queryClient={queryClient}
              />
            </TabsContent>

            {/* Competitor Analysis Tab */}
            <TabsContent value="competitors">
              <CompetitorAnalysisSection competitors={competitors} queryClient={queryClient} />
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends">
              <TrendForecastingSection trends={trends} queryClient={queryClient} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

function QuickGenerateSection({ user, onImageGenerate }) {
  const [platform, setPlatform] = useState('Instagram');
  const [contentTheme, setContentTheme] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const generateContent = async () => {
    if (!contentTheme.trim()) {
      toast.error('Please enter a content theme');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an engaging social media post for ${platform}.

Content Theme: ${contentTheme}

Create a complete post with:
1. An attention-grabbing hook (first line)
2. Engaging main content (2-3 sentences)
3. A clear call-to-action
4. Relevant hashtags (5-10 hashtags mixing trending and niche)
5. Suggested image description for AI generation

Platform-specific guidelines:
${platform === 'Instagram' ? '- Use line breaks for readability, emojis strategically, storytelling approach' : ''}
${platform === 'TikTok' ? '- Short, punchy, trend-aware, use popular sounds reference' : ''}
${platform === 'LinkedIn' ? '- Professional tone, insights-driven, thought leadership' : ''}
${platform === 'Twitter' ? '- Concise (under 280 chars), witty, conversation-starting' : ''}

Return as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            caption: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } },
            hook: { type: "string" },
            cta: { type: "string" },
            image_description: { type: "string" },
            best_posting_time: { type: "string" },
            engagement_tips: { type: "array", items: { type: "string" } }
          }
        }
      });

      setGeneratedContent({ ...response, platform });
      toast.success('Content generated! ✨');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToSchedule = async () => {
    if (!generatedContent) return;

    try {
      await base44.entities.ScheduledPost.create({
        platform: generatedContent.platform,
        content: generatedContent.caption + '\n\n' + (generatedContent.hashtags ? generatedContent.hashtags.join(' ') : ''),
        post_at: new Date().toISOString(),
        status: 'scheduled',
        ai_generated: true,
        content_theme: contentTheme
      });

      queryClient.invalidateQueries(['scheduledPosts']);
      toast.success('Saved to schedule!');
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save');
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Generator Form */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            Quick Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(PLATFORMS).map(p => {
                  const PlatformIcon = PLATFORMS[p].icon;
                  return (
                    <SelectItem key={p} value={p}>
                      <div className="flex items-center gap-2">
                        <PlatformIcon className="w-4 h-4" />
                        {p}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Content Theme / Topic</Label>
            <Textarea
              value={contentTheme}
              onChange={(e) => setContentTheme(e.target.value)}
              placeholder="e.g., Morning motivation for entrepreneurs, Wellness tips for busy parents, Mental health awareness..."
              rows={3}
            />
          </div>

          <Button
            onClick={generateContent}
            disabled={isGenerating || !contentTheme.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Post
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content Preview */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Generated Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedContent ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  {React.createElement(PLATFORMS[generatedContent.platform].icon, { className: 'w-5 h-5' })}
                  <span className="font-semibold">{generatedContent.platform}</span>
                  <Badge variant="outline" className="ml-auto">{generatedContent.best_posting_time}</Badge>
                </div>
                
                <p className="text-gray-800 whitespace-pre-wrap mb-3">{generatedContent.caption}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {generatedContent.hashtags?.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs text-blue-600">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {generatedContent.engagement_tips && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-2">💡 Engagement Tips:</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      {generatedContent.engagement_tips.map((tip, idx) => (
                        <li key={idx}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => copyToClipboard(generatedContent.caption + '\n\n' + (generatedContent.hashtags ? generatedContent.hashtags.join(' ') : ''))}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={() => onImageGenerate(generatedContent.image_description)}
                  variant="outline"
                  className="flex-1"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Generate Image
                </Button>
                <Button
                  onClick={saveToSchedule}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>Your generated content will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ContentCalendarSection({ trends, queryClient }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]); // YYYY-MM-DD
  const [aiGeneratedOutline, setAiGeneratedOutline] = useState(null);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [showAddEditEventForm, setShowAddEditEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: selectedDate,
    platform: 'Instagram',
    content_type: 'Post',
    status: 'Planned'
  });

  const { data: calendarEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['contentCalendarEvents', currentMonth, currentYear],
    queryFn: () => base44.entities.ContentCalendarEvent.list({
      filter: {
        date__gte: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
        date__lte: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${new Date(currentYear, currentMonth + 1, 0).getDate()}`
      },
      sort: 'date'
    }),
    initialData: []
  });

  const createEventMutation = useMutation({
    mutationFn: (eventData) => base44.entities.ContentCalendarEvent.create(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries(['contentCalendarEvents']);
      toast.success('Calendar event added!');
      setShowAddEditEventForm(false);
      setNewEvent({ title: '', description: '', date: selectedDate, platform: 'Instagram', content_type: 'Post', status: 'Planned' });
    },
    onError: (error) => {
      console.error('Error creating event:', error);
      toast.error('Failed to add event.');
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: (eventData) => base44.entities.ContentCalendarEvent.update(editingEvent.id, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries(['contentCalendarEvents']);
      toast.success('Calendar event updated!');
      setShowAddEditEventForm(false);
      setEditingEvent(null);
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      toast.error('Failed to update event.');
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId) => base44.entities.ContentCalendarEvent.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries(['contentCalendarEvents']);
      toast.success('Calendar event deleted!');
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event.');
    }
  });

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 for Sunday, 1 for Monday

  const days = Array.from({ length: daysInMonth(currentMonth, currentYear) }, (_, i) => i + 1);

  const getDayEvents = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarEvents.filter(event => event.date === dateStr);
  };

  const handleDayClick = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setNewEvent(prev => ({ ...prev, date: dateStr }));
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleAddEventClick = () => {
    setEditingEvent(null);
    setNewEvent({ title: '', description: '', date: selectedDate, platform: 'Instagram', content_type: 'Post', status: 'Planned' });
    setShowAddEditEventForm(true);
  };

  const handleEditEventClick = (event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      platform: event.platform,
      content_type: event.content_type,
      status: event.status
    });
    setShowAddEditEventForm(true);
  };

  const handleSaveEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.platform) {
      toast.error('Title, date, and platform are required.');
      return;
    }

    if (editingEvent) {
      updateEventMutation.mutate(newEvent);
    } else {
      createEventMutation.mutate(newEvent);
    }
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(id);
    }
  };

  const handleGenerateCalendarOutline = async () => {
    setIsGeneratingOutline(true);
    try {
      const trendingTopics = trends.slice(0, 5).map(t => t.trend_name).join(', ');
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a content calendar outline for the next 30 days starting from ${new Date().toLocaleDateString()}.
        
        Focus on themes relevant to [Your Niche/Content Type - e.g., wellness, productivity, tech].
        Include a mix of content types suitable for various platforms (Instagram, Facebook, TikTok, YouTube, LinkedIn, Twitter).
        Consider current trending topics: ${trendingTopics || 'None identified'}.

        For each day, suggest:
        - Date (YYYY-MM-DD)
        - Theme/Topic for the day
        - Suggested Platform
        - Content Type (e.g., Post, Reel, Story, Live, Article, Tweet)
        - Brief description of the content idea
        - Relevant Call to Action (optional)
        - Status (Planned, Draft, Scheduled, Posted)

        Return as a JSON array of objects.`,
        response_json_schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              date: { type: "string", format: "date" },
              title: { type: "string" },
              platform: { type: "string" },
              content_type: { type: "string" },
              description: { type: "string" },
              call_to_action: { type: "string" },
              status: { type: "string" }
            },
            required: ["date", "title", "platform", "content_type", "description", "status"]
          }
        }
      });

      if (response && Array.isArray(response)) {
        setAiGeneratedOutline(response);
        toast.success('AI Calendar Outline Generated! ✨');
      }
    } catch (error) {
      console.error('Error generating calendar outline:', error);
      toast.error('Failed to generate calendar outline.');
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const handleImportAiOutline = async () => {
    if (!aiGeneratedOutline || aiGeneratedOutline.length === 0) {
      toast.error('No AI outline to import.');
      return;
    }
    
    try {
      await Promise.all(aiGeneratedOutline.map(event =>
        base44.entities.ContentCalendarEvent.create({
          ...event,
          ai_generated: true,
          call_to_action: event.call_to_action || null, // Ensure nullable fields are handled
        })
      ));
      queryClient.invalidateQueries(['contentCalendarEvents']);
      setAiGeneratedOutline(null);
      toast.success('AI outline imported to calendar!');
    } catch (error) {
      console.error('Error importing AI outline:', error);
      toast.error('Failed to import AI outline.');
    }
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Content Calendar</h2>
          <p className="text-gray-600 text-sm">Plan and organize your social media content</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateCalendarOutline}
            disabled={isGeneratingOutline}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {isGeneratingOutline ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating Outline...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />Generate AI Outline</>
            )}
          </Button>
          <Button onClick={handleAddEventClick} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {aiGeneratedOutline && aiGeneratedOutline.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" /> AI Content Outline
            </CardTitle>
            <CardDescription>Review the AI-generated suggestions and import them to your calendar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiGeneratedOutline.map((item, idx) => (
              <div key={idx} className="p-3 bg-white/60 rounded-lg border border-blue-200 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-blue-900">{item.date} - {item.title}</p>
                  <p className="text-sm text-blue-800">{item.description}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">{item.platform}</Badge>
                    <Badge variant="secondary">{item.content_type}</Badge>
                    {item.call_to_action && <Badge variant="outline">CTA: {item.call_to_action}</Badge>}
                  </div>
                </div>
              </div>
            ))}
            <Button onClick={handleImportAiOutline} className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
              <Save className="w-4 h-4 mr-2" /> Import All to Calendar
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-2 border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={handlePrevMonth}><ArrowUpRight className="rotate-270 w-4 h-4" /></Button>
              <CardTitle className="text-xl">{monthName} {currentYear}</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleNextMonth}><ArrowUpRight className="rotate-90 w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-600 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16"></div>
              ))}
              {days.map(day => {
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasEvents = getDayEvents(day).length > 0;
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === today.toISOString().split('T')[0];

                return (
                  <div
                    key={day}
                    className={`
                      relative flex flex-col items-center justify-center p-1 rounded-lg cursor-pointer
                      ${isToday ? 'bg-purple-100 border border-purple-400' : ''}
                      ${isSelected ? 'bg-purple-500 text-white shadow-lg' : 'bg-gray-50 hover:bg-purple-50'}
                      ${hasEvents && !isSelected ? 'border border-blue-300' : ''}
                    `}
                    onClick={() => handleDayClick(day)}
                  >
                    <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                      {day}
                    </span>
                    {hasEvents && !isSelected && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                     {hasEvents && isSelected && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Events & Add/Edit Form */}
        <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border-2 border-purple-200 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-purple-600" />
              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a Date'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {showAddEditEventForm ? (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-lg">{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
                <div>
                  <Label htmlFor="event-title">Title</Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="event-platform">Platform</Label>
                  <Select value={newEvent.platform} onValueChange={(val) => setNewEvent({ ...newEvent, platform: val })}>
                    <SelectTrigger id="event-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(PLATFORMS).map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="event-type">Content Type</Label>
                  <Input
                    id="event-type"
                    value={newEvent.content_type}
                    onChange={(e) => setNewEvent({ ...newEvent, content_type: e.target.value })}
                    placeholder="e.g., Post, Reel, Story"
                  />
                </div>
                <div>
                  <Label htmlFor="event-status">Status</Label>
                  <Select value={newEvent.status} onValueChange={(val) => setNewEvent({ ...newEvent, status: val })}>
                    <SelectTrigger id="event-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Planned', 'Draft', 'Scheduled', 'Posted', 'Completed', 'Cancelled'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveEvent} disabled={createEventMutation.isLoading || updateEventMutation.isLoading}>
                    <Save className="w-4 h-4 mr-2" /> {editingEvent ? 'Update Event' : 'Add Event'}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowAddEditEventForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {isLoadingEvents ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  </div>
                ) : (
                  <>
                    {getDayEvents(new Date(selectedDate).getDate()).length > 0 ? (
                      <div className="space-y-3">
                        {getDayEvents(new Date(selectedDate).getDate()).map(event => {
                          const Icon = PLATFORMS[event.platform]?.icon || MessageSquare;
                          return (
                            <div key={event.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Icon className="w-4 h-4 text-gray-600" />
                                    <span className="font-semibold text-gray-800">{event.title}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{event.description}</p>
                                  <div className="flex flex-wrap gap-1">
                                    <Badge variant="secondary">{event.platform}</Badge>
                                    <Badge variant="outline">{event.content_type}</Badge>
                                    <Badge className="bg-purple-100 text-purple-700">{event.status}</Badge>
                                    {event.ai_generated && (
                                      <Badge className="bg-blue-100 text-blue-700">AI</Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1 mt-1">
                                  <Button variant="ghost" size="icon" onClick={() => handleEditEventClick(event)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p>No events planned for this day.</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ScheduleSection({ scheduledPosts }) {
  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Optimal Posting Times
          </CardTitle>
          <CardDescription>
            Platform-specific best times based on engagement data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(PLATFORMS).map(([platform, data]) => {
              const Icon = data.icon;
              return (
                <div key={platform} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${data.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800">{platform}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.bestTimes.map((time, idx) => (
                      <Badge key={idx} className="bg-purple-100 text-purple-700">
                        <Clock className="w-3 h-3 mr-1" />
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Posts */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
        <CardHeader>
          <CardTitle>Your Scheduled Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledPosts.length > 0 ? (
            <div className="space-y-3">
              {scheduledPosts.map(post => {
                const Icon = PLATFORMS[post.platform]?.icon || MessageSquare;
                return (
                  <div key={post.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="font-semibold text-sm">{post.platform}</span>
                        <Badge variant="outline">{post.status}</Badge>
                        {post.ai_generated && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(post.post_at).toLocaleDateString()} at {new Date(post.post_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>
                    
                    {post.engagement_data && (
                      <div className="flex gap-3 mt-3 text-xs text-gray-600">
                        {post.engagement_data.likes > 0 && (
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {post.engagement_data.likes}
                          </span>
                        )}
                        {post.engagement_data.comments > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {post.engagement_data.comments}
                          </span>
                        )}
                        {post.engagement_data.shares > 0 && (
                          <span className="flex items-center gap-1">
                            <Share2 className="w-3 h-3" /> {post.engagement_data.shares}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No scheduled posts yet. Generate some content to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdvancedAnalyticsSection({ scheduledPosts, metrics, queryClient }) {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const platformMetrics = metrics.filter(m => selectedPlatform === 'all' || m.platform === selectedPlatform);

  // Prepare chart data
  const followerGrowthData = platformMetrics.slice(0, 30).reverse().map(m => ({
    date: new Date(m.metric_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    followers: m.followers_count,
    growth: m.follower_growth || 0,
    platform: m.platform
  }));

  const engagementData = platformMetrics.slice(0, 30).reverse().map(m => ({
    date: new Date(m.metric_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    engagement_rate: m.engagement_rate,
    likes: m.likes_count,
    comments: m.comments_count,
    shares: m.shares_count
  }));

  const reachData = platformMetrics.slice(0, 30).reverse().map(m => ({
    date: new Date(m.metric_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    reach: m.reach,
    impressions: m.impressions,
    profile_views: m.profile_views
  }));

  // Calculate key metrics
  const latestMetrics = platformMetrics[0] || {};
  const previousMetrics = platformMetrics[1] || {};
  
  const followerChange = latestMetrics.followers_count - (previousMetrics.followers_count || 0);
  const engagementChange = latestMetrics.engagement_rate - (previousMetrics.engagement_rate || 0);
  
  const avgEngagementRate = platformMetrics.length > 0
    ? platformMetrics.reduce((sum, m) => sum + (m.engagement_rate || 0), 0) / platformMetrics.length
    : 0;

  const generateAIInsights = async () => {
    setIsAnalyzing(true);
    try {
      const metricsContext = JSON.stringify(platformMetrics.slice(0, 30));
      const postsContext = JSON.stringify(scheduledPosts.slice(0, 20).map(p => ({
        platform: p.platform,
        theme: p.content_theme,
        engagement: p.engagement_data
      })));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this social media performance data and provide deep insights:

Recent Metrics (last 30 days):
${metricsContext}

Recent Posts:
${postsContext}

Provide detailed analysis in these categories:
1. Performance Trends - What's improving or declining
2. Content Recommendations - What type of content performs best
3. Audience Behavior - When and how your audience engages
4. Growth Opportunities - Specific actionable strategies
5. Warning Flags - Areas that need immediate attention
6. Competitive Edge - Unique angles to explore

Return structured insights as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            performance_summary: { type: "string" },
            top_insights: { type: "array", items: { type: "string" } },
            content_recommendations: { type: "array", items: { type: "string" } },
            best_performing_themes: { type: "array", items: { type: "string" } },
            audience_behavior_patterns: { type: "array", items: { type: "string" } },
            growth_opportunities: { type: "array", items: { type: "string" } },
            warning_flags: { type: "array", items: { type: "string" } },
            action_plan: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAiInsights(response);
      toast.success('AI Analysis Complete! ✨');
    } catch (error) {
      console.error('Error analyzing data:', error);
      toast.error('Failed to analyze');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Platform Filter */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Advanced Analytics</h2>
          <p className="text-gray-600 text-sm">Deep insights powered by AI</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {Object.keys(PLATFORMS).map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={generateAIInsights}
            disabled={isAnalyzing || metrics.length === 0}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Analyzing...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />AI Insights</>
            )}
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Followers"
          value={latestMetrics.followers_count || 0}
          change={followerChange}
          icon={Users}
          color="from-blue-500 to-cyan-600"
        />
        <MetricCard
          title="Engagement Rate"
          value={`${(latestMetrics.engagement_rate || 0).toFixed(2)}%`}
          change={engagementChange}
          icon={Heart}
          color="from-pink-500 to-rose-600"
        />
        <MetricCard
          title="Reach"
          value={latestMetrics.reach || 0}
          change={latestMetrics.reach - (previousMetrics.reach || 0)}
          icon={Eye}
          color="from-purple-500 to-indigo-600"
        />
        <MetricCard
          title="Impressions"
          value={latestMetrics.impressions || 0}
          change={latestMetrics.impressions - (previousMetrics.impressions || 0)}
          icon={Activity}
          color="from-orange-500 to-amber-600"
        />
      </div>

      {/* AI Insights Panel */}
      {aiInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">Performance Summary</h4>
                <p className="text-purple-800">{aiInsights.performance_summary}</p>
              </div>

              {aiInsights.top_insights && aiInsights.top_insights.length > 0 && (
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">🎯 Top Insights</h4>
                  <ul className="space-y-2">
                    {aiInsights.top_insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-purple-800">
                        <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiInsights.content_recommendations && aiInsights.content_recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">📝 Content Recommendations</h4>
                  <ul className="space-y-2">
                    {aiInsights.content_recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-purple-800">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiInsights.action_plan && aiInsights.action_plan.length > 0 && (
                <div className="p-4 bg-white/60 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">🚀 Action Plan</h4>
                  <ol className="space-y-2 list-decimal list-inside">
                    {aiInsights.action_plan.map((action, idx) => (
                      <li key={idx} className="text-sm text-purple-800">{action}</li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts Grid */}
      {metrics.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Follower Growth Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">Follower Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={followerGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip />
                  <Area type="monotone" dataKey="followers" stroke="#8b5cf6" fill="#c4b5fd" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement Rate Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">Engagement Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="engagement_rate" stroke="#ec4899" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Reach & Impressions */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">Reach & Impressions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reachData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="reach" fill="#8b5cf6" />
                  <Bar dataKey="impressions" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement Breakdown */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">Engagement Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="likes" fill="#ec4899" stackId="a" />
                  <Bar dataKey="comments" fill="#8b5cf6" stackId="a" />
                  <Bar dataKey="shares" fill="#3b82f6" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">No Analytics Data Yet</h3>
            <p className="text-gray-500 mb-4">
              Start tracking your social media metrics to see beautiful charts and AI-powered insights
            </p>
            <Button
              onClick={() => {
                // Quick add sample data for demo
                const sampleMetric = {
                  platform: 'Instagram',
                  metric_date: new Date().toISOString().split('T')[0],
                  followers_count: 1250,
                  engagement_rate: 3.5,
                  reach: 5800,
                  impressions: 12400,
                  likes_count: 450,
                  comments_count: 28,
                  shares_count: 12
                };
                base44.entities.SocialMediaMetrics.create(sampleMetric).then(() => {
                  queryClient.invalidateQueries(['socialMetrics']);
                  toast.success('Sample data added!');
                });
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Sample Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CompetitorAnalysisSection({ competitors, queryClient }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    competitor_name: '',
    platform: 'Instagram',
    handle: '',
    profile_url: ''
  });

  const analyzeCompetitor = async (competitor) => {
    setIsAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this competitor for social media strategy insights:

Competitor: ${competitor.competitor_name}
Platform: ${competitor.platform}
Handle: ${competitor.handle}
Current Followers: ${competitor.followers_count || 'Unknown'}

Research and provide:
1. Content Strategy Analysis - What themes and formats they use
2. Strengths - What they do exceptionally well
3. Weaknesses/Gaps - Opportunities they're missing
4. Posting Patterns - Frequency and timing insights
5. Engagement Strategy - How they interact with audience
6. Differentiation Opportunities - How to stand out from them

Be specific and actionable.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            content_themes: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } },
            posting_frequency: { type: "string" },
            avg_engagement_rate: { type: "number" },
            top_performing_content_types: { type: "array", items: { type: "string" } },
            ai_analysis: { type: "string" }
          }
        }
      });

      await base44.entities.CompetitorProfile.update(competitor.id, {
        ...response,
        last_analyzed: new Date().toISOString()
      });

      queryClient.invalidateQueries(['competitors']);
      toast.success('Competitor analyzed! ✨');
    } catch (error) {
      console.error('Error analyzing competitor:', error);
      toast.error('Failed to analyze competitor');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addCompetitor = async () => {
    if (!newCompetitor.competitor_name || !newCompetitor.handle) {
      toast.error('Please fill in competitor name and handle');
      return;
    }

    try {
      const created = await base44.entities.CompetitorProfile.create(newCompetitor);
      queryClient.invalidateQueries(['competitors']);
      setShowAddForm(false);
      setNewCompetitor({ competitor_name: '', platform: 'Instagram', handle: '', profile_url: '' });
      
      // Auto-analyze the new competitor
      await analyzeCompetitor(created);
    } catch (error) {
      console.error('Error adding competitor:', error);
      toast.error('Failed to add competitor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Competitor Analysis</h2>
          <p className="text-gray-600 text-sm">Track and learn from competitors in your niche</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Competitor
        </Button>
      </div>

      {/* Add Competitor Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Add New Competitor</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Competitor Name</Label>
                    <Input
                      value={newCompetitor.competitor_name}
                      onChange={(e) => setNewCompetitor({...newCompetitor, competitor_name: e.target.value})}
                      placeholder="e.g., Wellness Guru"
                    />
                  </div>
                  <div>
                    <Label>Platform</Label>
                    <Select value={newCompetitor.platform} onValueChange={(val) => setNewCompetitor({...newCompetitor, platform: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(PLATFORMS).map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Handle/Username</Label>
                    <Input
                      value={newCompetitor.handle}
                      onChange={(e) => setNewCompetitor({...newCompetitor, handle: e.target.value})}
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <Label>Profile URL</Label>
                    <Input
                      value={newCompetitor.profile_url}
                      onChange={(e) => setNewCompetitor({...newCompetitor, profile_url: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <Button onClick={addCompetitor} className="w-full bg-purple-600 hover:bg-purple-700">
                  <Search className="w-4 h-4 mr-2" />
                  Add & Analyze Competitor
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Competitors List */}
      {competitors.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {competitors.map(comp => {
            const Icon = PLATFORMS[comp.platform]?.icon || MessageSquare;
            return (
              <Card key={comp.id} className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        {comp.competitor_name}
                      </CardTitle>
                      <CardDescription>@{comp.handle} on {comp.platform}</CardDescription>
                    </div>
                    <a href={comp.profile_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {comp.followers_count && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Followers</span>
                      <span className="font-bold text-lg text-purple-600">{comp.followers_count.toLocaleString()}</span>
                    </div>
                  )}

                  {comp.avg_engagement_rate && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Avg Engagement</span>
                      <span className="font-bold text-lg text-pink-600">{comp.avg_engagement_rate.toFixed(2)}%</span>
                    </div>
                  )}

                  {comp.strengths && comp.strengths.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">💪 Strengths:</p>
                      <ul className="space-y-1">
                        {comp.strengths.slice(0, 3).map((strength, idx) => (
                          <li key={idx} className="text-xs text-gray-600">• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {comp.opportunities && comp.opportunities.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-700 mb-2">🎯 Your Opportunities:</p>
                      <ul className="space-y-1">
                        {comp.opportunities.slice(0, 3).map((opp, idx) => (
                          <li key={idx} className="text-xs text-green-600">• {opp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => analyzeCompetitor(comp)}
                    variant="outline"
                    className="w-full"
                    disabled={isAnalyzing}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Re-analyze
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
          <CardContent className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">No Competitors Tracked</h3>
            <p className="text-gray-500 mb-4">
              Add competitors to get AI-powered analysis and find opportunities to differentiate
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TrendForecastingSection({ trends, queryClient }) {
  const [isDiscovering, setIsDiscovering] = useState(false);

  const discoverTrends = async () => {
    setIsDiscovering(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Research current social media trends (as of ${new Date().toLocaleDateString()}) and identify the top 10 trending topics, formats, and content types across Instagram, TikTok, YouTube, and LinkedIn.

For each trend, provide:
1. Trend name and description
2. Which platforms it's trending on
3. Type of trend (audio, visual, challenge, format, topic, hashtag)
4. Popularity score (0-100)
5. Predicted lifespan (short_term, medium_term, long_term, evergreen)
6. How content creators can use it
7. Suggested hashtags
8. AI forecast about its future

Focus on trends relevant to wellness, personal growth, family, and lifestyle content.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trend_name: { type: "string" },
                  description: { type: "string" },
                  platforms: { type: "array", items: { type: "string" } },
                  trend_type: { type: "string" },
                  popularity_score: { type: "number" },
                  predicted_lifespan: { type: "string" },
                  how_to_use: { type: "string" },
                  suggested_hashtags: { type: "array", items: { type: "string" } },
                  ai_forecast: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response.trends) {
        for (const trend of response.trends) {
          await base44.entities.ContentTrend.create({
            ...trend,
            discovered_date: new Date().toISOString().split('T')[0],
            status: 'rising',
            relevance_to_niche: 75
          });
        }
        queryClient.invalidateQueries(['contentTrends']);
        toast.success(`Discovered ${response.trends.length} trends! 🚀`);
      }
    } catch (error) {
      console.error('Error discovering trends:', error);
      toast.error('Failed to discover trends');
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Trend Forecasting</h2>
          <p className="text-gray-600 text-sm">AI-powered trend discovery and predictions</p>
        </div>
        <Button
          onClick={discoverTrends}
          disabled={isDiscovering}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {isDiscovering ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" />Discovering...</>
          ) : (
            <><TrendingUp className="w-4 h-4 mr-2" />Discover Trends</>
          )}
        </Button>
      </div>

      {trends.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trends.map(trend => (
            <motion.div
              key={trend.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{trend.trend_name}</CardTitle>
                      <div className="flex gap-2 mb-2">
                        <Badge className={`
                          ${trend.status === 'rising' ? 'bg-green-100 text-green-700' : ''}
                          ${trend.status === 'peak' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${trend.status === 'declining' ? 'bg-orange-100 text-orange-700' : ''}
                        `}>
                          {trend.status}
                        </Badge>
                        <Badge variant="outline">{trend.trend_type}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{trend.popularity_score}</div>
                      <div className="text-xs text-gray-500">popularity</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-700">{trend.description}</p>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">Platforms:</p>
                    <div className="flex flex-wrap gap-1">
                      {trend.platforms?.map((platform, idx) => {
                        const Icon = PLATFORMS[platform]?.icon || MessageSquare;
                        return (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Icon className="w-3 h-3 mr-1" />
                            {platform}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {trend.suggested_hashtags && trend.suggested_hashtags.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Hashtags:</p>
                      <div className="flex flex-wrap gap-1">
                        {trend.suggested_hashtags.slice(0, 5).map((tag, idx) => (
                          <Badge key={idx} className="bg-blue-100 text-blue-700 text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs font-semibold text-purple-900 mb-1">💡 How to Use:</p>
                    <p className="text-xs text-purple-700">{trend.how_to_use}</p>
                  </div>

                  {trend.ai_forecast && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-semibold text-blue-900 mb-1">🔮 AI Forecast:</p>
                      <p className="text-xs text-blue-700">{trend.ai_forecast}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
          <CardContent className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">No Trends Discovered Yet</h3>
            <p className="text-gray-500 mb-4">
              Let AI research current trends and forecast what's coming next
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ title, value, change, icon: Icon, color }) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          </div>
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {change !== undefined && change !== 0 && (
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
            {isPositive && <ArrowUpRight className="w-4 h-4" />}
            {isNegative && <ArrowDownRight className="w-4 h-4" />}
            {!isPositive && !isNegative && <Minus className="w-4 h-4" />}
            <span className="font-semibold">{Math.abs(change).toLocaleString()}</span>
            <span className="text-gray-500">vs yesterday</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

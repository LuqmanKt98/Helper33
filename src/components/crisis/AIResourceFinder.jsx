import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Send,
  Sparkles,
  Loader2,
  BookmarkPlus,
  ExternalLink,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Globe,
  Heart,
  Brain,
  MessageCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AIResourceFinder({ onClose }) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [foundResources, setFoundResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [savingNotes, setSavingNotes] = useState({});
  const messagesEndRef = useRef(null);

  const saveResourceMutation = useMutation({
    mutationFn: (resourceData) => base44.entities.DiscoveredResource.create(resourceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discovered-resources'] });
      toast.success('✅ Resource saved to your collection!');
    },
    onError: () => {
      toast.error('Failed to save resource');
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, foundResources]);

  const addMessage = (role, content, resources = null) => {
    const newMessage = {
      id: Date.now(),
      role,
      content,
      resources,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const searchResources = async (query) => {
    setIsSearching(true);
    addMessage('user', query);

    try {
      // Use AI to search and analyze resources
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `User is searching for: "${query}"

Please help them find the best resources. Search the web and provide:
1. A warm, supportive response acknowledging their search
2. 3-5 highly relevant resources with complete details
3. Brief explanation of why each resource might help

For each resource, provide in this exact JSON format:
{
  "message": "Your supportive message here",
  "resources": [
    {
      "name": "Resource Name",
      "category": "crisis_support" (or other relevant category),
      "description": "What this resource offers and why it's helpful",
      "website_url": "https://example.com",
      "phone_number": "1-800-XXX-XXXX or null",
      "email": "contact@example.com or null",
      "availability": "24_7 or business_hours or varies",
      "cost": "free or sliding_scale or varies",
      "services": ["service 1", "service 2"],
      "why_recommended": "Brief reason this is a good match"
    }
  ]
}`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Supportive response to the user"
            },
            resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { type: "string" },
                  description: { type: "string" },
                  website_url: { type: "string" },
                  phone_number: { type: "string" },
                  email: { type: "string" },
                  availability: { type: "string" },
                  cost: { type: "string" },
                  services: {
                    type: "array",
                    items: { type: "string" }
                  },
                  why_recommended: { type: "string" }
                },
                required: ["name", "category", "description"]
              }
            }
          },
          required: ["message", "resources"]
        }
      });

      addMessage('assistant', response.message, response.resources);
      setFoundResources(response.resources || []);
    } catch (error) {
      console.error('Search error:', error);
      addMessage('assistant', "I'm having trouble searching right now. Please try again or browse the pre-loaded resources in the directory. 💙");
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isSearching) return;
    searchResources(input);
    setInput('');
  };

  const handleSaveResource = async (resource, index) => {
    const notes = savingNotes[index] || '';
    
    const resourceData = {
      resource_name: resource.name,
      category: resource.category || 'other',
      description: resource.description,
      website_url: resource.website_url || null,
      phone_number: resource.phone_number || null,
      email: resource.email || null,
      availability: resource.availability || 'varies',
      cost: resource.cost || 'varies',
      services_offered: resource.services || [],
      discovered_via: 'ai_search',
      search_query: messages.find(m => m.role === 'user')?.content || '',
      ai_summary: resource.why_recommended || resource.description,
      user_notes: notes,
      source_data: {
        title: resource.name,
        snippet: resource.description,
        source_url: resource.website_url || '',
        fetched_at: new Date().toISOString()
      }
    };

    await saveResourceMutation.mutateAsync(resourceData);
    setSavingNotes(prev => ({ ...prev, [index]: '' }));
  };

  const quickSearches = [
    { icon: Heart, label: 'Crisis Hotlines', query: 'mental health crisis hotlines available 24/7', color: 'from-red-500 to-rose-500' },
    { icon: Brain, label: 'Therapy Services', query: 'affordable therapy and counseling services near me', color: 'from-purple-500 to-pink-500' },
    { icon: MessageCircle, label: 'Support Groups', query: 'grief and loss support groups online and in-person', color: 'from-blue-500 to-cyan-500' },
    { icon: Sparkles, label: 'Wellness Programs', query: 'free wellness and mental health programs', color: 'from-green-500 to-emerald-500' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-6xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="shadow-2xl border-0 overflow-hidden">
            {/* Header */}
            <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white relative overflow-hidden">
              <motion.div
                className="absolute inset-0 opacity-20"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
                style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '50px 50px'
                }}
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Search className="w-7 h-7" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl">🔍 AI Resource Finder</CardTitle>
                    <p className="text-white/90 text-sm">Let me help you find the perfect resources</p>
                  </div>
                </div>
                {onClose && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="grid lg:grid-cols-3 divide-x divide-gray-200">
                {/* Chat Section */}
                <div className="lg:col-span-2 flex flex-col h-[600px]">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
                    {messages.length === 0 && !isSearching && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                      >
                        <motion.div
                          animate={{
                            y: [0, -10, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-xl"
                        >
                          <Sparkles className="w-10 h-10 text-white" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          👋 Hi! I'm your AI Resource Tutor
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Tell me what kind of help or resources you're looking for, and I'll search the web 
                          to find the perfect matches for you.
                        </p>

                        {/* Quick Search Suggestions */}
                        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                          {quickSearches.map((quick, idx) => (
                            <motion.button
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setInput(quick.query);
                                setTimeout(() => handleSend(), 100);
                              }}
                              className={`p-4 rounded-xl bg-gradient-to-r ${quick.color} text-white text-left shadow-lg hover:shadow-xl transition-all`}
                            >
                              <quick.icon className="w-6 h-6 mb-2" />
                              <p className="text-sm font-semibold">{quick.label}</p>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <AnimatePresence>
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <div className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                              <motion.div
                                animate={{
                                  rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg"
                              >
                                <Sparkles className="w-5 h-5 text-white" />
                              </motion.div>
                            )}
                            <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'bg-white border-2 border-purple-200'} rounded-2xl p-4 shadow-lg`}>
                              <p className={`text-sm leading-relaxed ${msg.role === 'assistant' ? 'text-gray-800' : ''}`}>
                                {msg.content}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isSearching && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg"
                        >
                          <Search className="w-5 h-5 text-white" />
                        </motion.div>
                        <div className="bg-white rounded-2xl p-4 border-2 border-purple-200 shadow-lg">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                            <span className="text-sm text-gray-700">Searching the web for you...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="border-t bg-white p-4">
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="What kind of resources are you looking for?"
                        disabled={isSearching}
                        className="flex-1 border-2 border-purple-300 focus:border-purple-500"
                      />
                      <Button
                        type="submit"
                        disabled={!input.trim() || isSearching}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </form>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      💡 Example: "I need free therapy for grief" or "24/7 crisis support"
                    </p>
                  </div>
                </div>

                {/* Resources Panel */}
                <div className="lg:col-span-1 flex flex-col h-[600px] bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="p-4 border-b bg-white/50 backdrop-blur-sm">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <BookmarkPlus className="w-5 h-5 text-purple-600" />
                      Found Resources ({foundResources.length})
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {foundResources.length === 0 && !isSearching && (
                      <div className="text-center py-12">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mx-auto mb-3"
                        >
                          <Search className="w-8 h-8 text-gray-400" />
                        </motion.div>
                        <p className="text-gray-500 text-sm">
                          Resources will appear here when you search
                        </p>
                      </div>
                    )}

                    <AnimatePresence>
                      {foundResources.map((resource, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card className="bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all">
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-gray-900 text-sm flex-1">{resource.name}</h4>
                                <Badge className="bg-purple-100 text-purple-800 text-xs">
                                  {resource.category?.replace(/_/g, ' ')}
                                </Badge>
                              </div>

                              <p className="text-xs text-gray-600 line-clamp-3">
                                {resource.description}
                              </p>

                              {resource.why_recommended && (
                                <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
                                  <p className="text-xs text-purple-900">
                                    <strong>✨ Why recommended:</strong> {resource.why_recommended}
                                  </p>
                                </div>
                              )}

                              {/* Contact Info */}
                              <div className="space-y-1.5 text-xs">
                                {resource.website_url && (
                                  <a
                                    href={resource.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                  >
                                    <Globe className="w-3 h-3" />
                                    <span className="underline">Visit Website</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {resource.phone_number && (
                                  <a
                                    href={`tel:${resource.phone_number}`}
                                    className="flex items-center gap-2 text-green-600 hover:text-green-800"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>{resource.phone_number}</span>
                                  </a>
                                )}
                                {resource.email && (
                                  <a
                                    href={`mailto:${resource.email}`}
                                    className="flex items-center gap-2 text-purple-600 hover:text-purple-800"
                                  >
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{resource.email}</span>
                                  </a>
                                )}
                                {resource.availability && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-3 h-3" />
                                    <span>{resource.availability.replace(/_/g, ' ')}</span>
                                  </div>
                                )}
                                {resource.cost && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <DollarSign className="w-3 h-3" />
                                    <span>{resource.cost.replace(/_/g, ' ')}</span>
                                  </div>
                                )}
                              </div>

                              {/* Save Section */}
                              <div className="pt-3 border-t border-purple-100 space-y-2">
                                <Textarea
                                  placeholder="Add personal notes (optional)..."
                                  value={savingNotes[idx] || ''}
                                  onChange={(e) => setSavingNotes(prev => ({ ...prev, [idx]: e.target.value }))}
                                  className="h-16 text-xs border-purple-200 focus:border-purple-400"
                                />
                                <Button
                                  onClick={() => handleSaveResource(resource, idx)}
                                  disabled={saveResourceMutation.isPending}
                                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                  size="sm"
                                >
                                  {saveResourceMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <BookmarkPlus className="w-4 h-4 mr-2" />
                                      Save to My Resources
                                    </>
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageCircle,
  Send,
  CheckCircle,
  Sparkles,
  Star,
  Trophy,
  X,
  ChevronDown,
  ChevronUp,
  Bot,
  TrendingUp,
  Award,
  Target,
  Brain,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function ParentMessageCenter({ childName }) {
  const queryClient = useQueryClient();
  const [showMessages, setShowMessages] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [activeTab, setActiveTab] = useState('inbox');
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const { data: childProgress } = useQuery({
    queryKey: ['childProgress'],
    queryFn: async () => {
      try {
        const allProgress = await base44.entities.ChildProgress.list();
        return allProgress[0];
      } catch (error) {
        return null;
      }
    }
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ChildProgress.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['childProgress']);
    }
  });

  // Get messages from communication log
  const messagesForChild = (childProgress?.communication_log || [])
    .filter(entry => entry.visibility === 'shared_with_child' || entry.visibility === 'shared_with_all')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const aiMessages = messagesForChild.filter(m => m.author_name === 'AI Assistant');
  const parentMessages = messagesForChild.filter(m => m.author_name !== 'AI Assistant');
  const unreadCount = messagesForChild.filter(m => !m.child_acknowledged).length;

  // Generate AI Daily Summary
  const generateDailySummary = async () => {
    if (!childProgress || !user) return;

    setGeneratingSummary(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const stats = user.kids_studio_stats || {};
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI educational assistant communicating with a parent about their child's learning progress.

Child: ${childProgress.child_name}, Age ${childProgress.child_age}

Today's Activity Summary:
- Total Points: ${stats.points || 0}
- Activities Completed Today: ${stats.total_activities || 0}
- Stickers Earned: ${stats.stickers_earned || 0}

Module Progress:
${JSON.stringify(childProgress.module_progress || {}, null, 2)}

Recent Achievements:
${(childProgress.achievements || []).slice(0, 3).map(a => `- ${a.achievement_name}`).join('\n') || 'None yet'}

Current Learning Goals:
${(childProgress.learning_goals || []).filter(g => g.status === 'active').slice(0, 3).map(g => `- ${g.description} (${g.progress_percentage}% complete)`).join('\n') || 'No active goals'}

Generate a warm, positive daily summary message for the parent that:
1. Celebrates specific achievements (be specific about what they did well)
2. Notes any areas where gentle encouragement might help
3. Suggests 1-2 activities for tomorrow based on their interests: ${(childProgress.interests || []).join(', ')}
4. Is about 150-200 words
5. Uses an encouraging, supportive tone

Return JSON with:
{
  "title": "brief title for the summary",
  "content": "the full summary message",
  "highlights": ["key highlight 1", "key highlight 2", "key highlight 3"],
  "suggested_activities": ["activity 1", "activity 2"],
  "areas_for_attention": ["area 1 if any", "area 2 if any"] (empty array if doing great)
}`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
            highlights: { type: "array", items: { type: "string" } },
            suggested_activities: { type: "array", items: { type: "string" } },
            areas_for_attention: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Add to communication log as AI message
      const newLogEntry = {
        log_id: `ai_summary_${Date.now()}`,
        timestamp: new Date().toISOString(),
        author_name: 'AI Assistant',
        author_email: 'ai@helper33.com',
        entry_type: 'observation',
        title: response.title,
        content: response.content,
        related_module: 'daily_summary',
        visibility: 'shared_with_all',
        child_acknowledged: false,
        priority: 'medium',
        tags: ['daily_summary', 'ai_generated'],
        ai_highlights: response.highlights,
        ai_suggestions: response.suggested_activities,
        ai_attention_areas: response.areas_for_attention
      };

      const updatedLog = [...(childProgress.communication_log || []), newLogEntry];

      await updateProgressMutation.mutateAsync({
        id: childProgress.id,
        data: { communication_log: updatedLog }
      });

      toast.success('Daily summary generated! 🎉');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Could not generate summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Generate achievement message
  const generateAchievementMessage = async (achievement) => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a warm, celebratory message to a parent about their child's achievement.

Child: ${childProgress.child_name}, Age ${childProgress.child_age}
Achievement: ${achievement.achievement_name}
Module: ${achievement.module}

Write a brief (2-3 sentences) encouraging message that celebrates this specific achievement and explains why it's meaningful for their development.

Just return the message text, nothing else.`
      });

      const newLogEntry = {
        log_id: `achievement_${Date.now()}`,
        timestamp: new Date().toISOString(),
        author_name: 'AI Assistant',
        author_email: 'ai@helper33.com',
        entry_type: 'celebration',
        title: `🎉 ${childProgress.child_name} earned: ${achievement.achievement_name}!`,
        content: response,
        related_module: achievement.module,
        visibility: 'shared_with_all',
        child_acknowledged: false,
        priority: 'medium',
        tags: ['achievement', 'celebration', 'ai_generated']
      };

      const updatedLog = [...(childProgress.communication_log || []), newLogEntry];
      
      await updateProgressMutation.mutateAsync({
        id: childProgress.id,
        data: { communication_log: updatedLog }
      });

      toast.success('Achievement message sent to parents! 🏆');
    } catch (error) {
      console.error('Error generating achievement message:', error);
    }
  };

  const handleAcknowledge = (logId) => {
    const updatedLog = (childProgress?.communication_log || []).map(entry =>
      entry.log_id === logId 
        ? { ...entry, child_acknowledged: true }
        : entry
    );

    updateProgressMutation.mutate({
      id: childProgress.id,
      data: { communication_log: updatedLog }
    });

    toast.success('Message marked as read!');
  };

  const handleRespond = (logId) => {
    if (!responseText.trim()) {
      toast.error('Please write a response');
      return;
    }

    const updatedLog = (childProgress?.communication_log || []).map(entry =>
      entry.log_id === logId 
        ? { 
            ...entry, 
            child_response: responseText,
            child_acknowledged: true 
          }
        : entry
    );

    updateProgressMutation.mutate({
      id: childProgress.id,
      data: { communication_log: updatedLog }
    });

    setResponseText('');
    setExpandedMessage(null);
    toast.success('Response sent to your parent! 💌');
  };

  const entryTypeEmojis = {
    observation: '📝',
    concern: '⚠️',
    celebration: '🎉',
    request: '🙏',
    milestone: '⭐',
    question: '❓',
    feedback: '💬',
    note: '💡'
  };

  const entryTypeColors = {
    observation: 'border-blue-300 bg-blue-50',
    concern: 'border-orange-300 bg-orange-50',
    celebration: 'border-green-300 bg-green-50',
    request: 'border-purple-300 bg-purple-50',
    milestone: 'border-yellow-300 bg-yellow-50',
    question: 'border-pink-300 bg-pink-50',
    feedback: 'border-indigo-300 bg-indigo-50',
    note: 'border-gray-300 bg-gray-50'
  };

  const MessageCard = ({ message, idx }) => {
    const isExpanded = expandedMessage === message.log_id;
    const isAI = message.author_name === 'AI Assistant';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
      >
        <Card className={`border-2 ${
          !message.child_acknowledged 
            ? 'border-yellow-400 bg-yellow-50 shadow-lg' 
            : entryTypeColors[message.entry_type] || 'border-purple-200 bg-white'
        }`}>
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{entryTypeEmojis[message.entry_type]}</span>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    {message.title}
                    {isAI && <Bot className="w-4 h-4 text-purple-600" />}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {message.author_name} • {new Date(message.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-end">
                {!message.child_acknowledged && (
                  <Badge className="bg-yellow-500 text-white">New!</Badge>
                )}
                {message.priority === 'high' && (
                  <Badge className="bg-red-500 text-white">Important</Badge>
                )}
              </div>
            </div>

            {/* AI Highlights (if present) */}
            {isAI && message.ai_highlights && message.ai_highlights.length > 0 && (
              <div className="mb-3 space-y-1">
                {message.ai_highlights.map((highlight, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Content */}
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
              {isExpanded ? message.content : `${message.content.substring(0, 150)}${message.content.length > 150 ? '...' : ''}`}
            </p>

            {/* AI Suggestions (if present) */}
            {isAI && isExpanded && message.ai_suggestions && message.ai_suggestions.length > 0 && (
              <div className="mb-3 p-3 bg-purple-100 rounded-lg border border-purple-300">
                <p className="text-xs font-bold text-purple-800 mb-2 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Suggested Activities for Tomorrow:
                </p>
                <ul className="space-y-1">
                  {message.ai_suggestions.map((suggestion, i) => (
                    <li key={i} className="text-xs text-purple-700 flex items-start gap-1">
                      <span>•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Attention (if present) */}
            {isAI && isExpanded && message.ai_attention_areas && message.ai_attention_areas.length > 0 && (
              <div className="mb-3 p-3 bg-orange-100 rounded-lg border border-orange-300">
                <p className="text-xs font-bold text-orange-800 mb-2 flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  Gentle Reminders:
                </p>
                <ul className="space-y-1">
                  {message.ai_attention_areas.map((area, i) => (
                    <li key={i} className="text-xs text-orange-700 flex items-start gap-1">
                      <span>•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {message.content.length > 150 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExpandedMessage(isExpanded ? null : message.log_id)}
                  className="border-purple-300"
                >
                  {isExpanded ? (
                    <><ChevronUp className="w-3 h-3 mr-1" />Hide</>
                  ) : (
                    <><ChevronDown className="w-3 h-3 mr-1" />Read More</>
                  )}
                </Button>
              )}

              {!message.child_acknowledged && (
                <Button
                  size="sm"
                  onClick={() => handleAcknowledge(message.log_id)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Mark Read
                </Button>
              )}
            </div>

            {/* Response Section */}
            <AnimatePresence>
              {isExpanded && !isAI && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  {message.child_response ? (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="text-xs font-semibold text-purple-800 mb-1">Your Response:</p>
                      <p className="text-sm text-gray-700">{message.child_response}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Write a Response:</Label>
                      <Textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Tell your parent what you think..."
                        rows={3}
                        className="border-purple-200"
                      />
                      <Button
                        onClick={() => handleRespond(message.log_id)}
                        disabled={!responseText.trim()}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                        size="sm"
                      >
                        <Send className="w-3 h-3 mr-2" />
                        Send Response
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (!childProgress) return null;

  return (
    <>
      {/* Notification Badge */}
      {unreadCount > 0 && !showMessages && (
        <motion.div
          initial={{ scale: 0, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          className="fixed top-20 right-6 z-40"
        >
          <Button
            onClick={() => setShowMessages(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-500 shadow-2xl rounded-full px-6 py-3 hover:scale-105 transition-transform"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {unreadCount} New Message{unreadCount > 1 ? 's' : ''} from Parents!
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}

      {/* Enhanced Messages Panel */}
      <AnimatePresence>
        {showMessages && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-6 top-20 z-50 w-[450px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-6rem)] overflow-hidden"
          >
            <Card className="h-full flex flex-col bg-white shadow-2xl border-4 border-purple-300">
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Parent Hub
                  </CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => setShowMessages(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                {unreadCount > 0 && (
                  <Badge className="bg-yellow-400 text-yellow-900 w-fit mt-2">
                    {unreadCount} unread
                  </Badge>
                )}
              </CardHeader>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-3 bg-purple-50 m-2">
                  <TabsTrigger value="inbox" className="text-xs">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Inbox ({messagesForChild.length})
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="text-xs">
                    <Bot className="w-3 h-3 mr-1" />
                    AI ({aiMessages.length})
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Summary
                  </TabsTrigger>
                </TabsList>

                {/* Inbox Tab */}
                <TabsContent value="inbox" className="flex-1 overflow-y-auto p-4 space-y-3 m-0">
                  {messagesForChild.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No messages yet!</p>
                    </div>
                  ) : (
                    messagesForChild.map((message, idx) => (
                      <MessageCard key={message.log_id} message={message} idx={idx} />
                    ))
                  )}
                </TabsContent>

                {/* AI Messages Tab */}
                <TabsContent value="ai" className="flex-1 overflow-y-auto p-4 space-y-3 m-0">
                  {aiMessages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No AI messages yet!</p>
                    </div>
                  ) : (
                    aiMessages.map((message, idx) => (
                      <MessageCard key={message.log_id} message={message} idx={idx} />
                    ))
                  )}
                </TabsContent>

                {/* Summary Tab */}
                <TabsContent value="summary" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
                  <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        Your Progress Overview
                      </h3>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white rounded-lg p-3 border border-yellow-200">
                          <div className="text-2xl font-bold text-yellow-600">{user?.kids_studio_stats?.points || 0}</div>
                          <div className="text-xs text-gray-600">Total Points</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">{user?.kids_studio_stats?.total_activities || 0}</div>
                          <div className="text-xs text-gray-600">Activities</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-pink-200">
                          <div className="text-2xl font-bold text-pink-600">{user?.kids_studio_stats?.stickers_earned || 0}</div>
                          <div className="text-xs text-gray-600">Stickers</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="text-2xl font-bold text-green-600">{(childProgress?.achievements || []).length}</div>
                          <div className="text-xs text-gray-600">Achievements</div>
                        </div>
                      </div>

                      <Button
                        onClick={generateDailySummary}
                        disabled={generatingSummary}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        {generatingSummary ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Generate Daily Summary for Parents
                          </>
                        )}
                      </Button>

                      {childProgress.module_progress && (
                        <div className="mt-4 pt-4 border-t border-purple-200">
                          <h4 className="text-sm font-bold text-purple-800 mb-3">Learning Modules:</h4>
                          <div className="space-y-2">
                            {childProgress.module_progress.tracing && (
                              <div className="bg-white rounded-lg p-2 text-xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold">✏️ Letter Tracing</span>
                                  <Badge className="bg-teal-500">{childProgress.module_progress.tracing.letters_traced?.length || 0} letters</Badge>
                                </div>
                              </div>
                            )}
                            {childProgress.module_progress.journal && (
                              <div className="bg-white rounded-lg p-2 text-xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold">📓 Journal Entries</span>
                                  <Badge className="bg-purple-500">{childProgress.module_progress.journal.entries_count || 0} entries</Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Achievements */}
                  {(childProgress?.achievements || []).length > 0 && (
                    <Card className="border-2 border-green-300 bg-green-50">
                      <CardContent className="p-4">
                        <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Recent Achievements
                        </h4>
                        <div className="space-y-2">
                          {childProgress.achievements.slice(0, 5).map((achievement, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-2 text-xs flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-gray-800">{achievement.achievement_name}</div>
                                <div className="text-gray-600">{new Date(achievement.earned_date).toLocaleDateString()}</div>
                              </div>
                              <Trophy className="w-4 h-4 text-yellow-500" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
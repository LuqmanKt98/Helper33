import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot, Heart, Calendar, TrendingUp, Baby, Users, Sparkles, 
  MessageSquare, Target, Briefcase, Shield, Mail, Play, Pause, Check
} from 'lucide-react';
import { toast } from 'sonner';

const AgentsHub = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeAgents, setActiveAgents] = useState(new Set(['personal_assistant']));

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const agents = [
    {
      id: 'personal_assistant',
      name: 'Personal Assistant',
      icon: Sparkles,
      description: 'Your main AI assistant - handles everything from tasks to navigation',
      capabilities: ['Navigation', 'Task Management', 'Email', 'Scheduling', 'Data Logging'],
      gradient: 'from-purple-500 to-pink-500',
      whatsapp: true,
      essential: true
    },
    {
      id: 'grief_coach',
      name: 'Grief Coach',
      icon: Heart,
      description: 'Compassionate support for loss and healing',
      capabilities: ['Emotional Support', 'Journaling', 'Memory Keeping', 'Healing Exercises'],
      gradient: 'from-rose-500 to-pink-500',
      whatsapp: true
    },
    {
      id: 'organizer',
      name: 'Task Organizer',
      icon: Calendar,
      description: 'Expert task and time management',
      capabilities: ['Task Creation', 'Prioritization', 'Scheduling', 'Habit Tracking'],
      gradient: 'from-blue-500 to-cyan-500',
      whatsapp: true
    },
    {
      id: 'life_coach',
      name: 'Life Coach',
      icon: TrendingUp,
      description: 'Goal setting and personal development',
      capabilities: ['Goal Planning', 'Motivation', 'Progress Tracking', 'Life Planning'],
      gradient: 'from-green-500 to-teal-500',
      whatsapp: true
    },
    {
      id: 'womens_health_coach',
      name: "Women's Health Coach",
      icon: Baby,
      description: 'Maternal and reproductive health support',
      capabilities: ['Cycle Tracking', 'Pregnancy Support', 'Baby Care', 'Health Insights'],
      gradient: 'from-pink-500 to-rose-500',
      whatsapp: true
    },
    {
      id: '2026_life_planner',
      name: '2026 Life Planner',
      icon: Target,
      description: 'Your guide to planning and achieving 2026 goals',
      capabilities: ['Yearly Planning', 'Daily Check-ins', 'Goal Tracking', 'Motivation'],
      gradient: 'from-indigo-500 to-purple-500',
      whatsapp: true
    },
    {
      id: 'concierge',
      name: 'Family Concierge',
      icon: Users,
      description: 'Family coordination and event planning',
      capabilities: ['Family Events', 'Member Coordination', 'Meal Planning', 'Activities'],
      gradient: 'from-orange-500 to-red-500',
      whatsapp: true
    },
    {
      id: 'social_media_manager',
      name: 'Social Media Manager',
      icon: Briefcase,
      description: 'Content creation and social media strategy',
      capabilities: ['Content Ideas', 'Post Scheduling', 'Analytics', 'Copywriting'],
      gradient: 'from-yellow-500 to-orange-500',
      whatsapp: true
    },
    {
      id: 'crisis_support',
      name: 'Crisis Support',
      icon: Shield,
      description: 'Immediate crisis guidance and resources',
      capabilities: ['Resource Finding', 'Safety Planning', 'Emergency Contacts', 'Crisis Navigation'],
      gradient: 'from-red-500 to-rose-500',
      whatsapp: true
    },
    {
      id: 'email_assistant', name: 'Email Assistant',
      icon: Mail,
      description: 'Compose and manage emails',
      capabilities: ['Email Drafting', 'Professional Writing', 'Email Organization'],
      gradient: 'from-indigo-500 to-blue-500',
      whatsapp: true
    }
  ];

  const toggleAgent = (agentId) => {
    const newActive = new Set(activeAgents);
    if (agentId === 'personal_assistant') {
      toast.error('Personal Assistant is always active');
      return;
    }
    
    if (newActive.has(agentId)) {
      newActive.delete(agentId);
      toast.success('Agent deactivated');
    } else {
      newActive.add(agentId);
      toast.success('Agent activated');
    }
    setActiveAgents(newActive);
  };

  const startConversation = (agentId) => {
    // Simply open the floating AI assistant and set the agent
    const event = new CustomEvent('openAIAssistant', { 
      detail: { 
        agent: agentId,
        message: `Hi! I'd like to work with the ${agents.find(a => a.id === agentId)?.name}`
      } 
    });
    window.dispatchEvent(event);
    toast.success('Opening AI assistant...');
  };

  const getWhatsAppLink = (agentId) => {
    return base44.agents.getWhatsAppConnectURL(agentId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <Bot className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            AI Agents Hub
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Activate specialized AI agents for different needs. Each agent is an expert in their domain and can work together to help you.
          </p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2">
              <Check className="w-4 h-4 mr-2" />
              {activeAgents.size} Active Agents
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2">
              {agents.length} Total Agents
            </Badge>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4 max-w-2xl mx-auto"
          >
            <p className="text-sm text-yellow-900">
              💡 <strong>Tip:</strong> Click "Chat Now" to open the AI assistant window. You can also click the floating sparkle button at the bottom-right of any page!
            </p>
          </motion.div>
        </motion.div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, idx) => {
            const Icon = agent.icon;
            const isActive = activeAgents.has(agent.id);
            
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card className={`relative overflow-hidden border-2 transition-all ${
                  isActive 
                    ? 'border-purple-300 shadow-xl bg-white' 
                    : 'border-gray-200 shadow-md bg-gray-50/50 opacity-75'
                }`}>
                  {/* Background gradient */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${agent.gradient}`} />
                  
                  {agent.essential && (
                    <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
                      Essential
                    </Badge>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      
                      <Button
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAgent(agent.id)}
                        className={isActive ? `bg-gradient-to-r ${agent.gradient} text-white` : ''}
                        disabled={agent.essential}
                      >
                        {isActive ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                        {isActive ? 'Active' : 'Activate'}
                      </Button>
                    </div>

                    <CardTitle className="text-xl font-bold">{agent.name}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {agent.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Capabilities */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">Capabilities:</p>
                      <div className="flex flex-wrap gap-2">
                        {agent.capabilities.map((cap, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    {isActive && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => startConversation(agent.id)}
                          className={`flex-1 bg-gradient-to-r ${agent.gradient} hover:opacity-90 text-white`}
                          size="sm"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat Now
                        </Button>
                        
                        {agent.whatsapp && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={getWhatsAppLink(agent.id)} target="_blank" rel="noopener noreferrer">
                              💬 WhatsApp
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-200"
        >
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            How Agents Work Together
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                1
              </div>
              <h4 className="font-bold">Specialized Expertise</h4>
              <p className="text-sm text-gray-600">
                Each agent is trained for specific tasks and domains, providing expert-level assistance.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                2
              </div>
              <h4 className="font-bold">Coordinated Actions</h4>
              <p className="text-sm text-gray-600">
                Agents can communicate and coordinate to handle complex multi-step tasks.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold">
                3
              </div>
              <h4 className="font-bold">Always Available</h4>
              <p className="text-sm text-gray-600">
                Access agents via web chat or WhatsApp - they're ready to help 24/7.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AgentsHub;
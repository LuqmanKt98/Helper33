
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Send,
  Clock,
  CheckCircle,
  Loader2,
  Sparkles,
  MapPin,
  Video,
  Phone,
  ChevronDown,
  Bell,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from '@/components/ai/MessageBubble';
import { toast } from 'sonner';
import { format } from 'date-fns';
import SEO from '@/components/SEO';

export default function AppointmentScheduler() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const data = await base44.entities.Appointment.list('-appointment_date');
      return data;
    }
  });

  const { data: appointmentTypes = [] } = useQuery({
    queryKey: ['appointmentTypes'],
    queryFn: () => base44.entities.AppointmentType.list()
  });

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: 'appointment_scheduler',
          metadata: {
            name: 'My Appointments',
            description: 'AI-powered appointment scheduling'
          }
        });
        setConversationId(conv.id);
      } catch (error) {
        console.error('Error creating conversation:', error);
        toast.error('Failed to start conversation');
      }
    };

    if (!conversationId) {
      initConversation();
    }
  }, [conversationId]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || !conversationId) return;

    setIsLoading(true);
    setInput('');
    setShowQuickActions(false);

    try {
      const conversation = await base44.agents.getConversation(conversationId);
      
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: text
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setIsLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date + 'T' + apt.appointment_time);
    return aptDate > new Date() && apt.status !== 'cancelled';
  }).slice(0, 3);

  const quickActions = [
    {
      icon: Calendar,
      title: 'Book New Appointment',
      description: `I'd like to book a new appointment. Can you show me what services are available and help me find a good time?`,
      prompt: `I'd like to book a new appointment. Can you show me what services are available and help me find a good time?`,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Clock,
      title: 'See Available Times',
      description: 'Check this week\'s availability',
      prompt: 'What appointment times are available this week?',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: CheckCircle,
      title: 'View My Appointments',
      description: 'See all scheduled appointments',
      prompt: 'Can you show me all my upcoming appointments?',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: MessageSquare,
      title: 'Reschedule',
      description: 'Change an existing appointment',
      prompt: 'I need to reschedule one of my appointments. Can you help?',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const getLocationIcon = (type) => {
    switch(type) {
      case 'virtual': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'in_person': return <MapPin className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <SEO 
        title="Appointment Scheduler - DobryLife | Smart Booking & Reminders"
        description="Book appointments with automatic confirmations, calendar integration, and smart reminders. Manage your schedule effortlessly with AI-powered scheduling."
        keywords="appointment scheduling, booking system, calendar appointments, automatic reminders, appointment management, schedule booking, appointment tracker"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 shadow-xl -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <Calendar className="w-8 h-8" />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">AI Appointment Scheduler</h1>
                  <p className="text-white/90 text-sm sm:text-base">Smart booking with instant confirmations</p>
                </div>
              </div>
              
              {/* WhatsApp Integration */}
              <a
                href={base44.agents.getWhatsAppConnectURL('appointment_scheduler')}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:block"
              >
                <Button
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Schedule via WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="bg-white/90 backdrop-blur-sm shadow-2xl h-[calc(100vh-280px)] flex flex-col">
                <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {messages.length === 0 && showQuickActions && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8"
                    >
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Hello {user?.full_name?.split(' ')[0] || 'there'}! 👋
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        I'm your AI Appointment Scheduler. I can help you book appointments, find available times, 
                        reschedule, and manage your calendar with our service providers.
                      </p>
                      <p className="text-sm text-gray-500">
                        Choose a quick action below or tell me what you need! 💬
                      </p>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {messages.map((message, idx) => (
                      <MessageBubble key={idx} message={message} />
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-gray-500"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                      </div>
                      <span className="text-sm">Finding available times...</span>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Input Area */}
                <div className="border-t bg-white p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage(input);
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="E.g., 'I need a therapy session next Tuesday afternoon'"
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Upcoming Appointments */}
              {upcomingAppointments.length > 0 && (
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bell className="w-5 h-5 text-indigo-500" />
                      Upcoming Appointments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingAppointments.map((apt, idx) => (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{apt.service_name}</h4>
                            <p className="text-xs text-gray-600">with {apt.provider_name}</p>
                          </div>
                          <Badge className={getStatusColor(apt.status)}>
                            {apt.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-gray-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(apt.appointment_date), 'EEEE, MMMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>{apt.appointment_time} ({apt.duration_minutes} min)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getLocationIcon(apt.location_type)}
                            <span className="capitalize">{apt.location_type}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      Quick Actions
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickActions(!showQuickActions)}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                
                <AnimatePresence>
                  {showQuickActions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <CardContent className="space-y-3 pt-0">
                        {quickActions.map((action, idx) => (
                          <motion.button
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => sendMessage(action.prompt)}
                            disabled={isLoading}
                            className={`w-full p-4 rounded-xl bg-gradient-to-r ${action.color} text-white text-left hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                <action.icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold mb-1 text-sm">{action.title}</p>
                                <p className="text-xs text-white/80 line-clamp-2">{action.description}</p>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Available Services */}
              {appointmentTypes.length > 0 && (
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      Available Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-gray-700">
                      {appointmentTypes.filter(t => t.is_active).slice(0, 5).map((type, idx) => (
                        <motion.div
                          key={type.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
                        >
                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{type.service_name}</p>
                            <p className="text-xs text-gray-600">{type.duration_minutes} min • {type.provider_name}</p>
                            {type.price && (
                              <p className="text-xs text-green-700 font-semibold mt-1">${type.price}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* How It Works */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-blue-900 mb-2">How It Works</h4>
                      <ol className="text-sm text-blue-800 space-y-2">
                        <li className="flex gap-2">
                          <span className="font-bold">1.</span>
                          <span>Tell me what service you need</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold">2.</span>
                          <span>I'll find available time slots</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold">3.</span>
                          <span>Confirm your preferred time</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold">4.</span>
                          <span>Get instant confirmation & reminders</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

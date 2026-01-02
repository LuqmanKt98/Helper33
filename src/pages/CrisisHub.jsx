
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Phone,
  MessageCircle,
  AlertTriangle,
  Shield,
  Users,
  Compass,
  Sparkles,
  Sun,
  Wind,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Pill,
  MapPin,
  Brain,
  LifeBuoy,
  X, // Added X icon for closing modal
  MessageSquare, // Added MessageSquare icon for chat
  ArrowRight, // Added ArrowRight icon for Safe Place link
  Globe, // Added Languages icon
  Settings, // Added Settings icon for account tab
  Search, // Added Search icon for resource directory
  ChevronRight // Added ChevronRight icon for Safety Plan CTA
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { createPageUrl } from '@/utils';
import SEO from '@/components/SEO';
import MessageBubble from '@/components/ai/MessageBubble'; // New import
import { useTranslation } from '@/components/Translations';
import MemoryManager from '@/components/crisis/MemoryManager';
import ResourceDirectory from '@/components/crisis/ResourceDirectory';
import SafetyPlanWizard from '@/components/crisis/SafetyPlanWizard';
import SafetyPlanQuickView from '@/components/crisis/SafetyPlanQuickView'; // New import
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer';

// Crisis hotlines by country and language
const CRISIS_RESOURCES_BY_COUNTRY = {
  'United States': {
    emergency: '911',
    hotlines: [
      { name: '988 Suicide & Crisis Lifeline', number: '988', description: 'Call or text 988 - 24/7 support', languages: ['en', 'es'], chat: 'https://988lifeline.org/chat' },
      { name: 'Crisis Text Line', number: '741741', description: 'Text HOME to 741741', languages: ['en'], sms: true },
      { name: 'Trevor Project (LGBTQ+)', number: '1-866-488-7386', description: 'Text START to 678-678', languages: ['en'], chat: 'https://www.thetrevorproject.org/get-help' },
      { name: 'Veterans Crisis Line', number: '988, press 1', description: 'Or text 838255', languages: ['en'], chat: 'https://www.veteranscrisisline.net' }
    ]
  },
  'Canada': {
    emergency: '911',
    hotlines: [
      { name: 'Talk Suicide Canada', number: '1-833-456-4566', description: '24/7 support', languages: ['en', 'fr'], chat: 'https://talksuicide.ca' },
      { name: 'Crisis Text Line Canada', number: '686868', description: 'Text CONNECT to 686868', languages: ['en', 'fr'], sms: true },
      { name: 'Kids Help Phone', number: '1-800-668-6868', description: 'For youth', languages: ['en', 'fr'], chat: 'https://kidshelpphone.ca' }
    ]
  },
  'United Kingdom': {
    emergency: '999',
    hotlines: [
      { name: 'Samaritans', number: '116 123', description: '24/7 free support', languages: ['en'], chat: 'https://www.samaritans.org' },
      { name: 'Crisis Text Line UK', number: '85258', description: 'Text SHOUT to 85258', languages: ['en'], sms: true },
      { name: 'Campaign Against Living Miserably (CALM)', number: '0800 58 58 58', description: 'For men', languages: ['en'], chat: 'https://www.thecalmzone.net' }
    ]
  },
  'Australia': {
    emergency: '000',
    hotlines: [
      { name: 'Lifeline', number: '13 11 14', description: '24/7 crisis support', languages: ['en'], chat: 'https://www.lifeline.org.au/crisis-chat' },
      { name: 'Beyond Blue', number: '1300 22 4636', description: 'Mental health support', languages: ['en'], chat: 'https://www.beyondblue.org.au' },
      { name: 'Kids Helpline', number: '1800 55 1800', description: 'For young people', languages: ['en'] }
    ]
  },
  'Spain': {
    emergency: '112',
    hotlines: [
      { name: 'Teléfono de la Esperanza', number: '717 003 717', description: 'Apoyo 24/7', languages: ['es'] },
      { name: 'Teléfono contra el Suicidio', number: '024', description: 'Línea de crisis nacional', languages: ['es'] }
    ]
  },
  'France': {
    emergency: '112',
    hotlines: [
      { name: 'Numéro National de Prévention du Suicide', number: '3114', description: 'Soutien 24/7', languages: ['fr'] },
      { name: 'SOS Amitié', number: '09 72 39 40 50', description: 'Écoute et soutien', languages: ['fr'] }
    ]
  },
  'Germany': {
    emergency: '112',
    hotlines: [
      { name: 'Telefonseelsorge', number: '0800 111 0 111', description: '24/7 Unterstützung', languages: ['de'] },
      { name: 'Nummer gegen Kummer', number: '116 111', description: 'Für Kinder und Jugendliche', languages: ['de'] }
    ]
  },
  'Mexico': {
    emergency: '911',
    hotlines: [
      { name: 'Línea de la Vida', number: '800 290 0024', description: 'Apoyo 24/7', languages: ['es'] },
      { name: 'SAPTEL', number: '55 5259 8121', description: 'Salud mental', languages: ['es'] }
    ]
  },
  'Brazil': {
    emergency: '190',
    hotlines: [
      { name: 'CVV - Centro de Valorização da Vida', number: '188', description: 'Apoio 24/7', languages: ['pt'], chat: 'https://www.cvv.org.br' },
      { name: 'Linha de Prevenção ao Suicídio', number: '141', description: 'Suporte emocional', languages: ['pt'] }
    ]
  }
};

const IMMEDIATE_COPING_TOOLS = [
  {
    title: '4-7-8 Breathing',
    icon: Wind,
    description: 'Calm your nervous system in 2 minutes',
    action: 'breathing',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    title: 'Grounding Exercise',
    icon: Compass,
    description: '5-4-3-2-1 sensory grounding',
    action: 'grounding',
    color: 'from-green-500 to-emerald-600'
  },
  {
    title: 'Safe Place Visualization',
    icon: Sun,
    description: 'Guided imagery for comfort',
    action: 'visualization',
    color: 'from-orange-500 to-amber-600'
  }
];

// Role-play scenarios for therapeutic practice
const ROLEPLAY_SCENARIOS = [
  {
    id: 'difficult_conversation',
    title: '💬 Difficult Conversation',
    description: 'Practice having a hard conversation with someone in your life',
    icon: '💭',
    color: 'from-blue-500 to-cyan-500',
    systemPrompt: 'You are now role-playing as someone the user needs to have a difficult conversation with. Be empathetic but realistic. After the role-play, provide supportive feedback on communication strategies.'
  },
  {
    id: 'supportive_friend',
    title: '🤗 Supportive Friend',
    description: 'Talk to a compassionate friend who understands what you\'re going through',
    icon: '💙',
    color: 'from-purple-500 to-pink-500',
    systemPrompt: 'You are now role-playing as a warm, understanding friend who has been through similar challenges. Be supportive, validating, and share hope. Use casual, friendly language.'
  },
  {
    id: 'future_self',
    title: '✨ Future Self',
    description: 'Have a conversation with your future self who has healed',
    icon: '🌟',
    color: 'from-amber-500 to-orange-500',
    systemPrompt: 'You are the user\'s future self, 1 year from now, who has successfully navigated this difficult time. Be encouraging, share what helped you heal, and remind them of their strength. Be specific and hopeful.'
  },
  {
    id: 'therapist_practice',
    title: '🧠 Therapy Practice',
    description: 'Practice opening up and talking about your feelings',
    icon: '🎭',
    color: 'from-green-500 to-emerald-500',
    systemPrompt: 'You are a compassionate therapist helping the user practice expressing difficult emotions. Ask gentle questions, validate their feelings, and guide them through exploring their thoughts. Use therapeutic techniques like reflection and reframing.'
  },
  {
    id: 'anxiety_coach',
    title: '🌊 Anxiety Coach',
    description: 'Practice calming techniques and challenge anxious thoughts',
    icon: '🧘',
    color: 'from-teal-500 to-cyan-500',
    systemPrompt: 'You are an anxiety coach helping the user identify and challenge anxious thoughts. Guide them through cognitive reframing, breathing exercises, and grounding techniques. Be calm and reassuring.'
  },
  {
    id: 'grief_companion',
    title: '🕊️ Grief Companion',
    description: 'Talk about loss with someone who truly understands',
    icon: '💝',
    color: 'from-rose-500 to-pink-500',
    systemPrompt: 'You are a grief companion who has experienced loss. Create a safe space for the user to share memories, express pain, and process emotions. Be patient, gentle, and understanding. Never rush healing.'
  },
  {
    id: 'confidence_builder',
    title: '💪 Confidence Builder',
    description: 'Build self-esteem and practice self-compassion',
    icon: '⭐',
    color: 'from-violet-500 to-purple-500',
    systemPrompt: 'You are a confidence coach helping the user recognize their strengths and practice self-compassion. Challenge negative self-talk gently and help them see their worth. Be encouraging and specific.'
  },
  {
    id: 'boundary_practice',
    title: '🛡️ Boundary Setting',
    description: 'Practice setting healthy boundaries in relationships',
    icon: '🚧',
    color: 'from-indigo-500 to-blue-500',
    systemPrompt: 'You are helping the user practice setting healthy boundaries. Role-play scenarios where they need to say no or express their needs. Provide feedback on their communication and suggest assertive phrasing.'
  }
];

export default function CrisisHub() {
  const [activeSection, setActiveSection] = useState('resources');
  const [newReason, setNewReason] = useState('');
  const [newCoping, setNewCoping] = useState('');
  const [showAISupport, setShowAISupport] = useState(false); // New state for AI modal
  const [conversationId, setConversationId] = useState(null); // New state for AI conversation ID
  const [messages, setMessages] = useState([]); // New state for AI chat messages
  const [input, setInput] = useState(''); // New state for AI chat input
  const [isLoading, setIsLoading] = useState(false); // New state for AI chat loading
  const messagesEndRef = useRef(null); // New ref for scrolling
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Hook for navigation
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [showScenarios, setShowScenarios] = useState(false);
  const [memoryConsent, setMemoryConsent] = useState(false);
  const [showMemoryManager, setShowMemoryManager] = useState(false);
  const [showResourceDirectory, setShowResourceDirectory] = useState(false);
  const [showSafetyPlanWizard, setShowSafetyPlanWizard] = useState(false);


  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { t, isRTL } = useTranslation(user);

  const { data: crisisSupport, isLoading: isCrisisLoading } = useQuery({
    queryKey: ['crisisSupport'],
    queryFn: async () => {
      const supports = await base44.entities.CrisisSupport.list();
      if (supports && supports.length > 0) return supports[0];
      
      // Create initial safety plan
      return base44.entities.CrisisSupport.create({
        safety_plan_created: false,
        warning_signs: [],
        coping_strategies: [],
        reasons_for_living: [],
        safe_people: [],
        professional_contacts: [],
        safe_environments: [],
        distraction_activities: [],
        current_medications: []
      });
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true // Always refetch when component mounts
  });

  const { data: memories = [] } = useQuery({
    queryKey: ['companionMemories'],
    queryFn: () => base44.entities.CompanionMemory.list('-importance_score'),
    enabled: !!user
  });

  // Load memory consent from localStorage
  useEffect(() => {
    const savedConsent = localStorage.getItem('crisis_memory_consent');
    if (savedConsent === 'true') {
      setMemoryConsent(true);
    }
  }, []);

  // Subscribe to AI conversation
  useEffect(() => {
    if (!showAISupport || !conversationId) { // Only subscribe if modal is open and conversationId exists
      setMessages([]); // Clear messages when modal closes or conversation resets
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

          // Scroll to bottom after messages are rendered
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
      toast.error('Failed to subscribe to chat updates.');
    }
  }, [conversationId, showAISupport]); // Added showAISupport to dependencies

  const handleMemoryConsentChange = (enabled) => {
    setMemoryConsent(enabled);
    localStorage.setItem('crisis_memory_consent', enabled.toString());
    if (enabled) {
      toast.success('Memory system enabled - the AI will remember your conversations');
    } else {
      toast.info('Memory system disabled - conversations will not be saved');
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    setInput('');
    setIsLoading(true);

    try {
      let convId = conversationId;

      if (!convId) {
        const metadata = {
          name: activeScenario ? `Role-play: ${activeScenario.title}` : 'Crisis Support Chat',
          user_email: user?.email,
          memory_enabled: memoryConsent
        };

        if (activeScenario) {
          metadata.scenario_id = activeScenario.id;
          metadata.scenario_prompt = activeScenario.systemPrompt;
        }

        const newConv = await base44.agents.createConversation({
          agent_name: 'crisis_support',
          metadata
        });

        convId = newConv.id;
        setConversationId(convId);
        setMessages([]); // Clear local messages for fresh start
        
        // Give a brief moment for conversation to be fully initialized on backend
        await new Promise(resolve => setTimeout(resolve, 200));

        // If starting a role-play, send the system prompt as first message
        if (activeScenario) {
          // The initial user message is part of priming the agent in a role-play
          await base44.agents.addMessage(
            { id: convId },
            { 
              role: 'user', 
              content: textToSend // User's initial message
            }
          );
          return; // Exit after sending the initial message for role-play
        }
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

  const startScenario = (scenario) => {
    setActiveScenario(scenario);
    setShowScenarios(false);
    setConversationId(null); // Reset conversation to start a new one
    setMessages([]);
    toast.success(`Started: ${scenario.title}`);
  };

  const endScenario = () => {
    setActiveScenario(null);
    setConversationId(null); // Reset conversation
    setMessages([]);
    toast.info('Ended role-play session');
  };

  const updateCrisisSupportMutation = useMutation({
    mutationFn: (data) => base44.entities.CrisisSupport.update(crisisSupport.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['crisisSupport']);
    }
  });

  const addReason = () => {
    if (!newReason.trim()) return;
    
    const updatedReasons = [...(crisisSupport.reasons_for_living || []), newReason];
    updateCrisisSupportMutation.mutate({ reasons_for_living: updatedReasons });
    setNewReason('');
    toast.success('Reason added to your safety plan');
  };

  const removeReason = (index) => {
    const updatedReasons = crisisSupport.reasons_for_living.filter((_, i) => i !== index);
    updateCrisisSupportMutation.mutate({ reasons_for_living: updatedReasons });
  };

  const addCoping = () => {
    if (!newCoping.trim()) return;
    
    const updatedCoping = [...(crisisSupport.coping_strategies || []), newCoping];
    updateCrisisSupportMutation.mutate({ coping_strategies: updatedCoping });
    setNewCoping('');
    toast.success('Coping strategy added');
  };

  const removeCoping = (index) => {
    const updatedCoping = crisisSupport.coping_strategies.filter((_, i) => i !== index);
    updateCrisisSupportMutation.mutate({ coping_strategies: updatedCoping });
  };

  // Export safety plan function
  const exportSafetyPlan = () => {
    const planText = `
MY SAFETY PLAN
Generated: ${new Date().toLocaleDateString()}

⚠️ WARNING SIGNS
${(crisisSupport.warning_signs || []).map((s, i) => `${i + 1}. ${s}`).join('\n') || 'None added yet'}

🌿 COPING STRATEGIES
${(crisisSupport.coping_strategies || []).map((s, i) => `${i + 1}. ${s}`).join('\n') || 'None added yet'}

💖 REASONS TO KEEP GOING
${(crisisSupport.reasons_for_living || []).map((r, i) => `${i + 1}. ${r}`).join('\n') || 'None added yet'}

👥 SAFE PEOPLE
${(crisisSupport.safe_people || []).map((p, i) => `${i + 1}. ${p.name}${p.relationship ? ` (${p.relationship})` : ''}${p.phone ? ` - ${p.phone}` : ''}`).join('\n') || 'None added yet'}

👨‍⚕️ PROFESSIONAL CONTACTS
${(crisisSupport.professional_contacts || []).map((p, i) => `${i + 1}. ${p.name}${p.role ? ` - ${p.role}` : ''}${p.phone ? ` - ${p.phone}` : ''}`).join('\n') || 'None added yet'}

🏡 SAFE ENVIRONMENTS
${(crisisSupport.safe_environments || []).map((s, i) => `${i + 1}. ${s}`).join('\n') || 'None added yet'}

🚨 EMERGENCY CONTACTS
National Suicide Prevention Lifeline: 988
Crisis Text Line: Text HOME to 741741
Emergency Services: 911
    `.trim();

    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-safety-plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Safety plan downloaded!');
  };

  const hasSSRIWarning = crisisSupport?.current_medications?.some(
    med => med.is_ssri && med.has_black_box_warning
  );

  // Get localized crisis resources
  const getLocalizedResources = () => {
    const userCountry = user?.location_settings?.country || 'United States';
    const userLanguage = user?.preferred_language || 'en';
    
    const countryResources = CRISIS_RESOURCES_BY_COUNTRY[userCountry] || CRISIS_RESOURCES_BY_COUNTRY['United States'];
    
    // Filter hotlines by language if possible
    let filteredHotlines = countryResources.hotlines.filter(
      hotline => !hotline.languages || hotline.languages.includes(userLanguage)
    );

    // If no hotlines match the language, use all hotlines for that country
    if (filteredHotlines.length === 0) {
      filteredHotlines = countryResources.hotlines;
    }

    return {
      emergency: countryResources.emergency,
      hotlines: filteredHotlines
    };
  };

  const localResources = getLocalizedResources();

  if (isCrisisLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-rose-500 animate-pulse" />
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Crisis Support & Mental Health Emergency Resources",
    "description": "Immediate AI mental health crisis support with professional resources, safety planning, and 24/7 emergency assistance.",
    "specialty": "Mental Health Emergency, Crisis Intervention",
    "medicalAudience": {
      "@type": "MedicalAudience",
      "audienceType": "Mental Health Crisis, Emergency Support Seekers"
    },
    "about": {
      "@type": "MedicalCondition",
      "name": "Mental Health Crisis"
    }
  };

  return (
    <>
      <SEO 
        title="Crisis Support - AI Mental Health Emergency Resources & Help | Helper33"
        description="Immediate mental health crisis support with AI assistance. Access emergency resources, safety planning, professional helplines, and 24/7 AI crisis counseling. Call 988 for immediate help."
        keywords="mental health crisis AI, AI crisis support, emergency mental health, crisis counseling AI, suicide prevention, mental health emergency, AI crisis intervention, 988 support, crisis resources, mental health helpline"
        structuredData={structuredData}
      />

      <div className={`min-h-screen bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 p-6 ${isRTL ? 'rtl' : ''}`}>
        <div className="max-w-4xl mx-auto">
          
          {/* Safety Plan Wizard Modal */}
          <AnimatePresence>
            {showSafetyPlanWizard && (
              <SafetyPlanWizard 
                crisisSupport={crisisSupport}
                onClose={() => {
                  setShowSafetyPlanWizard(false);
                  queryClient.invalidateQueries(['crisisSupport']);
                  queryClient.refetchQueries(['crisisSupport']);
                }}
              />
            )}
          </AnimatePresence>

          {/* Language & Location Selector */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 flex ${isRTL ? 'justify-start' : 'justify-end'}`}
          >
            <Button
              onClick={() => navigate(createPageUrl('Account') + '?tab=location')}
              variant="outline"
              size="sm"
              className="bg-white/80 backdrop-blur-sm"
            >
              <Globe className="w-4 h-4 mr-2" />
              {user?.location_settings?.country || t('crisis.setLocation')} • {user?.preferred_language?.toUpperCase() || 'EN'}
            </Button>
          </motion.div>

          {/* Show setup prompt if location not configured */}
          {!user?.location_setup_completed && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl shadow-xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <MapPin className="w-10 h-10" />
                <div>
                  <h3 className="text-2xl font-bold">{t('crisis.getPersonalized')}</h3>
                  <p className="text-cyan-100">{t('crisis.setLocationDesc')}</p>
                </div>
              </div>
              <Button
                onClick={() => navigate(createPageUrl('Account') + '?tab=location')}
                className="bg-white text-cyan-600 hover:bg-cyan-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('crisis.setupLocation')}
              </Button>
            </motion.div>
          )}

          {/* AI Crisis Support - Full Screen Modal */}
          <AnimatePresence>
            {showAISupport && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => {
                  setShowAISupport(false);
                  setShowScenarios(false);
                  setActiveScenario(null);
                  setShowMemoryManager(false);
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                  {/* Chat Header */}
                  <div className={`bg-gradient-to-r ${activeScenario ? activeScenario.color : 'from-rose-500 to-pink-500'} text-white p-6`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {activeScenario ? (
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">{activeScenario.icon}</span>
                            <div>
                              <h2 className="text-2xl font-bold mb-1">
                                {activeScenario.title}
                              </h2>
                              <p className="text-white/90 text-sm">
                                {activeScenario.description}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h2 className="text-2xl font-bold mb-1">💙 {t('crisis.aiChatTitle')}</h2>
                            <p className="text-rose-100 text-sm">
                              {t('crisis.aiChatSubtitle')}
                              {memoryConsent && memories.length > 0 && (
                                <span className="ml-2">• {memories.filter(m => m.is_active).length} memories active</span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {activeScenario && (
                          <Button
                            onClick={endScenario}
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                          >
                            End Role-play
                          </Button>
                        )}
                        {!activeScenario && !showMemoryManager && (
                          <>
                            <Button
                              onClick={() => setShowScenarios(!showScenarios)}
                              size="sm"
                              variant="ghost"
                              className="text-white hover:bg-white/20"
                            >
                              🎭 Role-play
                            </Button>
                            <Button
                              onClick={() => setShowMemoryManager(true)}
                              size="sm"
                              variant="ghost"
                              className="text-white hover:bg-white/20"
                            >
                              <Brain className="w-4 h-4 mr-1" />
                              Memory ({memories.filter(m => m.is_active).length})
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => {
                            setShowAISupport(false);
                            setShowScenarios(false);
                            setActiveScenario(null);
                            setShowMemoryManager(false);
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Memory Consent Toggle */}
                    {!activeScenario && !showMemoryManager && (
                      <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            <span className="text-sm font-medium">Enable AI Memory</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={memoryConsent}
                              onChange={(e) => handleMemoryConsentChange(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/30"></div>
                          </label>
                        </div>
                        <p className="text-xs text-white/80 mt-1">
                          {memoryConsent ? 'AI will remember important details from our conversations' : 'AI will not store conversation memories'}
                        </p>
                      </div>
                    )}

                    {/* Crisis Resources Always Visible */}
                    {!activeScenario && !showMemoryManager && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <a href="tel:988">
                          <Button size="sm" className="w-full bg-white text-red-600 hover:bg-red-50">
                            <Phone className="w-4 h-4 mr-2" />
                            {t('crisis.call')} 988
                          </Button>
                        </a>
                        <a href="sms:741741&body=HOME">
                          <Button size="sm" className="w-full bg-white text-red-600 hover:bg-red-50">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            {t('crisis.text')} 741741
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Role-play Scenarios Grid */}
                  <AnimatePresence>
                    {showScenarios && !activeScenario && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-6 border-b bg-gradient-to-br from-purple-50 to-pink-50"
                      >
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                            🎭 Choose a Practice Scenario
                          </h3>
                          <p className="text-sm text-gray-600">
                            Practice coping skills in a safe, supportive environment
                          </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                          {ROLEPLAY_SCENARIOS.map((scenario) => (
                            <motion.button
                              key={scenario.id}
                              onClick={() => startScenario(scenario)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-4 rounded-xl bg-gradient-to-br ${scenario.color} text-white text-left shadow-lg hover:shadow-xl transition-all`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-3xl flex-shrink-0">{scenario.icon}</span>
                                <div>
                                  <h4 className="font-bold mb-1">{scenario.title}</h4>
                                  <p className="text-xs text-white/90">{scenario.description}</p>
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Memory Manager View */}
                  <AnimatePresence>
                    {showMemoryManager && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 overflow-y-auto p-6 bg-gray-50"
                      >
                        <MemoryManager onClose={() => setShowMemoryManager(false)} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Chat Messages */}
                  {!showMemoryManager && (
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                      {messages.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                          {activeScenario ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="max-w-md"
                            >
                              <div className="text-6xl mb-4">{activeScenario.icon}</div>
                              <h4 className="font-semibold text-xl text-gray-700 mb-3">
                                {activeScenario.title}
                              </h4>
                              <p className="text-gray-600 mb-6">
                                {activeScenario.description}
                              </p>
                              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                <p className="text-sm text-blue-900 font-semibold mb-2">
                                  💡 How this works:
                                </p>
                                <ul className="text-xs text-blue-800 text-left space-y-1">
                                  <li>• Share what you want to practice or explore</li>
                                  <li>• The AI will respond in character to help you</li>
                                  <li>• Take your time - there's no rush</li>
                                  <li>• End anytime by clicking "End Role-play"</li>
                                </ul>
                              </div>
                            </motion.div>
                          ) : (
                            <>
                              <Heart className="w-16 h-16 text-rose-300 mb-4 fill-current" />
                              <h4 className="font-semibold text-lg text-gray-700 mb-2">
                                {t('crisis.aiChatInitialPromptHeader')}
                              </h4>
                              <p className="text-sm text-gray-500 max-w-md mb-4">
                                {t('crisis.aiChatInitialPromptText')}
                                {memoryConsent && memories.filter(m => m.is_active).length > 0 && (
                                  <span className="block mt-2 text-purple-600 font-semibold">
                                    ✨ I remember {memories.filter(m => m.is_active).length} things about you
                                  </span>
                                )}
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => setShowScenarios(true)}
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                                >
                                  🎭 Try Practice Scenarios
                                </Button>
                                <Button
                                  onClick={() => setShowMemoryManager(true)}
                                  variant="outline"
                                  className="border-2 border-purple-300"
                                >
                                  <Brain className="w-4 h-4 mr-2" />
                                  Manage Memory
                                </Button>
                              </div>
                              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300 max-w-md">
                                <p className="text-sm text-yellow-900 font-semibold mb-2">
                                  ⚠️ {t('crisis.importantReminder')}
                                </p>
                                <p className="text-xs text-yellow-800">
                                  {t('crisis.aiChatDisclaimer')}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {messages.map((msg, idx) => (
                        <MessageBubble key={msg.id || idx} message={msg} />
                      ))}

                      {isLoading && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Heart className="w-4 h-4 animate-pulse text-rose-500" />
                          <span className="text-sm">
                            {activeScenario ? 'Responding in character...' : t('crisis.listeningStatus')}
                          </span>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  )}

                  {/* Input Area */}
                  {!showMemoryManager && (
                    <div className="p-4 bg-white border-t-2 border-gray-200">
                      {activeScenario && (
                        <div className="mb-3 p-3 bg-purple-50 rounded-lg border-2 border-purple-200 flex items-start gap-2">
                          <span className="text-2xl">{activeScenario.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-purple-900">
                              Role-playing: {activeScenario.title}
                            </p>
                            <p className="text-xs text-purple-700">
                              Practice mode active - speak freely and explore
                            </p>
                          </div>
                          <Button
                            onClick={endScenario}
                            size="sm"
                            variant="ghost"
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                          placeholder={
                            activeScenario 
                              ? "Share what you want to practice..."
                              : t('crisis.aiChatInputPlaceholder')
                          }
                          className="flex-1 border-2 border-gray-300 focus:border-rose-400"
                          disabled={isLoading}
                        />
                        <Button
                          onClick={() => handleSendMessage()}
                          disabled={!input.trim() || isLoading}
                          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        💡 {activeScenario ? 'This is a practice scenario - a safe space to explore' : t('crisis.aiChatBottomDisclaimer')}
                        {memoryConsent && !activeScenario && (
                          <span className="block mt-1 text-purple-600">
                            🧠 Memory active - AI remembers your journey
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Medical Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <MedicalDisclaimer variant="prominent" page="crisis" />
          </motion.div>

          {/* Emergency Banner - Localized */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-2xl shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-12 h-12 fill-current" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold">{t('crisis.title')}</h1>
                <p className="text-rose-100">
                  {user?.location_settings?.country ? `${user.location_settings.country} - ` : ''}
                  {t('crisis.subtitle')}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {localResources.hotlines[0] && (
                <a href={`tel:${localResources.hotlines[0].number.replace(/[^0-9]/g, '')}`}>
                  <Button size="lg" className="w-full bg-white text-rose-600 hover:bg-rose-50 py-6 text-lg font-bold shadow-xl">
                    <Phone className="w-6 h-6 mr-3" />
                    {t('crisis.callNow')} {localResources.hotlines[0].number}
                  </Button>
                </a>
              )}
              {localResources.hotlines.find(h => h.sms) && (
                <a href={`sms:${localResources.hotlines.find(h => h.sms)?.number}${localResources.hotlines.find(h => h.sms)?.number.includes('741741') ? '&body=HOME' : ''}`}>
                  <Button size="lg" className="w-full bg-white text-rose-600 hover:bg-rose-50 py-6 text-lg font-bold shadow-xl">
                    <MessageSquare className="w-6 h-6 mr-3" />
                    {t('crisis.textNow')} {localResources.hotlines.find(h => h.sms)?.number}
                  </Button>
                </a>
              )}
            </div>
          </motion.div>

          {/* Quick View of Saved Safety Plan - Shows if plan exists */}
          {crisisSupport?.safety_plan_created && (
            <SafetyPlanQuickView 
              crisisSupport={crisisSupport}
              onEdit={() => setShowSafetyPlanWizard(true)}
              onExport={exportSafetyPlan}
            />
          )}

          {/* Safety Plan CTA - Show if NO plan exists */}
          {!crisisSupport?.safety_plan_created && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100 border-4 border-purple-300 shadow-2xl hover:shadow-3xl transition-all cursor-pointer group overflow-hidden"
                onClick={() => setShowSafetyPlanWizard(true)}
              >
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="flex-shrink-0"
                    >
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-2xl">
                        <Shield className="w-12 h-12 text-white" />
                      </div>
                    </motion.div>
                    
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        🛡️ Create Your Safety Plan
                      </h2>
                      <p className="text-lg text-gray-700 mb-4">
                        A step-by-step guide to create your personal crisis prevention plan
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className="bg-amber-500 text-white">⚠️ Warning Signs</Badge>
                        <Badge className="bg-green-500 text-white">🌿 Coping Tools</Badge>
                        <Badge className="bg-rose-500 text-white">💖 Reasons to Live</Badge>
                        <Badge className="bg-blue-500 text-white">👥 Safe People</Badge>
                        <Badge className="bg-purple-500 text-white">👨‍⚕️ Professionals</Badge>
                        <Badge className="bg-cyan-500 text-white">🏡 Safe Places</Badge>
                      </div>
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white group-hover:from-purple-700 group-hover:to-blue-700 shadow-lg">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Start Creating Plan
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Safe Place - NEW Prominent Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Link to={createPageUrl('SafePlace')}>
              <Card className="bg-gradient-to-br from-cyan-100 via-purple-100 to-pink-100 border-4 border-purple-300 shadow-2xl hover:shadow-3xl transition-all cursor-pointer group overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="flex-shrink-0"
                    >
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-2xl">
                        <Heart className="w-12 h-12 text-white fill-current" />
                      </div>
                    </motion.div>
                    
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">
                        {t('crisis.safePlaceTitle')} 🌿
                      </h2>
                      <p className="text-lg text-gray-700 mb-4">
                        {t('crisis.safePlaceDescription')}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className="bg-cyan-500 text-white">🌊 {t('crisis.safePlaceBeach')}</Badge>
                        <Badge className="bg-green-500 text-white">🌲 {t('crisis.safePlaceForest')}</Badge>
                        <Badge className="bg-purple-500 text-white">🏔️ {t('crisis.safePlaceMountain')}</Badge>
                        <Badge className="bg-amber-500 text-white">🕯️ {t('crisis.safePlaceCozyRoom')}</Badge>
                        <Badge className="bg-rose-500 text-white">🔥 {t('crisis.safePlaceFireplace')}</Badge>
                      </div>
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white group-hover:from-purple-700 group-hover:to-pink-700 shadow-lg">
                        <Sparkles className="w-5 h-5 mr-2" />
                        {t('crisis.enterSafePlace')}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* SSRI Black Box Warning */}
          {hasSSRIWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <Card className="border-4 border-orange-500 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-8 h-8 text-orange-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-orange-900 mb-2">
                        {t('crisis.medicationSafetyNotice')}
                      </h3>
                      <p className="text-orange-800 mb-3">
                        {t('crisis.ssriWarningText1')} <strong>{t('crisis.contactPrescriber')}</strong>.
                      </p>
                      <p className="text-orange-800 mb-4">
                        {t('crisis.ssriWarningText2')}
                      </p>
                      {crisisSupport.current_medications?.filter(m => m.is_ssri).map((med, idx) => (
                        <div key={idx} className="bg-white/60 rounded-lg p-3 mb-2">
                          <p className="font-semibold text-orange-900">{med.medication_name}</p>
                          {med.prescriber_name && (
                            <p className="text-sm text-orange-700">
                              {t('crisis.prescriber')}: {med.prescriber_name}
                              {med.prescriber_phone && (
                                <a href={`tel:${med.prescriber_phone}`} className="ml-2 underline">
                                  {med.prescriber_phone}
                                </a>
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Immediate Coping Tools */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-600" />
                {t('crisis.immediateSupportTitle')}
              </CardTitle>
              <CardDescription>
                {t('crisis.immediateSupportDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* AI Support Tool - First Priority */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={() => setShowAISupport(true)}
                    className="w-full h-auto py-6 bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <Brain className="w-8 h-8" />
                      <div className="text-left flex-1">
                        <div className="font-bold text-lg">{t('crisis.talkToAiNow')}</div>
                        <div className="text-sm text-white/90">{t('crisis.aiImmediateSupportDesc')}</div>
                      </div>
                    </div>
                  </Button>
                </motion.div>

                {IMMEDIATE_COPING_TOOLS.map((tool, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (idx + 1) * 0.1 }}
                  >
                    <Button
                      onClick={() => {
                        if (tool.action === 'breathing') {
                          navigate(createPageUrl('MindfulnessHub'));
                        } else if (tool.action === 'coach') {
                           setShowAISupport(true);
                        } else if (tool.action === 'grounding') {
                          toast.info(t('crisis.startingGrounding'));
                          // Could open a modal with grounding exercise
                        } else if (tool.action === 'visualization') {
                          navigate(createPageUrl('MindfulnessHub'));
                        }
                      }}
                      className={`w-full h-auto py-6 bg-gradient-to-br ${tool.color} text-white shadow-lg hover:shadow-xl transition-all`}
                    >
                      <div className="flex items-center gap-4">
                        <tool.icon className="w-8 h-8" />
                        <div className="text-left flex-1">
                          <div className="font-bold text-lg">{tool.title}</div>
                          <div className="text-sm text-white/90">{tool.description}</div>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Resource Directory */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Shield className="w-6 h-6 text-blue-600" />
                      Complete Resource Directory
                    </CardTitle>
                    <CardDescription>
                      Find specialized support for every need - searchable, categorized, and AI-powered
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowResourceDirectory(!showResourceDirectory)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {showResourceDirectory ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Close
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Browse Resources
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              <AnimatePresence>
                {showResourceDirectory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <CardContent>
                      <ResourceDirectory 
                        userCountry={user?.location_settings?.country}
                        userLanguage={user?.preferred_language}
                      />
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showResourceDirectory && (
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-red-50 rounded-lg text-center">
                      <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="font-bold text-red-900">Immediate Crisis</p>
                      <p className="text-sm text-red-700">24/7 hotlines & emergency support</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="font-bold text-purple-900">Therapy & Counseling</p>
                      <p className="text-sm text-purple-700">Long-term mental health care</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="font-bold text-blue-900">Specialized Support</p>
                      <p className="text-sm text-blue-700">Addiction, DV, LGBTQ+, Veterans & more</p>
                    </div>
                  </div>

                  {/* Preview of features */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      <h4 className="font-bold text-blue-900">Inside the Directory:</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        AI-powered resource matching
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Save & organize favorites
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Quick access shortcuts
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Filter by location & language
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* All Crisis Resources - Localized */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-6 h-6 text-blue-600" />
                {user?.location_settings?.country ? `${user.location_settings.country} ` : ''}{t('crisis.crisisResources')}
              </CardTitle>
              <CardDescription>
                {t('crisis.crisisResourcesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {localResources.hotlines.map((hotline, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-blue-900 mb-1">
                        {hotline.name}
                        {hotline.languages && (
                          <span className="ml-2 text-sm font-normal text-blue-600">
                            ({hotline.languages.map(l => l.toUpperCase()).join(', ')})
                          </span>
                        )}
                      </h3>
                      <p className="text-blue-700 mb-2">{hotline.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <a href={`tel:${hotline.number.replace(/[^0-9]/g, '')}`}>
                          <Badge className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                            <Phone className="w-3 h-3 mr-1" />
                            {hotline.number}
                          </Badge>
                        </a>
                        {hotline.chat && (
                          <a href={hotline.chat} target="_blank" rel="noopener noreferrer">
                            <Badge variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 cursor-pointer">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              {t('crisis.onlineChat')}
                            </Badge>
                          </a>
                        )}
                        {hotline.sms && (
                          <Badge variant="outline" className="border-blue-600 text-blue-600">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {t('crisis.textService')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <h3 className="font-bold text-purple-900 mb-2">🚨 {t('crisis.inDanger')}</h3>
                <p className="text-purple-800 mb-3">
                  {t('crisis.callEmergency')}: <strong>{localResources.emergency}</strong>
                </p>
                <a href={`tel:${localResources.emergency}`}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg">
                    <Phone className="w-5 h-5 mr-2" />
                    {t('crisis.callNow')} {localResources.emergency}
                  </Button>
                </a>
              </div>

              {/* Change Location/Language */}
              <div className="p-4 bg-cyan-50 rounded-lg border-2 border-cyan-200">
                <p className="text-sm text-cyan-900 mb-3">
                  <Globe className="w-4 h-4 inline mr-2" />
                  {t('crisis.needDifferentLocation')}
                </p>
                <Button
                  onClick={() => navigate(createPageUrl('Account') + '?tab=location')}
                  variant="outline"
                  className="w-full border-2 border-cyan-300"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {t('crisis.updateLocation')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section Tabs */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 mb-8">
            <CardHeader>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setActiveSection('resources')}
                  variant={activeSection === 'resources' ? 'default' : 'outline'}
                  className={activeSection === 'resources' ? 'bg-purple-600' : ''}
                >
                  <LifeBuoy className="w-4 h-4 mr-2" />
                  {t('crisis.resources')}
                </Button>
                <Button
                  onClick={() => setActiveSection('safety_plan')}
                  variant={activeSection === 'safety_plan' ? 'default' : 'outline'}
                  className={activeSection === 'safety_plan' ? 'bg-purple-600' : ''}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {t('crisis.safetyPlan')}
                </Button>
                <Button
                  onClick={() => setActiveSection('reasons')}
                  variant={activeSection === 'reasons' ? 'default' : 'outline'}
                  className={activeSection === 'reasons' ? 'bg-purple-600' : ''}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {t('crisis.reasonsToLive')}
                </Button>
                <Button
                  onClick={() => setActiveSection('medications')}
                  variant={activeSection === 'medications' ? 'default' : 'outline'}
                  className={activeSection === 'medications' ? 'bg-purple-600' : ''}
                >
                  <Pill className="w-4 h-4 mr-2" />
                  {t('crisis.medications')}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <AnimatePresence mode="wait">
                
                {activeSection === 'resources' && (
                  <motion.div
                    key="resources"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* You're Not Alone Message */}
                    <div className="p-6 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl border-2 border-rose-300">
                      <h3 className="text-2xl font-bold text-rose-900 mb-4 flex items-center gap-2">
                        <Users className="w-7 h-7" />
                        {t('crisis.notAlone')}
                      </h3>
                      <div className="space-y-3 text-rose-800">
                        <p className="text-lg leading-relaxed">
                          💙 <strong>{t('crisis.manyPeopleFeel')}</strong> - {t('crisis.manyPeopleDesc')}
                        </p>
                        <p className="text-lg leading-relaxed">
                          🌅 <strong>{t('crisis.temporaryFeeling')}</strong> - {t('crisis.temporaryDesc')}
                        </p>
                        <p className="text-lg leading-relaxed">
                          🤝 <strong>{t('crisis.helpAvailable')}</strong> - {t('crisis.helpAvailableDesc')}
                        </p>
                        <p className="text-lg leading-relaxed">
                          ✨ <strong>{t('crisis.tomorrowDifferent')}</strong> - {t('crisis.tomorrowDesc')}
                        </p>
                      </div>
                    </div>

                    {/* Stories of Hope */}
                    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          {t('crisis.whyOthersStayed')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <StoryOfHope
                          quote={t('crisis.story1Quote')}
                          author={t('crisis.story1Author')}
                        />
                        <StoryOfHope
                          quote={t('crisis.story2Quote')}
                          author={t('crisis.story2Author')}
                        />
                        <StoryOfHope
                          quote={t('crisis.story3Quote')}
                          author={t('crisis.story3Author')}
                        />
                      </CardContent>
                    </Card>

                    {/* Connect with Support */}
                    <Card className="bg-white border-2 border-green-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-green-600" />
                          {t('crisis.talkToSomeoneNow')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Modified Link to GriefCoach to open AI crisis support modal */}
                        <Button
                          onClick={() => setShowAISupport(true)}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg text-lg py-6"
                        >
                          <Brain className="w-6 h-6 mr-3" />
                          {t('crisis.talkToAiCoach')}
                        </Button>

                        <Link to={createPageUrl('CommunityHub')}>
                          <Button variant="outline" className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50 text-lg py-6">
                            <Users className="w-6 h-6 mr-3" />
                            {t('crisis.connectWithCommunity')}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeSection === 'safety_plan' && (
                  <motion.div
                    key="safety_plan"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <h3 className="font-bold text-blue-900 mb-2">{t('crisis.whatIsSafetyPlan')}</h3>
                      <p className="text-blue-800 text-sm">
                        {t('crisis.safetyPlanDefinition')}
                      </p>
                    </div>

                    {/* Coping Strategies */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3">{t('crisis.myCopingStrategies')}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {t('crisis.copingDesc')}
                      </p>

                      <div className="space-y-2 mb-4">
                        {crisisSupport.coping_strategies?.map((strategy, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-2 border-green-200"
                          >
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <p className="text-gray-800 flex-1">{strategy}</p>
                            <Button
                              onClick={() => removeCoping(idx)}
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          value={newCoping}
                          onChange={(e) => setNewCoping(e.target.value)}
                          placeholder={t('crisis.copingInputPlaceholder')}
                          onKeyPress={(e) => e.key === 'Enter' && addCoping()}
                          className="flex-1"
                        />
                        <Button onClick={addCoping} className="bg-green-600 hover:bg-green-700">
                          <Plus className="w-4 h-4 mr-2" />
                          {t('crisis.addStrategy')}
                        </Button>
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800 mb-2 font-semibold">💡 {t('crisis.suggestedCopingStrategies')}:</p>
                        <div className="flex flex-wrap gap-2">
                          {[t('crisis.bath'), t('crisis.music'), t('crisis.pets'), t('crisis.friend'), 
                            t('crisis.comedy'), t('crisis.walk'), t('crisis.breathing'), t('crisis.journal')].map((suggestion, idx) => (
                            <Button
                              key={idx}
                              onClick={() => {
                                const updated = [...(crisisSupport.coping_strategies || []), suggestion];
                                updateCrisisSupportMutation.mutate({ coping_strategies: updated });
                                toast.success(t('crisis.addedToStrategies'));
                              }}
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              + {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'reasons' && (
                  <motion.div
                    key="reasons"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="p-6 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl border-2 border-rose-300">
                      <h3 className="text-2xl font-bold text-rose-900 mb-3">💖 {t('crisis.reasonsToKeepGoing')}</h3>
                      <p className="text-rose-800">
                        {t('crisis.reasonsDesc')}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {crisisSupport.reasons_for_living?.map((reason, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200"
                        >
                          <div className="flex items-start gap-3">
                            <Heart className="w-6 h-6 text-rose-500 flex-shrink-0 mt-1 fill-current" />
                            <p className="text-gray-800 flex-1 text-lg">{reason}</p>
                            <Button
                              onClick={() => removeReason(idx)}
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {crisisSupport.reasons_for_living?.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p>{t('crisis.addFirstReasonPrompt')}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">{t('crisis.addReason')}</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newReason}
                          onChange={(e) => setNewReason(e.target.value)}
                          placeholder={t('crisis.reasonInputPlaceholder')}
                          onKeyPress={(e) => e.key === 'Enter' && addReason()}
                          className="flex-1"
                        />
                        <Button onClick={addReason} className="bg-rose-600 hover:bg-rose-700">
                          <Plus className="w-4 h-4 mr-2" />
                          {t('crisis.addStrategy')}
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                      <p className="text-sm text-amber-900 mb-2 font-semibold">💡 {t('crisis.commonReasonsToStay')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {[t('crisis.myChildren'), t('crisis.myPets'), t('crisis.myFamily'), t('crisis.futureTravel'), 
                          t('crisis.favoriteMusic'), t('crisis.unreadBooks'), t('crisis.sunsets'), t('crisis.someoneNew'),
                          t('crisis.bestFriend'), t('crisis.makeADifference'), t('crisis.artCreativity')].map((suggestion, idx) => (
                          <Button
                            key={idx}
                            onClick={() => {
                              const updated = [...(crisisSupport.reasons_for_living || []), suggestion];
                              updateCrisisSupportMutation.mutate({ reasons_for_living: updated });
                              toast.success(t('crisis.reasonAdded'));
                            }}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            + {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'medications' && (
                  <motion.div
                    key="medications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="p-6 bg-orange-50 rounded-2xl border-2 border-orange-300">
                      <h3 className="text-2xl font-bold text-orange-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-7 h-7" />
                        {t('crisis.ssriWarningTitle')}
                      </h3>
                      <div className="space-y-3 text-orange-800">
                        <p className="text-base leading-relaxed">
                          <strong>{t('crisis.blackBoxWarning')}:</strong> {t('crisis.ssriWarningDetails1')}
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>{t('crisis.ssriWarningDetail1A')}</li>
                          <li>{t('crisis.ssriWarningDetail1B')}</li>
                          <li>{t('crisis.ssriWarningDetail1C')}</li>
                        </ul>
                        <p className="text-base leading-relaxed font-semibold">
                          ⚠️ {t('crisis.ssriWarningDetails2')}
                        </p>
                        <p className="text-base leading-relaxed">
                          {t('crisis.ssriWarningDetails3')}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 mb-2">
                        {t('crisis.medicationTrackingInfo')}
                      </p>
                    </div>

                    {/* Medication tracking UI would go here - simplified for now */}
                    <div className="text-center py-8 text-gray-500">
                      <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="mb-4">{t('crisis.medicationTrackingSoon')}</p>
                      <p className="text-sm">{t('crisis.prescriberContactReminder')}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Bottom Encouragement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-8"
          >
            <Card className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border-4 border-purple-300">
              <CardContent className="p-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-16 h-16 mx-auto mb-4 text-rose-500 fill-current" />
                </motion.div>
                <h3 className="text-3xl font-bold text-purple-900 mb-3">
                  {t('crisis.yourLifeHasValue')}
                </h3>
                <p className="text-xl text-purple-800 mb-4 max-w-2xl mx-auto">
                  {t('crisis.lifeValueDesc')}
                </p>
                <p className="text-lg text-purple-700 font-semibold">
                  {t('crisis.deserveSupport')} 💜
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}

function StoryOfHope({ quote, author }) {
  return (
    <div className="p-4 bg-white/60 rounded-lg border border-purple-200">
      <p className="text-gray-700 italic mb-2">"{quote}"</p>
      <p className="text-sm text-gray-600">— {author}</p>
    </div>
  );
}

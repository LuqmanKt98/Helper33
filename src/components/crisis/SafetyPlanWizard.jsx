
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Heart,
  Users,
  Phone,
  Briefcase,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Save,
  Download,
  Mail,
  Home,
  Activity,
  Loader2 // Added Loader2 import
} from 'lucide-react';
import { toast } from 'sonner';

const WIZARD_STEPS = [
  {
    id: 'warning_signs',
    title: 'Recognize Warning Signs',
    description: 'Identify when you might be struggling',
    icon: AlertTriangle,
    color: 'from-amber-500 to-orange-500',
    emoji: '⚠️'
  },
  {
    id: 'coping_strategies',
    title: 'Coping Strategies',
    description: 'Things that help you feel better',
    icon: Activity,
    color: 'from-green-500 to-emerald-500',
    emoji: '🌿'
  },
  {
    id: 'reasons_to_live',
    title: 'Reasons to Keep Going',
    description: 'What makes life worth living',
    icon: Heart,
    color: 'from-rose-500 to-pink-500',
    emoji: '💖'
  },
  {
    id: 'safe_people',
    title: 'Safe People',
    description: 'People you can reach out to',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    emoji: '👥'
  },
  {
    id: 'professional_contacts',
    title: 'Professional Support',
    description: 'Therapists, doctors, counselors',
    icon: Briefcase,
    color: 'from-purple-500 to-indigo-500',
    emoji: '👨‍⚕️'
  },
  {
    id: 'safe_environments',
    title: 'Safe Environments',
    description: 'Places where you feel calm',
    icon: Home,
    color: 'from-cyan-500 to-blue-500',
    emoji: '🏡'
  },
  {
    id: 'review',
    title: 'Review & Save',
    description: 'Your completed safety plan',
    icon: CheckCircle,
    color: 'from-green-600 to-emerald-600',
    emoji: '✅'
  }
];

const SUGGESTED_WARNING_SIGNS = [
  'Feeling hopeless or trapped',
  'Withdrawing from friends and family',
  'Sleeping too much or too little',
  'Increased anxiety or agitation',
  'Reckless behavior',
  'Mood swings',
  'Talking about being a burden',
  'Giving away possessions',
  'Saying goodbye to people'
];

const SUGGESTED_COPING = [
  'Take a warm bath or shower',
  'Listen to calming music',
  'Call a friend',
  'Take a walk in nature',
  'Practice deep breathing',
  'Write in a journal',
  'Watch a favorite show or movie',
  'Play with a pet',
  'Do a creative activity',
  'Exercise or stretch'
];

const SUGGESTED_REASONS = [
  'My children or family',
  'My pets',
  'Future goals and dreams',
  'People who would miss me',
  'Things I haven\'t experienced yet',
  'Making a difference in the world',
  'My favorite music or art',
  'Nature and beautiful places',
  'The possibility of feeling better',
  'Unfinished books to read'
];

export default function SafetyPlanWizard({ crisisSupport, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize with existing data from crisisSupport
  const [planData, setPlanData] = useState({
    warning_signs: Array.isArray(crisisSupport?.warning_signs) ? [...crisisSupport.warning_signs] : [],
    coping_strategies: Array.isArray(crisisSupport?.coping_strategies) ? [...crisisSupport.coping_strategies] : [],
    reasons_for_living: Array.isArray(crisisSupport?.reasons_for_living) ? [...crisisSupport.reasons_for_living] : [],
    safe_people: Array.isArray(crisisSupport?.safe_people) ? [...crisisSupport.safe_people] : [],
    professional_contacts: Array.isArray(crisisSupport?.professional_contacts) ? [...crisisSupport.professional_contacts] : [],
    safe_environments: Array.isArray(crisisSupport?.safe_environments) ? [...crisisSupport.safe_environments] : [],
    distraction_activities: Array.isArray(crisisSupport?.distraction_activities) ? [...crisisSupport.distraction_activities] : []
  });

  // Debug: Log the loaded data
  React.useEffect(() => {
    console.log('🛡️ Safety Plan Wizard - Loaded Data:', {
      crisisSupport,
      planData,
      warning_signs_count: planData.warning_signs.length,
      coping_count: planData.coping_strategies.length,
      reasons_count: planData.reasons_for_living.length,
      safe_people_count: planData.safe_people.length
    });
  }, []);

  const [newItem, setNewItem] = useState('');
  const [newPerson, setNewPerson] = useState({ name: '', relationship: '', phone: '', email: '', notify_in_crisis: true });
  const [newProfessional, setNewProfessional] = useState({ name: '', role: '', phone: '', email: '', availability: '' });

  const queryClient = useQueryClient();

  const updatePlanMutation = useMutation({
    mutationFn: async (data) => {
      console.log('💾 Saving safety plan data:', data);
      
      const updateData = {
        warning_signs: data.warning_signs || [],
        coping_strategies: data.coping_strategies || [],
        reasons_for_living: data.reasons_for_living || [],
        safe_people: data.safe_people || [],
        professional_contacts: data.professional_contacts || [],
        safe_environments: data.safe_environments || [],
        distraction_activities: data.distraction_activities || [],
        safety_plan_created: true
      };
      
      const result = await base44.entities.CrisisSupport.update(crisisSupport.id, updateData);
      console.log('✅ Save result:', result);
      return result;
    },
    onSuccess: async (data) => {
      console.log('✅ Safety plan saved successfully:', data);
      // Invalidate and refetch to ensure fresh data
      await queryClient.invalidateQueries(['crisisSupport']);
      await queryClient.refetchQueries(['crisisSupport']);
      setIsSaving(false);
    },
    onError: (error) => {
      console.error('❌ Error saving safety plan:', error);
      toast.error('Failed to save safety plan. Please try again.');
      setIsSaving(false);
    }
  });

  const currentStepData = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  const addToList = (field) => {
    if (!newItem.trim()) return;
    setPlanData(prev => ({
      ...prev,
      [field]: [...prev[field], newItem.trim()]
    }));
    setNewItem('');
  };

  const removeFromList = (field, index) => {
    setPlanData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addPerson = () => {
    if (!newPerson.name.trim()) {
      toast.error('Please enter a name');
      return;
    }
    setPlanData(prev => ({
      ...prev,
      safe_people: [...prev.safe_people, { ...newPerson }]
    }));
    setNewPerson({ name: '', relationship: '', phone: '', email: '', notify_in_crisis: true });
  };

  const removePerson = (index) => {
    setPlanData(prev => ({
      ...prev,
      safe_people: prev.safe_people.filter((_, i) => i !== index)
    }));
  };

  const addProfessional = () => {
    if (!newProfessional.name.trim()) {
      toast.error('Please enter a name');
      return;
    }
    setPlanData(prev => ({
      ...prev,
      professional_contacts: [...prev.professional_contacts, { ...newProfessional }]
    }));
    setNewProfessional({ name: '', role: '', phone: '', email: '', availability: '' });
  };

  const removeProfessional = (index) => {
    setPlanData(prev => ({
      ...prev,
      professional_contacts: prev.professional_contacts.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePlanMutation.mutateAsync(planData);
      toast.success('✅ Safety plan saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      // Error handling is already done in updatePlanMutation's onError
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await updatePlanMutation.mutateAsync(planData);
      toast.success('🎉 Safety plan completed and saved!');
      setTimeout(() => {
        onClose();
      }, 1500); // Slightly increased delay for toast visibility
    } catch (error) {
      console.error('Complete error:', error);
      // Error handling is already done in updatePlanMutation's onError
      setIsSaving(false); // Ensure saving state is reset even if toast failed
    }
  };

  const exportPlan = () => {
    const planText = `
MY SAFETY PLAN
Generated: ${new Date().toLocaleDateString()}

⚠️ WARNING SIGNS
${(planData.warning_signs || []).map((s, i) => `${i + 1}. ${s}`).join('\n') || 'None added yet'}

🌿 COPING STRATEGIES
${(planData.coping_strategies || []).map((s, i) => `${i + 1}. ${s}`).join('\n') || 'None added yet'}

💖 REASONS TO KEEP GOING
${(planData.reasons_for_living || []).map((r, i) => `${i + 1}. ${r}`).join('\n') || 'None added yet'}

👥 SAFE PEOPLE
${(planData.safe_people || []).map((p, i) => `${i + 1}. ${p.name}${p.relationship ? ` (${p.relationship})` : ''}${p.phone ? ` - ${p.phone}` : ''}`).join('\n') || 'None added yet'}

👨‍⚕️ PROFESSIONAL CONTACTS
${(planData.professional_contacts || []).map((p, i) => `${i + 1}. ${p.name}${p.role ? ` - ${p.role}` : ''}${p.phone ? ` - ${p.phone}` : ''}`).join('\n') || 'None added yet'}

🏡 SAFE ENVIRONMENTS
${(planData.safe_environments || []).map((s, i) => `${i + 1}. ${s}`).join('\n') || 'None added yet'}

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
    toast.success('📥 Safety plan downloaded!');
  };

  const StepIcon = currentStepData.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${currentStepData.color} text-white p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <StepIcon className="w-6 h-6" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Create Your Safety Plan</h2>
                <p className="text-white/90 text-sm">Step {currentStep + 1} of {WIZARD_STEPS.length}</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2 bg-white/20" />
            <div className="flex justify-between text-xs text-white/80">
              <span>{currentStepData.emoji} {currentStepData.title}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Step Description */}
              <div className={`p-4 rounded-xl bg-gradient-to-br ${currentStepData.color} bg-opacity-10 border-2`}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{currentStepData.emoji}</span>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{currentStepData.title}</h3>
                    <p className="text-sm text-gray-700">{currentStepData.description}</p>
                  </div>
                </div>
              </div>

              {/* WARNING SIGNS */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                    <p className="text-sm text-amber-900">
                      <strong>💡 Why this matters:</strong> Recognizing early warning signs helps you take action before things get worse. These are personal to you - what signals that you might be entering a difficult period?
                    </p>
                  </div>

                  {/* Current Warning Signs */}
                  <div className="space-y-2">
                    {planData.warning_signs.map((sign, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span className="text-gray-800 flex-1">{sign}</span>
                        <Button
                          onClick={() => removeFromList('warning_signs', idx)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add New */}
                  <div className="flex gap-2">
                    <Input
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      placeholder="e.g., Feeling isolated from others"
                      onKeyPress={(e) => e.key === 'Enter' && addToList('warning_signs')}
                      className="flex-1"
                    />
                    <Button onClick={() => addToList('warning_signs')} className="bg-amber-600 hover:bg-amber-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  {/* Suggestions */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">💡 Common Warning Signs:</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_WARNING_SIGNS.map((suggestion, idx) => (
                        <Button
                          key={idx}
                          onClick={() => {
                            if (!planData.warning_signs.includes(suggestion)) {
                              setPlanData(prev => ({
                                ...prev,
                                warning_signs: [...prev.warning_signs, suggestion]
                              }));
                            }
                          }}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          disabled={planData.warning_signs.includes(suggestion)}
                        >
                          + {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* COPING STRATEGIES */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <p className="text-sm text-green-900">
                      <strong>💡 Why this matters:</strong> Having go-to coping strategies ready can help you manage difficult emotions. What activities, people, or techniques help you feel more grounded?
                    </p>
                  </div>

                  {/* Current Strategies */}
                  <div className="space-y-2">
                    {planData.coping_strategies.map((strategy, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-800 flex-1">{strategy}</span>
                        <Button
                          onClick={() => removeFromList('coping_strategies', idx)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add New */}
                  <div className="flex gap-2">
                    <Input
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      placeholder="e.g., Listen to my favorite playlist"
                      onKeyPress={(e) => e.key === 'Enter' && addToList('coping_strategies')}
                      className="flex-1"
                    />
                    <Button onClick={() => addToList('coping_strategies')} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  {/* Suggestions */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">💡 Suggested Coping Strategies:</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_COPING.map((suggestion, idx) => (
                        <Button
                          key={idx}
                          onClick={() => {
                            if (!planData.coping_strategies.includes(suggestion)) {
                              setPlanData(prev => ({
                                ...prev,
                                coping_strategies: [...prev.coping_strategies, suggestion]
                              }));
                            }
                          }}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          disabled={planData.coping_strategies.includes(suggestion)}
                        >
                          + {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* REASONS TO LIVE */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="p-4 bg-rose-50 rounded-lg border-2 border-rose-200">
                    <p className="text-sm text-rose-900">
                      <strong>💡 Why this matters:</strong> Remembering what makes life meaningful can provide hope during dark times. What are your reasons to keep going, even when things feel impossible?
                    </p>
                  </div>

                  {/* Current Reasons */}
                  <div className="space-y-2">
                    {planData.reasons_for_living.map((reason, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-200"
                      >
                        <Heart className="w-5 h-5 text-rose-500 flex-shrink-0 fill-current" />
                        <span className="text-gray-800 flex-1">{reason}</span>
                        <Button
                          onClick={() => removeFromList('reasons_for_living', idx)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add New */}
                  <div className="flex gap-2">
                    <Input
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      placeholder="e.g., My children, seeing the sunrise, finishing my book"
                      onKeyPress={(e) => e.key === 'Enter' && addToList('reasons_for_living')}
                      className="flex-1"
                    />
                    <Button onClick={() => addToList('reasons_for_living')} className="bg-rose-600 hover:bg-rose-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  {/* Suggestions */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">💡 Common Reasons to Live:</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_REASONS.map((suggestion, idx) => (
                        <Button
                          key={idx}
                          onClick={() => {
                            if (!planData.reasons_for_living.includes(suggestion)) {
                              setPlanData(prev => ({
                                ...prev,
                                reasons_for_living: [...prev.reasons_for_living, suggestion]
                              }));
                            }
                          }}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          disabled={planData.reasons_for_living.includes(suggestion)}
                        >
                          + {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SAFE PEOPLE */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>💡 Why this matters:</strong> Having trusted people you can reach out to is crucial. List friends, family, or others who support you and can be there when you need help.
                    </p>
                  </div>

                  {/* Current People */}
                  <div className="space-y-3">
                    {planData.safe_people.map((person, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <h4 className="font-bold text-gray-900">{person.name}</h4>
                              {person.relationship && (
                                <Badge variant="outline" className="text-xs">{person.relationship}</Badge>
                              )}
                            </div>
                            {person.phone && (
                              <p className="text-sm text-gray-700 flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                {person.phone}
                              </p>
                            )}
                            {person.email && (
                              <p className="text-sm text-gray-700 flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                {person.email}
                              </p>
                            )}
                            {person.notify_in_crisis && (
                              <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Emergency contact
                              </Badge>
                            )}
                          </div>
                          <Button
                            onClick={() => removePerson(idx)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add New Person */}
                  <Card className="border-2 border-dashed border-blue-300">
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-semibold text-gray-800">Add a Safe Person</h4>
                      <Input
                        value={newPerson.name}
                        onChange={(e) => setNewPerson(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Name *"
                        className="border-blue-200"
                      />
                      <Input
                        value={newPerson.relationship}
                        onChange={(e) => setNewPerson(prev => ({ ...prev, relationship: e.target.value }))}
                        placeholder="Relationship (e.g., Best friend, Sister)"
                        className="border-blue-200"
                      />
                      <Input
                        value={newPerson.phone}
                        onChange={(e) => setNewPerson(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone number"
                        type="tel"
                        className="border-blue-200"
                      />
                      <Input
                        value={newPerson.email}
                        onChange={(e) => setNewPerson(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Email (optional)"
                        type="email"
                        className="border-blue-200"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newPerson.notify_in_crisis}
                          onChange={(e) => setNewPerson(prev => ({ ...prev, notify_in_crisis: e.target.checked }))}
                          className="w-4 h-4 rounded border-blue-300"
                        />
                        <label className="text-sm text-gray-700">Emergency contact (notify in crisis)</label>
                      </div>
                      <Button onClick={addPerson} className="w-full bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Person
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* PROFESSIONAL CONTACTS */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <p className="text-sm text-purple-900">
                      <strong>💡 Why this matters:</strong> Professional support is essential for long-term mental health. List your therapist, psychiatrist, doctor, or counselor contact information.
                    </p>
                  </div>

                  {/* Current Professionals */}
                  <div className="space-y-3">
                    {planData.professional_contacts.map((professional, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-purple-50 rounded-lg border border-purple-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Briefcase className="w-4 h-4 text-purple-600" />
                              <h4 className="font-bold text-gray-900">{professional.name}</h4>
                              {professional.role && (
                                <Badge variant="outline" className="text-xs">{professional.role}</Badge>
                              )}
                            </div>
                            {professional.phone && (
                              <p className="text-sm text-gray-700 flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                {professional.phone}
                              </p>
                            )}
                            {professional.email && (
                              <p className="text-sm text-gray-700 flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                {professional.email}
                              </p>
                            )}
                            {professional.availability && (
                              <p className="text-xs text-gray-600 mt-1">
                                Available: {professional.availability}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => removeProfessional(idx)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add New Professional */}
                  <Card className="border-2 border-dashed border-purple-300">
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-semibold text-gray-800">Add a Professional Contact</h4>
                      <Input
                        value={newProfessional.name}
                        onChange={(e) => setNewProfessional(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Name *"
                        className="border-purple-200"
                      />
                      <Input
                        value={newProfessional.role}
                        onChange={(e) => setNewProfessional(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="Role (e.g., Therapist, Psychiatrist, Counselor)"
                        className="border-purple-200"
                      />
                      <Input
                        value={newProfessional.phone}
                        onChange={(e) => setNewProfessional(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone number"
                        type="tel"
                        className="border-purple-200"
                      />
                      <Input
                        value={newProfessional.email}
                        onChange={(e) => setNewProfessional(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Email (optional)"
                        type="email"
                        className="border-purple-200"
                      />
                      <Input
                        value={newProfessional.availability}
                        onChange={(e) => setNewProfessional(prev => ({ ...prev, availability: e.target.value }))}
                        placeholder="Availability (e.g., Mon-Fri 9-5, 24-hour hotline)"
                        className="border-purple-200"
                      />
                      <Button onClick={addProfessional} className="w-full bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Professional
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* SAFE ENVIRONMENTS */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="p-4 bg-cyan-50 rounded-lg border-2 border-cyan-200">
                    <p className="text-sm text-cyan-900">
                      <strong>💡 Why this matters:</strong> Having safe, calming places to go can help you feel grounded. Where do you feel most peaceful and secure?
                    </p>
                  </div>

                  {/* Current Environments */}
                  <div className="space-y-2">
                    {planData.safe_environments.map((env, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200"
                      >
                        <Home className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                        <span className="text-gray-800 flex-1">{env}</span>
                        <Button
                          onClick={() => removeFromList('safe_environments', idx)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add New */}
                  <div className="flex gap-2">
                    <Input
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      placeholder="e.g., Local park, my bedroom, library, friend's house"
                      onKeyPress={(e) => e.key === 'Enter' && addToList('safe_environments')}
                      className="flex-1"
                    />
                    <Button onClick={() => addToList('safe_environments')} className="bg-cyan-600 hover:bg-cyan-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              )}

              {/* REVIEW */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl border-2 border-green-300">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <h3 className="text-2xl font-bold text-green-900">Your Safety Plan is Ready! 🎉</h3>
                    </div>
                    <p className="text-green-800">
                      You've created a personalized safety plan. Review it below and save it for easy access anytime you need it.
                    </p>
                  </div>

                  {/* Summary Cards */}
                  <div className="space-y-4">
                    {planData.warning_signs.length > 0 && (
                      <Card className="border-2 border-amber-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            Warning Signs ({planData.warning_signs.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1">
                            {planData.warning_signs.map((sign, idx) => (
                              <li key={idx} className="text-sm text-gray-700">• {sign}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {planData.coping_strategies.length > 0 && (
                      <Card className="border-2 border-green-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            Coping Strategies ({planData.coping_strategies.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1">
                            {planData.coping_strategies.map((strategy, idx) => (
                              <li key={idx} className="text-sm text-gray-700">• {strategy}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {planData.reasons_for_living.length > 0 && (
                      <Card className="border-2 border-rose-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Heart className="w-5 h-5 text-rose-600" />
                            Reasons to Keep Going ({planData.reasons_for_living.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1">
                            {planData.reasons_for_living.map((reason, idx) => (
                              <li key={idx} className="text-sm text-gray-700">• {reason}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {planData.safe_people.length > 0 && (
                      <Card className="border-2 border-blue-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Safe People ({planData.safe_people.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {planData.safe_people.map((person, idx) => (
                            <div key={idx} className="text-sm text-gray-700 mb-2">
                              <strong>{person.name}</strong>
                              {person.relationship && ` (${person.relationship})`}
                              {person.phone && ` - ${person.phone}`}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {planData.professional_contacts.length > 0 && (
                      <Card className="border-2 border-purple-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-purple-600" />
                            Professional Contacts ({planData.professional_contacts.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {planData.professional_contacts.map((prof, idx) => (
                            <div key={idx} className="text-sm text-gray-700 mb-2">
                              <strong>{prof.name}</strong>
                              {prof.role && ` - ${prof.role}`}
                              {prof.phone && ` - ${prof.phone}`}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {planData.safe_environments.length > 0 && (
                      <Card className="border-2 border-cyan-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Home className="w-5 h-5 text-cyan-600" />
                            Safe Environments ({planData.safe_environments.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1">
                            {planData.safe_environments.map((env, idx) => (
                              <li key={idx} className="text-sm text-gray-700">• {env}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Export Option */}
                  <div className="flex gap-2">
                    <Button
                      onClick={exportPlan}
                      variant="outline"
                      className="flex-1 border-2 border-blue-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Plan
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 bg-gray-50 border-t-2 border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={handleBack}
              disabled={currentStep === 0 || isSaving}
              variant="outline"
              className="border-2"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex-1 text-center">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="outline"
                size="sm"
                className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Progress
                  </>
                )}
              </Button>
            </div>

            {currentStep < WIZARD_STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {WIZARD_STEPS.map((step, idx) => (
              <motion.button
                key={step.id}
                onClick={() => !isSaving && setCurrentStep(idx)}
                whileHover={{ scale: 1.2 }}
                disabled={isSaving}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-purple-600 w-8'
                    : idx < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                } ${isSaving ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                title={step.title}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

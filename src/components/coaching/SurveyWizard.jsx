import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const surveySteps = [
  {
    id: 'goals',
    title: 'Your goals',
    question: 'What do you want most right now?',
    options: [
      { v: 'reduce_symptoms', label: 'Reduce anxiety/depression symptoms' },
      { v: 'emotion_reg', label: 'Manage strong emotions' },
      { v: 'meaning', label: 'Find meaning and purpose' },
      { v: 'relationship', label: 'Improve relationships' },
      { v: 'grief_processing', label: 'Process grief / loss' },
      { v: 'trauma_healing', label: 'Heal from trauma' },
      { v: 'mind_body', label: 'Mind–body grounding' },
    ],
    type: 'single',
  },
  {
    id: 'preferences',
    title: 'Coaching style',
    question: 'What style fits you best?',
    options: [
      { v: 'structured', label: 'Structured and skills-based' },
      { v: 'exploratory', label: 'Exploratory and reflective' },
      { v: 'body_based', label: 'Body-based / somatic' },
      { v: 'spiritual', label: 'Open to spiritual/holistic' },
      { v: 'brief_hypno', label: 'Brief, transformational (incl. RTT/hypnosis)' },
    ],
    type: 'single',
  },
  {
    id: 'format',
    title: 'How you like to work',
    question: 'Pick all that apply',
    options: [
      { v: 'worksheets', label: 'Worksheets/home practice' },
      { v: 'journaling', label: 'Journaling prompts' },
      { v: 'voice_notes', label: 'Voice notes & reflections' },
      { v: 'mindfulness', label: 'Mindfulness exercises' },
      { v: 'movement', label: 'Breathwork/movement' },
    ],
    type: 'multi',
  },
  {
    id: 'grief_context',
    title: 'Grief context',
    question: 'Is your primary focus grief?',
    options: [
      { v: 'none', label: 'Not primary' },
      { v: 'recent', label: 'Recent loss' },
      { v: 'prolonged', label: 'Prolonged/complicated grief' },
    ],
    type: 'single',
  },
];

export default function SurveyWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleNext = () => {
    if (currentStep < surveySteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSingleChange = (stepId, value) => {
    setAnswers({ ...answers, [stepId]: value });
  };

  const handleMultiChange = (stepId, value) => {
    const currentValues = answers[stepId] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    setAnswers({ ...answers, [stepId]: newValues });
  };

  const step = surveySteps[currentStep];
  const progress = ((currentStep + 1) / surveySteps.length) * 100;
  const isAnswered = step.type === 'single' ? !!answers[step.id] : (answers[step.id]?.length > 0);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500">{step.title}</span>
            <span className="text-sm font-medium text-gray-700">Step {currentStep + 1} of {surveySteps.length}</span>
        </div>
        <Progress value={progress} className="w-full h-2" />
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{step.question}</h2>

          {step.type === 'single' && (
            <RadioGroup
              value={answers[step.id]}
              onValueChange={(value) => handleSingleChange(step.id, value)}
              className="space-y-3"
            >
              {step.options.map((option) => (
                <Label key={option.v} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 cursor-pointer">
                  <RadioGroupItem value={option.v} id={`${step.id}-${option.v}`} />
                  <span>{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
          )}

          {step.type === 'multi' && (
            <div className="space-y-3">
              {step.options.map((option) => (
                <Label key={option.v} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 cursor-pointer">
                    <Checkbox
                        id={`${step.id}-${option.v}`}
                        checked={(answers[step.id] || []).includes(option.v)}
                        onCheckedChange={() => handleMultiChange(step.id, option.v)}
                    />
                    <span>{option.label}</span>
                </Label>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-between items-center">
        <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={handleNext} disabled={!isAnswered}>
          {currentStep === surveySteps.length - 1 ? 'Finish & See Results' : 'Continue'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
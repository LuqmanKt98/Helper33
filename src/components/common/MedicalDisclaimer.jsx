import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Heart, Shield, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function MedicalDisclaimer({ 
  variant = 'default', // 'default', 'minimal', 'prominent', 'inline'
  page = 'general',
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed && variant !== 'prominent') return null;

  const disclaimerContent = {
    general: {
      title: 'Wellness Tool, Not Medical Treatment',
      short: 'Helper33 is a wellness and personal growth tool, not a medical device or mental health treatment.',
      long: `Helper33 is designed as a wellness companion to support personal growth, reflection, and daily life management. It is NOT a replacement for medication, medical treatment, psychological therapy, or a doctor's examination.

If you are experiencing a mental health crisis or have a medical condition, please seek help from qualified healthcare professionals immediately. In the US, call 988 for crisis support or 911 for emergencies.

Helper33 does not diagnose, cure, treat, mitigate, or prevent any disease, condition, or illness. Our AI features are for journaling, organization, mindfulness, and personal reflection - not clinical intervention.`
    },
    grief: {
      title: 'Grief Support, Not Therapy',
      short: 'Our grief support features are for personal reflection and companionship, not professional grief counseling or therapy.',
      long: `Helper33 provides compassionate AI companionship for those experiencing grief and loss. This is NOT a replacement for professional grief counseling, therapy, or psychiatric care.

If you are experiencing complicated grief, suicidal thoughts, or severe depression, please contact a licensed mental health professional immediately. Crisis support: 988 (US).

Our AI grief coaches provide reflective journaling prompts and compassionate conversation - they do not provide clinical diagnosis or treatment for grief-related mental health conditions.`
    },
    crisis: {
      title: 'Crisis Resources, Not Emergency Services',
      short: 'Helper33 provides crisis resource information only. We are NOT emergency services or crisis intervention.',
      long: `Helper33 connects you with crisis resources and provides information. We are NOT a crisis hotline, emergency service, or suicide prevention service.

IF YOU ARE IN CRISIS:
• Call 988 (Suicide & Crisis Lifeline) - US
• Call 911 for immediate emergencies
• Go to your nearest emergency room
• Text "HELLO" to 741741 (Crisis Text Line)

Helper33's crisis features help you find professional resources - they do not provide clinical crisis intervention, suicide prevention, or emergency mental health treatment.`
    },
    wellness: {
      title: 'Wellness Tracking, Not Medical Monitoring',
      short: 'Helper33 wellness features are for personal tracking and reflection, not medical diagnosis or health monitoring.',
      long: `Helper33 helps you track mood, habits, and wellness goals for personal insight and motivation. This is NOT medical monitoring, diagnosis, or treatment.

Our wellness tools do not replace:
• Medical examinations or diagnoses
• Prescribed medications or treatments
• Professional healthcare advice
• Mental health therapy or counseling

Always consult qualified healthcare providers for medical decisions. Helper33 provides wellness insights for personal growth, not clinical health management.`
    }
  };

  const content = disclaimerContent[page] || disclaimerContent.general;

  if (variant === 'minimal') {
    return (
      <div className={`text-xs text-gray-500 text-center py-2 border-t border-gray-200 bg-gray-50 ${className}`}>
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-3 h-3" />
          <span>{content.short}</span>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 mb-1">{content.title}</p>
            <p className="text-xs text-blue-800 leading-relaxed">{content.short}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'prominent') {
    return (
      <AnimatePresence>
        {!isDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={className}
          >
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
                      {content.title}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsDismissed(true)}
                        className="ml-auto h-6 w-6 text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </h3>
                    <p className="text-sm text-amber-800 leading-relaxed mb-3">
                      {content.short}
                    </p>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-amber-700 hover:text-amber-900 p-0 h-auto font-semibold"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Read Full Disclaimer
                        </>
                      )}
                    </Button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-amber-200"
                        >
                          <p className="text-xs text-amber-900 whitespace-pre-line leading-relaxed">
                            {content.long}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Default variant
  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={className}
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">{content.title}</p>
                <p className="text-xs text-blue-800 leading-relaxed mb-2">{content.short}</p>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-700 hover:text-blue-900 p-0 h-auto text-xs"
                >
                  {isExpanded ? 'Show less' : 'Learn more'}
                </Button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-blue-200"
                    >
                      <p className="text-xs text-blue-900 whitespace-pre-line leading-relaxed">
                        {content.long}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDismissed(true)}
                className="h-6 w-6 text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
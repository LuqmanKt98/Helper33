import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Lightbulb, Loader2, Sparkles,
  ChevronDown, ChevronUp, CheckCircle, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

export default function AITutorAssistant({ question, userAnswer, onHintUsed }) {
  const [showHint, setShowHint] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [hint, setHint] = useState('');
  const [steps, setSteps] = useState([]);
  const [keyPoints, setKeyPoints] = useState([]);
  const [loadingHint, setLoadingHint] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const getHint = async () => {
    if (hintsUsed >= 3) {
      toast.info('💡 Maximum hints reached. Try working through the problem!');
      return;
    }

    setLoadingHint(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a helpful hint for this question WITHOUT giving away the answer: "${question.question}". The hint should guide the student's thinking. Keep it brief (1-2 sentences).`,
        response_json_schema: {
          type: "object",
          properties: {
            hint: { type: "string" }
          }
        }
      });

      setHint(result.hint);
      setShowHint(true);
      setHintsUsed(hintsUsed + 1);
      onHintUsed?.(hintsUsed + 1);
      toast.success('💡 Hint revealed!');
    } catch (error) {
      toast.error('Failed to get hint');
    } finally {
      setLoadingHint(false);
    }
  };

  const getStepByStep = async () => {
    setLoadingSteps(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a step-by-step solution for: "${question.question}". Break it down into clear, numbered steps. Also extract key concepts to remember.`,
        response_json_schema: {
          type: "object",
          properties: {
            steps: {
              type: "array",
              items: { type: "string" }
            },
            key_concepts: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setSteps(result.steps || []);
      setKeyPoints(result.key_concepts || []);
      setShowSteps(true);
      toast.success('📖 Solution breakdown ready!');
    } catch (error) {
      toast.error('Failed to get solution steps');
    } finally {
      setLoadingSteps(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Hint Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          onClick={getHint}
          disabled={loadingHint || showHint || hintsUsed >= 3}
          variant="outline"
          className="w-full border-2 border-yellow-300 hover:bg-yellow-50 touch-manipulation"
        >
          {loadingHint ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Getting hint...
            </>
          ) : (
            <>
              <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
              {showHint ? 'Hint Revealed' : `Get Hint (${3 - hintsUsed} left)`}
            </>
          )}
        </Button>

        <AnimatePresence>
          {showHint && hint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-yellow-900 text-sm mb-1">💡 Hint:</p>
                  <p className="text-sm text-yellow-800">{hint}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Step-by-Step Solution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Button
          onClick={() => showSteps ? setShowSteps(false) : getStepByStep()}
          disabled={loadingSteps}
          variant="outline"
          className="w-full border-2 border-blue-300 hover:bg-blue-50 touch-manipulation"
        >
          {loadingSteps ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating steps...
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
              {showSteps ? 'Hide' : 'Show'} Step-by-Step Solution
              {showSteps ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </>
          )}
        </Button>

        <AnimatePresence>
          {showSteps && steps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                    <Brain className="w-5 h-5" />
                    Step-by-Step Solution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {steps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-gray-700 flex-1 pt-1">{step}</p>
                    </motion.div>
                  ))}

                  {keyPoints.length > 0 && (
                    <div className="mt-4 pt-4 border-t-2 border-blue-200">
                      <p className="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Key Concepts to Remember:
                      </p>
                      <div className="space-y-2">
                        {keyPoints.map((point, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            className="flex items-start gap-2"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-700">{point}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Learning Tips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200"
      >
        <p className="text-xs text-purple-900 font-semibold mb-2 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          AI Tutor Tips:
        </p>
        <ul className="space-y-1 text-xs text-purple-800">
          <li className="flex items-start gap-2">
            <span>💡</span>
            <span>Try solving on your own first before using hints</span>
          </li>
          <li className="flex items-start gap-2">
            <span>📚</span>
            <span>Review step-by-step solutions to understand the method</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🎯</span>
            <span>Practice similar questions to reinforce learning</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { suggestChoreAssignments } from '@/functions/suggestChoreAssignments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Users,
  CheckCircle,
  Loader2,
  TrendingUp,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIChoreAssistant({ chores = [], familyMembers = [], onApplySuggestions }) {
  const [suggestions, setSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());

  const analyzeChores = async () => {
    setIsAnalyzing(true);

    try {
      const response = await suggestChoreAssignments({});
      
      if (response.data?.success) {
        setSuggestions(response.data.data);
        toast.success('✨ AI suggestions generated!');
      } else {
        throw new Error(response.data?.error || 'Failed to generate suggestions');
      }
    } catch (error) {
      console.error('Error analyzing chores:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = async (suggestion) => {
    try {
      await base44.entities.Chore.update(suggestion.chore_id, {
        current_assignee_id: suggestion.suggested_member_id
      });

      setAppliedSuggestions(prev => new Set([...prev, suggestion.chore_id]));
      toast.success(`✅ Assigned ${suggestion.chore_name} to ${suggestion.suggested_member_name}!`);
      
      if (onApplySuggestions) {
        onApplySuggestions();
      }
    } catch (error) {
      console.error('Error applying suggestion:', error);
      toast.error('Failed to apply suggestion');
    }
  };

  const applyAllSuggestions = async () => {
    if (!suggestions?.suggestions) return;

    for (const suggestion of suggestions.suggestions) {
      if (!appliedSuggestions.has(suggestion.chore_id)) {
        await applySuggestion(suggestion);
      }
    }

    toast.success('🎉 All suggestions applied!');
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  if (chores.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 mb-2">No Chores Yet</h3>
          <p className="text-sm text-gray-600">
            Add some chores to get AI-powered assignment suggestions!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            AI Chore Assistant
          </CardTitle>
          <Button
            onClick={analyzeChores}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Suggestions
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!suggestions ? (
          <div className="text-center py-8">
            <Brain className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <p className="text-gray-600">
              Click "Get Suggestions" to let AI optimize chore assignments
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white p-5 rounded-xl border-2 border-blue-300">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Overall Distribution</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                {suggestions.overall_insights}
              </p>
              <Badge className="bg-blue-100 text-blue-800 text-sm px-4 py-2">
                Fairness Score: {((suggestions.fairness_score || 0.85) * 100).toFixed(0)}%
              </Badge>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Smart Assignment Suggestions
                </h3>
                {suggestions.suggestions?.some(s => !appliedSuggestions.has(s.chore_id)) && (
                  <Button
                    onClick={applyAllSuggestions}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Apply All
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {suggestions.suggestions?.map((suggestion, idx) => {
                    const isApplied = appliedSuggestions.has(suggestion.chore_id);

                    return (
                      <motion.div
                        key={suggestion.chore_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className={`${isApplied ? 'bg-green-50 border-green-300' : 'bg-white'} border-2`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-bold text-gray-900">{suggestion.chore_name}</h4>
                                  <ArrowRight className="w-4 h-4 text-gray-400" />
                                  <Badge className="bg-blue-500 text-white">
                                    {suggestion.suggested_member_name}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{suggestion.reason}</p>
                                <Badge className={`${getConfidenceColor(suggestion.confidence_score)} text-xs`}>
                                  {(suggestion.confidence_score * 100).toFixed(0)}% confidence
                                </Badge>
                              </div>
                              
                              {!isApplied ? (
                                <Button
                                  onClick={() => applySuggestion(suggestion)}
                                  size="sm"
                                  className="bg-blue-500 hover:bg-blue-600 ml-3"
                                >
                                  Apply
                                </Button>
                              ) : (
                                <Badge className="bg-green-500 text-white ml-3">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Applied
                                </Badge>
                              )}
                            </div>

                            {suggestion.alternative_members?.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs font-semibold text-gray-600 mb-2">
                                  Other suitable members:
                                </p>
                                <div className="space-y-1">
                                  {suggestion.alternative_members.map((alt, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                      <Users className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                      <span>
                                        <strong>{alt.member_name}</strong> - {alt.reason}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  <strong>AI Suggestions:</strong> These are recommendations based on family patterns. 
                  Feel free to adjust based on your family's needs.
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
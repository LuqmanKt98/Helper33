import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Target, Sparkles, TrendingUp, CheckCircle, RefreshCw, Copy, Check, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function ServiceOptimizer({ profile, onApplySuggestions }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [copied, setCopied] = useState(false);

  const analyzeProfile = async () => {
    setAnalyzing(true);
    try {
      const { output } = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert in healthcare marketing and client matching. Analyze this practitioner profile and provide optimization suggestions.

Current Profile:
- Title: ${profile.title}
- Bio: ${profile.bio}
- Specializations: ${profile.specializations?.join(', ') || 'None'}
- Treatment Approaches: ${profile.treatment_approaches?.join(', ') || 'None'}
- Age Groups: ${profile.age_groups_served?.join(', ') || 'None'}
- Session Rate: $${profile.session_rate}
- Languages: ${profile.languages_spoken?.join(', ') || 'English'}

Provide:
1. optimized_bio: A more engaging, client-focused bio (2-3 paragraphs)
2. keyword_suggestions: 5-7 relevant specialization keywords for better matching
3. unique_value_proposition: A compelling statement about what makes them unique
4. target_client_profile: Description of ideal clients they should target
5. improvements: 3-5 specific improvements with rationale

Format as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            optimized_bio: { type: "string" },
            keyword_suggestions: { type: "array", items: { type: "string" } },
            unique_value_proposition: { type: "string" },
            target_client_profile: { type: "string" },
            improvements: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  suggestion: { type: "string" },
                  rationale: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestions(output);
    } catch (error) {
      toast.error('Failed to analyze profile');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyBio = () => {
    navigator.clipboard.writeText(suggestions.optimized_bio);
    setCopied(true);
    toast.success('Bio copied! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const applyOptimization = () => {
    if (onApplySuggestions && suggestions) {
      onApplySuggestions({
        bio: suggestions.optimized_bio,
        specializations: [...new Set([...(profile.specializations || []), ...suggestions.keyword_suggestions])]
      });
      toast.success('Suggestions applied to your profile! Review and save when ready.');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 border-2 border-purple-300 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          AI Profile Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">✨ Boost Your Visibility</p>
              <p>Get AI-powered suggestions to improve your profile for better client matching and discovery.</p>
            </div>
          </div>
        </div>

        {!suggestions ? (
          <div className="text-center py-8">
            <Target className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Optimize your profile to attract the right clients</p>
            <Button
              onClick={analyzeProfile}
              disabled={analyzing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze & Optimize
                </>
              )}
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Optimized Bio */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">📝 Optimized Bio</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyBio}
                  className="border-2 border-purple-300"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={suggestions.optimized_bio}
                onChange={(e) => setSuggestions({ ...suggestions, optimized_bio: e.target.value })}
                rows={6}
                className="border-2 border-purple-300 bg-white"
              />
            </div>

            {/* Unique Value Proposition */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                Your Unique Value
              </h3>
              <p className="text-sm text-gray-700 italic">"{suggestions.unique_value_proposition}"</p>
            </div>

            {/* Keyword Suggestions */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">🔑 Recommended Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.keyword_suggestions.map((keyword, idx) => (
                  <Badge key={idx} className="bg-purple-100 text-purple-700">
                    {keyword}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Adding these keywords helps clients find you based on their needs
              </p>
            </div>

            {/* Target Client Profile */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-300 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">🎯 Your Ideal Clients</h3>
              <p className="text-sm text-gray-700">{suggestions.target_client_profile}</p>
            </div>

            {/* Improvements */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">💡 Suggested Improvements</h3>
              <div className="space-y-3">
                {suggestions.improvements.map((improvement, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-white border-2 border-purple-200 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{improvement.suggestion}</p>
                        <p className="text-xs text-gray-600 mt-1">{improvement.rationale}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-purple-200">
              <Button
                onClick={applyOptimization}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Apply to Profile
              </Button>
              <Button
                onClick={analyzeProfile}
                variant="outline"
                className="border-2 border-purple-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-analyze
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
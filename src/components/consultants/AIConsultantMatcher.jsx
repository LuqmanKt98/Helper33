import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  CheckCircle,
  Star,
  DollarSign,
  Calendar,
  TrendingUp,
  User,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function AIConsultantMatcher({ consultants, onSelectConsultant }) {
  const [userNeeds, setUserNeeds] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [showMatcher, setShowMatcher] = useState(false);

  const analyzeAndMatch = async () => {
    if (!userNeeds.trim()) {
      toast.error('Please describe what you need help with');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const consultantsData = consultants.map(c => ({
        id: c.id,
        name: c.full_name,
        title: c.title,
        expertise: c.expertise,
        specializations: c.specializations?.map(s => s.area) || [],
        bio: c.bio,
        rate: c.consultation_rate,
        experience: c.years_of_experience,
        rating: c.average_rating
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert consultant matchmaker. A user needs help and you must analyze their needs and recommend the most suitable consultants from the available list.

User's needs: "${userNeeds}"

Available consultants:
${JSON.stringify(consultantsData, null, 2)}

Analyze the user's needs and provide recommendations. For each recommended consultant, explain:
1. Why they're a good match (be specific about their expertise)
2. What makes them uniquely qualified for this user's needs
3. A compatibility score (1-100)
4. Specific areas where they can help

Recommend the top 3 most suitable consultants, ordered by best match first.`,
        response_json_schema: {
          type: "object",
          properties: {
            user_needs_summary: { type: "string" },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  consultant_id: { type: "string" },
                  consultant_name: { type: "string" },
                  match_reason: { type: "string" },
                  unique_qualifications: { type: "string" },
                  compatibility_score: { type: "number" },
                  key_areas: { type: "array", items: { type: "string" } },
                  estimated_value: { type: "string" }
                }
              }
            },
            overall_advice: { type: "string" }
          }
        }
      });

      setRecommendations(result);
      toast.success('✨ AI analysis complete!');
    } catch (error) {
      console.error('AI matching error:', error);
      toast.error('Failed to analyze. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConsultantById = (id) => {
    return consultants.find(c => c.id === id);
  };

  return (
    <div className="mb-8">
      <AnimatePresence mode="wait">
        {!showMatcher ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-4 border-purple-400 shadow-2xl bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -z-0" />
              <CardContent className="p-8 relative">
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      🤖 AI-Powered Consultant Matching
                    </h3>
                    <p className="text-gray-600">
                      Let AI analyze your needs and find your perfect consultant match
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowMatcher(true)}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl py-6"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get AI Recommendations
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-4 border-purple-400 shadow-2xl bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Sparkles className="w-6 h-6" />
                  AI Consultant Matcher
                </CardTitle>
                <CardDescription className="text-white/90">
                  Describe your needs and get personalized consultant recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {!recommendations ? (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        What do you need help with? 🎯
                      </label>
                      <Textarea
                        value={userNeeds}
                        onChange={(e) => setUserNeeds(e.target.value)}
                        placeholder="Example: I'm looking for help with AI strategy for my mental health startup. I need someone who understands both technology and wellness..."
                        className="h-32 border-2 border-purple-300 focus:border-purple-500 text-base"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Be specific about your goals, industry, and what expertise you're looking for
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={analyzeAndMatch}
                        disabled={isAnalyzing || !userNeeds.trim()}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg py-6 text-lg"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            AI Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Find My Perfect Match
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowMatcher(false)}
                        variant="outline"
                        className="border-2 border-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Analysis Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-300">
                      <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        AI Analysis Summary
                      </h4>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {recommendations.user_needs_summary}
                      </p>
                      <p className="text-sm text-purple-700 font-semibold">
                        {recommendations.overall_advice}
                      </p>
                    </div>

                    {/* Top Recommendations */}
                    <div>
                      <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                        🏆 Your Top {recommendations.recommendations.length} Matches
                      </h4>
                      <div className="space-y-4">
                        {recommendations.recommendations.map((rec, idx) => {
                          const consultant = getConsultantById(rec.consultant_id);
                          if (!consultant) return null;

                          return (
                            <motion.div
                              key={rec.consultant_id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              <Card className={`border-4 ${
                                idx === 0 
                                  ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-2xl' 
                                  : 'border-purple-300 bg-white'
                              } hover:shadow-xl transition-all`}>
                                <CardHeader>
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                      <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className="relative"
                                      >
                                        {consultant.profile_picture_url ? (
                                          <img
                                            src={consultant.profile_picture_url}
                                            alt={consultant.full_name}
                                            className="w-20 h-20 rounded-full border-4 border-purple-300 shadow-lg object-cover"
                                          />
                                        ) : (
                                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-4 border-purple-300 shadow-lg">
                                            <User className="w-10 h-10 text-white" />
                                          </div>
                                        )}
                                        {idx === 0 && (
                                          <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
                                          >
                                            <span className="text-sm font-bold">#{idx + 1}</span>
                                          </motion.div>
                                        )}
                                      </motion.div>

                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h3 className="text-xl font-bold text-gray-900">
                                            {rec.consultant_name}
                                          </h3>
                                          {idx === 0 && (
                                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                              <Star className="w-3 h-3 mr-1 fill-current" />
                                              Best Match
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{consultant.title}</p>
                                        
                                        {/* Compatibility Score */}
                                        <div className="flex items-center gap-2 mb-3">
                                          <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ width: `${rec.compatibility_score}%` }}
                                              transition={{ duration: 1, delay: idx * 0.2 }}
                                              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                                            />
                                          </div>
                                          <span className="text-sm font-bold text-purple-600">
                                            {rec.compatibility_score}% Match
                                          </span>
                                        </div>

                                        {consultant.consultation_rate && (
                                          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-1 rounded-lg w-fit">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="font-semibold">${consultant.consultation_rate}/hr</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                  {/* Why They're a Good Match */}
                                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                                    <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4" />
                                      Why This Match Works
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {rec.match_reason}
                                    </p>
                                  </div>

                                  {/* Unique Qualifications */}
                                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200">
                                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                      <Star className="w-4 h-4" />
                                      Unique Strengths
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {rec.unique_qualifications}
                                    </p>
                                  </div>

                                  {/* Key Areas */}
                                  {rec.key_areas && rec.key_areas.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                                        🎯 They Can Help You With:
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {rec.key_areas.map((area, aIdx) => (
                                          <Badge key={aIdx} className="bg-purple-100 text-purple-800 border border-purple-300">
                                            {area}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Value Proposition */}
                                  {rec.estimated_value && (
                                    <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
                                      <p className="text-sm text-green-900 font-semibold">
                                        💎 {rec.estimated_value}
                                      </p>
                                    </div>
                                  )}

                                  {/* Action Button */}
                                  <Link to={createPageUrl(`ConsultantProfile?consultantId=${consultant.id}`)}>
                                    <motion.div
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl py-6 text-base">
                                        <Calendar className="w-5 h-5 mr-2" />
                                        Book Consultation with {rec.consultant_name}
                                        <ChevronRight className="w-5 h-5 ml-2" />
                                      </Button>
                                    </motion.div>
                                  </Link>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Try Again Button */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setRecommendations(null);
                          setUserNeeds('');
                        }}
                        variant="outline"
                        className="flex-1 border-2 border-purple-300"
                      >
                        Try Different Needs
                      </Button>
                      <Button
                        onClick={() => setShowMatcher(false)}
                        variant="outline"
                        className="border-2 border-gray-300"
                      >
                        Browse All
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
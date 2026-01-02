import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Users, MapPin, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AIActivitySuggestions({ familyMembers }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const childMembers = familyMembers?.filter(m => 
    m.role === 'ChildMember' || m.role === 'TeenMember' || (m.age && m.age < 18)
  ) || [];

  const generateSuggestions = async () => {
    if (childMembers.length === 0) {
      toast.error('Add children to your family to get activity suggestions!');
      return;
    }

    setIsGenerating(true);
    try {
      const kidsInfo = childMembers.map(child => ({
        name: child.name,
        age: child.age,
        interests: child.interests || []
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 4 fun, age-appropriate family activity suggestions based on these children: ${JSON.stringify(kidsInfo)}. 
        
        For each activity, provide:
        - activity_name: creative name
        - description: brief description (1 sentence)
        - age_range: appropriate ages
        - duration: estimated time
        - location_type: "indoor", "outdoor", or "either"
        - materials_needed: list of items needed
        - educational_value: what kids learn
        - fun_factor: 1-10
        
        Make them diverse (mix of indoor/outdoor, active/creative, short/long).`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  activity_name: { type: "string" },
                  description: { type: "string" },
                  age_range: { type: "string" },
                  duration: { type: "string" },
                  location_type: { type: "string" },
                  materials_needed: { type: "array", items: { type: "string" } },
                  educational_value: { type: "string" },
                  fun_factor: { type: "number" }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.suggestions || []);
      toast.success('Activities generated!');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const getLocationIcon = (locationType) => {
    if (locationType === 'outdoor') return '🌳';
    if (locationType === 'indoor') return '🏠';
    return '🌟';
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Activity Suggestions
          </CardTitle>
          <Button
            onClick={generateSuggestions}
            disabled={isGenerating || childMembers.length === 0}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Ideas
              </>
            )}
          </Button>
        </div>
        {childMembers.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            Personalized for {childMembers.map(c => c.name).join(', ')}
          </p>
        )}
      </CardHeader>

      <CardContent>
        {childMembers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Add children to your family to get activity suggestions!</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">Click "Generate Ideas" to get personalized activity suggestions!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence>
              {suggestions.map((activity, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-white hover:shadow-lg transition-all h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getLocationIcon(activity.location_type)}</span>
                          <h4 className="font-bold text-gray-800 text-lg">{activity.activity_name}</h4>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          ⭐ {activity.fun_factor}/10
                        </Badge>
                      </div>

                      <p className="text-gray-700 text-sm mb-3">{activity.description}</p>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4 text-purple-500" />
                          <span>Ages: {activity.age_range}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>{activity.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span className="capitalize">{activity.location_type}</span>
                        </div>
                      </div>

                      {activity.materials_needed && activity.materials_needed.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Materials:</p>
                          <div className="flex flex-wrap gap-1">
                            {activity.materials_needed.map((material, mIdx) => (
                              <Badge key={mIdx} variant="outline" className="text-xs">
                                {material}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {activity.educational_value && (
                        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                          <p className="text-xs text-blue-800">
                            <span className="font-semibold">Learning:</span> {activity.educational_value}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
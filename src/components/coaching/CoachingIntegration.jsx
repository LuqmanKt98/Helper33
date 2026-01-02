import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Heart, Sparkles, Zap } from 'lucide-react';

/**
 * Simple integration component to ensure all coaching components are properly exported
 */
export default function CoachingIntegration({ goal, showAll = false }) {
  if (!goal) return null;

  const features = [
    {
      icon: Brain,
      title: 'AI Insights',
      description: 'Personalized progress analysis',
      available: true
    },
    {
      icon: Heart,
      title: 'Affirmations',
      description: 'Daily personalized affirmations',
      available: true
    },
    {
      icon: Sparkles,
      title: 'Guided Meditations',
      description: 'Adaptive to your mood',
      available: true
    },
    {
      icon: Zap,
      title: 'Breakthrough Sessions',
      description: 'Deep transformative prompts',
      available: goal.reflection_notes?.length >= 5
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          AI Coaching Features
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 transition-all ${
                  feature.available
                    ? 'bg-white border-purple-200 hover:border-purple-400'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      feature.available ? 'text-purple-600' : 'text-gray-400'
                    }`}
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      {feature.title}
                      {feature.available && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          Ready
                        </Badge>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {!features[3].available && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              💡 Complete {5 - (goal.reflection_notes?.length || 0)} more check-ins to unlock
              Breakthrough Sessions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
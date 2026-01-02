import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Sparkles,
  Loader2,
  Copy,
  CheckCircle,
  Clock,
  ThumbsUp,
  AlertCircle,
  Package,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const COMMON_SCENARIOS = [
  {
    id: 'product_inquiry',
    name: 'Product Inquiry',
    icon: Package,
    template: 'Customer is asking about product details, features, or specifications'
  },
  {
    id: 'shipping_question',
    name: 'Shipping Question',
    icon: Clock,
    template: 'Customer wants to know about shipping times or delivery'
  },
  {
    id: 'refund_request',
    name: 'Refund Request',
    icon: AlertCircle,
    template: 'Customer is requesting a refund or has an issue with their order'
  },
  {
    id: 'course_access',
    name: 'Course Access Help',
    icon: ThumbsUp,
    template: 'Student needs help accessing course materials or has technical issues'
  },
  {
    id: 'customization',
    name: 'Custom Request',
    icon: Sparkles,
    template: 'Customer is asking about customization or special requests'
  },
  {
    id: 'general_thanks',
    name: 'Thank You Reply',
    icon: MessageCircle,
    template: 'Customer sent a positive message or review'
  }
];

export default function AICustomerResponseGenerator({ sellerProfile, productContext }) {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [customerMessage, setCustomerMessage] = useState('');
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [generating, setGenerating] = useState(false);
  const [responseVariations, setResponseVariations] = useState([]);
  const [tone, setTone] = useState('professional_friendly');

  const generateResponse = async (variation = false) => {
    if (!customerMessage.trim() && !selectedScenario) {
      toast.error('Please select a scenario or enter a customer message');
      return;
    }

    setGenerating(true);

    try {
      const scenarioInfo = selectedScenario 
        ? COMMON_SCENARIOS.find(s => s.id === selectedScenario)
        : null;

      const toneDescriptions = {
        professional_friendly: 'Professional yet warm and friendly',
        casual_warm: 'Casual, warm, and conversational',
        empathetic_supportive: 'Highly empathetic and supportive',
        concise_direct: 'Concise and direct but polite'
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI assistant helping a marketplace seller craft the perfect customer response.

Seller Information:
- Shop Name: ${sellerProfile?.shop_name || 'Your Shop'}
- Seller Type: ${sellerProfile?.seller_type || 'Digital Product Seller'}
- Shop Bio: ${sellerProfile?.shop_bio || 'Wellness product creator'}

${productContext ? `Product Context:
- Product: ${productContext.product_name}
- Category: ${productContext.category}
- Price: $${productContext.price}
` : ''}

Customer Message:
"${customerMessage || scenarioInfo?.template}"

${scenarioInfo ? `Scenario Type: ${scenarioInfo.name}` : ''}

Desired Tone: ${toneDescriptions[tone]}

Generate ${variation ? '3 alternative' : 'a professional'} customer service response${variation ? 's' : ''} that:

1. Addresses the customer's concern directly and specifically
2. Uses the specified tone (${toneDescriptions[tone]})
3. Is helpful, clear, and actionable
4. Includes next steps if applicable
5. Reflects the shop's personality and values
6. Is personalized (avoid generic templates)
7. Shows appreciation for the customer
8. ${scenarioInfo?.id === 'refund_request' ? 'Handles the situation with empathy and provides clear refund policy' : ''}
9. ${scenarioInfo?.id === 'product_inquiry' ? 'Provides detailed product information and highlights benefits' : ''}
10. Is 2-4 sentences (concise but complete)

${variation ? `
Return 3 different variations with different approaches:
{
  "variations": [
    {
      "response": "first variation",
      "approach": "description of this approach",
      "best_for": "when to use this variation"
    },
    {
      "response": "second variation", 
      "approach": "description",
      "best_for": "when to use"
    },
    {
      "response": "third variation",
      "approach": "description", 
      "best_for": "when to use"
    }
  ]
}
` : `
Just return the response text directly, nothing else.
`}`,
        response_json_schema: variation ? {
          type: "object",
          properties: {
            variations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  response: { type: "string" },
                  approach: { type: "string" },
                  best_for: { type: "string" }
                }
              }
            }
          }
        } : undefined
      });

      if (variation) {
        setResponseVariations(response.variations || []);
      } else {
        setGeneratedResponse(response);
      }

      toast.success(variation ? '✨ Generated 3 variations!' : '✨ Response generated!');
    } catch (error) {
      console.error('Error generating response:', error);
      toast.error('Failed to generate response');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Response copied to clipboard! 📋');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            AI Customer Response Generator
          </CardTitle>
          <CardDescription>
            Generate professional, personalized responses to customer messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scenario Selection */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Quick Scenarios</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {COMMON_SCENARIOS.map((scenario) => {
                const Icon = scenario.icon;
                const isSelected = selectedScenario === scenario.id;
                
                return (
                  <button
                    key={scenario.id}
                    onClick={() => {
                      setSelectedScenario(scenario.id);
                      setCustomerMessage(scenario.template);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                        {scenario.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Message Input */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Customer Message</Label>
            <Textarea
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
              placeholder="Paste the customer's message here or select a scenario above..."
              rows={4}
              className="border-2 border-gray-200 focus:border-blue-500"
            />
          </div>

          {/* Tone Selection */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Response Tone</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'professional_friendly', label: 'Professional & Friendly', emoji: '🤝' },
                { value: 'casual_warm', label: 'Casual & Warm', emoji: '☀️' },
                { value: 'empathetic_supportive', label: 'Empathetic', emoji: '❤️' },
                { value: 'concise_direct', label: 'Concise & Direct', emoji: '⚡' }
              ].map((toneOption) => (
                <button
                  key={toneOption.value}
                  onClick={() => setTone(toneOption.value)}
                  className={`p-2 rounded-lg border-2 text-xs transition-all ${
                    tone === toneOption.value
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="text-lg mb-1">{toneOption.emoji}</div>
                  <div className="font-semibold">{toneOption.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => generateResponse(false)}
              disabled={generating}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Response
            </Button>
            <Button
              onClick={() => generateResponse(true)}
              disabled={generating}
              variant="outline"
              className="flex-1 border-2 border-blue-300"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Get 3 Variations
            </Button>
          </div>

          {/* Generated Response (Single) */}
          <AnimatePresence>
            {generatedResponse && !responseVariations.length && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-white border-2 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Generated Response
                      </h4>
                      <Button
                        onClick={() => copyToClipboard(generatedResponse)}
                        size="sm"
                        variant="outline"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {generatedResponse}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Response Variations */}
          <AnimatePresence>
            {responseVariations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  3 Response Variations
                </h4>
                {responseVariations.map((variation, idx) => (
                  <Card key={idx} className="bg-white border-2 border-purple-200 hover:border-purple-400 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Badge className="bg-purple-100 text-purple-800 mb-2">
                            Variation {idx + 1}: {variation.approach}
                          </Badge>
                          <p className="text-xs text-purple-700 mb-3">
                            <strong>Best for:</strong> {variation.best_for}
                          </p>
                        </div>
                        <Button
                          onClick={() => copyToClipboard(variation.response)}
                          size="sm"
                          variant="outline"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                          {variation.response}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h5 className="font-semibold text-blue-900 text-sm mb-2">💡 Pro Tips</h5>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Personalize the AI response with customer's name before sending</li>
                <li>• Always review and adjust to match your authentic voice</li>
                <li>• Use variations to A/B test different response styles</li>
                <li>• Save effective responses as templates for future use</li>
                <li>• Respond within 24 hours for best customer satisfaction</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
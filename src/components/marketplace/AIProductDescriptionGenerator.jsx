import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Package, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AIProductDescriptionGenerator({ 
  onUseDescription, 
  productName: initialProductName = '',
  currentDescription: initialDescription = ''
}) {
  const [productName, setProductName] = useState(initialProductName);
  const [productType, setProductType] = useState('digital_download');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState(null);

  // Update productName when prop changes
  useEffect(() => {
    if (initialProductName) {
      setProductName(initialProductName);
    }
  }, [initialProductName]);

  const PRODUCT_TYPES = [
    { value: 'course', label: 'Online Course' },
    { value: 'digital_download', label: 'Digital Download' },
    { value: 'physical', label: 'Physical Product' },
    { value: 'service', label: 'Service/Coaching' }
  ];

  const TONES = [
    { value: 'professional', label: 'Professional & Trustworthy' },
    { value: 'warm', label: 'Warm & Friendly' },
    { value: 'inspiring', label: 'Inspiring & Motivational' },
    { value: 'casual', label: 'Casual & Approachable' },
    { value: 'therapeutic', label: 'Therapeutic & Healing' }
  ];

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    setIsGenerating(true);
    
    const prompt = `Create a compelling product description for a wellness marketplace.

Product Name: ${productName}
Product Type: ${PRODUCT_TYPES.find(t => t.value === productType)?.label}
${keyFeatures ? `Key Features: ${keyFeatures}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
Tone: ${TONES.find(t => t.value === tone)?.label}

Generate a complete product description that includes:

1. **Attention-Grabbing Headline** (compelling tagline that captures the essence)
2. **Opening Hook** (2-3 sentences that immediately engage the reader)
3. **What It Is** (clear explanation of the product/course)
4. **Key Benefits** (3-5 transformation-focused benefits, not just features)
5. **Who It's For** (specific description of ideal customer/student)
6. **What's Included** (detailed breakdown of contents/modules)
7. **Unique Value Proposition** (what makes this special/different)
8. **Results They Can Expect** (concrete outcomes)
9. **Call to Action** (compelling reason to buy now)

Make the description:
- Benefit-focused, not feature-focused
- Emotionally resonant and relatable
- Clear and specific about transformation
- Appropriate for a wellness/personal growth audience
- Optimized for conversion
- ${tone} in tone
- Authentically addressing real needs and pain points

Format the description in a way that's ready to copy into a product listing.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true
    });

    setGeneratedDescription(response);
    toast.success('Product description generated! 📦');
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (generatedDescription) {
      navigator.clipboard.writeText(generatedDescription);
      toast.success('Description copied to clipboard!');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            AI Product Description Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product/Course Name *</label>
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., Mindful Mornings: 30-Day Challenge"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Product Type</label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              {PRODUCT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Key Features/Benefits (Optional)</label>
            <Textarea
              value={keyFeatures}
              onChange={(e) => setKeyFeatures(e.target.value)}
              placeholder="List main features, what's included, key benefits... (e.g., '21 video lessons, downloadable workbook, lifetime access')"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Audience (Optional)</label>
            <Input
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Busy parents, professionals dealing with stress, grief survivors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tone & Style</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              {TONES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !productName.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Description...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Product Description
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedDescription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Generated Description
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  {onUseDescription && (
                    <Button
                      onClick={() => {
                        onUseDescription(generatedDescription);
                        toast.success('Description applied!');
                      }}
                      size="sm"
                      className="bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Use This
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                  {generatedDescription}
                </pre>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">
                  ~{generatedDescription.split(' ').filter(w => w).length} words
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  {tone}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
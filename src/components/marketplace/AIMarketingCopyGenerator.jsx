import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Megaphone, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AIMarketingCopyGenerator({ 
  onUseCopy,
  productName: initialProductName = '',
  productDescription: initialProductDescription = ''
}) {
  const [productName, setProductName] = useState(initialProductName);
  const [productBenefits, setProductBenefits] = useState('');
  const [campaignType, setCampaignType] = useState('launch');
  const [platforms, setPlatforms] = useState(['email', 'social']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState(null);

  // Update when props change
  useEffect(() => {
    if (initialProductName) {
      setProductName(initialProductName);
    }
  }, [initialProductName]);

  useEffect(() => {
    if (initialProductDescription) {
      setProductBenefits(initialProductDescription);
    }
  }, [initialProductDescription]);

  const CAMPAIGN_TYPES = [
    { value: 'launch', label: 'Product Launch', emoji: '🚀' },
    { value: 'sale', label: 'Limited Time Sale', emoji: '🎉' },
    { value: 'seasonal', label: 'Seasonal Promotion', emoji: '🌸' },
    { value: 'testimonial', label: 'Testimonial Campaign', emoji: '⭐' },
    { value: 'awareness', label: 'Brand Awareness', emoji: '💡' },
    { value: 'engagement', label: 'Engagement Campaign', emoji: '💬' }
  ];

  const PLATFORMS = [
    { value: 'email', label: 'Email Newsletter', emoji: '📧' },
    { value: 'social', label: 'Social Media Posts', emoji: '📱' },
    { value: 'website', label: 'Website Banner', emoji: '🌐' },
    { value: 'ad', label: 'Paid Ads', emoji: '🎯' }
  ];

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    if (platforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    setIsGenerating(true);
    
    const campaignInfo = CAMPAIGN_TYPES.find(t => t.value === campaignType);
    const selectedPlatforms = platforms.map(p => 
      PLATFORMS.find(pl => pl.value === p)?.label
    ).join(', ');

    const prompt = `Create compelling marketing copy for a wellness marketplace campaign.

Product: ${productName}
${productBenefits ? `Benefits: ${productBenefits}` : ''}
Campaign Type: ${campaignInfo?.label}
Platforms: ${selectedPlatforms}

Generate marketing copy tailored for each platform:

${platforms.includes('email') ? `
**EMAIL NEWSLETTER:**
- Attention-grabbing subject line (5 options)
- Preview text that compels opening
- Email body (300-400 words):
  * Personal, conversational opening
  * Problem/solution framework
  * Social proof or urgency element
  * Clear, compelling CTA
- PS: Additional hook or bonus mention
` : ''}

${platforms.includes('social') ? `
**SOCIAL MEDIA POSTS:**

Instagram/Facebook:
- Main post (150-200 characters, with emojis)
- 5-7 relevant hashtags
- Story swipe-up text (1 sentence)

Twitter/X:
- 3 tweet variations (280 characters each)
- Thread starter + 2-3 follow-up tweets

LinkedIn:
- Professional post (200-300 words)
- Value-focused, industry insights

TikTok Caption:
- Hook-first caption (50-75 words)
- Trending hashtags
` : ''}

${platforms.includes('website') ? `
**WEBSITE BANNER:**
- Headline (5-8 words, punchy)
- Subheadline (15-20 words, benefit-focused)
- CTA button text (2-4 words)
- Banner description (30-50 words)
` : ''}

${platforms.includes('ad') ? `
**PAID AD COPY:**
- Google Ads headline variations (3 options, 30 chars each)
- Description lines (2 options, 90 chars each)
- Facebook/Instagram ad primary text (125 characters)
- Ad headline (40 characters)
- Pain point + solution format
` : ''}

Make all copy:
- Benefit-driven and transformation-focused
- Emotionally resonant for wellness audience
- Action-oriented with clear CTAs
- Optimized for each platform's best practices
- Aligned with ${campaignInfo?.label} objectives
- Authentic and trustworthy in tone`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false
    });

    setGeneratedCopy(response);
    toast.success('Marketing copy generated! 🎯');
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (generatedCopy) {
      navigator.clipboard.writeText(generatedCopy);
      toast.success('Marketing copy copied to clipboard!');
    }
  };

  const togglePlatform = (platform) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-purple-600" />
            AI Marketing Copy Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product/Course Name *</label>
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., Healing Hearts: Grief Recovery Course"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Key Benefits (Optional)</label>
            <Textarea
              value={productBenefits}
              onChange={(e) => setProductBenefits(e.target.value)}
              placeholder="What transformation or results does this offer? (e.g., 'Find peace after loss, rebuild confidence, create new routines')"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Campaign Type</label>
            <select
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              {CAMPAIGN_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.emoji} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Marketing Platforms *</label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.value}
                  onClick={() => togglePlatform(platform.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    platforms.includes(platform.value)
                      ? 'border-purple-500 bg-purple-100'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{platform.emoji}</span>
                    <span className="text-sm font-semibold">{platform.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !productName.trim() || platforms.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Marketing Copy...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Campaign Copy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedCopy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Marketing Campaign Copy
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                  {onUseCopy && (
                    <Button
                      onClick={() => {
                        onUseCopy(generatedCopy);
                        toast.success('Marketing copy saved!');
                      }}
                      size="sm"
                      className="bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Campaign
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                  {generatedCopy}
                </pre>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="bg-purple-100 text-purple-800">
                  {CAMPAIGN_TYPES.find(t => t.value === campaignType)?.emoji} {CAMPAIGN_TYPES.find(t => t.value === campaignType)?.label}
                </Badge>
                {platforms.map(p => {
                  const platformInfo = PLATFORMS.find(pl => pl.value === p);
                  return (
                    <Badge key={p} className="bg-blue-100 text-blue-800">
                      {platformInfo?.emoji} {platformInfo?.label}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Share2, 
  Instagram, 
  Facebook, 
  Twitter, 
  Download,
  Loader2,
  Sparkles,
  Copy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function SocialShareModal({ 
  isOpen, 
  onClose, 
  shareType = 'achievement',
  shareData = {}
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState(null);
  const [customMessage, setCustomMessage] = useState('');

  React.useEffect(() => {
    if (isOpen && !shareImageUrl) {
      generateShareImage();
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen) {
      setCustomMessage(getDefaultMessage());
    }
  }, [isOpen, shareType, shareData]);

  const generateShareImage = async () => {
    setIsGenerating(true);
    try {
      const imagePrompt = generateImagePrompt();
      
      const result = await base44.integrations.Core.GenerateImage({
        prompt: imagePrompt
      });

      setShareImageUrl(result.url);
    } catch (error) {
      console.error('Error generating share image:', error);
      toast.error('Could not generate share image');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImagePrompt = () => {
    if (shareType === 'achievement') {
      return `Create a beautiful achievement celebration card with:
- Large ${shareData.icon} emoji at the top
- Bold text: "${shareData.title}"
- Subtitle: "+${shareData.points} Points Earned"
- Gradient background from purple to pink
- Sparkles and celebration elements
- "DobryLife Wellness Journey" branding at bottom
- Modern, clean, Instagram-friendly design
- Aspect ratio 1:1 (square)
- Professional and inspiring aesthetic`;
    }

    if (shareType === 'milestone') {
      return `Create a milestone celebration card with:
- Large flame emoji 🔥 and number "${shareData.days}"
- Bold text: "${shareData.title}"
- Subtitle: "Day Streak on DobryLife"
- Gradient background from orange to red
- Achievement badge elements
- "Building Healthy Habits Daily" tagline
- Modern, motivational design
- Aspect ratio 1:1 (square)
- Inspiring and energetic aesthetic`;
    }

    if (shareType === 'mindfulness') {
      return `Create a mindfulness achievement card with:
- Peaceful meditation emoji 🧘‍♀️
- Bold text: "${shareData.title}"
- Subtitle: "Completed ${shareData.duration || 5} min session"
- Calming gradient background from blue to purple
- Serene, peaceful design elements
- "DobryLife Mindfulness Hub" branding
- Modern, clean design
- Aspect ratio 1:1 (square)
- Calm and therapeutic aesthetic`;
    }

    if (shareType === 'level_up') {
      return `Create a level up celebration card with:
- Crown emoji 👑 and trophy
- Huge text: "LEVEL ${shareData.level}"
- Subtitle: "Wellness Warrior"
- Points display: "${shareData.totalPoints} Total Points"
- Gradient background from gold to purple
- Celebration confetti elements
- "DobryLife" branding
- Modern, exciting design
- Aspect ratio 1:1 (square)
- Epic achievement aesthetic`;
    }
  };

  const getDefaultMessage = () => {
    if (shareType === 'achievement') {
      return `🎉 Just unlocked "${shareData.title}" on my wellness journey! ${shareData.icon}\n\n+${shareData.points} points earned on @DobryLife 💜\n\n#WellnessJourney #SelfCare #MentalHealth #Achievement`;
    }

    if (shareType === 'milestone') {
      return `🔥 ${shareData.days}-day streak achieved! Consistency is key to growth.\n\nBuilding healthy habits one day at a time with @DobryLife 💪\n\n#Streak #Consistency #WellnessGoals #MentalWellness`;
    }

    if (shareType === 'mindfulness') {
      return `🧘‍♀️ Just completed "${shareData.title}" - ${shareData.duration || 5} minutes of mindfulness.\n\nTaking time for peace and presence with @DobryLife 🌸\n\n#Mindfulness #Meditation #SelfCare #InnerPeace`;
    }

    if (shareType === 'level_up') {
      return `👑 LEVEL UP! Just reached Level ${shareData.level} on my wellness journey!\n\n${shareData.totalPoints} points and counting... 🚀\n\n@DobryLife #WellnessWarrior #LevelUp #PersonalGrowth`;
    }

    return '';
  };

  const shareToInstagram = () => {
    if (shareImageUrl) {
      // Instagram doesn't support direct web sharing with pre-filled content
      // Instead, we'll copy the image URL and message
      navigator.clipboard.writeText(`${customMessage}\n\nImage: ${shareImageUrl}`);
      toast.success('📋 Content copied! Open Instagram and paste to share', { duration: 5000 });
      
      // Download image for easy upload
      downloadImage();
    }
  };

  const shareToFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareImageUrl || 'https://dobry.life')}&quote=${encodeURIComponent(customMessage)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const tweetText = customMessage.substring(0, 280); // Twitter character limit
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}${shareImageUrl ? `&url=${encodeURIComponent(shareImageUrl)}` : ''}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const copyLink = () => {
    const shareText = `${customMessage}\n\n${shareImageUrl || 'https://dobry.life'}`;
    navigator.clipboard.writeText(shareText);
    toast.success('Copied to clipboard! 📋');
  };

  const downloadImage = async () => {
    if (!shareImageUrl) return;
    
    try {
      const response = await fetch(shareImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dobrylife-${shareType}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded! 📥');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-600" />
            Share Your Achievement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Image */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <CardContent className="p-6">
              {isGenerating ? (
                <div className="aspect-square flex flex-col items-center justify-center bg-white rounded-lg">
                  <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-3" />
                  <p className="text-gray-600 text-sm">Creating your share image...</p>
                </div>
              ) : shareImageUrl ? (
                <div className="relative">
                  <img 
                    src={shareImageUrl} 
                    alt="Share preview" 
                    className="w-full rounded-lg shadow-lg"
                  />
                  <motion.div
                    className="absolute top-2 right-2"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Button
                      onClick={downloadImage}
                      size="sm"
                      className="bg-white/90 text-gray-800 hover:bg-white gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
                  <p className="text-gray-500">Preview not available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Message */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Customize Your Message
            </label>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={5}
              className="w-full"
              placeholder="Add your personal touch..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {customMessage.length} characters
            </p>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Share To:</p>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={shareToInstagram}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 gap-2"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </Button>

              <Button
                onClick={shareToFacebook}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>

              <Button
                onClick={shareToTwitter}
                className="bg-sky-500 hover:bg-sky-600 gap-2"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>

              <Button
                onClick={copyLink}
                variant="outline"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Tips */}
          <Card className="bg-blue-50 border border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Sharing Tips:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>Instagram:</strong> Download the image and upload as a post or story</li>
                    <li>• <strong>Facebook/Twitter:</strong> Opens share dialog with pre-filled content</li>
                    <li>• <strong>Copy Link:</strong> Copies text and image URL for any platform</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
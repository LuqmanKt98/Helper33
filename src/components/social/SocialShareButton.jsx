import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SocialShareButton({ 
  title, 
  description, 
  url = window.location.href,
  hashtags = ['Helper33', 'Wellness'],
  variant = 'default',
  size = 'default',
  className = ''
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareToTwitter = () => {
    const text = `${title}\n\n${description}`;
    const hashtagsStr = hashtags.join(',');
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtagsStr}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    toast.success('Opening Twitter...');
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    toast.success('Opening Facebook...');
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
    toast.success('Opening LinkedIn...');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareOptions = [
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'from-sky-400 to-blue-500',
      onClick: shareToTwitter
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'from-blue-500 to-indigo-600',
      onClick: shareToFacebook
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'from-blue-600 to-blue-700',
      onClick: shareToLinkedIn
    },
    {
      name: 'Copy Link',
      icon: copied ? Check : LinkIcon,
      color: 'from-gray-400 to-gray-500',
      onClick: copyLink
    }
  ];

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        variant={variant}
        size={size}
        className={className}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-600" />
              Share This
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <p className="font-semibold text-gray-900 mb-1">{title}</p>
              <p className="text-sm text-gray-600">{description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option, index) => (
                <motion.button
                  key={option.name}
                  onClick={option.onClick}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-lg bg-gradient-to-r ${option.color} text-white shadow-md hover:shadow-lg transition-all`}
                >
                  <option.icon className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm font-semibold">{option.name}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Copy, RefreshCw, QrCode, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FamilyInviteQR({ isOpen, onClose }) {
  const [inviteCode, setInviteCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  const generateInviteCode = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('generateFamilyInviteCode', {
        uses_remaining: 10,
        expires_in_days: 30
      });

      if (response.data?.code) {
        setInviteCode(response.data);
        toast.success('Invite code generated!');
      } else {
        throw new Error('Failed to generate code');
      }
    } catch (error) {
      console.error('Error generating invite:', error);
      toast.error('Failed to generate invite code');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isOpen && !inviteCode) {
      generateInviteCode();
    }
  }, [isOpen]);

  useEffect(() => {
    if (inviteCode && inviteCode.code) {
      const inviteUrl = `${window.location.origin}/JoinFamily?code=${inviteCode.code}`;
      // Use a free QR code API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(inviteUrl)}&color=6366f1&bgcolor=ffffff`;
      setQrCodeUrl(qrUrl);
    }
  }, [inviteCode]);

  const copyCode = () => {
    if (inviteCode?.code) {
      navigator.clipboard.writeText(inviteCode.code);
      toast.success('Code copied to clipboard!');
    }
  };

  const copyLink = () => {
    if (inviteCode?.code) {
      const inviteUrl = `${window.location.origin}/JoinFamily?code=${inviteCode.code}`;
      navigator.clipboard.writeText(inviteUrl);
      toast.success('Invite link copied!');
    }
  };

  const shareInvite = async () => {
    if (inviteCode?.code) {
      const inviteUrl = `${window.location.origin}/JoinFamily?code=${inviteCode.code}`;
      const shareText = `Join my family on DobryLife! Use code: ${inviteCode.code} or click this link: ${inviteUrl}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Join My Family on DobryLife',
            text: shareText,
            url: inviteUrl
          });
        } catch (error) {
          if (error.name !== 'AbortError') {
            copyLink();
          }
        }
      } else {
        copyLink();
      }
    }
  };

  const downloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `dobrylife-family-invite-${inviteCode?.code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Invite Family Members
          </DialogTitle>
          <DialogDescription>
            Share this code or QR code with family members to invite them to your family hub.
          </DialogDescription>
        </DialogHeader>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating invite code...</p>
          </div>
        ) : inviteCode ? (
          <div className="space-y-6">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-4">
              <div className="border-4 border-primary/20 rounded-xl p-4 bg-white">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="Family Invite QR Code" 
                    className="w-[300px] h-[300px]"
                  />
                ) : (
                  <div className="w-[300px] h-[300px] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={downloadQR}>
                Download QR Code
              </Button>
            </div>

            {/* Invite Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Invite Code</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-muted rounded-lg font-mono text-2xl font-bold text-center tracking-widest">
                  {inviteCode.code}
                </div>
                <Button variant="outline" size="icon" onClick={copyCode}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-sm text-blue-900">
                <strong>Valid for:</strong> {inviteCode.expires_in_days} days
              </p>
              <p className="text-sm text-blue-900">
                <strong>Uses remaining:</strong> {inviteCode.uses_remaining}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button onClick={shareInvite} className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share Invite
              </Button>
              <Button variant="outline" onClick={copyLink} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copy Invite Link
              </Button>
              <Button variant="ghost" onClick={generateInviteCode} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New Code
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
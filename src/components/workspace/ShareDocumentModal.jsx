import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Share2,
  UserPlus,
  Mail,
  Eye,
  Edit3,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  Users,
  Calendar,
  Download,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ShareDocumentModal({ document, isOpen, onClose }) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [permissionLevel, setPermissionLevel] = useState('view_only');
  const [shareMessage, setShareMessage] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [expiresInDays, setExpiresInDays] = useState(null);
  const [isSharing, setIsSharing] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: existingShares = [] } = useQuery({
    queryKey: ['documentShares', document?.id],
    queryFn: () => base44.entities.DocumentShare.filter({ document_id: document.id }),
    enabled: !!document?.id,
    initialData: []
  });

  const shareDocumentMutation = useMutation({
    mutationFn: async (shareData) => {
      const share = await base44.entities.DocumentShare.create(shareData);
      
      // Send notification
      await base44.integrations.Core.SendEmail({
        to: shareData.shared_with_email,
        subject: `${shareData.owner_name} shared a document with you`,
        body: `
Hello,

${shareData.owner_name} has shared a document with you on Helper33 Workspace.

Document: ${shareData.document_title}
Permission: ${shareData.permission_level === 'view_only' ? 'View Only' : 'Edit'}

${shareData.share_message ? `Message: ${shareData.share_message}\n\n` : ''}

Access your shared documents at: ${window.location.origin}/Workspace

Best regards,
Helper33 Team
        `
      });

      return share;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['documentShares']);
      toast.success('Document shared! 📤');
      setRecipientEmail('');
      setShareMessage('');
    },
    onError: (error) => {
      console.error('Error sharing document:', error);
      toast.error('Failed to share document');
    }
  });

  const revokeShareMutation = useMutation({
    mutationFn: (shareId) => base44.entities.DocumentShare.update(shareId, { status: 'revoked' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['documentShares']);
      toast.success('Access revoked');
    }
  });

  const handleShare = async () => {
    if (!recipientEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (recipientEmail === user?.email) {
      toast.error('You cannot share with yourself');
      return;
    }

    const existingShare = existingShares.find(
      s => s.shared_with_email === recipientEmail && s.status !== 'revoked'
    );

    if (existingShare) {
      toast.error('Already shared with this user');
      return;
    }

    setIsSharing(true);

    const shareData = {
      document_id: document.id,
      document_title: document.title,
      owner_email: user.email,
      owner_name: user.full_name || user.email,
      shared_with_email: recipientEmail,
      permission_level: permissionLevel,
      share_message: shareMessage,
      share_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
      allow_download: allowDownload,
      expires_at: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString() : null
    };

    await shareDocumentMutation.mutateAsync(shareData);
    setIsSharing(false);
  };

  const copyShareLink = (share) => {
    const shareLink = `${window.location.origin}/Workspace?share=${share.share_code}`;
    navigator.clipboard.writeText(shareLink);
    toast.success('Share link copied! 🔗');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>;
      case 'revoked':
        return <Badge className="bg-gray-100 text-gray-700"><Shield className="w-3 h-3 mr-1" />Revoked</Badge>;
      default:
        return null;
    }
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Share2 className="w-5 h-5 text-blue-600" />
            Share Document
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Share "{document.title}" with others and manage permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-4">
          {/* Share New User */}
          <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
              <UserPlus className="w-4 h-4 text-blue-600" />
              Share with Someone New
            </h3>

            <div>
              <Label className="text-xs sm:text-sm">Recipient Email</Label>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="mt-1 min-h-[44px]"
              />
            </div>

            <div>
              <Label className="text-xs sm:text-sm mb-2 block">Permission Level</Label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button
                  variant={permissionLevel === 'view_only' ? 'default' : 'outline'}
                  onClick={() => setPermissionLevel('view_only')}
                  className={`justify-start touch-manipulation min-h-[44px] ${permissionLevel === 'view_only' ? 'bg-blue-600' : ''}`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Only
                </Button>
                <Button
                  variant={permissionLevel === 'edit' ? 'default' : 'outline'}
                  onClick={() => setPermissionLevel('edit')}
                  className={`justify-start touch-manipulation min-h-[44px] ${permissionLevel === 'edit' ? 'bg-blue-600' : ''}`}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs sm:text-sm">Message (Optional)</Label>
              <Textarea
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Add a personal message..."
                className="mt-1 min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded border">
                <Label className="text-xs sm:text-sm">Allow Download</Label>
                <Switch checked={allowDownload} onCheckedChange={setAllowDownload} />
              </div>

              <div>
                <Label className="text-xs sm:text-sm mb-2 block">Access Duration</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'No Expiry', value: null },
                    { label: '7 Days', value: 7 },
                    { label: '30 Days', value: 30 },
                    { label: '90 Days', value: 90 }
                  ].map(option => (
                    <Button
                      key={option.label}
                      variant={expiresInDays === option.value ? 'default' : 'outline'}
                      onClick={() => setExpiresInDays(option.value)}
                      size="sm"
                      className={`text-xs touch-manipulation min-h-[36px] ${expiresInDays === option.value ? 'bg-blue-600' : ''}`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleShare}
              disabled={isSharing || !recipientEmail.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 touch-manipulation min-h-[44px]"
            >
              {isSharing ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sharing...</>
              ) : (
                <><Share2 className="w-4 h-4 mr-2" />Share Document</>
              )}
            </Button>
          </div>

          {/* Existing Shares */}
          {existingShares.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                <Users className="w-4 h-4 text-purple-600" />
                Shared With ({existingShares.filter(s => s.status !== 'revoked').length})
              </h3>

              <div className="space-y-2">
                {existingShares.map(share => (
                  <motion.div
                    key={share.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 sm:p-4 rounded-lg border-2 ${
                      share.status === 'revoked' 
                        ? 'bg-gray-50 border-gray-200 opacity-60' 
                        : 'bg-white border-purple-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="font-medium text-gray-800 text-sm truncate">
                            {share.shared_with_name || share.shared_with_email}
                          </span>
                          {getStatusBadge(share.status)}
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mt-2">
                          <span className="flex items-center gap-1">
                            {share.permission_level === 'view_only' ? (
                              <><Eye className="w-3 h-3" />View Only</>
                            ) : (
                              <><Edit3 className="w-3 h-3" />Edit Access</>
                            )}
                          </span>
                          {share.allow_download && (
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />Can Download
                            </span>
                          )}
                          {share.expires_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Expires {new Date(share.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {share.access_count > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Accessed {share.access_count} time{share.access_count !== 1 ? 's' : ''}
                            {share.last_accessed && ` • Last: ${new Date(share.last_accessed).toLocaleString()}`}
                          </p>
                        )}
                      </div>

                      {share.status !== 'revoked' && (
                        <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
                          <Button
                            onClick={() => copyShareLink(share)}
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none touch-manipulation min-h-[36px]"
                          >
                            <LinkIcon className="w-3 h-3 sm:mr-2" />
                            <span className="hidden sm:inline">Copy Link</span>
                          </Button>
                          <Button
                            onClick={() => revokeShareMutation.mutate(share.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation min-h-[36px] min-w-[36px]"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Security Info */}
          <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1 text-sm">Secure Sharing</h4>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Encrypted share links with unique codes</li>
                  <li>• Revoke access anytime</li>
                  <li>• Track who viewed your documents</li>
                  <li>• Set expiration dates for temporary access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto touch-manipulation min-h-[44px]"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
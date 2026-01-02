import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  Share2, Users, Copy, Check, Mail, Link as LinkIcon, Loader2, X
} from 'lucide-react';
import { toast } from 'sonner';

export default function ShareMaterialModal({ material, onClose }) {
  const queryClient = useQueryClient();
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [shareViaEmail, setShareViaEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: studyGroups = [] } = useQuery({
    queryKey: ['myStudyGroups'],
    queryFn: () => base44.entities.StudyGroup.list('-updated_date'),
    initialData: []
  });

  const shareToGroupMutation = useMutation({
    mutationFn: async (groupIds) => {
      const promises = groupIds.map(groupId => {
        const group = studyGroups.find(g => g.id === groupId);
        if (!group) return null;
        
        const updatedMaterials = [...(group.shared_materials || [])];
        if (!updatedMaterials.includes(material.id)) {
          updatedMaterials.push(material.id);
        }
        
        return base44.entities.StudyGroup.update(groupId, {
          shared_materials: updatedMaterials
        });
      });
      
      return await Promise.all(promises.filter(p => p !== null));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStudyGroups'] });
      toast.success('✨ Material shared with groups!');
      onClose();
    }
  });

  const shareViaEmailMutation = useMutation({
    mutationFn: async (email) => {
      const shareLink = `${window.location.origin}?shared_material=${material.id}`;
      
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `📚 ${material.title} - Study Material Shared with You`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
              <h2 style="color: white; margin: 0;">📚 Study Material Shared</h2>
            </div>
            <div style="background: white; padding: 30px; border-radius: 15px; border: 2px solid #e0e0e0;">
              <h3 style="color: #667eea; margin-bottom: 15px;">${material.title}</h3>
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                A classmate has shared study material with you on Helper33 Homework Hub!
              </p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${material.subject}</p>
                <p style="margin: 5px 0;"><strong>Type:</strong> ${material.material_type}</p>
                ${material.teacher_name ? `<p style="margin: 5px 0;"><strong>Teacher:</strong> ${material.teacher_name}</p>` : ''}
              </div>
              <a href="${shareLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold;">
                View Material
              </a>
            </div>
          </div>
        `
      });
    },
    onSuccess: () => {
      toast.success('📧 Invite email sent!');
      setShareViaEmail('');
    }
  });

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}?shared_material=${material.id}`;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('📋 Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleGroupSelection = (groupId) => {
    setSelectedGroupIds(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-purple-300"
      >
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white p-6 flex items-center justify-between z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Share2 className="w-8 h-8" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Share Material</h2>
              <p className="text-purple-100 text-sm">{material.title}</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Share with Study Groups */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">Share with Study Groups</h3>
            </div>
            
            {studyGroups.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {studyGroups.map((group) => (
                  <motion.div
                    key={group.id}
                    whileHover={{ x: 5 }}
                    onClick={() => toggleGroupSelection(group.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedGroupIds.includes(group.id)
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-400'
                        : 'bg-white border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{group.group_emoji}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{group.group_name}</p>
                        <p className="text-xs text-gray-600">{group.member_count} members</p>
                      </div>
                      {selectedGroupIds.includes(group.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm mb-3">No study groups yet</p>
                <p className="text-xs text-gray-500">Create a group to share materials with classmates</p>
              </div>
            )}

            {selectedGroupIds.length > 0 && (
              <Button
                onClick={() => shareToGroupMutation.mutate(selectedGroupIds)}
                disabled={shareToGroupMutation.isPending}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white touch-manipulation"
              >
                {shareToGroupMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share with {selectedGroupIds.length} Group{selectedGroupIds.length > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-semibold">OR</span>
            </div>
          </div>

          {/* Share via Email */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Invite via Email</h3>
            </div>
            <div className="flex gap-2">
              <Input
                type="email"
                value={shareViaEmail}
                onChange={(e) => setShareViaEmail(e.target.value)}
                placeholder="classmate@school.edu"
                className="flex-1"
              />
              <Button
                onClick={() => shareViaEmailMutation.mutate(shareViaEmail)}
                disabled={!shareViaEmail || shareViaEmailMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {shareViaEmailMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-900">Copy Share Link</h3>
            </div>
            <Button
              onClick={copyShareLink}
              variant="outline"
              className="w-full border-2 border-green-300 hover:bg-green-50 touch-manipulation"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Share Link
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
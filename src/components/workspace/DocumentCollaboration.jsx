
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Eye,
  Edit3,
  Save,
  Clock,
  Tag,
  FileText,
  Loader2,
  Activity,
  Smartphone,
  Monitor,
  Tablet,
  Sparkles,
  FolderOpen, // Added FolderOpen import
  Globe // Added Globe import
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import DocumentTagging from './DocumentTagging';
import DocumentSummary from './DocumentSummary';

const getDeviceIcon = (deviceType) => {
  switch (deviceType) {
    case 'mobile': return Smartphone;
    case 'tablet': return Tablet;
    default: return Monitor;
  }
};

export default function DocumentCollaboration({ document, isOpen, onClose, userPermission }) {
  const [editedDoc, setEditedDoc] = useState(document);
  const [editingField, setEditingField] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const presenceInterval = useRef(null);
  const activityPollInterval = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Track active collaborators
  const { data: activeUsers = [] } = useQuery({
    queryKey: ['documentPresence', document?.id],
    queryFn: async () => {
      if (!document?.id) return [];
      
      // Get all presence records updated in last 30 seconds
      const cutoff = new Date(Date.now() - 30000).toISOString();
      const presences = await base44.entities.DocumentPresence.filter({
        document_id: document.id
      });
      
      return presences.filter(p => p.last_heartbeat > cutoff && p.user_email !== user?.email);
    },
    enabled: !!document?.id && !!user,
    refetchInterval: 5000, // Poll every 5 seconds
    initialData: []
  });

  // Track document activity
  const { data: recentActivity = [] } = useQuery({
    queryKey: ['documentActivity', document?.id],
    queryFn: async () => {
      if (!document?.id) return [];
      const activities = await base44.entities.DocumentActivity.filter({
        document_id: document.id
      });
      return activities.slice(0, 20); // Last 20 activities
    },
    enabled: !!document?.id,
    refetchInterval: 10000, // Poll every 10 seconds
    initialData: []
  });

  // Fetch document categories
  const { data: categories = [] } = useQuery({
    queryKey: ['documentCategories'],
    queryFn: () => base44.entities.DocumentCategory.list('sort_order'),
    initialData: []
  });

  const OCR_LANGUAGES = [
    { code: 'eng', name: 'English', flag: '🇺🇸' },
    { code: 'spa', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fra', name: 'French', flag: '🇫🇷' },
    { code: 'deu', name: 'German', flag: '🇩🇪' },
    { code: 'ita', name: 'Italian', flag: '🇮🇹' },
    { code: 'por', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'rus', name: 'Russian', flag: '🇷🇺' },
    { code: 'jpn', name: 'Japanese', flag: '🇯🇵' },
    { code: 'kor', name: 'Korean', flag: '🇰🇷' },
    { code: 'chi_sim', name: 'Chinese (Simplified)', flag: '🇨🇳' },
    { code: 'chi_tra', name: 'Chinese (Traditional)', flag: '🇹🇼' },
    { code: 'ara', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hin', name: 'Hindi', flag: '🇮🇳' },
    { code: 'heb', name: 'Hebrew', flag: '🇮🇱' }
  ];

  const updatePresenceMutation = useMutation({
    mutationFn: async (presenceData) => {
      // Try to find existing presence
      const existing = await base44.entities.DocumentPresence.filter({
        document_id: document.id,
        user_email: user.email
      });

      if (existing.length > 0) {
        return base44.entities.DocumentPresence.update(existing[0].id, presenceData);
      } else {
        return base44.entities.DocumentPresence.create({
          document_id: document.id,
          user_email: user.email,
          user_name: user.full_name || user.email,
          user_avatar: user.avatar_url,
          ...presenceData
        });
      }
    }
  });

  const logActivityMutation = useMutation({
    mutationFn: (activityData) => base44.entities.DocumentActivity.create({
      document_id: document.id,
      document_title: document.title,
      user_email: user.email,
      user_name: user.full_name || user.email,
      user_avatar: user.avatar_url,
      activity_timestamp: new Date().toISOString(),
      ...activityData
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['documentActivity', document.id]);
    }
  });

  // Update presence heartbeat
  useEffect(() => {
    if (!isOpen || !document || !user) return;

    const updateHeartbeat = () => {
      updatePresenceMutation.mutate({
        presence_type: editingField ? 'editing' : 'viewing',
        editing_field: editingField,
        last_heartbeat: new Date().toISOString(),
        session_start: new Date().toISOString(),
        device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
      });
    };

    // Initial heartbeat
    updateHeartbeat();

    // Update every 10 seconds
    presenceInterval.current = setInterval(updateHeartbeat, 10000);

    return () => {
      if (presenceInterval.current) {
        clearInterval(presenceInterval.current);
      }
      
      // Clean up presence on unmount
      base44.entities.DocumentPresence.filter({
        document_id: document.id,
        user_email: user.email
      }).then(presences => {
        presences.forEach(p => base44.entities.DocumentPresence.delete(p.id));
      });
    };
  }, [isOpen, document, user, editingField]);

  useEffect(() => {
    setEditedDoc(document);
  }, [document]);

  const handleSave = async () => {
    if (!editedDoc || userPermission !== 'edit') return;

    setIsSaving(true);

    try {
      const changes = {};
      const activities = [];

      // Detect changes
      if (editedDoc.title !== document.title) {
        changes.title = editedDoc.title;
        activities.push({
          activity_type: 'edited_title',
          activity_description: `Changed title to "${editedDoc.title}"`,
          changes: {
            field: 'title',
            old_value: document.title,
            new_value: editedDoc.title
          }
        });
      }

      if (JSON.stringify(editedDoc.tags) !== JSON.stringify(document.tags)) {
        changes.tags = editedDoc.tags;
        const added = editedDoc.tags?.filter(t => !document.tags?.includes(t)) || [];
        const removed = document.tags?.filter(t => !editedDoc.tags?.includes(t)) || [];
        
        activities.push({
          activity_type: 'edited_tags',
          activity_description: `Updated tags`,
          changes: {
            field: 'tags',
            added_items: added,
            removed_items: removed
          },
          is_major_change: added.length > 2 || removed.length > 2
        });
      }

      if (editedDoc.notes !== document.notes) {
        changes.notes = editedDoc.notes;
        activities.push({
          activity_type: 'edited_notes',
          activity_description: 'Updated notes',
          changes: {
            field: 'notes',
            old_value: document.notes,
            new_value: editedDoc.notes
          }
        });
      }

      if (editedDoc.document_type !== document.document_type) {
        changes.document_type = editedDoc.document_type;
        activities.push({
          activity_type: 'edited_type',
          activity_description: `Changed document type to ${editedDoc.document_type}`,
          changes: {
            field: 'document_type',
            old_value: document.document_type,
            new_value: editedDoc.document_type
          },
          is_major_change: true
        });
      }

      if (editedDoc.category_id !== document.category_id) {
        changes.category_id = editedDoc.category_id;
        changes.category_name = editedDoc.category_name;
        
        const oldCategory = categories.find(c => c.id === document.category_id);
        const newCategory = categories.find(c => c.id === editedDoc.category_id);
        
        activities.push({
          activity_type: 'edited_category', // Changed from edited_type to edited_category
          activity_description: `Changed category to ${newCategory?.category_name || 'Uncategorized'}`,
          changes: {
            field: 'category',
            old_value: oldCategory?.category_name || 'None',
            new_value: newCategory?.category_name || 'None'
          },
          is_major_change: true
        });
      }

      if (Object.keys(changes).length > 0) {
        await base44.entities.ScannedDocument.update(document.id, changes);
        
        // Log all activities
        for (const activity of activities) {
          await logActivityMutation.mutateAsync(activity);
        }

        queryClient.invalidateQueries(['scannedDocuments']);
        toast.success('Document updated! 📝');
      }

      setEditingField(null);
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSummaryGenerated = async (summaryData) => {
    if (!document || userPermission !== 'edit') return;

    try {
      await base44.entities.ScannedDocument.update(document.id, {
        ai_summary: summaryData.summary,
        key_points: summaryData.key_points,
        summary_generated_at: new Date().toISOString()
      });

      await logActivityMutation.mutateAsync({
        activity_type: 'summary_generated',
        activity_description: 'Generated AI summary',
        is_major_change: true
      });

      queryClient.invalidateQueries(['scannedDocuments']);
      toast.success('AI Summary generated successfully!');
    } catch (error) {
      console.error('Error saving summary:', error);
      toast.error('Failed to generate AI summary.');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'edited_title': return FileText;
      case 'edited_tags': return Tag;
      case 'edited_notes': return Edit3;
      case 'edited_type': return FileText; // For document_type
      case 'edited_category': return FolderOpen; // For category
      case 'synced_to_cloud': return Activity;
      case 'summary_generated': return Sparkles;
      default: return Clock;
    }
  };

  if (!document) return null;

  const canEdit = userPermission === 'edit';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="truncate">Collaborate on Document</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm truncate">
                {document.title}
              </DialogDescription>
            </div>
            
            {/* Active Collaborators */}
            {activeUsers.length > 0 && (
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <Users className="w-4 h-4 text-green-600" />
                <div className="flex -space-x-2">
                  {activeUsers.slice(0, 3).map((user, idx) => (
                    <div
                      key={user.id}
                      className="relative group"
                      title={`${user.user_name} is ${user.presence_type}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md">
                        {user.user_avatar ? (
                          <img src={user.user_avatar} alt={user.user_name} className="w-full h-full rounded-full" />
                        ) : (
                          user.user_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      {user.presence_type === 'editing' && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
                          {user.user_name}
                          {user.presence_type === 'editing' && user.editing_field && (
                            <span className="text-blue-300"> • editing {user.editing_field}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {activeUsers.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold border-2 border-white">
                      +{activeUsers.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto grid md:grid-cols-3 gap-4 sm:gap-6">
          {/* Document Editor - 2/3 width */}
          <div className="md:col-span-2 space-y-3 sm:space-y-4">
            
            {/* AI Summary Section */}
            {editedDoc.extracted_text && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs sm:text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    AI Summary
                  </Label>
                  {activeUsers.find(u => u.editing_field === 'summary') && (
                    <Badge variant="outline" className="text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      {activeUsers.find(u => u.editing_field === 'summary')?.user_name} viewing
                    </Badge>
                  )}
                </div>
                <div
                  onFocus={() => {
                    if (canEdit) setEditingField('summary');
                  }}
                  onBlur={() => setEditingField(null)}
                >
                  <DocumentSummary
                    document={editedDoc}
                    extractedText={editedDoc.extracted_text}
                    onSummaryGenerated={handleSummaryGenerated}
                    compact={false}
                  />
                </div>
              </div>
            )}

            {/* Title Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs sm:text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Title
                </Label>
                {activeUsers.find(u => u.editing_field === 'title') && (
                  <Badge variant="outline" className="text-xs">
                    <Edit3 className="w-3 h-3 mr-1" />
                    {activeUsers.find(u => u.editing_field === 'title')?.user_name} editing
                  </Badge>
                )}
              </div>
              <Input
                value={editedDoc.title || ''}
                onChange={(e) => setEditedDoc({...editedDoc, title: e.target.value})}
                onFocus={() => {
                  if (canEdit) setEditingField('title');
                }}
                onBlur={() => setEditingField(null)}
                disabled={!canEdit}
                className="min-h-[44px] text-sm sm:text-base"
                placeholder="Document title..."
              />
            </div>

            {/* Category Selection */}
            {categories.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs sm:text-sm flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-purple-600" />
                    Category
                  </Label>
                </div>
                <select
                  value={editedDoc.category_id || ''}
                  onChange={(e) => {
                    const selectedCat = categories.find(c => c.id === e.target.value);
                    setEditedDoc({
                      ...editedDoc,
                      category_id: e.target.value || null,
                      category_name: selectedCat?.category_name || null
                    });
                  }}
                  disabled={!canEdit}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm sm:text-base min-h-[44px] bg-white disabled:bg-gray-50"
                >
                  <option value="">Uncategorized</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon_emoji} {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Document Type */}
            <div>
              <Label className="text-xs sm:text-sm mb-2 block">Document Type</Label>
              <select
                value={editedDoc.document_type || 'other'}
                onChange={(e) => setEditedDoc({...editedDoc, document_type: e.target.value})}
                onFocus={() => {
                  if (canEdit) setEditingField('document_type');
                }}
                onBlur={() => setEditingField(null)}
                disabled={!canEdit}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm sm:text-base min-h-[44px] bg-white disabled:bg-gray-50"
              >
                <option value="other">Other</option>
                <option value="receipt">Receipt</option>
                <option value="invoice">Invoice</option>
                <option value="contract">Contract</option>
                <option value="medical">Medical</option>
                <option value="legal">Legal</option>
                <option value="business_card">Business Card</option>
                <option value="id_card">ID Card</option>
                <option value="passport">Passport</option>
                <option value="whiteboard">Whiteboard</option>
                <option value="note">Note</option>
              </select>
            </div>

            {/* OCR Language Display (read-only in collaboration view) */}
            {editedDoc.ocr_language && (
              <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">OCR Language:</span>
                  <Badge className="bg-blue-600 text-white">
                    {OCR_LANGUAGES.find(l => l.code === editedDoc.ocr_language)?.flag}{' '}
                    {OCR_LANGUAGES.find(l => l.code === editedDoc.ocr_language)?.name || editedDoc.ocr_language}
                  </Badge>
                </div>
              </div>
            )}

            {/* Tags - AI Powered */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs sm:text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-600" />
                  Tags
                </Label>
                {activeUsers.find(u => u.editing_field === 'tags') && (
                  <Badge variant="outline" className="text-xs">
                    <Edit3 className="w-3 h-3 mr-1" />
                    {activeUsers.find(u => u.editing_field === 'tags')?.user_name} editing
                  </Badge>
                )}
              </div>
              
              <div
                onFocus={() => {
                  if (canEdit) setEditingField('tags');
                }}
                onBlur={() => setEditingField(null)}
              >
                <DocumentTagging
                  documentTitle={editedDoc.title}
                  extractedText={editedDoc.extracted_text}
                  documentType={editedDoc.document_type}
                  currentTags={editedDoc.tags || []}
                  onTagsUpdate={(newTags) => setEditedDoc({...editedDoc, tags: newTags})}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs sm:text-sm">Notes</Label>
                {activeUsers.find(u => u.editing_field === 'notes') && (
                  <Badge variant="outline" className="text-xs">
                    <Edit3 className="w-3 h-3 mr-1" />
                    {activeUsers.find(u => u.editing_field === 'notes')?.user_name} editing
                  </Badge>
                )}
              </div>
              <Textarea
                value={editedDoc.notes || ''}
                onChange={(e) => setEditedDoc({...editedDoc, notes: e.target.value})}
                onFocus={() => {
                  if (canEdit) setEditingField('notes');
                }}
                onBlur={() => setEditingField(null)}
                disabled={!canEdit}
                className="min-h-[100px] text-sm"
                placeholder="Add notes about this document..."
              />
            </div>

            {/* Save Button */}
            {canEdit && (
              <Button
                onClick={handleSave}
                disabled={isSaving || JSON.stringify(editedDoc) === JSON.stringify(document)}
                className="w-full bg-green-600 hover:bg-green-700 touch-manipulation min-h-[44px]"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />Save Changes</>
                )}
              </Button>
            )}

            {!canEdit && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs sm:text-sm text-yellow-800 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  You have view-only access to this document
                </p>
              </div>
            )}
          </div>

          {/* Activity Sidebar - 1/3 width */}
          <div className="md:col-span-1 space-y-3 sm:space-y-4">
            
            {/* Who's Here */}
            <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Users className="w-4 h-4" />
                Who's Here ({activeUsers.length + 1})
              </h4>
              
              <div className="space-y-2">
                {/* Current User */}
                <div className="flex items-center gap-2 p-2 bg-white/80 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="You" className="w-full h-full rounded-full" />
                    ) : (
                      user?.full_name?.charAt(0).toUpperCase() || 'Y'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">You</p>
                    <p className="text-xs text-gray-500 truncate">
                      {editingField ? `Editing ${editingField}` : 'Viewing'}
                    </p>
                  </div>
                  {editingField && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
                  )}
                </div>

                {/* Other Collaborators */}
                {activeUsers.map(collabUser => {
                  const DeviceIcon = getDeviceIcon(collabUser.device_type);
                  return (
                    <div key={collabUser.id} className="flex items-center gap-2 p-2 bg-white/80 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 relative">
                        {collabUser.user_avatar ? (
                          <img src={collabUser.user_avatar} alt={collabUser.user_name} className="w-full h-full rounded-full" />
                        ) : (
                          collabUser.user_name.charAt(0).toUpperCase()
                        )}
                        {collabUser.presence_type === 'editing' && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{collabUser.user_name}</p>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          {collabUser.presence_type === 'editing' && collabUser.editing_field ? (
                            <>Editing {collabUser.editing_field}</>
                          ) : (
                            <>Viewing</>
                          )}
                          <DeviceIcon className="w-3 h-3 ml-1" />
                        </p>
                      </div>
                      {collabUser.presence_type === 'editing' && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Clock className="w-4 h-4 text-purple-600" />
                Recent Activity
              </h4>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, idx) => {
                    const Icon = getActivityIcon(activity.activity_type);
                    return (
                      <motion.div
                        key={activity.id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-2 rounded-lg ${activity.is_major_change ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-6 h-6 rounded-full ${activity.is_major_change ? 'bg-blue-500' : 'bg-gray-400'} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 mb-0.5 truncate">
                              {activity.user_name}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {activity.activity_description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimestamp(activity.activity_timestamp || activity.created_date)}
                            </p>
                          </div>
                        </div>

                        {/* Show detailed changes for major edits */}
                        {activity.changes && activity.is_major_change && (
                          <div className="mt-2 pl-8 text-xs text-gray-500">
                            {activity.changes.added_items?.length > 0 && (
                              <p>+ {activity.changes.added_items.join(', ')}</p>
                            )}
                            {activity.changes.removed_items?.length > 0 && (
                              <p>- {activity.changes.removed_items.join(', ')}</p>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs">No activity yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Info */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2 text-xs sm:text-sm">Document Info</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <p>📄 {document.page_count} page{document.page_count !== 1 ? 's' : ''}</p>
                <p>📅 Created {new Date(document.created_date).toLocaleDateString()}</p>
                <p>👤 By {document.created_by}</p>
                {document.cloud_sync_status === 'synced' && (
                  <p className="text-green-600">☁️ Synced to cloud</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

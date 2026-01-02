
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users,
  FileText,
  Search,
  Eye,
  Edit3,
  Calendar,
  Mail,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import DocumentCollaboration from './DocumentCollaboration';

export default function SharedWithMe() {
  const [searchQuery, setSearchQuery] = useState('');
  const [collaboratingDocument, setCollaboratingDocument] = useState(null);
  const [userPermission, setUserPermission] = useState('view_only');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: sharedWithMe = [] } = useQuery({
    queryKey: ['documentsSharedWithMe'],
    queryFn: async () => {
      const shares = await base44.entities.DocumentShare.filter({ 
        shared_with_email: user.email,
        status: { $ne: 'revoked' }
      });
      
      // Get the actual documents
      const documentIds = shares.map(s => s.document_id);
      const documents = await Promise.all(
        documentIds.map(id => base44.entities.ScannedDocument.filter({ id }))
      );
      
      return shares.map((share, idx) => ({
        ...share,
        document: documents[idx][0]
      })).filter(s => s.document);
    },
    enabled: !!user?.email,
    initialData: []
  });

  const filteredShares = sharedWithMe.filter(share => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      share.document_title.toLowerCase().includes(searchLower) ||
      share.owner_name.toLowerCase().includes(searchLower) ||
      (share.document?.extracted_text || '').toLowerCase().includes(searchLower)
    );
  });

  const acceptShare = async (share) => {
    try {
      await base44.entities.DocumentShare.update(share.id, {
        status: 'accepted',
        accepted_at: new Date().toISOString()
      });
      toast.success('Share accepted! 📄');
    } catch (error) {
      console.error('Error accepting share:', error);
      toast.error('Failed to accept');
    }
  };

  const declineShare = async (share) => {
    if (!confirm('Decline this shared document?')) return;

    try {
      await base44.entities.DocumentShare.update(share.id, {
        status: 'declined'
      });
      toast.success('Share declined');
    } catch (error) {
      console.error('Error declining share:', error);
      toast.error('Failed to decline');
    }
  };

  const viewDocument = async (share) => {
    if (!share.document) return;

    // Track access
    await base44.entities.DocumentShare.update(share.id, {
      last_accessed: new Date().toISOString(),
      access_count: (share.access_count || 0) + 1,
      status: share.status === 'pending' ? 'accepted' : share.status
    });

    // Open in collaboration mode
    setUserPermission(share.permission_level);
    setCollaboratingDocument(share.document);
  };

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-xl border-2 border-purple-200 shadow-xl">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            Shared With Me
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Documents others have shared with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shared documents..."
              className="pl-10 min-h-[44px] text-sm sm:text-base"
            />
          </div>

          {/* Shared Documents List */}
          <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
            {filteredShares.length > 0 ? (
              filteredShares.map(share => (
                <motion.div
                  key={share.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                          {share.document_title}
                        </h4>
                        {share.permission_level === 'view_only' ? (
                          <Badge variant="outline" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />View
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">
                            <Edit3 className="w-3 h-3 mr-1" />Edit
                          </Badge>
                        )}
                      </div>

                      {/* AI Summary Preview */}
                      {share.document?.ai_summary && (
                        <div className="p-2 bg-white/60 rounded border border-purple-100">
                          <p className="text-xs text-gray-700 line-clamp-2 flex items-start gap-2">
                            <Sparkles className="w-3 h-3 text-purple-600 flex-shrink-0 mt-0.5" />
                            <span>{share.document.ai_summary}</span>
                          </p>
                        </div>
                      )}

                      <div className="text-xs text-gray-600 space-y-1">
                        <p className="flex items-center gap-1">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span>From: {share.owner_name}</span>
                        </p>
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>Shared: {new Date(share.created_date).toLocaleDateString()}</span>
                        </p>
                        {share.expires_at && (
                          <p className="flex items-center gap-1 text-orange-600">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span>Expires: {new Date(share.expires_at).toLocaleDateString()}</span>
                          </p>
                        )}
                      </div>

                      {share.share_message && (
                        <p className="text-xs text-gray-600 mt-2 italic p-2 bg-white/50 rounded">
                          "{share.share_message}"
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      {share.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => acceptShare(share)}
                            size="sm"
                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 touch-manipulation min-h-[36px]"
                          >
                            <CheckCircle className="w-3 h-3 sm:mr-2" />
                            <span className="hidden sm:inline">Accept</span>
                          </Button>
                          <Button
                            onClick={() => declineShare(share)}
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none text-red-600 touch-manipulation min-h-[36px]"
                          >
                            <XCircle className="w-3 h-3 sm:mr-2" />
                            <span className="hidden sm:inline">Decline</span>
                          </Button>
                        </>
                      )}
                      
                      {share.status === 'accepted' && (
                        <Button
                          onClick={() => viewDocument(share)}
                          size="sm"
                          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 touch-manipulation min-h-[36px]"
                        >
                          {share.permission_level === 'edit' ? (
                            <><Users className="w-3 h-3 sm:mr-2" />Collaborate</>
                          ) : (
                            <><ExternalLink className="w-3 h-3 sm:mr-2" />View Document</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-400">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-xs sm:text-sm">
                  {searchQuery ? 'No shared documents found' : 'No documents shared with you yet'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <DocumentCollaboration
        document={collaboratingDocument}
        isOpen={!!collaboratingDocument}
        onClose={() => setCollaboratingDocument(null)}
        userPermission={userPermission}
      />
    </>
  );
}

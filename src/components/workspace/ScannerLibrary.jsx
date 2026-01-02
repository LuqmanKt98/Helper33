
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Folder,
  FileText,
  Search,
  Download,
  Share2,
  Trash2,
  Star,
  Calendar,
  Filter,
  Cloud,
  CloudOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  Tag,
  CheckSquare,
  Sparkles, // Added Sparkles icon
  FolderOpen // New import for categories
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ShareDocumentModal from './ShareDocumentModal';
import DocumentCollaboration from './DocumentCollaboration';
import PDFExportModal from './PDFExportModal';
// Added DocumentSummary import
import CategoryManager from './CategoryManager'; // New import
import { categorizeBulkDocuments } from './AutoCategorize'; // New import

export default function ScannerLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [sharingDocument, setSharingDocument] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [collaboratingDocument, setCollaboratingDocument] = useState(null);
  const [userPermission, setUserPermission] = useState('view_only');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [exportingDocuments, setExportingDocuments] = useState(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false); // New state
  const [selectedCategory, setSelectedCategory] = useState('all'); // New state
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false); // New state

  const queryClient = useQueryClient(); // Get query client for invalidation

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['scannedDocuments'],
    queryFn: () => base44.entities.ScannedDocument.list('-created_date'),
    initialData: []
  });

  const { data: cloudConnections = [] } = useQuery({
    queryKey: ['cloudSyncConnections'],
    queryFn: () => base44.entities.CloudSyncConnection.list(),
    initialData: []
  });

  // New query for categories
  const { data: categories = [] } = useQuery({
    queryKey: ['documentCategories'],
    queryFn: () => base44.entities.DocumentCategory.list('sort_order'),
    initialData: []
  });

  const activeConnection = cloudConnections.find(c => c.is_connected);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.extracted_text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFolder = selectedFolder === 'all' || doc.folder === selectedFolder;
    const matchesTag = !selectedTag || (doc.tags || []).includes(selectedTag);
    const matchesCategory = selectedCategory === 'all' || doc.category_id === selectedCategory; // New filter condition
    
    return matchesSearch && matchesFolder && matchesTag && matchesCategory; // Apply new filter
  });

  const folders = [...new Set(documents.map(d => d.folder).filter(Boolean))];
  const allTags = [...new Set(documents.flatMap(d => d.tags || []))].sort();

  const checkPermission = async (doc) => {
    try {
      const shares = await base44.entities.DocumentShare.filter({
        document_id: doc.id,
        shared_with_email: user?.email,
        status: { $in: ['pending', 'accepted'] }
      });

      if (shares.length > 0) {
        return shares[0].permission_level;
      }
      
      return doc.created_by === user?.email ? 'edit' : 'view_only';
    } catch (error) {
      console.error('Error checking permission:', error);
      return 'view_only';
    }
  };

  const openCollaboration = async (doc) => {
    const permission = await checkPermission(doc);
    setUserPermission(permission);
    setCollaboratingDocument(doc);
  };

  const toggleDocumentSelection = (docId) => {
    setSelectedDocuments(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const selectAllDocuments = () => {
    if (selectedDocuments.length === filteredDocs.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocs.map(d => d.id));
    }
  };

  const handleBulkExport = () => {
    const docsToExport = documents.filter(d => selectedDocuments.includes(d.id));
    setExportingDocuments(docsToExport);
  };

  const handleSingleExport = (doc) => {
    setExportingDocuments([doc]);
  };

  // New function for bulk auto-categorization
  const handleBulkAutoCategorize = async () => {
    if (categories.length === 0) {
      toast.error('Please create categories first.');
      setShowCategoryManager(true);
      return;
    }

    const uncategorizedDocs = documents.filter(d => !d.category_id);
    
    if (uncategorizedDocs.length === 0) {
      toast.info('All documents are already categorized.');
      return;
    }

    setIsAutoCategorizing(true);
    toast.info(`Categorizing ${uncategorizedDocs.length} documents... ⏳`);

    try {
      const results = await categorizeBulkDocuments(uncategorizedDocs, categories);
      const successCount = results.filter(r => r.success).length;
      
      queryClient.invalidateQueries(['scannedDocuments']);
      queryClient.invalidateQueries(['documentCategories']);
      
      toast.success(`Categorized ${successCount} documents! 🎯`);
    } catch (error) {
      console.error('Error bulk categorizing:', error);
      toast.error('Failed to categorize documents.');
    } finally {
      setIsAutoCategorizing(false);
    }
  };

  // Helper function to get category details by ID
  const getCategoryById = (categoryId) => {
    return categories.find(c => c.id === categoryId);
  };

  const downloadDocument = (doc) => {
    if (doc.pdf_url) {
      window.open(doc.pdf_url, '_blank');
    } else if (doc.processed_image_urls && doc.processed_image_urls.length > 0) {
      window.open(doc.processed_image_urls[0], '_blank');
    }
    toast.success('Opening document...');
  };

  const deleteDocument = async (docId) => {
    if (!confirm('Delete this document?')) return;

    try {
      await base44.entities.ScannedDocument.delete(docId);
      queryClient.invalidateQueries(['scannedDocuments']); // Invalidate to refetch
      toast.success('Document deleted');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete');
    }
  };

  const syncDocument = async (doc) => {
    if (!activeConnection) {
      toast.error('Please connect cloud storage first');
      return;
    }

    try {
      await base44.entities.ScannedDocument.update(doc.id, {
        cloud_sync_status: 'syncing'
      });
      queryClient.invalidateQueries(['scannedDocuments']); // Invalidate to show syncing status

      await new Promise(resolve => setTimeout(resolve, 1500));

      await base44.entities.ScannedDocument.update(doc.id, {
        cloud_sync_status: 'synced',
        last_synced: new Date().toISOString(),
        cloud_file_ids: {
          ...doc.cloud_file_ids,
          [activeConnection.provider + '_id']: `cloud_file_${Date.now()}`
        }
      });
      queryClient.invalidateQueries(['scannedDocuments']); // Invalidate to show synced status

      toast.success('Document synced to cloud! ☁️');
    } catch (error) {
      console.error('Error syncing document:', error);
      await base44.entities.ScannedDocument.update(doc.id, {
        cloud_sync_status: 'sync_failed',
        sync_error: error.message
      });
      queryClient.invalidateQueries(['scannedDocuments']); // Invalidate to show sync failed status
      toast.error('Sync failed');
    }
  };

  const getSyncStatusIcon = (status) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'syncing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'sync_failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <CloudOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const regenerateSummary = async (doc) => {
    if (!doc.extracted_text) {
      toast.error('No text to summarize. Extract text first.');
      return;
    }

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this document and provide a concise summary with key points:

Document: ${doc.title}
Type: ${doc.document_type}

Text:
${doc.extracted_text.substring(0, 3000)}`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_points: { 
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      await base44.entities.ScannedDocument.update(doc.id, {
        ai_summary: response.summary,
        key_points: response.key_points,
        summary_generated_at: new Date().toISOString()
      });
      queryClient.invalidateQueries(['scannedDocuments']); // Invalidate to show new summary

      toast.success('Summary updated! ✨');
    } catch (error) {
      console.error('Error regenerating summary:', error);
      toast.error('Failed to update summary');
    }
  };

  const getLanguageDisplay = (langCode) => {
    const lang = OCR_LANGUAGES.find(l => l.code === langCode);
    return lang ? `${lang.flag} ${lang.name}` : '🌐 Auto-detected';
  };

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
    { code: 'heb', name: 'Hebrew', flag: '🇮🇱' },
    { code: 'pol', name: 'Polish', flag: '🇵🇱' },
    { code: 'ukr', name: 'Ukrainian', flag: '🇺🇦' },
    { code: 'vie', name: 'Vietnamese', flag: '🇻🇳' },
    { code: 'tha', name: 'Thai', flag: '🇹🇭' },
    { code: 'tur', name: 'Turkish', flag: '🇹🇷' },
    { code: 'nld', name: 'Dutch', flag: '🇳🇱' },
    { code: 'swe', name: 'Swedish', flag: '🇸🇪' },
    { code: 'dan', name: 'Danish', flag: '🇩🇰' },
    { code: 'nor', name: 'Norwegian', flag: '🇳🇴' },
    { code: 'fin', name: 'Finnish', flag: '🇫🇮' }
  ];

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-xl border-2 border-blue-200 shadow-xl">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Document Library
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {activeConnection && (
                <Badge className="bg-green-100 text-green-700 flex items-center gap-1 w-fit text-xs">
                  <Cloud className="w-3 h-3" />
                  Cloud Enabled
                </Badge>
              )}
              {/* New Categories button */}
              <Button
                onClick={() => setShowCategoryManager(true)}
                variant="outline"
                size="sm"
                className="touch-manipulation min-h-[36px]"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Categories
              </Button>
              {documents.length > 0 && (
                <Button
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedDocuments([]);
                  }}
                  variant={isSelectionMode ? 'default' : 'outline'}
                  size="sm"
                  className={`touch-manipulation min-h-[36px] ${isSelectionMode ? 'bg-purple-600' : ''}`}
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  {isSelectionMode ? 'Done' : 'Select'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          
          {/* Bulk Actions Bar */}
          <AnimatePresence>
            {isSelectionMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 sm:p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedDocuments.length === filteredDocs.length && filteredDocs.length > 0}
                      onCheckedChange={selectAllDocuments}
                    />
                    <Label className="text-sm font-semibold text-purple-900">
                      {selectedDocuments.length === 0 
                        ? 'Select documents to export'
                        : `${selectedDocuments.length} document${selectedDocuments.length !== 1 ? 's' : ''} selected`
                      }
                    </Label>
                  </div>
                  
                  {selectedDocuments.length > 0 && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        onClick={handleBulkExport}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 touch-manipulation min-h-[40px]"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Export {selectedDocuments.length} as PDF
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auto-Categorize Action */}
          {categories.length > 0 && documents.some(d => !d.category_id) && (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-purple-900 text-sm">
                      {documents.filter(d => !d.category_id).length} uncategorized document{documents.filter(d => !d.category_id).length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-purple-700">
                      Use AI to automatically organize your documents
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleBulkAutoCategorize}
                  disabled={isAutoCategorizing}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 touch-manipulation min-h-[40px]"
                >
                  {isAutoCategorizing ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Categorizing...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />Auto-Categorize All</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Search - Mobile Optimized */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents, tags..."
              className="pl-10 text-sm sm:text-base min-h-[44px]"
            />
          </div>

          {/* Category Filter - New Section */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <FolderOpen className="w-3 h-3" />
                Filter by Category
              </Label>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  onClick={() => setSelectedCategory('all')}
                  size="sm"
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  className={`touch-manipulation min-h-[32px] text-xs ${selectedCategory === 'all' ? 'bg-blue-600' : ''}`}
                >
                  All
                </Button>
                {categories.map(category => {
                  const docCount = documents.filter(d => d.category_id === category.id).length;
                  return (
                    <Button
                      key={category.id}
                      onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
                      size="sm"
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      className={`touch-manipulation min-h-[32px] text-xs ${selectedCategory === category.id ? '' : ''}`}
                      style={selectedCategory === category.id ? {
                        backgroundColor: category.color,
                        borderColor: category.color,
                        color: 'white'
                      } : {
                        borderColor: category.color + '40', // Add some transparency to border for outline look
                        color: category.color
                      }}
                    >
                      <span className="mr-1">{category.icon_emoji}</span>
                      {category.category_name}
                      {docCount > 0 && (
                        <Badge variant="outline" className="ml-2 text-xs border-current"
                          style={selectedCategory === category.id ? { color: 'white', borderColor: 'rgba(255,255,255,0.5)' } : {}}
                        >
                          {docCount}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tag Filter - Mobile Optimized */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Filter by Tag
              </Label>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  onClick={() => setSelectedTag(null)}
                  size="sm"
                  variant={!selectedTag ? 'default' : 'outline'}
                  className={`touch-manipulation min-h-[32px] text-xs ${!selectedTag ? 'bg-blue-600' : ''}`}
                >
                  All
                </Button>
                {allTags.slice(0, 8).map(tag => (
                  <Button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    size="sm"
                    variant={selectedTag === tag ? 'default' : 'outline'}
                    className={`touch-manipulation min-h-[32px] text-xs ${selectedTag === tag ? 'bg-blue-600' : ''}`}
                  >
                    {tag}
                  </Button>
                ))}
                {allTags.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{allTags.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Folder Filter - Mobile Optimized */}
          {folders.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedFolder('all')}
                size="sm"
                variant={selectedFolder === 'all' ? 'default' : 'outline'}
                className={`touch-manipulation min-h-[36px] text-xs ${selectedFolder === 'all' ? 'bg-blue-600' : ''}`}
              >
                All Folders
              </Button>
              {folders.map(folder => (
                <Button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  size="sm"
                  variant={selectedFolder === folder ? 'default' : 'outline'}
                  className={`touch-manipulation min-h-[36px] text-xs ${selectedFolder === folder ? 'bg-blue-600' : ''}`}
                >
                  {folder}
                </Button>
              ))}
            </div>
          )}

          {/* Documents List - Enhanced with Language Display */}
          <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
            {filteredDocs.length > 0 ? (
              filteredDocs.map(doc => {
                const category = doc.category_id ? getCategoryById(doc.category_id) : null;
                
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 sm:p-4 rounded-lg border transition-all group ${
                      isSelectionMode && selectedDocuments.includes(doc.id)
                        ? 'bg-purple-50 border-purple-400'
                        : 'bg-gray-50 border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Selection Checkbox */}
                      {isSelectionMode && (
                        <Checkbox
                          checked={selectedDocuments.includes(doc.id)}
                          onCheckedChange={() => toggleDocumentSelection(doc.id)}
                          className="mt-1 flex-shrink-0"
                        />
                      )}

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2 text-sm sm:text-base flex-wrap">
                              <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="truncate">{doc.title}</span>
                              {doc.is_favorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                              {getSyncStatusIcon(doc.cloud_sync_status)}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                              {/* Display Category Badge */}
                              {category && (
                                <Badge
                                  className="text-xs font-medium"
                                  style={{
                                    backgroundColor: category.color + '20', // Light background with transparency
                                    borderColor: category.color + '40', // Slightly darker border
                                    color: category.color // Text color matching category
                                  }}
                                >
                                  {category.icon_emoji} {category.category_name}
                                </Badge>
                              )}
                              {doc.ocr_language && doc.ocr_language !== 'eng' && (
                                <Badge variant="outline" className="text-xs">
                                  {getLanguageDisplay(doc.ocr_language)}
                                </Badge>
                              )}
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span className="whitespace-nowrap">{new Date(doc.created_date).toLocaleDateString()}</span>
                              <Badge variant="outline" className="text-xs whitespace-nowrap">{doc.page_count} page{doc.page_count !== 1 ? 's' : ''}</Badge>
                              {doc.cloud_sync_status === 'synced' && doc.last_synced && (
                                <Badge className="bg-green-100 text-green-700 text-xs whitespace-nowrap">
                                  <Cloud className="w-3 h-3 mr-1 flex-shrink-0" />
                                  Synced {new Date(doc.last_synced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {!isSelectionMode && (
                            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <Button
                                onClick={() => handleSingleExport(doc)}
                                size="sm"
                                variant="ghost"
                                title="Export as PDF"
                                className="touch-manipulation min-h-[36px] min-w-[36px] p-2"
                              >
                                <FileText className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                onClick={() => openCollaboration(doc)}
                                size="sm"
                                variant="ghost"
                                title="Collaborate & Edit"
                                className="touch-manipulation min-h-[36px] min-w-[36px] p-2"
                              >
                                <Users className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                onClick={() => setSharingDocument(doc)}
                                size="sm"
                                variant="ghost"
                                title="Share document"
                                className="touch-manipulation min-h-[36px] min-w-[36px] p-2"
                              >
                                <Share2 className="w-4 h-4 text-purple-600" />
                              </Button>
                              {activeConnection && doc.cloud_sync_status !== 'synced' && doc.cloud_sync_status !== 'syncing' && (
                                <Button
                                  onClick={() => syncDocument(doc)}
                                  size="sm"
                                  variant="ghost"
                                  title="Sync to cloud"
                                  className="touch-manipulation min-h-[36px] min-w-[36px] p-2"
                                >
                                  <Cloud className="w-4 h-4 text-blue-600" />
                                </Button>
                              )}
                              <Button
                                onClick={() => downloadDocument(doc)}
                                size="sm"
                                variant="ghost"
                                className="touch-manipulation min-h-[36px] min-w-[36px] p-2"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => deleteDocument(doc.id)}
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 touch-manipulation min-h-[36px] min-w-[36px] p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* AI Summary Preview - Compact */}
                        {doc.ai_summary && (
                          <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded border border-purple-200">
                            <p className="text-xs text-gray-700 line-clamp-2 flex items-start gap-2">
                              <Sparkles className="w-3 h-3 text-purple-600 flex-shrink-0 mt-0.5" />
                              <span>{doc.ai_summary}</span>
                            </p>
                          </div>
                        )}

                        {/* Extracted Text Preview (if no summary) */}
                        {!doc.ai_summary && doc.extracted_text && (
                          <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                            {doc.extracted_text.substring(0, 150)}...
                          </p>
                        )}

                        {/* Generate Summary Button */}
                        {!doc.ai_summary && doc.extracted_text && (
                          <Button
                            onClick={() => regenerateSummary(doc)}
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto bg-purple-50 hover:bg-purple-100 border-purple-200 text-xs touch-manipulation min-h-[32px]"
                          >
                            <Sparkles className="w-3 h-3 mr-2" />
                            Generate Summary
                          </Button>
                        )}

                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.map((tag, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className="text-xs cursor-pointer hover:bg-blue-50"
                                onClick={() => setSelectedTag(tag)}
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-400">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-xs sm:text-sm">
                  {searchQuery || selectedTag || selectedCategory !== 'all' ? 'No documents found matching filters.' : 'No saved documents yet.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ShareDocumentModal
        document={sharingDocument}
        isOpen={!!sharingDocument}
        onClose={() => setSharingDocument(null)}
      />

      <DocumentCollaboration
        document={collaboratingDocument}
        isOpen={!!collaboratingDocument}
        onClose={() => setCollaboratingDocument(null)}
        userPermission={userPermission}
      />

      <PDFExportModal
        documents={exportingDocuments || []}
        isOpen={!!exportingDocuments}
        onClose={() => {
          setExportingDocuments(null);
          setIsSelectionMode(false);
          setSelectedDocuments([]);
        }}
      />
      
      {/* New CategoryManager component */}
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
      />
    </>
  );
}

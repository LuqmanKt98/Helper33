
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Upload,
  FileText,
  Save,
  Trash2,
  Plus,
  Sparkles,
  X,
  Loader2,
  Scan,
  Globe // Added Globe icon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import DocumentTagging from './DocumentTagging';
import { Switch } from '@/components/ui/switch';
import { autoCategorizeDocument } from './AutoCategorize';

const FILTERS = [
  { id: 'none', name: 'Original', description: 'No filter' },
  { id: 'black_white', name: 'B&W', description: 'High contrast black and white' },
  { id: 'grayscale', name: 'Grayscale', description: 'Professional grayscale' },
  { id: 'color_enhance', name: 'Color+', description: 'Enhanced colors' },
  { id: 'magic_color', name: 'Magic', description: 'Auto-enhance' },
  { id: 'whiteboard', name: 'Whiteboard', description: 'Whiteboard clarity' }
];

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

export default function DocumentScanner() {
  const [scanningMode, setScanningMode] = useState('upload');
  const [scannedPages, setScannedPages] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('none');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState('other');
  const [documentTags, setDocumentTags] = useState([]);
  const [ocrLanguage, setOcrLanguage] = useState('eng'); // New state for OCR language
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [exportAsPDF, setExportAsPDF] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['documentCategories'],
    queryFn: () => base44.entities.DocumentCategory.list('sort_order'),
    initialData: []
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Camera access denied. Please use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
      uploadAndProcessImage(file);
    }, 'image/jpeg', 0.95);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => uploadAndProcessImage(file));
  };

  const uploadAndProcessImage = async (file) => {
    setIsProcessing(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setScannedPages(prev => [...prev, {
        id: Date.now(),
        original_url: file_url,
        processed_url: file_url,
        filter: 'none'
      }]);
      
      toast.success('Page scanned!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyFilter = (pageId, filterId) => {
    setScannedPages(prev => prev.map(page => {
      if (page.id === pageId) {
        return { ...page, filter: filterId };
      }
      return page;
    }));
    toast.success(`Filter applied: ${FILTERS.find(f => f.id === filterId)?.name}`);
  };

  const removePage = (pageId) => {
    setScannedPages(prev => prev.filter(p => p.id !== pageId));
  };

  const extractText = async () => {
    if (scannedPages.length === 0) {
      toast.error('Please scan a document first');
      return;
    }

    setIsExtracting(true);
    try {
      const imageUrls = scannedPages.map(p => p.processed_url);
      const selectedLanguage = OCR_LANGUAGES.find(l => l.code === ocrLanguage);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract all text from this scanned document image(s) in ${selectedLanguage?.name || 'English'}. 
        
The document is in ${selectedLanguage?.name || 'English'} language.
Preserve the original formatting, structure, and layout as much as possible.
Return the extracted text as plain text, maintaining paragraphs and spacing.

If the document contains tables, preserve them using simple text formatting.
If there are multiple pages, separate them with "--- PAGE BREAK ---".

Also:
- Identify the likely document type
- Suggest a title if none is provided
- Extract key points and main topics (in ${selectedLanguage?.name || 'English'})
- Create a concise summary (2-3 sentences in ${selectedLanguage?.name || 'English'})

Focus on accuracy and readability. Respect the original language.`,
        file_urls: imageUrls,
        response_json_schema: {
          type: "object",
          properties: {
            extracted_text: { type: "string" },
            document_type: { type: "string" },
            suggested_title: { type: "string" },
            language: { type: "string" },
            confidence_score: { type: "number" },
            summary: { type: "string" },
            key_points: { 
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setExtractedText(response.extracted_text || '');
      
      // Auto-suggest title if empty
      if (!documentTitle && response.suggested_title) {
        setDocumentTitle(response.suggested_title);
      }
      
      // Auto-detect document type
      if (response.document_type) {
        const detectedType = response.document_type.toLowerCase();
        const validTypes = ['receipt', 'invoice', 'contract', 'medical', 'legal', 'business_card', 'id_card', 'passport', 'whiteboard', 'note', 'other'];
        if (validTypes.includes(detectedType)) {
          setDocumentType(detectedType);
        } else {
          setDocumentType('other'); // Default to 'other' if detected type is not in our list
        }
      }
      
      toast.success(`Text extracted in ${selectedLanguage?.name}! ✨`);
    } catch (error) {
      console.error('Error extracting text:', error);
      toast.error('Failed to extract text');
    } finally {
      setIsExtracting(false);
    }
  };

  const saveDocument = async () => {
    if (scannedPages.length === 0) {
      toast.error('Please scan at least one page');
      return;
    }

    if (!documentTitle.trim()) {
      toast.error('Please enter a document title');
      return;
    }

    setIsProcessing(true);
    try {
      const documentData = {
        title: documentTitle,
        document_type: documentType,
        original_image_urls: scannedPages.map(p => p.original_url),
        processed_image_urls: scannedPages.map(p => p.processed_url),
        extracted_text: extractedText,
        filter_applied: scannedPages[0]?.filter || 'none',
        page_count: scannedPages.length,
        tags: documentTags,
        ocr_language: ocrLanguage // Added ocr_language to documentData
      };

      // Auto-categorize the document
      if (categories.length > 0) {
        const categoryData = await autoCategorizeDocument(documentData, categories);
        if (categoryData) {
          Object.assign(documentData, categoryData);
          toast.success(`Auto-categorized as: ${categoryData.category_name} ✨`);
        }
      }

      const newDoc = await base44.entities.ScannedDocument.create(documentData);

      queryClient.invalidateQueries(['scannedDocuments']);
      
      if (exportAsPDF) {
        // Generate PDF preview and download
        toast.info('Opening PDF preview...');
        setTimeout(() => {
          const printWindow = window.open('', '_blank');
          if (!printWindow) {
            toast.error('Failed to open PDF preview window. Please allow pop-ups.');
            return;
          }
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>${documentTitle}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: white; }
                .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
                .meta { font-size: 14px; color: #6b7280; margin-bottom: 20px; }
                .page-image { max-width: 100%; margin: 20px 0; border: 1px solid #e5e7eb; border-radius: 8px; }
                .extracted-text { background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; white-space: pre-wrap; }
                @media print { .page-break { page-break-before: always; } }
              </style>
            </head>
            <body>
              <h1 class="title">${documentTitle}</h1>
              <div class="meta">
                <strong>Type:</strong> ${documentType} | 
                <strong>Pages:</strong> ${scannedPages.length} | 
                <strong>Created:</strong> ${new Date().toLocaleDateString()}
              </div>
              ${scannedPages.map((page, idx) => `
                <div>
                  <img src="${page.processed_url}" class="page-image" alt="Page ${idx + 1}" />
                  ${idx < scannedPages.length - 1 ? '<div class="page-break"></div>' : ''}
                </div>
              `).join('')}
              ${extractedText ? `
                <div class="extracted-text">
                  <strong>Extracted Text:</strong><br/><br/>
                  ${extractedText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                </div>
              ` : ''}
            </body>
            </html>
          `);
          printWindow.document.close();
          setTimeout(() => {
            if (printWindow.document.readyState === 'complete') {
              printWindow.print();
            } else {
              printWindow.onload = () => printWindow.print();
            }
          }, 500);
        }, 300);
      }

      toast.success('Document saved! 📄');
      
      // Reset form
      setScannedPages([]);
      setDocumentTitle('');
      setDocumentType('other');
      setDocumentTags([]);
      setExtractedText('');
      setExportAsPDF(false);
      setOcrLanguage('eng'); // Reset OCR language
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-white/90 backdrop-blur-xl border-2 border-blue-200 shadow-xl">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Scan className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <span className="text-base sm:text-xl">Advanced Document Scanner</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Professional document scanning with AI tagging, filters, OCR, and PDF export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          
          {/* Scan Options - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={() => {
                setScanningMode('camera');
                startCamera();
              }}
              variant={showCamera ? 'default' : 'outline'}
              className={`w-full sm:flex-1 touch-manipulation min-h-[44px] ${showCamera ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              size="lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Use Camera
            </Button>
            <Button
              onClick={() => {
                stopCamera();
                setScanningMode('upload');
                fileInputRef.current?.click();
              }}
              variant={scanningMode === 'upload' ? 'default' : 'outline'}
              className={`w-full sm:flex-1 touch-manipulation min-h-[44px] ${scanningMode === 'upload' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              size="lg"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Camera View - Mobile Optimized */}
          <AnimatePresence>
            {showCamera && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 sm:space-y-4"
              >
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-h-[400px] sm:max-h-[500px] object-contain"
                  />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                    <Button
                      onClick={capturePhoto}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 rounded-full w-14 h-14 sm:w-16 sm:h-16 touch-manipulation shadow-2xl"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6 sm:w-7 sm:h-7" />
                      )}
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      size="lg"
                      className="rounded-full w-14 h-14 sm:w-16 sm:h-16 touch-manipulation bg-white/90"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <canvas ref={canvasRef} className="hidden" />

          {/* Scanned Pages - Mobile Optimized */}
          {scannedPages.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  Scanned Pages ({scannedPages.length})
                </h3>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="touch-manipulation min-h-[36px]"
                >
                  <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add Page</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {scannedPages.map((page, idx) => (
                  <div key={page.id} className="relative group">
                    <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={page.processed_url}
                        alt={`Page ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-blue-600 text-xs sm:text-sm">Page {idx + 1}</Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Button
                          onClick={() => removePage(page.id)}
                          size="sm"
                          variant="destructive"
                          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation min-h-[36px] min-w-[36px]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Filter Selector - Mobile Optimized */}
                    <div className="mt-2 grid grid-cols-3 sm:flex sm:flex-wrap gap-1">
                      {FILTERS.map(filter => (
                        <Button
                          key={filter.id}
                          onClick={() => applyFilter(page.id, filter.id)}
                          size="sm"
                          variant={page.filter === filter.id ? 'default' : 'outline'}
                          className={`text-xs touch-manipulation min-h-[32px] ${page.filter === filter.id ? 'bg-blue-600' : ''}`}
                        >
                          {filter.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Document Actions - Enhanced with Type and AI Tags */}
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div>
                  <Label className="text-xs sm:text-sm">Document Title</Label>
                  <Input
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="e.g., Receipt - Coffee Shop"
                    className="mt-1 text-sm sm:text-base min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs sm:text-sm">Document Type</Label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="w-full mt-1 p-3 border border-gray-300 rounded-lg text-sm sm:text-base min-h-[44px] bg-white"
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

                  <div>
                    <Label className="text-xs sm:text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4 text-purple-600" />
                      OCR Language
                    </Label>
                    <select
                      value={ocrLanguage}
                      onChange={(e) => setOcrLanguage(e.target.value)}
                      className="w-full mt-1 p-3 border border-gray-300 rounded-lg text-sm sm:text-base min-h-[44px] bg-white"
                    >
                      {OCR_LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select document language for accurate text extraction
                    </p>
                  </div>
                </div>

                {/* AI Tagging Component */}
                <DocumentTagging
                  documentTitle={documentTitle}
                  extractedText={extractedText}
                  documentType={documentType}
                  currentTags={documentTags}
                  onTagsUpdate={setDocumentTags}
                />

                {/* Export as PDF Toggle */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <Label className="text-xs sm:text-sm">Export as PDF after saving</Label>
                  </div>
                  <Switch 
                    checked={exportAsPDF} 
                    onCheckedChange={setExportAsPDF}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-2">
                  <Button
                    onClick={extractText}
                    disabled={isExtracting}
                    variant="outline"
                    className="w-full touch-manipulation min-h-[44px] text-sm"
                  >
                    {isExtracting ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" />Extracting...</>
                    ) : (
                      <><FileText className="w-4 h-4 mr-2" />Extract Text ({OCR_LANGUAGES.find(l => l.code === ocrLanguage)?.flag})</>
                    )}
                  </Button>
                  <Button
                    onClick={saveDocument}
                    disabled={isProcessing || !documentTitle.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 touch-manipulation min-h-[44px] text-sm"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
                    ) : exportAsPDF ? (
                      <><Save className="w-4 h-4 mr-2" />Save & Export PDF</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" />Save Document</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Extracted Text - Mobile Optimized */}
              {extractedText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 sm:p-4 bg-white rounded-lg border-2 border-green-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-green-800 flex items-center gap-2 text-sm sm:text-base">
                      <Sparkles className="w-4 h-4" />
                      Extracted Text
                    </h4>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(extractedText);
                        toast.success('Text copied to clipboard!');
                      }}
                      size="sm"
                      variant="outline"
                      className="touch-manipulation min-h-[36px]"
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border border-gray-200 max-h-48 sm:max-h-60 overflow-y-auto">
                    <pre className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-mono">
                      {extractedText}
                    </pre>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Empty State - Mobile Optimized */}
          {scannedPages.length === 0 && !showCamera && (
            <div className="text-center py-8 sm:py-12 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50">
              <Scan className="w-16 h-16 sm:w-20 sm:h-20 text-blue-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base px-4">Ready to Scan</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                Scan documents, receipts, whiteboards, business cards, and more with professional quality
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-4">
                <Button
                  onClick={startCamera}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto touch-manipulation min-h-[44px]"
                  size="lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Open Camera
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full sm:w-auto touch-manipulation min-h-[44px]"
                  size="lg"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Image
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

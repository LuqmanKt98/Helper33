import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, Loader2, CheckCircle, XCircle, Download, 
  FileText, AlertCircle, Trash2, Play, Image as ImageIcon, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function BatchProcessor({ sourceLang, targetLang, languages }) {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [processedResults, setProcessedResults] = useState([]);
  const [showPreviews, setShowPreviews] = useState(true);

  const handleFileSelect = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    setFiles(selectedFiles);
    setShowPreviews(true);

    // Upload all files
    const uploadPromises = selectedFiles.map(async (file) => {
      try {
        const uploadResponse = await base44.integrations.Core.UploadFile({ file });
        return {
          file,
          url: uploadResponse.file_url,
          status: 'ready',
          translation: null,
          error: null
        };
      } catch (error) {
        return {
          file,
          url: null,
          status: 'error',
          translation: null,
          error: 'Upload failed'
        };
      }
    });

    const uploaded = await Promise.all(uploadPromises);
    setUploadedFiles(uploaded);
    toast.success(`${uploaded.length} files uploaded and ready for translation`);
  };

  const processNextFile = async (fileData) => {
    const sourceLangName = languages.find(l => l.code === sourceLang)?.name;
    const targetLangName = languages.find(l => l.code === targetLang)?.name;

    try {
      // Check if it's an image (OCR needed)
      const isImage = fileData.file.type.startsWith('image/');
      
      let extractedContent = '';
      
      if (isImage) {
        // OCR: Extract text from image first
        const ocrPrompt = `Extract ALL text from this image using OCR. 
Return the complete extracted text exactly as it appears in the image.
Preserve formatting, line breaks, and structure.`;

        extractedContent = await base44.integrations.Core.InvokeLLM({
          prompt: ocrPrompt,
          file_urls: [fileData.url]
        });
      }

      // Translate the document
      const translationPrompt = isImage 
        ? `Translate the following extracted text from ${sourceLangName} to ${targetLangName}.
Preserve formatting and structure.

Extracted text:
${extractedContent}`
        : `Extract all content from this document and translate it from ${sourceLangName} to ${targetLangName}.
Preserve formatting, structure, and meaning.
For images/charts, describe them in ${targetLangName}.`;

      const translation = await base44.integrations.Core.InvokeLLM({
        prompt: translationPrompt,
        file_urls: isImage ? undefined : [fileData.url]
      });

      return {
        ...fileData,
        status: 'completed',
        translation,
        extractedContent: isImage ? extractedContent : null
      };
    } catch (error) {
      console.error('Translation error:', error);
      return {
        ...fileData,
        status: 'error',
        error: error.message || 'Translation failed'
      };
    }
  };

  const startBatchProcessing = async () => {
    if (uploadedFiles.length === 0) return;

    setIsProcessing(true);
    setIsPaused(false);
    setCurrentFileIndex(0);
    setProcessedResults([]);

    for (let i = 0; i < uploadedFiles.length; i++) {
      if (isPaused) break;

      setCurrentFileIndex(i);
      
      const result = await processNextFile(uploadedFiles[i]);
      setProcessedResults(prev => [...prev, result]);

      // Small delay between files
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsProcessing(false);
    toast.success('Batch translation complete!');
  };

  const downloadAllTranslations = () => {
    const completedResults = processedResults.filter(r => r.status === 'completed');
    
    if (completedResults.length === 0) {
      toast.error('No translations to download');
      return;
    }

    completedResults.forEach((result, index) => {
      const filename = `translated_${result.file.name.replace(/\.[^/.]+$/, '')}.txt`;
      const content = `File: ${result.file.name}\n`;
      const fullContent = content + 
        `Source Language: ${languages.find(l => l.code === sourceLang)?.name}\n` +
        `Target Language: ${languages.find(l => l.code === targetLang)?.name}\n` +
        `Translated: ${new Date().toLocaleString()}\n\n` +
        `---\n\n` +
        (result.extractedContent ? `EXTRACTED TEXT (OCR):\n${result.extractedContent}\n\n---\n\n` : '') +
        `TRANSLATION:\n${result.translation}`;

      const blob = new Blob([fullContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      // Delay between downloads
      setTimeout(() => {}, index * 100);
    });

    toast.success(`Downloaded ${completedResults.length} translations!`);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setProcessedResults(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setUploadedFiles([]);
    setProcessedResults([]);
    setCurrentFileIndex(0);
    setIsProcessing(false);
    setIsPaused(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const progress = uploadedFiles.length > 0 
    ? (processedResults.length / uploadedFiles.length) * 100 
    : 0;

  const completedCount = processedResults.filter(r => r.status === 'completed').length;
  const errorCount = processedResults.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50">
        <input
          type="file"
          id="batch-upload"
          multiple
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          className="hidden"
        />
        <label htmlFor="batch-upload" className="cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="space-y-3"
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-gray-800">
                Upload Multiple Documents
              </p>
              <p className="text-sm text-gray-500">
                Select multiple files for batch translation (PDF, Word, Text, Images with OCR)
              </p>
            </div>
            <Button variant="outline" size="lg" className="bg-white">
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
          </motion.div>
        </label>
      </div>

      {/* File Previews */}
      {uploadedFiles.length > 0 && showPreviews && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              Files Ready for Translation ({uploadedFiles.length})
            </h3>
            <div className="flex gap-2">
              {!isProcessing && (
                <>
                  <Button
                    onClick={startBatchProcessing}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Translation
                  </Button>
                  <Button variant="outline" onClick={clearAll}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((fileData, index) => {
              const result = processedResults.find((r, i) => i === index);
              const isCurrentlyProcessing = isProcessing && currentFileIndex === index;
              const isCompleted = result?.status === 'completed';
              const hasError = result?.status === 'error';

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`relative overflow-hidden ${
                    isCurrentlyProcessing ? 'ring-2 ring-blue-500' :
                    isCompleted ? 'ring-2 ring-green-500' :
                    hasError ? 'ring-2 ring-red-500' : ''
                  }`}>
                    <CardContent className="p-4">
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        {isCurrentlyProcessing && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Processing
                          </Badge>
                        )}
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Done
                          </Badge>
                        )}
                        {hasError && (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="pr-20">
                        <div className="flex items-center gap-2 mb-2">
                          {fileData.file.type.startsWith('image/') ? (
                            <ImageIcon className="w-5 h-5 text-blue-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-600" />
                          )}
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {fileData.file.name}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(fileData.file.size)}
                        </p>

                        {/* OCR Badge for Images */}
                        {fileData.file.type.startsWith('image/') && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            OCR Enabled
                          </Badge>
                        )}

                        {/* Error Message */}
                        {hasError && (
                          <div className="mt-2 text-xs text-red-600 flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{result.error}</span>
                          </div>
                        )}
                      </div>

                      {/* Preview Thumbnail for Images */}
                      {fileData.file.type.startsWith('image/') && fileData.url && (
                        <div className="mt-3">
                          <img 
                            src={fileData.url} 
                            alt="Preview" 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Batch Translation Progress</h3>
                <Badge className="bg-blue-100 text-blue-800">
                  {processedResults.length} / {uploadedFiles.length}
                </Badge>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {completedCount} completed, {errorCount} errors
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {processedResults.length > 0 && !isProcessing && (
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Translation Results
              </CardTitle>
              <Button
                onClick={downloadAllTranslations}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All ({completedCount})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {processedResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border-2 ${
                    result.status === 'completed' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {result.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <p className="font-semibold text-gray-900">{result.file.name}</p>
                      </div>

                      {result.extractedContent && (
                        <div className="mb-3 p-3 bg-white rounded border border-blue-200">
                          <p className="text-xs font-semibold text-blue-800 mb-1">
                            📷 OCR Extracted Text:
                          </p>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {result.extractedContent}
                          </p>
                        </div>
                      )}

                      {result.translation && (
                        <div className="p-3 bg-white rounded border border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Translation:</p>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {result.translation}
                          </p>
                        </div>
                      )}

                      {result.error && (
                        <p className="text-sm text-red-600 mt-2">
                          Error: {result.error}
                        </p>
                      )}
                    </div>

                    {result.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const content = (result.extractedContent 
                            ? `EXTRACTED TEXT (OCR):\n${result.extractedContent}\n\n---\n\n` 
                            : '') + `TRANSLATION:\n${result.translation}`;
                          
                          const blob = new Blob([content], { type: 'text/plain' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `translated_${result.file.name}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          a.remove();
                          toast.success('Downloaded!');
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">{uploadedFiles.length}</p>
              <p className="text-sm text-gray-600">Total Files</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{completedCount}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{errorCount}</p>
              <p className="text-sm text-gray-600">Errors</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
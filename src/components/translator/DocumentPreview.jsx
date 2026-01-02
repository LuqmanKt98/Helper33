import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, File, Eye, X, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DocumentPreview({ file, fileUrl, onRemove, onConfirm }) {
  const [previewType, setPreviewType] = useState('unknown');
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    if (!file) return;

    const fileType = file.type;
    if (fileType.startsWith('image/')) {
      setPreviewType('image');
    } else if (fileType === 'application/pdf') {
      setPreviewType('pdf');
    } else if (fileType.includes('text')) {
      setPreviewType('text');
      readTextFile(file);
    } else {
      setPreviewType('document');
    }
  }, [file]);

  const readTextFile = async (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setExtractedText(e.target.result);
    };
    reader.readAsText(file);
  };

  const getFileIcon = () => {
    switch (previewType) {
      case 'image':
        return <Image className="w-8 h-8 text-blue-600" />;
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-600" />;
      case 'text':
        return <FileText className="w-8 h-8 text-green-600" />;
      default:
        return <File className="w-8 h-8 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <Card className="bg-white shadow-lg border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon()}
              <div>
                <CardTitle className="text-lg">{file.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {formatFileSize(file.size)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {file.type || 'Unknown type'}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-gray-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Preview Area */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-auto">
            {previewType === 'image' && fileUrl && (
              <img 
                src={fileUrl} 
                alt="Document preview" 
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            )}

            {previewType === 'pdf' && (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-red-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">PDF Document</p>
                <p className="text-sm text-gray-500">Content will be extracted and translated</p>
              </div>
            )}

            {previewType === 'text' && extractedText && (
              <div className="font-mono text-sm text-gray-700">
                <p className="mb-2 font-semibold text-gray-900">Preview:</p>
                <pre className="whitespace-pre-wrap">
                  {extractedText.substring(0, 500)}
                  {extractedText.length > 500 && '...'}
                </pre>
              </div>
            )}

            {previewType === 'document' && (
              <div className="text-center py-8">
                <File className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Document File</p>
                <p className="text-sm text-gray-500">Ready for translation</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span>Preview ready</span>
            </div>
            <Button
              onClick={onConfirm}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm & Translate
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
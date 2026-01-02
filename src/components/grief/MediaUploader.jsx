import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Image, 
  Video, 
  FileText,
  MessageSquare,
  Music, 
  X, 
  Upload,
  Star,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";

export default function MediaUploader({ 
  type = 'photos',
  items = [], 
  onAdd, 
  onRemove, 
  title, 
  description,
  acceptedFiles,
  coachId = null,
  isNewCoach = false,
  onMediaUpdate = null,
  currentData = null
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemTitle, setNewItemTitle] = useState("");

  const maxRetries = 3;
  const maxFileSize = 50 * 1024 * 1024; // 50MB limit

  const validateFile = (file) => {
    if (!file) {
      throw new Error('No file selected');
    }
    if (file.size > maxFileSize) {
      throw new Error(`File size too large. Maximum size is ${Math.round(maxFileSize / (1024 * 1024))}MB.`);
    }
    
    // Additional validation for audio files
    if (type === 'voice_samples' && !file.type.startsWith('audio/')) {
      throw new Error('Please upload only audio files for voice samples.');
    }
  };

  const uploadWithRetry = async (file, attempt = 1) => {
    try {
      validateFile(file);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    } catch (error) {
      console.error(`Upload attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries && (error.message.includes('timeout') || error.message.includes('500'))) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        return uploadWithRetry(file, attempt + 1);
      }
      
      throw error;
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadError(null);
    setRetryCount(0);
    
    try {
      const file_url = await uploadWithRetry(file);
      
      const newItem = {
        url: file_url,
        description: newItemDescription || "",
        title: newItemTitle || file.name || "Untitled",
        is_primary: items.length === 0 && type === 'photos'
      };
      
      if (onAdd) {
        onAdd(newItem);
      } else if (onMediaUpdate && isNewCoach && currentData) {
        const fieldMap = {
          'photos': 'loved_one_photos',
          'videos': 'loved_one_videos',
          'voice_samples': 'loved_one_voice_samples',
          'documents': 'loved_one_documents',
          'text_messages': 'loved_one_text_messages',
          'songs': 'favorite_songs'
        };
        const fieldName = fieldMap[type] || type;
        const updatedArray = [...(currentData[fieldName] || []), newItem];
        onMediaUpdate(fieldName, updatedArray);
      }
      
      setNewItemDescription("");
      setNewItemTitle("");
      setUploadError(null);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      let errorMessage = "Upload failed. Please try again.";
      
      if (error.message.includes('timeout')) {
        errorMessage = "Upload timed out. The server is experiencing delays. Please try again or use a smaller file.";
      } else if (error.message.includes('size')) {
        errorMessage = error.message;
      } else if (error.message.includes('500')) {
        errorMessage = "Server error. Please wait a moment and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = () => {
    const fileInput = document.getElementById(`${type}-upload`);
    if (fileInput?.files?.[0]) {
      handleFileUpload(fileInput.files[0]);
    }
  };

  const handleRemove = (index) => {
    if (onRemove) {
      onRemove(index);
    } else if (onMediaUpdate && isNewCoach && currentData) {
      const fieldMap = {
        'photos': 'loved_one_photos',
        'videos': 'loved_one_videos',
        'voice_samples': 'loved_one_voice_samples',
        'documents': 'loved_one_documents',
        'text_messages': 'loved_one_text_messages',
        'songs': 'favorite_songs'
      };
      const fieldName = fieldMap[type] || type;
      const updatedArray = (currentData[fieldName] || []).filter((_, i) => i !== index);
      onMediaUpdate(fieldName, updatedArray);
    }
  };

  const displayItems = items.length > 0 ? items : (() => {
    if (!currentData) return [];
    const fieldMap = {
      'photos': 'loved_one_photos',
      'videos': 'loved_one_videos',
      'voice_samples': 'loved_one_voice_samples',
      'documents': 'loved_one_documents',
      'text_messages': 'loved_one_text_messages',
      'songs': 'favorite_songs'
    };
    const fieldName = fieldMap[type] || type;
    return currentData[fieldName] || [];
  })();

  const getIcon = () => {
    switch (type) {
      case 'photos': return Image;
      case 'videos': return Video;
      case 'voice_samples': return Music;
      case 'documents': return FileText;
      case 'text_messages': return MessageSquare;
      default: return Upload;
    }
  };

  const IconComponent = getIcon();
  const typeLabel = (type || 'media').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="p-6 border rounded-xl bg-white/50">
      <div>
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <IconComponent className="w-5 h-5 text-gray-500" />
          {title || typeLabel}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{description || `Upload ${typeLabel.toLowerCase()}`}</p>
      </div>

      {uploadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{uploadError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-2"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
             {(type === 'videos' || type === 'documents') && (
              <Input
                placeholder="Title (e.g., Beach Trip '98, Mom's Recipe)"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
              />
            )}
            <Textarea
              placeholder={`Description or memory...`}
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              className="h-20"
            />
          </div>
          
          <label htmlFor={`${type}-upload`} className="cursor-pointer flex items-center justify-center border-l border-gray-200 pl-4">
            <div className="text-center">
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span>Uploading...</span>
                  <span className="text-xs">This may take a moment</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500 hover:text-blue-600">
                  <Upload className="w-8 h-8" />
                  <span>Click to upload {typeLabel}</span>
                  <span className="text-xs">Max 50MB</span>
                </div>
              )}
            </div>
          </label>
        </div>
        <Input
          type="file"
          accept={acceptedFiles}
          onChange={(e) => handleFileUpload(e.target.files[0])}
          className="hidden"
          id={`${type}-upload`}
          disabled={isUploading}
        />
      </div>

      {type === 'voice_samples' && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-1">Tips for better voice cloning:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Use clear recordings with minimal background noise</li>
            <li>• Include different emotions and speaking styles</li>
            <li>• 5-10 minutes of total audio works best</li>
            <li>• Voicemails and phone recordings often work well</li>
          </ul>
        </div>
      )}

      {displayItems.length > 0 && (
        <div className="mt-4 space-y-3">
          {displayItems.map((item, index) => (
            <div key={index} className="relative bg-white border rounded-lg p-3 flex items-start gap-4">
              {type === 'photos' && (
                <img src={item.url} alt={item.title || 'Photo'} className="w-16 h-16 object-cover rounded-md flex-shrink-0"/>
              )}
              {type === 'text_messages' && (
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0"><MessageSquare className="w-8 h-8 text-gray-400" /></div>
              )}
              {type === 'voice_samples' && (
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0"><Music className="w-8 h-8 text-gray-400" /></div>
              )}
              {type === 'videos' && (
                <video src={item.url} className="w-16 h-16 object-cover rounded-md flex-shrink-0 bg-black" />
              )}
              {type === 'documents' && (
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0"><FileText className="w-8 h-8 text-gray-400" /></div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {item.is_primary && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Star className="w-3 h-3 mr-1" /> Primary</Badge>
                  )}
                  <span className="font-medium text-sm truncate">
                    {item.title || `${typeLabel.slice(0, -1)} ${index + 1}`}
                  </span>
                </div>
                 {type === 'voice_samples' && item.url && (
                    <audio src={item.url} controls className="w-full mt-2 h-8" />
                 )}
                 {item.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                 )}
              </div>

              <button
                onClick={() => handleRemove(index)}
                className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
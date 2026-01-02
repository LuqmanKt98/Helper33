import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { base44 } from '@/api/base44Client';
import { Image, Palette, X, Loader2 } from "lucide-react";

const themes = [
  { id: 'rose', name: 'Soft Rose', colors: 'from-rose-500 to-pink-500', bg: 'from-rose-50 to-pink-50' },
  { id: 'blue', name: 'Calming Blue', colors: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50' },
  { id: 'purple', name: 'Gentle Purple', colors: 'from-purple-500 to-indigo-500', bg: 'from-purple-50 to-indigo-50' },
  { id: 'green', name: 'Peaceful Green', colors: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 to-teal-50' },
  { id: 'warm', name: 'Warm Sunset', colors: 'from-amber-500 to-orange-500', bg: 'from-amber-50 to-orange-50' }
];

export default function ThemeCustomizer({ 
  selectedTheme, 
  onThemeChange, 
  backgroundImage, 
  onBackgroundChange 
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleBackgroundUpload = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      onBackgroundChange(response.file_url);
    } catch (error) {
      console.error("Error uploading background:", error);
    }
    setIsUploading(false);
  };

  return (
    <div className="p-6 border rounded-xl bg-white/50 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Palette className="w-5 h-5 text-gray-500" />
          Color Theme
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedTheme === theme.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-full h-6 rounded bg-gradient-to-r ${theme.colors} mb-2`} />
              <div className="text-xs font-medium text-gray-700">{theme.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Image className="w-5 h-5 text-gray-500" />
          Conversation Background
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Upload a meaningful photo as the background for your conversations.
        </p>
        
        {backgroundImage && (
          <div className="relative mb-4 w-full h-32 bg-gray-100 rounded-lg">
            <img 
              src={backgroundImage} 
              alt="Background"
              className="w-full h-full object-cover rounded-lg border"
            />
            <button
              onClick={() => onBackgroundChange(null)}
              className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <label htmlFor="bg-upload" className="cursor-pointer block w-full p-4 text-center border-2 border-dashed rounded-lg hover:border-gray-400">
           {isUploading ? (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </div>
           ) : (
              <span className="text-gray-600 hover:text-blue-600">Click to upload image</span>
           )}
        </label>
        <Input
          type="file"
          id="bg-upload"
          className="hidden"
          accept="image/*"
          onChange={(e) => handleBackgroundUpload(e.target.files[0])}
          disabled={isUploading}
        />
      </div>
    </div>
  );
}
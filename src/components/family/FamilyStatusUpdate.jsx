import React, { useState } from 'react';
import { FamilyUpdate } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FamilyStatusUpdate({ onUpdate }) {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handlePost = async () => {
    if (!content) return;
    setIsPosting(true);
    try {
      await FamilyUpdate.create({
        content,
        update_type: 'status',
        photo_urls: photoUrls,
      });
      setContent('');
      setPhotoUrls([]);
      onUpdate();
    } catch (error) {
      console.error("Error posting update:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrls(prev => [...prev, file_url]);
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-800">Share an Update</h3>
      <Textarea
        placeholder="What's new with the family?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="h-24"
      />
      {photoUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
              {photoUrls.map((url, i) => (
                  <img key={i} src={url} alt={`upload-preview-${i}`} className="rounded-md object-cover h-24 w-full" />
              ))}
          </div>
      )}
      <div className="flex justify-between items-center">
        <Button asChild variant="ghost" size="icon">
          <label htmlFor="photo-upload">
            <ImagePlus className="h-5 w-5 text-gray-500" />
          </label>
        </Button>
        <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />

        <Button onClick={handlePost} disabled={isPosting || uploading}>
          <Send className="w-4 h-4 mr-2" />
          {isPosting ? 'Posting...' : 'Post Update'}
        </Button>
      </div>
    </div>
  );
}
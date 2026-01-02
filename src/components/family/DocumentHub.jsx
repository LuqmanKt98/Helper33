
import React, { useState } from 'react';
import { FamilyDocument } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

export default function DocumentHub({ documents, onDocumentUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('other');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await FamilyDocument.create({
        name: file.name,
        file_url: file_uri,
        category: category,
      });
      onDocumentUpdate();
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleDownload = async (file_uri) => {
      try {
          const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri });
          window.open(signed_url, '_blank');
      } catch(error) {
          console.error("Error creating signed url", error);
      }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Document Hub</CardTitle>
        <div className="flex items-center gap-2">
            <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                </SelectContent>
            </Select>
            <Button asChild>
                <label htmlFor="file-upload">
                    <Upload className="mr-2 h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload'}
                </label>
            </Button>
        </div>
        <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText />
                <div>
                  <p className="font-semibold">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.category}</p>
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={() => handleDownload(doc.file_url)}>
                <Download className="h-4 w-4"/>
              </Button>
            </div>
          ))}
          {documents.length === 0 && <p className="text-center text-gray-500 py-4">No documents uploaded yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

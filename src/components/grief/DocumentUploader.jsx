import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UploadFile } from "@/integrations/Core";
import { Upload, FileCheck, Loader2, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DocumentUploader({ title, description, documentType, coachId, onUploadSuccess, allowOtherProof = false }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState(documentType);
  const [otherProofDescription, setOtherProofDescription] = useState("");

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    // Validate that other proof has description
    if (selectedDocType === 'other_proof' && !otherProofDescription.trim()) {
      alert("Please describe what type of proof you're uploading.");
      return;
    }
    
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      onUploadSuccess({
          document_type: selectedDocType,
          file_url: file_url,
          support_coach_id: coachId,
          document_description: selectedDocType === 'other_proof' ? otherProofDescription : null
      });
      setUploadedFile({ name: file.name, url: file_url });
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    }
    setIsUploading(false);
  };

  return (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {uploadedFile && <FileCheck className="w-6 h-6 text-green-500" />}
      </div>
      
      {allowOtherProof && !uploadedFile && (
        <div className="mb-4 space-y-3">
          <Label>Document Type</Label>
          <Select value={selectedDocType} onValueChange={setSelectedDocType}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="death_certificate">Death Certificate</SelectItem>
              <SelectItem value="executor_consent">Executor Authorization/Consent</SelectItem>
              <SelectItem value="dobrylife_verification_form">DobryLife Verification Form (signed)</SelectItem>
              <SelectItem value="other_proof">Other Proof of Authority</SelectItem>
            </SelectContent>
          </Select>
          
          {selectedDocType === 'other_proof' && (
            <>
              <Label htmlFor="otherProofDesc">Describe the Proof *</Label>
              <Textarea
                id="otherProofDesc"
                placeholder="E.g., Letter from executor, legal guardian documentation, family consent letter, etc."
                value={otherProofDescription}
                onChange={(e) => setOtherProofDescription(e.target.value)}
                className="h-20"
              />
            </>
          )}
        </div>
      )}
      
      {uploadedFile ? (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <div>
                    <span className="text-sm font-medium text-gray-700 truncate block">{uploadedFile.name}</span>
                    {selectedDocType === 'other_proof' && otherProofDescription && (
                        <span className="text-xs text-gray-500 block">{otherProofDescription}</span>
                    )}
                </div>
            </div>
            <span className="text-xs text-green-600 font-medium">Uploaded</span>
        </div>
      ) : (
        <label htmlFor={`${documentType}-upload`} className="cursor-pointer block">
          <div className="text-center">
            {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    <p className="text-sm text-gray-600">Uploading...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload file</p>
                    <p className="text-xs text-gray-500">(PDF, JPG, or PNG)</p>
                </div>
            )}
          </div>
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="hidden"
            id={`${documentType}-upload`}
            disabled={isUploading || (selectedDocType === 'other_proof' && !otherProofDescription.trim())}
          />
        </label>
      )}
    </div>
  );
}
import React from 'react';
import { toast } from 'sonner';

// File upload security with malware detection
export const validateSecureFileUpload = async (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'audio/mpeg', 'audio/wav'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.mp3', '.wav'],
  } = options;

  // 1. Check file size
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }

  if (file.size === 0) {
    throw new Error('File is empty or corrupted');
  }

  // 2. Check MIME type
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  // 3. Check file extension
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    throw new Error(`File extension ${extension} is not allowed`);
  }

  // 4. Check for double extensions (e.g., .jpg.exe)
  const parts = file.name.split('.');
  if (parts.length > 2) {
    throw new Error('Files with multiple extensions are not allowed');
  }

  // 5. Sanitize filename
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (sanitizedName !== file.name) {
    console.warn('[Security] Filename sanitized:', file.name, '->', sanitizedName);
  }

  // 6. Basic malware signature detection
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Check for executable signatures
    const signatures = {
      exe: [0x4D, 0x5A], // MZ header
      elf: [0x7F, 0x45, 0x4C, 0x46], // ELF header
      mach: [0xCF, 0xFA, 0xED, 0xFE], // Mach-O header
    };

    for (const [type, signature] of Object.entries(signatures)) {
      if (bytesMatch(bytes, signature)) {
        throw new Error(`Detected executable file signature (${type})`);
      }
    }

    // Check for script tags in image files (polyglot attack)
    const text = new TextDecoder().decode(bytes.slice(0, 1024));
    if (file.type.startsWith('image/') && (text.includes('<script') || text.includes('<?php'))) {
      throw new Error('Detected embedded script in image file');
    }

    // Verify image files have proper headers
    if (file.type.startsWith('image/')) {
      if (!verifyImageHeader(bytes, file.type)) {
        throw new Error('Invalid image file header');
      }
    }

    // Verify PDF files
    if (file.type === 'application/pdf') {
      if (!verifyPDFHeader(bytes)) {
        throw new Error('Invalid PDF file header');
      }
    }

  } catch (error) {
    if (error.message.includes('Detected') || error.message.includes('Invalid')) {
      throw error;
    }
    console.warn('[Security] Could not fully analyze file:', error);
  }

  return {
    valid: true,
    sanitizedName,
    file,
  };
};

// Helper: Check if bytes match signature
const bytesMatch = (bytes, signature) => {
  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) return false;
  }
  return true;
};

// Helper: Verify image file headers
const verifyImageHeader = (bytes, mimeType) => {
  const headers = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
  };

  const expectedHeaders = headers[mimeType];
  if (!expectedHeaders) return true; // Unknown type, skip verification

  return expectedHeaders.some(header => bytesMatch(bytes, header));
};

// Helper: Verify PDF header
const verifyPDFHeader = (bytes) => {
  const pdfHeader = [0x25, 0x50, 0x44, 0x46]; // %PDF
  return bytesMatch(bytes, pdfHeader);
};

// React component for secure file upload
export default function SecureFileUpload({ onFileSelect, accept, maxSize, multiple = false }) {
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    try {
      // Validate each file
      const validatedFiles = [];
      
      for (const file of files) {
        try {
          const result = await validateSecureFileUpload(file, {
            maxSize,
            allowedTypes: accept ? accept.split(',').map(t => t.trim()) : undefined,
          });
          validatedFiles.push(result.file);
        } catch (error) {
          toast.error(`${file.name}: ${error.message}`);
          console.error('[Security] File validation failed:', error);
        }
      }

      if (validatedFiles.length > 0) {
        onFileSelect(multiple ? validatedFiles : validatedFiles[0]);
        toast.success(`${validatedFiles.length} file(s) validated and ready for upload`);
      }

    } catch (error) {
      toast.error('File validation error');
      console.error('[Security] File upload error:', error);
    }

    // Clear input
    e.target.value = '';
  };

  return (
    <input
      type="file"
      accept={accept}
      multiple={multiple}
      onChange={handleFileChange}
      className="hidden"
    />
  );
}
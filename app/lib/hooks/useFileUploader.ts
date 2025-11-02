import * as FileSystem from 'expo-file-system';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { v1Router } from '../api/CustomRouter';

interface FileUploaderConfig {
  uri?: string;
  fileName?: string;
  contentType?: string;
  file?: Blob | File;
}

interface UseFileUploaderResult {
  uploadFile: (config: FileUploaderConfig) => Promise<string | null>;
  loading: boolean;
  error: string | null;
  progress: number;
}

// Generate unique string for file names
const getUniqueString = () => {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

export const useFileUploader = (): UseFileUploaderResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(async (config: FileUploaderConfig): Promise<string | null> => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      let fileBlob: Blob;
      let fileName = config.fileName || `file_${getUniqueString()}`;
      let contentType = config.contentType || 'application/octet-stream';

      // Handle different file sources
      if (config.file) {
        // Web file object
        fileBlob = config.file instanceof Blob ? config.file : new Blob([config.file]);
      } else if (config.uri) {
        // Mobile file URI
        if (Platform.OS === 'web') {
          // For web, convert URI to blob
          const response = await fetch(config.uri);
          fileBlob = await response.blob();
        } else {
          // For mobile, read file as base64 and convert to blob
          const fileInfo = await FileSystem.getInfoAsync(config.uri);
          if (!fileInfo.exists) {
            throw new Error('File does not exist');
          }

          const base64 = await FileSystem.readAsStringAsync(config.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Convert base64 to blob
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          fileBlob = new Blob([byteArray], { type: contentType });
        }

        // Extract file extension and generate filename
        const extension = config.uri.split('.').pop() || 'jpg';
        fileName = `${fileName}.${extension}`;
        
        // Determine content type based on extension
        if (!config.contentType) {
          const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
          const pdfExtensions = ['pdf'];
          
          if (imageExtensions.includes(extension.toLowerCase())) {
            contentType = `image/${extension.toLowerCase() === 'jpg' ? 'jpeg' : extension.toLowerCase()}`;
          } else if (pdfExtensions.includes(extension.toLowerCase())) {
            contentType = 'application/pdf';
          }
        }
      } else {
        throw new Error('No file or URI provided');
      }

      setProgress(20);

      // Step 1: Get presigned URL from backend
      console.log('🚀 Requesting presigned URL for:', fileName);
      const presignedResponse = await v1Router.post('master/upload-to-s3', {
        fileName,
        contentType,
      });

      if (presignedResponse.error || !presignedResponse.data) {
        throw new Error(presignedResponse.message || 'Failed to get presigned URL');
      }

      const putUrl = presignedResponse.data;
      setProgress(40);

      // Step 2: Upload file to S3 using presigned URL
      console.log('📤 Uploading file to S3...');
      const uploadResponse = await fetch(putUrl, {
        method: 'PUT',
        body: fileBlob,
        headers: {
          'Content-Type': contentType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed with status ${uploadResponse.status}`);
      }

      setProgress(80);

      // Step 3: Get the final file URL from backend
      console.log('🔗 Getting final file URL...');
      const encodedKey = encodeURIComponent(fileName);
      const fileUrlResponse = await v1Router.get(`master/get-uploaded-file/${encodedKey}`);

      if (fileUrlResponse.error || !fileUrlResponse.data) {
        throw new Error(fileUrlResponse.message || 'Failed to get file URL');
      }

      setProgress(100);
      console.log('✅ File upload successful:', fileUrlResponse.data);
      
      return fileUrlResponse.data as string;

    } catch (err: any) {
      console.error('❌ File upload failed:', err);
      setError(err.message || 'Upload failed');
      return null;
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000); // Reset progress after 1 second
    }
  }, []);

  return { 
    uploadFile, 
    loading, 
    error, 
    progress 
  };
};

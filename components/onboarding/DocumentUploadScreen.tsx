import { useFileUploader } from '@/app/lib/hooks/useFileUploader';
import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, ProgressBar, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaperDialog, useDialog } from '../ui/Dialog/PaperDialog';

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  required: boolean;
  formats: string[];
  maxSize: string;
  tips: string[];
}

interface DocumentUpload {
  uri: string;
  name: string;
  type: string;
  size: number;
  mimeType?: string;
}

interface Props {
  document: DocumentType;
  onDocumentUpload: (document: DocumentUpload) => void;
  onSkip?: () => void;
}

const DocumentUploadScreen: React.FC<Props> = ({ document, onDocumentUpload, onSkip }) => {
  const [uploadedDoc, setUploadedDoc] = useState<DocumentUpload | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadFile, loading: uploaderLoading, error: uploaderError, progress } = useFileUploader();
  const { visible, config, showDialog, hideDialog } = useDialog();

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!cameraPermission.granted || !mediaPermission.granted) {
      showDialog(
        'Permissions Required',
        'Please grant camera and media library permissions to upload documents.'
      );
      return false;
    }
    return true;
  };

  const pickImageFromCamera = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await handleFileSelection(asset);
    }
  };

  const pickImageFromGallery = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await handleFileSelection(asset);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const doc: DocumentUpload = {
          uri: asset.uri,
          name: asset.name || `${document.id}_${Date.now()}.pdf`,
          type: asset.mimeType || 'application/pdf',
          size: asset.size || 0,
          mimeType: asset.mimeType,
        };
        setUploadedDoc(doc);
        // Auto-upload immediately after selection
        await handleRealUpload(asset.uri, doc.name, doc.type, doc);
      }
    } catch (error: any) {
      showDialog('Error', error.message || 'Failed to pick document');
    }
  };

  const handleFileSelection = async (asset: ImagePicker.ImagePickerAsset) => {
    const doc: DocumentUpload = {
      uri: asset.uri,
      name: `${document.id}_${Date.now()}.jpg`,
      type: 'image/jpeg',
      size: asset.fileSize || 0,
      mimeType: 'image/jpeg',
    };
    setUploadedDoc(doc);
    
    // Auto-upload immediately after selection
    await handleRealUpload(asset.uri, doc.name, 'image/jpeg', doc);
  };

  
  const handleRealUpload = async (uri: string, fileName: string, contentType: string, selectedDoc: DocumentUpload) => {
    try {
      setIsUploading(true);
      
      const {data:uploadedUrl, errro , message , status}: any = await uploadFile({
        uri,
        fileName,
        contentType,
      });

      if (uploadedUrl && selectedDoc) {
        const finalDoc: DocumentUpload = {
          ...selectedDoc,
          uri: uploadedUrl, // Update with S3 URL
        };
        onDocumentUpload(finalDoc);
        
        // Clear the uploaded document from screen after successful upload
        setTimeout(() => {
          setUploadedDoc(null);
          showDialog(
            'Upload Successful! 🎉', 
            `${document.name} has been uploaded successfully. You can now upload another document if needed.`
          );
        }, 500);
      }
    } catch (error: any) {
      showDialog('Upload Failed', error.message || 'Failed to upload document');
      // Don't clear the document on error so user can retry
    } finally {
      setIsUploading(false);
    }
  };

  const showImagePickerOptions = () => {
    showDialog(
      'Select Document',
      'Choose how you want to upload your document',
      [
        { label: '📸 Camera', onPress: pickImageFromCamera },
        { label: '🖼️ Gallery', onPress: pickImageFromGallery },
        { label: '📄 Browse Files', onPress: pickDocument },
        { label: 'Cancel', onPress: () => {}, style: 'cancel' },
      ]
    );
  };


  const removeDocument = () => {
    setUploadedDoc(null);
  };

  const renderUploadArea = () => (
    <TouchableOpacity
      style={styles.uploadArea}
      onPress={showImagePickerOptions}
      disabled={isUploading}
    >
      {uploadedDoc ? (
        <View style={styles.documentPreview}>
          {/* Show preview based on file type */}
          {uploadedDoc.mimeType?.startsWith('image/') ? (
            <Image source={{ uri: uploadedDoc.uri }} style={styles.previewImage} />
          ) : uploadedDoc.mimeType === 'application/pdf' ? (
            <View style={styles.pdfPreview}>
              <MaterialCommunityIcons name="file-pdf-box" size={48} color="#FF5252" />
              <Text variant="bodySmall" style={styles.pdfText}>PDF Document</Text>
            </View>
          ) : (
            <View style={styles.pdfPreview}>
              <MaterialCommunityIcons name="file-document" size={48} color={CONSTANTS.theme.primaryColor} />
              <Text variant="bodySmall" style={styles.pdfText}>Document</Text>
            </View>
          )}
          <View style={styles.documentInfo}>
            <Text variant="bodyMedium" style={styles.documentName} numberOfLines={1}>
              {uploadedDoc.name}
            </Text>
            <Text variant="bodySmall" style={styles.documentSize}>
              Size: {(uploadedDoc.size / (1024 * 1024)).toFixed(2)} MB
            </Text>
            {uploadedDoc.mimeType && (
              <Text variant="bodySmall" style={styles.documentType}>
                Type: {uploadedDoc.mimeType}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={removeDocument} style={styles.removeButton}>
            <MaterialCommunityIcons name="close-circle" size={24} color="#FF5252" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.uploadPlaceholder}>
          <MaterialCommunityIcons 
            name={document.icon as any} 
            size={48} 
            color={CONSTANTS.theme.primaryColor} 
          />
          <Text variant="titleMedium" style={styles.uploadTitle}>
            Upload {document.name}
          </Text>
          <Text variant="bodySmall" style={styles.uploadSubtitle}>
            Tap to select from camera or gallery
          </Text>
          <View style={styles.formatInfo}>
            <Text variant="bodySmall" style={styles.formatText}>
              Formats: {document.formats.join(', ')}
            </Text>
            <Text variant="bodySmall" style={styles.formatText}>
              Max size: {document.maxSize}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderTips = () => (
    <Surface style={styles.tipsContainer} elevation={1}>
      <View style={styles.tipsHeader}>
        <MaterialCommunityIcons name="lightbulb-outline" size={20} color={CONSTANTS.theme.primaryColor} />
        <Text variant="titleSmall" style={styles.tipsTitle}>Tips for better upload</Text>
      </View>
      {document.tips.map((tip, index) => (
        <View key={index} style={styles.tipItem}>
          <MaterialCommunityIcons name="check" size={16} color="#4CAF50" />
          <Text variant="bodySmall" style={styles.tipText}>{tip}</Text>
        </View>
      ))}
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons 
            name={document.icon as any} 
            size={32} 
            color={CONSTANTS.theme.primaryColor} 
          />
          <View style={styles.titleText}>
            <Text variant="headlineSmall" style={styles.title}>
              {document.name}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {document.description}
            </Text>
          </View>
          {document.required && (
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Required</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {renderUploadArea()}
        {renderTips()}

        {(isUploading || uploaderLoading) && (
          <View style={styles.uploadingContainer}>
            <ProgressBar 
              progress={progress > 0 ? progress / 100 : undefined}
              indeterminate={progress === 0}
              color={CONSTANTS.theme.primaryColor} 
            />
            <Text style={styles.uploadingText}>
              {progress > 0 ? `Uploading... ${progress}%` : 'Uploading document...'}
            </Text>
            {uploaderError && (
              <Text style={styles.errorText}>Error: {uploaderError}</Text>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <Text style={styles.uploadNote}>
            📤 Files will be uploaded automatically after selection
          </Text>

          {onSkip && !document.required && (
            <Button
              mode="outlined"
              onPress={onSkip}
              disabled={isUploading}
              style={styles.skipButton}
            >
              Skip for now
            </Button>
          )}
        </View>
      </View>
      
      {/* Dialog for alerts */}
      <PaperDialog
        visible={visible}
        onDismiss={hideDialog}
        title={config.title}
        message={config.message}
        actions={config.actions}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    color: '#333',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  requiredBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requiredText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  uploadArea: {
    marginBottom: 24,
  },
  uploadPlaceholder: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  uploadTitle: {
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  uploadSubtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  formatInfo: {
    alignItems: 'center',
  },
  formatText: {
    color: '#999',
    marginBottom: 4,
  },
  documentPreview: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CONSTANTS.theme.primaryColor,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  pdfPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfText: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  documentName: {
    color: '#333',
    fontWeight: '500',
  },
  documentSize: {
    color: '#666',
    marginTop: 4,
  },
  documentType: {
    color: '#999',
    marginTop: 2,
    fontSize: 11,
  },
  removeButton: {
    padding: 4,
  },
  tipsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    color: '#333',
    marginLeft: 8,
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  uploadingContainer: {
    marginBottom: 24,
  },
  uploadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF5252',
    marginTop: 8,
    fontSize: 12,
  },
  actions: {
    gap: 12,
  },
  uploadNote: {
    textAlign: 'center',
    color: '#4CAF50',
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  uploadButton: {
    paddingVertical: 4,
  },
  skipButton: {
    paddingVertical: 4,
  },
});

export default DocumentUploadScreen;

import { CONSTANTS } from '@/app/utils/const';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaperDialog, useDialog } from '../ui/Dialog/PaperDialog';
import DocumentUploadScreen, { DocumentType } from './DocumentUploadScreen';

interface DocumentUpload {
  uri: string;
  name: string;
  type: string;
  size: number;
}

interface UploadedDocument {
  documentType: string;
  upload: DocumentUpload;
  uploadedAt: Date;
}

interface Props {
  onAllDocumentsComplete: (documents: UploadedDocument[]) => void;
}

const REQUIRED_DOCUMENTS: DocumentType[] = [
  {
    id: 'driving_license',
    name: 'Driving License',
    description: 'Upload your valid driving license (front and back)',
    icon: 'card-account-details',
    required: true,
    formats: ['JPG', 'PNG', 'PDF'],
    maxSize: '5MB',
    tips: [
      'Ensure all corners of the license are visible',
      'Image should be clear and readable',
      'Upload both front and back side',
      'License should not be expired',
    ],
  },
  {
    id: 'vehicle_registration',
    name: 'Vehicle Registration (RC)',
    description: 'Upload your vehicle registration certificate',
    icon: 'car-info',
    required: true,
    formats: ['JPG', 'PNG', 'PDF'],
    maxSize: '5MB',
    tips: [
      'RC should be in your name',
      'Document should be clearly visible',
      'Ensure vehicle details are readable',
      'RC should be valid and not expired',
    ],
  },
  {
    id: 'aadhaar_card',
    name: 'Aadhaar Card',
    description: 'Upload your Aadhaar card for identity verification',
    icon: 'card-text',
    required: true,
    formats: ['JPG', 'PNG', 'PDF'],
    maxSize: '5MB',
    tips: [
      'Upload front side of Aadhaar card',
      'Aadhaar number should be visible',
      'Name should match with other documents',
      'Ensure image is not blurred',
    ],
  },
  {
    id: 'pan_card',
    name: 'PAN Card',
    description: 'Upload your PAN card for tax purposes',
    icon: 'credit-card',
    required: true,
    formats: ['JPG', 'PNG', 'PDF'],
    maxSize: '5MB',
    tips: [
      'PAN card should be clearly visible',
      'Name should match with Aadhaar card',
      'PAN number should be readable',
      'Signature should be visible',
    ],
  },
];

const DocumentFlowScreen: React.FC<Props> = ({ onAllDocumentsComplete }) => {
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const { visible, config, showDialog, hideDialog } = useDialog();

  const currentDocument = REQUIRED_DOCUMENTS[currentDocumentIndex];
  const progress = (currentDocumentIndex + 1) / REQUIRED_DOCUMENTS.length;

  const handleDocumentUpload = (upload: DocumentUpload) => {
    const uploadedDoc: UploadedDocument = {
      documentType: currentDocument.id,
      upload,
      uploadedAt: new Date(),
    };

    const newUploadedDocs = [...uploadedDocuments, uploadedDoc];
    setUploadedDocuments(newUploadedDocs);

    // Move to next document or complete
    if (currentDocumentIndex < REQUIRED_DOCUMENTS.length - 1) {
      setCurrentDocumentIndex(currentDocumentIndex + 1);
      showDialog(
        'Document Uploaded!',
        `${currentDocument.name} has been uploaded successfully. Please upload the next document.`
      );
    } else {
      // All documents uploaded
      showDialog(
        'All Documents Uploaded!',
        'All required documents have been uploaded successfully. Your documents will be verified within 24-48 hours.',
        [
          {
            label: 'Continue',
            onPress: () => onAllDocumentsComplete(newUploadedDocs),
          },
        ]
      );
    }
  };

  const handleSkipDocument = () => {
    if (currentDocument.required) {
      showDialog(
        'Required Document',
        'This document is required for account verification. You cannot skip it.'
      );
      return;
    }

    if (currentDocumentIndex < REQUIRED_DOCUMENTS.length - 1) {
      setCurrentDocumentIndex(currentDocumentIndex + 1);
    } else {
      onAllDocumentsComplete(uploadedDocuments);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text variant="titleMedium" style={styles.progressTitle}>
            Document Upload Progress
          </Text>
          <Text variant="bodyMedium" style={styles.progressText}>
            {currentDocumentIndex + 1} of {REQUIRED_DOCUMENTS.length}
          </Text>
        </View>
        <ProgressBar 
          progress={progress} 
          color={CONSTANTS.theme.primaryColor}
          style={styles.progressBar}
        />
      </View>

      <DocumentUploadScreen
        document={currentDocument}
        onDocumentUpload={handleDocumentUpload}
        onSkip={currentDocument.required ? undefined : handleSkipDocument}
      />
      
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
  progressContainer: {
    padding: 24,
    paddingBottom: 0,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: '#333',
    fontWeight: '600',
  },
  progressText: {
    color: CONSTANTS.theme.primaryColor,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  progressSubtitle: {
    color: '#666',
    textAlign: 'center',
  },
});

// Wrap the component to include dialog
const DocumentFlowScreenWrapper: React.FC<Props> = (props) => {
  return (
    <>
      <DocumentFlowScreen {...props} />
    </>
  );
};

export default DocumentFlowScreen;

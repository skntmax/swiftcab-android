import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaperDialog, useDialog } from '../ui/Dialog/PaperDialog';
import StylishBackground from '../ui/StylishBackground';

// Import all onboarding screens
import { CONSTANTS } from '@/app/utils/const';
import LocationStep from '../HomePage/Singup/steps/LocationStep';
import MobileVerificationScreen from '../HomePage/Singup/steps/Step1';
import LoginScreen from '../auth/LoginScreen';
import BankAccountScreen from './BankAccountScreen';
import CitySelectionScreen from './CitySelectionScreen';
import DocumentFlowScreen from './DocumentFlowScreen';
import ProfileInfoScreen from './ProfileInfoScreen';
import VehicleTypeScreen from './VehicleTypeScreen';

type OnboardingStep = 
  | 'location'
  | 'phone_verification'
  | 'login'
  | 'city_selection'
  | 'vehicle_type'
  | 'profile_info'
  | 'documents'
  | 'bank_account'
  | 'complete';

interface City {
  id: string;
  name: string;
  state: string;
  isActive: boolean;
}

interface VehicleType {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  earnings: string;
  requirements: string[];
}

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | '';
  address: string;
  pincode: string;
  emergencyContact: string;
}

interface BankAccountForm {
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  branchName: string;
  accountHolderName: string;
  accountType: 'savings' | 'current' | '';
}

interface UploadedDocument {
  documentType: string;
  upload: {
    uri: string;
    name: string;
    type: string;
    size: number;
  };
  uploadedAt: Date;
}

interface OnboardingData {
  location?: { latitude: number; longitude: number };
  city?: City;
  vehicleType?: VehicleType;
  profile?: ProfileForm;
  documents?: UploadedDocument[];
  bankAccount?: BankAccountForm;
}

const ONBOARDING_STEPS: { step: OnboardingStep; title: string; description: string }[] = [
  { step: 'location', title: 'Location Access', description: 'Enable location services' },
  { step: 'phone_verification', title: 'Phone Verification', description: 'Verify your phone number' },
  { step: 'city_selection', title: 'Choose City', description: 'Select your operating city' },
  { step: 'vehicle_type', title: 'Vehicle Type', description: 'Choose your vehicle' },
  { step: 'profile_info', title: 'Personal Info', description: 'Complete your profile' },
  { step: 'documents', title: 'Documents', description: 'Upload required documents' },
  { step: 'bank_account', title: 'Bank Details', description: 'Add payment information' },
];

const OnboardingFlowScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('location');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [showLogin, setShowLogin] = useState(false);
  const { visible, config, showDialog, hideDialog } = useDialog();
  const router = useRouter();

  const getCurrentStepIndex = () => {
    return ONBOARDING_STEPS.findIndex(step => step.step === currentStep);
  };

  const progress = (getCurrentStepIndex() + 1) / ONBOARDING_STEPS.length;

  const handleLocationGranted = (coords: { latitude: number; longitude: number }) => {
    setOnboardingData(prev => ({ ...prev, location: coords }));
    setCurrentStep('phone_verification');
  };

  const handlePhoneVerified = () => {
    // Show login option or continue with onboarding
    showDialog(
      'Phone Verified!',
      'Would you like to sign in to an existing account or continue with new registration?',
      [
        { label: 'Sign In', onPress: () => setShowLogin(true) },
        { label: 'Continue Registration', onPress: () => setCurrentStep('city_selection') },
      ]
    );

    setCurrentStep('city_selection'); // step 3
  };

  const handleLoginSuccess = () => {
    // If user logs in, skip to main app
    setCurrentStep('complete');
  };

  const handleCitySelected = (city: City) => {
    setOnboardingData(prev => ({ ...prev, city }));
    setCurrentStep('vehicle_type');
  };

  const handleVehicleSelected = (vehicleType: VehicleType) => {
    setOnboardingData(prev => ({ ...prev, vehicleType }));
    setCurrentStep('profile_info');
  };

  const handleProfileComplete = (profile: ProfileForm) => {
    setOnboardingData(prev => ({ ...prev, profile }));
    setCurrentStep('documents');
  };

  const handleDocumentsComplete = (documents: UploadedDocument[]) => {
    setOnboardingData(prev => ({ ...prev, documents }));
    setCurrentStep('bank_account');
  };

  const handleBankAccountComplete = (bankAccount: BankAccountForm) => {
    setOnboardingData(prev => ({ ...prev, bankAccount }));
    
    // Complete onboarding
    showDialog(
      'Welcome to SwiftCab!',
      'Your account has been created successfully. You can start driving once your documents are verified.',
      [
        {
          label: 'Get Started',
          onPress: () => setCurrentStep('complete'),
        },
      ]
    );
  };

  const renderProgressHeader = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text variant="titleMedium" style={styles.progressTitle}>
          {ONBOARDING_STEPS[getCurrentStepIndex()]?.title || 'Setup'}
        </Text>
        <Text variant="bodyMedium" style={styles.progressText}>
          {getCurrentStepIndex() + 1} of {ONBOARDING_STEPS.length}
        </Text>
      </View>
      <ProgressBar 
        progress={progress} 
        color={CONSTANTS.theme.primaryColor}
        style={styles.progressBar}
      />
      <Text variant="bodySmall" style={styles.progressSubtitle}>
        {ONBOARDING_STEPS[getCurrentStepIndex()]?.description || 'Complete your setup'}
      </Text>
    </View>
  );

  // If onboarding is complete, navigate to the main app
  React.useEffect(() => {
    if (currentStep === 'complete') {
      // Navigate after component is mounted
      const timer = setTimeout(() => {
        router.replace('/(drawer)/(tabs)' as any);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, router]);

  if (currentStep === 'complete') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8DC' }}>
        <Text variant="headlineSmall">Redirecting to Dashboard...</Text>
      </View>
    );
  }

  // If showing login screen
  if (showLogin) {
    return (
      <LoginScreen 
        onLoginSuccess={handleLoginSuccess}
        onNavigateToOTP={() => setShowLogin(false)}
      />
    );
  }

  // Render current onboarding step
  return (
    <StylishBackground variant="onboarding">
      <SafeAreaView style={styles.container}>
        {currentStep !== 'location' && renderProgressHeader()}
        
        {currentStep === 'location' && (
          <LocationStep onGranted={handleLocationGranted} />
        )}
        
         {currentStep === 'phone_verification' && (
           <MobileVerificationScreen onVerified={handlePhoneVerified} />
         )}
        
        {currentStep === 'city_selection' && (
          <CitySelectionScreen onCitySelect={handleCitySelected} />
        )}
        
        {currentStep === 'vehicle_type' && (
          <VehicleTypeScreen onVehicleSelect={handleVehicleSelected} />
        )}
        
        {currentStep === 'profile_info' && (
          <ProfileInfoScreen onProfileComplete={handleProfileComplete} />
        )}
        
        {currentStep === 'documents' && (
          <DocumentFlowScreen onAllDocumentsComplete={handleDocumentsComplete} />
        )}
        
        {currentStep === 'bank_account' && (
          <BankAccountScreen onBankInfoComplete={handleBankAccountComplete} />
        )}
      </SafeAreaView>
      
      {/* Dialog for alerts */}
      <PaperDialog
        visible={visible}
        onDismiss={hideDialog}
        title={config.title}
        message={config.message}
        actions={config.actions}
      />
    </StylishBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    padding: 24,
    paddingBottom: 16,
    // backgroundColor: 'white',
    borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0',
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
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  progressSubtitle: {
    color: '#666',
    textAlign: 'center',
  },
});

// Wrap the component to include dialog
const OnboardingFlowScreenWithDialog: React.FC = () => {
  return (
    <>
      <OnboardingFlowScreen />
    </>
  );
};

export default OnboardingFlowScreen;

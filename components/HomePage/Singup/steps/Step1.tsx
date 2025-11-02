import { useDriverLoginMutation, useVerifyOtpMutation } from '@/app/lib/api/authApi';
import { setLastLoginPhone } from '@/app/lib/reducers/auth/authSlice';
import { CONSTANTS } from '@/app/utils/const';
import AppButton from '@/components/ui/Button/Button';
import StylishSignupBackground from '@/components/ui/StylishSignupBackground';
import { TextField } from '@/components/ui/TextField/TextField';
import { PaperDialog, useDialog } from '@/components/ui/Dialog/PaperDialog';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { TextInput as PaperTextInput, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
// Form data interface
interface VerificationForm {
  phoneNumber: string;
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
}

interface Props {
  onVerified?: () => void;
}

const MobileVerificationScreen: React.FC<Props> = ({ onVerified, }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [autoVerify, setAutoVerify] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const dispatch = useDispatch();
  const { visible, config, showDialog, hideDialog } = useDialog();

        
  // RTK Query mutations
  const [driverLogin, { isLoading: isLoginLoading, error: loginError }] = useDriverLoginMutation();
  const [verifyOtp, { isLoading: isOtpLoading, error: otpError }] = useVerifyOtpMutation();

  // OTP input refs for focus management
  const otp1Ref = useRef<any>("");
  const otp2Ref = useRef<any>("");
  const otp3Ref = useRef<any>("");
  const otp4Ref = useRef<any>("");

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<any, any>({
    defaultValues: {
      phoneNumber: '',
      otp1: '',
      otp2: '',
      otp3: '',
      otp4: '',
    },
    mode: 'onChange',
  });


  // Watch OTP values for auto-focus
  const otp1 = watch('otp1');
  const otp2 = watch('otp2');
  const otp3 = watch('otp3');
  const otp4 = watch('otp4');

  // Handle phone number submission
  const handlePhoneSubmit = async (data: VerificationForm) => {
    try {
      const result: any = await driverLogin({
        phone: data.phoneNumber,
        userType: 22 // Driver user type
      }).unwrap();

      if (!result?.error) {
        setPhoneNumber(data.phoneNumber);
        dispatch(setLastLoginPhone(data.phoneNumber));
        setStep('otp');
        showDialog(
          'OTP Sent',
          result?.data,
          [{ label: 'OK', onPress: () => {} }]
        );
      }
    } catch (error: any) {
      showDialog(
        'Login Failed',
        error.data?.message || 'Something went wrong. Please try again.',
        [{ label: 'OK', onPress: () => {} }]
      );
    }
  };

  // Handle OTP verification
  const handleOTPVerify = async (data: VerificationForm) => {
    const otp = `${data.otp1}${data.otp2}${data.otp3}${data.otp4}`;
    
    try {
      const result:any = await verifyOtp({
        otp,
        phone: phoneNumber
      }).unwrap();

      debugger
      if (!result?.error) {
        showDialog(
          'Verification Successful!',
          "you have been succesfully varified",
          [
            {
              label: 'Continue',
              onPress: () => {
                if (onVerified) {
                  onVerified();
                }
              }
            }
          ]
        );
 
      }
    } catch (error: any) {
      showDialog(
        'Verification Failed',
        error.data?.message || 'Invalid OTP. Please try again.',
        [{ label: 'OK', onPress: () => {} }]
      );
    }
  };

  // Handle OTP input change with auto-focus
  const handleOTPChange = (value: string, field: keyof VerificationForm, nextRef?: React.RefObject<TextInput>) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      setValue(field, value);
      
      if (value.length === 1 && nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  // Handle OTP input key press for backspace navigation
  const handleOTPKeyPress = (key: string, field: keyof VerificationForm, prevRef?: React.RefObject<TextInput>) => {
    if (key === 'Backspace' && !watch(field) && prevRef?.current) {
      prevRef.current.focus();
    }
  };

  // Render header illustration
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationBackground}>
          <Image
            source={require('@/assets/images/driver-app.png')}
            style={styles.headerImage}
            resizeMode="contain"
          />
        </View>
      </View>
      
      <Text style={styles.title}>Convenient Rides</Text>
      <Text style={styles.subtitle}>Across 100+ cities in India</Text>
    </View>
  );

  // Render phone input step
  const renderPhoneStep = () => (
    <View style={styles.formContainer}>
      <Text style={styles.stepTitle}>Let's get Started</Text>
      <Text style={styles.stepSubtitle}>Verify your account using OTP</Text>
      
      <View style={styles.phoneInputContainer}>
        <TextField<VerificationForm>
          name="phoneNumber"
          control={control}
          label=""
          placeholder="Enter phone number"
          isPhone
          keyboardType="phone-pad"
          rules={{
            required: 'Phone number is required',
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: 'Please enter a valid 10-digit phone number'
            }
          }}
          style={styles.phoneInput}
          left={
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
            </View>
          }
        />
      </View>

      <AppButton
        label={isLoginLoading ? "Sending OTP..." : "Proceed"}
        onPress={handleSubmit(handlePhoneSubmit)}
        loading={isLoginLoading}
        disabled={isLoginLoading || !watch('phoneNumber')}
        color="#FFD700"
        style={styles.primaryButton}
      />
      
      <Text style={styles.orText}>Or</Text>
      
      <AppButton
        label="Sign in"
        onPress={() => console.log('Sign in pressed')}
        mode="contained"
        color="#FFD700"
        style={styles.primaryButton}
      />
    </View>
  );

  // Render OTP input step
  const renderOTPStep = () => (
    <View style={styles.formContainer}>
      <Text variant="headlineMedium" style={styles.stepTitle}>Enter OTP</Text>
      <Text variant="bodyMedium" style={styles.stepSubtitle}>
        OTP sent to +91 {watch('phoneNumber')}
      </Text>
      
      <View style={styles.otpContainer}>
        <PaperTextInput
          ref={otp1Ref}
          mode="outlined"
          value={otp1}
          onChangeText={(value) => handleOTPChange(value, 'otp1', otp2Ref)}
          onKeyPress={({ nativeEvent }) => handleOTPKeyPress(nativeEvent.key, 'otp1')}
          keyboardType="numeric"
          maxLength={1}
          style={styles.otpInput}
          textAlign="center"
        />
        <PaperTextInput
          ref={otp2Ref}
          mode="outlined"
          value={otp2}
          onChangeText={(value) => handleOTPChange(value, 'otp2', otp3Ref)}
          onKeyPress={({ nativeEvent }) => handleOTPKeyPress(nativeEvent.key, 'otp2', otp1Ref)}
          keyboardType="numeric"
          maxLength={1}
          style={styles.otpInput}
          textAlign="center"
        />
        <PaperTextInput
          ref={otp3Ref}
          mode="outlined"
          value={otp3}
          onChangeText={(value) => handleOTPChange(value, 'otp3', otp4Ref)}
          onKeyPress={({ nativeEvent }) => handleOTPKeyPress(nativeEvent.key, 'otp3', otp2Ref)}
          keyboardType="numeric"
          maxLength={1}
          style={styles.otpInput}
          textAlign="center"
        />
        <PaperTextInput
          ref={otp4Ref}
          mode="outlined"
          value={otp4}
          onChangeText={(value) => handleOTPChange(value, 'otp4')}
          onKeyPress={({ nativeEvent }) => handleOTPKeyPress(nativeEvent.key, 'otp4', otp3Ref)}
          keyboardType="numeric"
          maxLength={1}
          style={styles.otpInput}
          textAlign="center"
        />
      </View>

      <TouchableOpacity 
        style={styles.autoVerifyContainer}
        onPress={() => setAutoVerify(!autoVerify)}
      >
        <View style={[styles.radioButton, autoVerify && styles.radioButtonSelected]}>
          {autoVerify && <View style={styles.radioButtonInner} />}
        </View>
        <Text style={styles.autoVerifyText}>Auto Verify</Text>
      </TouchableOpacity>

      <AppButton
        label={isOtpLoading ? "Verifying..." : "Proceed"}
        onPress={handleSubmit(handleOTPVerify)}
        loading={isOtpLoading}
        disabled={isOtpLoading || !otp1 || !otp2 || !otp3 || !otp4}
        color="#FFD700"
        style={styles.primaryButton}
      />
      
      <Text style={styles.orText}>Or</Text>
      
      <AppButton
        label="Sign in"
        onPress={() => console.log('Sign in pressed')}
        mode="contained"
        color="#FFD700"
        style={styles.primaryButton}
      />
      
      <TouchableOpacity onPress={() => setStep('phone')}>
        <Text style={styles.backButton}>← Back to phone number</Text>
      </TouchableOpacity>
    </View>
  );

  // Render terms and conditions
  const renderTerms = () => (
    <View style={styles.termsContainer}>
      <Text style={styles.termsText}>
        By continuing you agree to our{' '}
        <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
        <Text style={styles.termsLink}>Privacy Policy</Text>
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StylishSignupBackground variant="auth">
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {step === 'phone' ? renderPhoneStep() : renderOTPStep()}
        {renderTerms()}
      
      </ScrollView>
      </StylishSignupBackground>
      
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
    backgroundColor: '#FFF8DC', // Light cream background
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  illustrationContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationBackground: {
    width: '90%',
    height: '100%',
    backgroundColor: '#F5E6A8',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  // Simplified illustration elements
  scooterContainer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  phoneInputContainer: {
    marginBottom: 30,
  },
  phoneInput: {
    backgroundColor: '#FFF',
    borderRadius: 50,
  },
  countryCode: {
    paddingLeft: 15,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 60,
    height: 60,
    backgroundColor: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  autoVerifyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingLeft: 10,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: CONSTANTS.theme.primaryColor,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CONSTANTS.theme.primaryColor,
  },
  autoVerifyText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: CONSTANTS.theme.primaryColor,
    borderRadius: 25,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    marginVertical: 15,
  },
  backButton: {
    textAlign: 'center',
    fontSize: 16,
    color: '#2196F3',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
  termsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
});

export default MobileVerificationScreen;
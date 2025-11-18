import { useDriverLoginMutation, useVerifyOtpMutation } from '@/app/lib/api/authApi';
import { setLastLoginPhone } from '@/app/lib/reducers/auth/authSlice';
import AppButton from '@/components/ui/Button/Button';
import { PaperDialog, useDialog } from '@/components/ui/Dialog/PaperDialog';
import { TextField } from '@/components/ui/TextField/TextField';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { TextInput as PaperTextInput, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import {
  formatPhoneNumber,
  getCompleteOTP,
  validateCompleteOTP,
  verificationFormSchema
} from './validationSchema';
// Form data interface
export interface VerificationForm {
  phoneNumber: string;
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
}

interface Props {
  onVerified?: () => void;
  showLoginPage?: () => void;
}

// Theme colors
const THEME = {
  background: '#000000',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  accent: '#00D4FF', // Modern cyan blue
  accentDark: '#00A8CC',
  border: '#333333',
  borderLight: '#404040',
  shadow: 'rgba(0, 212, 255, 0.1)',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MobileVerificationScreen: React.FC<Props> = ({ onVerified, showLoginPage }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [autoVerify, setAutoVerify] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const dispatch = useDispatch();
  const { visible, config, showDialog, hideDialog } = useDialog();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
        
  // RTK Query mutations
  const [driverLogin, { isLoading: isLoginLoading, error: loginError }] = useDriverLoginMutation();
  const [verifyOtp, { isLoading: isOtpLoading, error: otpError }] = useVerifyOtpMutation();

  // OTP input refs for focus management
  const otp1Ref = useRef<TextInput>(null);
  const otp2Ref = useRef<TextInput>(null);
  const otp3Ref = useRef<TextInput>(null);
  const otp4Ref = useRef<TextInput>(null);

  // Animate on mount and step change
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<VerificationForm>({
    defaultValues: {
      phoneNumber: '',
      otp1: '',
      otp2: '',
      otp3: '',
      otp4: '',
    },
    mode: 'onChange',
    resolver: undefined, // Using inline validation rules instead of resolver
  });


  // Watch OTP values for auto-focus
  const otp1 = watch('otp1');
  const otp2 = watch('otp2');
  const otp3 = watch('otp3');
  const otp4 = watch('otp4');

  // Button press animation with haptic feedback
  const handleButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle phone number submission
  const handlePhoneSubmit = async (data: VerificationForm) => {
    handleButtonPress();
    
    // Format phone number before submission
    const formattedPhone = formatPhoneNumber(data.phoneNumber);
    
    try {
      const result: any = await driverLogin({
        phone: formattedPhone,
        userType: 22 // Driver user type
      }).unwrap();

      if (!result?.error) {
        setPhoneNumber(formattedPhone);
        dispatch(setLastLoginPhone(formattedPhone));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStep('otp');
        showDialog(
          'OTP Sent',
          result?.data,
          [{ label: 'OK', onPress: () => {} }]
        );
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showDialog(
        'Login Failed',
        error.data?.message || 'Something went wrong. Please try again.',
        [{ label: 'OK', onPress: () => {} }]
      );
    }
  };

  // Handle OTP verification
  const handleOTPVerify = async (data: VerificationForm) => {
    handleButtonPress();
    
    // Validate complete OTP before submission
    if (!validateCompleteOTP(data.otp1, data.otp2, data.otp3, data.otp4)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showDialog(
        'Invalid OTP',
        'Please enter all 4 OTP digits',
        [{ label: 'OK', onPress: () => {} }]
      );
      return;
    }
    
    const otp = getCompleteOTP(data.otp1, data.otp2, data.otp3, data.otp4);
    
    try {
      const result:any = await verifyOtp({
        otp,
        phone: phoneNumber
      }).unwrap();

      if (!result?.error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showDialog(
          'Verification Successful!',
          "You have been successfully verified",
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showDialog(
        'Verification Failed',
        error.data?.message || 'Invalid OTP. Please try again.',
        [{ label: 'OK', onPress: () => {} }]
      );
    }
  };

  // Handle OTP input change with auto-focus
  const handleOTPChange = (value: string, field: keyof VerificationForm, nextRef?: React.RefObject<TextInput | null>) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      setValue(field, value);
      
      if (value.length === 1 && nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  // Handle OTP input key press for backspace navigation
  const handleOTPKeyPress = (key: string, field: keyof VerificationForm, prevRef?: React.RefObject<TextInput | null>) => {
    if (key === 'Backspace' && !watch(field) && prevRef?.current) {
      prevRef.current.focus();
    }
  };

  // Render header illustration
  // const renderHeader = () => (
  //   <Animated.View 
  //     style={[
  //       styles.headerContainer,
  //       {
  //         opacity: fadeAnim,
  //         transform: [{ translateY: slideAnim }],
  //       },
  //     ]}
  //   >
  //     <View style={styles.illustrationContainer}>
  //       <View style={styles.illustrationBackground}>
  //         <Image
  //           source={require('@/assets/images/driver-app.png')}
  //           style={styles.headerImage}
  //           resizeMode="contain"
  //         />
  //       </View>
  //     </View>
      
  //     <Text style={styles.title}>Convenient Rides</Text>
  //     <Text style={styles.subtitle}>Across 100+ cities in India</Text>
  //   </Animated.View>
  // );

  // Render phone input step
  const renderPhoneStep = () => (
    <Animated.View 
      style={[
        styles.formContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.stepTitle}>Let's get Started</Text>
      <Text style={styles.stepSubtitle}>Verify your account using OTP</Text>
      
      <View style={styles.phoneInputContainer}>
        <TextField<VerificationForm>
          name="phoneNumber"
          control={control}
          label=""
          placeholder="Enter phone number"
          placeholderTextColor={THEME.textTertiary}
          isPhone
          keyboardType="phone-pad"
          rules={verificationFormSchema.phoneNumber}
          style={styles.phoneInput}
          left={
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
            </View>
          }
        />
      </View>

      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <AppButton
          label={isLoginLoading ? "Sending OTP..." : "Proceed"}
          onPress={handleSubmit(handlePhoneSubmit)}
          loading={isLoginLoading}
          disabled={isLoginLoading || !watch('phoneNumber')}
          color={THEME.accent}
          style={styles.primaryButton}
        />
      </Animated.View>
      
      <Text style={styles.orText}>Or</Text>
      
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <AppButton
          label="Sign in"
          onPress={() => {
            handleButtonPress();
            showLoginPage?.();
          }}
          mode="outlined"
          color={THEME.accent}
          style={styles.secondaryButton}
        />
      </Animated.View>
    </Animated.View>
  );

  // Render OTP input step
  const renderOTPStep = () => (
    <Animated.View 
      style={[
        styles.formContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
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
          textColor={THEME.text}
          outlineColor={THEME.border}
          activeOutlineColor={THEME.accent}
          contentStyle={styles.otpInputContent}
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
          textColor={THEME.text}
          outlineColor={THEME.border}
          activeOutlineColor={THEME.accent}
          contentStyle={styles.otpInputContent}
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
          textColor={THEME.text}
          outlineColor={THEME.border}
          activeOutlineColor={THEME.accent}
          contentStyle={styles.otpInputContent}
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
          textColor={THEME.text}
          outlineColor={THEME.border}
          activeOutlineColor={THEME.accent}
          contentStyle={styles.otpInputContent}
        />
      </View>

      <TouchableOpacity 
        style={styles.autoVerifyContainer}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setAutoVerify(!autoVerify);
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.radioButton, autoVerify && styles.radioButtonSelected]}>
          {autoVerify && <View style={styles.radioButtonInner} />}
        </View>
        <Text style={styles.autoVerifyText}>Auto Verify</Text>
      </TouchableOpacity>

      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <AppButton
          label={isOtpLoading ? "Verifying..." : "Proceed"}
          onPress={handleSubmit(handleOTPVerify)}
          loading={isOtpLoading}
          disabled={isOtpLoading || !validateCompleteOTP(otp1, otp2, otp3, otp4)}
          color={THEME.accent}
          style={styles.primaryButton}
        />
      </Animated.View>
      
      <Text style={styles.orText}>Or</Text>
      
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <AppButton
          label="Sign in"
          onPress={() => {
            handleButtonPress();
            showLoginPage?.();
          }}
          mode="outlined"
          color={THEME.accent}
          style={styles.secondaryButton}
        />
      </Animated.View>
      
      <TouchableOpacity 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setStep('phone');
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.backButton}>← Back to phone number</Text>
      </TouchableOpacity>
    </Animated.View>
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
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* {renderHeader()} */}
        {step === 'phone' ? renderPhoneStep() : renderOTPStep()}
        {renderTerms()}
      </ScrollView>
      
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
    backgroundColor: THEME.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  illustrationContainer: {
    width: '100%',
    height: 200,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationBackground: {
    width: '90%',
    height: '100%',
    backgroundColor: THEME.surface,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.border,
    ...Platform.select({
      ios: {
        shadowColor: THEME.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
    fontWeight: '400',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 4,
  },
  stepTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 12,
    letterSpacing: -0.8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
    marginBottom: 32,
    fontWeight: '400',
  },
  phoneInputContainer: {
    marginBottom: 32,
  },
  phoneInput: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    ...Platform.select({
      ios: {
        shadowColor: THEME.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  countryCode: {
    paddingLeft: 16,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    color: THEME.text,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
    gap: 16,
  },
  otpInput: {
    width: 72,
    height: 72,
    backgroundColor: THEME.surface,
    fontSize: 28,
    fontWeight: '700',
    borderRadius: 16,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: THEME.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  otpInputContent: {
    backgroundColor: THEME.surface,
  },
  autoVerifyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingLeft: 4,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.surface,
  },
  radioButtonSelected: {
    borderColor: THEME.accent,
    backgroundColor: THEME.surface,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.accent,
  },
  autoVerifyText: {
    fontSize: 16,
    color: THEME.text,
    fontWeight: '500',
  },
  primaryButton: {
    borderRadius: 16,
    marginVertical: 12,
    paddingVertical: 4,
    ...Platform.select({
      ios: {
        shadowColor: THEME.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  secondaryButton: {
    borderRadius: 16,
    marginVertical: 12,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: THEME.accent,
    ...Platform.select({
      ios: {
        shadowColor: THEME.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    color: THEME.textTertiary,
    marginVertical: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  backButton: {
    textAlign: 'center',
    fontSize: 16,
    color: THEME.accent,
    marginTop: 24,
    fontWeight: '500',
  },
  termsContainer: {
    paddingVertical: 24,
    paddingHorizontal: 12,
    marginTop: 20,
  },
  termsText: {
    fontSize: 12,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '400',
  },
  termsLink: {
    color: THEME.accent,
    fontWeight: '500',
  },
});

export default MobileVerificationScreen;
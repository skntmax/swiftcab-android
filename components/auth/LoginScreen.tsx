import { useDriverLoginMutation } from '@/app/lib/api';
import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Surface, TextInput, Text, HelperText, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import StylishBackground from '../ui/StylishBackground';
import { PaperDialog, useDialog } from '../ui/Dialog/PaperDialog';

interface LoginForm {
  email: string;
  password: string;
}

interface Props {
  onLoginSuccess?: () => void;
  onNavigateToOTP?: () => void;
}

const LoginScreen: React.FC<Props> = ({ onLoginSuccess, onNavigateToOTP }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [driverLogin, { isLoading }] = useDriverLoginMutation();
  const { visible, config, showDialog, hideDialog } = useDialog();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleEmailLogin = async (data: LoginForm) => {
    try {
      // For now, simulate email login - you can implement this endpoint later
      showDialog(
        'Email Login',
        'Email login will be implemented. Use OTP login for now.',
        [
          { label: 'Use OTP', onPress: () => onNavigateToOTP?.() },
          { label: 'Cancel', onPress: () => {}, style: 'cancel' }
        ]
      );
    } catch (error) {
      showDialog('Login Failed', 'Invalid credentials');
    }
  };

  const handleFacebookLogin = () => {
    showDialog('Facebook Login', 'Facebook login will be implemented soon.');
  };

  const handleGoogleLogin = () => {
    showDialog('Google Login', 'Google login will be implemented soon.');
  };

  const handleOTPLogin = () => {
    if (onNavigateToOTP) {
      onNavigateToOTP();
    }
  };

  const handleForgotPassword = () => {
    showDialog('Forgot Password', 'Password reset will be implemented soon.');
  };

  const handleSignUp = () => {
    showDialog('Sign Up', 'New users can register using OTP verification.');
  };

  return (
    <StylishBackground variant="auth">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.title}>Login/Signup</Text>
          </View>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="car-multiple" size={48} color="#333" />
            </View>
            <Text style={styles.logoText}>swiftcab</Text>
            <Text style={styles.tagline}>Fast. Reliable. Ride Smart.</Text>
            <Text style={styles.subtitle}>to continue to Swiftcab</Text>
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialSection}>
            {/* Facebook Login */}
            <TouchableOpacity style={styles.facebookButton} onPress={handleFacebookLogin}>
              <MaterialCommunityIcons name="facebook" size={20} color="#1877F2" />
              <Text style={styles.facebookButtonText}>Sign in with Facebook</Text>
            </TouchableOpacity>

            {/* Google Login */}
            <Surface style={styles.googleButton} elevation={1}>
              <TouchableOpacity style={styles.googleButtonContent} onPress={handleGoogleLogin}>
                <View style={styles.googleProfile}>
                  <MaterialCommunityIcons name="google" size={20} color="#4285F4" />
                  <Text style={styles.googleEmail}>Sign in as guest</Text>
                </View>
                <MaterialCommunityIcons name="google" size={20} color="#4285F4" />
              </TouchableOpacity>
            </Surface>

            {/* OTP Login Button */}
            <TouchableOpacity style={styles.otpButton} onPress={handleOTPLogin}>
              <MaterialCommunityIcons name="cellphone-message" size={20} color="white" />
              <Text style={styles.otpButtonText}>Login with OTP</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>or</Text>
          </View>

          {/* Email/Password Form */}
          <View style={styles.formSection}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      mode="outlined"
                      label="Email address"
                      placeholder="Enter your email"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      error={!!errors.email}
                      left={<TextInput.Icon icon="email" />}
                      style={styles.textInput}
                    />
                    <HelperText type="error" visible={!!errors.email}>
                      {errors.email?.message}
                    </HelperText>
                  </>
                )}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      mode="outlined"
                      label="Password"
                      placeholder="Enter your password"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      error={!!errors.password}
                      left={<TextInput.Icon icon="lock" />}
                      right={
                        <TextInput.Icon
                          icon={showPassword ? 'eye-off' : 'eye'}
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                      style={styles.textInput}
                    />
                    <HelperText type="error" visible={!!errors.password}>
                      {errors.password?.message}
                    </HelperText>
                  </>
                )}
              />
            </View>

            {/* Continue Button */}
            <TouchableOpacity style={styles.continueButton} onPress={handleSubmit(handleEmailLogin)}>
              <LinearGradient
                colors={['#ED8902', '#FF9F1C']}
                style={styles.continueButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <MaterialCommunityIcons name="loading" size={20} color="white" />
                ) : (
                  <Text style={styles.continueButtonText}>Continue</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer Links */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>
                Forgot Password? <Text style={styles.linkText}>Click here</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpText}>
                new user ? <Text style={styles.linkText}>Sign up here</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  socialSection: {
    marginBottom: 30,
  },
  facebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  facebookButtonText: {
    fontSize: 16,
    color: '#1877F2',
    fontWeight: '500',
    marginLeft: 8,
  },
  googleButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  googleProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleEmail: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  otpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  otpButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  formSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
  },
  continueButton: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  continueButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  footer: {
    alignItems: 'center',
    gap: 16,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#666',
  },
  signUpText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    color: CONSTANTS.theme.primaryColor,
    fontWeight: '500',
  },
});

export default LoginScreen;
import { useEmailLoginMutation, useLoginByOAuthMutation } from '@/app/lib/api';
import { setCredentials } from '@/app/lib/reducers/auth/authSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import AppButton from '../ui/Button/Button';
import { PaperDialog, useDialog } from '../ui/Dialog/PaperDialog';
import ParticlesBackground from '../ui/ParticlesBackground';

// Theme colors - White & Black
const THEME = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  borderDark: '#CCCCCC',
  accent: '#000000',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LoginForm {
  emailOrUsername: string;
  password: string;
}

interface Props {
  onLoginSuccess?: () => void;
  onNavigateToSignup?: () => void;
}

const LoginScreen: React.FC<Props> = ({ onLoginSuccess, onNavigateToSignup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailLogin, { isLoading, isSuccess }] = useEmailLoginMutation();
  const [loginByOAuth, { isLoading: isOAuthLoading }] = useLoginByOAuthMutation();
  const { visible, config, showDialog, hideDialog } = useDialog();
  const dispatch = useDispatch();
  const buttonScale = React.useRef(new Animated.Value(1)).current;
  const emailInputRef = useRef<any>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
    mode: 'onChange',
  });

  // Redirect to home page after successful login
  useEffect(() => {
    if (isSuccess) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        router.replace('/(drawer)/(tabs)');
      }
    }
  }, [isSuccess, onLoginSuccess]);

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

  const handleEmailLogin = async (data: LoginForm) => {
    handleButtonPress();
    
    // FOR TESTING: Skip API and go directly to home
    router.replace('/(drawer)/(tabs)');
  };

  const handleFacebookLogin = () => {
    handleButtonPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showDialog('Facebook Login', 'Facebook login will be implemented soon.', [
      { label: 'OK', onPress: () => { } }
    ]);
  };

  const handleEmailLoginButton = () => {
    handleButtonPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Focus on email input
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
  };

  const handleGoogleLogin = async () => {
    handleButtonPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // For Google OAuth, we need to get the token from Google first
      // This is a placeholder - you'll need to integrate expo-auth-session
      // For now, show a dialog explaining the integration needed
      showDialog(
        'Google Login',
        'Google OAuth integration requires expo-auth-session package. Please install it and configure Google OAuth credentials.',
        [
          { label: 'OK', onPress: () => { } }
        ]
      );

      // TODO: Implement actual Google OAuth flow
      // Example flow:
      // 1. Get Google ID token using expo-auth-session
      // 2. Call loginByOAuth with the token
      // 3. Save credentials and redirect

    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage = err?.data?.message || err?.message || 'Google login failed. Please try again.';
      showDialog('Google Login Failed', errorMessage, [
        { label: 'OK', onPress: () => { } }
      ]);
    }
  };

  // Helper function to handle Google OAuth token (to be called after getting token from Google)
  const handleGoogleToken = async (googleToken: string) => {
    try {
      const result = await loginByOAuth({
        token: googleToken,
        trafficBy: 'GOOGLE',
        userType: 22, // Driver user type for login
      }).unwrap();

      if (!result?.error && result.data) {
        dispatch(setCredentials({
          token: result.data.token,
          user: {
            username: result.data.usersObj.username,
            firstName: result.data.usersObj.firstName || '',
            lastName: result.data.usersObj.lastName || '',
            avatar: result.data.usersObj.avatar || null,
            roleTypeName: result.data.usersObj.roleTypeName || 'driver',
          },
        }));

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showDialog('Login Successful', 'Welcome back!', [
          {
            label: 'OK', onPress: () => {
              if (onLoginSuccess) {
                onLoginSuccess();
              } else {
                router.replace('/(drawer)/(tabs)');
              }
            }
          }
        ]);
      }
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage = err?.data?.message || err?.message || 'Google login failed. Please try again.';
      showDialog('Login Failed', errorMessage, [
        { label: 'OK', onPress: () => { } }
      ]);
    }
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showDialog('Forgot Password', 'Password reset will be implemented soon.', [
      { label: 'OK', onPress: () => { } }
    ]);
  };

  const handleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onNavigateToSignup) {
      onNavigateToSignup();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/testBG.png')}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.5 }}
        resizeMode="cover"
      >
        <ParticlesBackground />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
        {/* Top Section - Social Login Buttons */}
        <View style={styles.topSection}>
          <Text style={styles.sectionTitle}>Login</Text>

          {/* Facebook Login Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleFacebookLogin}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="facebook" size={20} color="#1877F2" />
              <Text style={styles.socialButtonText}>Login with Facebook</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Email Login Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.socialButton, styles.emailButton]}
              onPress={handleEmailLoginButton}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="email" size={20} color={THEME.text} />
              <Text style={[styles.socialButtonText, styles.emailButtonText]}>Login with Email</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Google Login Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="google" size={20} color="#4285F4" />
              <Text style={[styles.socialButtonText, styles.googleButtonText]}>Login with Google</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Bottom Section - Email/Password Form */}
        <View style={styles.bottomSection}>
          {/* Email/Username Input */}
          <View style={styles.inputGroup}>
            <Controller
              control={control}
              name="emailOrUsername"
              rules={{
                required: 'Email or username is required',
                validate: (value) => {
                  if (!value.trim()) {
                    return 'Email or username cannot be empty';
                  }
                  return true;
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    ref={emailInputRef}
                    mode="outlined"
                    label="Email or Username"
                    placeholder="Enter email or username"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    error={!!errors.emailOrUsername}
                    style={styles.textInput}
                    contentStyle={styles.textInputContent}
                    outlineColor={THEME.border}
                    activeOutlineColor={THEME.accent}
                    textColor={THEME.text}
                    placeholderTextColor={THEME.textTertiary}
                    left={<TextInput.Icon icon="account" color={THEME.textSecondary} />}
                  />
                  <HelperText type="error" visible={!!errors.emailOrUsername} style={styles.helperText}>
                    {errors.emailOrUsername?.message}
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
                  value: 4,
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
                    style={styles.textInput}
                    contentStyle={styles.textInputContent}
                    outlineColor={THEME.border}
                    activeOutlineColor={THEME.accent}
                    textColor={THEME.text}
                    placeholderTextColor={THEME.textTertiary}
                    left={<TextInput.Icon icon="lock" color={THEME.textSecondary} />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        color={THEME.textSecondary}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />
                  <HelperText type="error" visible={!!errors.password} style={styles.helperText}>
                    {errors.password?.message}
                  </HelperText>
                </>
              )}
            />
          </View>

          {/* Continue Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <AppButton
              label={isLoading ? "Logging in..." : "Continue"}
              onPress={handleSubmit(handleEmailLogin)}
              loading={isLoading}
              disabled={isLoading}
              color={THEME.accent}
              style={styles.continueButton}
            />
          </Animated.View>

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPasswordContainer}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* New User Signup */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>New user? </Text>
            <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
              <Text style={styles.signupLink}>Sign up here</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </ImageBackground>

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
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 40,
  },
  topSection: {
    marginTop: 0,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    ...Platform.select({
      ios: {
        shadowColor: THEME.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emailButton: {
    backgroundColor: THEME.text,
    borderColor: THEME.text,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1877F2',
    marginLeft: 12,
  },
  emailButtonText: {
    color: THEME.background,
  },
  googleButton: {
    backgroundColor: THEME.surface,
    borderColor: THEME.border,
  },
  googleButtonText: {
    color: '#4285F4',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  bottomSection: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: THEME.background,
  },
  textInputContent: {
    backgroundColor: THEME.background,
  },
  helperText: {
    marginTop: 4,
    fontSize: 12,
  },
  continueButton: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
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
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signupText: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  signupLink: {
    fontSize: 14,
    color: THEME.text,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;

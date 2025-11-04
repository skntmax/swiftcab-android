/**
 * New Login Screen - Matching Web Portal Design
 * Beautiful split-screen layout with animations
 */

import { useEmailLoginMutation } from '@/app/lib/api';
import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isLargeScreen = SCREEN_WIDTH >= 1024;

interface LoginForm {
  emailOrUsername: string;
  password: string;
}

// Animated Particles Background Component
const ParticleBackground = () => {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <View style={styles.particleContainer}>
      {particles.map((i) => {
        const animValue = new Animated.Value(0);
        
        Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 3000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 3000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();

        const translateX = animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, (Math.random() - 0.5) * 100],
        });

        const translateY = animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, (Math.random() - 0.5) * 100],
        });

        const opacity = animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.3, 0.8, 0.3],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: [{ translateX }, { translateY }],
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const NewLoginScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [emailLogin, { isLoading, isSuccess }] = useEmailLoginMutation();

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<LoginForm>({
    mode: 'onChange',
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isSuccess) {
      router.replace('/(drawer)/(tabs)');
    }
  }, [isSuccess]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await emailLogin({
        emailOrUsername: data.emailOrUsername,
        password: data.password,
        userType: 22,
      }).unwrap();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const renderLeftPanel = () => (
    <View style={styles.leftPanel}>
      {/* Header */}
      <View style={styles.leftHeader}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#0ea5e9', '#0284c7']}
            style={styles.logoGradient}
          >
            <MaterialCommunityIcons name="car" size={28} color="white" />
          </LinearGradient>
          <View>
            <Text style={styles.logoText}>
              Swift<Text style={styles.logoAccent}>Cab</Text>
            </Text>
            <Text style={styles.logoSubtext}>.in</Text>
          </View>
        </View>
      </View>

      {/* Form Content */}
      <ScrollView 
        contentContainerStyle={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formInner}>
          {/* Toggle Buttons */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
                LOGIN
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
                SIGNUP
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {isLogin ? 'Pilot Dashboard' : 'Join SwiftCab'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Access your account to continue' : 'Create your pilot account today'}
            </Text>
          </View>

          {/* Form */}
          {isLogin && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email or Username</Text>
                <Controller
                  control={control}
                  name="emailOrUsername"
                  rules={{ required: 'Email or username is required' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      mode="outlined"
                      placeholder="Enter your email or username"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      autoCapitalize="none"
                      error={!!errors.emailOrUsername}
                      left={<TextInput.Icon icon="account" />}
                      style={styles.textInput}
                      outlineColor="#e5e7eb"
                      activeOutlineColor="#0ea5e9"
                    />
                  )}
                />
                {errors.emailOrUsername && (
                  <Text style={styles.errorText}>{errors.emailOrUsername.message}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <Controller
                  control={control}
                  name="password"
                  rules={{ required: 'Password is required' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      mode="outlined"
                      placeholder="Enter your password"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      secureTextEntry={!showPassword}
                      error={!!errors.password}
                      left={<TextInput.Icon icon="lock" />}
                      right={
                        <TextInput.Icon
                          icon={showPassword ? 'eye-off' : 'eye'}
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                      style={styles.textInput}
                      outlineColor="#e5e7eb"
                      activeOutlineColor="#0ea5e9"
                    />
                  )}
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                )}
              </View>

              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!isValid || isLoading) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || isLoading}
              >
                <LinearGradient
                  colors={isValid && !isLoading ? ['#0ea5e9', '#0284c7'] : ['#e5e7eb', '#e5e7eb']}
                  style={styles.submitGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Sign In</Text>
                      <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.signupPrompt}>
                Not a member?{' '}
                <Text style={styles.signupLink} onPress={() => setIsLogin(false)}>
                  Signup now
                </Text>
              </Text>
            </View>
          )}

          {!isLogin && (
            <View style={styles.comingSoonContainer}>
              <MaterialCommunityIcons name="account-plus" size={64} color="#0ea5e9" />
              <Text style={styles.comingSoonText}>Signup Coming Soon</Text>
              <Text style={styles.comingSoonSubtext}>
                Contact support to create an account
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.leftFooter}>
        <Text style={styles.footerText}>
          © 2024 SwiftCab.in • All rights reserved
        </Text>
      </View>
    </View>
  );

  const renderRightPanel = () => (
    <LinearGradient
      colors={['#1f2937', '#111827', '#1f2937']}
      style={styles.rightPanel}
    >
      <ParticleBackground />
      
      {/* Gradient Orbs */}
      <View style={styles.gradientOrb1} />
      <View style={styles.gradientOrb2} />

      <View style={styles.rightContent}>
        {/* Badge */}
        <View style={styles.badge}>
          <MaterialCommunityIcons name="lightning-bolt" size={16} color="#0ea5e9" />
          <Text style={styles.badgeText}>#SwiftCabForDrivers</Text>
        </View>

        {/* Hero Text */}
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>Everyday city{'\n'}commute</Text>
          <Text style={styles.heroSubtitle}>
            Affordable AC cab rides at{'\n'}your doorstep
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresGrid}>
          {[
            { icon: 'lightning-bolt', title: 'Quick Booking', subtitle: 'In seconds' },
            { icon: 'shield-check', title: 'Safe & Secure', subtitle: 'Verified drivers' },
            { icon: 'clock-outline', title: '24/7 Available', subtitle: 'Always ready' },
            { icon: 'car', title: 'AC Cabs', subtitle: 'Comfort ride' },
          ].map((feature, idx) => (
            <View key={idx} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <MaterialCommunityIcons name={feature.icon as any} size={20} color="#0ea5e9" />
              </View>
              <View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {[
            { value: '50K+', label: 'Active Drivers' },
            { value: '1M+', label: 'Happy Riders' },
            { value: '100+', label: 'Cities' },
          ].map((stat, idx) => (
            <View key={idx} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderLeftPanel()}
        {isLargeScreen && renderRightPanel()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    flexDirection: isLargeScreen ? 'row' : 'column',
  },
  leftPanel: {
    flex: isLargeScreen ? 0.4 : 1,
    backgroundColor: '#fff',
    minWidth: isLargeScreen ? 420 : undefined,
  },
  leftHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoGradient: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  logoAccent: {
    color: '#0ea5e9',
  },
  logoSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  formContainer: {
    flexGrow: 1,
    padding: 32,
  },
  formInner: {
    maxWidth: 450,
    width: '100%',
    alignSelf: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 4,
    marginBottom: 32,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#1f2937',
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    backgroundColor: 'white',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  signupPrompt: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  signupLink: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 16,
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  comingSoonSubtext: {
    fontSize: 16,
    color: '#6b7280',
  },
  leftFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Right Panel Styles
  rightPanel: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0ea5e9',
  },
  gradientOrb1: {
    position: 'absolute',
    top: '10%',
    right: '10%',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(14, 165, 233, 0.3)',
    opacity: 0.5,
  },
  gradientOrb2: {
    position: 'absolute',
    bottom: '15%',
    left: '10%',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    opacity: 0.5,
  },
  rightContent: {
    flex: 1,
    padding: 64,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  heroTextContainer: {
    gap: 16,
  },
  heroTitle: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 72,
  },
  heroSubtitle: {
    fontSize: 24,
    color: '#d1d5db',
    fontWeight: '300',
    lineHeight: 32,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    maxWidth: 512,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '48%',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 32,
    flexWrap: 'wrap',
  },
  statItem: {
    gap: 4,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default NewLoginScreen;


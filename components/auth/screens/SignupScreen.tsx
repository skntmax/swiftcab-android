import { useLoginByOAuthMutation, useSignupWithOtpMutation, useVerifyOtpMutation } from '@/app/lib/api';
import { useSignupUserMutation } from '@/app/lib/api/users';
import { setCredentials, setLastLoginPhone } from '@/app/lib/reducers/auth/authSlice';
import { formatPhoneNumber, getCompleteOTP, validateCompleteOTP } from '@/components/HomePage/Singup/steps/validationSchema';
import AppButton from '@/components/ui/Button/Button';
import { PaperDialog, useDialog } from '@/components/ui/Dialog/PaperDialog';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Animated,
    Dimensions,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Dialog, HelperText, TextInput as PaperTextInput, Portal, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

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

type SignupMethod = 'email' | 'otp' | 'google';

interface EmailSignupForm {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface OtpSignupForm {
    phoneNumber: string;
    otp1: string;
    otp2: string;
    otp3: string;
    otp4: string;
}

interface Props {
    onSignupSuccess?: () => void;
    onNavigateToLogin?: () => void;
}

const SignupScreen: React.FC<Props> = ({ onSignupSuccess, onNavigateToLogin }) => {
    const [signupMethod, setSignupMethod] = useState<SignupMethod>('email');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpStep, setOtpStep] = useState<'phone' | 'otp'>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showTokenInput, setShowTokenInput] = useState(false);
    const [googleToken, setGoogleToken] = useState('');
    
    const [signupUser, { isLoading: isEmailSignupLoading }] = useSignupUserMutation();
    const [signupWithOtp, { isLoading: isOtpSignupLoading }] = useSignupWithOtpMutation();
    const [verifyOtp, { isLoading: isOtpVerifying }] = useVerifyOtpMutation();
    const [loginByOAuth, { isLoading: isOAuthLoading }] = useLoginByOAuthMutation();
    
    const { visible, config, showDialog, hideDialog } = useDialog();
    const dispatch = useDispatch();
    const buttonScale = React.useRef(new Animated.Value(1)).current;

    // OTP refs
    const otp1Ref = useRef<TextInput>(null);
    const otp2Ref = useRef<TextInput>(null);
    const otp3Ref = useRef<TextInput>(null);
    const otp4Ref = useRef<TextInput>(null);

    // Email signup form
    const { control: emailControl, handleSubmit: handleEmailSubmit, watch: watchEmail, formState: { errors: emailErrors } } = useForm<EmailSignupForm>({
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        mode: 'onChange',
    });

    // OTP signup form
    const { control: otpControl, handleSubmit: handleOtpSubmit, watch: watchOtp, setValue: setOtpValue, formState: { errors: otpErrors } } = useForm<OtpSignupForm>({
        defaultValues: {
            phoneNumber: '',
            otp1: '',
            otp2: '',
            otp3: '',
            otp4: '',
        },
        mode: 'onChange',
    });

    const password = watchEmail('password');
    const otp1 = watchOtp('otp1');
    const otp2 = watchOtp('otp2');
    const otp3 = watchOtp('otp3');
    const otp4 = watchOtp('otp4');

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

    const handleSuccess = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (onSignupSuccess) {
            onSignupSuccess();
        } else {
            router.replace('/(drawer)/(tabs)');
        }
    };

    // Email/Password Signup
    const handleEmailSignup = async (data: EmailSignupForm) => {
        handleButtonPress();
        try {
            const result = await signupUser({
                username: data.username,
                email: data.email,
                password: data.password,
                userType: 20, // Signup user type
            }).unwrap();

            showDialog('Signup Successful', result.message || 'Your account has been created successfully!', [
                { label: 'OK', onPress: handleSuccess }
            ]);
        } catch (err: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            const errorMessage = err?.data?.message || err?.message || 'Signup failed. Please try again.';
            showDialog('Signup Failed', errorMessage, [
                { label: 'OK', onPress: () => { } }
            ]);
        }
    };

    // OTP Signup - Send OTP
    const handleOtpPhoneSubmit = async (data: OtpSignupForm) => {
        handleButtonPress();
        const formattedPhone = formatPhoneNumber(data.phoneNumber);
        
        try {
            const result = await signupWithOtp({
                phone: formattedPhone,
                userType: 20, // Signup user type
            }).unwrap();

            if (!result?.error) {
                setPhoneNumber(formattedPhone);
                dispatch(setLastLoginPhone(formattedPhone));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setOtpStep('otp');
                showDialog('OTP Sent', typeof result.data === 'string' ? result.data : 'OTP has been sent to your phone', [
                    { label: 'OK', onPress: () => { } }
                ]);
            }
        } catch (err: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            const errorMessage = err?.data?.message || err?.message || 'Failed to send OTP. Please try again.';
            showDialog('OTP Failed', errorMessage, [
                { label: 'OK', onPress: () => { } }
            ]);
        }
    };

    // OTP Signup - Verify OTP
    const handleOtpVerify = async (data: OtpSignupForm) => {
        handleButtonPress();
        
        const otp1Val = data.otp1 || '';
        const otp2Val = data.otp2 || '';
        const otp3Val = data.otp3 || '';
        const otp4Val = data.otp4 || '';
        
        if (!validateCompleteOTP(otp1Val, otp2Val, otp3Val, otp4Val)) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showDialog('Invalid OTP', 'Please enter all 4 OTP digits', [
                { label: 'OK', onPress: () => { } }
            ]);
            return;
        }
        
        const otp = getCompleteOTP(otp1Val, otp2Val, otp3Val, otp4Val);
        
        try {
            const result = await verifyOtp({
                otp,
                phone: phoneNumber
            }).unwrap();

            if (!result?.error && result.data) {
                // Save credentials
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
                showDialog('Signup Successful', 'Your account has been created successfully!', [
                    { label: 'OK', onPress: handleSuccess }
                ]);
            }
        } catch (err: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            const errorMessage = err?.data?.message || err?.message || 'Invalid OTP. Please try again.';
            showDialog('Verification Failed', errorMessage, [
                { label: 'OK', onPress: () => { } }
            ]);
        }
    };

    // Google OAuth Signup
    const handleGoogleSignup = async () => {
        handleButtonPress();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        try {
            // Show dialog with options for Google OAuth
            showDialog(
                'Google Signup',
                'To sign up with Google, you need a Google ID token. You can:\n\n1. Enter your Google ID token manually\n2. Open Google OAuth in browser (you\'ll need to copy the token from the URL)',
                [
                    { label: 'Cancel', onPress: () => { } },
                    { 
                        label: 'Enter Token', 
                        onPress: () => {
                            setShowTokenInput(true);
                        }
                    },
                    {
                        label: 'Open Browser',
                        onPress: async () => {
                            // Open Google OAuth URL in browser
                            // Note: For production, you need to configure OAuth credentials
                            const googleOAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=id_token&scope=openid%20profile%20email';
                            
                            try {
                                await Linking.openURL('https://accounts.google.com');
                                showDialog(
                                    'Google Sign-In',
                                    'After signing in with Google, you\'ll need to extract the ID token from the authentication response. Copy the token and paste it in the "Enter Token" option.\n\nFor automatic token capture, install expo-auth-session package.',
                                    [{ label: 'OK', onPress: () => { } }]
                                );
                            } catch (err) {
                                showDialog('Error', 'Could not open browser. Please try the "Enter Token" option instead.', [
                                    { label: 'OK', onPress: () => { } }
                                ]);
                            }
                        }
                    }
                ]
            );
        } catch (err: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showDialog('Google Signup Failed', 'Please try again or use another signup method.', [
                { label: 'OK', onPress: () => { } }
            ]);
        }
    };

    // Handle manual token submission
    const handleTokenSubmit = async () => {
        if (!googleToken.trim()) {
            showDialog('Error', 'Please enter a valid Google ID token.', [
                { label: 'OK', onPress: () => { } }
            ]);
            return;
        }
        
        setShowTokenInput(false);
        await handleGoogleToken(googleToken);
        setGoogleToken('');
    };

    // Helper function to handle Google OAuth token (to be called after getting token from Google)
    const handleGoogleToken = async (googleToken: string) => {
        try {
            const result = await loginByOAuth({
                token: googleToken,
                trafficBy: 'GOOGLE',
                userType: 20, // Signup user type
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
                showDialog('Signup Successful', 'Your account has been created successfully!', [
                    { label: 'OK', onPress: handleSuccess }
                ]);
            }
        } catch (err: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            const errorMessage = err?.data?.message || err?.message || 'Google signup failed. Please try again.';
            showDialog('Signup Failed', errorMessage, [
                { label: 'OK', onPress: () => { } }
            ]);
        }
    };

    // OTP input handlers
    const handleOTPChange = (value: string, field: keyof OtpSignupForm, nextRef?: React.RefObject<TextInput | null>) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            setOtpValue(field, value);
            if (value.length === 1 && nextRef?.current) {
                nextRef.current.focus();
            }
        }
    };

    const handleOTPKeyPress = (key: string, field: keyof OtpSignupForm, prevRef?: React.RefObject<TextInput | null>) => {
        if (key === 'Backspace' && !watchOtp(field) && prevRef?.current) {
            prevRef.current.focus();
        }
    };

    const handleBackToLogin = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onNavigateToLogin) {
            onNavigateToLogin();
        }
    };

    const renderMethodTabs = () => (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[styles.tab, signupMethod === 'email' && styles.tabActive]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSignupMethod('email');
                }}
                activeOpacity={0.7}
            >
                <Text style={[styles.tabText, signupMethod === 'email' && styles.tabTextActive]}>
                    Email
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, signupMethod === 'otp' && styles.tabActive]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSignupMethod('otp');
                    setOtpStep('phone');
                }}
                activeOpacity={0.7}
            >
                <Text style={[styles.tabText, signupMethod === 'otp' && styles.tabTextActive]}>
                    OTP
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, signupMethod === 'google' && styles.tabActive]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSignupMethod('google');
                }}
                activeOpacity={0.7}
            >
                <Text style={[styles.tabText, signupMethod === 'google' && styles.tabTextActive]}>
                    Google
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmailSignup = () => (
        <View style={styles.formSection}>
            {/* Username Input */}
            <View style={styles.inputGroup}>
                <Controller
                    control={emailControl}
                    name="username"
                    rules={{
                        required: 'Username is required',
                        minLength: { value: 3, message: 'Username must be at least 3 characters' },
                        maxLength: { value: 30, message: 'Username cannot exceed 30 characters' },
                        pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores' }
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <>
                            <PaperTextInput
                                mode="outlined"
                                label="Username"
                                placeholder="Enter username"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                autoCapitalize="none"
                                error={!!emailErrors.username}
                                style={styles.textInput}
                                contentStyle={styles.textInputContent}
                                outlineColor={THEME.border}
                                activeOutlineColor={THEME.accent}
                                textColor={THEME.text}
                                placeholderTextColor={THEME.textTertiary}
                                left={<PaperTextInput.Icon icon="account" color={THEME.textSecondary} />}
                            />
                            <HelperText type="error" visible={!!emailErrors.username} style={styles.helperText}>
                                {emailErrors.username?.message}
                            </HelperText>
                        </>
                    )}
                />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
                <Controller
                    control={emailControl}
                    name="email"
                    rules={{
                        required: 'Email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <>
                            <PaperTextInput
                                mode="outlined"
                                label="Email"
                                placeholder="Enter email address"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                error={!!emailErrors.email}
                                style={styles.textInput}
                                contentStyle={styles.textInputContent}
                                outlineColor={THEME.border}
                                activeOutlineColor={THEME.accent}
                                textColor={THEME.text}
                                placeholderTextColor={THEME.textTertiary}
                                left={<PaperTextInput.Icon icon="email" color={THEME.textSecondary} />}
                            />
                            <HelperText type="error" visible={!!emailErrors.email} style={styles.helperText}>
                                {emailErrors.email?.message}
                            </HelperText>
                        </>
                    )}
                />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
                <Controller
                    control={emailControl}
                    name="password"
                    rules={{
                        required: 'Password is required',
                        minLength: { value: 4, message: 'Password must be at least 6 characters' },
                        // pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Password must contain uppercase, lowercase, and number' }
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <>
                            <PaperTextInput
                                mode="outlined"
                                label="Password"
                                placeholder="Enter password"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                error={!!emailErrors.password}
                                style={styles.textInput}
                                contentStyle={styles.textInputContent}
                                outlineColor={THEME.border}
                                activeOutlineColor={THEME.accent}
                                textColor={THEME.text}
                                placeholderTextColor={THEME.textTertiary}
                                left={<PaperTextInput.Icon icon="lock" color={THEME.textSecondary} />}
                                right={
                                    <PaperTextInput.Icon
                                        icon={showPassword ? 'eye-off' : 'eye'}
                                        color={THEME.textSecondary}
                                        onPress={() => setShowPassword(!showPassword)}
                                    />
                                }
                            />
                            <HelperText type="error" visible={!!emailErrors.password} style={styles.helperText}>
                                {emailErrors.password?.message}
                            </HelperText>
                        </>
                    )}
                />
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
                <Controller
                    control={emailControl}
                    name="confirmPassword"
                    rules={{
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match'
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <>
                            <PaperTextInput
                                mode="outlined"
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                error={!!emailErrors.confirmPassword}
                                style={styles.textInput}
                                contentStyle={styles.textInputContent}
                                outlineColor={THEME.border}
                                activeOutlineColor={THEME.accent}
                                textColor={THEME.text}
                                placeholderTextColor={THEME.textTertiary}
                                left={<PaperTextInput.Icon icon="lock-check" color={THEME.textSecondary} />}
                                right={
                                    <PaperTextInput.Icon
                                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                        color={THEME.textSecondary}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    />
                                }
                            />
                            <HelperText type="error" visible={!!emailErrors.confirmPassword} style={styles.helperText}>
                                {emailErrors.confirmPassword?.message}
                            </HelperText>
                        </>
                    )}
                />
            </View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <AppButton
                    label={isEmailSignupLoading ? "Creating Account..." : "Sign Up"}
                    onPress={handleEmailSubmit(handleEmailSignup)}
                    loading={isEmailSignupLoading}
                    disabled={isEmailSignupLoading}
                    color={THEME.accent}
                    style={styles.signupButton}
                />
            </Animated.View>
        </View>
    );

    const renderOtpSignup = () => {
        if (otpStep === 'phone') {
            return (
                <View style={styles.formSection}>
                    <Text style={styles.stepTitle}>Enter Phone Number</Text>
                    <Text style={styles.stepSubtitle}>We'll send you an OTP to verify</Text>
                    
                    <View style={styles.inputGroup}>
                        <Controller
                            control={otpControl}
                            name="phoneNumber"
                            rules={{
                                required: 'Phone number is required',
                                pattern: { value: /^[6-9]\d{9}$/, message: 'Please enter a valid 10-digit phone number' }
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <>
                                    <PaperTextInput
                                        mode="outlined"
                                        label="Phone Number"
                                        placeholder="Enter phone number"
                                        value={value}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        keyboardType="phone-pad"
                                        error={!!otpErrors.phoneNumber}
                                        style={styles.textInput}
                                        contentStyle={styles.textInputContent}
                                        outlineColor={THEME.border}
                                        activeOutlineColor={THEME.accent}
                                        textColor={THEME.text}
                                        placeholderTextColor={THEME.textTertiary}
                                        left={
                                            <View style={styles.countryCode}>
                                                <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                                            </View>
                                        }
                                    />
                                    <HelperText type="error" visible={!!otpErrors.phoneNumber} style={styles.helperText}>
                                        {otpErrors.phoneNumber?.message}
                                    </HelperText>
                                </>
                            )}
                        />
                    </View>

                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                        <AppButton
                            label={isOtpSignupLoading ? "Sending OTP..." : "Send OTP"}
                            onPress={handleOtpSubmit(handleOtpPhoneSubmit)}
                            loading={isOtpSignupLoading}
                            disabled={isOtpSignupLoading || !watchOtp('phoneNumber')}
                            color={THEME.accent}
                            style={styles.signupButton}
                        />
                    </Animated.View>
                </View>
            );
        }

        return (
            <View style={styles.formSection}>
                <Text style={styles.stepTitle}>Enter OTP</Text>
                <Text style={styles.stepSubtitle}>OTP sent to +91 {phoneNumber}</Text>
                
                <View style={styles.otpContainer}>
                    <PaperTextInput
                        ref={otp1Ref}
                        mode="outlined"
                        value={otp1}
                        onChangeText={(value) => handleOTPChange(value, 'otp1', otp2Ref)}
                        onKeyPress={({ nativeEvent }) => handleOTPKeyPress(nativeEvent.key, 'otp1', undefined)}
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

                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <AppButton
                        label={isOtpVerifying ? "Verifying..." : "Verify OTP"}
                        onPress={handleOtpSubmit(handleOtpVerify)}
                        loading={isOtpVerifying}
                        disabled={isOtpVerifying || !validateCompleteOTP(otp1, otp2, otp3, otp4)}
                        color={THEME.accent}
                        style={styles.signupButton}
                    />
                </Animated.View>

                <TouchableOpacity onPress={() => setOtpStep('phone')} style={styles.backToPhone}>
                    <Text style={styles.backButtonText}>← Back to phone number</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderGoogleSignup = () => (
        <View style={styles.formSection}>
            <View style={styles.googleSignupContainer}>
                <MaterialCommunityIcons name="google" size={64} color="#4285F4" />
                <Text style={styles.googleTitle}>Sign up with Google</Text>
                <Text style={styles.googleSubtitle}>
                    Create your account quickly using your Google account
                </Text>
                
                <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
                    <AppButton
                        label={isOAuthLoading ? "Signing up..." : "Continue with Google"}
                        onPress={handleGoogleSignup}
                        loading={isOAuthLoading}
                        disabled={isOAuthLoading}
                        color={THEME.accent}
                        style={styles.signupButton}
                    />
                </Animated.View>

                <Text style={styles.googleNote}>
                    Note: Google OAuth integration requires expo-auth-session or @react-native-google-signin/google-signin package.
                    Once you get the Google ID token, call handleGoogleToken(token) to complete signup.
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleBackToLogin}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color={THEME.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Account</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Method Tabs */}
                {renderMethodTabs()}

                {/* Form based on selected method */}
                {signupMethod === 'email' && renderEmailSignup()}
                {signupMethod === 'otp' && renderOtpSignup()}
                {signupMethod === 'google' && renderGoogleSignup()}

                {/* Back to Login */}
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity onPress={handleBackToLogin} activeOpacity={0.7}>
                        <Text style={styles.loginLink}>Login here</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Dialog for alerts */}
            <PaperDialog
                visible={visible}
                onDismiss={hideDialog}
                title={config.title}
                message={config.message}
                actions={config.actions}
            />

            {/* Token Input Dialog */}
            <Portal>
                <Dialog
                    visible={showTokenInput}
                    onDismiss={() => {
                        setShowTokenInput(false);
                        setGoogleToken('');
                    }}
                    dismissable={true}
                    style={styles.tokenDialog}
                >
                    <Dialog.Title style={styles.tokenDialogTitle}>Enter Google ID Token</Dialog.Title>
                    <Dialog.Content>
                        <Text style={styles.tokenDialogMessage}>
                            Paste your Google ID token here. You can get this token by signing in with Google through your browser or using expo-auth-session.
                        </Text>
                        <View style={styles.tokenInputContainer}>
                            <PaperTextInput
                                mode="outlined"
                                label="Google ID Token"
                                placeholder="Paste your Google ID token here"
                                value={googleToken}
                                onChangeText={setGoogleToken}
                                multiline
                                numberOfLines={4}
                                style={styles.tokenInput}
                                contentStyle={styles.tokenInputContent}
                                outlineColor={THEME.border}
                                activeOutlineColor={THEME.accent}
                                textColor={THEME.text}
                                placeholderTextColor={THEME.textTertiary}
                            />
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions style={styles.tokenDialogActions}>
                        <AppButton
                            label="Cancel"
                            onPress={() => {
                                setShowTokenInput(false);
                                setGoogleToken('');
                            }}
                            color={THEME.textSecondary}
                            style={styles.tokenDialogButton}
                        />
                        <AppButton
                            label="Submit"
                            onPress={handleTokenSubmit}
                            color={THEME.accent}
                            style={styles.tokenDialogButton}
                            disabled={!googleToken.trim()}
                        />
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        marginTop: 0,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: THEME.text,
        letterSpacing: -0.5,
    },
    placeholder: {
        width: 40,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: THEME.surface,
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: THEME.text,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: THEME.textSecondary,
    },
    tabTextActive: {
        color: THEME.background,
    },
    formSection: {
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
    signupButton: {
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 24,
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    loginText: {
        fontSize: 14,
        color: THEME.textSecondary,
    },
    loginLink: {
        fontSize: 14,
        color: THEME.text,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: THEME.text,
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 14,
        color: THEME.textSecondary,
        marginBottom: 24,
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
        marginBottom: 24,
        gap: 12,
    },
    otpInput: {
        width: 60,
        height: 60,
        backgroundColor: THEME.background,
        fontSize: 24,
        fontWeight: '700',
        borderRadius: 12,
    },
    otpInputContent: {
        backgroundColor: THEME.background,
    },
    backToPhone: {
        alignItems: 'center',
        marginTop: 16,
    },
    backButtonText: {
        fontSize: 14,
        color: THEME.text,
        fontWeight: '500',
    },
    googleSignupContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    googleTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: THEME.text,
        marginTop: 16,
        marginBottom: 8,
    },
    googleSubtitle: {
        fontSize: 14,
        color: THEME.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    googleNote: {
        fontSize: 12,
        color: THEME.textTertiary,
        textAlign: 'center',
        marginTop: 24,
        paddingHorizontal: 20,
        fontStyle: 'italic',
    },
    tokenDialog: {
        backgroundColor: THEME.background,
        borderRadius: 16,
    },
    tokenDialogTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: THEME.text,
    },
    tokenDialogMessage: {
        fontSize: 14,
        color: THEME.textSecondary,
        marginBottom: 16,
    },
    tokenInputContainer: {
        marginTop: 8,
    },
    tokenInput: {
        backgroundColor: THEME.background,
        minHeight: 100,
    },
    tokenInputContent: {
        backgroundColor: THEME.background,
    },
    tokenDialogActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    tokenDialogButton: {
        minWidth: 100,
    },
});

export default SignupScreen;

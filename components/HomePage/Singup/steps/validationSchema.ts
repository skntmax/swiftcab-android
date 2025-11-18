import { RegisterOptions } from 'react-hook-form';
import { VerificationForm } from './Step1';

/**
 * Validation schema for phone number
 * Validates Indian phone numbers (10 digits starting with 6-9)
 */
export const phoneNumberValidation: RegisterOptions<VerificationForm, 'phoneNumber'> = {
    required: {
        value: true,
        message: 'Phone number is required',
    },
    validate: {
        notEmpty: (value: string) => {
            const trimmed = value.trim();
            if (!trimmed) {
                return 'Phone number cannot be empty';
            }
            return true;
        },
        isNumeric: (value: string) => {
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length === 0) {
                return 'Phone number must contain only digits';
            }
            return true;
        },
        isValidLength: (value: string) => {
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length !== 10) {
                return 'Phone number must be exactly 10 digits';
            }
            return true;
        },
        startsWithValidDigit: (value: string) => {
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length > 0 && !/^[6-9]/.test(numericValue)) {
                return 'Phone number must start with 6, 7, 8, or 9';
            }
            return true;
        },
    },
    pattern: {
        value: /^[6-9]\d{9}$/,
        message: 'Please enter a valid 10-digit Indian phone number',
    },
    minLength: {
        value: 10,
        message: 'Phone number must be at least 10 digits',
    },
    maxLength: {
        value: 10,
        message: 'Phone number cannot exceed 10 digits',
    },
};

/**
 * Validation schema for OTP fields
 * Each OTP field must be a single digit (0-9)
 */
export const otpFieldValidation: RegisterOptions<VerificationForm, 'otp1' | 'otp2' | 'otp3' | 'otp4'> = {
    required: {
        value: true,
        message: 'OTP digit is required',
    },
    validate: {
        isNumeric: (value: string) => {
            if (!/^\d$/.test(value)) {
                return 'OTP must be a single digit (0-9)';
            }
            return true;
        },
        notEmpty: (value: string) => {
            if (!value || value.trim().length === 0) {
                return 'OTP digit cannot be empty';
            }
            return true;
        },
    },
    pattern: {
        value: /^\d$/,
        message: 'OTP must be a single digit',
    },
    minLength: {
        value: 1,
        message: 'OTP digit is required',
    },
    maxLength: {
        value: 1,
        message: 'OTP must be a single digit',
    },
};

/**
 * Complete validation schema for the verification form
 */
export const verificationFormSchema = {
    phoneNumber: phoneNumberValidation,
    otp1: otpFieldValidation,
    otp2: otpFieldValidation,
    otp3: otpFieldValidation,
    otp4: otpFieldValidation,
} as const;

/**
 * Helper function to validate complete OTP
 * Validates that all 4 OTP digits are filled
 */
export const validateCompleteOTP = (otp1: string, otp2: string, otp3: string, otp4: string): boolean => {
    return !!(otp1 && otp2 && otp3 && otp4 &&
        /^\d$/.test(otp1) &&
        /^\d$/.test(otp2) &&
        /^\d$/.test(otp3) &&
        /^\d$/.test(otp4));
};

/**
 * Helper function to get complete OTP string
 */
export const getCompleteOTP = (otp1: string, otp2: string, otp3: string, otp4: string): string => {
    return `${otp1}${otp2}${otp3}${otp4}`;
};

/**
 * Helper function to validate phone number format
 * Can be used for real-time validation
 */
export const isValidPhoneNumber = (phone: string): boolean => {
    const numericPhone = phone.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(numericPhone);
};

/**
 * Helper function to format phone number
 * Removes non-numeric characters and limits to 10 digits
 */
export const formatPhoneNumber = (phone: string): string => {
    const numericPhone = phone.replace(/\D/g, '');
    return numericPhone.slice(0, 10);
};

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
    PHONE_REQUIRED: 'Phone number is required',
    PHONE_INVALID: 'Please enter a valid 10-digit Indian phone number',
    PHONE_LENGTH: 'Phone number must be exactly 10 digits',
    PHONE_START_DIGIT: 'Phone number must start with 6, 7, 8, or 9',
    OTP_REQUIRED: 'OTP digit is required',
    OTP_INVALID: 'OTP must be a single digit (0-9)',
    OTP_COMPLETE: 'Please enter all 4 OTP digits',
} as const;
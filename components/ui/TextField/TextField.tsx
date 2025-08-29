import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
    Control,
    FieldPath,
    FieldValues,
    RegisterOptions,
    useController,
    UseControllerProps,
    useForm
} from 'react-hook-form';
import {
    KeyboardTypeOptions,
    ReturnKeyTypeOptions,
    TextInput as RNTextInput,
    StyleSheet,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import {
    Button,
    Chip,
    HelperText,
    TextInputProps as PaperTextInputProps,
    Text,
    TextInput,
    useTheme,
} from 'react-native-paper';

// Types
type TextFieldVariant = 'outlined' | 'flat';
type TextFieldSize = 'small' | 'medium' | 'large';

// Custom validation rules for common patterns - Fixed typing
const createValidationRules = <T extends FieldValues, TName extends FieldPath<T>>(): Record<string, RegisterOptions<T, TName>> => ({
  email: {
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    }
  },
  phone: {
    pattern: {
      value: /^[\+]?[1-9][\d]{0,15}$/,
      message: 'Please enter a valid phone number'
    }
  },
  url: {
    pattern: {
      value: /^https?:\/\/\S+$/,
      message: 'Please enter a valid URL'
    }
  },
  numeric: {
    pattern: {
      value: /^\d*$/,
      message: 'Please enter only numbers'
    }
  },
  password: {
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters'
    }
  },
  strongPassword: {
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters'
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'Password must contain uppercase, lowercase, and number'
    }
  }
});

interface TextFieldProps<T extends FieldValues> extends Omit<
  PaperTextInputProps, 
  'value' | 'onChangeText' | 'error' | 'theme'
> {
  // React Hook Form integration
  name: FieldPath<T>;
  control: Control<T>;
  rules?: RegisterOptions<T, FieldPath<T>>;
  
  // Styling
  variant?: TextFieldVariant;
  size?: TextFieldSize;
  fullWidth?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  
  // Input types and behavior
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
  editable?: boolean;
  
  // Icons and actions
  leftIcon?: string;
  rightIcon?: string;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
  showPasswordToggle?: boolean;
  clearable?: boolean;
  
  // Special input types with auto-configuration
  isPassword?: boolean;
  isEmail?: boolean;
  isPhone?: boolean;
  isNumeric?: boolean;
  isSearch?: boolean;
  isURL?: boolean;
  isStrongPassword?: boolean;
  
  // Tags/Chips (for multi-select text inputs)
  tags?: string[];
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  tagDelimiter?: string;
  
  // Callbacks
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  
  // Loading and disabled states
  loading?: boolean;
  
  // Character counter
  showCharacterCount?: boolean;
  
  // Helper text (additional to validation errors)
  helperText?: string;
}

interface TextFieldRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getValue: () => string;
}

// Generic TextField Component with React Hook Form
function TextFieldComponent<T extends FieldValues>(
  props: TextFieldProps<T>,
  ref: React.Ref<TextFieldRef>
) {
  const {
    // React Hook Form
    name,
    control,
    rules,
    
    // Basic props
    label,
    placeholder,
    
    // Styling
    variant = 'outlined',
    size = 'medium',
    fullWidth = true,
    containerStyle,
    inputStyle,
    labelStyle,
    
    // Input behavior
    keyboardType,
    returnKeyType = 'done',
    secureTextEntry,
    multiline = false,
    numberOfLines = 1,
    maxLength,
    autoCapitalize = 'sentences',
    autoFocus = false,
    editable = true,
    
    // Icons and actions
    leftIcon,
    rightIcon,
    onLeftIconPress,
    onRightIconPress,
    showPasswordToggle = false,
    clearable = false,
    
    // Special types
    isPassword = false,
    isEmail = false,
    isPhone = false,
    isNumeric = false,
    isSearch = false,
    isURL = false,
    isStrongPassword = false,
    
    // Tags
    tags = [],
    onTagAdd,
    onTagRemove,
    tagDelimiter = ',',
    
    // Callbacks
    onFocus,
    onBlur,
    onSubmitEditing,
    
    // States
    loading = false,
    disabled,
    
    // Character counter
    showCharacterCount = false,
    
    // Helper text
    helperText,
    
    ...otherProps
  } = props;

  const theme = useTheme();
  const inputRef = useRef<RNTextInput>(null);
  
  // State management
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Auto-configure validation rules based on input type - Fixed typing
  function getCombinedRules(): RegisterOptions<T, FieldPath<T>> {
    const validationRules = createValidationRules<T, FieldPath<T>>();
    let autoRules: any = {};
    
    if (isEmail) autoRules = { ...autoRules, ...validationRules.email };
    if (isPhone) autoRules = { ...autoRules, ...validationRules.phone };
    if (isURL) autoRules = { ...autoRules, ...validationRules.url };
    if (isNumeric) autoRules = { ...autoRules, ...validationRules.numeric };
    if (isPassword) autoRules = { ...autoRules, ...validationRules.password };
    if (isStrongPassword) autoRules = { ...autoRules, ...validationRules.strongPassword };
    
    // Merge with custom rules (custom rules take precedence)
    return { ...autoRules, ...rules };
  }

  // React Hook Form controller
  const controllerProps: UseControllerProps<T, FieldPath<T>> = {
    name,
    control,
    rules: getCombinedRules(),
    defaultValue: '' as any,
  };

  const {
    field: { value, onChange, onBlur: onFieldBlur },
    fieldState: { error },
  } = useController(controllerProps);

  // Auto-configure based on input type
  const getAutoConfig = () => {
    let config = {
      keyboardType: keyboardType,
      autoCapitalize: autoCapitalize,
      secureTextEntry: secureTextEntry,
      rightIcon: rightIcon,
      onRightIconPress: onRightIconPress,
    };
    
    if (isPassword || isStrongPassword || showPasswordToggle) {
      config.secureTextEntry = !isPasswordVisible;
      config.rightIcon = isPasswordVisible ? 'eye-off' : 'eye';
      config.onRightIconPress = () => setIsPasswordVisible(!isPasswordVisible);
    }
    
    if (isEmail) {
      config.keyboardType = 'email-address';
      config.autoCapitalize = 'none';
    }
    
    if (isPhone) {
      config.keyboardType = 'phone-pad';
    }
    
    if (isNumeric) {
      config.keyboardType = 'numeric';
    }
    
    if (isURL) {
      config.keyboardType = 'url';
      config.autoCapitalize = 'none';
    }
    
    if (isSearch) {
      config.keyboardType = 'web-search';
    }
    
    return config;
  };

  const autoConfig = getAutoConfig();

  // Handle blur with field validation
  const handleBlur = () => {
    onFieldBlur();
    onBlur?.();
  };

  // Handle tag operations
  const handleTagSubmit = () => {
    if (tagInput.trim() && onTagAdd && !tags.includes(tagInput.trim())) {
      onTagAdd(tagInput.trim());
      setTagInput('');
    }
  };

  const handleTagInputChange = (text: string) => {
    if (text.includes(tagDelimiter)) {
      const newTag = text.replace(tagDelimiter, '').trim();
      if (newTag && onTagAdd && !tags.includes(newTag)) {
        onTagAdd(newTag);
      }
      setTagInput('');
    } else {
      setTagInput(text);
    }
  };

  // Imperative methods
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => onChange(''),
    getValue: () => value || '',
  }));

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { minHeight: 40 };
      case 'large':
        return { minHeight: 56 };
      default:
        return { minHeight: 48 };
    }
  };

  const sizeStyles = getSizeStyles();

  // Render left icon
  const renderLeftIcon = () => {
    if (leftIcon) {
      return (
        <TextInput.Icon
          icon={leftIcon}
          onPress={onLeftIconPress}
          disabled={disabled || !onLeftIconPress}
        />
      );
    }
    return null;
  };

  // Render right icon
  const renderRightIcon = () => {
    const icons = [];
    
    // Clear button
    if (clearable && value && !disabled) {
      icons.push(
        <TextInput.Icon
          key="clear"
          icon="close"
          onPress={() => onChange('')}
        />
      );
    }
    
    // Custom right icon or password toggle
    if (autoConfig.rightIcon) {
      icons.push(
        <TextInput.Icon
          key="right"
          icon={autoConfig.rightIcon}
          onPress={autoConfig.onRightIconPress}
          disabled={disabled || !autoConfig.onRightIconPress}
        />
      );
    }
    
    // Loading indicator
    if (loading) {
      icons.push(
        <TextInput.Icon
          key="loading"
          icon="loading"
          disabled
        />
      );
    }
    
    return icons.length > 0 ? icons[icons.length - 1] : null; // Return only the last icon
  };

  // Render tags
  const renderTags = () => {
    if (tags.length === 0) return null;
    
    return (
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <Chip
            key={index}
            mode="outlined"
            onClose={onTagRemove ? () => onTagRemove(tag) : undefined}
            style={styles.tag}
          >
            {tag}
          </Chip>
        ))}
      </View>
    );
  };

  const hasError = !!error;
  const errorMessage = error?.message;
  const actualValue = onTagAdd ? tagInput : (value || '');

  return (
    <View style={[fullWidth && styles.fullWidth, containerStyle]}>
      {/* Tags */}
      {renderTags()}
      
      {/* Main Input */}
      <TextInput
        ref={inputRef}
        label={label}
        placeholder={placeholder}
        value={actualValue}
        onChangeText={onTagAdd ? handleTagInputChange : onChange}
        onFocus={onFocus}
        onBlur={handleBlur}
        onSubmitEditing={onTagAdd ? handleTagSubmit : onSubmitEditing}
        mode={variant}
        error={hasError}
        disabled={disabled || loading}
        editable={editable && !disabled && !loading}
        
        // Input configuration
        keyboardType={autoConfig.keyboardType}
        returnKeyType={returnKeyType}
        secureTextEntry={autoConfig.secureTextEntry}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        maxLength={maxLength}
        autoCapitalize={autoConfig.autoCapitalize}
        autoFocus={autoFocus}
        
        // Icons
        left={renderLeftIcon()}
        right={renderRightIcon()}
        
        // Styling
        style={[sizeStyles, inputStyle]}
        contentStyle={labelStyle}
        
        {...otherProps}
      />
      
      {/* Error Text / Helper Text */}
      <HelperText 
        type={hasError ? 'error' : 'info'} 
        visible={!!(errorMessage || helperText)}
      >
        {errorMessage || helperText}
      </HelperText>
      
      {/* Character Counter */}
      {showCharacterCount && maxLength && (
        <Text 
          variant="bodySmall" 
          style={[
            styles.characterCounter,
            {
              color: actualValue.length > maxLength * 0.9 
                ? theme.colors.error 
                : theme.colors.onSurfaceVariant
            }
          ]}
        >
          {actualValue.length}/{maxLength}
        </Text>
      )}
    </View>
  );
}

// Create the forwardRef component with proper typing
const TextField = forwardRef(TextFieldComponent) as <T extends FieldValues>(
  props: TextFieldProps<T> & { ref?: React.Ref<TextFieldRef> }
) => React.ReactElement;

// Example Usage Component with React Hook Form
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  website: string;
  bio: string;
  age: string;
}

const TextFieldExamples: React.FC = () => {
  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      website: '',
      bio: '',
      age: '',
    },
    mode: 'onBlur', // Validate on blur for better UX
  });

  const [skills, setSkills] = React.useState<string[]>([]);
  const password = watch('password');

  const onSubmit = (data: FormData) => {
    console.log('Form Data:', { ...data, skills });
    alert('Form submitted successfully! Check console for data.');
  };

  const handleSkillAdd = (skill: string) => {
    setSkills(prev => [...prev, skill]);
  };

  const handleSkillRemove = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        TextField with React Hook Form
      </Text>

      {/* Basic Required Fields */}
      <TextField<FormData>
        name="firstName"
        control={control}
        label="First Name"
        placeholder="Enter your first name"
        leftIcon="account"
        rules={{ 
          required: 'First name is required',
          minLength: { value: 2, message: 'Minimum 2 characters required' }
        }}
        helperText="This field is required"
      />

      <TextField<FormData>
        name="lastName"
        control={control}
        label="Last Name"
        placeholder="Enter your last name"
        rules={{ 
          required: 'Last name is required',
          minLength: { value: 2, message: 'Minimum 2 characters required' }
        }}
      />

      {/* Email with auto-validation */}
      <TextField<FormData>
        name="email"
        control={control}
        label="Email Address"
        placeholder="Enter your email"
        isEmail
        clearable
        rules={{ required: 'Email is required' }}
        helperText="We'll never share your email"
      />

      {/* Password with strength validation */}
      <TextField<FormData>
        name="password"
        control={control}
        label="Password"
        placeholder="Enter your password"
        isStrongPassword
        showPasswordToggle
        rules={{ required: 'Password is required' }}
        helperText="Must contain uppercase, lowercase and number"
      />

      {/* Confirm Password with custom validation */}
      <TextField<FormData>
        name="confirmPassword"
        control={control}
        label="Confirm Password"
        placeholder="Confirm your password"
        isPassword
        showPasswordToggle
        rules={{ 
          required: 'Please confirm your password',
          validate: (value) => value === password || 'Passwords do not match'
        }}
      />

      {/* Phone with auto-validation */}
      <TextField<FormData>
        name="phone"
        control={control}
        label="Phone Number"
        placeholder="Enter your phone number"
        isPhone
        leftIcon="phone"
        rules={{ required: 'Phone number is required' }}
      />

      {/* URL Field */}
      <TextField<FormData>
        name="website"
        control={control}
        label="Website"
        placeholder="https://example.com"
        isURL
        leftIcon="web"
        helperText="Optional: Your personal website"
      />

      {/* Numeric Field */}
      <TextField<FormData>
        name="age"
        control={control}
        label="Age"
        placeholder="Enter your age"
        isNumeric
        rules={{ 
          required: 'Age is required',
          min: { value: 18, message: 'Must be at least 18 years old' },
          max: { value: 120, message: 'Must be less than 120 years old' }
        }}
      />

      {/* Multiline with character count */}
      <TextField<FormData>
        name="bio"
        control={control}
        label="Bio"
        placeholder="Tell us about yourself"
        multiline
        numberOfLines={4}
        maxLength={500}
        showCharacterCount
        rules={{ 
          maxLength: { value: 500, message: 'Bio must be less than 500 characters' }
        }}
        helperText="Share a brief description about yourself"
      />

      {/* Skills with Tags - Using a separate input since it's not part of the form */}
      <View style={styles.fullWidth}>
        <Text variant="bodyMedium" style={styles.tagLabel}>Skills (Tags)</Text>
        <TextField<{ skillInput: string }>
          name="skillInput" 
          control={useForm<{ skillInput: string }>({ defaultValues: { skillInput: '' } }).control}
          placeholder="Add skills separated by commas"
          tags={skills}
          onTagAdd={handleSkillAdd}
          onTagRemove={handleSkillRemove}
          helperText="Type skills and press enter or add commas to separate"
        />
      </View>

      {/* Submit Button */}
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.submitButton}
      >
        Submit Form
      </Button>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <View style={styles.errorSummary}>
          <Text variant="titleSmall" style={styles.errorTitle}>
            Please fix the following errors:
          </Text>
          {Object.entries(errors).map(([field, error]) => (
            <Text key={field} variant="bodySmall" style={styles.errorItem}>
              • {error?.message}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  fullWidth: {
    width: '100%',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    margin: 2,
  },
  tagLabel: {
    marginBottom: 8,
    marginLeft: 12,
  },
  characterCounter: {
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  errorSummary: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorTitle: {
    color: '#d32f2f',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorItem: {
    color: '#d32f2f',
    marginBottom: 4,
  },
  
});

TextField.displayName = 'TextField';

export { TextField };
export type { TextFieldProps, TextFieldRef };
export default TextFieldExamples;
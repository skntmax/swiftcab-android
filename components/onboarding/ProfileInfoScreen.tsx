import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Surface, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

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

interface Props {
  onProfileComplete: (profile: ProfileForm) => void;
}

const ProfileInfoScreen: React.FC<Props> = ({ onProfileComplete }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: new Date(1990, 0, 1),
      gender: '',
      address: '',
      pincode: '',
      emergencyContact: '',
    },
  });

  const dateOfBirth = watch('dateOfBirth');
  const gender = watch('gender');

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onProfileComplete(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setValue('dateOfBirth', selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const renderGenderSelector = () => (
    <View style={styles.genderContainer}>
      <Text style={styles.genderLabel}>Gender *</Text>
      <View style={styles.genderButtons}>
        {[
          { id: 'male', label: 'Male', icon: 'human-male' },
          { id: 'female', label: 'Female', icon: 'human-female' },
          { id: 'other', label: 'Other', icon: 'human' }
        ].map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.genderButton,
              gender === option.id && styles.selectedGenderButton
            ]}
            onPress={() => setValue('gender', option.id as any)}
          >
            <MaterialCommunityIcons 
              name={option.icon as any} 
              size={24} 
              color={gender === option.id ? CONSTANTS.theme.primaryColor : '#666'} 
            />
            <Text style={[
              styles.genderButtonText,
              gender === option.id && styles.selectedGenderButtonText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Personal Information
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Please provide your personal details for verification
          </Text>
        </View>

        <Surface style={styles.formSurface} elevation={1}>
          <View style={styles.form}>
            <View style={styles.nameRow}>
              <Controller
                control={control}
                name="firstName"
                rules={{ required: 'First name is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    mode="outlined"
                    label="First Name"
                    placeholder="Enter first name"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.firstName}
                    style={[styles.input, styles.halfInput]}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="lastName"
                rules={{ required: 'Last name is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    mode="outlined"
                    label="Last Name"
                    placeholder="Enter last name"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.lastName}
                    style={[styles.input, styles.halfInput]}
                  />
                )}
              />
            </View>

            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="Email Address"
                  placeholder="Enter email address"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              )}
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                mode="outlined"
                label="Date of Birth"
                value={`${formatDate(dateOfBirth)} (Age: ${calculateAge(dateOfBirth)})`}
                editable={false}
                right={<TextInput.Icon icon="calendar" />}
                style={styles.input}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1950, 0, 1)}
              />
            )}

            {renderGenderSelector()}

            <Controller
              control={control}
              name="address"
              rules={{ required: 'Address is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="Address"
                  placeholder="Enter complete address"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.address}
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="pincode"
              rules={{
                required: 'Pincode is required',
                pattern: {
                  value: /^\d{6}$/,
                  message: 'Please enter a valid 6-digit pincode',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="Pincode"
                  placeholder="Enter pincode"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.pincode}
                  keyboardType="numeric"
                  maxLength={6}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="emergencyContact"
              rules={{
                required: 'Emergency contact is required',
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: 'Please enter a valid 10-digit phone number',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="Emergency Contact"
                  placeholder="Enter emergency contact number"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.emergencyContact}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.input}
                />
              )}
            />
          </View>
        </Surface>

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
          style={styles.continueButton}
          buttonColor={CONSTANTS.theme.primaryColor}
        >
          Continue
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  formSurface: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    backgroundColor: 'transparent',
  },
  halfInput: {
    flex: 1,
  },
  genderContainer: {
    marginVertical: 8,
  },
  genderLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    fontWeight: '500',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  selectedGenderButton: {
    borderColor: CONSTANTS.theme.primaryColor,
    backgroundColor: '#FFF8E1',
  },
  genderButtonText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  selectedGenderButtonText: {
    color: CONSTANTS.theme.primaryColor,
    fontWeight: '600',
  },
  continueButton: {
    paddingVertical: 4,
  },
});

export default ProfileInfoScreen;

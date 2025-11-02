import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Surface, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaperDialog, useDialog } from '../ui/Dialog/PaperDialog';

interface BankAccountForm {
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  branchName: string;
  accountHolderName: string;
  accountType: 'savings' | 'current' | '';
}

interface Props {
  onBankInfoComplete: (bankInfo: BankAccountForm) => void;
}

const BankAccountScreen: React.FC<Props> = ({ onBankInfoComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { visible, config, showDialog, hideDialog } = useDialog();

  const { control, handleSubmit, watch, formState: { errors } } = useForm<BankAccountForm>({
    defaultValues: {
      bankName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      branchName: '',
      accountHolderName: '',
      accountType: '',
    },
  });

  const accountNumber = watch('accountNumber');
  const accountType = watch('accountType');

  const onSubmit = async (data: BankAccountForm) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      onBankInfoComplete(data);
    } catch (error) {
      showDialog('Error', 'Failed to save bank account information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateIFSC = (value: string) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(value) || 'Please enter a valid IFSC code';
  };

  const renderAccountTypeSelector = () => (
    <View style={styles.accountTypeContainer}>
      <Text style={styles.accountTypeLabel}>Account Type *</Text>
      <View style={styles.accountTypeButtons}>
        {[
          { id: 'savings', label: 'Savings', icon: 'piggy-bank' },
          { id: 'current', label: 'Current', icon: 'bank' }
        ].map((type) => (
          <Controller
            key={type.id}
            control={control}
            name="accountType"
            rules={{ required: 'Account type is required' }}
            render={({ field: { onChange } }) => (
              <Surface
                style={[
                  styles.accountTypeButton,
                  accountType === type.id && styles.selectedAccountTypeButton
                ]}
                elevation={accountType === type.id ? 4 : 1}
              >
                <MaterialCommunityIcons 
                  name={type.icon as any} 
                  size={24} 
                  color={accountType === type.id ? CONSTANTS.theme.primaryColor : '#666'} 
                />
                <Text 
                  style={[
                    styles.accountTypeButtonText,
                    accountType === type.id && styles.selectedAccountTypeButtonText
                  ]}
                  onPress={() => onChange(type.id)}
                >
                  {type.label}
                </Text>
              </Surface>
            )}
          />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <MaterialCommunityIcons 
            name="bank" 
            size={48} 
            color={CONSTANTS.theme.primaryColor} 
          />
          <Text variant="headlineMedium" style={styles.title}>
            Bank Account Details
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Add your bank account information for payments
          </Text>
        </View>

        <Surface style={styles.formSurface} elevation={1}>
          <View style={styles.form}>
            <Controller
              control={control}
              name="accountHolderName"
              rules={{ required: 'Account holder name is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="Account Holder Name"
                  placeholder="Enter account holder name"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.accountHolderName}
                  left={<TextInput.Icon icon="account" />}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="bankName"
              rules={{ required: 'Bank name is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="Bank Name"
                  placeholder="Enter bank name"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.bankName}
                  left={<TextInput.Icon icon="bank" />}
                  style={styles.input}
                />
              )}
            />

            {renderAccountTypeSelector()}

            <Controller
              control={control}
              name="accountNumber"
              rules={{
                required: 'Account number is required',
                minLength: {
                  value: 9,
                  message: 'Account number must be at least 9 digits',
                },
                maxLength: {
                  value: 20,
                  message: 'Account number must be at most 20 digits',
                },
                pattern: {
                  value: /^\d+$/,
                  message: 'Account number must contain only digits',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="Account Number"
                  placeholder="Enter account number"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.accountNumber}
                  keyboardType="numeric"
                  secureTextEntry
                  left={<TextInput.Icon icon="credit-card" />}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmAccountNumber"
              rules={{
                required: 'Please confirm your account number',
                validate: (value) =>
                  value === accountNumber || 'Account numbers do not match',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="Confirm Account Number"
                  placeholder="Re-enter account number"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.confirmAccountNumber}
                  keyboardType="numeric"
                  left={<TextInput.Icon icon="credit-card-check" />}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="ifscCode"
              rules={{
                required: 'IFSC code is required',
                validate: validateIFSC,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="IFSC Code"
                  placeholder="Enter IFSC code (e.g., SBIN0001234)"
                  value={value.toUpperCase()}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(text.toUpperCase())}
                  error={!!errors.ifscCode}
                  maxLength={11}
                  autoCapitalize="characters"
                  left={<TextInput.Icon icon="code-string" />}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="branchName"
              rules={{ required: 'Branch name is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="Branch Name"
                  placeholder="Enter branch name"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.branchName}
                  left={<TextInput.Icon icon="map-marker" />}
                  style={styles.input}
                />
              )}
            />
          </View>
        </Surface>

        <Surface style={styles.infoCard} elevation={1}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="information" size={20} color="#2196F3" />
            <Text variant="titleSmall" style={styles.infoTitle}>Important Information</Text>
          </View>
          <View style={styles.infoContent}>
            <Text variant="bodySmall" style={styles.infoText}>
              • Ensure the account holder name matches your driving license
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • Your earnings will be directly transferred to this account
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • You can update bank details later from the profile section
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • Bank verification may take 1-2 business days
            </Text>
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
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
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
    backgroundColor: '#FFF8DC',
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: '#333',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
  },
  formSurface: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  accountTypeContainer: {
    marginVertical: 8,
  },
  accountTypeLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    fontWeight: '500',
  },
  accountTypeButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  accountTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  selectedAccountTypeButton: {
    borderWidth: 2,
    borderColor: CONSTANTS.theme.primaryColor,
    backgroundColor: '#FFF8E1',
  },
  accountTypeButtonText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedAccountTypeButtonText: {
    color: CONSTANTS.theme.primaryColor,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    color: '#333',
    marginLeft: 8,
    fontWeight: '600',
  },
  infoContent: {
    gap: 8,
  },
  infoText: {
    color: '#666',
    lineHeight: 20,
  },
  continueButton: {
    paddingVertical: 4,
  },
});

export default BankAccountScreen;

/**
 * SearchingUI Component
 * 
 * Animated searching indicator for "Looking for riders" state
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming,
} from 'react-native-reanimated';

const THEME = {
  primary: '#ED8902',
  text: '#000000',
  textSecondary: '#666666',
  surface: '#F5F5F5',
  border: '#E0E0E0',
};

interface SearchingUIProps {
  onCancel: () => void;
}

const cancellationReasons = [
  'Change of plans',
  'Found another ride',
  'Wrong destination',
  'Too long wait time',
  'Price too high',
  'Other',
];

const SearchingUI: React.FC<SearchingUIProps> = ({ onCancel }) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Pulse animation
    scale.value = withRepeat(
      withTiming(1.2, { duration: 1000 }),
      -1,
      true
    );

    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,
      false
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    if (selectedReason) {
      console.log('🚫 Ride cancelled. Reason:', selectedReason);
      setShowCancelDialog(false);
      setSelectedReason(null);
      onCancel();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <MaterialCommunityIcons name="map-search" size={64} color={THEME.primary} />
      </Animated.View>
      <Text variant="headlineSmall" style={styles.title}>Looking for riders...</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        We're finding the best match for you
      </Text>

      {/* Cancel Ride Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={handleCancel}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
        <Text style={styles.cancelButtonText}>Cancel Ride</Text>
      </TouchableOpacity>

      {/* Cancellation Reason Dialog */}
      <Portal>
        <Dialog
          visible={showCancelDialog}
          onDismiss={() => {
            setShowCancelDialog(false);
            setSelectedReason(null);
          }}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Cancel Ride</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogMessage}>
              Please select a reason for cancellation:
            </Text>
            <ScrollView style={styles.reasonsList} showsVerticalScrollIndicator={false}>
              {cancellationReasons.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonOption,
                    selectedReason === reason && styles.reasonOptionSelected,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.radioButton,
                    selectedReason === reason && styles.radioButtonSelected,
                  ]}>
                    {selectedReason === reason && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={[
                    styles.reasonText,
                    selectedReason === reason && styles.reasonTextSelected,
                  ]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              onPress={() => {
                setShowCancelDialog(false);
                setSelectedReason(null);
              }}
              textColor={THEME.textSecondary}
            >
              Keep Searching
            </Button>
            <Button
              onPress={handleConfirmCancel}
              disabled={!selectedReason}
              buttonColor="#EF4444"
              textColor="white"
            >
              Cancel Ride
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    color: THEME.text,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#EF4444',
    gap: 8,
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  dialogTitle: {
    color: THEME.text,
    fontWeight: '700',
  },
  dialogMessage: {
    color: THEME.textSecondary,
    marginBottom: 16,
  },
  reasonsList: {
    maxHeight: 300,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  reasonOptionSelected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: THEME.textSecondary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#EF4444',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  reasonText: {
    color: THEME.text,
    fontSize: 16,
    flex: 1,
  },
  reasonTextSelected: {
    color: '#EF4444',
    fontWeight: '600',
  },
  dialogActions: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});

export default SearchingUI;


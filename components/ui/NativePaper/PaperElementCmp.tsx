import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, Paragraph, Portal } from 'react-native-paper';

interface AppAlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showActions?: boolean;
}

const AppAlert: React.FC<AppAlertProps> = ({
  visible,
  title = 'Notice',
  message = '',
  type = 'info',
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showActions = true,
}) => {
  const getIconColor = () => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      default: return '#2196F3';
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
        <View style={styles.iconContainer}>
          <IconButton icon="information" size={30} iconColor={getIconColor()} />
        </View>
        <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        <Dialog.Content>
          <Paragraph style={styles.message}>{message}</Paragraph>
        </Dialog.Content>

        {showActions && (
          <Dialog.Actions>
            {onConfirm ? (
              <>
                <Button onPress={onClose}>{cancelText}</Button>
                <Button onPress={onConfirm}>{confirmText}</Button>
              </>
            ) : (
              <Button onPress={onClose}>{confirmText}</Button>
            )}
          </Dialog.Actions>
        )}
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 16,
    marginHorizontal: 16,
  },
  iconContainer: {
    alignSelf: 'center',
    marginTop: 10,
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
  },
});

export default AppAlert;

import React from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, Portal, Button, Text, Paragraph } from 'react-native-paper';

interface DialogAction {
  label: string;
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained';
  style?: 'default' | 'cancel' | 'destructive';
}

interface PaperDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message?: string;
  actions?: DialogAction[];
  dismissable?: boolean;
}

/**
 * A customizable dialog component using React Native Paper
 * This replaces Alert.alert from React Native
 */
export const PaperDialog: React.FC<PaperDialogProps> = ({
  visible,
  onDismiss,
  title,
  message,
  actions = [{ label: 'OK', onPress: onDismiss }],
  dismissable = true,
}) => {
  const getButtonColor = (style?: string) => {
    switch (style) {
      case 'destructive':
        return '#FF5252';
      case 'cancel':
        return '#757575';
      default:
        return '#2196F3';
    }
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={dismissable ? onDismiss : undefined}
        dismissable={dismissable}
        style={styles.dialog}
      >
        <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        {message && (
          <Dialog.Content>
            <Paragraph style={styles.message}>{message}</Paragraph>
          </Dialog.Content>
        )}
        <Dialog.Actions style={styles.actions}>
          {actions.map((action, index) => (
            <Button
              key={index}
              mode={action.mode || 'text'}
              onPress={() => {
                action.onPress();
                onDismiss();
              }}
              textColor={getButtonColor(action.style)}
              style={styles.button}
            >
              {action.label}
            </Button>
          ))}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: 'white',
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  actions: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  button: {
    marginLeft: 8,
  },
});

// Hook for managing dialog state
export const useDialog = () => {
  const [visible, setVisible] = React.useState(false);
  const [config, setConfig] = React.useState<{
    title: string;
    message?: string;
    actions?: DialogAction[];
  }>({
    title: '',
    message: '',
    actions: [],
  });

  const showDialog = (
    title: string,
    message?: string,
    actions?: DialogAction[]
  ) => {
    setConfig({ title, message, actions });
    setVisible(true);
  };

  const hideDialog = () => {
    setVisible(false);
  };

  return {
    visible,
    config,
    showDialog,
    hideDialog,
  };
};

export default PaperDialog;


import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
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

// Theme colors for dialog
const DIALOG_THEME = {
  background: '#1A1A1A',
  surface: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  accent: '#00D4FF',
  destructive: '#FF5252',
  cancel: '#808080',
};

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const getButtonColor = (style?: string) => {
    switch (style) {
      case 'destructive':
        return DIALOG_THEME.destructive;
      case 'cancel':
        return DIALOG_THEME.cancel;
      default:
        return DIALOG_THEME.accent;
    }
  };

  return (
    <Portal>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
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
      </Animated.View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: DIALOG_THEME.background,
    borderRadius: 20,
    marginTop: 100,
    borderWidth: 1,
    borderColor: '#333333',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: DIALOG_THEME.text,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: DIALOG_THEME.textSecondary,
    fontWeight: '400',
  },
  actions: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  button: {
    marginLeft: 8,
    borderRadius: 12,
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


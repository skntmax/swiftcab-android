import React from "react";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";

type AppButtonProps = {
  mode?: "text" | "outlined" | "contained"; // paper button modes
  label: string; // button text
  onPress: () => void; // click handler
  icon?: string; // optional paper icon
  loading?: boolean; // show loader
  disabled?: boolean;
  color?: string; // custom text or background color
  style?: object; // custom styles
};

const AppButton: React.FC<AppButtonProps> = ({
  mode = "contained",
  label,
  onPress,
  icon,
  loading = false,
  disabled = false,
  color,
  style,
}) => {
  return (
    <Button
      mode={mode}
      onPress={onPress}
      icon={icon}
      loading={loading}
      disabled={disabled}
      style={[styles.button, style]}
      textColor={mode === "contained" ? "#fff" : color}
      buttonColor={mode === "contained" ? color || "#6200ee" : undefined}
      contentStyle={styles.content}
      labelStyle={styles.label}
    >
      {label}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
    borderRadius: 8,
  },
  content: {
    paddingVertical: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AppButton;

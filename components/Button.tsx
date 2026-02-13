import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  fullWidth = true,
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <Pressable
      style={[
        styles.button,
        variant === "primary" ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.text,
          variant === "primary" ? styles.primaryText : styles.secondaryText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    button: {
      borderRadius: 24,
      paddingVertical: 14,
      alignItems: "center",
    },
    fullWidth: {
      width: "100%",
    },
    primary: {
      backgroundColor: isDark ? "#FFFFFF" : colors.blue,
    },
    secondary: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.text,
    },
    disabled: {
      backgroundColor: colors.surface,
      borderColor: colors.surface,
    },
    text: {
      fontSize: 16,
      fontWeight: "600",
    },
    primaryText: {
      color: isDark ? "#111111" : "#FFFFFF",
    },
    secondaryText: {
      color: colors.text,
    },
  });

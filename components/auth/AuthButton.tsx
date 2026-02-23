import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface AuthButtonProps {
  onPress: () => void;
  children: string;
  disabled?: boolean;
  loading?: boolean;
}

export default function AuthButton({
  onPress,
  children,
  disabled = false,
  loading = false,
}: AuthButtonProps) {
  const isDisabled = disabled || loading;
  const { fonts } = useTheme();

  return (
    <Pressable
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#111111" />
      ) : (
        <Text style={[styles.buttonText, { fontFamily: fonts.semiBold }]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "600",
  },
});

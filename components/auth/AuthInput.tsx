import { FontAwesome } from "@expo/vector-icons";
import {
    Pressable,
    StyleSheet,
    TextInput,
    TextInputProps,
    View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface AuthInputProps extends TextInputProps {
  icon: keyof typeof FontAwesome.glyphMap;
  iconSize?: number;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onTogglePassword?: () => void;
}

export default function AuthInput({
  icon,
  iconSize = 16,
  showPasswordToggle = false,
  isPasswordVisible = false,
  onTogglePassword,
  ...textInputProps
}: AuthInputProps) {
  const { fonts } = useTheme();
  return (
    <View style={styles.inputRow}>
      <FontAwesome name={icon} size={iconSize} color="#8B8B8B" />
      <TextInput
        placeholderTextColor="#8B8B8B"
        style={[styles.input, { fontFamily: fonts.regular }]}
        {...textInputProps}
      />
      {showPasswordToggle && (
        <Pressable onPress={onTogglePassword} hitSlop={10}>
          <FontAwesome
            name={isPasswordVisible ? "eye" : "eye-slash"}
            size={16}
            color="#8B8B8B"
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#1E1F23",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
  },
});

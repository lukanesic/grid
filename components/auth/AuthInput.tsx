import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

interface AuthInputProps extends TextInputProps {
  icon: keyof typeof FontAwesome.glyphMap;
  iconSize?: number;
}

export default function AuthInput({
  icon,
  iconSize = 16,
  ...textInputProps
}: AuthInputProps) {
  return (
    <View style={styles.inputRow}>
      <FontAwesome name={icon} size={iconSize} color="#8B8B8B" />
      <TextInput
        placeholderTextColor="#8B8B8B"
        style={styles.input}
        {...textInputProps}
      />
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

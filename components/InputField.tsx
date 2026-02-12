import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

interface InputFieldProps extends TextInputProps {
  icon: string;
}

export default function InputField({ icon, ...props }: InputFieldProps) {
  return (
    <View style={styles.container}>
      <FontAwesome name={icon as any} size={16} color="#8B8B8B" />
      <TextInput
        style={styles.input}
        placeholderTextColor="#8B8B8B"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#1E1F23",
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
  },
});

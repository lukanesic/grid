import { Pressable, StyleSheet, Text } from "react-native";

interface AuthButtonProps {
  onPress: () => void;
  children: string;
}

export default function AuthButton({ onPress, children }: AuthButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{children}</Text>
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
  buttonText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "600",
  },
});

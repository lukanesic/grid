import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";

interface AuthBackButtonProps {
  onPress: () => void;
  text?: string;
}

export default function AuthBackButton({
  onPress,
  text = "Nazad",
}: AuthBackButtonProps) {
  return (
    <Pressable style={styles.backRow} onPress={onPress}>
      <FontAwesome name="chevron-left" size={14} color="#E6E6E6" />
      <Text style={styles.backText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backRow: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: {
    color: "#E6E6E6",
    fontSize: 14,
  },
});

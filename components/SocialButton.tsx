import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface SocialButtonProps {
  provider: "apple" | "google";
  onPress: () => void;
}

export default function SocialButton({ provider, onPress }: SocialButtonProps) {
  const { fonts } = useTheme();
  const icon = provider === "apple" ? "apple" : "google";
  const label = provider === "apple" ? "Nastavi sa Apple" : "Nastavi sa Google";

  return (
    <Pressable style={styles.button} onPress={onPress}>
      <FontAwesome name={icon} size={18} color="#FFFFFF" />
      <Text style={[styles.text, { fontFamily: fonts.semiBold }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#1E1F23",
    borderRadius: 12,
    paddingVertical: 12,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

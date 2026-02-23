import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface AuthSocialButtonProps {
  icon: keyof typeof FontAwesome.glyphMap;
  onPress: () => void;
  children: string;
}

export default function AuthSocialButton({
  icon,
  onPress,
  children,
}: AuthSocialButtonProps) {
  const { fonts } = useTheme();
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <FontAwesome name={icon} size={18} color="#FFFFFF" />
      <Text style={[styles.buttonText, { fontFamily: fonts.semiBold }]}>
        {children}
      </Text>
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
    marginBottom: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

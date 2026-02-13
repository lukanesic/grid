import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export default function IconButton({
  icon,
  onPress,
  size = 20,
  color,
  backgroundColor = "transparent",
}: IconButtonProps) {
  const { colors } = useTheme();
  const iconColor = color || colors.text;

  return (
    <Pressable style={[styles.button, { backgroundColor }]} onPress={onPress}>
      <FontAwesome name={icon as any} size={size} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

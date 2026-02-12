import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  withBorder?: boolean;
}

export default function IconButton({
  icon,
  onPress,
  size = 20,
  color = "#E6E6E6",
  backgroundColor = "transparent",
  withBorder = true,
}: IconButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor },
        withBorder && styles.withBorder,
      ]}
      onPress={onPress}
    >
      <FontAwesome name={icon as any} size={size} color={color} />
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
  withBorder: {
    borderWidth: 1,
    borderColor: "#2C2C2C",
  },
});

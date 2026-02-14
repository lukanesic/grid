import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface MenuCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: "surface" | "soft";
}

export default function MenuCard({
  children,
  style,
  tone = "surface",
}: MenuCardProps) {
  const { colors, isDark } = useTheme();
  const backgroundColor =
    tone === "soft"
      ? isDark
        ? "#1E1F23"
        : colors.surface
      : isDark
        ? "#121418"
        : colors.surface;

  return (
    <View style={[styles.card, { backgroundColor }, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
});

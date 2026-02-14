import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface MenuInfoCardProps {
  icon: any;
  text: string;
  iconColor?: string;
}

export default function MenuInfoCard({
  icon,
  text,
  iconColor,
}: MenuInfoCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.infoCard,
        { backgroundColor: isDark ? "#1E1F23" : colors.surface },
      ]}
    >
      <FontAwesome name={icon} size={16} color={iconColor ?? colors.blue} />
      <Text style={[styles.infoText, { color: colors.textSecondary }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

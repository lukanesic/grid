import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface ActionCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export default function ActionCard({
  icon,
  title,
  subtitle,
  onPress,
}: ActionCardProps) {
  const { colors, isDark, fonts } = useTheme();
  const styles = getStyles(colors, fonts);

  return (
    <Pressable style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIcon}>
        <FontAwesome
          name={icon as any}
          size={20}
          color={isDark ? colors.accent : colors.blue}
        />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const getStyles = (colors: any, fonts: any) =>
  StyleSheet.create({
    actionCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
      fontFamily: fonts.semiBold,
    },
    actionSubtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      fontFamily: fonts.regular,
    },
  });

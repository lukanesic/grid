import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface ActivityCardProps {
  icon: string;
  title: string;
  description: string;
  time: string;
}

export function ActivityCard({
  icon,
  title,
  description,
  time,
}: ActivityCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.activityCard}>
      <View style={styles.activityIcon}>
        <FontAwesome name={icon as any} size={16} color={colors.accent} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityDesc}>{description}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    activityCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-start",
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(184, 255, 0, 0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    activityContent: {
      flex: 1,
      gap: 4,
    },
    activityTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
    },
    activityDesc: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    activityTime: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
  });

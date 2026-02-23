import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface NotificationSectionProps {
  title: string;
  children: ReactNode;
}

export default function NotificationSection({
  title,
  children,
}: NotificationSectionProps) {
  const { colors, fonts } = useTheme();
  const styles = getStyles(colors, fonts);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const getStyles = (colors: any, fonts: any) =>
  StyleSheet.create({
    section: {
      marginBottom: 20,
    },
    title: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      fontFamily: fonts.semiBold,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 6,
    },
  });

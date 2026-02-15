import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesome } from "@expo/vector-icons";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface InfoCardProps {
  icon: string;
  title: string;
  value?: string;
  subtitle?: string;
  variant?: "small" | "medium" | "large" | "wide";
  badge?: string;
  children?: ReactNode;
}

export function InfoCard({
  icon,
  title,
  value,
  subtitle,
  variant = "medium",
  badge,
  children,
}: InfoCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const containerStyle =
    variant === "small"
      ? styles.infoCardSmall
      : variant === "wide"
        ? styles.infoCardWide
        : variant === "large"
          ? styles.infoCardLarge
          : styles.infoCard;

  const valueStyle =
    variant === "small" || variant === "large"
      ? styles.infoValueLarge
      : styles.infoValue;

  return (
    <View style={containerStyle}>
      <View style={styles.infoTitleRow}>
        <FontAwesome
          name={icon as any}
          size={14}
          color={colors.textSecondary}
        />
        <Text style={styles.infoTitle}>{title}</Text>
      </View>

      {badge && (
        <View style={styles.infoRowBetween}>
          <View>{value && <Text style={valueStyle}>{value}</Text>}</View>
          <Text style={styles.infoBadge}>{badge}</Text>
        </View>
      )}

      {!badge && value && <Text style={valueStyle}>{value}</Text>}

      {subtitle && <Text style={styles.infoSub}>{subtitle}</Text>}

      {children}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    infoCard: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      minHeight: 110,
      justifyContent: "space-between",
    },
    infoCardSmall: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      minHeight: 110,
      justifyContent: "space-between",
    },
    infoCardLarge: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      minHeight: 110,
      justifyContent: "space-between",
    },
    infoCardWide: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      gap: 12,
    },
    infoTitle: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    infoTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    infoValue: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    infoValueLarge: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "700",
    },
    infoSub: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    infoRowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    infoBadge: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: "700",
    },
  });

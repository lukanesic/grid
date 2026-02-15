import { useTheme } from "@/contexts/ThemeContext";
import { Pressable, StyleSheet, Text } from "react-native";

interface StatItemProps {
  number: number;
  label: string;
  onPress?: () => void;
}

export function StatItem({ number, label, onPress }: StatItemProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Pressable style={styles.statItem} onPress={onPress}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    statItem: {
      alignItems: "center",
    },
    statNumber: {
      color: colors.text,
      fontSize: 32,
      fontWeight: "700",
      marginBottom: 4,
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 14,
    },
  });

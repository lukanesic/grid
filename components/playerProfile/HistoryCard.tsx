import { useTheme } from "@/contexts/ThemeContext";
import { StyleSheet, Text, View } from "react-native";

interface HistoryCardProps {
  type: string;
  date: string;
  location: string;
  duration: string;
  level: string;
  result: string;
  win: boolean;
  teamA: string;
  teamB: string;
}

export function HistoryCard({
  type,
  date,
  location,
  duration,
  level,
  result,
  win,
  teamA,
  teamB,
}: HistoryCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyType}>{type}</Text>
        <Text style={styles.historyDate}>{date}</Text>
      </View>
      <Text style={styles.historyLocation}>{location}</Text>

      <View style={styles.historyMetaRow}>
        <View style={styles.historyTag}>
          <Text style={styles.historyTagText}>{duration}</Text>
        </View>
        <View style={styles.historyTag}>
          <Text style={styles.historyTagText}>{level}</Text>
        </View>
        <View
          style={[styles.resultTag, win ? styles.resultWin : styles.resultLoss]}
        >
          <Text style={styles.resultTagText}>{result}</Text>
        </View>
      </View>

      <View style={styles.historyTeams}>
        <View style={styles.teamRow}>
          <View style={styles.teamDot} />
          <Text style={styles.teamName}>{teamA}</Text>
        </View>
        <View style={styles.teamRow}>
          <View style={styles.teamDotMuted} />
          <Text style={styles.teamNameMuted}>{teamB}</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    historyCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      gap: 12,
    },
    historyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    historyType: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    historyDate: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    historyLocation: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    historyMetaRow: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
    },
    historyTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: colors.surface,
    },
    historyTagText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
    },
    resultTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    resultWin: {
      backgroundColor: "rgba(184, 255, 0, 0.15)",
    },
    resultLoss: {
      backgroundColor: "rgba(255, 68, 68, 0.15)",
    },
    resultTagText: {
      color: colors.text,
      fontSize: 11,
      fontWeight: "700",
    },
    historyTeams: {
      gap: 6,
    },
    teamRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    teamDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
    },
    teamDotMuted: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    teamName: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
    },
    teamNameMuted: {
      color: colors.textSecondary,
      fontSize: 13,
    },
  });

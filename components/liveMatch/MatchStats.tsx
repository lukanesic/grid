import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MatchStatsProps {
  matchTime: number;
  currentSet: number;
  location: string;
  level: string;
}

export default function MatchStats({
  matchTime,
  currentSet,
  location,
  level,
}: MatchStatsProps) {
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}min` : `${mins}min`;
  };

  return (
    <View style={styles.statsSection}>
      <Text style={styles.statsTitle}>STATISTIKE MEČA</Text>
      <View style={styles.statsList}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Vreme igre</Text>
          <Text style={styles.statValue}>{formatTime(matchTime)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Trenutni set</Text>
          <Text style={styles.statValue}>{currentSet}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Lokacija</Text>
          <Text style={styles.statValue}>{location.split(" · ")[0]}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Nivo meča</Text>
          <Text style={styles.statValue}>{level}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsSection: {
    marginBottom: 32,
  },
  statsTitle: {
    color: "#8B8B8B",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 16,
  },
  statsList: {
    backgroundColor: "#121418",
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F23",
  },
  statLabel: {
    color: "#8B8B8B",
    fontSize: 14,
  },
  statValue: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
  },
});

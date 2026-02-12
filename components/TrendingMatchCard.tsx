import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface TrendingMatchCardProps {
  id: string;
  type: string;
  date: string;
  location: string;
  duration: string;
  level: string;
  participants: number;
  prize: string;
  onPress: () => void;
}

export default function TrendingMatchCard({
  type,
  date,
  location,
  duration,
  level,
  participants,
  prize,
  onPress,
}: TrendingMatchCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.type}>{type}</Text>
        <FontAwesome name="line-chart" size={16} color="#3867FF" />
      </View>

      <Text style={styles.date}>{date}</Text>
      <Text style={styles.location}>{location}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaTag}>
          <Text style={styles.metaTagText}>{duration}</Text>
        </View>
        <View style={styles.metaTag}>
          <Text style={styles.metaTagText}>{level}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statText}>{participants} učesnika</Text>
        </View>
      </View>

      <View style={styles.prizeContainer}>
        <Text style={styles.prizeText}>{prize}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    backgroundColor: "#121418",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    position: "relative",
    borderWidth: 2,
    borderColor: "#3867FF",
  },
  trendingBadge: {
    position: "absolute",
    top: -8,
    left: 16,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  trendingText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  type: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  date: {
    color: "#B8FF00",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  location: {
    color: "#8B8B8B",
    fontSize: 13,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  metaTag: {
    backgroundColor: "#1E1F23",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaTagText: {
    color: "#F2F2F2",
    fontSize: 11,
    fontWeight: "600",
  },
  statsRow: {
    marginBottom: 12,
  },
  stat: {
    marginBottom: 4,
  },
  statText: {
    color: "#B8FF00",
    fontSize: 12,
    fontWeight: "600",
  },
  prizeContainer: {
    backgroundColor: "#1A1A1A",
    padding: 12,
    borderRadius: 12,
  },
  prizeText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "700",
  },
});

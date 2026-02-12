import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface HotPlayerCardProps {
  name: string;
  level: string;
  percentage: number;
  avatar: string;
  hotReason: string;
  wins: number;
  onAddPress: () => void;
  onPress?: () => void;
}

export default function HotPlayerCard({
  name,
  level,
  percentage,
  avatar,
  hotReason,
  wins,
  onAddPress,
  onPress,
}: HotPlayerCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: avatar }} style={styles.avatar} />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>

        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Nivo:</Text>
          <Text style={styles.levelValue}>{level}</Text>
        </View>

        <View style={styles.reasonContainer}>
          <Text style={styles.hotReason}>{hotReason}</Text>
        </View>

        <View style={styles.percentageContainer}>
          <Text style={styles.percentage}>{percentage}%</Text>
          <Text style={styles.percentageLabel}>poklapanje</Text>
        </View>

        <View style={styles.winsContainer}>
          <Text style={styles.winsText}>{wins} pobeda</Text>
        </View>
      </View>

      <Pressable style={styles.addButton} onPress={onAddPress}>
        <FontAwesome name="plus" size={16} color="#0B0B0B" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: "#121418",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    position: "relative",
    borderWidth: 1,
    borderColor: "#3867FF",
  },
  hotBadge: {
    position: "absolute",
    top: -8,
    right: 8,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  hotBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#3867FF",
  },
  info: {
    flex: 1,
    alignItems: "center",
  },
  name: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    minHeight: 36,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  levelLabel: {
    color: "#8B8B8B",
    fontSize: 12,
    marginRight: 4,
  },
  levelValue: {
    color: "#FF6B35",
    fontSize: 12,
    fontWeight: "600",
  },
  reasonContainer: {
    backgroundColor: "#1A1B20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  hotReason: {
    color: "#FF6B35",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  percentageContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  percentage: {
    color: "#B8FF00",
    fontSize: 20,
    fontWeight: "700",
  },
  percentageLabel: {
    color: "#8B8B8B",
    fontSize: 10,
  },
  winsContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  winsText: {
    color: "#FFD700",
    fontSize: 11,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#B8FF00",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
});

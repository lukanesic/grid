import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface CircleCardProps {
  id: string;
  name: string;
  type: "friends" | "club" | "tournament" | "training";
  members: number;
  image: string;
  activity: string;
  lastActivity: string;
  description: string;
  isCreator: boolean;
  onPress: () => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "friends":
      return "users";
    case "club":
      return "home";
    case "tournament":
      return "trophy";
    case "training":
      return "graduation-cap";
    default:
      return "users";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "friends":
      return "#B8FF00";
    case "club":
      return "#3867FF";
    case "tournament":
      return "#FF6B35";
    case "training":
      return "#9333EA";
    default:
      return "#B8FF00";
  }
};

const getActivityColor = (activity: string) => {
  switch (activity) {
    case "Veoma aktivan":
      return "#22C55E";
    case "Aktivan":
      return "#B8FF00";
    case "Umeren":
      return "#F59E0B";
    case "Neaktivan":
      return "#8B8B8B";
    default:
      return "#B8FF00";
  }
};

export default function CircleCard({
  name,
  type,
  members,
  image,
  activity,
  lastActivity,
  description,
  isCreator,
  onPress,
}: CircleCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.circleImage} />
          <View
            style={[
              styles.typeIndicator,
              { backgroundColor: getTypeColor(type) },
            ]}
          >
            <FontAwesome name={getTypeIcon(type)} size={10} color="#000000" />
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.circleName} numberOfLines={1}>
              {name}
            </Text>
            {isCreator && (
              <View style={styles.creatorBadge}>
                <FontAwesome name="star" size={10} color="#FFD700" />
              </View>
            )}
          </View>

          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.membersStat}>
              <FontAwesome name="users" size={12} color="#8B8B8B" />
              <Text style={styles.membersCount}>{members} članova</Text>
            </View>

            <View
              style={[
                styles.activityBadge,
                { backgroundColor: getActivityColor(activity) },
              ]}
            >
              <Text style={styles.activityText}>{activity}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.activityRow}>
          <FontAwesome name="clock-o" size={12} color="#8B8B8B" />
          <Text style={styles.lastActivityText} numberOfLines={1}>
            {lastActivity}
          </Text>
        </View>

        <FontAwesome name="chevron-right" size={14} color="#8B8B8B" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1F23",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2C2C2C",
  },
  header: {
    flexDirection: "row",
    marginBottom: 12,
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  circleImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2C2C2C",
  },
  typeIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1E1F23",
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  circleName: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  creatorBadge: {
    marginLeft: 6,
  },
  description: {
    color: "#8B8B8B",
    fontSize: 13,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  membersStat: {
    flexDirection: "row",
    alignItems: "center",
  },
  membersCount: {
    color: "#8B8B8B",
    fontSize: 12,
    marginLeft: 4,
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activityText: {
    color: "#000000",
    fontSize: 10,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2C2C2C",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  lastActivityText: {
    color: "#8B8B8B",
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
});

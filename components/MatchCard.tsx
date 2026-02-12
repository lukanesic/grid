import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface MatchCardProps {
  id: string;
  type: string;
  date: string;
  location: string;
  duration: string;
  level: string;
  onPress?: () => void;
}

export default function MatchCard({
  id,
  type,
  date,
  location,
  duration,
  level,
  onPress,
}: MatchCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.icon}>
        <FontAwesome name="circle-o" size={24} color="#E9EDF5" />
      </View>
      <View style={styles.info}>
        <Text style={styles.type}>{type}</Text>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.location}>{location}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#1E1F23",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginRight: 12,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2C2C2C",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  type: {
    color: "#F2F2F2",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  date: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  location: {
    color: "#8B8B8B",
    fontSize: 12,
    marginTop: 4,
  },
});

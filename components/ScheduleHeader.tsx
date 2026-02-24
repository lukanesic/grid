import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ScheduleHeaderProps {
  onSearchPress?: () => void;
  onCalendarPress?: () => void;
}

export default function ScheduleHeader({
  onSearchPress,
  onCalendarPress,
}: ScheduleHeaderProps) {
  return (
    <LinearGradient
      colors={["#7CB342", "#558B2F"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.overlay} />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <Pressable style={styles.iconButton} onPress={onSearchPress}>
            <FontAwesome name="search" size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={onCalendarPress}>
            <FontAwesome name="calendar" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
        <Text style={styles.headerTitle}>Scores and Schedule</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 200,
    width: "100%",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

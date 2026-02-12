import { StyleSheet, Text, View } from "react-native";

interface BadgeProps {
  count: number;
}

export default function Badge({ count }: BadgeProps) {
  if (count === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});

import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface NotificationItemProps {
  name: string;
  message: string;
  timeLabel: string;
  statusColor: string;
  statusIcon: string;
  showDivider?: boolean;
}

export default function NotificationItem({
  name,
  message,
  timeLabel,
  statusColor,
  statusIcon,
  showDivider = false,
}: NotificationItemProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <View style={[styles.row, showDivider && styles.rowDivider]}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <FontAwesome name={statusIcon as any} size={10} color="#111111" />
        </View>
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowText}>
          <Text style={styles.rowName}>{name}</Text> {message}
        </Text>
        <Text style={styles.rowTime}>{timeLabel}</Text>
      </View>

      <View style={styles.unreadDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F23",
  },
  avatarWrap: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2C2C2C",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
  },
  statusBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#121418",
  },
  rowContent: {
    flex: 1,
    gap: 6,
  },
  rowText: {
    color: "#D1D1D1",
    fontSize: 14,
    lineHeight: 20,
  },
  rowName: {
    color: "#F2F2F2",
    fontWeight: "700",
  },
  rowTime: {
    color: "#8B8B8B",
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4F7DFF",
  },
});

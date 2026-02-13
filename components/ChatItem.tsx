import { FontAwesome } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ChatItemProps {
  name: string;
  message: string;
  time: string;
  avatar: string;
  unreadCount?: number;
  isOnline?: boolean;
  isRead?: boolean;
  isGroup?: boolean;
  groupAvatars?: string[];
  onPress?: () => void;
}

export default function ChatItem({
  name,
  message,
  time,
  avatar,
  unreadCount,
  isOnline = false,
  isRead = false,
  isGroup = false,
  groupAvatars,
  onPress,
}: ChatItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        {isGroup && groupAvatars && groupAvatars.length >= 2 ? (
          <View style={styles.groupAvatarContainer}>
            <Image
              source={{ uri: groupAvatars[0] }}
              style={styles.groupAvatar1}
            />
            <Image
              source={{ uri: groupAvatars[1] }}
              style={styles.groupAvatar2}
            />
          </View>
        ) : (
          <>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View
              style={[
                styles.statusBorder,
                { borderColor: isOnline ? "#B8FF00" : "#FFD700" },
              ]}
            />
          </>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{name || "Unknown"}</Text>
          <Text style={styles.time}>{time || ""}</Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.messageContainer}>
            {isRead && (
              <View style={styles.checkContainer}>
                <FontAwesome
                  name="check"
                  size={12}
                  color="#B8FF00"
                  style={styles.checkIcon}
                />
                <FontAwesome
                  name="check"
                  size={12}
                  color="#B8FF00"
                  style={styles.checkIcon2}
                />
              </View>
            )}
            <Text style={styles.message} numberOfLines={1}>
              {message || ""}
            </Text>
          </View>
          {unreadCount && unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#0B0B0B",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  groupAvatarContainer: {
    width: 56,
    height: 56,
    position: "relative",
  },
  groupAvatar1: {
    width: 36,
    height: 36,
    borderRadius: 18,
    position: "absolute",
    top: 0,
    left: 0,
    borderWidth: 2,
    borderColor: "#0B0B0B",
  },
  groupAvatar2: {
    width: 36,
    height: 36,
    borderRadius: 18,
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#0B0B0B",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  statusBorder: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
  },
  time: {
    color: "#8B8B8B",
    fontSize: 13,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
  },
  checkIcon: {
    marginRight: -4,
  },
  checkIcon2: {
    marginLeft: -4,
  },
  message: {
    color: "#8B8B8B",
    fontSize: 14,
    flex: 1,
  },
  badge: {
    backgroundColor: "#B8FF00",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: "#0B0B0B",
    fontSize: 11,
    fontWeight: "700",
  },
});

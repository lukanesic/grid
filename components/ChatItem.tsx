import { FontAwesome } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

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
  const { colors, isDark, fonts } = useTheme();
  const styles = getStyles(colors, isDark, fonts);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        {isGroup && groupAvatars && groupAvatars.length >= 2 ? (
          <View style={styles.groupAvatarContainer}>
            <Image
              source={{ uri: groupAvatars[0] }}
              style={[styles.groupAvatar1, { borderColor: colors.background }]}
            />
            <Image
              source={{ uri: groupAvatars[1] }}
              style={[styles.groupAvatar2, { borderColor: colors.background }]}
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
          <Text style={styles.name}>{String(name || "Unknown")}</Text>
          <Text style={styles.time}>{String(time || "")}</Text>
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
              {String(message || "")}
            </Text>
          </View>
          {unreadCount != null && unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{String(unreadCount)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors: any, isDark: boolean, fonts: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.background,
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
    },
    groupAvatar2: {
      width: 36,
      height: 36,
      borderRadius: 18,
      position: "absolute",
      bottom: 0,
      right: 0,
      borderWidth: 2,
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
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
    },
    time: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: fonts.regular,
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
      color: colors.textSecondary,
      fontSize: 14,
      flex: 1,
      fontFamily: fonts.regular,
    },
    badge: {
      backgroundColor: isDark ? colors.accent : colors.blue,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 6,
      marginLeft: 8,
    },
    badgeText: {
      color: colors.background,
      fontSize: 11,
      fontWeight: "700",
      fontFamily: fonts.bold,
    },
  });

import { FontAwesome } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface NotificationItemProps {
  name: string;
  message: string;
  timeLabel: string;
  statusColor: string;
  statusIcon: string;
  showDivider?: boolean;
  isRead?: boolean;
  avatarUrl?: string | null;
  onPress?: () => void;
}

export default function NotificationItem({
  name,
  message,
  timeLabel,
  statusColor,
  statusIcon,
  showDivider = false,
  isRead = false,
  avatarUrl,
  onPress,
}: NotificationItemProps) {
  const { colors, fonts } = useTheme();
  const styles = getStyles(colors, fonts);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <Pressable
      style={[
        styles.row,
        showDivider && styles.rowDivider,
        isRead && styles.rowRead,
      ]}
      onPress={onPress}
    >
      <View style={styles.avatarWrap}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
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

      {!isRead && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

const getStyles = (colors: any, fonts: any) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowRead: {
      opacity: 0.6,
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
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
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
      borderColor: "#000000",
    },
    rowContent: {
      flex: 1,
      gap: 6,
    },
    rowText: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.regular,
    },
    rowName: {
      color: colors.text,
      fontWeight: "700",
      fontFamily: fonts.bold,
    },
    rowTime: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: fonts.regular,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.blue,
    },
  });

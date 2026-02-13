import { FontAwesome } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface Friend {
  id: number;
  name: string;
  username: string;
  avatar: string;
  mutualFriends: number;
  isConnected: boolean;
}

interface FriendCardProps {
  friend: Friend;
  onConnect: () => void;
}

export default function FriendCard({ friend, onConnect }: FriendCardProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);

  const buttonColor = isDark ? colors.accent : colors.blue;

  return (
    <View style={styles.friendCard}>
      <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{friend.name}</Text>
        <Text style={styles.friendUsername}>{friend.username}</Text>
        <Text style={styles.mutualFriends}>
          {friend.mutualFriends} zajedničkih prijatelja
        </Text>
      </View>

      {friend.isConnected ? (
        <View style={[styles.connectedBadge, { backgroundColor: buttonColor }]}>
          <FontAwesome name="check" size={12} color={colors.background} />
          <Text style={styles.connectedText}>Povezani</Text>
        </View>
      ) : (
        <Pressable
          style={[styles.connectButton, { backgroundColor: buttonColor }]}
          onPress={onConnect}
        >
          <Text style={styles.connectButtonText}>Poveži se</Text>
        </Pressable>
      )}
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    friendCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    friendAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      marginRight: 12,
    },
    friendInfo: {
      flex: 1,
    },
    friendName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    friendUsername: {
      color: colors.textSecondary,
      fontSize: 14,
      marginBottom: 4,
    },
    mutualFriends: {
      color: colors.blue,
      fontSize: 12,
      fontWeight: "500",
    },
    connectButton: {
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
    connectButtonText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: "600",
    },
    connectedBadge: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 6,
    },
    connectedText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: "600",
    },
  });

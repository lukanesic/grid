import { FontAwesome } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

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
        <View style={styles.connectedBadge}>
          <FontAwesome name="check" size={12} color="#0B0B0B" />
          <Text style={styles.connectedText}>Povezani</Text>
        </View>
      ) : (
        <Pressable style={styles.connectButton} onPress={onConnect}>
          <Text style={styles.connectButtonText}>Poveži se</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
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
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  friendUsername: {
    color: "#8B8B8B",
    fontSize: 14,
    marginBottom: 4,
  },
  mutualFriends: {
    color: "#3867FF",
    fontSize: 12,
    fontWeight: "500",
  },
  connectButton: {
    backgroundColor: "#B8FF00",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  connectButtonText: {
    color: "#0B0B0B",
    fontSize: 14,
    fontWeight: "600",
  },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B8FF00",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  connectedText: {
    color: "#0B0B0B",
    fontSize: 12,
    fontWeight: "600",
  },
});

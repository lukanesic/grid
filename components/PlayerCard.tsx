import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface PlayerCardProps {
  name: string;
  friendsInCommon: number;
  matchPercentage: number;
  avatar?: string;
  onAddPress: () => void;
}

export default function PlayerCard({
  name,
  friendsInCommon,
  matchPercentage,
  avatar,
  onAddPress,
}: PlayerCardProps) {
  return (
    <View style={styles.card}>
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.image} />
      ) : (
        <View style={styles.image} />
      )}
      <View style={styles.percentageBadge}>
        <Text style={styles.percentageText}>{matchPercentage}%</Text>
      </View>
      <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
        {name}
      </Text>
      <Text style={styles.friendsText}>
        {friendsInCommon} prijatelja zajedničkih
      </Text>
      <Pressable style={styles.addButton} onPress={onAddPress}>
        <Text style={styles.addButtonText}>Dodaj</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: "#1E1F23",
    padding: 12,
    alignItems: "center",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  percentageBadge: {
    position: "absolute",
    top: 20,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#111111",
    borderWidth: 2,
    borderColor: "#B8FF00",
    alignItems: "center",
    justifyContent: "center",
  },
  percentageText: {
    color: "#B8FF00",
    fontSize: 12,
    fontWeight: "700",
  },
  name: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
  },
  friendsText: {
    color: "#8B8B8B",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  addButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#3867FF",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

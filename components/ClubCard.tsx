import { FontAwesome } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface ClubCardProps {
  id: string;
  name: string;
  image: string;
  distance: string;
  price: string;
  onPress: () => void;
}

export default function ClubCard({
  id,
  name,
  image,
  distance,
  price,
  onPress,
}: ClubCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {name}
        </Text>
        <View style={styles.infoRow}>
          <FontAwesome name="map-marker" size={12} color="#8B8B8B" />
          <Text style={styles.distance}>{distance}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>{price}</Text>
          <FontAwesome name="chevron-right" size={14} color="#8B8B8B" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: "#1E1F23",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 140,
  },
  content: {
    padding: 12,
  },
  name: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  distance: {
    color: "#8B8B8B",
    fontSize: 13,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    color: "#B8FF00",
    fontSize: 16,
    fontWeight: "700",
  },
});

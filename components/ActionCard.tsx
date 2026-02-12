import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ActionCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export default function ActionCard({
  icon,
  title,
  subtitle,
  onPress,
}: ActionCardProps) {
  return (
    <Pressable style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIcon}>
        <FontAwesome name={icon as any} size={20} color="#B8FF00" />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <FontAwesome name="chevron-right" size={16} color="#8B8B8B" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1E1F23",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  actionSubtitle: {
    color: "#8B8B8B",
    fontSize: 14,
  },
});

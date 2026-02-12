import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle: string;
}

export default function EmptyState({
  icon = "users",
  title,
  subtitle,
}: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <FontAwesome name={icon as any} size={48} color="#3D3D3D" />
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateSubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateTitle: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: "#8B8B8B",
    fontSize: 14,
    textAlign: "center",
  },
});

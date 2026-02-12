import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface NotificationSectionProps {
  title: string;
  children: ReactNode;
}

export default function NotificationSection({
  title,
  children,
}: NotificationSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  title: {
    color: "#8B8B8B",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: "#121418",
    borderRadius: 16,
    paddingVertical: 6,
  },
});

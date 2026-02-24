import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface GridUpgradeCardProps {
  subscriptionPlan?: "free" | "premium";
}

export default function GridUpgradeCard({
  subscriptionPlan = "free",
}: GridUpgradeCardProps) {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const styles = getStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <Text style={styles.brandText}>GRID</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {subscriptionPlan === "premium" ? "Premium" : "Free"}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>Otključaj sve premium opcije.</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/_menu/upgrade")}
      >
        <Text style={styles.buttonText}>Nadogradi</Text>
        <FontAwesome name="arrow-right" size={16} color="#0B0B0B" />
      </Pressable>
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? "#1E1F23" : "#F5F5F5",
      borderRadius: 16,
      padding: 20,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    brandText: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "700",
      letterSpacing: 1,
    },
    badge: {
      backgroundColor: isDark ? "#2A2A2A" : "#FFFFFF",
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
    },
    badgeText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
    },
    description: {
      color: colors.textSecondary,
      fontSize: 15,
      marginBottom: 16,
    },
    button: {
      backgroundColor: "#B8FF00",
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    buttonText: {
      color: "#0B0B0B",
      fontSize: 16,
      fontWeight: "700",
    },
  });

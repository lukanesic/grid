import { FontAwesome } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface ModernClubCardProps {
  id: string;
  name: string;
  image: string;
  distance: string;
  price: string;
  fullWidth?: boolean;
  onPress: () => void;
}

export default function ModernClubCard({
  id,
  name,
  image,
  distance,
  price,
  fullWidth = false,
  onPress,
}: ModernClubCardProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark, fullWidth);

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.card}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.clubName} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.rating}>
              <FontAwesome name="star" size={12} color="#000000" />
              <Text style={styles.ratingText}>4.8 (217)</Text>
            </View>
          </View>

          <Text style={styles.details} numberOfLines={1}>
            4 terena • Padel • Tenis
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{price}</Text>
            <Text style={styles.priceLabel}> po satu • {distance}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const getStyles = (colors: any, isDark: boolean, fullWidth: boolean) =>
  StyleSheet.create({
    container: {
      marginRight: fullWidth ? 0 : 16,
    },
    card: {
      width: fullWidth ? "100%" : 280,
      backgroundColor: isDark ? "#2A2B2F" : "#F1F3F5",
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    imageContainer: {
      position: "relative",
      width: "100%",
      height: 280,
      overflow: "hidden",
      borderRadius: 16,
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: 16,
    },
    heartButton: {
      position: "absolute",
      top: 12,
      right: 12,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    infoSection: {
      padding: 16,
      gap: 6,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    clubName: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    rating: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    ratingText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "400",
    },
    details: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    price: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    priceLabel: {
      color: colors.textSecondary,
      fontSize: 14,
    },
  });

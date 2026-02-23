import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface TrendingClubCardProps {
  id: string;
  name: string;
  image: string;
  distance: string;
  price: string;
  reason?: string;
  rating?: number;
  onPress: () => void;
}

export default function TrendingClubCard({
  name,
  image,
  distance,
  price,
  reason,
  rating,
  onPress,
}: TrendingClubCardProps) {
  const { colors, isDark, fonts } = useTheme();

  // Inverted theme for trending clubs (always dark mode style)
  const cardColors = {
    background: "#121418", // Dark background
    text: "#F2F2F2", // Light text
    textSecondary: "#8B8B8B",
    border: "#1A1B20",
  };

  const styles = getStyles(cardColors, colors, fonts);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Trending Badge */}
      <View style={styles.trendingBadge}>
        <FontAwesome name="star" size={12} color="#FFFFFF" />
      </View>

      <Image source={{ uri: image }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
          {rating && (
            <View style={styles.ratingContainer}>
              <FontAwesome name="star" size={12} color="#FFD700" />
              <Text style={styles.rating}>{rating}</Text>
            </View>
          )}
        </View>

        {reason && (
          <View style={styles.reasonContainer}>
            <Text style={styles.reason}>{reason}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.info}>
            <View style={styles.infoItem}>
              <FontAwesome
                name="map-marker"
                size={12}
                color={cardColors.textSecondary}
              />
              <Text style={styles.distance}>{distance}</Text>
            </View>
            <View style={styles.infoItem}>
              <FontAwesome name="euro" size={12} color={colors.blue} />
              <Text style={styles.price}>{price}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const getStyles = (cardColors: any, colors: any, fonts: any) =>
  StyleSheet.create({
    card: {
      width: 160,
      backgroundColor: cardColors.background,
      borderRadius: 16,
      marginRight: 12,
      position: "relative",
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "#3867FF",
    },
    trendingBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "#3867FF",
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    trendingText: {
      fontSize: 14,
    },
    image: {
      width: "100%",
      height: 100,
    },
    content: {
      padding: 12,
    },
    header: {
      marginBottom: 8,
    },
    name: {
      color: cardColors.text,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
      minHeight: 32,
      fontFamily: fonts.semiBold,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    rating: {
      color: "#FFD700",
      fontSize: 12,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
    },
    reasonContainer: {
      backgroundColor: cardColors.border,
      padding: 8,
      borderRadius: 8,
      marginBottom: 12,
    },
    reason: {
      color: "#FF6B35",
      fontSize: 11,
      fontWeight: "600",
      textAlign: "center",
      fontFamily: fonts.semiBold,
    },
    footer: {
      marginTop: "auto",
    },
    info: {
      gap: 6,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    distance: {
      color: cardColors.textSecondary,
      fontSize: 12,
      fontFamily: fonts.regular,
    },
    price: {
      color: colors.blue,
      fontSize: 12,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
    },
  });

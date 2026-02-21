import { FontAwesome } from "@expo/vector-icons";
import {
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Club } from "../../../types/club";
import { AnimatedCheckmark } from "../AnimatedCheckmark";
import { AnimatedSelectionCard } from "../AnimatedSelectionCard";
import { ThemeColors } from "../types";

interface ClubSelectionProps {
  clubs: Club[];
  selectedClub?: Club;
  onSelectClub: (club: Club) => void;
  colors: ThemeColors;
  isDark: boolean;
  selectionFadeAnim: Animated.Value;
}

export const ClubSelection = ({
  clubs,
  selectedClub,
  onSelectClub,
  colors,
  isDark,
  selectionFadeAnim,
}: ClubSelectionProps) => {
  const styles = getStyles(colors, isDark);

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {clubs.map((club) => (
        <AnimatedSelectionCard
          key={club.id}
          isSelected={selectedClub?.id === club.id}
          onPress={() => onSelectClub(club)}
          style={styles.clubCard}
          colors={colors}
          isDark={isDark}
        >
          {/* Club Image */}
          <View style={styles.clubImageContainer}>
            <Image
              source={{
                uri:
                  club.image ||
                  "https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg",
              }}
              style={styles.clubImage}
              resizeMode="cover"
            />
            {selectedClub?.id === club.id && (
              <Animated.View
                style={[
                  styles.imageOverlay,
                  {
                    opacity: selectionFadeAnim,
                  },
                ]}
              >
                <AnimatedCheckmark
                  isVisible={selectedClub?.id === club.id}
                  style={styles.checkmarkLarge}
                  size={20}
                  color="#3867FF"
                />
              </Animated.View>
            )}
          </View>

          {/* Club Info */}
          <View style={styles.clubInfo}>
            <View style={styles.clubHeader}>
              <Text style={styles.clubName} numberOfLines={1}>
                {club.name}
              </Text>
            </View>

            <View style={styles.ratingContainer}>
              <FontAwesome name="star" size={10} color="#FFD700" />
              <Text style={styles.ratingText}>
                {club.rating || "4.8"} ({club.reviews || "217"})
              </Text>
            </View>

            <Text style={styles.clubDetails} numberOfLines={2}>
              {club.courts || 6} terena · Padel · Tenis
            </Text>

            <View style={styles.clubFooter}>
              <Text style={styles.priceAmount}>
                {club.price || "1200"}{" "}
                <Text style={styles.priceUnit}>RSD/h</Text>
              </Text>
              <Text style={styles.distanceText}>
                {club.distance || "4.1 km"}
              </Text>
            </View>
          </View>
        </AnimatedSelectionCard>
      ))}
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 16,
    },
    clubCard: {
      borderRadius: 16,
      borderWidth: 2,
      marginBottom: 16,
      overflow: "hidden",
    },
    clubImageContainer: {
      position: "relative",
      width: "100%",
      height: 160,
    },
    clubImage: {
      width: "100%",
      height: 160,
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(56, 103, 255, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    checkmarkLarge: {
      backgroundColor: "white",
      borderRadius: 20,
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    clubInfo: {
      padding: 16,
    },
    clubHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    clubName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    ratingText: {
      fontSize: 12,
      color: colors.text,
      marginLeft: 4,
    },
    clubDetails: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    clubFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    priceAmount: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    priceUnit: {
      fontSize: 14,
      fontWeight: "400",
      color: colors.textSecondary,
    },
    distanceText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

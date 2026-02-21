import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Court } from "../../../types/court";
import { AnimatedCheckmark } from "../AnimatedCheckmark";
import { AnimatedSelectionCard } from "../AnimatedSelectionCard";
import { ThemeColors } from "../types";

interface CourtSelectionProps {
  courts: Court[];
  selectedCourt?: Court;
  onSelectCourt: (court: Court) => void;
  colors: ThemeColors;
  isDark: boolean;
}

export const CourtSelection = ({
  courts,
  selectedCourt,
  onSelectCourt,
  colors,
  isDark,
}: CourtSelectionProps) => {
  const styles = getStyles(colors, isDark);

  const getCourtTypeName = (type: string) => {
    switch (type) {
      case "clay":
        return "Šljaka";
      case "hard":
        return "Tvrda podloga";
      case "grass":
        return "Trava";
      case "indoor_hard":
        return "Zatvorena tvrda";
      case "carpet":
        return "Tepih";
      default:
        return type;
    }
  };

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {courts.map((court) => (
        <AnimatedSelectionCard
          key={court.id}
          isSelected={selectedCourt?.id === court.id}
          onPress={() => court.is_available && onSelectCourt(court)}
          disabled={!court.is_available}
          style={styles.selectionCard}
          disabledStyle={styles.selectionCardDisabled}
          colors={colors}
          isDark={isDark}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{court.name}</Text>
              <Text style={styles.cardSubtitle}>
                {getCourtTypeName(court.surface_type)}
              </Text>
              {!court.is_available && (
                <Text style={styles.unavailableText}>Nedostupan</Text>
              )}
            </View>
            <AnimatedCheckmark
              isVisible={selectedCourt?.id === court.id}
              style={styles.checkmark}
            />
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
    selectionCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
    },
    selectionCardDisabled: {
      opacity: 0.5,
    },
    cardContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardInfo: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    unavailableText: {
      fontSize: 12,
      color: "#FF3B30",
      marginTop: 4,
    },
    checkmark: {
      marginLeft: 12,
    },
  });

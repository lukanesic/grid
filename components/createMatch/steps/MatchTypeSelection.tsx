import { FontAwesome } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AnimatedCheckmark } from "../AnimatedCheckmark";
import { AnimatedSelectionCard } from "../AnimatedSelectionCard";
import { ThemeColors } from "../types";

export type MatchType = "open" | "closed";

interface MatchTypeSelectionProps {
  selectedMatchType?: MatchType;
  onSelectMatchType: (type: MatchType) => void;
  colors: ThemeColors;
  isDark: boolean;
}

export const MatchTypeSelection = ({
  selectedMatchType,
  onSelectMatchType,
  colors,
  isDark,
}: MatchTypeSelectionProps) => {
  const styles = getStyles(colors, isDark);

  const matchTypes = [
    {
      type: "open" as MatchType,
      icon: "unlock",
      title: "Otvoren meč",
      description: "Dozvoljava da se drugi igrači pridruže koji žele da igraju",
    },
    {
      type: "closed" as MatchType,
      icon: "lock",
      title: "Zatvoren meč",
      description: "Vi pozivate samo igrače koje želite",
    },
  ];

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {matchTypes.map((matchType) => (
        <AnimatedSelectionCard
          key={matchType.type}
          isSelected={selectedMatchType === matchType.type}
          onPress={() => onSelectMatchType(matchType.type)}
          style={styles.card}
          colors={colors}
          isDark={isDark}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <FontAwesome
                name={matchType.icon as any}
                size={28}
                color={
                  selectedMatchType === matchType.type
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{matchType.title}</Text>
              <Text style={styles.description}>{matchType.description}</Text>
            </View>
            <AnimatedCheckmark
              isVisible={selectedMatchType === matchType.type}
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
    card: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 2,
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDark ? "#2C2C2E" : "#F5F5F7",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 6,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    checkmark: {
      marginLeft: 12,
    },
  });

import { FontAwesome } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AnimatedCheckmark } from "../AnimatedCheckmark";
import { AnimatedSelectionCard } from "../AnimatedSelectionCard";
import { ThemeColors } from "../types";

export type GameMode = "competitive" | "friendly" | "training";

interface GameModeSelectionProps {
  selectedGameMode?: GameMode;
  onSelectGameMode: (mode: GameMode) => void;
  colors: ThemeColors;
  isDark: boolean;
}

export const GameModeSelection = ({
  selectedGameMode,
  onSelectGameMode,
  colors,
  isDark,
}: GameModeSelectionProps) => {
  const styles = getStyles(colors, isDark);

  const gameModes = [
    {
      mode: "competitive" as GameMode,
      icon: "trophy",
      title: "Kompetativan",
      description: "Ozbiljan meč koji se boduje i utiče na vaš ranking",
      iconColor: "#F59E0B",
      bgColor: isDark ? "#78350F" : "#FEF3C7",
    },
    {
      mode: "friendly" as GameMode,
      icon: "smile-o",
      title: "Prijateljski",
      description: "Opuštena igra sa prijateljima bez bodovanja",
      iconColor: "#10B981",
      bgColor: isDark ? "#064E3B" : "#D1FAE5",
    },
    {
      mode: "training" as GameMode,
      icon: "line-chart",
      title: "Trening",
      description: "Fokus na tehniku, veštine i razvoj igre",
      iconColor: "#3B82F6",
      bgColor: isDark ? "#1E3A8A" : "#DBEAFE",
    },
  ];

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {gameModes.map((gameMode) => (
        <AnimatedSelectionCard
          key={gameMode.mode}
          isSelected={selectedGameMode === gameMode.mode}
          onPress={() => onSelectGameMode(gameMode.mode)}
          style={styles.card}
          colors={colors}
          isDark={isDark}
        >
          <View style={styles.cardContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: gameMode.bgColor },
              ]}
            >
              <FontAwesome
                name={gameMode.icon as any}
                size={28}
                color={gameMode.iconColor}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{gameMode.title}</Text>
              <Text style={styles.description}>{gameMode.description}</Text>
            </View>
            <AnimatedCheckmark
              isVisible={selectedGameMode === gameMode.mode}
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
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
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

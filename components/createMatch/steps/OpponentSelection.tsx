import { FontAwesome } from "@expo/vector-icons";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Profile } from "../../../types/profile";
import { AnimatedCheckmark } from "../AnimatedCheckmark";
import { AnimatedSelectionCard } from "../AnimatedSelectionCard";
import { ThemeColors } from "../types";

interface OpponentSelectionProps {
  players: Profile[];
  selectedOpponent?: Profile;
  onSelectOpponent: (player: Profile) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  colors: ThemeColors;
  isDark: boolean;
}

export const OpponentSelection = ({
  players,
  selectedOpponent,
  onSelectOpponent,
  searchQuery,
  onSearchChange,
  colors,
  isDark,
}: OpponentSelectionProps) => {
  const styles = getStyles(colors, isDark);

  const filteredPlayers = players.filter((player) =>
    player.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.disclaimerContainer}>
        <FontAwesome
          name="info-circle"
          size={16}
          color={colors.textSecondary}
        />
        <Text style={styles.disclaimerText}>
          Protivnik nije obavezan. Možete ga dodati naknadno ako još ne znate ko
          će igrati.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <FontAwesome
          name="search"
          size={18}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Pretraži igrače..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>

      {filteredPlayers.map((player) => (
        <AnimatedSelectionCard
          key={player.id}
          isSelected={selectedOpponent?.id === player.id}
          onPress={() => onSelectOpponent(player)}
          style={styles.playerCard}
          colors={colors}
          isDark={isDark}
        >
          <View style={styles.playerInfo}>
            {player.avatar_url ? (
              <Image
                source={{ uri: player.avatar_url }}
                style={styles.playerAvatar}
              />
            ) : (
              <View
                style={[styles.playerAvatar, styles.playerAvatarPlaceholder]}
              >
                <Text style={styles.playerAvatarText}>
                  {player.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "?"}
                </Text>
              </View>
            )}
            <View style={styles.playerDetails}>
              <Text style={styles.playerName}>
                {player.full_name || "Unknown"}
              </Text>
              <Text style={styles.playerLevel}>
                @{player.username || "user"}
              </Text>
            </View>
          </View>
          <AnimatedCheckmark
            isVisible={selectedOpponent?.id === player.id}
            style={styles.checkmark}
          />
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
    disclaimerContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
      padding: 12,
      borderRadius: 12,
      marginBottom: 16,
      gap: 8,
    },
    disclaimerText: {
      flex: 1,
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: isDark ? "#333" : "#E5E7EB",
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    playerCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    playerInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    playerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
    },
    playerAvatarPlaceholder: {
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    playerAvatarText: {
      fontSize: 18,
      fontWeight: "600",
      color: "white",
    },
    playerDetails: {
      flex: 1,
    },
    playerName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    playerLevel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    checkmark: {
      marginLeft: 12,
    },
  });

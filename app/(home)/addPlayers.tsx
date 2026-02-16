import { FontAwesome } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { invitePlayerToReservation } from "../../lib/courtApi";
import { fetchSuggestedPlayers } from "../../lib/profileApi";

export default function AddPlayersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { reservationId, currentPlayers } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);

  // Parse current players (creator + invited)
  const currentPlayerIds = currentPlayers
    ? (currentPlayers as string).split(",")
    : [];

  // Fetch players on mount
  useEffect(() => {
    const loadPlayers = async () => {
      setLoading(true);
      try {
        const data = await fetchSuggestedPlayers(50);
        // Filter out players who are already in the match
        const available = data.filter(
          (player) => !currentPlayerIds.includes(player.id),
        );
        setPlayers(available);
      } catch (error) {
        console.error("Error loading players:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPlayers = players.filter((player) =>
    player.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleInvitePlayer = async () => {
    if (!selectedPlayerId) return;

    setInviting(true);
    try {
      await invitePlayerToReservation(
        reservationId as string,
        selectedPlayerId,
      );
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["reservation"] });
      queryClient.invalidateQueries({ queryKey: ["openReservations"] });
      Alert.alert("Uspešno", "Igrač je pozvan u meč!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Greška", error.message || "Nije moguće pozvati igrača");
    } finally {
      setInviting(false);
    }
  };

  const renderPlayer = ({ item }: { item: any }) => {
    const isSelected = selectedPlayerId === item.id;

    return (
      <TouchableOpacity
        style={[styles.playerItem, isSelected && styles.playerItemSelected]}
        onPress={() => setSelectedPlayerId(item.id)}
      >
        <View style={styles.playerInfo}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {item.full_name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </Text>
            </View>
          )}
          <View style={styles.playerDetails}>
            <Text style={styles.playerName}>{item.full_name}</Text>
            <Text style={styles.playerLevel}>Nivo: 1.0</Text>
          </View>
        </View>
        {isSelected && (
          <FontAwesome name="check-circle" size={24} color={colors.blue} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text style={styles.cancelText}>Otkaži</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Pozovi igrača</Text>
        </View>
        <TouchableOpacity
          onPress={handleInvitePlayer}
          style={styles.button}
          disabled={!selectedPlayerId || inviting}
        >
          {inviting ? (
            <ActivityIndicator size="small" color={colors.blue} />
          ) : (
            <Text
              style={[
                styles.doneText,
                !selectedPlayerId && styles.doneTextDisabled,
              ]}
            >
              Pozovi
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <FontAwesome
          name="search"
          size={16}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Pretraži igrače..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Players List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      ) : (
        <FlatList
          data={filteredPlayers}
          renderItem={renderPlayer}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "Nema rezultata pretrage"
                  : "Nema dostupnih igrača"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function getStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    button: {
      minWidth: 60,
    },
    cancelText: {
      color: colors.text,
      fontSize: 16,
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    doneText: {
      color: colors.blue,
      fontSize: 16,
      fontWeight: "600",
      textAlign: "right",
    },
    doneTextDisabled: {
      opacity: 0.4,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
      borderRadius: 10,
      margin: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 16,
    },
    playerItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 2,
      borderColor: "transparent",
    },
    playerItemSelected: {
      borderColor: colors.blue,
      backgroundColor: isDark ? "#1C1C1E" : "#EEF3FF",
    },
    playerInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
    },
    avatarPlaceholder: {
      backgroundColor: colors.blue,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "700",
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
  });
}

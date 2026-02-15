import { supabase } from "@/lib/supabase";
import { BlockedUser } from "@/types/blockedUser";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuHeader, MenuInfoCard } from "../../../components/menu";
import { useTheme } from "../../../contexts/ThemeContext";

export default function BlockedUsersScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [searchQuery, setSearchQuery] = useState("");
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_blocked_users");

      if (error) throw error;
      setBlockedUsers(data || []);
    } catch (error) {
      console.error("Error loading blocked users:", error);
      Alert.alert("Greška", "Nije moguće učitati blokirane korisnike");
    } finally {
      setLoading(false);
    }
  };

  const getTimeLabel = (blockedAt: string): string => {
    const now = new Date();
    const blocked = new Date(blockedAt);
    const diffMs = now.getTime() - blocked.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffDays < 1) return "Danas";
    if (diffDays === 1) return "Pre 1 dan";
    if (diffDays < 7) return `Pre ${diffDays} dana`;
    if (diffWeeks === 1) return "Pre 1 nedelju";
    if (diffWeeks < 4) return `Pre ${diffWeeks} nedelje`;
    if (diffMonths === 1) return "Pre 1 mesec";
    return `Pre ${diffMonths} meseci`;
  };

  const blockedList = useMemo(() => {
    return blockedUsers.filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      return (
        item.blocked_user_name?.toLowerCase().includes(query) ||
        item.reason?.toLowerCase().includes(query)
      );
    });
  }, [blockedUsers, searchQuery]);

  const handleUnblock = async (userId: string) => {
    Alert.alert(
      "Odblokiraj korisnika",
      "Da li si siguran da želiš da odblokiraš ovog korisnika?",
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Odblokiraj",
          style: "destructive",
          onPress: async () => {
            try {
              const { data, error } = await supabase.rpc("unblock_user", {
                target_user_id: userId,
              });

              if (error) throw error;

              if (data.success) {
                setBlockedUsers((prev) =>
                  prev.filter((item) => item.blocked_user_id !== userId),
                );
                Alert.alert("Uspešno", "Korisnik je odblokiran");
              } else {
                Alert.alert(
                  "Greška",
                  data.error || "Nije moguće odblokirti korisnika",
                );
              }
            } catch (error) {
              console.error("Error unblocking user:", error);
              Alert.alert("Greška", "Nije moguće odblokirti korisnika");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <MenuHeader title="Blokirani korisnici" onBack={() => router.back()} />

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Pretraži blokirane..."
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <FontAwesome
                name="close"
                size={16}
                color={colors.textSecondary}
              />
            </Pressable>
          )}
        </View>

        <MenuInfoCard
          icon="shield"
          text="Blokirani korisnici ne mogu da ti šalju poruke niti vide tvoj online status."
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {blockedList.map((user) => (
              <View key={user.id} style={styles.userCard}>
                {user.blocked_user_avatar ? (
                  <Image
                    source={{ uri: user.blocked_user_avatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitials}>
                      {user.blocked_user_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "?"}
                    </Text>
                  </View>
                )}

                <View style={styles.userText}>
                  <Text style={styles.userName}>
                    {user.blocked_user_name || "Nepoznato"}
                  </Text>
                  {user.reason && (
                    <Text style={styles.userMeta}>{user.reason}</Text>
                  )}
                  <Text style={styles.userMetaSmall}>
                    {getTimeLabel(user.blocked_at)}
                  </Text>
                </View>

                <Pressable
                  style={styles.unblockButton}
                  onPress={() => handleUnblock(user.blocked_user_id)}
                >
                  <Text style={styles.unblockButtonText}>Odblokiraj</Text>
                </Pressable>
              </View>
            ))}

            {blockedList.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <FontAwesome
                  name="check-circle"
                  size={30}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyTitle}>Nema blokiranih korisnika</Text>
                <Text style={styles.emptySubtitle}>
                  Trenutno nema korisnika na tvojoj block listi.
                </Text>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    searchContainer: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
    },
    userCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
    },
    avatarPlaceholder: {
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarInitials: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "700",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 100,
    },
    userText: {
      flex: 1,
    },
    userName: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 2,
    },
    userMeta: {
      color: colors.textSecondary,
      fontSize: 13,
      marginBottom: 2,
    },
    userMetaSmall: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    unblockButton: {
      backgroundColor: isDark ? "#1E1F23" : colors.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    unblockButtonText: {
      color: isDark ? "#B8FF00" : colors.blue,
      fontSize: 12,
      fontWeight: "700",
    },
    emptyState: {
      marginTop: 40,
      alignItems: "center",
      paddingHorizontal: 20,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
      marginTop: 12,
      marginBottom: 6,
    },
    emptySubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 18,
    },
  });

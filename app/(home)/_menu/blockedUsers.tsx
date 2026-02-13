import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SUGGESTED_USERS } from "../../../constants/data";
import { useTheme } from "../../../contexts/ThemeContext";

const INITIAL_BLOCKED_USERS = [
  {
    id: 2,
    reason: "Neželjene poruke",
    blockedAt: "Pre 2 dana",
  },
  {
    id: 4,
    reason: "Spam sadržaj",
    blockedAt: "Pre 1 nedelje",
  },
  {
    id: 5,
    reason: "Neprimerena komunikacija",
    blockedAt: "Pre 3 nedelje",
  },
];

export default function BlockedUsersScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [searchQuery, setSearchQuery] = useState("");
  const [blockedUsers, setBlockedUsers] = useState(INITIAL_BLOCKED_USERS);

  const blockedList = useMemo(() => {
    return blockedUsers
      .map((blocked) => {
        const user = SUGGESTED_USERS.find((item) => item.id === blocked.id);
        if (!user) {
          return null;
        }

        return {
          ...blocked,
          ...user,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .filter((item) => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
          return true;
        }

        return (
          item.name.toLowerCase().includes(query) ||
          item.subtitle.toLowerCase().includes(query)
        );
      });
  }, [blockedUsers, searchQuery]);

  const handleUnblock = (userId: number) => {
    setBlockedUsers((prev) => prev.filter((item) => item.id !== userId));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Blokirani korisnici</Text>
        <View style={{ width: 20 }} />
      </View>

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

        <View style={styles.infoCard}>
          <FontAwesome name="shield" size={16} color={colors.blue} />
          <Text style={styles.infoText}>
            Blokirani korisnici ne mogu da ti šalju poruke niti vide tvoj online
            status.
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {blockedList.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />

              <View style={styles.userText}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userMeta}>{user.reason}</Text>
                <Text style={styles.userMetaSmall}>{user.blockedAt}</Text>
              </View>

              <Pressable
                style={styles.unblockButton}
                onPress={() => handleUnblock(user.id)}
              >
                <Text style={styles.unblockButtonText}>Odblokiraj</Text>
              </Pressable>
            </View>
          ))}

          {blockedList.length === 0 && (
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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
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
    infoCard: {
      backgroundColor: isDark ? "#1E1F23" : colors.surface,
      borderRadius: 12,
      padding: 14,
      flexDirection: "row",
      gap: 10,
      marginBottom: 16,
    },
    infoText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
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

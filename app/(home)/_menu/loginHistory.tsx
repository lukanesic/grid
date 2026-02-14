import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuHeader, MenuInfoCard } from "../../../components/menu";
import { useTheme } from "../../../contexts/ThemeContext";

const LOGIN_HISTORY = [
  {
    id: "1",
    device: "iPhone 16 Pro Max",
    location: "Barcelona, Spain",
    ip: "85.223.44.191",
    time: "Danas, 21:54",
    current: true,
  },
  {
    id: "2",
    device: "MacBook Pro (Safari)",
    location: "Barcelona, Spain",
    ip: "85.223.44.191",
    time: "Danas, 18:11",
    current: false,
  },
  {
    id: "3",
    device: "iPhone 14 (App)",
    location: "Madrid, Spain",
    ip: "185.121.8.72",
    time: "Juče, 09:42",
    current: false,
  },
  {
    id: "4",
    device: "Windows Chrome",
    location: "Valencia, Spain",
    ip: "91.77.18.14",
    time: "Pre 3 dana, 22:07",
    current: false,
  },
];

export default function LoginHistoryScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [sessions, setSessions] = useState(LOGIN_HISTORY);

  const handleSignOutOtherSessions = () => {
    setSessions((prev) => prev.filter((session) => session.current));
  };

  return (
    <SafeAreaView style={styles.container}>
      <MenuHeader
        title="Istorija prijavljivanja"
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <MenuInfoCard
          icon="shield"
          text="Ako primetiš nepoznatu prijavu, odmah promeni lozinku i isključi aktivne sesije."
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {sessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionTop}>
                <View style={styles.sessionTitleWrap}>
                  <Text style={styles.sessionDevice}>{session.device}</Text>
                  {session.current && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Trenutna</Text>
                    </View>
                  )}
                </View>
                <FontAwesome
                  name="check-circle"
                  size={16}
                  color={session.current ? colors.blue : colors.textSecondary}
                />
              </View>

              <View style={styles.row}>
                <FontAwesome
                  name="map-marker"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.metaText}>{session.location}</Text>
              </View>

              <View style={styles.row}>
                <FontAwesome
                  name="globe"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.metaText}>IP: {session.ip}</Text>
              </View>

              <View style={styles.row}>
                <FontAwesome
                  name="clock-o"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.metaText}>{session.time}</Text>
              </View>
            </View>
          ))}

          <Pressable
            style={styles.signOutOthersButton}
            onPress={handleSignOutOtherSessions}
          >
            <FontAwesome name="sign-out" size={14} color="#FFFFFF" />
            <Text style={styles.signOutOthersButtonText}>
              Odjavi sve ostale sesije
            </Text>
          </Pressable>

          <View style={{ height: 16 }} />
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
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    sessionCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      gap: 8,
    },
    sessionTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 2,
    },
    sessionTitleWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: 1,
      marginRight: 8,
    },
    sessionDevice: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
      flexShrink: 1,
    },
    currentBadge: {
      backgroundColor: isDark
        ? "rgba(184,255,0,0.15)"
        : "rgba(56,103,255,0.12)",
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    currentBadgeText: {
      color: isDark ? "#B8FF00" : colors.blue,
      fontSize: 11,
      fontWeight: "700",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    metaText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    signOutOthersButton: {
      marginTop: 8,
      marginBottom: 4,
      backgroundColor: "#FF3B30",
      borderRadius: 12,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    signOutOthersButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
  });

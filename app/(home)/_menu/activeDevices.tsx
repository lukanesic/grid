import { supabase } from "@/lib/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuHeader, MenuInfoCard } from "../../../components/menu";
import { useTheme } from "../../../contexts/ThemeContext";

interface ActiveDevice {
  session_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_active: string;
}

export default function ActiveDevicesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const accentColor = isDark ? "#B8FF00" : colors.blue;

  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<ActiveDevice[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");

  useEffect(() => {
    loadActiveDevices();
    getCurrentSession();
  }, []);

  const getCurrentSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      setCurrentSessionId(session.access_token);
    }
  };

  const loadActiveDevices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_active_devices");

      if (error) {
        console.error("Active devices error:", error);
        Alert.alert("Greška", "Nije moguće učitati aktivne uređaje");
      } else {
        setDevices(data || []);
      }
    } catch (err) {
      console.error("Active devices exception:", err);
      Alert.alert("Greška", "Došlo je do problema pri učitavanju podataka");
    } finally {
      setLoading(false);
    }
  };

  const activeCount = useMemo(
    () =>
      devices.filter(
        (device) => !device.session_id.includes(currentSessionId.slice(0, 20)),
      ).length,
    [devices, currentSessionId],
  );

  const handleRemoveDevice = async (sessionId: string) => {
    Alert.alert(
      "Odjavi uređaj",
      "Da li ste sigurni da želite da odjavite ovaj uređaj?",
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Odjavi",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.auth.admin.signOut(sessionId);
              if (error) {
                console.error("Sign out error:", error);
                Alert.alert("Greška", "Nije moguće odjaviti uređaj");
              } else {
                setDevices((prev) =>
                  prev.filter((device) => device.session_id !== sessionId),
                );
              }
            } catch (err) {
              console.error("Sign out exception:", err);
              Alert.alert("Greška", "Došlo je do problema");
            }
          },
        },
      ],
    );
  };

  const handleRemoveAllOther = () => {
    Alert.alert(
      "Odjavi sve ostale",
      "Da li ste sigurni da želite da odjavite sve ostale uređaje?",
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Odjavi sve",
          style: "destructive",
          onPress: async () => {
            try {
              // Sign out all sessions except current
              const otherDevices = devices.filter(
                (device) =>
                  !device.session_id.includes(currentSessionId.slice(0, 20)),
              );

              for (const device of otherDevices) {
                await supabase.auth.admin.signOut(device.session_id);
              }

              await loadActiveDevices();
            } catch (err) {
              console.error("Sign out all exception:", err);
              Alert.alert("Greška", "Došlo je do problema");
            }
          },
        },
      ],
    );
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Aktivno sada";
    if (diffMins < 60) return `Pre ${diffMins} min`;
    if (diffHours < 24) return `Pre ${diffHours}h`;
    if (diffDays === 0) return "Danas";
    if (diffDays === 1) return "Juče";
    if (diffDays < 7) return `Pre ${diffDays} dana`;

    return date.toLocaleDateString("sr-RS", {
      day: "numeric",
      month: "short",
    });
  };

  const parseUserAgent = (userAgent: string) => {
    if (userAgent.includes("iPhone")) return "iPhone";
    if (userAgent.includes("iPad")) return "iPad";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("Windows")) return "Windows PC";
    if (userAgent.includes("Linux")) return "Linux";
    return "Nepoznat uređaj";
  };

  const getBrowserName = (userAgent: string) => {
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Edge")) return "Edge";
    return "Aplikacija";
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes("iPhone") || userAgent.includes("Android"))
      return "mobile";
    if (userAgent.includes("iPad")) return "tablet";
    return "desktop";
  };

  const isCurrentDevice = (sessionId: string) => {
    return sessionId.includes(currentSessionId.slice(0, 20));
  };

  return (
    <SafeAreaView style={styles.container}>
      <MenuHeader title="Aktivni uređaji" onBack={() => router.back()} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={styles.loadingText}>Učitavanje...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <MenuInfoCard
            icon="mobile"
            text="Prikazani su uređaji koji su trenutno prijavljeni na vaš nalog. Možete odjaviti sumnjive uređaje."
          />

          {devices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome
                name="mobile"
                size={48}
                color={colors.textSecondary}
                style={{ opacity: 0.3 }}
              />
              <Text style={styles.emptyTitle}>Nema aktivnih uređaja</Text>
              <Text style={styles.emptyDescription}>
                Aktivni uređaji će se prikazati ovde
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {devices.map((device) => {
                const isCurrent = isCurrentDevice(device.session_id);
                return (
                  <View key={device.session_id} style={styles.deviceCard}>
                    <View style={styles.deviceTop}>
                      <View style={styles.deviceTitleWrap}>
                        <Text style={styles.deviceName}>
                          {parseUserAgent(device.user_agent)}
                        </Text>
                        {isCurrent && (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>
                              Ovaj uređaj
                            </Text>
                          </View>
                        )}
                      </View>
                      <FontAwesome
                        name={
                          isCurrent
                            ? "check-circle"
                            : getDeviceIcon(device.user_agent)
                        }
                        size={16}
                        color={isCurrent ? accentColor : colors.textSecondary}
                      />
                    </View>

                    <View style={styles.row}>
                      <FontAwesome
                        name="desktop"
                        size={13}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.metaText}>
                        {getBrowserName(device.user_agent)}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <FontAwesome
                        name="map-marker"
                        size={13}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.metaText}>
                        {device.ip_address || "Nepoznata lokacija"}
                      </Text>
                    </View>

                    <View style={styles.rowBetween}>
                      <View style={styles.row}>
                        <FontAwesome
                          name="clock-o"
                          size={13}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          {formatLastActive(device.last_active)}
                        </Text>
                      </View>

                      {!isCurrent && (
                        <Pressable
                          style={styles.removeButton}
                          onPress={() => handleRemoveDevice(device.session_id)}
                        >
                          <Text style={styles.removeButtonText}>Odjavi</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}

              {activeCount > 0 && (
                <Pressable
                  style={styles.removeAllButton}
                  onPress={handleRemoveAllOther}
                >
                  <FontAwesome name="sign-out" size={14} color="#FFFFFF" />
                  <Text style={styles.removeAllButtonText}>
                    Odjavi sve ostale ({activeCount})
                  </Text>
                </Pressable>
              )}
            </ScrollView>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
      gap: 12,
      marginTop: 60,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginTop: 16,
    },
    emptyDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    deviceCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      gap: 8,
    },
    deviceTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    deviceTitleWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: 1,
      marginRight: 8,
    },
    deviceName: {
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
    rowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 2,
    },
    metaText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    removeButton: {
      backgroundColor: isDark ? "#1E1F23" : colors.background,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    removeButtonText: {
      color: isDark ? "#B8FF00" : colors.blue,
      fontSize: 12,
      fontWeight: "700",
    },
    removeAllButton: {
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
    removeAllButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
  });

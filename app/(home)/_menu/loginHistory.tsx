import { supabase } from "@/lib/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuHeader, MenuInfoCard } from "../../../components/menu";
import { useTheme } from "../../../contexts/ThemeContext";

interface LoginHistoryItem {
  logged_at: string;
  ip_address: string;
  action: string;
  device_info: string;
}

export default function LoginHistoryScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const accentColor = isDark ? "#B8FF00" : colors.blue;

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<LoginHistoryItem[]>([]);

  useEffect(() => {
    loadLoginHistory();
  }, []);

  const loadLoginHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_login_history", {
        limit_count: 50,
      });

      if (error) {
        console.error("Login history error:", error);
        Alert.alert("Greška", "Nije moguće učitati istoriju prijavljivanja");
      } else {
        setHistory(data || []);
      }
    } catch (err) {
      console.error("Login history exception:", err);
      Alert.alert("Greška", "Došlo je do problema pri učitavanju podataka");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Upravo";
    if (diffMins < 60) return `Pre ${diffMins} min`;
    if (diffHours < 24) return `Pre ${diffHours}h`;
    if (diffDays < 7) return `Pre ${diffDays}d`;

    return date.toLocaleDateString("sr-RS", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("sr-RS", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "login":
        return "Prijavljivanje";
      case "logout":
        return "Odjavljivanje";
      case "token_refreshed":
        return "Sesija osvežena";
      default:
        return action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "login":
        return "sign-in";
      case "logout":
        return "sign-out";
      case "token_refreshed":
        return "refresh";
      default:
        return "circle";
    }
  };

  const getDeviceIcon = (deviceInfo: string) => {
    const lower = deviceInfo.toLowerCase();
    if (lower.includes("iphone") || lower.includes("ios")) return "apple";
    if (lower.includes("android")) return "android";
    if (lower.includes("windows")) return "windows";
    if (lower.includes("mac")) return "apple";
    return "mobile";
  };

  const parseDeviceInfo = (deviceInfo: string) => {
    try {
      const data = JSON.parse(deviceInfo);
      return data.device || "Nepoznat uređaj";
    } catch {
      return deviceInfo || "Nepoznat uređaj";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MenuHeader
        title="Istorija prijavljivanja"
        onBack={() => router.back()}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={styles.loadingText}>Učitavanje...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <MenuInfoCard
            icon="shield"
            text="Istorija prijavljivanja prikazuje nedavne prijave na vaš nalog. Ako primetite nepoznatu prijavu, odmah promenite lozinku."
          />

          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome
                name="history"
                size={48}
                color={colors.textSecondary}
                style={{ opacity: 0.3 }}
              />
              <Text style={styles.emptyTitle}>Nema istorije</Text>
              <Text style={styles.emptyDescription}>
                Istorija prijavljivanja će se prikazati ovde
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {history.map((item, index) => (
                <View key={index} style={styles.sessionCard}>
                  <View style={styles.sessionTop}>
                    <View style={styles.sessionTitleWrap}>
                      <FontAwesome
                        name={getActionIcon(item.action)}
                        size={16}
                        color={
                          item.action === "login"
                            ? accentColor
                            : colors.textSecondary
                        }
                      />
                      <Text style={styles.sessionDevice}>
                        {getActionText(item.action)}
                      </Text>
                    </View>
                    <Text style={styles.timeText}>
                      {formatDate(item.logged_at)}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <FontAwesome
                      name={getDeviceIcon(item.device_info)}
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.metaText}>
                      {parseDeviceInfo(item.device_info)}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <FontAwesome
                      name="map-marker"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.metaText}>
                      {item.ip_address || "Nepoznata lokacija"}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <FontAwesome
                      name="clock-o"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.metaText}>
                      {formatTime(item.logged_at)}
                    </Text>
                  </View>
                </View>
              ))}
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
    timeText: {
      color: colors.textSecondary,
      fontSize: 13,
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
  });

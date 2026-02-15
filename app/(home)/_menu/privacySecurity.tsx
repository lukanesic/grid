import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../contexts/ThemeContext";

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const accentColor = isDark ? "#B8FF00" : colors.blue;
  const { profile, user, refreshProfile } = useAuth();

  const [isPrivate, setIsPrivate] = useState(profile?.is_private || false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(
    profile?.show_online_status ?? true,
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const updatePrivacySettings = async (updates: any) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user?.id);

    if (error) {
      Alert.alert("Greška", "Nije moguće ažurirati podešavanja");
      console.error("Privacy update error:", error);
    } else {
      await refreshProfile();
    }
    setIsUpdating(false);
  };

  const handleTogglePrivate = async (value: boolean) => {
    setIsPrivate(value);
    await updatePrivacySettings({ is_private: value });
  };

  const handleToggleOnlineStatus = async (value: boolean) => {
    setShowOnlineStatus(value);
    await updatePrivacySettings({ show_online_status: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Privatnost i bezbednost</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privatnost</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome
                  name="lock"
                  size={20}
                  color={colors.textSecondary}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Privatni profil</Text>
                  <Text style={styles.settingDescription}>
                    Samo vaši prijatelji mogu videti vaš profil
                  </Text>
                </View>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={handleTogglePrivate}
                trackColor={{
                  false: isDark ? "#3A3A3A" : "#E6E6E6",
                  true: accentColor,
                }}
                thumbColor="#FFFFFF"
                disabled={isUpdating}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome
                  name="circle"
                  size={20}
                  color={showOnlineStatus ? accentColor : colors.textSecondary}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Prikaži status</Text>
                  <Text style={styles.settingDescription}>
                    Drugi mogu videti kada ste online
                  </Text>
                </View>
              </View>
              <Switch
                value={showOnlineStatus}
                onValueChange={handleToggleOnlineStatus}
                trackColor={{
                  false: isDark ? "#3A3A3A" : "#E6E6E6",
                  true: accentColor,
                }}
                thumbColor="#FFFFFF"
                disabled={isUpdating}
              />
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bezbednost</Text>

          <Pressable
            style={styles.linkCard}
            onPress={() => router.push("/(home)/_menu/changePassword")}
          >
            <View style={styles.linkLeft}>
              <FontAwesome name="lock" size={20} color={colors.textSecondary} />
              <Text style={styles.linkTitle}>Promeni lozinku</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={accentColor} />
          </Pressable>

          <Pressable
            style={styles.linkCard}
            onPress={() => router.push("/(home)/_menu/loginHistory")}
          >
            <View style={styles.linkLeft}>
              <FontAwesome
                name="history"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.linkTitle}>Istorija prijavljivanja</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={accentColor} />
          </Pressable>

          <Pressable
            style={styles.linkCard}
            onPress={() => router.push("/(home)/_menu/activeDevices")}
          >
            <View style={styles.linkLeft}>
              <FontAwesome
                name="mobile"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.linkTitle}>Aktivni uređaji</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={accentColor} />
          </Pressable>

          <Pressable
            style={styles.linkCard}
            onPress={() => router.push("/(home)/_menu/blockedUsers")}
          >
            <View style={styles.linkLeft}>
              <FontAwesome name="ban" size={20} color={colors.textSecondary} />
              <Text style={styles.linkTitle}>Blokirani korisnici</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={accentColor} />
          </Pressable>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <FontAwesome name="info-circle" size={16} color={accentColor} />
          <Text style={styles.infoText}>
            Čuvamo vaše podatke u skladu sa GDPR propisima. Za više informacija
            o tome kako koristimo vaše podatke, pogledajte našu politiku
            privatnosti.
          </Text>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isUpdating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={accentColor} />
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
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 16,
    },
    settingCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    settingDescription: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    linkCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    linkLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    linkTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    linkRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    linkCount: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },
    infoCard: {
      backgroundColor: isDark ? "#1E1F23" : colors.surface,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      gap: 12,
      marginBottom: 32,
    },
    infoText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
  });

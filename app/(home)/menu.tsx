import { supabase } from "@/lib/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuRow, MenuSection } from "../../components";
import { useTheme } from "../../contexts/ThemeContext";

export default function MenuScreen() {
  const router = useRouter();
  const { colors, toggleTheme, isDark } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Greska", error.message);
    }
  };

  const styles = getStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Nalog</Text>
        </View>

        <View style={styles.upgradeCard}>
          <View style={styles.upgradeHeader}>
            <Text style={styles.upgradeTitle}>GRID</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </View>
          <Text style={styles.upgradeSub}>Otključaj sve premium opcije.</Text>
          <Pressable
            style={styles.upgradeButton}
            onPress={() => router.push("/_menu/upgrade")}
          >
            <Text style={styles.upgradeButtonText}>Nadogradi</Text>
            <FontAwesome name="arrow-right" size={14} color="#111111" />
          </Pressable>
        </View>

        <MenuSection>
          {[
            {
              icon: "user",
              label: "Profil informacije",
              sub: "Lični podaci i nalog",
              onPress: () => router.push("/_menu/profileInfo"),
            },
            {
              icon: "lock",
              label: "Privatnost i bezbednost",
              sub: "Lozinka i zaštita",
              onPress: () => router.push("/_menu/privacySecurity"),
            },
            {
              icon: "credit-card",
              label: "Pretplata i naplata",
              sub: "Plan i plaćanja",
              onPress: () => router.push("/_menu/subscriptionBilling"),
            },
          ].map((item) => (
            <MenuRow
              key={item.label}
              icon={item.icon}
              title={item.label}
              subtitle={item.sub}
              showChevron
              onPress={item.onPress}
            />
          ))}
        </MenuSection>

        <MenuSection>
          <MenuRow
            icon="moon-o"
            title="Tamni režim"
            subtitle="Tema aplikacije"
            right={<Switch value={isDark} onValueChange={toggleTheme} />}
          />
          <MenuRow
            icon="bell-o"
            title="Notifikacije"
            subtitle="Push i e-mail"
            right={
              <Switch value={notifications} onValueChange={setNotifications} />
            }
          />
          <MenuRow
            icon="bookmark-o"
            title="Istorija čuvanja"
            subtitle="Sačuvani mečevi"
            right={
              <Switch value={saveHistory} onValueChange={setSaveHistory} />
            }
          />
          <MenuRow
            icon="language"
            title="Jezik"
            subtitle="Izaberi jezik"
            onPress={() => router.push("/_menu/language")}
            right={
              <View style={styles.langRight}>
                <Text style={styles.langValue}>Srpski</Text>
                <FontAwesome
                  name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            }
          />
          <MenuRow
            icon="question-circle-o"
            title="Centar za pomoć"
            subtitle="FAQ i podrška"
            showChevron
            onPress={() => router.push("/_menu/helpCenter")}
          />
          <MenuRow
            icon="info-circle"
            title="O aplikaciji"
            subtitle="Verzija i detalji"
            showChevron
            onPress={() => router.push("/_menu/aboutApp")}
          />
        </MenuSection>

        <MenuSection>
          <MenuRow
            icon="sign-out"
            title="Izloguj se"
            subtitle="Odjavi nalog"
            iconColor="#FF6B6B"
            titleColor="#FF6B6B"
            onPress={handleLogout}
          />
        </MenuSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,

      paddingBottom: 32,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    backButton: {
      padding: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "700",
    },
    upgradeCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    upgradeHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },
    upgradeTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "600",
    },
    proBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? "#B8FF00" : "#111111",
      backgroundColor: isDark ? "rgba(184, 255, 0, 0.1)" : "#111111",
    },
    proBadgeText: {
      color: isDark ? "#B8FF00" : "#FFFFFF",
      fontSize: 10,
      fontWeight: "700",
    },
    upgradeSub: {
      color: colors.textSecondary,
      fontSize: 15,
      marginBottom: 12,
    },
    upgradeButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: "#B8FF00",
    },
    upgradeButtonText: {
      color: "#0B0B0B",
      fontSize: 14,
      fontWeight: "600",
    },
    langRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    langValue: {
      color: colors.textSecondary,
      fontSize: 14,
    },
  });

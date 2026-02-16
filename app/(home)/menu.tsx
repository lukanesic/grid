import { supabase } from "@/lib/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { LANGUAGES } from "../../constants/data";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function MenuScreen() {
  const router = useRouter();
  const { colors, toggleTheme, isDark } = useTheme();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(true);

  const currentLanguage = LANGUAGES.find((l) => l.id === language);

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
          <Text style={styles.headerTitle}>{t("menu.account")}</Text>
        </View>

        <View style={styles.upgradeCard}>
          <View style={styles.upgradeHeader}>
            <Text style={styles.upgradeTitle}>{t("menu.upgrade.title")}</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>{t("menu.upgrade.badge")}</Text>
            </View>
          </View>
          <Text style={styles.upgradeSub}>{t("menu.upgrade.description")}</Text>
          <Pressable
            style={styles.upgradeButton}
            onPress={() => router.push("/_menu/upgrade")}
          >
            <Text style={styles.upgradeButtonText}>
              {t("menu.upgrade.button")}
            </Text>
            <FontAwesome name="arrow-right" size={14} color="#111111" />
          </Pressable>
        </View>

        <MenuSection>
          {[
            {
              icon: "user",
              label: t("menu.profile"),
              sub: t("menu.profileSub"),
              onPress: () => router.push("/_menu/profileInfo"),
            },
            {
              icon: "lock",
              label: t("menu.privacy"),
              sub: t("menu.privacySub"),
              onPress: () => router.push("/_menu/privacySecurity"),
            },
            {
              icon: "credit-card",
              label: t("menu.subscription"),
              sub: t("menu.subscriptionSub"),
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
            title={t("menu.darkMode")}
            subtitle={t("menu.darkModeSub")}
            right={<Switch value={isDark} onValueChange={toggleTheme} />}
          />
          <MenuRow
            icon="bell-o"
            title={t("menu.notifications")}
            subtitle={t("menu.notificationsSub")}
            right={
              <Switch value={notifications} onValueChange={setNotifications} />
            }
          />
          {/* <MenuRow
            icon="bookmark-o"
            title="Istorija čuvanja"
            subtitle="Sačuvani mečevi"
            right={
              <Switch value={saveHistory} onValueChange={setSaveHistory} />
            }
          /> */}
          <MenuRow
            icon="language"
            title={t("menu.language")}
            subtitle={t("menu.languageSub")}
            onPress={() => router.push("/_menu/language")}
            right={
              <View style={styles.langRight}>
                <Text style={styles.langValue}>
                  {currentLanguage?.nativeName}
                </Text>
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
            title={t("menu.helpCenter")}
            subtitle={t("menu.helpCenterSub")}
            showChevron
            onPress={() => router.push("/_menu/helpCenter")}
          />
          <MenuRow
            icon="info-circle"
            title={t("menu.about")}
            subtitle={t("menu.aboutSub")}
            showChevron
            onPress={() => router.push("/_menu/aboutApp")}
          />
        </MenuSection>

        <MenuSection>
          <MenuRow
            icon="sign-out"
            title={t("menu.logout")}
            subtitle={t("menu.logoutSub")}
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

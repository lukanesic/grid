import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuCard, MenuHeader } from "../../../components/menu";
import { useTheme } from "../../../contexts/ThemeContext";

const SETTINGS_GROUPS = [
  {
    title: "Nalog",
    items: ["Profil informacije", "Lozinka", "Biometrijska prijava"],
  },
  {
    title: "Privatnost",
    items: ["Online status", "Blokirani korisnici", "Aktivni uređaji"],
  },
  {
    title: "Aplikacija",
    items: ["Jezik", "Notifikacije", "Tamni režim"],
  },
];

export default function HelpSettingsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <MenuHeader title="Podešavanja" onBack={() => router.back()} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <MenuCard style={styles.introCard}>
          <Text style={styles.introTitle}>Brzo podešavanje aplikacije</Text>
          <Text style={styles.introText}>
            U nastavku su najvažnije sekcije podešavanja koje treba proveriti
            nakon registracije.
          </Text>
        </MenuCard>

        {SETTINGS_GROUPS.map((group, groupIndex) => (
          <MenuCard key={group.title} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <View style={styles.groupBadge}>
                <Text style={styles.groupBadgeText}>{groupIndex + 1}</Text>
              </View>
              <Text style={styles.groupTitle}>{group.title}</Text>
            </View>

            {group.items.map((item) => (
              <View key={item} style={styles.itemRow}>
                <FontAwesome
                  name="angle-right"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </MenuCard>
        ))}

        <MenuCard style={styles.footerNote} tone="soft">
          <FontAwesome name="info-circle" size={14} color={colors.blue} />
          <Text style={styles.footerNoteText}>
            Za veću sigurnost, preporučujemo da jednom mesečno proveriš aktivne
            uređaje i istoriju prijavljivanja.
          </Text>
        </MenuCard>
      </ScrollView>
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
    introCard: {
      borderRadius: 12,
      marginBottom: 14,
    },
    introTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 6,
    },
    introText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    groupCard: {
      borderRadius: 12,
      marginBottom: 12,
    },
    groupHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 8,
    },
    groupBadge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(184,255,0,0.18)"
        : "rgba(56,103,255,0.12)",
    },
    groupBadgeText: {
      color: isDark ? "#B8FF00" : colors.blue,
      fontSize: 11,
      fontWeight: "700",
    },
    groupTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 6,
    },
    itemText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    footerNote: {
      marginTop: 2,
      borderRadius: 12,
      flexDirection: "row",
      gap: 8,
    },
    footerNoteText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
  });

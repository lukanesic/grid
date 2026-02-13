import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../contexts/ThemeContext";

const SETUP_STEPS = [
  {
    title: "Dovrši osnovne informacije",
    text: "Dodaj ime, korisničko ime, lokaciju i kratki bio kako bi profil bio vidljiviji drugim igračima.",
    icon: "user",
  },
  {
    title: "Postavi nivo igre",
    text: "Izaberi nivo tenisa/padela. Tačan nivo pomaže boljem matchovanju i predlozima protivnika.",
    icon: "line-chart",
  },
  {
    title: "Uredi privatnost",
    text: "U Privacy & Security definiši ko vidi tvoj profil, online status i istoriju mečeva.",
    icon: "lock",
  },
  {
    title: "Sačuvaj izmene",
    text: "Nakon svake izmene klikni Sačuvaj kako bi promene odmah bile vidljive na profilu.",
    icon: "check-circle",
  },
];

export default function HelpAccountProfileScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Nalog i profil</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <FontAwesome name="id-card-o" size={20} color={colors.blue} />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Vodič za nalog i profil</Text>
            <Text style={styles.heroSubtitle}>
              Brza podešavanja koja čine tvoj profil kompletnim i sigurnim.
            </Text>
          </View>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.blockTitle}>Koraci za podešavanje</Text>
          {SETUP_STEPS.map((step, index) => (
            <View key={step.title} style={styles.stepRow}>
              <View style={styles.stepMarkerWrap}>
                <View style={styles.stepMarker}>
                  <FontAwesome
                    name={step.icon as any}
                    size={12}
                    color={colors.blue}
                  />
                </View>
                {index < SETUP_STEPS.length - 1 && (
                  <View style={styles.stepLine} />
                )}
              </View>

              <View style={styles.stepTextWrap}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.tipsRow}>
          <View style={styles.tipCard}>
            <FontAwesome
              name="camera"
              size={16}
              color={isDark ? "#B8FF00" : colors.blue}
            />
            <Text style={styles.tipTitle}>Profilna fotografija</Text>
            <Text style={styles.tipText}>
              Jasna profilna slika povećava stopu prihvatanja poziva.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <FontAwesome
              name="shield"
              size={16}
              color={isDark ? "#B8FF00" : colors.blue}
            />
            <Text style={styles.tipTitle}>Bezbednost naloga</Text>
            <Text style={styles.tipText}>
              Aktiviraj 2FA i proveravaj aktivne uređaje jednom nedeljno.
            </Text>
          </View>
        </View>
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
    heroCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 14,
      padding: 14,
      flexDirection: "row",
      gap: 12,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(56,103,255,0.20)"
        : "rgba(56,103,255,0.12)",
    },
    heroTextWrap: {
      flex: 1,
    },
    heroTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 4,
    },
    heroSubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    timelineCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    blockTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 12,
    },
    stepRow: {
      flexDirection: "row",
      gap: 10,
    },
    stepMarkerWrap: {
      width: 22,
      alignItems: "center",
    },
    stepMarker: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(56,103,255,0.20)"
        : "rgba(56,103,255,0.12)",
      borderWidth: 1,
      borderColor: colors.blue,
    },
    stepLine: {
      width: 1,
      flex: 1,
      backgroundColor: colors.border,
      marginTop: 4,
      marginBottom: 4,
    },
    stepTextWrap: {
      flex: 1,
      paddingBottom: 12,
    },
    stepTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 4,
    },
    stepText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    tipsRow: {
      flexDirection: "row",
      gap: 10,
    },
    tipCard: {
      flex: 1,
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tipTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
      marginTop: 8,
      marginBottom: 4,
    },
    tipText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
  });

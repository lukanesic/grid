import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../contexts/ThemeContext";

const PAYMENT_METHODS = ["Visa", "Mastercard", "Apple Pay", "Google Pay"];

const FAQ = [
  {
    question: "Kada se naplaćuje pretplata?",
    answer:
      "Naplaćivanje se vrši automatski na datum obnove. Datum možeš videti u sekciji Pretplata i naplata.",
  },
  {
    question: "Kako da otkažem pretplatu?",
    answer:
      "Otvori Podešavanja > Pretplata i naplata > Otkaži plan. Pristup ostaje aktivan do kraja plaćenog perioda.",
  },
  {
    question: "Da li je moguć povraćaj novca?",
    answer:
      "Povraćaj je moguć u prvih 14 dana za slučajeve dvostruke naplate ili tehničkog problema. Kontaktiraj podršku.",
  },
];

export default function HelpPaymentSubscriptionScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Plaćanje i pretplata</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.infoCard}>
          <FontAwesome name="credit-card" size={16} color={colors.blue} />
          <Text style={styles.infoText}>
            Ovde možeš naći sve informacije o aktivaciji plana, naplati,
            otkazivanju i povraćaju novca.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Aktivacija pretplate</Text>
          <Text style={styles.sectionText}>
            Idi na Meni &gt; Pretplata i naplata, izaberi plan (mesečni,
            godišnji ili doživotni), potvrdi način plaćanja i aktiviraj plan.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Podržani načini plaćanja</Text>
          <View style={styles.chipsRow}>
            {PAYMENT_METHODS.map((method) => (
              <View key={method} style={styles.methodChip}>
                <Text style={styles.methodChipText}>{method}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Otkazivanje plana</Text>
          <Text style={styles.sectionText}>
            Pretplatu možeš otkazati u bilo kom trenutku. Nakon otkazivanja,
            premium funkcije ostaju aktivne do isteka trenutnog obračunskog
            perioda.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>4. Povraćaj novca</Text>
          <Text style={styles.sectionText}>
            Za zahtev za povraćaj pošalji poruku podršci sa detaljima
            transakcije (datum, iznos, metoda plaćanja). Odgovor stiže u roku od
            24-48h.
          </Text>
        </View>

        <Text style={styles.faqTitle}>Najčešća pitanja</Text>
        {FAQ.map((item, index) => (
          <View key={index} style={styles.faqCard}>
            <Text style={styles.faqQuestion}>{item.question}</Text>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </View>
        ))}
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
    sectionCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 8,
    },
    sectionText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 20,
    },
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    methodChip: {
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: isDark ? "#1E1F23" : colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    methodChipText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    faqTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "700",
      marginTop: 8,
      marginBottom: 10,
    },
    faqCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    faqQuestion: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 6,
    },
    faqAnswer: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },
  });

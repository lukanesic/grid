import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuCard, MenuHeader, MenuInfoCard } from "../../../components/menu";
import { useTheme } from "../../../contexts/ThemeContext";

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
      <MenuHeader title="Plaćanje i pretplata" onBack={() => router.back()} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <MenuInfoCard
          icon="credit-card"
          text="Ovde možeš naći sve informacije o aktivaciji plana, naplati, otkazivanju i povraćaju novca."
        />

        <MenuCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Aktivacija pretplate</Text>
          <Text style={styles.sectionText}>
            Idi na Meni &gt; Pretplata i naplata, izaberi plan (mesečni,
            godišnji ili doživotni), potvrdi način plaćanja i aktiviraj plan.
          </Text>
        </MenuCard>

        <MenuCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Podržani načini plaćanja</Text>
          <View style={styles.chipsRow}>
            <View style={styles.methodChip}>
              <FontAwesome5 name="cc-visa" size={15} color={colors.text} />
              <Text style={styles.methodChipText}>Visa</Text>
            </View>

            <View style={styles.methodChip}>
              <FontAwesome5
                name="cc-mastercard"
                size={15}
                color={colors.text}
              />
              <Text style={styles.methodChipText}>Mastercard</Text>
            </View>

            <View style={styles.methodChip}>
              <FontAwesome5 name="cc-apple-pay" size={15} color={colors.text} />
              <Text style={styles.methodChipText}>Apple Pay</Text>
            </View>

            <View style={styles.methodChip}>
              <FontAwesome5 name="google-play" size={14} color={colors.text} />
              <Text style={styles.methodChipText}>Google Play</Text>
            </View>
          </View>
        </MenuCard>

        <MenuCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Otkazivanje plana</Text>
          <Text style={styles.sectionText}>
            Pretplatu možeš otkazati u bilo kom trenutku. Nakon otkazivanja,
            premium funkcije ostaju aktivne do isteka trenutnog obračunskog
            perioda.
          </Text>
        </MenuCard>

        <MenuCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>4. Povraćaj novca</Text>
          <Text style={styles.sectionText}>
            Za zahtev za povraćaj pošalji poruku podršci sa detaljima
            transakcije (datum, iznos, metoda plaćanja). Odgovor stiže u roku od
            24-48h.
          </Text>
        </MenuCard>

        <Text style={styles.faqTitle}>Najčešća pitanja</Text>
        {FAQ.map((item, index) => (
          <MenuCard key={index} style={styles.faqCard}>
            <Text style={styles.faqQuestion}>{item.question}</Text>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </MenuCard>
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
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    sectionCard: {
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
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
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

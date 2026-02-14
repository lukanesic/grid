import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuCard, MenuHeader, MenuInfoCard } from "../../../components/menu";
import { useTheme } from "../../../contexts/ThemeContext";

const FAQ = [
  {
    question: "Koliko ranije mogu da rezervišem teren?",
    answer:
      "Rezervacija je dostupna do 14 dana unapred. Neki klubovi mogu imati kraći period u zavisnosti od pravila.",
  },
  {
    question: "Kako da izmenim vreme rezervacije?",
    answer:
      "Otvorite detalje rezervacije i izaberite Promeni termin. Sistem će prikazati samo dostupne slotove.",
  },
  {
    question: "Šta ako kasnim na termin?",
    answer:
      "Preporuka je da dođeš 10 minuta ranije. Kašnjenje duže od 15 minuta može automatski osloboditi teren.",
  },
];

export default function HelpReservationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <MenuHeader title="Rezervacije" onBack={() => router.back()} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <MenuInfoCard
          icon="calendar"
          text="Ovaj vodič objašnjava kako da kreiraš, izmeniš i otkažeš rezervaciju, kao i šta se dešava u slučaju kašnjenja."
        />

        <MenuCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Kreiranje rezervacije</Text>
          <Text style={styles.sectionText}>
            Idi na Community ili Create Match, izaberi klub, datum, vreme i
            teren. Nakon potvrde, rezervacija se prikazuje u sažetku i u
            istoriji mečeva.
          </Text>
        </MenuCard>

        <MenuCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Izmena termina</Text>
          <Text style={styles.sectionText}>
            Otvori detalje postojeće rezervacije i klikni na Promeni termin.
            Dostupni su samo slobodni slotovi u izabranom klubu.
          </Text>
        </MenuCard>

        <MenuCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Otkazivanje rezervacije</Text>
          <Text style={styles.sectionText}>
            Rezervaciju možeš otkazati do 24h pre početka bez dodatne naplate.
            Otkazivanja u kraćem roku mogu imati delimičnu naplatu, u zavisnosti
            od pravila kluba.
          </Text>
        </MenuCard>

        <MenuCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>4. Check-in na lokaciji</Text>
          <Text style={styles.sectionText}>
            Po dolasku potvrdi prisustvo u aplikaciji ili na recepciji kluba.
            Time zaključavaš rezervaciju i obaveštavaš ostale igrače.
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

const getStyles = (colors: any) =>
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

import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Image,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    APP_INFO,
    LEGAL_LINKS,
    SOCIAL_LINKS,
    TEAM_MEMBERS,
} from "../../../constants/data";

export default function AboutAppScreen() {
  const router = useRouter();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
        </Pressable>
        <Text style={styles.headerTitle}>O aplikaciji</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo & Name */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/logo/home-icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>GRID</Text>
          <Text style={styles.tagline}>Tvoj partner za padel</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v{APP_INFO.version}</Text>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Verzija</Text>
              <Text style={styles.infoValue}>{APP_INFO.version}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>{APP_INFO.buildNumber}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Datum</Text>
              <Text style={styles.infoValue}>{APP_INFO.releaseDate}</Text>
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O nama</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              GRID je aplikacija za pronalaženje igrača, rezervaciju terena i
              organizovanje padel mečeva. Naša misija je da povežemo padel
              zajednicu i učinimo sport dostupnijim svima.
            </Text>
            <Text style={styles.aboutText}>
              Osnovana 2024. godine, aplikacija je brzo postala vodeća platforma
              za padel igrače u regionu.
            </Text>
          </View>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Naš tim</Text>
          <View style={styles.teamGrid}>
            {TEAM_MEMBERS.map((member, index) => (
              <View key={index} style={styles.teamCard}>
                <Image
                  source={{
                    uri: `https://i.pravatar.cc/150?img=${member.avatar}`,
                  }}
                  style={styles.teamAvatar}
                />
                <Text style={styles.teamName}>{member.name}</Text>
                <Text style={styles.teamRole}>{member.role}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pratite nas</Text>
          <View style={styles.socialGrid}>
            {SOCIAL_LINKS.map((social, index) => (
              <Pressable
                key={index}
                style={styles.socialButton}
                onPress={() => openLink(social.url)}
              >
                <FontAwesome
                  name={social.icon as any}
                  size={24}
                  color="#F2F2F2"
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pravni dokumenti</Text>
          {LEGAL_LINKS.map((link, index) => (
            <Pressable key={index} style={styles.legalCard}>
              <View style={styles.legalLeft}>
                <FontAwesome
                  name={link.icon as any}
                  size={20}
                  color="#8B8B8B"
                />
                <View style={styles.legalText}>
                  <Text style={styles.legalTitle}>{link.title}</Text>
                  <Text style={styles.legalSubtitle}>{link.subtitle}</Text>
                </View>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#8B8B8B" />
            </Pressable>
          ))}
        </View>

        {/* What's New */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Šta je novo</Text>
          <View style={styles.changelogCard}>
            <View style={styles.changelogHeader}>
              <Text style={styles.changelogVersion}>v{APP_INFO.version}</Text>
              <Text style={styles.changelogDate}>{APP_INFO.releaseDate}</Text>
            </View>
            <View style={styles.changelogItem}>
              <FontAwesome name="check" size={12} color="#B8FF00" />
              <Text style={styles.changelogText}>
                Novi dizajn profila korisnika
              </Text>
            </View>
            <View style={styles.changelogItem}>
              <FontAwesome name="check" size={12} color="#B8FF00" />
              <Text style={styles.changelogText}>
                Poboljšana pretraga igrača
              </Text>
            </View>
            <View style={styles.changelogItem}>
              <FontAwesome name="check" size={12} color="#B8FF00" />
              <Text style={styles.changelogText}>
                Ispravke grešaka i optimizacije
              </Text>
            </View>
          </View>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zasluge</Text>
          <View style={styles.creditsCard}>
            <Text style={styles.creditsText}>
              Ikone: Font Awesome{"\n"}
              Slike: Pexels & Unsplash{"\n"}
              Mape: Google Maps API{"\n"}
              Plaćanje: Stripe
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Napravljeno sa ❤️ u Beogradu</Text>
          <Text style={styles.copyrightText}>
            © 2024-2026 GRID App. Sva prava zadržana.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: "#121418",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
  },
  appName: {
    color: "#F2F2F2",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  tagline: {
    color: "#8B8B8B",
    fontSize: 15,
    marginBottom: 12,
  },
  versionBadge: {
    backgroundColor: "#121418",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  versionText: {
    color: "#B8FF00",
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  infoLabel: {
    color: "#8B8B8B",
    fontSize: 12,
    marginBottom: 8,
  },
  infoValue: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "700",
  },
  aboutCard: {
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  aboutText: {
    color: "#8B8B8B",
    fontSize: 15,
    lineHeight: 22,
  },
  teamGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  teamCard: {
    width: "48%",
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  teamAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  teamName: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  teamRole: {
    color: "#8B8B8B",
    fontSize: 12,
    textAlign: "center",
  },
  socialGrid: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  legalCard: {
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  legalLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  legalText: {
    flex: 1,
  },
  legalTitle: {
    color: "#F2F2F2",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  legalSubtitle: {
    color: "#8B8B8B",
    fontSize: 13,
  },
  changelogCard: {
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 20,
  },
  changelogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F23",
  },
  changelogVersion: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "700",
  },
  changelogDate: {
    color: "#8B8B8B",
    fontSize: 13,
  },
  changelogItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  changelogText: {
    color: "#F2F2F2",
    fontSize: 14,
    flex: 1,
  },
  creditsCard: {
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 20,
  },
  creditsText: {
    color: "#8B8B8B",
    fontSize: 14,
    lineHeight: 24,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  footerText: {
    color: "#8B8B8B",
    fontSize: 14,
    marginBottom: 8,
  },
  copyrightText: {
    color: "#8B8B8B",
    fontSize: 12,
  },
});

import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const [privateProfile, setPrivateProfile] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showMatchHistory, setShowMatchHistory] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [saveSearchHistory, setSaveSearchHistory] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
        </Pressable>
        <Text style={styles.headerTitle}>Privatnost i bezbednost</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privatnost profila</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome name="lock" size={20} color="#8B8B8B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Privatni profil</Text>
                  <Text style={styles.settingDescription}>
                    Samo odobreni mogu videti profil
                  </Text>
                </View>
              </View>
              <Switch
                value={privateProfile}
                onValueChange={setPrivateProfile}
                trackColor={{ false: "#2C2C2C", true: "#3867FF" }}
                thumbColor="#F2F2F2"
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome
                  name="circle"
                  size={20}
                  color={showOnlineStatus ? "#B8FF00" : "#8B8B8B"}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Online status</Text>
                  <Text style={styles.settingDescription}>
                    Prikaži kada si aktivan
                  </Text>
                </View>
              </View>
              <Switch
                value={showOnlineStatus}
                onValueChange={setShowOnlineStatus}
                trackColor={{ false: "#2C2C2C", true: "#3867FF" }}
                thumbColor="#F2F2F2"
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome name="trophy" size={20} color="#8B8B8B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Istorija mečeva</Text>
                  <Text style={styles.settingDescription}>
                    Prikaži prethodne mečeve
                  </Text>
                </View>
              </View>
              <Switch
                value={showMatchHistory}
                onValueChange={setShowMatchHistory}
                trackColor={{ false: "#2C2C2C", true: "#3867FF" }}
                thumbColor="#F2F2F2"
              />
            </View>
          </View>
        </View>

        {/* Communication Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Komunikacija</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome name="envelope" size={20} color="#8B8B8B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Poruke</Text>
                  <Text style={styles.settingDescription}>
                    Ko može da ti šalje poruke
                  </Text>
                </View>
              </View>
              <Switch
                value={allowMessages}
                onValueChange={setAllowMessages}
                trackColor={{ false: "#2C2C2C", true: "#3867FF" }}
                thumbColor="#F2F2F2"
              />
            </View>
          </View>

          <Pressable style={styles.linkCard}>
            <View style={styles.linkLeft}>
              <FontAwesome name="ban" size={20} color="#8B8B8B" />
              <Text style={styles.linkTitle}>Blokirani korisnici</Text>
            </View>
            <View style={styles.linkRight}>
              <Text style={styles.linkCount}>3</Text>
              <FontAwesome name="chevron-right" size={16} color="#8B8B8B" />
            </View>
          </Pressable>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bezbednost</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome name="shield" size={20} color="#8B8B8B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>
                    Dvofaktorska autentifikacija
                  </Text>
                  <Text style={styles.settingDescription}>
                    Dodatna zaštita naloga
                  </Text>
                </View>
              </View>
              <Switch
                value={twoFactorAuth}
                onValueChange={setTwoFactorAuth}
                trackColor={{ false: "#2C2C2C", true: "#3867FF" }}
                thumbColor="#F2F2F2"
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome name="camera" size={20} color="#8B8B8B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Biometrijska prijava</Text>
                  <Text style={styles.settingDescription}>
                    Face ID / Touch ID
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricLogin}
                onValueChange={setBiometricLogin}
                trackColor={{ false: "#2C2C2C", true: "#3867FF" }}
                thumbColor="#F2F2F2"
              />
            </View>
          </View>

          <Pressable style={styles.linkCard}>
            <View style={styles.linkLeft}>
              <FontAwesome name="history" size={20} color="#8B8B8B" />
              <Text style={styles.linkTitle}>Istorija prijavljivanja</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#8B8B8B" />
          </Pressable>

          <Pressable style={styles.linkCard}>
            <View style={styles.linkLeft}>
              <FontAwesome name="mobile" size={20} color="#8B8B8B" />
              <Text style={styles.linkTitle}>Aktivni uređaji</Text>
            </View>
            <View style={styles.linkRight}>
              <Text style={styles.linkCount}>2</Text>
              <FontAwesome name="chevron-right" size={16} color="#8B8B8B" />
            </View>
          </Pressable>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Podaci</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome name="search" size={20} color="#8B8B8B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>
                    Istorija pretraživanja
                  </Text>
                  <Text style={styles.settingDescription}>
                    Čuvaj pretraživanja
                  </Text>
                </View>
              </View>
              <Switch
                value={saveSearchHistory}
                onValueChange={setSaveSearchHistory}
                trackColor={{ false: "#2C2C2C", true: "#3867FF" }}
                thumbColor="#F2F2F2"
              />
            </View>
          </View>

          <Pressable style={styles.linkCard}>
            <View style={styles.linkLeft}>
              <FontAwesome name="download" size={20} color="#8B8B8B" />
              <Text style={styles.linkTitle}>Preuzmi moje podatke</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#8B8B8B" />
          </Pressable>

          <Pressable style={styles.linkCard}>
            <View style={styles.linkLeft}>
              <FontAwesome name="trash" size={20} color="#FF4444" />
              <Text style={[styles.linkTitle, { color: "#FF4444" }]}>
                Obriši sve podatke
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#FF4444" />
          </Pressable>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <FontAwesome name="info-circle" size={16} color="#3867FF" />
          <Text style={styles.infoText}>
            Ove postavke kontrolišu kako drugi vide tvoj profil i kako možeš da
            koristiš aplikaciju. Saznaj više o privatnosti.
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: "#121418",
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
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    color: "#8B8B8B",
    fontSize: 13,
    lineHeight: 18,
  },
  linkCard: {
    backgroundColor: "#121418",
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
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
  },
  linkRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  linkCount: {
    color: "#8B8B8B",
    fontSize: 14,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#1E1F23",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  infoText: {
    flex: 1,
    color: "#8B8B8B",
    fontSize: 14,
    lineHeight: 20,
  },
});

import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileInfoScreen() {
  const router = useRouter();
  const [name, setName] = useState("Marko Petrović");
  const [email, setEmail] = useState("marko.petrovic@email.com");
  const [phone, setPhone] = useState("+381 64 123 4567");
  const [password, setPassword] = useState("••••••••");
  const [birthDate, setBirthDate] = useState("15.03.1995");
  const [location, setLocation] = useState("Beograd, Srbija");
  const [showPassword, setShowPassword] = useState(false);
  const [avatar] = useState("https://i.pravatar.cc/150?img=47");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
        </Pressable>
        <Text style={styles.headerTitle}>Profil informacije</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <Pressable style={styles.changeAvatarButton}>
            <FontAwesome name="camera" size={16} color="#0B0B0B" />
            <Text style={styles.changeAvatarText}>Promeni sliku</Text>
          </Pressable>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lične informacije</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ime i prezime</Text>
            <View style={styles.inputCard}>
              <FontAwesome name="user" size={18} color="#8B8B8B" />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#8B8B8B"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputCard}>
              <FontAwesome name="envelope" size={18} color="#8B8B8B" />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#8B8B8B"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Broj telefona</Text>
            <View style={styles.inputCard}>
              <FontAwesome name="phone" size={18} color="#8B8B8B" />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#8B8B8B"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Datum rođenja</Text>
            <View style={styles.inputCard}>
              <FontAwesome name="calendar" size={18} color="#8B8B8B" />
              <TextInput
                style={styles.input}
                value={birthDate}
                onChangeText={setBirthDate}
                placeholderTextColor="#8B8B8B"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lokacija</Text>
            <View style={styles.inputCard}>
              <FontAwesome name="map-marker" size={18} color="#8B8B8B" />
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#8B8B8B"
              />
            </View>
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sigurnost</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lozinka</Text>
            <View style={styles.inputCard}>
              <FontAwesome name="lock" size={18} color="#8B8B8B" />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#8B8B8B"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <FontAwesome
                  name={showPassword ? "eye" : "eye-slash"}
                  size={18}
                  color="#8B8B8B"
                />
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.changePasswordLink}>
            <Text style={styles.changePasswordText}>Promeni lozinku</Text>
            <FontAwesome name="chevron-right" size={14} color="#B8FF00" />
          </Pressable>
        </View>

        {/* Game Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Igračke informacije</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <FontAwesome name="trophy" size={24} color="#B8FF00" />
              <Text style={styles.statValue}>47</Text>
              <Text style={styles.statLabel}>Mečeva</Text>
            </View>
            <View style={styles.statCard}>
              <FontAwesome name="star" size={24} color="#B8FF00" />
              <Text style={styles.statValue}>4.5</Text>
              <Text style={styles.statLabel}>Rejting</Text>
            </View>
            <View style={styles.statCard}>
              <FontAwesome name="percent" size={24} color="#B8FF00" />
              <Text style={styles.statValue}>68%</Text>
              <Text style={styles.statLabel}>Win rate</Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zona opasnosti</Text>
          <Pressable style={styles.dangerButton}>
            <FontAwesome name="trash" size={16} color="#FF4444" />
            <Text style={styles.dangerButtonText}>Obriši nalog</Text>
          </Pressable>
        </View>

        {/* <View style={{ height: 100 }} /> */}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Pressable style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Sačuvaj izmene</Text>
        </Pressable>
      </View>
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
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#B8FF00",
  },
  changeAvatarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#B8FF00",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  changeAvatarText: {
    color: "#0B0B0B",
    fontSize: 14,
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#8B8B8B",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputCard: {
    backgroundColor: "#121418",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    color: "#F2F2F2",
    fontSize: 16,
  },
  changePasswordLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#121418",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  changePasswordText: {
    color: "#B8FF00",
    fontSize: 15,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    color: "#F2F2F2",
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    color: "#8B8B8B",
    fontSize: 12,
    fontWeight: "600",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1E1F23",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#FF4444",
  },
  dangerButtonText: {
    color: "#FF4444",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    backgroundColor: "#0B0B0B",
    borderTopWidth: 1,
    borderTopColor: "#1E1F23",
  },
  saveButton: {
    backgroundColor: "#B8FF00",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#0B0B0B",
    fontSize: 16,
    fontWeight: "700",
  },
});

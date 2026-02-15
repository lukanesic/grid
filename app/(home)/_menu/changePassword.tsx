import { Button } from "@/components";
import AuthInput from "@/components/auth/AuthInput";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../contexts/ThemeContext";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const styles = getStyles(colors, isDark);
  const accentColor = isDark ? "#B8FF00" : colors.blue;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    // Validacija inputa
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Greška", "Popunite sva polja");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Greška", "Nova lozinka i potvrda se ne poklapaju");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Greška", "Nova lozinka mora imati najmanje 6 karaktera");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert("Greška", "Nova lozinka mora biti različita od trenutne");
      return;
    }

    // Pokreni loading
    setIsLoading(true);

    // Proveri da li postoji email
    if (!user?.email) {
      setIsLoading(false);
      Alert.alert("Greška", "Korisnik nije pronađen");
      return;
    }

    // Verifikuj trenutnu lozinku
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setIsLoading(false);
      Alert.alert("Greška", "Trenutna lozinka nije ispravna");
      return;
    }

    // Promeni lozinku
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    // Gasim loading PRE provere greške
    setIsLoading(false);

    if (updateError) {
      Alert.alert("Greška", updateError.message);
      return;
    }

    // Uspeh
    Alert.alert("Uspeh", "Lozinka je uspešno promenjena", [
      {
        text: "Zatvori",
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Promeni lozinku</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.description}>
          Unesite trenutnu lozinku i novu lozinku koju želite da koristite.
        </Text>

        <View style={styles.section}>
          <AuthInput
            icon="lock"
            label="Trenutna lozinka"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Unesite trenutnu lozinku"
            secureTextEntry={!showCurrentPassword}
            showPasswordToggle={true}
            isPasswordVisible={showCurrentPassword}
            onTogglePassword={() =>
              setShowCurrentPassword(!showCurrentPassword)
            }
            autoCapitalize="none"
          />

          <AuthInput
            icon="lock"
            label="Nova lozinka"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Unesite novu lozinku"
            secureTextEntry={!showNewPassword}
            showPasswordToggle={true}
            isPasswordVisible={showNewPassword}
            onTogglePassword={() => setShowNewPassword(!showNewPassword)}
            autoCapitalize="none"
          />

          <AuthInput
            icon="lock"
            label="Potvrdi novu lozinku"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Potvrdite novu lozinku"
            secureTextEntry={!showConfirmPassword}
            showPasswordToggle={true}
            isPasswordVisible={showConfirmPassword}
            onTogglePassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            autoCapitalize="none"
          />
        </View>

        <View style={styles.infoBox}>
          <FontAwesome name="info-circle" size={16} color={accentColor} />
          <Text style={styles.infoText}>
            Lozinka mora imati najmanje 6 karaktera
          </Text>
        </View>

        <Button
          title="Promeni lozinku"
          onPress={handleChangePassword}
          disabled={isLoading}
        />
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={styles.loadingText}>Menjam lozinku...</Text>
          </View>
        </View>
      )}
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
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#2A2A2A" : "#E6E6E6",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 20,
      marginBottom: 24,
      lineHeight: 20,
    },
    section: {
      gap: 16,
      marginBottom: 24,
    },
    infoBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      backgroundColor: isDark ? "#1A1A1A" : "#F5F5F5",
      borderRadius: 8,
      marginBottom: 24,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    loadingContainer: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      gap: 12,
    },
    loadingText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "500",
    },
  });

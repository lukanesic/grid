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

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const styles = getStyles(colors, isDark);

  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDeleteAccount = async () => {
    // Validacija
    if (!password) {
      Alert.alert("Greška", "Unesite vašu lozinku");
      return;
    }

    if (confirmText.toLowerCase() !== "obriši") {
      Alert.alert("Greška", 'Morate uneti "obriši" za potvrdu');
      return;
    }

    // Poslednje upozorenje
    Alert.alert(
      "Poslednje upozorenje",
      "Da li ste apsolutno sigurni? Vaš nalog će biti trajno obrisan i nećete moći da ga vratite.",
      [
        {
          text: "Otkaži",
          style: "cancel",
        },
        {
          text: "Da, obriši nalog",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);

            try {
              // Verifikuj lozinku
              if (!user?.email) {
                throw new Error("Korisnik nije pronađen");
              }

              const { error: signInError } =
                await supabase.auth.signInWithPassword({
                  email: user.email,
                  password: password,
                });

              if (signInError) {
                setIsLoading(false);
                Alert.alert("Greška", "Pogrešna lozinka");
                return;
              }

              // Obriši auth korisnika preko RPC funkcije
              const { error: deleteError } = await supabase.rpc(
                "delete_user_account",
              );

              if (deleteError) {
                throw new Error(deleteError.message);
              }

              // Logout
              await supabase.auth.signOut();
              setIsLoading(false);

              // Redirect na welcome - router.replace ne radi nakon signOut zbog guard-a
              // Auth guard će automatski редиректовати na welcome
            } catch (error: any) {
              setIsLoading(false);
              Alert.alert("Greška", error.message || "Došlo je do greške");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Obriši nalog</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Warning Section */}
        <View style={styles.warningBox}>
          <FontAwesome name="exclamation-triangle" size={48} color="#FF3B30" />
          <Text style={styles.warningTitle}>Upozorenje</Text>
          <Text style={styles.warningText}>
            Brisanje naloga je trajna akcija i ne može se poništiti.
          </Text>
        </View>

        {/* What You'll Lose */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Šta ćete izgubiti:</Text>
          <View style={styles.lossItem}>
            <FontAwesome name="user" size={16} color={colors.textSecondary} />
            <Text style={styles.lossText}>Vaš profil i lične informacije</Text>
          </View>
          <View style={styles.lossItem}>
            <FontAwesome name="trophy" size={16} color={colors.textSecondary} />
            <Text style={styles.lossText}>
              Svi mečevi, rezultati i statistike
            </Text>
          </View>
          <View style={styles.lossItem}>
            <FontAwesome
              name="comments"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.lossText}>Sve poruke i konverzacije</Text>
          </View>
          <View style={styles.lossItem}>
            <FontAwesome name="users" size={16} color={colors.textSecondary} />
            <Text style={styles.lossText}>Prijateljstva i društvene veze</Text>
          </View>
        </View>

        {/* Confirmation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Potvrda identiteta</Text>
          <AuthInput
            icon="lock"
            placeholder="Unesite vašu lozinku"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            showPasswordToggle={true}
            isPasswordVisible={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            autoCapitalize="none"
          />

          <Text style={styles.confirmLabel}>Unesite "obriši" za potvrdu:</Text>
          <AuthInput
            icon="warning"
            placeholder='Upišite "obriši"'
            value={confirmText}
            onChangeText={setConfirmText}
            autoCapitalize="none"
          />
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <FontAwesome name="info-circle" size={16} color="#007AFF" />
          <Text style={styles.infoText}>
            Alternativa: Možete privremeno deaktivirati nalog umesto trajnog
            brisanja. Kontaktirajte podršku za više opcija.
          </Text>
        </View>

        {/* Delete Button */}
        <Pressable
          style={[
            styles.deleteButton,
            isLoading && styles.deleteButtonDisabled,
          ]}
          onPress={handleDeleteAccount}
          disabled={isLoading}
        >
          <Text style={styles.deleteButtonText}>Trajno obriši nalog</Text>
        </Pressable>
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF3B30" />
            <Text style={styles.loadingText}>Brišem nalog...</Text>
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
    warningBox: {
      alignItems: "center",
      padding: 24,
      backgroundColor: isDark ? "#2A1A1A" : "#FFF5F5",
      borderRadius: 12,
      marginTop: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: isDark ? "#3A2020" : "#FFEBEB",
    },
    warningTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#FF3B30",
      marginTop: 12,
      marginBottom: 8,
    },
    warningText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 12,
    },
    lossItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 8,
    },
    lossText: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    confirmLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 8,
      marginTop: 8,
    },
    infoBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      padding: 12,
      backgroundColor: isDark ? "#1A1F2A" : "#EBF5FF",
      borderRadius: 8,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: isDark ? "#2A3545" : "#D1E9FF",
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    deleteButton: {
      backgroundColor: "#FF3B30",
      borderRadius: 24,
      paddingVertical: 14,
      alignItems: "center",
      marginBottom: 20,
    },
    deleteButtonDisabled: {
      backgroundColor: isDark ? "#3A2020" : "#FFB3B0",
    },
    deleteButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
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

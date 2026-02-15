import AuthButton from "@/components/auth/AuthButton";
import AuthDivider from "@/components/auth/AuthDivider";
import AuthFooter from "@/components/auth/AuthFooter";
import AuthInput from "@/components/auth/AuthInput";
import AuthSocialButton from "@/components/auth/AuthSocialButton";
import AuthSubtitle from "@/components/auth/AuthSubtitle";
import AuthTitle from "@/components/auth/AuthTitle";
import { supabase } from "@/lib/supabase";
import { isValidEmail } from "@/utils/validation";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (isSubmitting) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Greska", "Popunite sva polja za registraciju.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert("Greska", "Unesite ispravnu email adresu.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Greska", "Lozinke se ne poklapaju.");
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      Alert.alert("Greska", error.message);
      return;
    }

    if (!data.user) {
      Alert.alert("Greska", "Neuspesna registracija.");
      return;
    }

    // Note: Profile is automatically created by Supabase trigger (handle_new_user)

    if (!data.session) {
      Alert.alert(
        "Uspeh",
        "Nalogu je poslata potvrda na email. Potvrdite email adresu da nastavite.",
      );
      return;
    }

    // User will be redirected to /createProfile by AuthContext guard
    // since profile_completed is false
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <AuthTitle>Registrujte se</AuthTitle>
        <AuthSubtitle>
          Izaberite vas preferirani nacin da se registrujete ili prijavite
        </AuthSubtitle>

        <View style={styles.form}>
          <AuthInput
            icon="envelope-o"
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <AuthInput
            icon="lock"
            iconSize={18}
            placeholder="Lozinka"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <AuthInput
            icon="lock"
            iconSize={18}
            placeholder="Potvrdi lozinku"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <AuthButton onPress={handleRegister} loading={isSubmitting}>
            Registruj se
          </AuthButton>

          <AuthDivider />

          <AuthSocialButton icon="apple" onPress={() => {}}>
            Nastavi sa Apple
          </AuthSocialButton>

          <AuthSocialButton icon="google" onPress={() => {}}>
            Nastavi sa Google
          </AuthSocialButton>

          <AuthFooter
            text="Vec imate nalog?"
            linkText="Ulogujte se"
            onLinkPress={() => router.push("/(auth)/login")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: "center",
  },
  form: {
    marginTop: 28,
  },
});

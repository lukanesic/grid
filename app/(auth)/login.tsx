import AuthButton from "@/components/auth/AuthButton";
import AuthDivider from "@/components/auth/AuthDivider";
import AuthFooter from "@/components/auth/AuthFooter";
import AuthInput from "@/components/auth/AuthInput";
import AuthLink from "@/components/auth/AuthLink";
import AuthSocialButton from "@/components/auth/AuthSocialButton";
import AuthSubtitle from "@/components/auth/AuthSubtitle";
import AuthTitle from "@/components/auth/AuthTitle";
import { supabase } from "@/lib/supabase";
import { isValidEmail } from "@/utils/validation";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (isSubmitting) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!email.trim() || !password.trim()) {
      Alert.alert("Greska", "Unesite email i lozinku.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert("Greska", "Unesite ispravnu email adresu.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      Alert.alert("Greska", error.message);
      return;
    }

    router.push("/(home)");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <AuthTitle>Ulogujte se</AuthTitle>
        <AuthSubtitle>
          Izaberite vas preferirani nacin da se ulogujete ili prijavite
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

          <AuthLink onPress={() => router.push("/(auth)/reset-password")}>
            Zaboravljena lozinka?
          </AuthLink>

          <AuthButton onPress={handleLogin} loading={isSubmitting}>
            Prijavi se
          </AuthButton>

          <AuthDivider />

          <AuthSocialButton icon="apple" onPress={() => {}}>
            Nastavi sa Apple
          </AuthSocialButton>

          <AuthSocialButton icon="google" onPress={() => {}}>
            Nastavi sa Google
          </AuthSocialButton>

          <AuthFooter
            text="Nemate nalog?"
            linkText="Registruj se"
            onLinkPress={() => router.push("/(auth)/register")}
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
    marginTop: 50,
  },
});

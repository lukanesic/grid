import AuthBackButton from "@/components/auth/AuthBackButton";
import AuthButton from "@/components/auth/AuthButton";
import AuthInput from "@/components/auth/AuthInput";
import AuthSubtitle from "@/components/auth/AuthSubtitle";
import AuthTitle from "@/components/auth/AuthTitle";
import { supabase } from "@/lib/supabase";
import { isValidEmail } from "@/utils/validation";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async () => {
    if (isSubmitting) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!email.trim()) {
      Alert.alert("Greska", "Unesite email adresu.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert("Greska", "Unesite ispravnu email adresu.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);

    setIsSubmitting(false);

    if (error) {
      Alert.alert("Greska", error.message);
      return;
    }

    Alert.alert("Uspeh", "Link za reset lozinke je poslat na email.");

    router.push("/(home)");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <AuthBackButton onPress={() => router.back()} />

        <AuthTitle>Resetujte lozinku</AuthTitle>
        <AuthSubtitle>
          Unesite email da biste dobili link za reset lozinke
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

          <AuthButton onPress={handleResetPassword} loading={isSubmitting}>
            Posalji link
          </AuthButton>
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
    paddingTop: 12,
    justifyContent: "flex-start",
  },
  form: {
    marginTop: 28,
  },
});

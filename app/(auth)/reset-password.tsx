import AuthBackButton from "@/components/auth/AuthBackButton";
import AuthButton from "@/components/auth/AuthButton";
import AuthInput from "@/components/auth/AuthInput";
import AuthSubtitle from "@/components/auth/AuthSubtitle";
import AuthTitle from "@/components/auth/AuthTitle";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const router = useRouter();

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
          />

          <AuthButton onPress={() => router.push("/(home)")}>
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

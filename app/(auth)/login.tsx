import AuthButton from "@/components/auth/AuthButton";
import AuthDivider from "@/components/auth/AuthDivider";
import AuthFooter from "@/components/auth/AuthFooter";
import AuthInput from "@/components/auth/AuthInput";
import AuthLink from "@/components/auth/AuthLink";
import AuthSocialButton from "@/components/auth/AuthSocialButton";
import AuthSubtitle from "@/components/auth/AuthSubtitle";
import AuthTitle from "@/components/auth/AuthTitle";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();

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
          />

          <AuthInput
            icon="lock"
            iconSize={18}
            placeholder="Lozinka"
            secureTextEntry
          />

          <AuthLink onPress={() => router.push("/(auth)/reset-password")}>
            Zaboravljena lozinka?
          </AuthLink>

          <AuthButton onPress={() => router.push("/(home)")}>
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

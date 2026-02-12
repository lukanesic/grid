import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Image,
    ImageBackground,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = {
  ink: "#0B1220",
  surface: "#0E1524",
  surfaceSoft: "#1D2A3D",
  brand: "#3867FF",
  text: "#E9EDF5",
  textDim: "#B6C0CF",
  border: "#5E6B7F",
  white: "#FFFFFF",
};

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require("../../assets/images/welcome.jpg")}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerRow}>
            <Image
              source={require("../../assets/logo/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>
              Dobrodosli u najvecu padel zajednicu igraca, gde te cekaju mecevi
              i ljudi koji dele isti tempo i energiju.
            </Text>
            <Text style={styles.subtitle}>
              Prijavi se da igras svoj idealan mec, upoznas nove partnere i
              zakazes sledeci termin bez muke.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/(auth)/register")}
            >
              <Text style={styles.primaryButtonText}>Registracija</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.secondaryButtonText}>Uloguj se</Text>
            </Pressable>

            <Text style={styles.legalText}>
              Registracijom prihvatas nase uslove koriscenja i politiku
              privatnosti.
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

function SocialButton({
  icon,
  color,
}: {
  icon: "apple" | "google" | "facebook";
  color: string;
}) {
  return (
    <Pressable style={styles.socialButton}>
      <FontAwesome name={icon} size={20} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7, 12, 22, 0.82)",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  logoBadgeText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: Platform.select({
      ios: "AvenirNext-Bold",
      android: "sans-serif-medium",
      default: "System",
    }),
  },
  logoImage: {
    width: 150,
    height: 100,
  },
  brandText: {
    color: colors.white,
    fontSize: 18,
    letterSpacing: -1,
    fontFamily: Platform.select({
      ios: "AvenirNext-DemiBold",
      android: "sans-serif-medium",
      default: "System",
    }),
  },
  content: {
    marginTop: "auto",
    paddingBottom: 28,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.5,
    fontFamily: Platform.select({
      ios: "AvenirNext-Bold",
      android: "sans-serif-medium",
      default: "System",
    }),
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 15,
    marginTop: 8,
    marginBottom: 20,
    fontFamily: Platform.select({
      ios: "AvenirNext-Regular",
      android: "sans-serif",
      default: "System",
    }),
  },
  primaryButton: {
    backgroundColor: colors.brand,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: colors.brand,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: Platform.select({
      ios: "AvenirNext-DemiBold",
      android: "sans-serif-medium",
      default: "System",
    }),
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 28,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.55)",
    backgroundColor: "rgba(15, 24, 40, 0.2)",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontFamily: Platform.select({
      ios: "AvenirNext-Medium",
      android: "sans-serif-medium",
      default: "System",
    }),
  },
  dividerText: {
    color: colors.textDim,
    marginTop: 20,
    marginBottom: 12,
    fontSize: 13,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  socialButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  legalText: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 20,
    textAlign: "center",
  },
});

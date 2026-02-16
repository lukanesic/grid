import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/utils/uploadImage";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../contexts/ThemeContext";

export default function ProfileInfoScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { profile, user, refreshProfile } = useAuth();
  const styles = getStyles(colors, isDark);
  const accentColor = isDark ? "#B8FF00" : colors.blue;

  // Current values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState("https://i.pravatar.cc/150?img=47");

  // Original values for comparison
  const [originalValues, setOriginalValues] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    location: "",
    avatar: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      const initialValues = {
        name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone_number || "",
        birthDate: profile.birth_date || "",
        location: profile.location || "",
        avatar: profile.avatar_url || "https://i.pravatar.cc/150?img=47",
      };

      setName(initialValues.name);
      setEmail(initialValues.email);
      setPhone(initialValues.phone);
      setBirthDate(initialValues.birthDate);
      setLocation(initialValues.location);
      setAvatar(initialValues.avatar);
      setOriginalValues(initialValues);
    }
  }, [profile]);

  // Check if any value has changed
  const hasChanges =
    name !== originalValues.name ||
    email !== originalValues.email ||
    phone !== originalValues.phone ||
    birthDate !== originalValues.birthDate ||
    location !== originalValues.location ||
    avatar !== originalValues.avatar;

  const handleSaveProfile = async () => {
    if (!user || !hasChanges) return;

    setIsUpdating(true);

    let finalAvatarUrl = avatar;

    // Upload new avatar if changed and is a local URI (not a URL)
    if (avatar !== originalValues.avatar && avatar.startsWith("file://")) {
      const uploadedUrl = await uploadImage(avatar, user.id, "avatars");
      if (uploadedUrl) {
        finalAvatarUrl = uploadedUrl;
      } else {
        Alert.alert("Upozorenje", "Slika nije uspešno upload-ovana.");
        setIsUpdating(false);
        return;
      }
    }

    // Update email if changed (requires verification)
    if (email !== originalValues.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: email,
      });

      if (emailError) {
        Alert.alert(
          "Greška",
          "Došlo je do greške pri promeni email-a. Proverite novu email adresu.",
        );
        setIsUpdating(false);
        return;
      }
    }

    // Update profile data
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name,
        phone_number: phone,
        birth_date: birthDate || null,
        location: location,
        avatar_url: finalAvatarUrl,
        email: email, // Update email in profiles table too
      })
      .eq("id", user.id);

    setIsUpdating(false);

    if (error) {
      Alert.alert("Greška", "Došlo je do greške pri čuvanju profila.");
      return;
    }

    if (email !== originalValues.email) {
      Alert.alert(
        "Email promena",
        "Poslat je email na novu adresu za potvrdu. Molimo proverite inbox.",
      );
    } else {
      Alert.alert("Uspeh", "Profil je uspešno ažuriran.");
    }

    await refreshProfile();
  };

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Dozvola potrebna",
        "Potrebna je dozvola za pristup galeriji.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Profil informacije</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <Pressable
            style={styles.changeAvatarButton}
            onPress={handlePickImage}
          >
            <FontAwesome
              name="camera"
              size={16}
              color={isDark ? "#0B0B0B" : "#FFFFFF"}
            />
            <Text style={styles.changeAvatarText}>Promeni sliku</Text>
          </Pressable>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lične informacije</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ime i prezime</Text>
            <View style={styles.inputCard}>
              <FontAwesome name="user" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputCard}>
              <FontAwesome
                name="envelope"
                size={18}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Broj telefona</Text>
            <View style={styles.inputCard}>
              <FontAwesome
                name="phone"
                size={18}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Datum rođenja</Text>
            <View style={styles.inputCard}>
              <FontAwesome
                name="calendar"
                size={18}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                value={birthDate}
                onChangeText={setBirthDate}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lokacija</Text>
            <View style={styles.inputCard}>
              <FontAwesome
                name="map-marker"
                size={18}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sigurnost</Text>

          <Pressable
            style={styles.changePasswordLink}
            onPress={() => router.push("/(home)/_menu/changePassword")}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.changePasswordText}>Promeni lozinku</Text>
              <Text style={styles.changePasswordSubtext}>
                Kliknite da promenite vašu lozinku
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color={accentColor} />
          </Pressable>

          <Pressable
            style={styles.changePasswordLink}
            onPress={() => router.push("/(home)/_menu/privacySecurity")}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.changePasswordText}>
                Privatnost i bezbednost
              </Text>
              <Text style={styles.changePasswordSubtext}>
                Upravljajte privatnošću i sigurnošću naloga
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color={accentColor} />
          </Pressable>
        </View>

        {/* Game Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Igračke informacije</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <FontAwesome name="trophy" size={24} color={accentColor} />
              <Text style={styles.statValue}>
                {profile?.matches_played || 0}
              </Text>
              <Text style={styles.statLabel}>Mečeva</Text>
            </View>
            <View style={styles.statCard}>
              <FontAwesome name="star" size={24} color={accentColor} />
              <Text style={styles.statValue}>
                {profile?.rating?.toFixed(1) || "0.0"}
              </Text>
              <Text style={styles.statLabel}>Rejting</Text>
            </View>
            <View style={styles.statCard}>
              <FontAwesome name="percent" size={24} color={accentColor} />
              <Text style={styles.statValue}>
                {profile?.win_rate?.toFixed(0) || "0"}%
              </Text>
              <Text style={styles.statLabel}>Win rate</Text>
            </View>
          </View>
        </View>

        {/* Subscription Status */}
        <Pressable
          style={styles.subscriptionCard}
          onPress={() => router.push("/_menu/upgrade")}
        >
          <View style={styles.subscriptionHeader}>
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionTitle}>Plan pretplate</Text>
              <View style={styles.subscriptionBadgeRow}>
                <View
                  style={[
                    styles.planBadge,
                    {
                      backgroundColor:
                        profile?.subscription_plan === "premium"
                          ? "#B8FF00"
                          : "#8B8B8B",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.planBadgeText,
                      {
                        color:
                          profile?.subscription_plan === "premium"
                            ? "#0B0B0B"
                            : "#F2F2F2",
                      },
                    ]}
                  >
                    {profile?.subscription_plan === "premium"
                      ? "PREMIUM"
                      : "FREE"}
                  </Text>
                </View>
                {profile?.trial_ends_at && (
                  <Text style={styles.trialText}>
                    Probni period do{" "}
                    {new Date(profile.trial_ends_at).toLocaleDateString(
                      "sr-RS",
                    )}
                  </Text>
                )}
              </View>
            </View>
            <FontAwesome
              name="chevron-right"
              size={16}
              color={colors.textSecondary}
            />
          </View>
          {profile?.subscription_plan === "premium" &&
            profile.subscription_expires_at && (
              <Text style={styles.expiresText}>
                Važi do:{" "}
                {new Date(profile.subscription_expires_at).toLocaleDateString(
                  "sr-RS",
                )}
              </Text>
            )}
          {profile?.subscription_plan === "free" && (
            <Text style={styles.upgradePromptText}>
              Klikni da nadogradiš na Premium
            </Text>
          )}
        </Pressable>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zona opasnosti</Text>
          <Pressable
            style={styles.dangerButton}
            onPress={() => {
              Alert.alert(
                "Obriši nalog",
                "Da li ste sigurni da želite da obrišete nalog? Ova akcija je trajna i ne može se poništiti.",
                [
                  {
                    text: "Otkaži",
                    style: "cancel",
                  },
                  {
                    text: "Nastavi",
                    style: "destructive",
                    onPress: () => router.push("/(home)/_menu/deleteAccount"),
                  },
                ],
              );
            }}
          >
            <FontAwesome name="trash" size={16} color="#FF4444" />
            <Text style={styles.dangerButtonText}>Obriši nalog</Text>
          </Pressable>
        </View>

        {/* <View style={{ height: 100 }} /> */}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.saveButton,
            (!hasChanges || isUpdating) && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveProfile}
          disabled={!hasChanges || isUpdating}
        >
          <Text style={styles.saveButtonText}>
            {isUpdating ? "Čuvanje..." : "Sačuvaj izmene"}
          </Text>
        </Pressable>
      </View>
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
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerTitle: {
      color: colors.text,
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
      borderColor: isDark ? "#B8FF00" : colors.blue,
    },
    changeAvatarButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: isDark ? "#B8FF00" : colors.blue,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
    },
    changeAvatarText: {
      color: isDark ? "#0B0B0B" : "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
    },
    inputCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
    },
    changePasswordLink: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginTop: 8,
    },
    changePasswordText: {
      color: isDark ? "#B8FF00" : colors.blue,
      fontSize: 15,
      fontWeight: "600",
    },
    changePasswordSubtext: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 4,
    },
    subscriptionCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    subscriptionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    subscriptionInfo: {
      flex: 1,
    },
    subscriptionTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 8,
    },
    subscriptionBadgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    planBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    planBadgeText: {
      fontSize: 11,
      fontWeight: "700",
    },
    trialText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    expiresText: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 12,
    },
    upgradePromptText: {
      color: isDark ? "#B8FF00" : colors.blue,
      fontSize: 13,
      marginTop: 12,
      fontWeight: "600",
    },
    statsGrid: {
      flexDirection: "row",
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      gap: 8,
    },
    statValue: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "700",
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    dangerButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: isDark ? "#1E1F23" : colors.surface,
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
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#1E1F23" : colors.border,
    },
    saveButton: {
      backgroundColor: isDark ? "#B8FF00" : colors.blue,
      borderRadius: 24,
      paddingVertical: 16,
      alignItems: "center",
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      color: isDark ? "#0B0B0B" : "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });

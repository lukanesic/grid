import { FontAwesome } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

export default function ScanQRScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { profile } = useAuth();
  const styles = getStyles(colors);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Učitavanje...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <FontAwesome name="camera" size={64} color={colors.textSecondary} />
          <Text style={styles.permissionTitle}>Dozvola za kameru</Text>
          <Text style={styles.permissionText}>
            Potrebna nam je dozvola za kameru da bi skenirali QR kod
          </Text>
          <Pressable
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Dozvoli pristup</Text>
          </Pressable>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={[styles.backButtonText, { color: colors.text }]}>
              Nazad
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);

    try {
      // Parse QR code data
      const qrData = JSON.parse(data);

      if (qrData.type !== "grid_user") {
        Alert.alert("Nevažeći QR kod", "Ovo nije Grid QR kod");
        setScanned(false);
        return;
      }

      const { userId, username } = qrData;

      // Check if trying to follow yourself
      if (userId === profile?.id) {
        Alert.alert("Greška", "Ne možete pratiti sami sebe");
        setScanned(false);
        return;
      }

      // Check if already following
      const { data: existingFollow } = await supabase
        .from("followers")
        .select("id")
        .eq("follower_id", profile?.id)
        .eq("following_id", userId)
        .single();

      if (existingFollow) {
        Alert.alert("Već pratite", `Već pratite korisnika ${username}`, [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }

      // Add follower
      const { error } = await supabase.from("followers").insert({
        follower_id: profile?.id,
        following_id: userId,
      });

      if (error) throw error;

      Alert.alert("Uspešno!", `Sada pratite ${username}`, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error processing QR code:", error);
      Alert.alert(
        "Greška",
        "Nevažeći QR kod ili greška pri dodavanju prijatelja",
        [{ text: "OK", onPress: () => setScanned(false) }],
      );
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {/* Overlay */}
      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <FontAwesome name="times" size={24} color="white" />
          </Pressable>
        </View>

        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
          <Text style={styles.scanText}>Skeniraj Grid QR kod</Text>
          <Text style={styles.scanSubtext}>
            Pozicioniraj QR kod unutar okvira
          </Text>
        </View>

        {scanned && (
          <View style={styles.processingContainer}>
            <Text style={styles.processingText}>Obrađujem...</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    permissionContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    permissionTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "700",
      marginTop: 24,
      marginBottom: 12,
    },
    permissionText: {
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 32,
    },
    permissionButton: {
      backgroundColor: "#3867FF",
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
    permissionButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    backButton: {
      paddingVertical: 12,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    text: {
      color: colors.text,
      fontSize: 16,
    },
    overlay: {
      flex: 1,
      backgroundColor: "transparent",
    },
    header: {
      padding: 20,
      alignItems: "flex-end",
    },
    closeButton: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    scanArea: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    scanFrame: {
      width: 250,
      height: 250,
      position: "relative",
    },
    corner: {
      position: "absolute",
      width: 40,
      height: 40,
      borderColor: "white",
    },
    cornerTopLeft: {
      top: 0,
      left: 0,
      borderTopWidth: 4,
      borderLeftWidth: 4,
    },
    cornerTopRight: {
      top: 0,
      right: 0,
      borderTopWidth: 4,
      borderRightWidth: 4,
    },
    cornerBottomLeft: {
      bottom: 0,
      left: 0,
      borderBottomWidth: 4,
      borderLeftWidth: 4,
    },
    cornerBottomRight: {
      bottom: 0,
      right: 0,
      borderBottomWidth: 4,
      borderRightWidth: 4,
    },
    scanText: {
      color: "white",
      fontSize: 20,
      fontWeight: "600",
      marginTop: 40,
      textAlign: "center",
    },
    scanSubtext: {
      color: "rgba(255, 255, 255, 0.7)",
      fontSize: 14,
      marginTop: 8,
      textAlign: "center",
    },
    processingContainer: {
      position: "absolute",
      bottom: 100,
      left: 0,
      right: 0,
      alignItems: "center",
    },
    processingText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
    },
  });

import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CLUBS } from "../../constants/data";
import { useTheme } from "../../contexts/ThemeContext";

type PhotonResult = {
  id: string;
  label: string;
  lat: number;
  lon: number;
};

const CLUB_ADDRESS_HINTS: Record<number, string> = {
  1: "CN Montjuïc Barcelona",
  2: "Vall d'Hebron Barcelona",
  3: "Club Esportiu Europa Barcelona",
  4: "Padel Indoor Barcelona",
  5: "Can Caralleu Barcelona",
};

export default function ViewMapScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [selectedClubId, setSelectedClubId] = useState<number>(1);

  const mapPins = useMemo(
    () => [
      { clubId: 1, left: "18%", top: "22%" },
      { clubId: 2, left: "64%", top: "31%" },
      { clubId: 3, left: "42%", top: "48%" },
      { clubId: 4, left: "76%", top: "62%" },
      { clubId: 5, left: "27%", top: "70%" },
    ],
    [],
  );
  const fallbackClub = CLUBS[0] ?? {
    id: 0,
    name: "Club",
    location: "Barcelona",
    distance: "",
    price: "",
  };
  const selectedClub =
    CLUBS.find((club) => club.id === selectedClubId) ?? fallbackClub;

  const [addressQuery, setAddressQuery] = useState(
    CLUB_ADDRESS_HINTS[selectedClubId] ?? selectedClub.location ?? "Barcelona",
  );
  const [results, setResults] = useState<PhotonResult[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<PhotonResult | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const nextQuery =
      CLUB_ADDRESS_HINTS[selectedClubId] ??
      selectedClub.location ??
      "Barcelona";
    setAddressQuery(nextQuery);
    setSelectedAddress(null);
    setResults([]);
  }, [selectedClubId]);

  useEffect(() => {
    const trimmed = addressQuery.trim();
    if (trimmed.length < 3) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=6&lang=en`,
        );
        const data = await response.json();

        const mapped: PhotonResult[] = (data?.features ?? []).map(
          (feature: any, index: number) => {
            const [lon, lat] = feature?.geometry?.coordinates ?? [];
            const props = feature?.properties ?? {};
            const label = [
              props.name,
              props.street,
              props.housenumber,
              props.city,
              props.state,
              props.country,
            ]
              .filter(Boolean)
              .join(", ");

            return {
              id: `${feature?.properties?.osm_id ?? "item"}-${index}`,
              label: label || trimmed,
              lat,
              lon,
            };
          },
        );

        setResults(mapped.filter((item) => item.lat && item.lon));
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [addressQuery]);

  const openExternalMaps = async () => {
    const target = selectedAddress;

    const mapsUrl = target
      ? `https://maps.apple.com/?ll=${target.lat},${target.lon}&q=${encodeURIComponent(target.label)}`
      : `https://maps.apple.com/?q=${encodeURIComponent(`${selectedClub.name} ${selectedClub.location}`)}`;

    await Linking.openURL(mapsUrl);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Mapa klubova</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchCard}>
        <FontAwesome name="search" size={16} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={addressQuery}
          onChangeText={setAddressQuery}
          placeholder="Pretraži adresu (Photon)"
          placeholderTextColor={colors.textSecondary}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.blue} />
        ) : (
          <Pressable onPress={openExternalMaps}>
            <FontAwesome name="external-link" size={16} color={colors.blue} />
          </Pressable>
        )}
      </View>

      {results.length > 0 && (
        <View style={styles.resultsCard}>
          {results.slice(0, 4).map((item) => (
            <Pressable
              key={item.id}
              style={styles.resultRow}
              onPress={() => {
                setSelectedAddress(item);
                setAddressQuery(item.label);
                setResults([]);
              }}
            >
              <FontAwesome name="map-marker" size={14} color={colors.blue} />
              <Text style={styles.resultText} numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.mapContainer}>
        <View style={styles.mapSurface}>
          {mapPins.map((pin) => {
            const club = CLUBS.find((item) => item.id === pin.clubId);
            const isSelected = pin.clubId === selectedClubId;

            if (!club) {
              return null;
            }

            return (
              <Pressable
                key={club.id}
                style={[
                  styles.pin,
                  { left: pin.left as any, top: pin.top as any },
                  isSelected && styles.pinActive,
                ]}
                onPress={() => setSelectedClubId(club.id)}
              >
                <FontAwesome
                  name="map-marker"
                  size={18}
                  color={isSelected ? "#FFFFFF" : colors.blue}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoTop}>
          <View>
            <Text style={styles.clubName}>{selectedClub.name}</Text>
            <Text style={styles.clubMeta}>
              {selectedClub.distance} • {selectedClub.location}
            </Text>
          </View>
          <Text style={styles.clubPrice}>{selectedClub.price}</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.secondaryButton} onPress={openExternalMaps}>
            <Text style={styles.secondaryButtonText}>Open Maps</Text>
          </Pressable>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push(`/clubProfile?id=${selectedClub.id}`)}
          >
            <Text style={styles.primaryButtonText}>Detalji kluba</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "#121418" : colors.surface,
    },
    placeholder: {
      width: 36,
      height: 36,
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
    mapContainer: {
      flex: 1,
      marginTop: 8,
      marginBottom: 16,
    },
    searchCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 10,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
    },
    resultsCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      marginBottom: 8,
      overflow: "hidden",
    },
    resultRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resultText: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
    },
    mapSurface: {
      flex: 1,
      borderRadius: 20,
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    pin: {
      position: "absolute",
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(56,103,255,0.18)"
        : "rgba(56,103,255,0.14)",
      borderWidth: 1,
      borderColor: "rgba(56,103,255,0.35)",
    },
    pinActive: {
      backgroundColor: colors.blue,
      borderColor: colors.blue,
    },
    infoCard: {
      borderRadius: 16,
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 14,
    },
    infoTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    clubName: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 4,
      maxWidth: 240,
    },
    clubMeta: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    clubPrice: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
    actionsRow: {
      flexDirection: "row",
      gap: 10,
    },
    secondaryButton: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      backgroundColor: isDark ? "#1E1F23" : colors.background,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    primaryButton: {
      flex: 1,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      backgroundColor: colors.blue,
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
  });

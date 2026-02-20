import { FontAwesome } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ModernClubCard from "../../components/ModernClubCard";
import { useTheme } from "../../contexts/ThemeContext";
import { fetchTopClubs } from "../../lib/clubApi";

export default function AllClubsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Fetch all clubs
  const {
    data: clubs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["allClubs"],
    queryFn: () => fetchTopClubs(50), // Fetch more clubs
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Svi klubovi</Text>
        <Pressable onPress={() => router.push("/(home)/viewMap")}>
          <Text style={styles.mapLink}>Mapa</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Greška pri učitavanju klubova</Text>
        </View>
      ) : clubs.length === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Nema dostupnih klubova</Text>
        </View>
      ) : (
        <FlatList
          data={clubs}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          renderItem={({ item }) => (
            <View style={styles.clubCardContainer}>
              <ModernClubCard
                id={item.id}
                name={item.name}
                image={item.image || ""}
                distance={item.distance || "N/A"}
                price={item.price || "N/A"}
                fullWidth={true}
                onPress={() => router.push(`/(home)/clubProfile?id=${item.id}`)}
              />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
    },
    backButton: {
      padding: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      color: colors.text,
      fontSize: 20,
      fontWeight: "700",
    },
    mapLink: {
      color: "#3867FF",
      fontSize: 16,
      fontWeight: "600",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    errorText: {
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: "center",
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    clubCardContainer: {
      marginBottom: 16,
    },
  });

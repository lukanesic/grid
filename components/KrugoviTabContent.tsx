import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { fetchTopClubs } from "../lib/clubApi";

interface KrugoviTabContentProps {
  styles: any;
}

export default function KrugoviTabContent({ styles }: KrugoviTabContentProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const {
    data: topClubs = [],
    isLoading: loadingClubs,
    error: clubsError,
  } = useQuery({
    queryKey: ["topClubs"],
    queryFn: () => fetchTopClubs(10),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <>
      {/* Title Section */}
      <View style={{ marginBottom: 16 }}>
        <Text style={[styles.sectionTitle, { fontSize: 28, marginBottom: 8 }]}>
          🏆 Top klubovi
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          Najpopularniji klubovi sa najviše pratilaca
        </Text>
      </View>

      {/* Top Clubs */}
      {loadingClubs ? (
        <View style={{ paddingVertical: 60, alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.textSecondary, marginTop: 16 }}>
            Učitavamo najbolje klubove...
          </Text>
        </View>
      ) : clubsError ? (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Greška pri učitavanju klubova
          </Text>
        </View>
      ) : topClubs.length === 0 ? (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Trenutno nema klubova
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {topClubs.map((club, index) => (
            <Pressable
              key={club.id}
              style={localStyles.clubCard}
              onPress={() => router.push(`/clubProfile?id=${club.id}`)}
            >
              <ImageBackground
                source={{
                  uri:
                    club.image ||
                    "https://via.placeholder.com/400x200?text=No+Image",
                }}
                style={localStyles.clubImage}
                imageStyle={{ borderRadius: 16 }}
              >
                <View style={localStyles.imageOverlay} />
                <View style={localStyles.rankBadge}>
                  <Text style={localStyles.rankText}>#{index + 1}</Text>
                </View>
                <View style={localStyles.clubInfo}>
                  <Text style={localStyles.clubName}>{club.name}</Text>
                  <View style={localStyles.statsRow}>
                    <View style={localStyles.statItem}>
                      <Text style={localStyles.statValue}>
                        {club.followers_count || 0}
                      </Text>
                      <Text style={localStyles.statLabel}>pratilaca</Text>
                    </View>
                    <View style={localStyles.statItem}>
                      <Text style={localStyles.statValue}>
                        {club.courts || 0}
                      </Text>
                      <Text style={localStyles.statLabel}>terena</Text>
                    </View>
                  </View>
                  {club.address && (
                    <Text style={localStyles.clubAddress} numberOfLines={1}>
                      📍 {club.address}
                    </Text>
                  )}
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </>
  );
}

const localStyles = StyleSheet.create({
  clubCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  clubImage: {
    width: "100%",
    height: 200,
    justifyContent: "flex-end",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  rankBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#B8FF00",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rankText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "800",
  },
  clubInfo: {
    padding: 16,
    zIndex: 1,
  },
  clubName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    color: "#B8FF00",
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.8,
  },
  clubAddress: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
  },
});

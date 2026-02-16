import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { fetchTopPlayers } from "../lib/profileApi";
import PlayerCard from "./PlayerCard";

interface VruceTabContentProps {
  styles: any;
}

export default function VruceTabContent({ styles }: VruceTabContentProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const {
    data: topPlayers = [],
    isLoading: loadingPlayers,
    error: playersError,
  } = useQuery({
    queryKey: ["topPlayers"],
    queryFn: () => fetchTopPlayers(10),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handlePlayerPress = (player: any) => {
    if (player.is_following) {
      router.push("/createMatch");
    } else {
      router.push(`/playerProfile?id=${player.id}`);
    }
  };

  return (
    <>
      {/* Title Section */}
      <View style={{ marginBottom: 16 }}>
        <Text style={[styles.sectionTitle, { fontSize: 28, marginBottom: 8 }]}>
          ⭐ Top igrači
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          Najbolji igrači sa najvišim rejtingom
        </Text>
      </View>

      {/* Top Players */}
      {loadingPlayers ? (
        <View style={{ paddingVertical: 60, alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.textSecondary, marginTop: 16 }}>
            Učitavamo najbolje igrače...
          </Text>
        </View>
      ) : playersError ? (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Greška pri učitavanju igrača
          </Text>
        </View>
      ) : topPlayers.length === 0 ? (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Trenutno nema igrača
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          {topPlayers.map((player, index) => (
            <PlayerCard
              key={player.id}
              userId={player.id}
              name={player.full_name || "Unknown"}
              friendsInCommon={player.followers_count || 0}
              matchPercentage={player.rating || 65}
              avatar={player.avatar_url || undefined}
              isFollowing={player.is_following}
              onPress={() => handlePlayerPress(player)}
            />
          ))}
        </ScrollView>
      )}
    </>
  );
}

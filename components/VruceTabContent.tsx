import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/profile";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import {
    HOT_EVENTS,
    SUGGESTED_CLUBS,
    TRENDING_MATCHES,
} from "../constants/data";
import HotEventCard from "./HotEventCard";
import HotPlayerCard from "./HotPlayerCard";
import TrendingClubCard from "./TrendingClubCard";
import TrendingMatchCard from "./TrendingMatchCard";

interface VruceTabContentProps {
  styles: any;
}

const loadPlayers = async (): Promise<Profile[]> => {
  // Get current user ID
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("profiles")
    .select("*")
    .eq("role", "player")
    .order("created_at", { ascending: false })
    .limit(10);

  // Exclude current user from the list
  if (user?.id) {
    query = query.neq("id", user.id);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export default function VruceTabContent({ styles }: VruceTabContentProps) {
  const router = useRouter();

  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ["hotPlayers"],
    queryFn: loadPlayers,
  });

  return (
    <>
      {/* Hot Players */}
      <View style={styles.suggestedSection}>
        <View style={styles.suggestedHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Vruće igrači
          </Text>
          <Text style={styles.seeAllLink}>Vidi sve</Text>
        </View>

        {loadingPlayers ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#00D1A7" />
          </View>
        ) : players.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <Text style={{ color: "#8B8B8B", fontSize: 14 }}>
              Trenutno nema igrača
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.playersScroll}
          >
            {players.map((player) => (
              <HotPlayerCard
                key={player.id}
                name={player.full_name || "Nepoznato"}
                level={player.rating?.toFixed(1) || "0.0"}
                percentage={player.win_rate || 0}
                avatar={player.avatar_url || "https://i.pravatar.cc/150?img=47"}
                hotReason="Aktivan igrač"
                wins={Math.floor(
                  (player.matches_played * (player.win_rate || 0)) / 100,
                )}
                onAddPress={() => {}}
                onPress={() =>
                  router.push(`/(home)/playerProfile?id=${player.id}`)
                }
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Trending Matches */}
      <View style={styles.suggestedSection}>
        <View style={styles.suggestedHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Trending mečevi
          </Text>
          <Text style={styles.seeAllLink}>Vidi sve</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.matchesScroll}
        >
          {TRENDING_MATCHES.map((match, index) => (
            <TrendingMatchCard
              key={index}
              id={match.id}
              type={match.type}
              date={match.date}
              location={match.location}
              duration={match.duration}
              level={match.level}
              participants={match.participants}
              prize={match.prize}
              onPress={() => router.push(`/(home)/matchScreen?id=${match.id}`)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Trending Clubs */}
      <View style={styles.suggestedSection}>
        <View style={styles.suggestedHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Popularni klubovi
          </Text>
          <Text style={styles.seeAllLink}>Vidi sve</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.playersScroll}
        >
          {SUGGESTED_CLUBS.map((club, index) => (
            <TrendingClubCard
              key={index}
              id={club.id}
              name={club.name}
              image={club.image}
              distance={club.distance}
              price={club.price}
              onPress={() => router.push(`/(home)/clubProfile?id=${club.id}`)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Hot Events */}
      <View style={styles.suggestedSection}>
        <View style={styles.suggestedHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Aktuelni događaji
          </Text>
          <Text style={styles.seeAllLink}>Vidi sve</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.playersScroll}
        >
          {HOT_EVENTS.map((event, index) => (
            <HotEventCard
              key={index}
              id={event.id}
              title={event.title}
              subtitle={event.subtitle}
              date={event.date}
              location={event.location}
              participants={event.participants}
              icon={event.icon}
              type={event.type as "workshop" | "tournament" | "training"}
              onPress={() => {}}
            />
          ))}
        </ScrollView>
      </View>
    </>
  );
}

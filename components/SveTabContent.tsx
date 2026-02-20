import { FontAwesome } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SUGGESTED_FRIENDS, UPCOMING_VERSUS_MATCHES } from "../constants/data";
import { useTheme } from "../contexts/ThemeContext";
import { fetchTopClubs } from "../lib/clubApi";
import { fetchOpenReservations } from "../lib/courtApi";
import { supabase } from "../lib/supabase";
import Button from "./Button";
import InstagramPlayerCard from "./InstagramPlayerCard";
import ModernClubCard from "./ModernClubCard";
import VersusMatchCard from "./VersusMatchCard";

interface SveTabContentProps {
  styles: any;
}

export default function SveTabContent({ styles }: SveTabContentProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID for creator detection
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Use static data for following players
  const suggestedPlayers = SUGGESTED_FRIENDS;
  const playersLoading = false;
  const playersError = null;

  // Fetch open reservations (matches looking for players)
  const {
    data: openReservations = [],
    isLoading: reservationsLoading,
    error: reservationsError,
  } = useQuery({
    queryKey: ["openReservations"],
    queryFn: fetchOpenReservations,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchInterval: 1000 * 3, // Auto-refresh every 3 seconds
    refetchOnFocus: true,
    refetchOnMount: true,
  });

  // Fetch top clubs from database
  const {
    data: suggestedClubs = [],
    isLoading: clubsLoading,
    error: clubsError,
  } = useQuery({
    queryKey: ["topClubs"],
    queryFn: () => fetchTopClubs(10),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Transform reservations to match card format
  const transformReservationToMatch = (reservation: any) => {
    const createdDate = new Date(reservation.created_at);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60),
    );
    const timeAgo =
      diffHours < 1
        ? "pre manje od 1 sat"
        : diffHours < 24
          ? `pre ${diffHours} ${diffHours === 1 ? "sat" : diffHours < 5 ? "sata" : "sati"}`
          : `pre ${Math.floor(diffHours / 24)} ${Math.floor(diffHours / 24) === 1 ? "dan" : "dana"}`;

    // Format date: "Sri 2. feb · 15:00h ›"
    const resDate = new Date(
      `${reservation.reservation_date}T${reservation.start_time}`,
    );
    const dayNames = ["Ned", "Pon", "Uto", "Sre", "Čet", "Pet", "Sub"];
    const monthNames = [
      "jan",
      "feb",
      "mar",
      "apr",
      "maj",
      "jun",
      "jul",
      "avg",
      "sep",
      "okt",
      "nov",
      "dec",
    ];
    const formattedDate = `${dayNames[resDate.getDay()]} ${resDate.getDate()}. ${monthNames[resDate.getMonth()]} · ${reservation.start_time.substring(0, 5)} - ${reservation.end_time.substring(0, 5)}h ›`;

    // Helper function to shorten name (e.g., "John Doe" -> "John D.")
    const shortenName = (fullName: string) => {
      if (!fullName) return "Korisnik";
      const parts = fullName.trim().split(" ");
      if (parts.length === 1) return parts[0];
      const firstName = parts[0];
      const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
      return `${firstName} ${lastInitial}.`;
    };

    // Create participants array (max 4 slots)
    const maxParticipants = 4;
    const participants = [];

    // Add creator
    if (reservation.user) {
      const shortName = shortenName(reservation.user.full_name);
      participants.push({
        name: shortName,
        level: "1.0",
        avatar: reservation.user.avatar_url || null,
      });
    }

    // Add invited players
    if (reservation.invited_players_profiles) {
      reservation.invited_players_profiles.forEach((player: any) => {
        participants.push({
          name: shortenName(player.full_name),
          level: "1.0",
          avatar: player.avatar_url || null,
        });
      });
    }

    // Fill remaining slots with empty slots
    const remainingSlots = maxParticipants - participants.length;
    for (let i = 0; i < remainingSlots; i++) {
      participants.push({ name: "", level: "+", avatar: null });
    }

    return {
      id: reservation.id,
      author: shortenName(reservation.user?.full_name) || "Korisnik",
      time: timeAgo,
      type: "OTVORENI MEČ",
      duration: `${reservation.duration_minutes} MIN`,
      level: "1.0-2.0",
      date: formattedDate,
      location: `${reservation.court?.clubs?.name || "Klub"} · ${reservation.court?.name || "Teren"}`,
      participants,
      price: `${Math.round(reservation.total_price || 0)} RSD`,
      user_id: reservation.user_id,
      club_id: reservation.court?.club_id,
      invited_players: reservation.invited_players || [],
      creator: {
        full_name: reservation.user?.full_name || "Korisnik",
        avatar_url: reservation.user?.avatar_url || null,
      },
    };
  };

  const openMatches = openReservations.map(transformReservationToMatch);

  const handlePlayerPress = (player: any) => {
    if (player.isConnected) {
      // If connected/following, go to create match screen
      router.push("/(home)/createMatchNew");
    } else {
      // If not connected, go to player profile
      router.push(`/(home)/playerProfile?id=${player.id}`);
    }
  };

  return (
    <>
      {/* Following Players - Instagram Style */}
      <View style={styles.suggestedSection}>
        <View style={styles.suggestedHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Praćenja
          </Text>
        </View>
        {playersLoading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : playersError ? (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Greška pri učitavanju praćenja
            </Text>
          </View>
        ) : suggestedPlayers.length === 0 ? (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Nema praćenja
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.playersScroll}
          >
            {suggestedPlayers.map((player, index) => (
              <InstagramPlayerCard
                key={player.id}
                userId={player.id.toString()}
                name={player.name}
                avatar={player.avatar}
                isFollowing={player.isConnected}
                onPress={() => handlePlayerPress(player)}
                style={[
                  index === suggestedPlayers.length - 1 && { marginRight: 20 },
                ]}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Suggested Clubs */}
      <View style={styles.suggestedSection}>
        <View style={styles.suggestedHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Predloženi klubovi
          </Text>
          <Pressable onPress={() => router.push("/(home)/allClubs")}>
            <Text style={styles.seeAllLink}>Vidi sve</Text>
          </Pressable>
        </View>
        {clubsLoading ? (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.playersScroll}
          >
            {suggestedClubs.map((club, index) => (
              <ModernClubCard
                key={club.id || index}
                id={club.id}
                name={club.name}
                image={club.image}
                distance={club.distance}
                price={club.price}
                onPress={() => router.push(`/(home)/clubProfile?id=${club.id}`)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Upcoming Matches */}
      <View style={styles.matchesSection}>
        <Text style={styles.sectionTitle}>Predstojeći mečevi</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.matchesScroll}
        >
          {UPCOMING_VERSUS_MATCHES.map((match, index) => (
            <VersusMatchCard
              key={index}
              id={match.id}
              type={match.type}
              time={match.time}
              date={match.date}
              club={match.club}
              matchType={match.matchType}
              teamA={match.teamA}
              teamB={match.teamB}
              onPress={() => router.push(`/(home)/matchScreen?id=${match.id}`)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Open Match */}
      <View style={styles.openMatchSection}>
        <View style={styles.matchHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            OTVORENI MEČEVI
          </Text>
          <Text style={styles.seeAllLink}>Vidi sve</Text>
        </View>

        {reservationsLoading ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <ActivityIndicator size="small" color="#3867FF" />
          </View>
        ) : openMatches.length === 0 ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: "#8B8B8B", fontSize: 14 }}>
              Trenutno nema otvorenih mečeva. Kreirajte prvi!
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.matchesScroll}
          >
            {openMatches.map((match, idx) => (
              <Pressable
                key={idx}
                style={styles.openMatchCard}
                onPress={() =>
                  router.push(`/(home)/matchScreen?id=${match.id}`)
                }
              >
                <View style={styles.matchCardHeader}>
                  <Text style={styles.matchCardAuthor}>
                    {match.author} · {match.time}
                  </Text>
                  <FontAwesome name="ellipsis-h" size={16} color="#8B8B8B" />
                </View>

                <View style={styles.openMatchType}>
                  <Text style={styles.openMatchTitle}>{match.type}</Text>
                </View>

                <View style={styles.matchMetaRow}>
                  <View style={styles.metaTag}>
                    <Text style={styles.metaTagText}>{match.duration}</Text>
                  </View>
                  <View style={styles.metaTag}>
                    <Text style={styles.metaTagText}>{match.level}</Text>
                  </View>
                </View>

                <Text style={styles.openMatchDate}>{match.date}</Text>
                <Text style={styles.openMatchLocation}>{match.location}</Text>

                <View style={styles.participantsSection}>
                  <View style={styles.participantsList}>
                    {match.participants.map((participant, index) => (
                      <View key={index} style={styles.participantItem}>
                        {participant.name === "" ? (
                          <>
                            <View
                              style={[
                                styles.participantAvatar,
                                styles.joinPlaceholder,
                              ]}
                            >
                              <FontAwesome
                                name="plus"
                                size={16}
                                color="#3867FF"
                              />
                            </View>
                            <Text style={styles.participantAction}>
                              {participant.level}
                            </Text>
                          </>
                        ) : (
                          <>
                            <View style={styles.participantAvatar}>
                              {participant.avatar ? (
                                <Image
                                  source={{ uri: participant.avatar }}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 20,
                                  }}
                                />
                              ) : (
                                <View
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 20,
                                    backgroundColor: "#3867FF",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "#FFFFFF",
                                      fontSize: 14,
                                      fontWeight: "700",
                                    }}
                                  >
                                    {participant.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.participantLevel}>
                              {participant.level}
                            </Text>
                            <Text style={styles.participantName}>
                              {participant.name}
                            </Text>
                          </>
                        )}
                      </View>
                    ))}
                  </View>
                </View>

                <Button
                  title={
                    currentUserId &&
                    (match.user_id === currentUserId ||
                      match.invited_players?.includes(currentUserId))
                      ? "Detaljnije"
                      : `Priključi se meču · ${match.price}`
                  }
                  onPress={() =>
                    router.push(`/(home)/matchScreen?id=${match.id}`)
                  }
                  variant="primary"
                />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </>
  );
}

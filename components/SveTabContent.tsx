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
import { FINISHED_MATCHES } from "../constants/data";
import { useTheme } from "../contexts/ThemeContext";
import { fetchTopClubs } from "../lib/clubApi";
import {
  fetchClosedReservations,
  fetchOpenReservations,
} from "../lib/courtApi";
import { fetchUserFollowing } from "../lib/profileApi";
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

  // Fetch users and clubs that the current user is following
  const {
    data: userFollowing = [],
    isLoading: playersLoading,
    error: playersError,
  } = useQuery({
    queryKey: ["userFollowing"],
    queryFn: () => fetchUserFollowing(),
    staleTime: 0, // Always fetch fresh data
    refetchOnFocus: true,
    refetchOnMount: true,
  });

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

  // Fetch closed reservations (upcoming matches for current user)
  const {
    data: closedReservations = [],
    isLoading: closedLoading,
    error: closedError,
  } = useQuery({
    queryKey: ["closedReservations"],
    queryFn: fetchClosedReservations,
    staleTime: 0,
    refetchInterval: 1000 * 3,
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
      gameMode: reservation.match_type || "friendly",
      duration: `${reservation.duration_minutes} MIN`,
      level: "1.0-2.0",
      date: formattedDate,
      clubName: reservation.court?.clubs?.name || "Klub",
      courtName: reservation.court?.name || "Teren",
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

  // Transform closed reservations to VersusMatchCard format
  const transformClosedReservationToVersusMatch = (reservation: any) => {
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

    const formattedDate = `${dayNames[resDate.getDay()]}, ${resDate.getDate()}. ${monthNames[resDate.getMonth()]}`;
    const formattedTime = `${reservation.start_time.substring(0, 5)}h`;
    const startTime = reservation.start_time.substring(0, 5);
    const endTime = reservation.end_time.substring(0, 5);

    // Helper function to shorten name
    const shortenName = (fullName: string) => {
      if (!fullName) return "Korisnik";
      const parts = fullName.trim().split(" ");
      if (parts.length === 1) return parts[0];
      return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    };

    // Build team arrays
    const allPlayers = [];

    // Add creator
    if (reservation.user) {
      allPlayers.push({
        name: shortenName(reservation.user.full_name),
        avatar: reservation.user.avatar_url || null,
        id: reservation.user_id,
      });
    }

    // Add invited players
    if (reservation.invited_players_profiles) {
      reservation.invited_players_profiles.forEach((player: any) => {
        allPlayers.push({
          name: shortenName(player.full_name),
          avatar: player.avatar_url || null,
          id: player.id,
        });
      });
    }

    // Split into two teams (for now, split evenly)
    const midPoint = Math.ceil(allPlayers.length / 2);
    const teamA = allPlayers.slice(0, midPoint);
    const teamB = allPlayers.slice(midPoint);

    return {
      id: reservation.id,
      type: "ZATVOREN MEČ",
      time: formattedTime,
      date: formattedDate,
      club: reservation.court?.clubs?.name || "Klub",
      matchType: reservation.match_type || "friendly",
      gameMode: reservation.match_type || "friendly",
      startTime,
      endTime,
      teamA,
      teamB,
    };
  };

  const upcomingMatches = closedReservations.map(
    transformClosedReservationToVersusMatch,
  );

  const handlePlayerPress = (item: any) => {
    if (item.type === "club") {
      // Navigate to club profile
      router.push(`/(home)/clubProfile?id=${item.id}`);
    } else {
      // Navigate to player profile
      router.push(`/(home)/playerProfile?id=${item.id}`);
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
        ) : userFollowing.length === 0 ? (
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
            {userFollowing.map((item, index) => (
              <InstagramPlayerCard
                key={item.id}
                userId={item.id.toString()}
                name={item.name}
                avatar={item.avatar}
                isFollowing={item.isConnected}
                onPress={() => handlePlayerPress(item)}
                style={[
                  index === userFollowing.length - 1 && { marginRight: 20 },
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

      {/* Open Match */}
      <View style={styles.openMatchSection}>
        <View style={styles.matchHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Otvoreni mečevi
          </Text>
          <Pressable onPress={() => router.push("/(home)/openMatches")}>
            <Text style={styles.seeAllLink}>Vidi sve</Text>
          </Pressable>
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
                {/* Header - Author & Time */}
                <View style={styles.matchCardHeader}>
                  <View style={styles.authorContainer}>
                    {match.creator.avatar_url ? (
                      <Image
                        source={{ uri: match.creator.avatar_url }}
                        style={styles.authorAvatar}
                      />
                    ) : (
                      <View style={styles.authorAvatarPlaceholder}>
                        <Text style={styles.authorAvatarText}>
                          {match.author
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </Text>
                      </View>
                    )}
                    <View style={styles.authorInfo}>
                      <Text style={styles.matchCardAuthor}>{match.author}</Text>
                      <Text style={styles.authorAction}>kreirao meč</Text>
                    </View>
                  </View>
                  <Text style={styles.matchCardTime}>{match.time}</Text>
                </View>

                {/* Title & Badges */}
                <View style={styles.openMatchType}>
                  <Text style={styles.openMatchTitle}>{match.type}</Text>
                </View>

                <View style={styles.badgesRow}>
                  {/* Game Mode Badge */}
                  <View
                    style={[
                      styles.gameModeBadge,
                      match.gameMode === "competitive" &&
                        styles.gameModeBadgeCompetitive,
                      match.gameMode === "friendly" &&
                        styles.gameModeBadgeFriendly,
                      match.gameMode === "training" &&
                        styles.gameModeBadgeTraining,
                    ]}
                  >
                    <FontAwesome
                      name={
                        match.gameMode === "competitive"
                          ? "trophy"
                          : match.gameMode === "training"
                            ? "line-chart"
                            : "smile-o"
                      }
                      size={10}
                      color={
                        match.gameMode === "competitive"
                          ? "#F59E0B"
                          : match.gameMode === "training"
                            ? "#3B82F6"
                            : "#10B981"
                      }
                    />
                    <Text
                      style={[
                        styles.gameModeBadgeText,
                        match.gameMode === "competitive" &&
                          styles.gameModeBadgeTextCompetitive,
                        match.gameMode === "friendly" &&
                          styles.gameModeBadgeTextFriendly,
                        match.gameMode === "training" &&
                          styles.gameModeBadgeTextTraining,
                      ]}
                    >
                      {match.gameMode === "competitive"
                        ? "Kompetativan"
                        : match.gameMode === "training"
                          ? "Trening"
                          : "Prijateljski"}
                    </Text>
                  </View>

                  {/* Duration & Level */}
                  <View style={styles.metaTag}>
                    <Text style={styles.metaTagText}>{match.duration}</Text>
                  </View>
                  <View style={styles.metaTag}>
                    <Text style={styles.metaTagText}>{match.level}</Text>
                  </View>
                </View>

                {/* Date & Location */}
                <View style={styles.dateLocationSection}>
                  <FontAwesome
                    name="calendar"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.openMatchDate}>{match.date}</Text>
                </View>

                <View style={styles.dateLocationSection}>
                  <FontAwesome
                    name="map-marker"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.openMatchClub}>{match.clubName}</Text>
                    <Text style={styles.openMatchCourt}>{match.courtName}</Text>
                  </View>
                </View>

                {/* Participants */}
                <View style={styles.participantsSection}>
                  <Text style={styles.participantsLabel}>
                    Igrači (
                    {match.participants.filter((p: any) => p.name).length}/4)
                  </Text>
                  <View style={styles.participantsList}>
                    {match.participants.map(
                      (participant: any, index: number) => (
                        <View key={index} style={styles.participantItem}>
                          {participant.name === "" ? (
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
                          ) : (
                            <>
                              {participant.avatar ? (
                                <Image
                                  source={{ uri: participant.avatar }}
                                  style={styles.participantAvatar}
                                />
                              ) : (
                                <View
                                  style={[
                                    styles.participantAvatar,
                                    styles.participantAvatarPlaceholder,
                                  ]}
                                >
                                  <Text style={styles.participantAvatarText}>
                                    {participant.name
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")}
                                  </Text>
                                </View>
                              )}
                              <View style={styles.participantLevelBadge}>
                                <Text style={styles.participantLevelText}>
                                  {participant.level}
                                </Text>
                              </View>
                              <Text style={styles.participantName}>
                                {participant.name}
                              </Text>
                            </>
                          )}
                        </View>
                      ),
                    )}
                  </View>
                </View>

                {/* Action Button */}
                <Button
                  title={
                    currentUserId &&
                    (match.user_id === currentUserId ||
                      match.invited_players?.includes(currentUserId))
                      ? "Detaljnije"
                      : `Priključi se · ${match.price}`
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

      {/* Closed Matches */}
      <View style={styles.matchesSection}>
        <Text style={styles.sectionTitle}>Zatvoreni mečevi</Text>

        {closedLoading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : closedError ? (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Greška pri učitavanju mečeva
            </Text>
          </View>
        ) : upcomingMatches.length === 0 ? (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Nemate zatvorenih mečeva
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.matchesScroll}
          >
            {upcomingMatches.map((match, index) => (
              <VersusMatchCard
                key={match.id || index}
                id={match.id}
                type={match.type}
                time={match.time}
                date={match.date}
                club={match.club}
                matchType={match.matchType}
                gameMode={match.gameMode}
                startTime={match.startTime}
                endTime={match.endTime}
                teamA={match.teamA}
                teamB={match.teamB}
                onPress={() =>
                  router.push(`/(home)/matchScreen?id=${match.id}`)
                }
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Finished Matches */}
      <View style={styles.matchesSection}>
        <Text style={styles.sectionTitle}>Završeni mečevi</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.matchesScroll}
        >
          {FINISHED_MATCHES.map((match, index) => {
            // Transform score object to string for VersusMatchCard
            const scoreString = match.score.sets.join(", ");
            const formattedTime = match.time.replace("h", "").trim();

            return (
              <VersusMatchCard
                key={match.id || index}
                id={match.id}
                type={match.type}
                time={formattedTime}
                date={match.date}
                club={match.club}
                matchType={match.matchType}
                gameMode={match.gameMode}
                teamA={match.teamA}
                teamB={match.teamB}
                score={scoreString}
                duration={match.duration}
                isFinished={true}
                onPress={() =>
                  router.push(`/(home)/matchScreen?id=${match.id}`)
                }
              />
            );
          })}
        </ScrollView>
      </View>
    </>
  );
}

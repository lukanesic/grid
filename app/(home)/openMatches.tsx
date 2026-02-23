import { FontAwesome } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components";
import { useTheme } from "../../contexts/ThemeContext";
import { fetchOpenReservations } from "../../lib/courtApi";
import { supabase } from "../../lib/supabase";

export default function OpenMatchesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Fetch open reservations
  const {
    data: openReservations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["openReservations"],
    queryFn: fetchOpenReservations,
    staleTime: 0,
    refetchInterval: 1000 * 3,
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

    const shortenName = (fullName: string) => {
      if (!fullName) return "Korisnik";
      const parts = fullName.trim().split(" ");
      if (parts.length === 1) return parts[0];
      const firstName = parts[0];
      const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
      return `${firstName} ${lastInitial}.`;
    };

    const maxParticipants = 4;
    const participants = [];

    if (reservation.user) {
      const shortName = shortenName(reservation.user.full_name);
      participants.push({
        name: shortName,
        level: "1.0",
        avatar: reservation.user.avatar_url || null,
      });
    }

    if (reservation.invited_players_profiles) {
      reservation.invited_players_profiles.forEach((player: any) => {
        participants.push({
          name: shortenName(player.full_name),
          level: "1.0",
          avatar: player.avatar_url || null,
        });
      });
    }

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
      priceNumber: Math.round(reservation.total_price || 0),
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Otvoreni mečevi</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Učitavanje...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <FontAwesome
              name="exclamation-circle"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>Greška</Text>
            <Text style={styles.emptyText}>Greška pri učitavanju mečeva</Text>
          </View>
        ) : openMatches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome
              name="calendar-o"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>Nema otvorenih mečeva</Text>
            <Text style={styles.emptyText}>
              Trenutno nema otvorenih mečeva. Kreirajte prvi!
            </Text>
          </View>
        ) : (
          <View style={styles.matchesList}>
            {openMatches.map((match, idx) => (
              <Pressable
                key={idx}
                style={[
                  styles.matchCard,
                  idx === openMatches.length - 1 && styles.matchCardLast,
                ]}
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
                <View style={styles.matchType}>
                  <Text style={styles.matchTitle}>{match.type}</Text>
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
                  <Text style={styles.matchDate}>{match.date}</Text>
                </View>

                <View style={styles.locationContainer}>
                  <FontAwesome name="map-marker" size={16} color="#3867FF" />
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.matchClub}>{match.clubName}</Text>
                    <Text style={styles.matchCourt}>{match.courtName}</Text>
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
                      : (() => {
                          // Calculate price per player
                          const currentParticipants = match.participants.filter(
                            (p: any) => p.name,
                          ).length;
                          const totalPlayers = currentParticipants + 1;
                          const pricePerPlayer = Math.round(
                            match.priceNumber / totalPlayers,
                          );
                          return `Priključi se · ${pricePerPlayer} RSD`;
                        })()
                  }
                  onPress={() =>
                    router.push(`/(home)/matchScreen?id=${match.id}`)
                  }
                  variant="primary"
                />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingRight: 20,
    },
    backButton: {
      width: 50,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      paddingLeft: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    scrollView: {
      flex: 1,
    },
    loadingContainer: {
      padding: 60,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
    },
    emptyContainer: {
      padding: 60,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginTop: 16,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: "center",
    },
    matchesList: {
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    matchCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    matchCardLast: {
      marginBottom: 0,
    },
    matchCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18,
    },
    authorContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    authorAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    authorAvatarPlaceholder: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accent + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    authorAvatarText: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.accent,
    },
    authorInfo: {
      gap: 4,
    },
    matchCardAuthor: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    authorAction: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    matchCardTime: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    matchType: {
      marginBottom: 14,
    },
    matchTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
    },
    badgesRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
      flexWrap: "wrap",
    },
    gameModeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: colors.border,
    },
    gameModeBadgeCompetitive: {
      backgroundColor: "#F59E0B" + "20",
    },
    gameModeBadgeFriendly: {
      backgroundColor: "#10B981" + "20",
    },
    gameModeBadgeTraining: {
      backgroundColor: "#3B82F6" + "20",
    },
    gameModeBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
    },
    gameModeBadgeTextCompetitive: {
      color: "#F59E0B",
    },
    gameModeBadgeTextFriendly: {
      color: "#10B981",
    },
    gameModeBadgeTextTraining: {
      color: "#3B82F6",
    },
    metaTag: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: colors.border,
    },
    metaTagText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
    },
    dateLocationSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    matchDate: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
      padding: 12,
      backgroundColor: isDark
        ? "rgba(56, 103, 255, 0.08)"
        : "rgba(56, 103, 255, 0.05)",
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: "#3867FF",
    },
    locationTextContainer: {
      flex: 1,
    },
    matchClub: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    matchCourt: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textSecondary,
      marginTop: 4,
    },
    participantsSection: {
      marginTop: 16,
      marginBottom: 20,
    },
    participantsLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textSecondary,
      marginBottom: 14,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    participantsList: {
      flexDirection: "row",
      gap: 14,
    },
    participantItem: {
      alignItems: "center",
      width: 70,
    },
    participantAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.border,
    },
    participantAvatarPlaceholder: {
      backgroundColor: colors.accent + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    participantAvatarText: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.accent,
    },
    joinPlaceholder: {
      borderWidth: 2,
      borderColor: colors.accent,
      borderStyle: "dashed",
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
    },
    participantLevelBadge: {
      position: "absolute",
      bottom: 18,
      right: 6,
      backgroundColor: "#3867FF",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.card,
    },
    participantLevelText: {
      fontSize: 9,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    participantName: {
      fontSize: 11,
      fontWeight: "500",
      color: colors.text,
      marginTop: 8,
      textAlign: "center",
      width: "100%",
    },
  });

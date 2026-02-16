import { FontAwesome } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components";
import {
    CourtVisualization,
    MatchStats,
    ProfessionalScore,
    QuickActions,
    TeamInformation,
} from "../../components/liveMatch";
import { OPEN_MATCHES, UPCOMING_MATCHES } from "../../constants/data";
import { fetchReservationById } from "../../lib/courtApi";

export default function LiveMatchScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [matchTime, setMatchTime] = useState(0); // in minutes

  // Check if ID is UUID (database reservation) or sample data
  const isUUID =
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Fetch reservation from database if UUID
  const { data: reservation, isLoading } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => fetchReservationById(id as string),
    enabled: isUUID,
  });

  // Professional padel scoring state
  const [setsWon, setSetsWon] = useState({ team1: 0, team2: 0 });
  const [currentSet, setCurrentSet] = useState(1);
  const [gamesInSet, setGamesInSet] = useState({ team1: 0, team2: 0 });
  const [isTiebreak, setIsTiebreak] = useState(false);
  const [tiebreakPoints, setTiebreakPoints] = useState({ team1: 0, team2: 0 });
  const [matchWinner, setMatchWinner] = useState<"team1" | "team2" | null>(
    null,
  );
  const [totalSets] = useState(3); // Best of 3 sets

  // Get match data - either from database reservation or sample data
  let match = null;

  if (isUUID && reservation) {
    // Transform database reservation to match format
    const participants: any[] = [];

    // Add creator
    if (reservation.user?.full_name) {
      participants.push({
        name: reservation.user.full_name,
        level: "1.0",
        avatar: reservation.user.avatar_url || null,
      });
    }

    // Add invited players
    if (reservation.invited_players_profiles) {
      reservation.invited_players_profiles.forEach((player: any) => {
        participants.push({
          name: player.full_name,
          level: "1.0",
          avatar: player.avatar_url || null,
        });
      });
    }

    // Fill empty slots
    while (participants.length < 4) {
      participants.push({ name: "", level: "+", avatar: null });
    }

    match = {
      id: reservation.id,
      type: "OTVORENI MEČ",
      date: `${reservation.reservation_date} • ${reservation.start_time.substring(0, 5)}`,
      location: `${reservation.court?.clubs?.name || "Klub"}`,
      participants: participants,
      author: reservation.user?.full_name || "Korisnik",
    };
  } else if (!isUUID) {
    // Use sample data for non-UUID IDs
    const allMatches = [...UPCOMING_MATCHES, ...OPEN_MATCHES];
    match = allMatches.find((m) => m.id === id);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setMatchTime((prev) => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Show loading for database reservations
  if (isUUID && isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
          </Pressable>
          <Text style={styles.headerTitle}>Učitavanje...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
          </Pressable>
          <Text style={styles.headerTitle}>Meč nije pronađen</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOpenMatch = "author" in match;
  const openMatch = isOpenMatch ? (match as any) : null;

  // Get players for court positioning
  const players = openMatch
    ? openMatch.participants
        .filter((p: any) => p.name !== "")
        .concat([
          { name: "Nikola Petrović", level: "1.2" }, // Add current user
        ])
        .slice(0, 4)
    : [
        { name: "Ana Marković", level: "1.1" },
        { name: "Marko Jović", level: "1.0" },
        { name: "Nikola Petrović", level: "1.2" },
        { name: "Sara Petrić", level: "1.1" },
      ];

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}min` : `${mins}min`;
  };

  const addGame = (team: "team1" | "team2") => {
    if (matchWinner) return; // Match already finished

    if (isTiebreak) {
      // Tiebreak logic
      const newTiebreakPoints = {
        ...tiebreakPoints,
        [team]: tiebreakPoints[team] + 1,
      };
      setTiebreakPoints(newTiebreakPoints);

      const otherTeam = team === "team1" ? "team2" : "team1";
      const teamPoints = newTiebreakPoints[team];
      const otherTeamPoints = newTiebreakPoints[otherTeam];

      // Tiebreak winner: first to 7 with at least 2 point lead
      if (teamPoints >= 7 && teamPoints - otherTeamPoints >= 2) {
        winSet(team);
      }
    } else {
      // Regular game logic
      const newGames = {
        ...gamesInSet,
        [team]: gamesInSet[team] + 1,
      };
      setGamesInSet(newGames);

      const otherTeam = team === "team1" ? "team2" : "team1";
      const teamGames = newGames[team];
      const otherTeamGames = newGames[otherTeam];

      // Check for set winner
      if (teamGames >= 6) {
        if (teamGames - otherTeamGames >= 2) {
          // Won by 2+ games
          winSet(team);
        } else if (teamGames === 6 && otherTeamGames === 6) {
          // 6-6, go to tiebreak
          setIsTiebreak(true);
          setTiebreakPoints({ team1: 0, team2: 0 });
        }
      }
    }
  };

  const winSet = (team: "team1" | "team2") => {
    const newSetsWon = {
      ...setsWon,
      [team]: setsWon[team] + 1,
    };
    setSetsWon(newSetsWon);

    // Check for match winner (best of 3: first to 2 sets)
    if (newSetsWon[team] >= Math.ceil(totalSets / 2)) {
      setMatchWinner(team);
      Alert.alert(
        "Pobeda!",
        `${team === "team1" ? "Tim 1" : "Tim 2"} je pobedio meč!`,
        [{ text: "OK" }],
      );
    } else {
      // Start new set
      setCurrentSet(currentSet + 1);
      setGamesInSet({ team1: 0, team2: 0 });
      setIsTiebreak(false);
      setTiebreakPoints({ team1: 0, team2: 0 });
    }
  };

  const resetMatch = () => {
    Alert.alert(
      "Resetuj meč",
      "Da li si siguran da želiš da resetuješ ceo meč?",
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Resetuj",
          style: "destructive",
          onPress: () => {
            setSetsWon({ team1: 0, team2: 0 });
            setCurrentSet(1);
            setGamesInSet({ team1: 0, team2: 0 });
            setIsTiebreak(false);
            setTiebreakPoints({ team1: 0, team2: 0 });
            setMatchWinner(null);
          },
        },
      ],
    );
  };

  const getCurrentScore = () => {
    if (isTiebreak) {
      return { team1: tiebreakPoints.team1, team2: tiebreakPoints.team2 };
    }
    return { team1: gamesInSet.team1, team2: gamesInSet.team2 };
  };

  const handleEndMatch = () => {
    Alert.alert(
      "Završi meč",
      "Da li si siguran da želiš da završiš ovaj meč?",
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Završi meč",
          style: "destructive",
          onPress: () => router.back(),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Meč u toku</Text>
          <Text style={styles.headerTime}>{formatTime(matchTime)}</Text>
        </View>
        <Pressable onPress={() => {}}>
          <FontAwesome name="ellipsis-h" size={20} color="#F2F2F2" />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Professional Score Display */}
        <ProfessionalScore
          setsWon={setsWon}
          currentSet={currentSet}
          isTiebreak={isTiebreak}
          matchWinner={matchWinner}
          totalSets={totalSets}
          getCurrentScore={getCurrentScore}
          addGame={addGame}
          resetMatch={resetMatch}
        />

        {/* Court Section */}
        <CourtVisualization players={players} />

        {/* Match Stats */}
        <MatchStats
          matchTime={matchTime}
          currentSet={currentSet}
          location={match.location}
          level={match.level}
        />

        {/* Team Information */}
        <TeamInformation players={players} />

        {/* Quick Actions */}
        <QuickActions />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <Button
          title="Završi meč"
          onPress={handleEndMatch}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    color: "#F2F2F2",
    fontSize: 17,
    fontWeight: "600",
  },
  headerTime: {
    color: "#4A90E2",
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Bottom Action
  bottomAction: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0B0B0B",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#1E1F23",
  },
});

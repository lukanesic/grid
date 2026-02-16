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
import { fetchReservationById } from "../../lib/courtApi";

export default function LiveMatchScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [matchTime, setMatchTime] = useState(0); // in minutes

  // Check if ID is UUID (database reservation)
  const isUUID =
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Fetch reservation from database
  const {
    data: reservation,
    isLoading,
    error,
  } = useQuery({
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

  useEffect(() => {
    const timer = setInterval(() => {
      setMatchTime((prev) => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Only support actual reservations (UUID IDs)
  if (!isUUID) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
          </Pressable>
          <Text style={styles.headerTitle}>Nevažeći meč</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Ova funkcija je dostupna samo za rezervisane mečeve
          </Text>
          <Button
            title="Nazad"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state
  if (isLoading) {
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

  // Show error if reservation not found
  if (error || !reservation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
          </Pressable>
          <Text style={styles.headerTitle}>Meč nije pronađen</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Rezervacija ne postoji ili je obrisana
          </Text>
          <Button
            title="Nazad"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Build players list from real reservation data
  const players: any[] = [];

  // Add creator
  if (reservation.user?.full_name) {
    players.push({
      name: reservation.user.full_name,
      level: "1.0",
      avatar: reservation.user.avatar_url || null,
    });
  }

  // Add invited players
  if (reservation.invited_players_profiles) {
    reservation.invited_players_profiles.forEach((player: any) => {
      players.push({
        name: player.full_name,
        level: "1.0",
        avatar: player.avatar_url || null,
      });
    });
  }

  // Ensure exactly 4 players for court positioning
  while (players.length < 4) {
    players.push({
      name: `Igrač ${players.length + 1}`,
      level: "1.0",
      avatar: null,
    });
  }

  const courtName = reservation.court?.name || "Teren";
  const clubName = reservation.court?.clubs?.name || "Klub";
  const matchDate = `${reservation.reservation_date} • ${reservation.start_time.substring(0, 5)}`;

  // Additional game functions
  const addPointToTeam = (team: "team1" | "team2") => {
    if (matchWinner || !isTiebreak) return;

    setTiebreakPoints((prev) => ({
      ...prev,
      [team]: prev[team] + 1,
    }));
  };

  const addGameToTeam = (team: "team1" | "team2") => {
    if (matchWinner) return;

    const newGames = { ...gamesInSet };
    newGames[team] += 1;

    // Check if set is won (6 games with 2-game lead, or 7 games)
    const opponent = team === "team1" ? "team2" : "team1";
    const teamGames = newGames[team];
    const opponentGames = newGames[opponent];

    if (teamGames >= 6 && teamGames - opponentGames >= 2) {
      // Team wins the set
      const newSetsWon = { ...setsWon };
      newSetsWon[team] += 1;
      setSetsWon(newSetsWon);

      // Check if match is won (best of 3 sets)
      if (newSetsWon[team] >= Math.ceil(totalSets / 2)) {
        setMatchWinner(team);
        Alert.alert(
          "Meč završen!",
          `Tim ${team === "team1" ? "1" : "2"} je pobedio!`,
          [{ text: "OK", onPress: () => router.back() }],
        );
      } else {
        // Start new set
        setCurrentSet((prev) => prev + 1);
        setGamesInSet({ team1: 0, team2: 0 });
      }
    } else if (teamGames === 6 && opponentGames === 6) {
      // Start tiebreak
      setIsTiebreak(true);
      setTiebreakPoints({ team1: 0, team2: 0 });
    } else {
      setGamesInSet(newGames);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
          </Pressable>
          <Text style={styles.headerTitle}>Uživo</Text>
          <View style={styles.timerContainer}>
            <FontAwesome name="clock-o" size={16} color="#F2F2F2" />
            <Text style={styles.timerText}>{matchTime}m</Text>
          </View>
        </View>

        {/* Match Info */}
        <View style={styles.matchInfo}>
          <Text style={styles.matchLocation}>{clubName}</Text>
          <Text style={styles.matchDate}>{matchDate}</Text>
          <Text style={styles.courtName}>{courtName}</Text>
        </View>

        {/* Professional Score Display */}
        <ProfessionalScore
          setsWon={setsWon}
          currentSet={currentSet}
          gamesInSet={gamesInSet}
          isTiebreak={isTiebreak}
          tiebreakPoints={tiebreakPoints}
          matchWinner={matchWinner}
          totalSets={totalSets}
        />

        {/* Court Visualization */}
        <CourtVisualization players={players} />

        {/* Team Information */}
        <TeamInformation
          team1Players={[players[0], players[1]]}
          team2Players={[players[2], players[3]]}
        />

        {/* Match Statistics */}
        <MatchStats />

        {/* Quick Actions */}
        <QuickActions
          onAddGameTeam1={() => addGameToTeam("team1")}
          onAddGameTeam2={() => addGameToTeam("team2")}
          onAddPointTeam1={() => addPointToTeam("team1")}
          onAddPointTeam2={() => addPointToTeam("team2")}
          isTiebreak={isTiebreak}
          matchWinner={matchWinner}
        />

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Button
            title="Pauziraj meč"
            onPress={() => {
              Alert.alert("Pauza", "Meč je pauziran");
            }}
            variant="secondary"
          />
          <Button
            title="Završi meč"
            onPress={() => {
              Alert.alert(
                "Završi meč",
                "Da li ste sigurni da želite da završite meč?",
                [
                  { text: "Otkaži", style: "cancel" },
                  {
                    text: "Završi",
                    style: "destructive",
                    onPress: () => router.back(),
                  },
                ],
              );
            }}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#2A2A2A",
  },
  headerTitle: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "600",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F7DFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    color: "#F2F2F2",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  matchInfo: {
    padding: 20,
    alignItems: "center",
  },
  matchLocation: {
    color: "#F2F2F2",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  matchDate: {
    color: "#B8B8B8",
    fontSize: 14,
    marginBottom: 2,
  },
  courtName: {
    color: "#B8B8B8",
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#F2F2F2",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  bottomActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
});

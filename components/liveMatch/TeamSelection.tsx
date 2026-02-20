import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Button from "../Button";

interface Player {
  name: string;
  level: string;
  avatar?: string | null;
  id: string;
}

interface TeamSelectionProps {
  players: Player[];
  onTeamsConfirmed: (team1: Player[], team2: Player[]) => void;
  onBack: () => void;
}

export default function TeamSelection({
  players,
  onTeamsConfirmed,
  onBack,
}: TeamSelectionProps) {
  const [team1Players, setTeam1Players] = useState<Player[]>([]);
  const [team2Players, setTeam2Players] = useState<Player[]>([]);
  const [unassignedPlayers, setUnassignedPlayers] = useState<Player[]>(players);

  // Handle 1v1 case
  if (players.length === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>1 protiv 1</Text>
          <Text style={styles.subtitle}>Pojedinačni meč</Text>
        </View>

        <View style={styles.oneVsOneContainer}>
          <View style={styles.playerVsCard}>
            <Image
              source={{
                uri:
                  players[0].avatar ||
                  `https://i.pravatar.cc/100?name=${players[0].name}`,
              }}
              style={styles.playerVsAvatar}
            />
            <Text style={styles.playerVsName}>{players[0].name}</Text>
            <Text style={styles.playerVsLevel}>{players[0].level}</Text>
          </View>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View style={styles.playerVsCard}>
            <Image
              source={{
                uri:
                  players[1].avatar ||
                  `https://i.pravatar.cc/100?name=${players[1].name}`,
              }}
              style={styles.playerVsAvatar}
            />
            <Text style={styles.playerVsName}>{players[1].name}</Text>
            <Text style={styles.playerVsLevel}>{players[1].level}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Nazad" onPress={onBack} variant="secondary" />
          <Button
            title="Počni meč"
            onPress={() => onTeamsConfirmed([players[0]], [players[1]])}
            variant="primary"
          />
        </View>
      </View>
    );
  }

  // Team selection for 3-4 players
  const movePlayerToTeam1 = (player: Player) => {
    if (team1Players.length >= 2) return; // Max 2 players per team

    setUnassignedPlayers((prev) => prev.filter((p) => p.id !== player.id));
    setTeam2Players((prev) => prev.filter((p) => p.id !== player.id));
    setTeam1Players((prev) => [...prev, player]);
  };

  const movePlayerToTeam2 = (player: Player) => {
    if (team2Players.length >= 2) return; // Max 2 players per team

    setUnassignedPlayers((prev) => prev.filter((p) => p.id !== player.id));
    setTeam1Players((prev) => prev.filter((p) => p.id !== player.id));
    setTeam2Players((prev) => [...prev, player]);
  };

  const movePlayerToUnassigned = (player: Player) => {
    setTeam1Players((prev) => prev.filter((p) => p.id !== player.id));
    setTeam2Players((prev) => prev.filter((p) => p.id !== player.id));
    setUnassignedPlayers((prev) => [...prev, player]);
  };

  const isReadyToStart = team1Players.length > 0 && team2Players.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Izbor timova</Text>
        <Text style={styles.subtitle}>Povucite igrače u timove</Text>
      </View>

      {/* Unassigned Players */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Igrači - Dodirnite za dodavanje u tim
        </Text>
        <View style={styles.playersContainer}>
          {unassignedPlayers.map((player) => (
            <View key={player.id} style={styles.playerCard}>
              <Image
                source={{
                  uri:
                    player.avatar ||
                    `https://i.pravatar.cc/50?name=${player.name}`,
                }}
                style={styles.playerAvatar}
              />
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerLevel}>{player.level}</Text>
              <View style={styles.playerActions}>
                <Pressable
                  style={[
                    styles.teamButton,
                    styles.team1Button,
                    team1Players.length >= 2 && styles.disabledButton,
                  ]}
                  onPress={() => movePlayerToTeam1(player)}
                  disabled={team1Players.length >= 2}
                >
                  <Text style={styles.teamButtonText}>Tim 1</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.teamButton,
                    styles.team2Button,
                    team2Players.length >= 2 && styles.disabledButton,
                  ]}
                  onPress={() => movePlayerToTeam2(player)}
                  disabled={team2Players.length >= 2}
                >
                  <Text style={styles.teamButtonText}>Tim 2</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Teams */}
      <View style={styles.teamsContainer}>
        {/* Team 1 */}
        <TeamDropZone
          title="TIM 1"
          players={team1Players}
          onPlayerRemove={movePlayerToUnassigned}
          teamColor="#4F7DFF"
          isDropTarget
        />

        {/* Team 2 */}
        <TeamDropZone
          title="TIM 2"
          players={team2Players}
          onPlayerRemove={movePlayerToUnassigned}
          teamColor="#FF6B6B"
          isDropTarget
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Nazad" onPress={onBack} variant="secondary" />
        <Button
          title="Počni meč"
          onPress={() => onTeamsConfirmed(team1Players, team2Players)}
          variant="primary"
          disabled={!isReadyToStart}
        />
      </View>
    </View>
  );
}

interface TeamDropZoneProps {
  title: string;
  players: Player[];
  onPlayerRemove: (player: Player) => void;
  teamColor: string;
  isDropTarget?: boolean;
}

const TeamDropZone = ({
  title,
  players,
  onPlayerRemove,
  teamColor,
  isDropTarget,
}: TeamDropZoneProps) => (
  <View style={[styles.teamZone, { borderColor: teamColor }]}>
    <Text style={[styles.teamTitle, { color: teamColor }]}>{title}</Text>
    <View style={styles.teamPlayers}>
      {players.map((player) => (
        <View key={player.id} style={styles.teamPlayer}>
          <Image
            source={{
              uri:
                player.avatar || `https://i.pravatar.cc/40?name=${player.name}`,
            }}
            style={styles.teamPlayerAvatar}
          />
          <Text style={styles.teamPlayerName}>{player.name}</Text>
          <FontAwesome
            name="times"
            size={16}
            color="#FF6B6B"
            onPress={() => onPlayerRemove(player)}
            style={styles.removeButton}
          />
        </View>
      ))}
      {players.length === 0 && (
        <Text style={styles.emptyTeamText}>Nema igrača</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: "#F2F2F2",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#B8B8B8",
    fontSize: 16,
  },
  oneVsOneContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginVertical: 40,
  },
  playerVsCard: {
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    padding: 20,
    minWidth: 120,
  },
  playerVsAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  playerVsName: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  playerVsLevel: {
    color: "#B8B8B8",
    fontSize: 14,
  },
  vsContainer: {
    backgroundColor: "#4F7DFF",
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  vsText: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "700",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  playersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  playerName: {
    color: "#F2F2F2",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 2,
  },
  playerLevel: {
    color: "#B8B8B8",
    fontSize: 10,
  },
  teamsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    flex: 1,
  },
  teamZone: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    minHeight: 200,
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  teamPlayers: {
    gap: 8,
  },
  teamPlayer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 8,
  },
  teamPlayerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  teamPlayerName: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  emptyTeamText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 20,
  },
  playerCard: {
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    minWidth: 140,
    marginBottom: 12,
  },
  playerActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  teamButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
  },
  team1Button: {
    backgroundColor: "#4F7DFF",
  },
  team2Button: {
    backgroundColor: "#FF6B6B",
  },
  teamButtonText: {
    color: "#F2F2F2",
    fontSize: 12,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#666",
    opacity: 0.5,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
});

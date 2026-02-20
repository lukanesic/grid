import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface Player {
  name: string;
  level: string;
  avatar?: string | null;
}

interface TeamInformationProps {
  players: Player[];
}

export default function TeamInformation({ players }: TeamInformationProps) {
  return (
    <View style={styles.teamSection}>
      <Text style={styles.teamTitle}>TIMOVI</Text>

      <View style={styles.teamsContainer}>
        <View style={styles.team}>
          <Text style={styles.teamLabel}>TIM 1</Text>
          <View style={styles.teamPlayers}>
            <View style={styles.teamPlayer}>
              <Image
                source={{
                  uri:
                    players[0]?.avatar ||
                    `https://i.pravatar.cc/40?name=${players[0]?.name}`,
                }}
                style={styles.teamPlayerAvatar}
              />
              <View style={styles.teamPlayerInfo}>
                <Text style={styles.teamPlayerName}>{players[0]?.name}</Text>
                <Text style={styles.teamPlayerLevel}>{players[0]?.level}</Text>
              </View>
            </View>
            <View style={styles.teamPlayer}>
              <Image
                source={{
                  uri:
                    players[1]?.avatar ||
                    `https://i.pravatar.cc/40?name=${players[1]?.name}`,
                }}
                style={styles.teamPlayerAvatar}
              />
              <View style={styles.teamPlayerInfo}>
                <Text style={styles.teamPlayerName}>{players[1]?.name}</Text>
                <Text style={styles.teamPlayerLevel}>{players[1]?.level}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.team}>
          <Text style={styles.teamLabel}>TIM 2</Text>
          <View style={styles.teamPlayers}>
            <View style={styles.teamPlayer}>
              <Image
                source={{
                  uri:
                    players[2]?.avatar ||
                    `https://i.pravatar.cc/40?name=${players[2]?.name}`,
                }}
                style={styles.teamPlayerAvatar}
              />
              <View style={styles.teamPlayerInfo}>
                <Text style={styles.teamPlayerName}>{players[2]?.name}</Text>
                <Text style={styles.teamPlayerLevel}>{players[2]?.level}</Text>
              </View>
            </View>
            <View style={styles.teamPlayer}>
              <Image
                source={{
                  uri:
                    players[3]?.avatar ||
                    `https://i.pravatar.cc/40?name=${players[3]?.name}`,
                }}
                style={styles.teamPlayerAvatar}
              />
              <View style={styles.teamPlayerInfo}>
                <Text style={styles.teamPlayerName}>{players[3]?.name}</Text>
                <Text style={styles.teamPlayerLevel}>{players[3]?.level}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  teamSection: {
    marginBottom: 32,
  },
  teamTitle: {
    color: "#8B8B8B",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 16,
  },
  teamsContainer: {
    gap: 16,
  },
  team: {
    backgroundColor: "#121418",
    borderRadius: 16,
    padding: 16,
  },
  teamLabel: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  teamPlayers: {
    gap: 12,
  },
  teamPlayer: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamPlayerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  teamPlayerInfo: {
    flex: 1,
  },
  teamPlayerName: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  teamPlayerLevel: {
    color: "#8B8B8B",
    fontSize: 12,
  },
});

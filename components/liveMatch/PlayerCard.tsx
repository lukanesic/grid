import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface Player {
  name: string;
  level: string;
  avatar?: string | null; // Add avatar field
}

interface PlayerCardProps {
  player?: Player; // Make player optional
  position: any; // StyleSheet position styles
}

export default function PlayerCard({ player, position }: PlayerCardProps) {
  // Don't render anything if player is undefined
  if (!player) {
    return <View style={[styles.playerPosition, position]} />;
  }

  return (
    <View style={[styles.playerPosition, position]}>
      <Text style={styles.playerName}>{player.name}</Text>
      <Image
        source={{
          uri: player.avatar || `https://i.pravatar.cc/80?name=${player.name}`,
        }}
        style={styles.playerAvatar}
      />
      <View style={styles.playerScoreBox}>
        <Text style={styles.playerScoreText}>Score: {player.level}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerPosition: {
    position: "absolute",
    alignItems: "center",
  },
  playerAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginVertical: 6,
    borderWidth: 3,
    borderColor: "#4A90E2",
  },
  playerName: {
    color: "#F2F2F2",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 80,
    marginBottom: 6,
  },
  playerScoreBox: {
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    minWidth: 65,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    paddingHorizontal: 10,
  },
  playerScoreText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});

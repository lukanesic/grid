import React from "react";
import { StyleSheet, Text, View } from "react-native";
import PlayerCard from "./PlayerCard";

interface Player {
  name: string;
  level: string;
}

interface CourtVisualizationProps {
  players: Player[];
}

export default function CourtVisualization({
  players,
}: CourtVisualizationProps) {
  return (
    <View style={styles.courtSection}>
      <Text style={styles.courtTitle}>PADEL TEREN</Text>

      <View style={styles.courtContainer}>
        <View style={styles.padelCourt}>
          {/* Padel Court Layout */}
          <View style={styles.courtBoundary}>
            {/* Net - horizontal */}
            <View style={styles.net} />

            {/* Vertical line - creates 4 fields */}
            <View style={styles.verticalNet} />

            {/* Wall indicators */}
            <View style={styles.backWalls}>
              <View style={[styles.backWall, { top: 0 }]} />
              <View style={[styles.backWall, { bottom: 0 }]} />
            </View>

            {/* Players positioned in 4 quadrants */}
            <PlayerCard player={players[0]} position={styles.quadrantPlayer1} />
            <PlayerCard player={players[1]} position={styles.quadrantPlayer2} />
            <PlayerCard player={players[2]} position={styles.quadrantPlayer3} />
            <PlayerCard player={players[3]} position={styles.quadrantPlayer4} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  courtSection: {
    marginBottom: 32,
  },
  courtTitle: {
    color: "#8B8B8B",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 16,
  },
  courtContainer: {
    backgroundColor: "#121418",
    borderRadius: 16,
    padding: 16,
  },
  padelCourt: {
    aspectRatio: 3 / 4,
  },
  courtBoundary: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#4A90E2",
    borderRadius: 8,
    position: "relative",
  },

  // Court Elements
  net: {
    position: "absolute",
    top: "48%",
    left: 0,
    right: 0,
    height: 4, // Thicker net
    backgroundColor: "#F2F2F2",
    zIndex: 1,
  },
  verticalNet: {
    position: "absolute",
    left: "48%",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#F2F2F2",
    zIndex: 1,
  },
  backWalls: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  backWall: {
    position: "absolute",
    width: "100%",
    height: 4,
    backgroundColor: "#4A90E2",
    opacity: 0.7,
  },

  // Quadrant positions - one in each field created by horizontal + vertical lines
  quadrantPlayer1: { top: "15%", left: "15%" }, // top-left quadrant
  quadrantPlayer2: { top: "15%", right: "15%" }, // top-right quadrant
  quadrantPlayer3: { bottom: "15%", left: "15%" }, // bottom-left quadrant
  quadrantPlayer4: { bottom: "15%", right: "15%" }, // bottom-right quadrant
});

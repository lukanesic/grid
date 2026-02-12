import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ProfessionalScoreProps {
  setsWon: { team1: number; team2: number };
  currentSet: number;
  isTiebreak: boolean;
  matchWinner: "team1" | "team2" | null;
  totalSets: number;
  getCurrentScore: () => { team1: number; team2: number };
  addGame: (team: "team1" | "team2") => void;
  resetMatch: () => void;
}

export default function ProfessionalScore({
  setsWon,
  currentSet,
  isTiebreak,
  matchWinner,
  totalSets,
  getCurrentScore,
  addGame,
  resetMatch,
}: ProfessionalScoreProps) {
  return (
    <View style={styles.scoreSection}>
      <Text style={styles.scoreTitle}>PROFESIONALNI REZULTAT</Text>

      {/* Match Sets Overview */}
      <View style={styles.setsOverview}>
        <Text style={styles.setsTitle}>SETOVI</Text>
        <View style={styles.setsRow}>
          <View style={styles.teamSets}>
            <Text style={styles.teamLabel}>TIM 1</Text>
            <View style={styles.setsDisplay}>
              {Array.from({ length: totalSets }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.setCircle,
                    i < setsWon.team1 && styles.setWon,
                    i === currentSet - 1 && styles.setActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.setNumber,
                      i < setsWon.team1 && styles.setNumberWon,
                    ]}
                  >
                    {i + 1}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.teamSets}>
            <Text style={styles.teamLabel}>TIM 2</Text>
            <View style={styles.setsDisplay}>
              {Array.from({ length: totalSets }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.setCircle,
                    i < setsWon.team2 && styles.setWon,
                    i === currentSet - 1 && styles.setActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.setNumber,
                      i < setsWon.team2 && styles.setNumberWon,
                    ]}
                  >
                    {i + 1}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Current Set Score */}
      <View style={styles.currentScoreContainer}>
        <View style={styles.scoreHeader}>
          <Text style={styles.currentSetTitle}>
            {isTiebreak
              ? `TIEBREAK - SET ${currentSet}`
              : `SET ${currentSet} - GEMOVI`}
          </Text>
          {matchWinner && (
            <View style={styles.winnerBadge}>
              <FontAwesome name="trophy" size={14} color="#FFD700" />
              <Text style={styles.winnerText}>
                {matchWinner === "team1" ? "TIM 1 POBEDIO" : "TIM 2 POBEDIO"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.gameScoreContainer}>
          <View style={styles.teamScoreSection}>
            <View style={styles.teamScore}>
              <Text style={styles.teamName}>TIM 1</Text>
              <Text style={styles.scoreNumber}>{getCurrentScore().team1}</Text>
              {isTiebreak && <Text style={styles.tiebreakLabel}>TB</Text>}
            </View>
            {!matchWinner && (
              <Pressable
                style={styles.addScoreButton}
                onPress={() => addGame("team1")}
              >
                <FontAwesome name="plus" size={16} color="#0B0B0B" />
              </Pressable>
            )}
          </View>

          <View style={styles.scoreDivider}>
            <View style={styles.dividerLine} />
            <Pressable style={styles.resetButton} onPress={resetMatch}>
              <FontAwesome name="refresh" size={12} color="#8B8B8B" />
            </Pressable>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.teamScoreSection}>
            <View style={styles.teamScore}>
              <Text style={styles.teamName}>TIM 2</Text>
              <Text style={styles.scoreNumber}>{getCurrentScore().team2}</Text>
              {isTiebreak && <Text style={styles.tiebreakLabel}>TB</Text>}
            </View>
            {!matchWinner && (
              <Pressable
                style={styles.addScoreButton}
                onPress={() => addGame("team2")}
              >
                <FontAwesome name="plus" size={16} color="#0B0B0B" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Game Rules Info */}
        <View style={styles.rulesInfo}>
          <View style={styles.ruleItem}>
            <FontAwesome name="info-circle" size={12} color="#4A90E2" />
            <Text style={styles.ruleText}>
              {isTiebreak
                ? "Tiebreak: Prvi do 7 poena (razlika min. 2)"
                : "Gem: Prvi do 6 gemova (razlika min. 2, ili tiebreak 6-6)"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Score Section
  scoreSection: {
    marginBottom: 24,
  },
  scoreTitle: {
    color: "#8B8B8B",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 20,
    textAlign: "center",
  },

  // Sets Overview
  setsOverview: {
    backgroundColor: "#1A1B20",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2A2B35",
  },
  setsTitle: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  setsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  teamSets: {
    flex: 1,
    alignItems: "center",
  },
  teamLabel: {
    color: "#F2F2F2",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  setsDisplay: {
    flexDirection: "row",
    gap: 8,
  },
  setCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2A2B35",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  setActive: {
    borderColor: "#4A90E2",
    backgroundColor: "#1E2A3A",
  },
  setWon: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  setNumber: {
    color: "#8B8B8B",
    fontSize: 12,
    fontWeight: "700",
  },
  setNumberWon: {
    color: "#FFFFFF",
  },

  // Current Score Container
  currentScoreContainer: {
    backgroundColor: "#1A1B20",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2A2B35",
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  currentSetTitle: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  winnerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A2A1A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFD700",
    gap: 6,
  },
  winnerText: {
    color: "#FFD700",
    fontSize: 11,
    fontWeight: "700",
  },

  // Game Score Container
  gameScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  teamScoreSection: {
    flex: 1,
    alignItems: "center",
  },
  teamScore: {
    alignItems: "center",
    marginBottom: 12,
  },
  teamName: {
    color: "#8B8B8B",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  scoreNumber: {
    color: "#F2F2F2",
    fontSize: 28,
    fontWeight: "700",
    textShadowColor: "#4A90E2",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tiebreakLabel: {
    color: "#4A90E2",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
    letterSpacing: 1,
  },
  addScoreButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scoreDivider: {
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 8,
  },
  dividerLine: {
    width: 1,
    height: 32,
    backgroundColor: "#2A2B35",
  },
  resetButton: {
    backgroundColor: "#2A2B35",
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  // Rules Info
  rulesInfo: {
    backgroundColor: "#0F1419",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1A2A3A",
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ruleText: {
    color: "#8B8B8B",
    fontSize: 11,
    fontStyle: "italic",
    flex: 1,
  },
});

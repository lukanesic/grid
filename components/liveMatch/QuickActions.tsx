import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface QuickActionsProps {
  onAddGameTeam1?: () => void;
  onAddGameTeam2?: () => void;
  onAddPointTeam1?: () => void;
  onAddPointTeam2?: () => void;
  isTiebreak?: boolean;
  matchWinner?: "team1" | "team2" | null;
}

export default function QuickActions({
  onAddGameTeam1,
  onAddGameTeam2,
  onAddPointTeam1,
  onAddPointTeam2,
  isTiebreak,
  matchWinner,
}: QuickActionsProps) {
  return (
    <View style={styles.actionsSection}>
      <View style={styles.actionGrid}>
        <Pressable
          style={[styles.actionButton, matchWinner && styles.disabled]}
          onPress={onAddGameTeam1}
          disabled={!!matchWinner}
        >
          <FontAwesome
            name="plus"
            size={20}
            color={matchWinner ? "#888" : "#4A90E2"}
          />
          <Text style={[styles.actionText, matchWinner && styles.disabledText]}>
            Tim 1
          </Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, matchWinner && styles.disabled]}
          onPress={onAddGameTeam2}
          disabled={!!matchWinner}
        >
          <FontAwesome
            name="plus"
            size={20}
            color={matchWinner ? "#888" : "#4A90E2"}
          />
          <Text style={[styles.actionText, matchWinner && styles.disabledText]}>
            Tim 2
          </Text>
        </Pressable>

        {isTiebreak && (
          <>
            <Pressable
              style={[styles.actionButton, matchWinner && styles.disabled]}
              onPress={onAddPointTeam1}
              disabled={!!matchWinner}
            >
              <FontAwesome
                name="star"
                size={20}
                color={matchWinner ? "#888" : "#4A90E2"}
              />
              <Text
                style={[styles.actionText, matchWinner && styles.disabledText]}
              >
                Poen Tim 1
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, matchWinner && styles.disabled]}
              onPress={onAddPointTeam2}
              disabled={!!matchWinner}
            >
              <FontAwesome
                name="star"
                size={20}
                color={matchWinner ? "#888" : "#4A90E2"}
              />
              <Text
                style={[styles.actionText, matchWinner && styles.disabledText]}
              >
                Poen Tim 2
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsSection: {
    marginBottom: 100,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    color: "#F2F2F2",
    fontSize: 12,
    fontWeight: "600",
  },
  disabled: {
    backgroundColor: "#0A0A0A",
    opacity: 0.5,
  },
  disabledText: {
    color: "#888",
  },
});

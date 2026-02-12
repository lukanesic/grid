import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function QuickActions() {
  return (
    <View style={styles.actionsSection}>
      <View style={styles.actionGrid}>
        <Pressable style={styles.actionButton}>
          <FontAwesome name="pause" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>Pauza</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <FontAwesome name="bar-chart" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>Rezultat</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <FontAwesome name="camera" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>Slika</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <FontAwesome name="share-alt" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>Podeli</Text>
        </Pressable>
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
});

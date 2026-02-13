import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { USER_CIRCLES } from "../constants/data";
import CircleCard from "./CircleCard";

interface KrugoviTabContentProps {
  styles: any;
}

export default function KrugoviTabContent({ styles }: KrugoviTabContentProps) {
  return (
    <>
      {/* Create Circle Card */}
      <Pressable style={styles.createCircleCard}>
        <View style={styles.createCircleIcon}>
          <FontAwesome name="plus" size={20} color="#B8FF00" />
        </View>
        <View style={styles.createCircleContent}>
          <Text style={styles.createCircleTitle}>Kreiraj novi krug</Text>
          <Text style={styles.createCircleSubtitle}>
            Pozovi prijatelje i organizujte zajedničke mečeve
          </Text>
        </View>
        <FontAwesome name="chevron-right" size={14} color="#8B8B8B" />
      </Pressable>

      {/* Active Circles */}
      <View style={styles.circlesSection}>
        <View style={styles.circlesHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Aktivni krugovi
          </Text>
          <Text style={styles.seeAllLink}>Vidi sve</Text>
        </View>

        {USER_CIRCLES.filter(
          (circle) =>
            circle.activity === "Veoma aktivan" ||
            circle.activity === "Aktivan",
        ).map((circle) => (
          <CircleCard
            key={circle.id}
            id={circle.id}
            name={circle.name}
            type={circle.type as "friends" | "tournament" | "club" | "training"}
            members={circle.members}
            image={circle.image}
            activity={circle.activity}
            lastActivity={circle.lastActivity}
            description={circle.description}
            isCreator={circle.isCreator}
            onPress={() => {
              // Navigate to circle details
            }}
          />
        ))}
      </View>

      {/* All Circles */}
      <View style={styles.circlesSection}>
        <View style={styles.circlesHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Svi tvoji krugovi
          </Text>
        </View>

        {USER_CIRCLES.map((circle) => (
          <CircleCard
            key={circle.id}
            id={circle.id}
            name={circle.name}
            type={circle.type as "friends" | "tournament" | "club" | "training"}
            members={circle.members}
            image={circle.image}
            activity={circle.activity}
            lastActivity={circle.lastActivity}
            description={circle.description}
            isCreator={circle.isCreator}
            onPress={() => {
              // Navigate to circle details
            }}
          />
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
          Brze akcije
        </Text>

        <View style={styles.quickActionsGrid}>
          <Pressable style={styles.quickActionCard}>
            <FontAwesome name="search" size={20} color="#3867FF" />
            <Text style={styles.quickActionTitle}>Pronađi krugove</Text>
            <Text style={styles.quickActionSubtitle}>
              Pridruži se novim grupama
            </Text>
          </Pressable>

          <Pressable style={styles.quickActionCard}>
            <FontAwesome name="users" size={20} color="#B8FF00" />
            <Text style={styles.quickActionTitle}>Pozovi prijatelje</Text>
            <Text style={styles.quickActionSubtitle}>
              Dodaj kontakte u krugove
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

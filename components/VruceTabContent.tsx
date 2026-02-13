import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import {
    HOT_EVENTS,
    HOT_PLAYERS,
    SUGGESTED_CLUBS,
    TRENDING_MATCHES,
} from "../constants/data";
import HotEventCard from "./HotEventCard";
import HotPlayerCard from "./HotPlayerCard";
import TrendingClubCard from "./TrendingClubCard";
import TrendingMatchCard from "./TrendingMatchCard";

interface VruceTabContentProps {
  styles: any;
}

export default function VruceTabContent({ styles }: VruceTabContentProps) {
  const router = useRouter();

  return (
    <>
      {/* Hot Players */}
      <View style={styles.suggestedSection}>
        <View style={styles.suggestedHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Vruće igrači
          </Text>
          <Text style={styles.seeAllLink}>Vidi sve</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.playersScroll}
        >
          {HOT_PLAYERS.map((player, index) => (
            <HotPlayerCard
              key={index}
              name={player.name}
              level={player.level}
              percentage={player.percentage}
              avatar={player.avatar}
              hotReason={player.hotReason}
              wins={player.wins}
              onAddPress={() => {}}
              onPress={() =>
                router.push(`/(home)/playerProfile?id=${player.id}`)
              }
            />
          ))}
        </ScrollView>
      </View>

      {/* Trending Matches */}
      <View style={styles.suggestedSection}>
        <View style={styles.suggestedHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Trending mečevi
          </Text>
          <Text style={styles.seeAllLink}>Vidi sve</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.matchesScroll}
        >
          {TRENDING_MATCHES.map((match, index) => (
            <TrendingMatchCard
              key={index}
              id={match.id}
              type={match.type}
              date={match.date}
              location={match.location}
              duration={match.duration}
              level={match.level}
              participants={match.participants}
              prize={match.prize}
              onPress={() => router.push(`/(home)/matchScreen?id=${match.id}`)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Trending Clubs */}
      <View style={styles.suggestedSection}>
        <View style={styles.suggestedHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Popularni klubovi
          </Text>
          <Text style={styles.seeAllLink}>Vidi sve</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.playersScroll}
        >
          {SUGGESTED_CLUBS.map((club, index) => (
            <TrendingClubCard
              key={index}
              id={club.id}
              name={club.name}
              image={club.image}
              distance={club.distance}
              price={club.price}
              onPress={() => router.push(`/(home)/clubProfile?id=${club.id}`)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Hot Events */}
      <View style={styles.suggestedSection}>
        <View style={styles.suggestedHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Aktuelni događaji
          </Text>
          <Text style={styles.seeAllLink}>Vidi sve</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.playersScroll}
        >
          {HOT_EVENTS.map((event, index) => (
            <HotEventCard
              key={index}
              id={event.id}
              title={event.title}
              subtitle={event.subtitle}
              date={event.date}
              location={event.location}
              participants={event.participants}
              icon={event.icon}
              type={event.type as "workshop" | "tournament" | "training"}
              onPress={() => {}}
            />
          ))}
        </ScrollView>
      </View>
    </>
  );
}

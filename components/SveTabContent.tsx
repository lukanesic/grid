import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
    OPEN_MATCHES,
    SUGGESTED_CLUBS,
    SUGGESTED_PLAYERS,
    UPCOMING_MATCHES,
} from "../constants/data";
import { Button, ClubCard, MatchCard, PlayerCard } from "./index";

interface SveTabContentProps {
  styles: any;
}

export default function SveTabContent({ styles }: SveTabContentProps) {
  const router = useRouter();

  return (
    <>
      {/* Upcoming Matches */}
      <View style={styles.matchesSection}>
        <Text style={styles.sectionTitle}>Predstojeći mečevi</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.matchesScroll}
        >
          {UPCOMING_MATCHES.map((match, index) => (
            <MatchCard
              key={index}
              id={match.id}
              type={match.type}
              date={match.date}
              location={match.location}
              duration={match.duration}
              level={match.level}
              onPress={() => router.push(`/(home)/matchScreen?id=${match.id}`)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Suggested Players */}
      <View style={styles.suggestedSection}>
        <View style={styles.suggestedHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Predloženi igrači
          </Text>
          <Text style={styles.seeAllLink}>Vidi sve</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.playersScroll}
        >
          {SUGGESTED_PLAYERS.map((player, index) => (
            <PlayerCard
              key={index}
              name={player.name}
              friendsInCommon={3}
              matchPercentage={player.percentage}
              avatar={player.avatar}
              onAddPress={() => {}}
            />
          ))}
        </ScrollView>
      </View>

      {/* Suggested Clubs */}
      <View style={styles.suggestedSection}>
        <View style={styles.suggestedHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Predloženi klubovi
          </Text>
          <Text style={styles.seeAllLink}>Vidi sve</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.playersScroll}
        >
          {SUGGESTED_CLUBS.map((club, index) => (
            <ClubCard
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

      {/* Open Match */}
      <View style={styles.openMatchSection}>
        <View style={styles.matchHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            OTVORENI MEČEVI
          </Text>
          <Text style={styles.seeAllLink}>Vidi sve</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.matchesScroll}
        >
          {OPEN_MATCHES.map((match, idx) => (
            <Pressable
              key={idx}
              style={styles.openMatchCard}
              onPress={() => router.push(`/(home)/matchScreen?id=${match.id}`)}
            >
              <View style={styles.matchCardHeader}>
                <Text style={styles.matchCardAuthor}>
                  {match.author} · {match.time}
                </Text>
                <FontAwesome name="ellipsis-h" size={16} color="#8B8B8B" />
              </View>

              <View style={styles.openMatchType}>
                <FontAwesome name="hand-grab-o" size={20} color="#8B8B8B" />
                <Text style={styles.openMatchTitle}>{match.type}</Text>
              </View>

              <View style={styles.matchMetaRow}>
                <View style={styles.metaTag}>
                  <Text style={styles.metaTagText}>{match.duration}</Text>
                </View>
                <View style={styles.metaTag}>
                  <Text style={styles.metaTagText}>{match.level}</Text>
                </View>
              </View>

              <Text style={styles.openMatchDate}>{match.date}</Text>
              <Text style={styles.openMatchLocation}>{match.location}</Text>

              <View style={styles.participantsSection}>
                <View style={styles.participantsList}>
                  {match.participants.map((participant, index) => (
                    <View key={index} style={styles.participantItem}>
                      {participant.name === "" ? (
                        <>
                          <View
                            style={[
                              styles.participantAvatar,
                              styles.joinPlaceholder,
                            ]}
                          >
                            <FontAwesome
                              name="plus"
                              size={16}
                              color="#3867FF"
                            />
                          </View>
                          <Text style={styles.participantAction}>
                            {participant.level}
                          </Text>
                        </>
                      ) : (
                        <>
                          <View style={styles.participantAvatar} />
                          <Text style={styles.participantLevel}>
                            {participant.level}
                          </Text>
                          <Text style={styles.participantName}>
                            {participant.name}
                          </Text>
                        </>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              <Button
                title={`Priključi se meču · ${match.price}`}
                onPress={() => {
                  // Join match action
                }}
                variant="primary"
              />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeHeader from "./components/HomeHeader";
import SveTabContent from "./components/SveTabContent";
import VruceTabContent from "./components/VruceTabContent";
import KrugoviTabContent from "./components/KrugoviTabContent";

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"sve" | "vruce" | "krugovi">(
    "sve",
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../../../assets/logo/home-icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.headerActions}>
            <View>
              <IconButton
                icon="bell"
                onPress={() => router.push("/notification")}
              />
              <Badge count={20} />
            </View>
            <IconButton icon="bars" onPress={() => router.push("/menu")} />
          </View>
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>Zdravo Javier</Text>
          <Text style={styles.weatherText}>
            24°C • Oblačno • Madrid, Španija
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Pressable style={styles.pushButton}>
            <FontAwesome name="circle-o" size={20} color="#B8FF00" />
            <Text style={styles.pushButtonText}>Kreni na igru</Text>
          </Pressable>
          <Pressable
            style={styles.createButton}
            onPress={() => router.push("/createMatch")}
          >
            <FontAwesome name="plus" size={20} color="#111111" />
            <Text style={styles.createButtonText}>Kreiraj mec</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tab, activeTab === "sve" && styles.tabActive]}
            onPress={() => setActiveTab("sve")}
          >
            <Text
              style={
                activeTab === "sve" ? styles.tabActiveText : styles.tabText
              }
            >
              Sve
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "vruce" && styles.tabActive]}
            onPress={() => setActiveTab("vruce")}
          >
            <Text
              style={
                activeTab === "vruce" ? styles.tabActiveText : styles.tabText
              }
            >
              Šta je vruće
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "krugovi" && styles.tabActive]}
            onPress={() => setActiveTab("krugovi")}
          >
            <Text
              style={
                activeTab === "krugovi" ? styles.tabActiveText : styles.tabText
              }
            >
              Tvoji krugovi
            </Text>
          </Pressable>
        </View>

        {/* Connect Card */}
        <Pressable
          style={styles.connectCard}
          onPress={() => router.push("/(home)/connectFriends")}
        >
          <View style={styles.avatarGroup}>
            <View style={[styles.avatar, { marginLeft: 0 }]}>
              <FontAwesome name="user" size={16} color="#FFFFFF" />
            </View>
            <View style={[styles.avatar, { marginLeft: -12 }]}>
              <FontAwesome name="user" size={16} color="#FFFFFF" />
            </View>
            <View style={[styles.avatar, { marginLeft: -12 }]}>
              <FontAwesome name="user" size={16} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.connectText}>
            <Text style={styles.connectHeading}>Uveži se sa svojom</Text>
            <Text style={styles.connectSubheading}>prijateljima</Text>
          </View>
          <FontAwesome name="chevron-right" size={18} color="#8B8B8B" />
        </Pressable>

        {/* Tab Content */}
        {activeTab === "sve" && (
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
                    onPress={() =>
                      router.push(`/(home)/matchScreen?id=${match.id}`)
                    }
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
                    onPress={() =>
                      router.push(`/(home)/clubProfile?id=${club.id}`)
                    }
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
                    onPress={() =>
                      router.push(`/(home)/matchScreen?id=${match.id}`)
                    }
                  >
                    <View style={styles.matchCardHeader}>
                      <Text style={styles.matchCardAuthor}>
                        {match.author} · {match.time}
                      </Text>
                      <FontAwesome
                        name="ellipsis-h"
                        size={16}
                        color="#8B8B8B"
                      />
                    </View>

                    <View style={styles.openMatchType}>
                      <FontAwesome
                        name="hand-grab-o"
                        size={20}
                        color="#8B8B8B"
                      />
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
                    <Text style={styles.openMatchLocation}>
                      {match.location}
                    </Text>

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
        )}

        {/* Hot Content Tab */}
        {activeTab === "vruce" && (
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
                    onPress={() =>
                      router.push(`/(home)/matchScreen?id=${match.id}`)
                    }
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
                {TRENDING_CLUBS.map((club, index) => (
                  <TrendingClubCard
                    key={index}
                    id={club.id}
                    name={club.name}
                    image={club.image}
                    rating={club.rating}
                    reason={club.reason}
                    distance={club.distance}
                    price={club.price}
                    onPress={() =>
                      router.push(`/(home)/clubProfile?id=${club.id}`)
                    }
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
        )}

        {/* Krugovi Tab */}
        {activeTab === "krugovi" && (
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
                  type={
                    circle.type as
                      | "friends"
                      | "tournament"
                      | "club"
                      | "training"
                  }
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
                  type={
                    circle.type as
                      | "friends"
                      | "tournament"
                      | "club"
                      | "training"
                  }
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
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  greetingSection: {
    marginBottom: 28,
  },
  greetingText: {
    color: "#F2F2F2",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  weatherText: {
    color: "#8B8B8B",
    fontSize: 14,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  pushButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#1E1F23",
  },
  pushButtonText: {
    color: "#B8FF00",
    fontSize: 14,
    fontWeight: "600",
  },
  createButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#B8FF00",
  },
  createButtonText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "600",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F23",
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#F2F2F2",
  },
  tabActiveText: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
  },
  tabText: {
    color: "#8B8B8B",
    fontSize: 14,
  },
  connectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1F23",
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    gap: 12,
  },
  avatarGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3867FF",
    alignItems: "center",
    justifyContent: "center",
  },
  connectText: {
    flex: 1,
  },
  connectHeading: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
  },
  connectSubheading: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
  },
  matchesSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#F2F2F2",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  suggestedSection: {
    marginBottom: 14,
    marginTop: 14,
    paddingVertical: 16,
  },
  suggestedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllLink: {
    color: "#3867FF",
    fontSize: 14,
    fontWeight: "600",
  },
  playersScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  openMatchSection: {
    marginBottom: 28,
    paddingVertical: 16,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  matchAuthor: {
    color: "#8B8B8B",
    fontSize: 14,
  },
  matchesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  openMatchCard: {
    width: 320,
    backgroundColor: "#1E1F23",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
  },
  matchCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  matchCardAuthor: {
    color: "#8B8B8B",
    fontSize: 12,
  },
  openMatchType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  openMatchTitle: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  matchMetaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  metaTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#2C2C2C",
  },
  metaTagText: {
    color: "#8B8B8B",
    fontSize: 12,
    fontWeight: "600",
  },
  openMatchDate: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  openMatchLocation: {
    color: "#8B8B8B",
    fontSize: 12,
    marginBottom: 16,
  },
  participantsSection: {
    marginBottom: 16,
  },
  participantsList: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  participantItem: {
    alignItems: "center",
    gap: 4,
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3867FF",
  },
  joinPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2C2C2C",
    borderWidth: 2,
    borderColor: "#3867FF",
    borderStyle: "dashed",
  },
  participantLevel: {
    color: "#8B8B8B",
    fontSize: 11,
    fontWeight: "600",
  },
  participantName: {
    color: "#8B8B8B",
    fontSize: 12,
    fontWeight: "600",
  },
  participantAction: {
    color: "#3867FF",
    fontSize: 13,
    fontWeight: "700",
  },
  placeholderSection: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  placeholderTitle: {
    color: "#F2F2F2",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  placeholderText: {
    color: "#8B8B8B",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  createCircleCard: {
    backgroundColor: "#1E1F23",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#B8FF00",
    borderStyle: "dashed",
  },
  createCircleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2C2C2C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  createCircleContent: {
    flex: 1,
  },
  createCircleTitle: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  createCircleSubtitle: {
    color: "#8B8B8B",
    fontSize: 13,
  },
  circlesSection: {
    marginBottom: 28,
  },
  circlesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  quickActionsSection: {
    marginBottom: 28,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "#1E1F23",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2C2C2C",
  },
  quickActionTitle: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  quickActionSubtitle: {
    color: "#8B8B8B",
    fontSize: 12,
    textAlign: "center",
  },
});

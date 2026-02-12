import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components";
import { OPEN_MATCHES, UPCOMING_MATCHES } from "../../constants/data";

export default function MatchScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isJoined, setIsJoined] = useState(false);

  // Combine both upcoming and open matches to find the match by ID
  const allMatches = [...UPCOMING_MATCHES, ...OPEN_MATCHES];
  const match = allMatches.find((m) => m.id === id);

  if (!match) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
          </Pressable>
          <Text style={styles.headerTitle}>Meč nije pronađen</Text>
          <View style={{ width: 20 }} />
        </View>
      </SafeAreaView>
    );
  }

  const isOpenMatch = "author" in match;
  const openMatch = isOpenMatch ? (match as any) : null;

  const handleJoin = () => {
    if (isJoined) {
      Alert.alert(
        "Napusti meč",
        "Da li si siguran da želiš da napustiš ovaj meč?",
        [
          { text: "Otkaži", style: "cancel" },
          {
            text: "Napusti",
            style: "destructive",
            onPress: () => setIsJoined(false),
          },
        ],
      );
    } else {
      Alert.alert(
        "Priključi se meču",
        `Da li želiš da se priključiš ovom meču${openMatch ? ` za ${openMatch.price}` : ""}?`,
        [
          { text: "Otkaži", style: "cancel" },
          {
            text: "Priključi se",
            onPress: () => setIsJoined(true),
          },
        ],
      );
    }
  };

  const handleStartMatch = () => {
    Alert.alert("Započni meč", "Da li si spreman da započneš ovaj meč?", [
      { text: "Otkaži", style: "cancel" },
      {
        text: "Započni",
        onPress: () => router.push(`/(home)/liveMatch?id=${id}`),
      },
    ]);
  };

  const getSportIcon = (type: string) => {
    if (type.includes("🎾")) return "circle";
    if (type.includes("🏐")) return "circle-o";
    return "circle";
  };

  const getSportName = (type: string) => {
    if (type.includes("🎾")) return "Tenis";
    if (type.includes("🏐")) return "Padel";
    return "Sport";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
        </Pressable>
        <Text style={styles.headerTitle}>Detalji meča</Text>
        <Pressable onPress={() => {}}>
          <FontAwesome name="share-alt" size={20} color="#F2F2F2" />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Match Header */}
        <View style={styles.matchHeader}>
          <View style={styles.matchIcon}>
            <FontAwesome
              name={getSportIcon(match.type)}
              size={32}
              color="#B8FF00"
            />
          </View>
          <View style={styles.matchTitleSection}>
            <Text style={styles.matchType}>{match.type}</Text>
            <Text style={styles.sportName}>{getSportName(match.type)}</Text>
            {openMatch && (
              <Text style={styles.matchAuthor}>
                Kreirao {openMatch.author} • {openMatch.time}
              </Text>
            )}
          </View>
        </View>

        {/* Match Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailCard}>
            <FontAwesome name="calendar" size={20} color="#B8FF00" />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Datum i vreme</Text>
              <Text style={styles.detailValue}>{match.date}</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <FontAwesome name="map-marker" size={20} color="#B8FF00" />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Lokacija</Text>
              <Text style={styles.detailValue}>{match.location}</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <FontAwesome name="clock-o" size={20} color="#B8FF00" />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Trajanje</Text>
              <Text style={styles.detailValue}>{match.duration}</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <FontAwesome name="bar-chart" size={20} color="#B8FF00" />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Nivo igre</Text>
              <Text style={styles.detailValue}>{match.level}</Text>
            </View>
          </View>

          {openMatch && (
            <View style={styles.detailCard}>
              <FontAwesome name="credit-card" size={20} color="#B8FF00" />
              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>Cena po igraču</Text>
                <Text style={styles.detailValue}>{openMatch.price}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Participants Section */}
        {openMatch && (
          <View style={styles.participantsSection}>
            <Text style={styles.sectionTitle}>
              Igrači (
              {openMatch.participants.filter((p: any) => p.name !== "").length}
              /4)
            </Text>
            <View style={styles.participantsList}>
              {openMatch.participants.map((participant: any, index: number) => (
                <View key={index} style={styles.participantCard}>
                  {participant.name === "" ? (
                    <>
                      <View style={styles.emptySlot}>
                        <FontAwesome name="plus" size={16} color="#3867FF" />
                      </View>
                      <Text style={styles.emptySlotText}>Slobodno mesto</Text>
                      <Text style={styles.participantLevel}>
                        Nivo: {participant.level}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Image
                        source={{
                          uri: `https://i.pravatar.cc/80?name=${participant.name}`,
                        }}
                        style={styles.participantAvatar}
                      />
                      <Text style={styles.participantName}>
                        {participant.name}
                      </Text>
                      <Text style={styles.participantLevel}>
                        Nivo: {participant.level}
                      </Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Match Info */}
        {!isOpenMatch && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>O meču</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Ovo je kompletno organizovan meč. Svi detalji su već definisani
                uključujući vreme, lokaciju i trajanje. Pridruži se i uživaj u
                igri!
              </Text>
            </View>
          </View>
        )}

        {/* Location Info */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Informacije o objektu</Text>
          <View style={styles.locationCard}>
            <Image
              source={{
                uri: "https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg",
              }}
              style={styles.locationImage}
            />
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>
                {match.location.split(" · ")[0]}
              </Text>
              <Text style={styles.locationDistance}>
                {match.location.split(" · ")[1]}
              </Text>
              <View style={styles.locationFeatures}>
                <FontAwesome name="car" size={14} color="#8B8B8B" />
                <FontAwesome name="coffee" size={14} color="#8B8B8B" />
                <FontAwesome name="wifi" size={14} color="#8B8B8B" />
              </View>
            </View>
            <Pressable>
              <FontAwesome name="chevron-right" size={16} color="#8B8B8B" />
            </Pressable>
          </View>
        </View>

        {/* Rules Section */}
        <View style={styles.rulesSection}>
          <Text style={styles.sectionTitle}>Pravila i uslovi</Text>
          <View style={styles.rulesCard}>
            <View style={styles.ruleItem}>
              <FontAwesome name="clock-o" size={16} color="#B8FF00" />
              <Text style={styles.ruleText}>
                Dolaz 10 minuta pre početka meča
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <FontAwesome name="ban" size={16} color="#B8FF00" />
              <Text style={styles.ruleText}>
                Otkazivanje do 2 sata pre početka
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <FontAwesome name="users" size={16} color="#B8FF00" />
              <Text style={styles.ruleText}>
                Poštovanje svih igrača obavezno
              </Text>
            </View>
            {openMatch && (
              <View style={styles.ruleItem}>
                <FontAwesome name="credit-card" size={16} color="#B8FF00" />
                <Text style={styles.ruleText}>
                  Plaćanje na licu mesta ili unapred
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        {isJoined ? (
          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              <Pressable style={styles.secondaryButton} onPress={handleJoin}>
                <Text style={styles.secondaryButtonText}>Napusti meč</Text>
              </Pressable>
              <View style={styles.buttonSpacer} />
              <Pressable
                style={styles.primaryButton}
                onPress={handleStartMatch}
              >
                <FontAwesome name="play" size={16} color="#0B0B0B" />
                <Text style={styles.primaryButtonText}>Započni meč</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Button
            title={
              openMatch
                ? `Priključi se • ${openMatch.price}`
                : "Priključi se meču"
            }
            onPress={handleJoin}
            variant="primary"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: "#F2F2F2",
    fontSize: 17,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  matchHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F23",
  },
  matchIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#121418",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  matchTitleSection: {
    flex: 1,
  },
  matchType: {
    color: "#F2F2F2",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  sportName: {
    color: "#B8FF00",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  matchAuthor: {
    color: "#8B8B8B",
    fontSize: 14,
  },
  detailsSection: {
    marginBottom: 32,
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  detailContent: {
    marginLeft: 16,
    flex: 1,
  },
  detailTitle: {
    color: "#8B8B8B",
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
  },
  participantsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  participantsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  participantCard: {
    width: "48%",
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  emptySlot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1E1F23",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#3867FF",
    borderStyle: "dashed",
  },
  participantName: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptySlotText: {
    color: "#3867FF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  participantLevel: {
    color: "#8B8B8B",
    fontSize: 12,
  },
  infoSection: {
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    color: "#F2F2F2",
    fontSize: 14,
    lineHeight: 20,
  },
  locationSection: {
    marginBottom: 32,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
  },
  locationImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  locationDistance: {
    color: "#8B8B8B",
    fontSize: 14,
    marginBottom: 8,
  },
  locationFeatures: {
    flexDirection: "row",
    gap: 12,
  },
  rulesSection: {
    marginBottom: 100,
  },
  rulesCard: {
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ruleText: {
    color: "#F2F2F2",
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  bottomAction: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0B0B0B",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#1E1F23",
  },
  buttonContainer: {
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonSpacer: {
    width: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#1E1F23",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    flex: 2,
    backgroundColor: "#B8FF00",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: "#0B0B0B",
    fontSize: 16,
    fontWeight: "700",
  },
});

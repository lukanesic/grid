import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SUGGESTED_CLUBS, SUGGESTED_FRIENDS } from "../../../constants/data";
import { useTheme } from "../../../contexts/ThemeContext";

export default function CommunityScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  // Use static suggested friends and clubs data
  const suggestedPeople = SUGGESTED_FRIENDS;
  const suggestedClubs = SUGGESTED_CLUBS.slice(0, 3);

  // Combine people and clubs, interleaving them
  const combinedList = [];
  const maxLength = Math.max(suggestedPeople.length, suggestedClubs.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < suggestedPeople.length) {
      combinedList.push({ type: "person", data: suggestedPeople[i], index: i });
    }
    if (i < suggestedClubs.length) {
      combinedList.push({ type: "club", data: suggestedClubs[i], index: i });
    }
  }

  const handleFollow = (userId: string) => {
    setFollowingIds((prev) => [...prev, userId]);
  };

  const handleRemove = (userId: string) => {
    // Handle remove logic
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 36 }} />
        <Text style={styles.headerTitle}>Community</Text>
        <Pressable>
          <FontAwesome name="search" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroText}>
            Povežite se sa igračima i pratite njihove mečeve
          </Text>
        </View>

        {/* Contacts Section */}
        <View style={styles.contactsSection}>
          <View style={styles.contactsLeft}>
            <View style={styles.contactsIcon}>
              <FontAwesome name="phone" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.contactsTextContainer}>
              <Text style={styles.contactsTitle}>Kontakti</Text>
              <Text style={styles.contactsSubtitle}>
                Pronađite svoje kontakte
              </Text>
            </View>
          </View>
          <Pressable style={styles.findButton}>
            <Text style={styles.findButtonText}>Pronađi</Text>
          </Pressable>
        </View>

        {/* Suggested People & Clubs */}
        {combinedList.map((item, idx) => {
          if (item.type === "person") {
            const person = item.data;
            const isFollowing = followingIds.includes(person.id.toString());
            const suggestionTypes = [
              "People you may know",
              "Shared with you",
              "Followed by",
            ];
            const suggestionType =
              suggestionTypes[item.index % suggestionTypes.length];

            return (
              <View key={`person-${person.id}`} style={styles.personCard}>
                <Pressable
                  onPress={() =>
                    router.push(`/(home)/playerProfile?id=${person.id}`)
                  }
                >
                  <Image
                    source={{
                      uri: person.avatar,
                    }}
                    style={styles.personAvatar}
                  />
                </Pressable>
                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{person.name}</Text>
                  {suggestionType === "Followed by" ? (
                    <View style={styles.followedByContainer}>
                      <Text style={styles.followedByText}>Followed by </Text>
                      <View style={styles.miniAvatarsContainer}>
                        <Image
                          source={{
                            uri: `https://i.pravatar.cc/150?img=${(item.index + 1) % 50}`,
                          }}
                          style={styles.miniAvatar}
                        />
                        <Image
                          source={{
                            uri: `https://i.pravatar.cc/150?img=${(item.index + 2) % 50}`,
                          }}
                          style={[styles.miniAvatar, { marginLeft: -8 }]}
                        />
                        <View
                          style={[
                            styles.miniAvatar,
                            styles.miniAvatarMore,
                            { marginLeft: -8 },
                          ]}
                        >
                          <Text style={styles.miniAvatarMoreText}>+1</Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.personSubtitle}>{suggestionType}</Text>
                  )}
                  <View style={styles.actionsContainer}>
                    {!isFollowing ? (
                      <>
                        <Pressable
                          style={styles.removeButton}
                          onPress={() => handleRemove(person.id.toString())}
                        >
                          <Text style={styles.removeButtonText}>Remove</Text>
                        </Pressable>
                        <Pressable
                          style={styles.followButton}
                          onPress={() => handleFollow(person.id.toString())}
                        >
                          <Text style={styles.followButtonText}>Follow</Text>
                        </Pressable>
                      </>
                    ) : (
                      <Pressable
                        style={styles.followingButton}
                        onPress={() =>
                          setFollowingIds((prev) =>
                            prev.filter((id) => id !== person.id.toString()),
                          )
                        }
                      >
                        <Text style={styles.followingButtonText}>
                          Following
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            );
          } else {
            // Club
            const club = item.data;
            const isFollowing = followingIds.includes(`club-${club.id}`);

            return (
              <View key={`club-${club.id}`} style={styles.personCard}>
                <Pressable
                  onPress={() =>
                    router.push(`/(home)/clubProfile?id=${club.id}`)
                  }
                >
                  <Image
                    source={{
                      uri: club.image,
                    }}
                    style={styles.personAvatar}
                  />
                </Pressable>
                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{club.name}</Text>
                  <Text style={styles.personSubtitle}>
                    Sports club · {club.distance}
                  </Text>
                  <View style={styles.actionsContainer}>
                    {!isFollowing ? (
                      <>
                        <Pressable
                          style={styles.removeButton}
                          onPress={() => handleRemove(`club-${club.id}`)}
                        >
                          <Text style={styles.removeButtonText}>Remove</Text>
                        </Pressable>
                        <Pressable
                          style={styles.followButton}
                          onPress={() => handleFollow(`club-${club.id}`)}
                        >
                          <Text style={styles.followButtonText}>Follow</Text>
                        </Pressable>
                      </>
                    ) : (
                      <Pressable
                        style={styles.followingButton}
                        onPress={() =>
                          setFollowingIds((prev) =>
                            prev.filter((id) => id !== `club-${club.id}`),
                          )
                        }
                      >
                        <Text style={styles.followingButtonText}>
                          Following
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            );
          }
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    userAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: "#00D9FF",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    content: {
      flex: 1,
    },
    heroSection: {
      paddingHorizontal: 20,
      paddingVertical: 40,
    },
    heroText: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 34,
    },
    contactsSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginBottom: 8,
    },
    contactsLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 16,
    },
    contactsIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#2ECC71",
      justifyContent: "center",
      alignItems: "center",
    },
    contactsTextContainer: {
      flex: 1,
    },
    contactsTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 2,
    },
    contactsSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    findButton: {
      backgroundColor: "#FF2D55",
      paddingHorizontal: 40,
      paddingVertical: 12,
      borderRadius: 24,
    },
    findButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    personCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 16,
    },
    personAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    personInfo: {
      flex: 1,
      gap: 8,
    },
    personName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    personSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    followedByContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    followedByText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    miniAvatarsContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    miniAvatar: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.background,
    },
    miniAvatarMore: {
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },
    miniAvatarMoreText: {
      fontSize: 9,
      fontWeight: "600",
      color: colors.text,
    },
    actionsContainer: {
      flexDirection: "row",
      gap: 8,
      marginTop: 4,
      width: "100%",
    },
    removeButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 6,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      alignItems: "center",
    },
    removeButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    followButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 6,
      backgroundColor: "#FF2D55",
      alignItems: "center",
    },
    followButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    followingButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 6,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    followingButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textSecondary,
    },
  });

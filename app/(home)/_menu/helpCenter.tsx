import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuHeader } from "../../../components/menu";
import {
  FAQ_ITEMS,
  HELP_CONTACT_OPTIONS,
  HELP_TOPICS,
} from "../../../constants/data";
import { useTheme } from "../../../contexts/ThemeContext";

export default function HelpCenterScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const glowColor = isDark ? "#B8FF00" : colors.blue;
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      <MenuHeader title="Centar za pomoć" onBack={() => router.back()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Pretraži pomoć..."
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <FontAwesome
                name="close"
                size={16}
                color={colors.textSecondary}
              />
            </Pressable>
          )}
        </View>

        {/* Quick Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teme</Text>
          <View style={styles.topicsGrid}>
            {HELP_TOPICS.map((topic, index) => (
              <Pressable
                key={index}
                style={styles.topicCard}
                onPress={() => {
                  if (topic.title === "Plaćanje i pretplata") {
                    router.push("/_menu/helpPaymentSubscription");
                  } else if (topic.title === "Rezervacije") {
                    router.push("/_menu/helpReservations");
                  } else if (topic.title === "Nalog i profil") {
                    router.push("/_menu/helpAccountProfile");
                  } else if (topic.title === "Bezbednost") {
                    router.push("/_menu/helpSecurity");
                  } else if (topic.title === "Mečevi i turniri") {
                    router.push("/_menu/helpMatchesTournaments");
                  } else if (topic.title === "Podešavanja") {
                    router.push("/_menu/helpSettings");
                  }
                }}
              >
                <View style={[styles.iconGlow, { shadowColor: glowColor }]}>
                  <FontAwesome
                    name={topic.icon as any}
                    size={24}
                    color={isDark ? "#B8FF00" : colors.blue}
                  />
                </View>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicCount}>{topic.count} članaka</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Česta pitanja</Text>
          {filteredFaqs.map((item) => (
            <Pressable
              key={item.id}
              style={styles.faqCard}
              onPress={() => toggleFaq(item.id)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <FontAwesome
                  name={expandedFaq === item.id ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.textSecondary}
                />
              </View>
              {expandedFaq === item.id && (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kontaktiraj podršku</Text>
          {HELP_CONTACT_OPTIONS.map((option) => (
            <Pressable key={option.id} style={styles.contactCard}>
              {(() => {
                const iconColor =
                  !isDark && option.id === "chat" ? colors.blue : option.color;

                return (
                  <View style={styles.contactLeft}>
                    <View
                      style={[
                        styles.contactIcon,
                        { shadowColor: iconColor },
                        {
                          backgroundColor: `${iconColor}${isDark ? "15" : "1A"}`,
                        },
                      ]}
                    >
                      <FontAwesome
                        name={option.icon as any}
                        size={20}
                        color={iconColor}
                      />
                    </View>
                    <View style={styles.contactText}>
                      <Text style={styles.contactTitle}>{option.title}</Text>
                      <Text style={styles.contactSubtitle}>
                        {option.subtitle}
                      </Text>
                    </View>
                  </View>
                );
              })()}
              <FontAwesome
                name="chevron-right"
                size={16}
                color={colors.textSecondary}
              />
            </Pressable>
          ))}
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resursi</Text>
          <Pressable
            style={styles.resourceCard}
            onPress={() => router.push("/_menu/helpPaymentSubscription")}
          >
            <View style={[styles.iconGlow, { shadowColor: colors.blue }]}>
              <FontAwesome name="book" size={20} color={colors.blue} />
            </View>
            <View style={styles.resourceText}>
              <Text style={styles.resourceTitle}>Dokumentacija</Text>
              <Text style={styles.resourceSubtitle}>
                Kompletno uputstvo za upotrebu
              </Text>
            </View>
            <FontAwesome
              name="external-link"
              size={16}
              color={colors.textSecondary}
            />
          </Pressable>

          <Pressable style={styles.resourceCard}>
            <View style={[styles.iconGlow, { shadowColor: colors.blue }]}>
              <FontAwesome name="video-camera" size={20} color={colors.blue} />
            </View>
            <View style={styles.resourceText}>
              <Text style={styles.resourceTitle}>Video tutorijali</Text>
              <Text style={styles.resourceSubtitle}>
                Naučite kako koristiti aplikaciju
              </Text>
            </View>
            <FontAwesome
              name="external-link"
              size={16}
              color={colors.textSecondary}
            />
          </Pressable>

          <Pressable style={styles.resourceCard}>
            <View style={[styles.iconGlow, { shadowColor: colors.blue }]}>
              <FontAwesome name="users" size={20} color={colors.blue} />
            </View>
            <View style={styles.resourceText}>
              <Text style={styles.resourceTitle}>Zajednica</Text>
              <Text style={styles.resourceSubtitle}>
                Pridružite se diskusiji
              </Text>
            </View>
            <FontAwesome
              name="external-link"
              size={16}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* Feedback */}
        <View style={styles.feedbackCard}>
          <View style={[styles.iconGlow, { shadowColor: glowColor }]}>
            <FontAwesome
              name="lightbulb-o"
              size={24}
              color={isDark ? "#B8FF00" : colors.blue}
            />
          </View>
          <View style={styles.feedbackText}>
            <Text style={styles.feedbackTitle}>Niste našli odgovor?</Text>
            <Text style={styles.feedbackSubtitle}>
              Pošaljite nam povratnu informaciju ili pitanje
            </Text>
          </View>
          <Pressable style={styles.feedbackButton}>
            <Text style={styles.feedbackButtonText}>Kontakt</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    searchContainer: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 24,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 16,
    },
    topicsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    topicCard: {
      width: "48%",
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      gap: 8,
    },
    topicTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },
    topicCount: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    faqCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    faqHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    faqQuestion: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
      marginRight: 12,
    },
    faqAnswer: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#1E1F23" : colors.border,
    },
    contactCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    contactLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    contactIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.2 : 0.16,
      shadowRadius: 8,
      elevation: 3,
    },
    iconGlow: {
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.2 : 0.14,
      shadowRadius: 7,
      elevation: 2,
    },
    contactText: {
      flex: 1,
    },
    contactTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    contactSubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    resourceCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    resourceText: {
      flex: 1,
    },
    resourceTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 4,
    },
    resourceSubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    feedbackCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 16,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 32,
    },
    feedbackText: {
      flex: 1,
    },
    feedbackTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 4,
    },
    feedbackSubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    feedbackButton: {
      backgroundColor: isDark ? "#B8FF00" : colors.blue,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
    },
    feedbackButtonText: {
      color: isDark ? "#0B0B0B" : "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
  });

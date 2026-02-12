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
import {
  FAQ_ITEMS,
  HELP_CONTACT_OPTIONS,
  HELP_TOPICS,
} from "../../../constants/data";

export default function HelpCenterScreen() {
  const router = useRouter();
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
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
        </Pressable>
        <Text style={styles.headerTitle}>Centar za pomoć</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={18} color="#8B8B8B" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Pretraži pomoć..."
            placeholderTextColor="#8B8B8B"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <FontAwesome name="close" size={16} color="#8B8B8B" />
            </Pressable>
          )}
        </View>

        {/* Quick Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teme</Text>
          <View style={styles.topicsGrid}>
            {HELP_TOPICS.map((topic, index) => (
              <Pressable key={index} style={styles.topicCard}>
                <FontAwesome
                  name={topic.icon as any}
                  size={24}
                  color="#B8FF00"
                />
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
                  color="#8B8B8B"
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
              <View style={styles.contactLeft}>
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: `${option.color}15` },
                  ]}
                >
                  <FontAwesome
                    name={option.icon as any}
                    size={20}
                    color={option.color}
                  />
                </View>
                <View style={styles.contactText}>
                  <Text style={styles.contactTitle}>{option.title}</Text>
                  <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#8B8B8B" />
            </Pressable>
          ))}
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resursi</Text>
          <Pressable style={styles.resourceCard}>
            <FontAwesome name="book" size={20} color="#3867FF" />
            <View style={styles.resourceText}>
              <Text style={styles.resourceTitle}>Dokumentacija</Text>
              <Text style={styles.resourceSubtitle}>
                Kompletno uputstvo za upotrebu
              </Text>
            </View>
            <FontAwesome name="external-link" size={16} color="#8B8B8B" />
          </Pressable>

          <Pressable style={styles.resourceCard}>
            <FontAwesome name="video-camera" size={20} color="#3867FF" />
            <View style={styles.resourceText}>
              <Text style={styles.resourceTitle}>Video tutorijali</Text>
              <Text style={styles.resourceSubtitle}>
                Naučite kako koristiti aplikaciju
              </Text>
            </View>
            <FontAwesome name="external-link" size={16} color="#8B8B8B" />
          </Pressable>

          <Pressable style={styles.resourceCard}>
            <FontAwesome name="users" size={20} color="#3867FF" />
            <View style={styles.resourceText}>
              <Text style={styles.resourceTitle}>Zajednica</Text>
              <Text style={styles.resourceSubtitle}>
                Pridružite se diskusiji
              </Text>
            </View>
            <FontAwesome name="external-link" size={16} color="#8B8B8B" />
          </Pressable>
        </View>

        {/* Feedback */}
        <View style={styles.feedbackCard}>
          <FontAwesome name="lightbulb-o" size={24} color="#B8FF00" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    backgroundColor: "#121418",
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
    color: "#F2F2F2",
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: "#F2F2F2",
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
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  topicTitle: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  topicCount: {
    color: "#8B8B8B",
    fontSize: 12,
  },
  faqCard: {
    backgroundColor: "#121418",
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
    color: "#F2F2F2",
    fontSize: 15,
    fontWeight: "600",
    marginRight: 12,
  },
  faqAnswer: {
    color: "#8B8B8B",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1E1F23",
  },
  contactCard: {
    backgroundColor: "#121418",
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
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  contactSubtitle: {
    color: "#8B8B8B",
    fontSize: 13,
  },
  resourceCard: {
    backgroundColor: "#121418",
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
    color: "#F2F2F2",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  resourceSubtitle: {
    color: "#8B8B8B",
    fontSize: 13,
  },
  feedbackCard: {
    backgroundColor: "#121418",
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
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  feedbackSubtitle: {
    color: "#8B8B8B",
    fontSize: 13,
    lineHeight: 18,
  },
  feedbackButton: {
    backgroundColor: "#B8FF00",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  feedbackButtonText: {
    color: "#0B0B0B",
    fontSize: 14,
    fontWeight: "700",
  },
});

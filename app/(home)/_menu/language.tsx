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
import { LANGUAGES } from "../../../constants/data";

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("sr");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLanguages = LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
        </Pressable>
        <Text style={styles.headerTitle}>Jezik</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.content}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={18} color="#8B8B8B" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Pretraži jezike..."
            placeholderTextColor="#8B8B8B"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <FontAwesome name="close" size={16} color="#8B8B8B" />
            </Pressable>
          )}
        </View>

        {/* Current Language */}
        <View style={styles.currentSection}>
          <Text style={styles.sectionTitle}>Trenutni jezik</Text>
          <View style={styles.currentLanguageCard}>
            <Text style={styles.currentFlag}>
              {LANGUAGES.find((l) => l.id === selectedLanguage)?.flag}
            </Text>
            <View style={styles.currentLanguageText}>
              <Text style={styles.currentLanguageName}>
                {LANGUAGES.find((l) => l.id === selectedLanguage)?.nativeName}
              </Text>
              <Text style={styles.currentLanguageSubtitle}>
                {LANGUAGES.find((l) => l.id === selectedLanguage)?.name}
              </Text>
            </View>
            <View style={styles.activeBadge}>
              <FontAwesome name="check" size={14} color="#0B0B0B" />
            </View>
          </View>
        </View>

        {/* Languages List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Svi jezici</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredLanguages.map((language) => {
              const isSelected = selectedLanguage === language.id;
              return (
                <Pressable
                  key={language.id}
                  style={[
                    styles.languageCard,
                    isSelected && styles.languageCardSelected,
                  ]}
                  onPress={() => setSelectedLanguage(language.id)}
                >
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName}>
                      {language.nativeName}
                    </Text>
                    <Text style={styles.languageSubtitle}>{language.name}</Text>
                  </View>
                  {isSelected && (
                    <FontAwesome name="check" size={18} color="#B8FF00" />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <FontAwesome name="info-circle" size={16} color="#3867FF" />
          <Text style={styles.infoText}>
            Promena jezika će se primeniti nakon ponovnog pokretanja aplikacije
          </Text>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.footer}>
        <Pressable style={styles.saveButton} onPress={() => router.back()}>
          <Text style={styles.saveButtonText}>Sačuvaj</Text>
        </Pressable>
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
  currentSection: {
    marginBottom: 32,
  },
  section: {
    flex: 1,
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  currentLanguageCard: {
    backgroundColor: "#121418",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 2,
    borderColor: "#B8FF00",
  },
  currentFlag: {
    fontSize: 32,
  },
  currentLanguageText: {
    flex: 1,
  },
  currentLanguageName: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  currentLanguageSubtitle: {
    color: "#8B8B8B",
    fontSize: 14,
  },
  activeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#B8FF00",
    alignItems: "center",
    justifyContent: "center",
  },
  languageCard: {
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  languageCardSelected: {
    borderWidth: 1,
    borderColor: "#B8FF00",
  },
  languageFlag: {
    fontSize: 28,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  languageSubtitle: {
    color: "#8B8B8B",
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: "#1E1F23",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    color: "#8B8B8B",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: "#0B0B0B",
    borderTopWidth: 1,
    borderTopColor: "#1E1F23",
  },
  saveButton: {
    backgroundColor: "#B8FF00",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#0B0B0B",
    fontSize: 16,
    fontWeight: "700",
  },
});

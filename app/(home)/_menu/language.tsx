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
import { useLanguage } from "../../../contexts/LanguageContext";
import { useTheme } from "../../../contexts/ThemeContext";

export default function LanguageScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const styles = getStyles(colors, isDark);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLanguages = LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleLanguageSelect = async (langId: string) => {
    await changeLanguage(langId);
    // Navigate back after a short delay to show selection
    setTimeout(() => {
      router.back();
    }, 300);
  };

  const currentLanguage = LANGUAGES.find((l) => l.id === language);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Jezik</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.content}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Pretraži jezike..."
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

        {/* Current Language */}
        <View style={styles.currentSection}>
          <Text style={styles.sectionTitle}>Trenutni jezik</Text>
          <View style={styles.currentLanguageCard}>
            <Text style={styles.currentFlag}>{currentLanguage?.flag}</Text>
            <View style={styles.currentLanguageText}>
              <Text style={styles.currentLanguageName}>
                {currentLanguage?.nativeName}
              </Text>
              <Text style={styles.currentLanguageSubtitle}>
                {currentLanguage?.name}
              </Text>
            </View>
            <View style={styles.activeBadge}>
              <FontAwesome
                name="check"
                size={14}
                color={isDark ? "#0B0B0B" : "#FFFFFF"}
              />
            </View>
          </View>
        </View>

        {/* Languages List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Svi jezici</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredLanguages.map((lang) => {
              const isSelected = language === lang.id;
              return (
                <Pressable
                  key={lang.id}
                  style={[
                    styles.languageCard,
                    isSelected && styles.languageCardSelected,
                  ]}
                  onPress={() => handleLanguageSelect(lang.id)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName}>{lang.nativeName}</Text>
                    <Text style={styles.languageSubtitle}>{lang.name}</Text>
                  </View>
                  {isSelected && (
                    <FontAwesome
                      name="check"
                      size={18}
                      color={isDark ? "#B8FF00" : colors.blue}
                    />
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
            Promena jezika će se odmah primeniti u aplikaciji
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
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
    currentSection: {
      marginBottom: 32,
    },
    section: {
      flex: 1,
      marginBottom: 24,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 16,
    },
    currentLanguageCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 16,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      borderWidth: 2,
      borderColor: isDark ? "#B8FF00" : colors.blue,
    },
    currentFlag: {
      fontSize: 32,
    },
    currentLanguageText: {
      flex: 1,
    },
    currentLanguageName: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 4,
    },
    currentLanguageSubtitle: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    activeBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? "#B8FF00" : colors.blue,
      alignItems: "center",
      justifyContent: "center",
    },
    languageCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    languageCardSelected: {
      borderWidth: 1,
      borderColor: isDark ? "#B8FF00" : colors.blue,
    },
    languageFlag: {
      fontSize: 28,
    },
    languageInfo: {
      flex: 1,
    },
    languageName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    languageSubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    infoCard: {
      backgroundColor: isDark ? "#1E1F23" : colors.surface,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      gap: 12,
      marginBottom: 32,
    },
    infoText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
  });

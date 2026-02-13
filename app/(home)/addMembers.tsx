import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SUGGESTED_USERS } from "../../constants/data";
import { useChats } from "../../contexts/ChatContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function AddMembersScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { groupName, currentMembers, chatId } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const { updateGroupMembers } = useChats();

  const currentMemberIds = currentMembers
    ? (currentMembers as string).split(",").map((id) => parseInt(id))
    : [];

  // Filter out users who are already members
  const availableUsers = SUGGESTED_USERS.filter(
    (user) => !currentMemberIds.includes(user.id),
  );

  const filteredUsers = availableUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleAddMembers = () => {
    if (selectedUsers.length === 0) return;

    const groupChatId = parseInt(chatId as string);
    updateGroupMembers(groupChatId, selectedUsers);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text style={styles.cancelText}>Otkaži</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Dodaj članove</Text>
          <Text style={styles.headerSubtitle}>{groupName}</Text>
        </View>
        <TouchableOpacity
          onPress={handleAddMembers}
          style={styles.button}
          disabled={selectedUsers.length === 0}
        >
          <Text
            style={[
              styles.doneText,
              selectedUsers.length === 0 && styles.doneTextDisabled,
            ]}
          >
            Dodaj {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome
          name="search"
          size={16}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Pretraži kontakte"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <FontAwesome
              name="times-circle"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Count */}
      {selectedUsers.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedText}>
            {selectedUsers.length}{" "}
            {selectedUsers.length === 1 ? "osoba" : "osoba"} izabrano
          </Text>
        </View>
      )}

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isSelected = selectedUsers.includes(item.id);
          return (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => toggleUser(item.id)}
            >
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userSubtitle}>{item.subtitle}</Text>
              </View>
              <View
                style={[styles.checkbox, isSelected && styles.checkboxSelected]}
              >
                {isSelected && (
                  <FontAwesome
                    name="check"
                    size={14}
                    color={colors.background}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="users" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nema dostupnih korisnika</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? "Pokušajte sa drugim pojmom"
                : "Svi korisnici su već članovi grupe"}
            </Text>
          </View>
        }
      />
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
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
    },
    headerSubtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 2,
    },
    button: {
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    cancelText: {
      color: isDark ? colors.accent : colors.blue,
      fontSize: 16,
    },
    doneText: {
      color: isDark ? colors.accent : colors.blue,
      fontSize: 16,
      fontWeight: "600",
    },
    doneTextDisabled: {
      color: colors.textSecondary,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 10,
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      paddingVertical: 4,
    },
    clearButton: {
      padding: 4,
    },
    selectedContainer: {
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
    selectedText: {
      color: isDark ? colors.accent : colors.blue,
      fontSize: 14,
      fontWeight: "600",
    },
    listContent: {
      paddingBottom: 20,
    },
    userItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    userSubtitle: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.textSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxSelected: {
      backgroundColor: isDark ? colors.accent : colors.blue,
      borderColor: isDark ? colors.accent : colors.blue,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    emptyText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtext: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
    },
  });

import { supabase } from "@/lib/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

interface FollowingUser {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ViewState = "options" | "groupChat" | "newChat";

export default function NewChatScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { profile } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>("options");
  const [groupName, setGroupName] = useState("");
  const [optionsSearchQuery, setOptionsSearchQuery] = useState("");
  const [newChatSearchQuery, setNewChatSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(true);

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (profile?.id) {
      loadFollowingUsers();
    }
  }, [profile?.id]);

  useEffect(() => {
    const toValue =
      currentView === "groupChat" ? 1 : currentView === "newChat" ? -1 : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentView, slideAnim]);

  const loadFollowingUsers = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_following_list", {
        target_user_id: profile.id,
      });

      if (error) throw error;
      setFollowingUsers((data || []).slice(0, 10));
    } catch (error) {
      console.error("Error loading following users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentView("newChat");
  };

  const handleGroupChat = () => {
    setCurrentView("groupChat");
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleBack = () => {
    if (currentView === "groupChat") {
      setCurrentView("options");
      setSelectedUsers([]);
      setGroupName("");
      setSearchQuery("");
    } else if (currentView === "newChat") {
      setCurrentView("options");
      setNewChatSearchQuery("");
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    // TODO: Implement group chat creation with database
    // For now, just go back
    router.back();
  };

  const handleUserSelect = async (user: FollowingUser) => {
    try {
      // Get or create chat with this user
      const { data: chatId, error } = await supabase.rpc("get_or_create_chat", {
        other_user_id: user.user_id,
      });

      if (error) throw error;

      // Navigate to chat screen
      router.push({
        pathname: "/(home)/chat",
        params: {
          chatId: chatId,
          otherUserId: user.user_id,
          name: user.full_name || "Unknown",
          avatar: user.avatar_url || "https://i.pravatar.cc/150?img=1",
        },
      });
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  const filteredOptionsUsers = followingUsers.filter((user) =>
    user.full_name?.toLowerCase().includes(optionsSearchQuery.toLowerCase()),
  );

  const filteredNewChatUsers = followingUsers.filter((user) =>
    user.full_name?.toLowerCase().includes(newChatSearchQuery.toLowerCase()),
  );

  const filteredGroupUsers = followingUsers.filter((user) =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const optionsTranslateX = slideAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-SCREEN_WIDTH, 0, -SCREEN_WIDTH],
  });

  const newChatTranslateX = slideAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, SCREEN_WIDTH, SCREEN_WIDTH],
  });

  const groupChatTranslateX = slideAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [SCREEN_WIDTH, SCREEN_WIDTH, 0],
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Options View */}
      <Animated.View
        style={[
          styles.viewContainer,
          { transform: [{ translateX: optionsTranslateX }] },
        ]}
        pointerEvents={currentView === "options" ? "auto" : "none"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novi chat</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <FontAwesome
              name="search"
              size={16}
              color="#8B8B8B"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Pretraži kontakte..."
              placeholderTextColor="#5E5E5E"
              value={optionsSearchQuery}
              onChangeText={setOptionsSearchQuery}
            />
            {optionsSearchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setOptionsSearchQuery("")}
                style={styles.clearButton}
              >
                <FontAwesome name="times-circle" size={16} color="#8B8B8B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.actionItem} onPress={handleNewChat}>
              <View style={styles.actionIconContainer}>
                <FontAwesome
                  name="user"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Novi chat</Text>
                <Text style={styles.actionSubtitle}>
                  Započni privatnu konverzaciju
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#5E5E5E" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleGroupChat}
            >
              <View style={styles.actionIconContainer}>
                <FontAwesome
                  name="users"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Grupni chat</Text>
                <Text style={styles.actionSubtitle}>
                  Kreiraj grupu sa više učesnika
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#5E5E5E" />
            </TouchableOpacity>
          </View>

          {/* Suggested Users */}
          <View style={styles.suggestedSection}>
            <Text style={styles.sectionTitle}>Predloženi</Text>

            {loading && (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.emptyText}>Učitavanje...</Text>
              </View>
            )}

            {!loading && followingUsers.length === 0 && (
              <View style={styles.emptyContainer}>
                <FontAwesome name="users" size={48} color="#5E5E5E" />
                <Text style={styles.emptyText}>Ne pratite nijednog igrača</Text>
              </View>
            )}

            {!loading &&
              filteredOptionsUsers.map((user) => (
                <TouchableOpacity
                  key={user.user_id}
                  style={styles.userItem}
                  onPress={() => handleUserSelect(user)}
                >
                  <Image
                    source={{
                      uri: user.avatar_url || "https://i.pravatar.cc/150?img=1",
                    }}
                    style={styles.userAvatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.full_name}</Text>
                  </View>
                </TouchableOpacity>
              ))}

            {!loading &&
              filteredOptionsUsers.length === 0 &&
              followingUsers.length > 0 && (
                <View style={styles.emptyContainer}>
                  <FontAwesome name="search" size={48} color="#5E5E5E" />
                  <Text style={styles.emptyText}>
                    Nema pronađenih korisnika
                  </Text>
                </View>
              )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* New Chat View */}
      <Animated.View
        style={[
          styles.viewContainer,
          { transform: [{ translateX: newChatTranslateX }] },
        ]}
        pointerEvents={currentView === "newChat" ? "auto" : "none"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novi chat</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <FontAwesome
              name="search"
              size={16}
              color="#8B8B8B"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Pretraži kontakte..."
              placeholderTextColor="#5E5E5E"
              value={newChatSearchQuery}
              onChangeText={setNewChatSearchQuery}
              autoFocus
            />
            {newChatSearchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setNewChatSearchQuery("")}
                style={styles.clearButton}
              >
                <FontAwesome name="times-circle" size={16} color="#8B8B8B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Users List */}
          <View style={styles.suggestedSection}>
            <Text style={styles.sectionTitle}>Kontakti</Text>

            {loading && (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.emptyText}>Učitavanje...</Text>
              </View>
            )}

            {!loading && followingUsers.length === 0 && (
              <View style={styles.emptyContainer}>
                <FontAwesome name="users" size={48} color="#5E5E5E" />
                <Text style={styles.emptyText}>Ne pratite nijednog igrača</Text>
              </View>
            )}

            {!loading &&
              filteredNewChatUsers.map((user) => (
                <TouchableOpacity
                  key={user.user_id}
                  style={styles.userItem}
                  onPress={() => handleUserSelect(user)}
                >
                  <Image
                    source={{
                      uri: user.avatar_url || "https://i.pravatar.cc/150?img=1",
                    }}
                    style={styles.userAvatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.full_name}</Text>
                  </View>
                </TouchableOpacity>
              ))}

            {!loading &&
              filteredNewChatUsers.length === 0 &&
              followingUsers.length > 0 && (
                <View style={styles.emptyContainer}>
                  <FontAwesome name="search" size={48} color="#5E5E5E" />
                  <Text style={styles.emptyText}>
                    Nema pronađenih korisnika
                  </Text>
                </View>
              )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Group Chat View */}
      <Animated.View
        style={[
          styles.viewContainer,
          { transform: [{ translateX: groupChatTranslateX }] },
        ]}
        pointerEvents={currentView === "groupChat" ? "auto" : "none"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novi grupni chat</Text>
          <TouchableOpacity
            onPress={handleNext}
            style={styles.nextButton}
            disabled={selectedUsers.length === 0}
          >
            <Text
              style={[
                styles.nextText,
                selectedUsers.length === 0 && styles.nextTextDisabled,
              ]}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Group Name Input */}
          <View style={styles.groupNameContainer}>
            <TextInput
              style={styles.groupNameInput}
              placeholder="Naziv grupe (opciono)"
              placeholderTextColor={colors.textSecondary}
              value={groupName}
              onChangeText={setGroupName}
            />
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <FontAwesome
              name="search"
              size={16}
              color="#8B8B8B"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Pretraži korisnike"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <FontAwesome name="times-circle" size={16} color="#8B8B8B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Section Header */}
          <View style={styles.groupSectionHeader}>
            <Text style={styles.sectionTitle}>PREDLOŽENI</Text>
            {selectedUsers.length > 0 && (
              <Text style={styles.selectedCount}>
                {selectedUsers.length} izabrano
              </Text>
            )}
          </View>

          {/* Users List with Checkboxes */}
          <View style={styles.suggestedSection}>
            {loading && (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.emptyText}>Učitavanje...</Text>
              </View>
            )}

            {!loading && followingUsers.length === 0 && (
              <View style={styles.emptyContainer}>
                <FontAwesome name="users" size={48} color="#5E5E5E" />
                <Text style={styles.emptyText}>Ne pratite nijednog igrača</Text>
              </View>
            )}

            {!loading &&
              filteredGroupUsers.map((user) => {
                const isSelected = selectedUsers.includes(user.user_id);
                return (
                  <TouchableOpacity
                    key={user.user_id}
                    style={styles.userItem}
                    onPress={() => toggleUserSelection(user.user_id)}
                  >
                    <Image
                      source={{
                        uri:
                          user.avatar_url || "https://i.pravatar.cc/150?img=1",
                      }}
                      style={styles.userAvatar}
                    />
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user.full_name}</Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <FontAwesome
                          name="check"
                          size={14}
                          color={isDark ? "#0B0B0B" : "#FFFFFF"}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
          </View>

          {!loading &&
            filteredGroupUsers.length === 0 &&
            followingUsers.length > 0 && (
              <View style={styles.emptyContainer}>
                <FontAwesome name="users" size={48} color="#5E5E5E" />
                <Text style={styles.emptyText}>Nema pronađenih korisnika</Text>
              </View>
            )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    viewContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: SCREEN_WIDTH,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 4,
    },
    cancelText: {
      color: isDark ? colors.accent : colors.blue,
      fontSize: 16,
      fontWeight: "500",
    },
    headerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
    },
    placeholder: {
      width: 28,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 10,
      marginHorizontal: 20,
      marginVertical: 16,
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
    actionsSection: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    actionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    actionIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    actionTextContainer: {
      flex: 1,
    },
    actionTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    actionSubtitle: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    suggestedSection: {
      paddingHorizontal: 20,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
      textTransform: "uppercase",
      marginBottom: 12,
      letterSpacing: 0.5,
    },
    userItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    userAvatar: {
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
    nextButton: {
      padding: 4,
    },
    nextText: {
      color: isDark ? colors.accent : colors.blue,
      fontSize: 16,
      fontWeight: "600",
    },
    nextTextDisabled: {
      color: colors.textSecondary,
    },
    groupNameContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    groupNameInput: {
      color: colors.text,
      fontSize: 16,
      paddingVertical: 8,
    },
    clearButton: {
      padding: 4,
    },
    groupSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    selectedCount: {
      color: isDark ? colors.accent : colors.blue,
      fontSize: 14,
      fontWeight: "600",
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
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 16,
      marginTop: 16,
    },
  });

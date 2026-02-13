import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
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
import { SUGGESTED_USERS } from "../../constants/data";
import { useChats } from "../../contexts/ChatContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ViewState = "options" | "groupChat" | "newChat";

export default function NewChatScreen() {
  const router = useRouter();
  const { addChat, chats } = useChats();
  const [currentView, setCurrentView] = useState<ViewState>("options");
  const [groupName, setGroupName] = useState("");
  const [optionsSearchQuery, setOptionsSearchQuery] = useState("");
  const [newChatSearchQuery, setNewChatSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const toValue =
      currentView === "groupChat" ? 1 : currentView === "newChat" ? -1 : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentView, slideAnim]);

  const handleNewChat = () => {
    setCurrentView("newChat");
  };

  const handleGroupChat = () => {
    setCurrentView("groupChat");
  };

  const toggleUserSelection = (userId: number) => {
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
    if (selectedUsers.length === 0) return;

    // Get selected user details
    const selectedUsersData = SUGGESTED_USERS.filter((user) =>
      selectedUsers.includes(user.id),
    );

    // Generate group name if not provided
    const finalGroupName =
      groupName.trim() ||
      selectedUsersData.map((u) => u.name.split(" ")[0]).join(", ");

    // Create group chat avatars (first two users)
    const groupAvatar =
      selectedUsersData[0]?.avatar || "https://i.pravatar.cc/150?img=1";
    const groupAvatars = selectedUsersData.slice(0, 2).map((u) => u.avatar);

    // Get current time
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const time = `${hours}:${minutes}`;

    // Create new group chat
    const newGroupChat = {
      name: finalGroupName,
      message: "Grupa je kreirana",
      time,
      avatar: groupAvatar,
      isOnline: false,
      isGroup: true,
      members: selectedUsers,
      groupAvatars,
      unreadCount: 0,
      isRead: false,
    };

    addChat(newGroupChat);

    // Reset state and return to options view
    setSelectedUsers([]);
    setGroupName("");
    setSearchQuery("");
    setCurrentView("options");
  };

  const handleUserSelect = (user: any) => {
    // Check if chat already exists
    const existingChat = chats.find(
      (chat) => !chat.isGroup && chat.name === user.name,
    );

    if (!existingChat) {
      // Get current time
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const time = `${hours}:${minutes}`;

      // Create new individual chat
      addChat({
        name: user.name,
        message: "Započet chat",
        time,
        avatar: user.avatar,
        isOnline: Math.random() > 0.5,
        isGroup: false,
        unreadCount: 0,
        isRead: false,
      });
    }

    // Reset search and navigate to chat
    setNewChatSearchQuery("");
    setCurrentView("options");
    router.back();

    // Navigate to chat after a small delay to allow modal to close
    setTimeout(() => {
      router.push({
        pathname: "/(home)/chat",
        params: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          isOnline: "false",
          isGroup: "false",
        },
      });
    }, 100);
  };

  const filteredOptionsUsers = SUGGESTED_USERS.filter((user) =>
    user.name.toLowerCase().includes(optionsSearchQuery.toLowerCase()),
  );

  const filteredNewChatUsers = SUGGESTED_USERS.filter((user) =>
    user.name.toLowerCase().includes(newChatSearchQuery.toLowerCase()),
  );

  const filteredGroupUsers = SUGGESTED_USERS.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
                <FontAwesome name="user" size={20} color="#8B8B8B" />
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
                <FontAwesome name="users" size={20} color="#8B8B8B" />
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

            {filteredOptionsUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userItem}
                onPress={() => handleUserSelect(user)}
              >
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.userAvatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userSubtitle}>{user.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {filteredOptionsUsers.length === 0 && (
              <View style={styles.emptyContainer}>
                <FontAwesome name="search" size={48} color="#5E5E5E" />
                <Text style={styles.emptyText}>Nema pronađenih korisnika</Text>
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

            {filteredNewChatUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userItem}
                onPress={() => handleUserSelect(user)}
              >
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.userAvatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userSubtitle}>{user.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {filteredNewChatUsers.length === 0 && (
              <View style={styles.emptyContainer}>
                <FontAwesome name="search" size={48} color="#5E5E5E" />
                <Text style={styles.emptyText}>Nema pronađenih korisnika</Text>
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
              placeholderTextColor="#5E5E5E"
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
              placeholderTextColor="#5E5E5E"
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
            {filteredGroupUsers.map((user) => {
              const isSelected = selectedUsers.includes(user.id);
              return (
                <TouchableOpacity
                  key={user.id}
                  style={styles.userItem}
                  onPress={() => toggleUserSelection(user.id)}
                >
                  <Image
                    source={{ uri: user.avatar }}
                    style={styles.userAvatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userSubtitle}>{user.subtitle}</Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected && (
                      <FontAwesome name="check" size={14} color="#0B0B0B" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {filteredGroupUsers.length === 0 && (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  viewContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    backgroundColor: "#0B0B0B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  backButton: {
    padding: 4,
  },
  cancelText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  headerTitle: {
    color: "#F2F2F2",
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
    backgroundColor: "#1A1A1A",
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
    color: "#F2F2F2",
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
    borderBottomColor: "#1A1A1A",
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  actionSubtitle: {
    color: "#8B8B8B",
    fontSize: 14,
  },
  suggestedSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#8B8B8B",
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
    borderBottomColor: "#1A1A1A",
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
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  userSubtitle: {
    color: "#8B8B8B",
    fontSize: 14,
  },
  nextButton: {
    padding: 4,
  },
  nextText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  nextTextDisabled: {
    color: "#5E5E5E",
  },
  groupNameContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  groupNameInput: {
    color: "#F2F2F2",
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
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#5E5E5E",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#8B8B8B",
    fontSize: 16,
    marginTop: 16,
  },
});

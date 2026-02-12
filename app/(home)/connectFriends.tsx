import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionCard, EmptyState, FriendCard, QRCard } from "../../components";
import { SUGGESTED_FRIENDS } from "../../constants/data";

export default function ConnectFriends() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState(SUGGESTED_FRIENDS);

  const handleConnect = (friendId: number) => {
    setFriends(
      friends.map((friend) =>
        friend.id === friendId ? { ...friend, isConnected: true } : friend,
      ),
    );
  };

  const handleInviteByPhone = () => {
    Alert.alert(
      "Pozovi prijatelje",
      "Otvoriću kontakte da pozoveš prijatelje na Grid",
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Otvori kontakte",
          onPress: () => console.log("Opening contacts"),
        },
      ],
    );
  };

  const handleShareQR = () => {
    Alert.alert("Podeli QR kod", "Tvoj QR kod je spreman za deljenje", [
      { text: "Otkaži", style: "cancel" },
      { text: "Podeli", onPress: () => console.log("Sharing QR") },
    ]);
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
        </Pressable>
        <Text style={styles.headerTitle}>Poveži se sa prijateljima</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.section}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pretraži prijatelje..."
            placeholderTextColor="#8B8B8B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brze akcije</Text>

          <ActionCard
            icon="phone"
            title="Pozovi iz kontakata"
            subtitle="Pozovi prijatelje iz telefona da se pridruže Grid-u"
            onPress={handleInviteByPhone}
          />

          <ActionCard
            icon="qrcode"
            title="Podeli QR kod"
            subtitle="Podeli svoj QR kod da te prijatelji mogu pronaći"
            onPress={handleShareQR}
          />
        </View>

        {/* Suggested Friends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Predloženi prijatelji ({filteredFriends.length})
          </Text>

          {filteredFriends.length === 0 ? (
            <EmptyState
              icon="users"
              title="Nema rezultata"
              subtitle="Pokušaj sa drugim pojmom pretrage"
            />
          ) : (
            <View style={styles.friendsList}>
              {filteredFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onConnect={() => handleConnect(friend.id)}
                />
              ))}
            </View>
          )}
        </View>

        {/* QR Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tvoj QR kod</Text>
          <QRCard
            username="@tvoj_username"
            subtitle="Skeniranjem ovog koda prijatelji mogu da te pronađu"
            onShare={handleShareQR}
          />
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    color: "#F2F2F2",
    fontSize: 16,
  },
  friendsList: {
    gap: 16,
  },
});

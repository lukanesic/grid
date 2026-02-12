import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CLUBS } from "../../../constants/data";

export default function CommunityScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 60 }} />
        <TouchableOpacity>
          <Text style={styles.viewMap}>View map</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={18} color="#8B8B8B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Barcelona"
            placeholderTextColor="#F2F2F2"
            value="Barcelona"
          />
          <TouchableOpacity>
            <FontAwesome name="send" size={18} color="#8B8B8B" />
          </TouchableOpacity>
          <TouchableOpacity>
            <FontAwesome name="heart-o" size={18} color="#8B8B8B" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <FontAwesome name="sliders" size={18} color="#F2F2F2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>Tennis</Text>
            <FontAwesome name="chevron-down" size={12} color="#F2F2F2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>25 May | 10 - 15</Text>
          </TouchableOpacity>
        </View>

        {/* Clubs List */}
        {CLUBS.map((club) => (
          <TouchableOpacity
            key={club.id}
            style={styles.clubCard}
            onPress={() => router.push(`/clubProfile?id=${club.id}`)}
          >
            <ImageBackground
              source={{ uri: club.image }}
              style={styles.clubImage}
            >
              <View style={styles.imageOverlay} />
              <View style={styles.clubImageOverlay}>
                <View style={styles.clubInfo}>
                  <Text style={styles.clubName}>{club.name}</Text>
                  <Text style={styles.clubPrice}>{club.price}</Text>
                </View>
                <Text style={styles.clubFrom}>{club.from}</Text>
              </View>
            </ImageBackground>

            {/* Club Details */}
            <View style={styles.clubDetails}>
              <Text style={styles.clubLocation}>
                {club.distance} • {club.location}
              </Text>
              <View style={styles.timeSlotsContainer}>
                {club.timeSlots.map((slot, index) => (
                  <TouchableOpacity key={index} style={styles.timeSlot}>
                    <Text style={styles.timeSlotText}>{slot}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 20 }} />
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
  viewMap: {
    color: "#3867FF",
    fontSize: 15,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#0B0B0B",
    fontWeight: "500",
  },
  filtersContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: "#121418",
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121418",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChipText: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "500",
  },
  clubCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#121418",
  },
  clubImage: {
    width: "100%",
    height: 240,
    justifyContent: "flex-end",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  clubImageOverlay: {
    padding: 16,
    position: "relative",
  },
  clubInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  clubName: {
    color: "#F2F2F2",
    fontSize: 20,
    fontWeight: "700",
  },
  clubPrice: {
    color: "#F2F2F2",
    fontSize: 20,
    fontWeight: "700",
  },
  clubFrom: {
    color: "#F2F2F2",
    fontSize: 13,
    opacity: 0.8,
  },
  clubDetails: {
    padding: 16,
  },
  clubLocation: {
    color: "#8B8B8B",
    fontSize: 14,
    marginBottom: 12,
  },
  timeSlotsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  timeSlot: {
    backgroundColor: "#0B0B0B",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timeSlotText: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "500",
  },
});

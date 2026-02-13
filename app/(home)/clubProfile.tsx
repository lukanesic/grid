import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";

const CLUB_DATA: { [key: string]: any } = {
  "1": {
    id: 1,
    name: "CN Montjuïc",
    image:
      "https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg",
    price: "17 €",
    distance: "3km",
    location: "Barcelona Barcelona",
    address: "Carrer de Segura, 1, 08004 Barcelona",
    rating: 4.5,
    reviews: 128,
    description:
      "Klub sa tradicijom i vrhunskim terenima. Idealno mesto za padel ljubitelje svih nivoa. Moderna oprema i prijatna atmosfera.",
    courts: 8,
    amenities: [
      { icon: "car", label: "Parking" },
      { icon: "coffee", label: "Kafić" },
      { icon: "bath", label: "Tuševi" },
      { icon: "wifi", label: "WiFi" },
      { icon: "wheelchair", label: "Pristup" },
    ],
    openingHours: "Pon-Ned: 08:00 - 23:00",
    timeSlots: ["13:30", "14:00", "14:30", "16:00", "17:00", "18:00"],
  },
  "2": {
    id: 2,
    name: "Eurofitness Vall d'Hebron",
    image:
      "https://images.pexels.com/photos/27151849/pexels-photo-27151849.jpeg",
    price: "11 €",
    distance: "5km",
    location: "Barcelona Barcelona",
    address: "Passeig de la Vall d'Hebron, 171, 08035 Barcelona",
    rating: 4.3,
    reviews: 95,
    description:
      "Moderan sportski centar sa odličnim terenima. Deo većeg fitness kompleksa sa svim potrebnim sadržajima.",
    courts: 6,
    amenities: [
      { icon: "car", label: "Parking" },
      { icon: "coffee", label: "Kafić" },
      { icon: "bath", label: "Tuševi" },
      { icon: "dumbbell", label: "Gym" },
    ],
    openingHours: "Pon-Ned: 07:00 - 23:00",
    timeSlots: ["12:00", "13:00", "15:00", "17:00", "19:00"],
  },
  "3": {
    id: 3,
    name: "Club Esportiu Europa",
    image:
      "https://images.pexels.com/photos/34116480/pexels-photo-34116480.jpeg",
    price: "15 €",
    distance: "2km",
    location: "Barcelona Barcelona",
    address: "Carrer de Provença, 480, 08025 Barcelona",
    rating: 4.7,
    reviews: 156,
    description:
      "Premium klub sa najvišim standardima. Profesionalni treneri i vrhunska oprema dostupni svim članovima.",
    courts: 10,
    amenities: [
      { icon: "car", label: "Parking" },
      { icon: "coffee", label: "Kafić" },
      { icon: "bath", label: "Tuševi" },
      { icon: "wifi", label: "WiFi" },
      { icon: "user", label: "Treneri" },
    ],
    openingHours: "Pon-Ned: 08:00 - 22:00",
    timeSlots: ["10:00", "11:30", "14:00", "16:30", "18:00", "20:00"],
  },
  "4": {
    id: 4,
    name: "Padel Indoor Barcelona",
    image:
      "https://images.pexels.com/photos/18084429/pexels-photo-18084429.jpeg",
    price: "20 €",
    distance: "4km",
    location: "Barcelona Barcelona",
    address: "Carrer de Mallorca, 401, 08013 Barcelona",
    rating: 4.4,
    reviews: 89,
    description:
      "Specijalizovani indoor padel centar sa klimatizovanim terenima. Idealno za igru tokom cele godine.",
    courts: 12,
    amenities: [
      { icon: "car", label: "Parking" },
      { icon: "coffee", label: "Kafić" },
      { icon: "bath", label: "Tuševi" },
      { icon: "snowflake-o", label: "Klima" },
      { icon: "trophy", label: "Turniri" },
    ],
    openingHours: "Pon-Ned: 09:00 - 24:00",
    timeSlots: ["09:00", "10:30", "12:00", "15:00", "17:30", "19:00", "21:00"],
  },
};

export default function ClubProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const club = CLUB_DATA[id as string];

  if (!club) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Klub nije pronađen</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <ImageBackground
          source={{ uri: club.image }}
          style={styles.headerImage}
        >
          <View style={styles.imageOverlay} />
          <View style={styles.headerOverlay}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
            </Pressable>
          </View>
        </ImageBackground>

        <View style={styles.content}>
          {/* Club Info */}
          <View style={styles.infoSection}>
            <Text style={styles.clubName}>{club.name}</Text>
            <View style={styles.ratingRow}>
              <FontAwesome
                name="star"
                size={16}
                color={isDark ? colors.accent : colors.blue}
              />
              <Text style={styles.ratingText}>
                {club.rating} ({club.reviews} recenzija)
              </Text>
            </View>
            <View style={styles.locationRow}>
              <FontAwesome
                name="map-marker"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.locationText}>{club.address}</Text>
            </View>
            <View style={styles.distanceRow}>
              <Text style={styles.distanceText}>{club.distance} od vas</Text>
              <Text style={styles.priceText}>{club.price}/sat</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>O klubu</Text>
            <Text style={styles.description}>{club.description}</Text>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sadržaji</Text>
            <View style={styles.amenitiesGrid}>
              {club.amenities.map((amenity: any, index: number) => (
                <View key={index} style={styles.amenityCard}>
                  <FontAwesome
                    name={amenity.icon}
                    size={20}
                    color={isDark ? colors.accent : colors.blue}
                  />
                  <Text style={styles.amenityLabel}>{amenity.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Courts Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tereni</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <FontAwesome
                  name="circle"
                  size={16}
                  color={isDark ? colors.accent : colors.blue}
                />
                <Text style={styles.infoText}>
                  {club.courts} terena dostupno
                </Text>
              </View>
              <View style={styles.infoRow}>
                <FontAwesome
                  name="clock-o"
                  size={16}
                  color={isDark ? colors.accent : colors.blue}
                />
                <Text style={styles.infoText}>{club.openingHours}</Text>
              </View>
            </View>
          </View>

          {/* Available Times */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dostupni termini danas</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.timeSlotsScroll}
            >
              {club.timeSlots.map((slot: string, index: number) => (
                <Pressable key={index} style={styles.timeSlot}>
                  <Text style={styles.timeSlotText}>{slot}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Reviews Preview */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Recenzije</Text>
              <Pressable>
                <Text style={[styles.seeAllLink, { color: colors.blue }]}>
                  Vidi sve
                </Text>
              </Pressable>
            </View>
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image
                  source={{ uri: "https://i.pravatar.cc/150?img=12" }}
                  style={styles.reviewAvatar}
                />
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewName}>Carlos Mendoza</Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesome
                        key={star}
                        name="star"
                        size={12}
                        color={isDark ? colors.accent : colors.blue}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>pre 2 dana</Text>
              </View>
              <Text style={styles.reviewText}>
                Odličan klub! Tereni su u perfektnom stanju, osoblje prijatno.
                Definitivno preporučujem.
              </Text>
            </View>
          </View>

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.footer}>
        <Pressable
          style={styles.bookButton}
          onPress={() => router.push(`/createMatch?clubId=${club.id}`)}
        >
          <Text style={styles.bookButtonText}>Rezerviši termin</Text>
        </Pressable>
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
    headerImage: {
      width: "100%",
      height: 300,
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    headerOverlay: {
      padding: 20,
      paddingTop: 10,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      padding: 20,
    },
    infoSection: {
      marginBottom: 24,
    },
    clubName: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "700",
      marginBottom: 8,
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 8,
    },
    ratingText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    locationText: {
      color: colors.textSecondary,
      fontSize: 14,
      flex: 1,
    },
    distanceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    distanceText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    priceText: {
      color: isDark ? colors.accent : colors.blue,
      fontSize: 20,
      fontWeight: "700",
    },
    section: {
      marginBottom: 28,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 12,
    },
    description: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
    amenitiesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    amenityCard: {
      width: "30%",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      gap: 8,
    },
    amenityLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      gap: 12,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    infoText: {
      color: colors.text,
      fontSize: 15,
    },
    timeSlotsScroll: {
      marginHorizontal: -20,
      paddingHorizontal: 20,
    },
    timeSlot: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginRight: 8,
    },
    timeSlotText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    reviewsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    seeAllLink: {
      fontSize: 14,
      fontWeight: "600",
    },
    reviewCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    reviewHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    reviewAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    reviewInfo: {
      flex: 1,
    },
    reviewName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
    },
    reviewStars: {
      flexDirection: "row",
      gap: 2,
    },
    reviewDate: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    reviewText: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    bookButton: {
      backgroundColor: isDark ? colors.accent : colors.blue,
      borderRadius: 24,
      paddingVertical: 16,
      alignItems: "center",
    },
    bookButtonText: {
      color: isDark ? colors.background : "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
    errorText: {
      color: colors.text,
      fontSize: 16,
      textAlign: "center",
      marginTop: 40,
    },
  });

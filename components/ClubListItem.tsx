import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesome } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface ClubListItemProps {
  name: string;
  location: string;
  surface: string; // "Grass", "Clay", "Hard" etc.
  type: string; // "Indoor", "Outdoor"
  pricePerHour: string;
  image: string;
  onPress?: () => void;
}

export default function ClubListItem({
  name,
  location,
  surface,
  type,
  pricePerHour,
  image,
  onPress,
}: ClubListItemProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>

        <View style={styles.detailsRow}>
          <FontAwesome
            name="map-marker"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={styles.detailText}>{location}</Text>
        </View>

        <View style={styles.detailsRow}>
          <FontAwesome name="leaf" size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>{surface}</Text>

          <FontAwesome
            name="sun-o"
            size={14}
            color={colors.textSecondary}
            style={{ marginLeft: 16 }}
          />
          <Text style={styles.detailText}>{type}</Text>
        </View>

        <Text style={styles.price}>{pricePerHour}</Text>
      </View>

      <Image source={{ uri: image }} style={styles.image} />
    </Pressable>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 16,
      gap: 16,
    },
    infoContainer: {
      flex: 1,
      gap: 8,
    },
    name: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    detailsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    detailText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    price: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginTop: 4,
    },
    image: {
      width: 120,
      height: 120,
      borderRadius: 12,
    },
  });

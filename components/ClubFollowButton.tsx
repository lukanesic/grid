import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { followClub, unfollowClub } from "@/lib/clubApi";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface ClubFollowButtonProps {
  clubId: string;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  variant?: "default" | "small" | "text";
}

export const ClubFollowButton: React.FC<ClubFollowButtonProps> = ({
  clubId,
  isFollowing: initialIsFollowing,
  onFollowChange,
  variant = "default",
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { colors, fonts } = useTheme();
  const { refreshProfile, updateFollowingCount } = useAuth();
  const queryClient = useQueryClient();
  const styles = createStyles(colors, fonts);

  const handleFollowToggle = async () => {
    if (isLoading) return;

    if (isFollowing) {
      // Show confirmation for unfollow
      Alert.alert(
        "Otprati klub",
        "Da li ste sigurni da želite da otpratite ovaj klub?",
        [
          {
            text: "Otkaži",
            style: "cancel",
          },
          {
            text: "Otprati",
            style: "destructive",
            onPress: () => performUnfollow(),
          },
        ],
      );
    } else {
      performFollow();
    }
  };

  const performFollow = async () => {
    setIsLoading(true);
    try {
      await followClub(clubId);

      setIsFollowing(true);
      onFollowChange?.(true);

      // Optimistically update following count
      updateFollowingCount(1);

      // Force refetch userFollowing to show in home feed
      queryClient.invalidateQueries({ queryKey: ["userFollowing"] });
      await queryClient.refetchQueries({ queryKey: ["userFollowing"] });

      // Refresh current user profile to update following_count from database
      await refreshProfile();

      // Invalidate other queries
      queryClient.invalidateQueries({ queryKey: ["clubFollowStatus", clubId] });
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    } catch (error: any) {
      console.error("Error following club:", error);
      Alert.alert("Greška", "Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setIsLoading(false);
    }
  };

  const performUnfollow = async () => {
    setIsLoading(true);
    try {
      await unfollowClub(clubId);

      setIsFollowing(false);
      onFollowChange?.(false);

      // Optimistically update following count
      updateFollowingCount(-1);

      // Optimistically remove from following list
      queryClient.setQueryData(["userFollowing"], (oldData: any) => {
        console.log(
          "[ClubFollowButton] Removing club from cache",
          clubId,
          oldData,
        );
        if (!oldData) return [];
        const newData = oldData.filter((item: any) => item.id !== clubId);
        console.log("[ClubFollowButton] New cache data", newData);
        return newData;
      });

      // Force refetch to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["userFollowing"] });

      // Refresh current user profile to update following_count from database
      await refreshProfile();

      // Invalidate other queries
      queryClient.invalidateQueries({ queryKey: ["clubFollowStatus", clubId] });
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    } catch (error: any) {
      console.error("Error unfollowing club:", error);
      Alert.alert("Greška", "Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "text") {
    return (
      <Pressable
        onPress={handleFollowToggle}
        disabled={isLoading}
        style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <Text style={styles.textButtonLabel}>
            {isFollowing ? "Otprati" : "Prati"}
          </Text>
        )}
      </Pressable>
    );
  }

  if (variant === "small") {
    return (
      <Pressable
        onPress={handleFollowToggle}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.smallButton,
          isFollowing ? styles.followingButtonSmall : styles.followButtonSmall,
          pressed && styles.pressed,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={isFollowing ? colors.textSecondary : "#111111"}
          />
        ) : (
          <Text
            style={[
              styles.smallButtonText,
              isFollowing ? styles.followingText : styles.followText,
            ]}
          >
            {isFollowing ? "Otprati" : "Prati"}
          </Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handleFollowToggle}
      disabled={isLoading}
      style={({ pressed }) => [
        styles.button,
        isFollowing ? styles.followingButton : styles.followButton,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.buttonContent}>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={isFollowing ? colors.textSecondary : "#111111"}
          />
        ) : (
          <>
            {isFollowing ? (
              <>
                <Ionicons
                  name="remove-circle-outline"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={styles.followingButtonText}>Otprati</Text>
              </>
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={18} color="#111111" />
                <Text style={styles.followButtonText}>Prati</Text>
              </>
            )}
          </>
        )}
      </View>
    </Pressable>
  );
};

const createStyles = (colors: any, fonts: any) =>
  StyleSheet.create({
    button: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 24,
      minWidth: 120,
      alignItems: "center",
      justifyContent: "center",
    },
    followButton: {
      backgroundColor: colors.accent,
    },
    followingButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    followButtonText: {
      color: "#111111",
      fontSize: 15,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
    },
    followingButtonText: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
    },
    smallButton: {
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 16,
      minWidth: 80,
      alignItems: "center",
      justifyContent: "center",
    },
    followButtonSmall: {
      backgroundColor: colors.accent,
    },
    followingButtonSmall: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    smallButtonText: {
      fontSize: 13,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
    },
    followText: {
      color: "#111111",
    },
    followingText: {
      color: colors.textSecondary,
    },
    pressed: {
      opacity: 0.7,
    },
    textButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    textButtonLabel: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
    },
  });

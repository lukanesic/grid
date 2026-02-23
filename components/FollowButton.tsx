import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
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

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  variant?: "default" | "small" | "text";
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  isFollowing: initialIsFollowing,
  onFollowChange,
  variant = "default",
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { colors, fonts } = useTheme();
  const { refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const styles = createStyles(colors, fonts);

  const handleFollowToggle = async () => {
    if (isLoading) return;

    if (isFollowing) {
      // Show confirmation for unfollow
      Alert.alert(
        "Otprati korisnika",
        "Da li ste sigurni da želite da otpratite ovog korisnika?",
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
      const { data, error } = await supabase.rpc("follow_user", {
        target_user_id: userId,
      });

      if (error) throw error;

      if (data && !data.success) {
        Alert.alert("Greška", data.error || "Nije moguće pratiti korisnika");
        return;
      }

      setIsFollowing(true);
      onFollowChange?.(true);

      // Refresh current user profile to update following_count
      await refreshProfile();

      // Invalidate queries to refresh counts
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
    } catch (error: any) {
      console.error("Error following user:", error);
      Alert.alert("Greška", "Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setIsLoading(false);
    }
  };

  const performUnfollow = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("unfollow_user", {
        target_user_id: userId,
      });

      if (error) throw error;

      if (data && !data.success) {
        Alert.alert("Greška", data.error || "Nije moguće otpratiti korisnika");
        return;
      }

      setIsFollowing(false);
      onFollowChange?.(false);

      // Refresh current user profile to update following_count
      await refreshProfile();

      // Invalidate queries to refresh counts
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
    } catch (error: any) {
      console.error("Error unfollowing user:", error);
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
                  name="person-remove"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={styles.followingButtonText}>Otprati</Text>
              </>
            ) : (
              <>
                <Ionicons name="person-add" size={18} color="#111111" />
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
    pressed: {
      opacity: 0.7,
    },
  });

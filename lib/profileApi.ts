import { Profile } from "../types/profile";
import { supabase } from "./supabase";

export interface SuggestedPlayer extends Profile {
  is_following: boolean;
}

/**
 * Fetch suggested players (random profiles excluding current user)
 */
export async function fetchSuggestedPlayers(
  limit: number = 10,
): Promise<SuggestedPlayer[]> {
  // Get current user ID
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  // Fetch random profiles excluding current user
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", currentUserId || "")
    .limit(limit);

  if (error) {
    console.error("Error fetching suggested players:", error);
    throw new Error(`Failed to fetch suggested players: ${error.message}`);
  }

  const profiles = data || [];

  // Check which players the current user is following
  if (!currentUserId || profiles.length === 0) {
    return profiles.map((p) => ({ ...p, is_following: false }));
  }

  const profileIds = profiles.map((p) => p.id);
  const { data: followingData } = await supabase
    .from("followers")
    .select("following_id")
    .eq("follower_id", currentUserId)
    .in("following_id", profileIds);

  const followingSet = new Set(followingData?.map((f) => f.following_id) || []);

  return profiles.map((profile) => ({
    ...profile,
    is_following: followingSet.has(profile.id),
  }));
}

/**
 * Fetch top players (sorted by rating/score)
 */
export async function fetchTopPlayers(
  limit: number = 10,
): Promise<SuggestedPlayer[]> {
  // Get current user ID
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  // Fetch top players sorted by rating/score, excluding current user
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", currentUserId || "")
    .order("rating", { ascending: false, nullsLast: true })
    .order("score", { ascending: false, nullsLast: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching top players:", error);
    throw new Error(`Failed to fetch top players: ${error.message}`);
  }

  const profiles = data || [];

  // Check which players the current user is following
  if (!currentUserId || profiles.length === 0) {
    return profiles.map((p) => ({ ...p, is_following: false }));
  }

  const profileIds = profiles.map((p) => p.id);
  const { data: followingData } = await supabase
    .from("followers")
    .select("following_id")
    .eq("follower_id", currentUserId)
    .in("following_id", profileIds);

  const followingSet = new Set(followingData?.map((f) => f.following_id) || []);

  return profiles.map((profile) => ({
    ...profile,
    is_following: followingSet.has(profile.id),
  }));
}

/**
 * Search all players by name or username
 */
export async function searchPlayers(
  searchQuery: string,
): Promise<SuggestedPlayer[]> {
  if (!searchQuery.trim()) {
    return [];
  }

  // Get current user ID
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  const query = searchQuery.toLowerCase().trim();

  // Search by full_name or username
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", currentUserId || "")
    .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
    .order("rating", { ascending: false, nullsLast: true })
    .limit(50);

  if (error) {
    console.error("Error searching players:", error);
    throw new Error(`Failed to search players: ${error.message}`);
  }

  const profiles = data || [];

  // Check which players the current user is following
  if (!currentUserId || profiles.length === 0) {
    return profiles.map((p) => ({ ...p, is_following: false }));
  }

  const profileIds = profiles.map((p) => p.id);
  const { data: followingData } = await supabase
    .from("followers")
    .select("following_id")
    .eq("follower_id", currentUserId)
    .in("following_id", profileIds);

  const followingSet = new Set(followingData?.map((f) => f.following_id) || []);

  return profiles.map((profile) => ({
    ...profile,
    is_following: followingSet.has(profile.id),
  }));
}

/**
 * Fetch all players that the current user is following
 */
export async function fetchFollowingPlayers(): Promise<Profile[]> {
  // Get current user ID
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  if (!currentUserId) {
    return [];
  }

  // First, get all following relationships
  const { data: followingData, error: followingError } = await supabase
    .from("followers")
    .select("following_id")
    .eq("follower_id", currentUserId);

  if (followingError) {
    console.error("Error fetching following list:", followingError);
    throw new Error(
      `Failed to fetch following list: ${followingError.message}`,
    );
  }

  if (!followingData || followingData.length === 0) {
    return [];
  }

  const followingIds = followingData.map((f) => f.following_id);

  // Fetch profiles for all following users
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", followingIds)
    .order("full_name", { ascending: true });

  if (profilesError) {
    console.error("Error fetching following profiles:", profilesError);
    throw new Error(
      `Failed to fetch following profiles: ${profilesError.message}`,
    );
  }

  return profiles || [];
}

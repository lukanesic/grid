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

/**
 * Following Item type for combined users and clubs
 */
export interface FollowingItem {
  id: string;
  name: string;
  username?: string;
  avatar: string;
  isConnected: boolean;
  type: "user" | "club";
  followers_count?: number;
  following_count?: number;
  address?: string;
  courts?: number;
}

/**
 * Fetch all users and clubs that the current user is following
 * Returns combined list in a format compatible with SUGGESTED_FRIENDS UI
 */
export async function fetchUserFollowing(
  limit: number = 50,
): Promise<FollowingItem[]> {
  // Get current user ID
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  if (!currentUserId) {
    return [];
  }

  try {
    // 1. Fetch user followings
    const { data: userFollowingData, error: userError } = await supabase
      .from("followers")
      .select(
        `
        created_at,
        profiles!followers_following_id_fkey (
          id,
          full_name,
          avatar_url,
          followers_count,
          following_count
        )
      `,
      )
      .eq("follower_id", currentUserId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (userError) throw userError;

    // 2. Fetch club followings
    const { data: clubFollowsData, error: clubFollowsError } = await supabase
      .from("club_follows")
      .select("club_id, created_at")
      .eq("follower_id", currentUserId)
      .eq("follower_type", "user")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (clubFollowsError) {
      console.error("Error loading club follows:", clubFollowsError);
    }

    // 3. Fetch club details
    let clubFollowingData: any[] = [];
    if (clubFollowsData && clubFollowsData.length > 0) {
      const clubIds = clubFollowsData.map((f) => f.club_id);
      const { data: clubsData, error: clubsError } = await supabase
        .from("clubs")
        .select(
          "id, name, image, address, courts, followers_count, following_count",
        )
        .in("id", clubIds);

      if (clubsError) {
        console.error("Error loading clubs:", clubsError);
      } else if (clubsData) {
        clubFollowingData = clubFollowsData
          .map((follow) => {
            const club = clubsData.find((c) => c.id === follow.club_id);
            return {
              created_at: follow.created_at,
              clubs: club,
            };
          })
          .filter((item) => item.clubs);
      }
    }

    // Map users to FollowingItem format
    const mappedUsers: FollowingItem[] =
      userFollowingData
        ?.filter((item: any) => item.profiles) // Filter out null profiles
        .map((item: any) => ({
          id: item.profiles.id,
          type: "user" as const,
          name: item.profiles.full_name || "Korisnik",
          avatar:
            item.profiles.avatar_url || "https://i.pravatar.cc/150?img=47",
          followers_count: item.profiles.followers_count || 0,
          following_count: item.profiles.following_count || 0,
          isConnected: true, // Always true since these are users we follow
          created_at: item.created_at,
        })) || [];

    // Map clubs to FollowingItem format
    const mappedClubs: FollowingItem[] =
      clubFollowingData?.map((item: any) => ({
        id: item.clubs.id,
        type: "club" as const,
        name: item.clubs.name || "Klub",
        avatar: item.clubs.image || "https://i.pravatar.cc/150?img=1",
        followers_count: item.clubs.followers_count || 0,
        following_count: item.clubs.following_count || 0,
        isConnected: true, // Always true since these are clubs we follow
        address: item.clubs.address,
        courts: item.clubs.courts,
        created_at: item.created_at,
      })) || [];

    // Combine and sort by created_at (most recently followed first)
    const allFollowing = [...mappedUsers, ...mappedClubs].sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return allFollowing;
  } catch (error) {
    console.error("Error loading following:", error);
    return [];
  }
}

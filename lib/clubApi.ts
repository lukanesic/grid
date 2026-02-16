import { Club, ClubFollowStatus } from "../types/club";
import { supabase } from "./supabase";

/**
 * Fetch a single club by ID from the database
 */
export async function fetchClubById(clubId: string): Promise<Club> {
  // Convert string ID to UUID format if needed
  const clubUuid =
    clubId.length < 36
      ? `00000000-0000-0000-0000-${clubId.padStart(12, "0")}`
      : clubId;

  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", clubUuid)
    .single();

  if (error) {
    console.error("Error fetching club:", error);
    throw new Error(`Failed to fetch club: ${error.message}`);
  }

  if (!data) {
    throw new Error("Club not found");
  }

  // Parse JSONB fields
  return {
    ...data,
    amenities: data.amenities || [],
    time_slots: data.time_slots || [],
    // Add camelCase aliases for compatibility
    timeSlots: data.time_slots || [],
    openingHours: data.opening_hours,
  };
}

/**
 * Fetch all clubs from the database
 */
export async function fetchAllClubs(): Promise<Club[]> {
  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching clubs:", error);
    throw new Error(`Failed to fetch clubs: ${error.message}`);
  }

  return (data || []).map((club) => ({
    ...club,
    amenities: club.amenities || [],
    time_slots: club.time_slots || [],
    // Add camelCase aliases for compatibility
    timeSlots: club.time_slots || [],
    openingHours: club.opening_hours,
  }));
}

/**
 * Fetch top clubs from the database (sorted by followers count)
 */
export async function fetchTopClubs(limit: number = 10): Promise<Club[]> {
  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .order("followers_count", { ascending: false, nullsLast: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching top clubs:", error);
    throw new Error(`Failed to fetch top clubs: ${error.message}`);
  }

  return (data || []).map((club) => ({
    ...club,
    amenities: club.amenities || [],
    time_slots: club.time_slots || [],
    // Add camelCase aliases for compatibility
    timeSlots: club.time_slots || [],
    openingHours: club.opening_hours,
  }));
}

/**
 * Get follow status for a club (if user is following, followers/following counts)
 */
export async function fetchClubFollowStatus(
  clubId: string,
): Promise<ClubFollowStatus> {
  // Convert string ID to UUID format if needed
  const clubUuid =
    clubId.length < 36
      ? `00000000-0000-0000-0000-${clubId.padStart(12, "0")}`
      : clubId;

  const { data, error } = await supabase.rpc("check_club_follow_status", {
    target_club_id: clubUuid,
  });

  if (error) {
    console.error("Error fetching follow status:", error);
    throw new Error(`Failed to fetch follow status: ${error.message}`);
  }

  return (
    data || {
      is_following: false,
      followers_count: 0,
      following_count: 0,
    }
  );
}

/**
 * Follow a club
 */
export async function followClub(clubId: string): Promise<void> {
  const clubUuid =
    clubId.length < 36
      ? `00000000-0000-0000-0000-${clubId.padStart(12, "0")}`
      : clubId;

  const { error } = await supabase.rpc("follow_club", {
    target_club_id: clubUuid,
  });

  if (error) {
    console.error("Error following club:", error);
    throw new Error(`Failed to follow club: ${error.message}`);
  }
}

/**
 * Unfollow a club
 */
export async function unfollowClub(clubId: string): Promise<void> {
  const clubUuid =
    clubId.length < 36
      ? `00000000-0000-0000-0000-${clubId.padStart(12, "0")}`
      : clubId;

  const { error } = await supabase.rpc("unfollow_club", {
    target_club_id: clubUuid,
  });

  if (error) {
    console.error("Error unfollowing club:", error);
    throw new Error(`Failed to unfollow club: ${error.message}`);
  }
}

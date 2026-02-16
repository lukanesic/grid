import { supabase } from "./supabase";

/**
 * Create a notification for match joined event
 * Called when a user joins an open match
 */
export async function createMatchJoinedNotification(
  reservationId: string,
  joinedUserId: string,
): Promise<void> {
  console.log("🔔 Creating match joined notification...", {
    reservationId,
    joinedUserId,
  });
  try {
    // Get reservation details
    const { data: reservation, error: reservationError } = await supabase
      .from("court_reservations")
      .select(
        `
        *,
        user:profiles!user_id(full_name, avatar_url),
        court:courts(name, clubs(name))
      `,
      )
      .eq("id", reservationId)
      .single();

    if (reservationError) throw reservationError;

    // Get joined user details
    const { data: joinedUser, error: userError } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", joinedUserId)
      .single();

    if (userError) throw userError;

    // Create notification for the reservation creator
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: reservation.user_id, // Notify the creator
        actor_id: joinedUserId,
        type: "match_joined",
        message: `se priključio vašem meču na ${reservation.court?.clubs?.name}`,
      });

    if (notificationError) throw notificationError;

    console.log("✅ Match joined notification created");
  } catch (error) {
    console.error("Error creating match joined notification:", error);
    // Don't throw - notification failure shouldn't break the main flow
  }
}

/**
 * Create a notification for match left event
 * Called when a user leaves an open match
 */
export async function createMatchLeftNotification(
  reservationId: string,
  leftUserId: string,
): Promise<void> {
  console.log("🔔 Creating match left notification...", {
    reservationId,
    leftUserId,
  });
  try {
    // Get reservation details
    const { data: reservation, error: reservationError } = await supabase
      .from("court_reservations")
      .select(
        `
        *,
        user:profiles!user_id(full_name, avatar_url),
        court:courts(name, clubs(name))
      `,
      )
      .eq("id", reservationId)
      .single();

    if (reservationError) throw reservationError;

    // Get left user details
    const { data: leftUser, error: userError } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", leftUserId)
      .single();

    if (userError) throw userError;

    // Create notification for the reservation creator
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: reservation.user_id, // Notify the creator
        actor_id: leftUserId,
        type: "match_left",
        message: `je napustio vaš meč na ${reservation.court?.clubs?.name}`,
      });

    if (notificationError) throw notificationError;

    console.log("✅ Match left notification created");
  } catch (error) {
    console.error("Error creating match left notification:", error);
    // Don't throw - notification failure shouldn't break the main flow
  }
}

/**
 * Create notifications for match cancelled event
 * Called when reservation creator cancels the match - notifies all participants
 */
export async function createMatchCancelledNotifications(
  reservationId: string,
): Promise<void> {
  console.log("🔔 Creating match cancelled notifications...", {
    reservationId,
  });
  try {
    // Get reservation details with all participants
    const { data: reservation, error: reservationError } = await supabase
      .from("court_reservations")
      .select(
        `
        *,
        user:profiles!user_id(full_name, avatar_url),
        court:courts(name, clubs(name))
      `,
      )
      .eq("id", reservationId)
      .single();

    if (reservationError) throw reservationError;

    // Get all invited players to notify them
    if (
      !reservation.invited_players ||
      reservation.invited_players.length === 0
    ) {
      console.log("No invited players to notify about cancellation");
      return;
    }

    // Create notifications for all invited players
    const notifications = reservation.invited_players.map(
      (playerId: string) => ({
        user_id: playerId,
        actor_id: reservation.user_id,
        type: "match_cancelled",
        message: `je otkazao meč na ${reservation.court?.clubs?.name}`,
      }),
    );

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (notificationError) throw notificationError;

    console.log(
      `✅ Match cancelled notifications created for ${notifications.length} players`,
    );
  } catch (error) {
    console.error("Error creating match cancelled notifications:", error);
    // Don't throw - notification failure shouldn't break the main flow
  }
}

/**
 * Create notification for when a player is removed from match by creator
 * Called when creator removes a player from reservation
 */
export async function createPlayerRemovedNotification(
  reservationId: string,
  removedPlayerId: string,
  creatorId: string,
): Promise<void> {
  console.log("🔔 Creating player removed notification...", {
    reservationId,
    removedPlayerId,
  });
  try {
    // Get reservation details
    const { data: reservation, error: reservationError } = await supabase
      .from("court_reservations")
      .select(
        `
        *,
        user:profiles!user_id(full_name, avatar_url),
        court:courts(name, clubs(name))
      `,
      )
      .eq("id", reservationId)
      .single();

    if (reservationError) throw reservationError;

    // Create notification for the removed player
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: removedPlayerId,
        actor_id: creatorId,
        type: "match_left", // Reusing match_left type for consistency
        message: `vas je uklonio iz meča na ${reservation.court?.clubs?.name}`,
      });

    if (notificationError) throw notificationError;

    console.log("✅ Player removed notification created");
  } catch (error) {
    console.error("Error creating player removed notification:", error);
    // Don't throw - notification failure shouldn't break the main flow
  }
}

/**
 * Create notification for match invite event
 * Called when creator invites a player to a match
 */
export async function createMatchInviteNotification(
  reservationId: string,
  invitedPlayerId: string,
  creatorId: string,
): Promise<void> {
  console.log("🔔 Creating match invite notification...", {
    reservationId,
    invitedPlayerId,
  });
  try {
    // Get reservation details
    const { data: reservation, error: reservationError } = await supabase
      .from("court_reservations")
      .select(
        `
        *,
        user:profiles!user_id(full_name, avatar_url),
        court:courts(name, clubs(name))
      `,
      )
      .eq("id", reservationId)
      .single();

    if (reservationError) throw reservationError;

    // Create notification for the invited player
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: invitedPlayerId,
        actor_id: creatorId,
        type: "match_invite",
        message: `vas je pozvao na meč na ${reservation.court?.clubs?.name}`,
      });

    if (notificationError) throw notificationError;

    console.log("✅ Match invite notification created");
  } catch (error) {
    console.error("Error creating match invite notification:", error);
    // Don't throw - notification failure shouldn't break the main flow
  }
}

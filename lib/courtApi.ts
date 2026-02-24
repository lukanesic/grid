import type {
    Court,
    CourtOperatingHours,
    CourtReservation,
    CourtWithAvailability,
    CreateReservationPayload,
    TimeSlot,
} from "@/types/court";
import {
    createMatchCancelledNotifications,
    createMatchInviteNotification,
    createMatchJoinedNotification,
    createMatchLeftNotification,
    createPlayerRemovedNotification,
} from "./notificationApi";
import { supabase } from "./supabase";

/**
 * Fetch all courts for a specific club
 */
export async function fetchCourtsByClub(clubId: string): Promise<Court[]> {
  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .eq("club_id", clubId)
    .eq("is_available", true)
    .order("court_number", { ascending: true });

  if (error) {
    console.error("Error fetching courts:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Fetch a single court by ID
 */
export async function fetchCourtById(courtId: string): Promise<Court | null> {
  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .eq("id", courtId)
    .single();

  if (error) {
    console.error("Error fetching court:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Fetch operating hours for a specific court
 */
export async function fetchCourtOperatingHours(
  courtId: string,
): Promise<CourtOperatingHours[]> {
  const { data, error } = await supabase
    .from("court_operating_hours")
    .select("*")
    .eq("court_id", courtId)
    .order("day_of_week", { ascending: true });

  if (error) {
    console.error("Error fetching operating hours:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Fetch available time slots for a court on a specific date
 * Simplified implementation without complex RPC functions
 */
export async function fetchAvailableTimeSlots(
  courtId: string,
  date: string, // YYYY-MM-DD format
  slotDurationMinutes: number = 60,
): Promise<TimeSlot[]> {
  try {
    // Get existing reservations for the date
    const { data: reservations, error: reservationsError } = await supabase
      .from("court_reservations")
      .select("start_time, end_time")
      .eq("court_id", courtId)
      .eq("reservation_date", date)
      .in("status", ["confirmed", "pending"]);

    if (reservationsError) throw reservationsError;

    // Generate time slots (simplified - 9 AM to 10 PM)
    const startHour = 9;
    const endHour = 22;
    const slots: TimeSlot[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
      const timeSlot = `${hour.toString().padStart(2, "0")}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;

      // Check if this slot conflicts with any existing reservation
      const isAvailable = !reservations?.some((reservation) => {
        const resStartTime = reservation.start_time.substring(0, 5);
        const resEndTime = reservation.end_time.substring(0, 5);

        // Check for overlap
        return (
          (timeSlot >= resStartTime && timeSlot < resEndTime) ||
          (endTime > resStartTime && endTime <= resEndTime) ||
          (timeSlot <= resStartTime && endTime >= resEndTime)
        );
      });

      slots.push({
        time_slot: timeSlot,
        is_available: isAvailable,
      });
    }

    return slots;
  } catch (error: any) {
    console.error("Error fetching available time slots:", error);

    // Fallback: return basic time slots if there's an error
    const fallbackSlots: TimeSlot[] = [];
    for (let hour = 9; hour < 22; hour++) {
      fallbackSlots.push({
        time_slot: `${hour.toString().padStart(2, "0")}:00`,
        is_available: true,
      });
    }
    return fallbackSlots;
  }
}

/**
 * Check if a specific time slot is available
 */
export async function checkCourtAvailability(
  courtId: string,
  date: string, // YYYY-MM-DD
  startTime: string, // HH:MM
  endTime: string, // HH:MM
): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_court_availability", {
    p_court_id: courtId,
    p_date: date,
    p_start_time: startTime,
    p_end_time: endTime,
  });

  if (error) {
    console.error("Error checking court availability:", error);
    throw new Error(error.message);
  }

  return data === true;
}

/**
 * Fetch courts with their availability for a specific date
 */
export async function fetchCourtsWithAvailability(
  clubId: string,
  date: string,
): Promise<CourtWithAvailability[]> {
  const courts = await fetchCourtsByClub(clubId);

  const courtsWithAvailability = await Promise.all(
    courts.map(async (court) => {
      const availableSlots = await fetchAvailableTimeSlots(court.id, date);
      const operatingHours = await fetchCourtOperatingHours(court.id);

      return {
        ...court,
        available_slots: availableSlots,
        operating_hours: operatingHours,
      };
    }),
  );

  return courtsWithAvailability;
}

/**
 * Check if a court is fully booked for a specific date
 * Returns true if ALL time slots are occupied
 */
export async function isCourtFullyBooked(
  courtId: string,
  date: string,
): Promise<boolean> {
  try {
    const availableSlots = await fetchAvailableTimeSlots(courtId, date);

    // If no slots at all, consider it fully booked
    if (availableSlots.length === 0) {
      return true;
    }

    // Check if all slots are unavailable
    const allBooked = availableSlots.every((slot) => !slot.is_available);
    return allBooked;
  } catch (error) {
    console.error("Error checking if court is fully booked:", error);
    // On error, assume court is not fully booked (fail open)
    return false;
  }
}

/**
 * Fetch courts by club with fully booked status for a specific date
 * Enhances Court objects with is_available flag based on date availability
 */
export async function fetchCourtsByClubWithAvailability(
  clubId: string,
  date: string,
): Promise<Court[]> {
  const courts = await fetchCourtsByClub(clubId);

  const courtsWithStatus = await Promise.all(
    courts.map(async (court) => {
      const fullyBooked = await isCourtFullyBooked(court.id, date);
      return {
        ...court,
        is_available: !fullyBooked,
      };
    }),
  );

  return courtsWithStatus;
}

/**
 * Fetch courts by club with slot count information for a specific date
 * Returns courts with available_slots_count and total_slots_count
 */
export async function fetchCourtsByClubWithSlotCounts(
  clubId: string,
  date: string,
): Promise<import("../types/court").CourtWithSlotCount[]> {
  const courts = await fetchCourtsByClub(clubId);

  const courtsWithSlotCounts = await Promise.all(
    courts.map(async (court) => {
      const timeSlots = await fetchAvailableTimeSlots(court.id, date);
      const availableCount = timeSlots.filter(
        (slot) => slot.is_available,
      ).length;
      const totalCount = timeSlots.length;

      return {
        ...court,
        is_available: availableCount > 0,
        available_slots_count: availableCount,
        total_slots_count: totalCount,
      };
    }),
  );

  return courtsWithSlotCounts;
}

/**
 * Create a new court reservation
 */
export async function createCourtReservation(
  payload: CreateReservationPayload,
): Promise<CourtReservation> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to create a reservation");
  }

  const reservationData = {
    user_id: user.id,
    court_id: payload.court_id,
    reservation_date: payload.reservation_date,
    start_time: payload.start_time,
    end_time: payload.end_time,
    duration_minutes: payload.duration_minutes,
    total_price: payload.total_price || null,
    currency: payload.currency || "RSD",
    notes: payload.notes || null,
    invited_players: payload.invited_players || [],
    is_open_match:
      payload.is_open_match !== undefined ? payload.is_open_match : true,
    match_type: payload.match_type || "friendly",
    status: "confirmed",
    payment_status: "pending",
  };

  const { data, error } = await supabase
    .from("court_reservations")
    .insert(reservationData)
    .select()
    .single();

  if (error) {
    console.error("Error creating reservation:", error);
    throw new Error(error.message);
  }

  // Send invite notifications to each invited player
  if (data && payload.invited_players && payload.invited_players.length > 0) {
    await Promise.all(
      payload.invited_players.map(async (playerId) => {
        try {
          await createMatchInviteNotification(data.id, playerId, user.id);
        } catch (notificationError) {
          console.error(
            "Error sending invite notification:",
            notificationError,
          );
          // Don't throw - reservation is created successfully even if notification fails
        }
      }),
    );
  }

  return data;
}

/**
 * Fetch reservations for a specific court on a date
 */
export async function fetchCourtReservations(
  courtId: string,
  date: string,
): Promise<CourtReservation[]> {
  const { data, error } = await supabase
    .from("court_reservations")
    .select("*")
    .eq("court_id", courtId)
    .eq("reservation_date", date)
    .in("status", ["confirmed", "pending"])
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching reservations:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Fetch user's own reservations
 */
export async function fetchUserReservations(): Promise<CourtReservation[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated");
  }

  const { data, error } = await supabase
    .from("court_reservations")
    .select(
      `
      *,
      court:courts(
        id,
        name,
        club_id,
        clubs(
          id,
          name,
          location,
          address
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .in("status", ["confirmed", "pending", "completed"])
    .order("reservation_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching user reservations:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Cancel a reservation
 */
export async function cancelReservation(
  reservationId: string,
  cancellationReason?: string,
): Promise<void> {
  console.log("❌ cancelReservation called:", reservationId);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated");
  }

  const { error } = await supabase
    .from("court_reservations")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: cancellationReason || null,
    })
    .eq("id", reservationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error cancelling reservation:", error);
    throw new Error(error.message);
  }

  // Notify all invited players about cancellation
  await createMatchCancelledNotifications(reservationId);
}

/**
 * Fetch open reservations (matches looking for players)
 * Returns reservations with status='confirmed' and is_open_match=true from today onwards
 */
export async function fetchOpenReservations(): Promise<any[]> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("court_reservations")
    .select(
      `
      *,
      court:courts(
        id,
        name,
        club_id,
        clubs(
          id,
          name,
          location,
          address
        )
      ),
      user:profiles!user_id(
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .eq("status", "confirmed")
    .eq("is_open_match", true)
    .gte("reservation_date", today)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching open reservations:", error);
    throw new Error(error.message);
  }

  // Fetch invited players for each reservation
  if (data && data.length > 0) {
    const reservationsWithInvited = await Promise.all(
      data.map(async (reservation) => {
        if (
          reservation.invited_players &&
          reservation.invited_players.length > 0
        ) {
          const { data: invitedData, error: invitedError } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", reservation.invited_players);

          if (!invitedError && invitedData) {
            return {
              ...reservation,
              invited_players_profiles: invitedData,
            } as any;
          }
        }
        return reservation as any;
      }),
    );
    return reservationsWithInvited;
  }

  return data || [];
}

/**
 * Fetch closed reservations (closed matches) for current user
 */
export async function fetchClosedReservations(): Promise<any[]> {
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("court_reservations")
    .select(
      `
      *,
      court:courts(
        id,
        name,
        club_id,
        clubs(
          id,
          name,
          location,
          address,
          image
        )
      ),
      user:profiles!user_id(
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .eq("status", "confirmed")
    .eq("is_open_match", false)
    .gte("reservation_date", today)
    .or(`user_id.eq.${user.id},invited_players.cs.{${user.id}}`)
    .order("reservation_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Error fetching closed reservations:", error);
    throw new Error(error.message);
  }

  // Fetch invited players for each reservation
  if (data && data.length > 0) {
    const reservationsWithInvited = await Promise.all(
      data.map(async (reservation) => {
        if (
          reservation.invited_players &&
          reservation.invited_players.length > 0
        ) {
          const { data: invitedData, error: invitedError } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", reservation.invited_players);

          if (!invitedError && invitedData) {
            return {
              ...reservation,
              invited_players_profiles: invitedData,
            } as any;
          }
        }
        return reservation as any;
      }),
    );
    return reservationsWithInvited;
  }

  return data || [];
}

/**
 * Fetch a single reservation by ID with all related data
 */
export async function fetchReservationById(
  reservationId: string,
): Promise<any> {
  const { data, error } = await supabase
    .from("court_reservations")
    .select(
      `
      *,
      court:courts(
        id,
        name,
        surface_type,
        hourly_rate,
        club_id,
        clubs(
          id,
          name,
          location,
          address,
          image
        )
      ),
      user:profiles!user_id(
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .eq("id", reservationId)
    .single();

  if (error) {
    console.error("Error fetching reservation:", error);
    throw new Error(error.message);
  }

  // Fetch invited players if any
  if (data && data.invited_players && data.invited_players.length > 0) {
    const { data: invitedData, error: invitedError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", data.invited_players);

    if (!invitedError && invitedData) {
      data.invited_players_profiles = invitedData;
    }
  }

  return data;
}

/**
 * Join a reservation (add current user to invited_players)
 */
export async function joinReservation(reservationId: string): Promise<void> {
  console.log("🏓 joinReservation called:", reservationId);
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Morate biti prijavljeni");
  }

  // Fetch current reservation
  const { data: reservation, error: fetchError } = await supabase
    .from("court_reservations")
    .select("invited_players, user_id")
    .eq("id", reservationId)
    .single();

  if (fetchError) {
    console.error("Error fetching reservation:", fetchError);
    throw new Error("Nije moguće učitati rezervaciju");
  }

  // Check if user is already in the list
  const currentInvited = reservation.invited_players || [];
  if (currentInvited.includes(user.id)) {
    throw new Error("Već ste se priključili ovom meču");
  }

  // Check if user is the creator
  if (reservation.user_id === user.id) {
    throw new Error("Vi ste kreator ovog meča");
  }

  // Check if there's space (max 4 players total: creator + 3 invited)
  if (currentInvited.length >= 3) {
    throw new Error("Meč je popunjen");
  }

  // Add user to invited_players
  const { error: updateError } = await supabase
    .from("court_reservations")
    .update({
      invited_players: [...currentInvited, user.id],
      updated_at: new Date().toISOString(),
    })
    .eq("id", reservationId);

  if (updateError) {
    console.error("Error joining reservation:", updateError);
    throw new Error("Nije moguće priključiti se meču");
  }

  // Create notification for the reservation creator
  await createMatchJoinedNotification(reservationId, user.id);
}

/**
 * Invite a player to a reservation (only creator can do this)
 */
export async function invitePlayerToReservation(
  reservationId: string,
  playerId: string,
): Promise<void> {
  console.log("📨 invitePlayerToReservation called:", {
    reservationId,
    playerId,
  });
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Morate biti prijavljeni");
  }

  // Fetch current reservation
  const { data: reservation, error: fetchError } = await supabase
    .from("court_reservations")
    .select("invited_players, user_id")
    .eq("id", reservationId)
    .single();

  if (fetchError) {
    console.error("Error fetching reservation:", fetchError);
    throw new Error("Nije moguće učitati rezervaciju");
  }

  // Check if current user is the creator
  if (reservation.user_id !== user.id) {
    throw new Error("Samo kreator može pozvati igrače");
  }

  // Check if player is already invited
  const currentInvited = reservation.invited_players || [];
  if (currentInvited.includes(playerId)) {
    throw new Error("Igrač je već pozvan");
  }

  // Check if trying to invite self
  if (playerId === user.id) {
    throw new Error("Ne možete pozvati sebe");
  }

  // Check if there's space
  if (currentInvited.length >= 3) {
    throw new Error("Meč je popunjen (maksimalno 4 igrača)");
  }

  // Add player to invited_players
  const { error: updateError } = await supabase
    .from("court_reservations")
    .update({
      invited_players: [...currentInvited, playerId],
      updated_at: new Date().toISOString(),
    })
    .eq("id", reservationId);

  if (updateError) {
    console.error("Error inviting player:", updateError);
    throw new Error("Nije moguće pozvati igrača");
  }

  // Create notification for the invited player
  await createMatchInviteNotification(reservationId, playerId, user.id);
}

/**
 * Remove a player from a reservation (only creator can do this)
 */
export async function removePlayerFromReservation(
  reservationId: string,
  playerId: string,
): Promise<void> {
  console.log("🗺️ removePlayerFromReservation called:", {
    reservationId,
    playerId,
  });
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Morate biti prijavljeni");
  }

  // Fetch current reservation
  const { data: reservation, error: fetchError } = await supabase
    .from("court_reservations")
    .select("invited_players, user_id")
    .eq("id", reservationId)
    .single();

  if (fetchError) {
    console.error("Error fetching reservation:", fetchError);
    throw new Error("Nije moguće učitati rezervaciju");
  }

  // Check if current user is the creator
  if (reservation.user_id !== user.id) {
    throw new Error("Samo kreator može ukloniti igrače");
  }

  // Check if player is in the list
  const currentInvited = reservation.invited_players || [];
  if (!currentInvited.includes(playerId)) {
    throw new Error("Igrač nije u meču");
  }

  // Remove player from invited_players
  const updatedInvited = currentInvited.filter((id: string) => id !== playerId);
  const { error: updateError } = await supabase
    .from("court_reservations")
    .update({
      invited_players: updatedInvited,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reservationId);

  if (updateError) {
    console.error("Error removing player:", updateError);
    throw new Error("Nije moguće ukloniti igrača");
  }

  // Create notification for the removed player
  await createPlayerRemovedNotification(reservationId, playerId, user.id);
}

/**
 * Leave a reservation (player removes themselves)
 */
export async function leaveReservation(reservationId: string): Promise<void> {
  console.log("🚪 leaveReservation called:", reservationId);
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Morate biti prijavljeni");
  }

  // Fetch current reservation
  const { data: reservation, error: fetchError } = await supabase
    .from("court_reservations")
    .select("invited_players, user_id")
    .eq("id", reservationId)
    .single();

  if (fetchError) {
    console.error("Error fetching reservation:", fetchError);
    throw new Error("Nije moguće učitati rezervaciju");
  }

  // Check if user is the creator
  if (reservation.user_id === user.id) {
    throw new Error(
      "Kreator ne može napustiti meč. Možete otkazati rezervaciju.",
    );
  }

  // Check if player is in the list
  const currentInvited = reservation.invited_players || [];
  if (!currentInvited.includes(user.id)) {
    throw new Error("Niste član ovog meča");
  }

  // Remove user from invited_players
  const updatedInvited = currentInvited.filter((id: string) => id !== user.id);
  const { error: updateError } = await supabase
    .from("court_reservations")
    .update({
      invited_players: updatedInvited,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reservationId);

  if (updateError) {
    console.error("Error leaving reservation:", updateError);
    throw new Error("Nije moguće napustiti meč");
  }

  // Create notification for the reservation creator
  await createMatchLeftNotification(reservationId, user.id);
}

/**
 * Generate time slots for a given date range (helper for UI)
 * This is a local utility, not a DB call
 */
export function generateTimeSlots(
  startHour: number = 10,
  endHour: number = 22,
  intervalMinutes: number = 60,
): string[] {
  const slots: string[] = [];
  let currentHour = startHour;
  let currentMinute = 0;

  while (currentHour < endHour) {
    const timeString = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;
    slots.push(timeString);

    currentMinute += intervalMinutes;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  return slots;
}

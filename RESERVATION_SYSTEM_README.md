# Court Reservation & Open Matches System

## Overview

Complete implementation of real-time court reservation system with database integration and automatic display of open matches.

## Features Implemented

### 1. **Reservation Creation**

When a user confirms a reservation in `reservationSummary.tsx`:

- Creates reservation in `court_reservations` table via `createCourtReservation()`
- Stores: court_id, user_id, reservation_date, start_time, end_time, duration, price, invited players
- Shows success/error alerts
- Invalidates React Query cache to trigger automatic data refresh
- Redirects back to home screen

### 2. **Real-Time Open Matches Display**

In `SveTabContent.tsx` ("OTVORENI MEČEVI" section):

- Replaced hardcoded `OPEN_MATCHES` with live database queries
- Fetches reservations via `fetchOpenReservations()` every 30 seconds
- Transforms database records to UI format with proper Serbian date/time formatting
- Shows loading spinner while fetching
- Shows empty state if no reservations exist
- Automatically displays newly created matches within 30 seconds

### 3. **API Functions** (`lib/courtApi.ts`)

```typescript
fetchOpenReservations(): Promise<any[]>
// Returns all confirmed reservations from today onwards
// Includes court info, club info, and user info
// Limited to 10 most recent matches
// Ordered by date and time (ascending)
```

### 4. **Data Flow**

1. User creates match → selects club, date, court, time, players
2. Clicks "Potvrdite rezervaciju"
3. `createCourtReservation()` saves to database
4. Query cache invalidated → triggers automatic refetch
5. Home screen refreshes → new match appears in "OTVORENI MEČEVI"
6. Other users see the match within 30 seconds (auto-refresh)

## Files Modified

### `/lib/courtApi.ts`

- ✅ Added `fetchOpenReservations()` function
- Returns reservations with nested court/club/user data
- Filters by status='confirmed' and date >= today

### `/app/(home)/reservationSummary.tsx`

- ✅ Imports `createCourtReservation` and `useQueryClient`
- ✅ Parses time range to extract start_time and end_time
- ✅ Calculates duration in minutes
- ✅ Handles reservation creation with loading state
- ✅ Shows success/error alerts
- ✅ Invalidates `openReservations` and `userReservations` queries
- ✅ Disabled button styling during submission

### `/components/SveTabContent.tsx`

- ✅ Removed hardcoded `OPEN_MATCHES` import
- ✅ Added `useQuery` for `fetchOpenReservations()`
- ✅ Auto-refresh every 30 seconds (`refetchInterval: 30000`)
- ✅ Transform function: `transformReservationToMatch()`
  - Formats dates as "Sri 2. feb · 15:00h ›"
  - Calculates "pre X sati/dana" timestamps
  - Creates participant slots (max 4)
  - Converts price to "X RSD" format
- ✅ Loading state with spinner
- ✅ Empty state with message
- ✅ Preserves existing card UI

## Database Schema

### `court_reservations` Table

```sql
- id: uuid (primary key)
- court_id: uuid (references courts)
- user_id: uuid (references profiles)
- reservation_date: date
- start_time: time
- end_time: time
- duration_minutes: integer
- total_price: numeric
- currency: text
- status: text (confirmed/pending/cancelled/completed)
- invited_players: uuid[] (array of user IDs)
- notes: text
- created_at: timestamp
```

## Time Formatting

### Input Format (from createMatch)

- Single slot: `"14:00"`
- Two consecutive slots: `"14:00 - 16:00"`

### Parsing Logic

```typescript
const [startTime, endTime] = hasRange
  ? time.toString().split(" - ")
  : [time.toString(), ""];

const calculatedEndTime =
  endTime ||
  `${parseInt(startTime.split(":")[0]) + hours}:${startTime.split(":")[1]}`;
```

### Display Format (in open matches)

- Created time: "pre 1 sat", "pre 3 sata", "pre 2 dana"
- Match date: "Sri 2. feb · 15:00h ›"

## Real-Time Updates

### Current Implementation

- Automatic refetch every 30 seconds via React Query's `refetchInterval`
- Cache invalidation on reservation creation
- Stale time: 30 seconds

### Future Enhancement (Optional)

Can add Supabase real-time subscription:

```typescript
supabase
  .channel("reservations")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "court_reservations",
    },
    (payload) => {
      queryClient.invalidateQueries({ queryKey: ["openReservations"] });
    },
  )
  .subscribe();
```

## Testing Checklist

- [x] Create reservation from createMatch flow
- [x] Verify database record created
- [ ] Check reservation appears in "OTVORENI MEČEVI"
- [ ] Verify time display format (HH:MM)
- [ ] Verify price display (RSD)
- [ ] Verify date format (Serbian day/month names)
- [ ] Test empty state when no reservations
- [ ] Test loading state
- [ ] Verify 30-second auto-refresh
- [ ] Test with multiple users (real-time visibility)

## Price Calculation

```typescript
const hours = hasRange ? 2 : 1;
const priceRsd = hourlyRateRsd * hours;
const totalRsd = priceRsd + serviceFeeRsd; // +23 RSD service fee
```

## Match Participants Display

- Position 1: Match creator (from `reservation.user`)
- Position 2-4: Empty slots with "+" icon (join functionality)
- Future: Load actual invited players from `invited_players[]` array

## Notes

1. **Invited Players**: Currently passed to DB but not displayed in match cards yet
2. **Match Join**: Button exists but functionality not implemented
3. **User Profiles**: Need avatar_url and skill level from profiles table
4. **Distance Calculation**: Not yet implemented (shows "Klub · Teren" instead)
5. **Match Filtering**: Shows all open reservations, no filters by level/distance yet

## Next Steps (Future)

1. Implement join match functionality (update `invited_players` array)
2. Add real-time Supabase subscription for instant updates
3. Display actual invited players instead of placeholder slots
4. Add skill level from user profiles
5. Calculate club distance from user location
6. Add filters: by level, by distance, by surface type
7. Create match details screen (matchScreen.tsx)
8. Add leave match functionality
9. Add match chat/messaging
10. Implement payment integration

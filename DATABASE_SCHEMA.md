# Grid - Kompletna Arhitektura Baze Podataka

## 📋 Pregled Modula

- **Profiles** - Korisnički profili (već postoji)
- **Social** - Followers, Following, Friendships, Blocked Users
- **Clubs** - Klubovi, članstvo, praćenje
- **Matches** - Mečevi, učesnici, scoring
- **Chat** - Konverzacije, poruke, typing indicators
- **Notifications** - Sistem notifikacija
- **Courts** - Tereni i rezervacije
- **Tournaments** - Turniri i učesnici

---

## 1️⃣ SOCIAL MODULE - Followers, Friends, Blocked

### 1.1 Followers/Following Tabela

```sql
-- Many-to-many self-referencing table for following relationships
CREATE TABLE followers (
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Indexes for performance
CREATE INDEX idx_followers_follower ON followers(follower_id);
CREATE INDEX idx_followers_following ON followers(following_id);
CREATE INDEX idx_followers_created ON followers(created_at DESC);

-- RLS Policies
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view followers"
  ON followers FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON followers FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON followers FOR DELETE
  USING (auth.uid() = follower_id);
```

### 1.2 Friendships Tabela (Mutual Following)

```sql
-- Friendships are bidirectional relationships
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_friendship CHECK (user1_id != user2_id),
  CONSTRAINT ordered_users CHECK (user1_id < user2_id), -- Ensures no duplicates
  UNIQUE(user1_id, user2_id)
);

-- Indexes
CREATE INDEX idx_friendships_user1 ON friendships(user1_id);
CREATE INDEX idx_friendships_user2 ON friendships(user2_id);
CREATE INDEX idx_friendships_status ON friendships(status);
CREATE INDEX idx_friendships_created ON friendships(created_at DESC);

-- RLS Policies
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  USING (auth.uid() IN (user1_id, user2_id));

CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = requested_by AND auth.uid() IN (user1_id, user2_id));

CREATE POLICY "Users can accept/reject friend requests"
  ON friendships FOR UPDATE
  USING (auth.uid() IN (user1_id, user2_id) AND auth.uid() != requested_by);

CREATE POLICY "Users can delete friendships"
  ON friendships FOR DELETE
  USING (auth.uid() IN (user1_id, user2_id));
```

### 1.3 Blocked Users Tabela

```sql
CREATE TABLE blocked_users (
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- Indexes
CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_id);

-- RLS Policies
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their blocks"
  ON blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
  ON blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock"
  ON blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);
```

---

## 2️⃣ CLUBS MODULE

### 2.1 Clubs Tabela

```sql
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  logo_url TEXT,
  cover_photo_url TEXT,
  website TEXT,
  phone_number TEXT,
  email TEXT,
  founded_year INT,
  member_count INT NOT NULL DEFAULT 0,
  follower_count INT NOT NULL DEFAULT 0,
  court_count INT NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clubs_name ON clubs(name);
CREATE INDEX idx_clubs_city ON clubs(city);
CREATE INDEX idx_clubs_created_by ON clubs(created_by);
CREATE INDEX idx_clubs_created_at ON clubs(created_at DESC);

-- RLS Policies
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public clubs"
  ON clubs FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create clubs"
  ON clubs FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Club creators can update"
  ON clubs FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Club creators can delete"
  ON clubs FOR DELETE
  USING (auth.uid() = created_by);
```

### 2.2 Club Members Tabela

```sql
CREATE TABLE club_members (
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'coach', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (club_id, user_id)
);

-- Indexes
CREATE INDEX idx_club_members_club ON club_members(club_id);
CREATE INDEX idx_club_members_user ON club_members(user_id);
CREATE INDEX idx_club_members_role ON club_members(role);

-- RLS Policies
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view club members"
  ON club_members FOR SELECT
  USING (true);

CREATE POLICY "Club admins can add members"
  ON club_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.club_id = club_members.club_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can leave clubs"
  ON club_members FOR DELETE
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM club_members cm
    WHERE cm.club_id = club_members.club_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('owner', 'admin')
  ));
```

### 2.3 Club Followers Tabela

```sql
CREATE TABLE club_followers (
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (club_id, user_id)
);

-- Indexes
CREATE INDEX idx_club_followers_club ON club_followers(club_id);
CREATE INDEX idx_club_followers_user ON club_followers(user_id);

-- RLS Policies
ALTER TABLE club_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view club followers"
  ON club_followers FOR SELECT
  USING (true);

CREATE POLICY "Users can follow clubs"
  ON club_followers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow clubs"
  ON club_followers FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 3️⃣ MATCHES MODULE

### 3.1 Matches Tabela

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_type TEXT NOT NULL CHECK (match_type IN ('singles', 'doubles')),
  match_format TEXT NOT NULL CHECK (match_format IN ('friendly', 'competitive', 'tournament', 'league')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),

  -- Location
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  court_id UUID, -- Will reference courts table
  location_name TEXT,

  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INT,

  -- Scoring
  scoring_type TEXT NOT NULL DEFAULT 'standard' CHECK (scoring_type IN ('standard', 'no_ad', 'tiebreak')),
  sets_to_win INT NOT NULL DEFAULT 2 CHECK (sets_to_win IN (1, 2, 3)),

  -- Teams (for doubles)
  team1_name TEXT,
  team2_name TEXT,

  -- Winner
  winning_team INT CHECK (winning_team IN (1, 2)),

  -- Stats
  is_public BOOLEAN NOT NULL DEFAULT true,
  view_count INT NOT NULL DEFAULT 0,

  -- Meta
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_scheduled_at ON matches(scheduled_at DESC);
CREATE INDEX idx_matches_club ON matches(club_id);
CREATE INDEX idx_matches_created_by ON matches(created_by);
CREATE INDEX idx_matches_type_format ON matches(match_type, match_format);

-- RLS Policies
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public matches"
  ON matches FOR SELECT
  USING (is_public = true OR created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM match_participants mp
    WHERE mp.match_id = matches.id AND mp.user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create matches"
  ON matches FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Match creators and participants can update"
  ON matches FOR UPDATE
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM match_participants mp
    WHERE mp.match_id = matches.id AND mp.user_id = auth.uid()
  ));
```

### 3.2 Match Participants Tabela

```sql
CREATE TABLE match_participants (
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team INT NOT NULL CHECK (team IN (1, 2)),
  position INT CHECK (position IN (1, 2)), -- For doubles: 1=server side, 2=returner side
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (match_id, user_id)
);

-- Indexes
CREATE INDEX idx_match_participants_match ON match_participants(match_id);
CREATE INDEX idx_match_participants_user ON match_participants(user_id);
CREATE INDEX idx_match_participants_status ON match_participants(status);

-- RLS Policies
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view match participants"
  ON match_participants FOR SELECT
  USING (true);

CREATE POLICY "Match creators can add participants"
  ON match_participants FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM matches m WHERE m.id = match_id AND m.created_by = auth.uid())
  );

CREATE POLICY "Participants can update their status"
  ON match_participants FOR UPDATE
  USING (auth.uid() = user_id);
```

### 3.3 Match Sets Tabela (Scoring)

```sql
CREATE TABLE match_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  set_number INT NOT NULL CHECK (set_number > 0),
  team1_games INT NOT NULL DEFAULT 0,
  team2_games INT NOT NULL DEFAULT 0,
  team1_tiebreak_points INT DEFAULT 0,
  team2_tiebreak_points INT DEFAULT 0,
  is_tiebreak BOOLEAN NOT NULL DEFAULT false,
  winner_team INT CHECK (winner_team IN (1, 2)),
  completed_at TIMESTAMPTZ,
  UNIQUE(match_id, set_number)
);

-- Indexes
CREATE INDEX idx_match_sets_match ON match_sets(match_id);

-- RLS Policies
ALTER TABLE match_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view match sets"
  ON match_sets FOR SELECT
  USING (true);

CREATE POLICY "Match participants can update sets"
  ON match_sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM match_participants mp
      WHERE mp.match_id = match_sets.match_id AND mp.user_id = auth.uid()
    )
  );

CREATE POLICY "Match participants can update sets score"
  ON match_sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM match_participants mp
      WHERE mp.match_id = match_sets.match_id AND mp.user_id = auth.uid()
    )
  );
```

---

## 4️⃣ CHAT MODULE

### 4.1 Conversations Tabela

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'match')),
  title TEXT, -- For group chats
  avatar_url TEXT, -- For group chats
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE, -- If tied to a match
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_match ON conversations(match_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC NULLS LAST);

-- RLS Policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Participants can update conversations"
  ON conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
    )
  );
```

### 4.2 Conversation Participants Tabela

```sql
CREATE TABLE conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  last_read_at TIMESTAMPTZ,
  unread_count INT NOT NULL DEFAULT 0,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Indexes
CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_unread ON conversation_participants(user_id, unread_count) WHERE unread_count > 0;

-- RLS Policies
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view conversation membership"
  ON conversation_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
    AND cp.user_id = auth.uid()
    AND cp.role IN ('owner', 'admin')
  ));

CREATE POLICY "Users can update their participation"
  ON conversation_participants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave conversations"
  ON conversation_participants FOR DELETE
  USING (auth.uid() = user_id);
```

### 4.3 Messages Tabela

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Content
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'location', 'match_invite', 'system')),
  media_url TEXT,
  media_thumbnail_url TEXT,
  media_metadata JSONB, -- File size, dimensions, duration, etc.

  -- Match invite specific
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,

  -- Status
  is_edited BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- RLS Policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Senders can update their messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Senders can delete their messages"
  ON messages FOR DELETE
  USING (auth.uid() = sender_id);
```

### 4.4 Message Read Receipts Tabela

```sql
CREATE TABLE message_read_receipts (
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

-- Indexes
CREATE INDEX idx_message_read_receipts_message ON message_read_receipts(message_id);
CREATE INDEX idx_message_read_receipts_user ON message_read_receipts(user_id);

-- RLS Policies
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view read receipts in their conversations"
  ON message_read_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = message_read_receipts.message_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON message_read_receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 4.5 Typing Indicators Tabela (Realtime)

```sql
CREATE TABLE typing_indicators (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 seconds'),
  PRIMARY KEY (conversation_id, user_id)
);

-- Indexes
CREATE INDEX idx_typing_indicators_conversation ON typing_indicators(conversation_id);
CREATE INDEX idx_typing_indicators_expires ON typing_indicators(expires_at);

-- RLS Policies
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view typing indicators"
  ON typing_indicators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = typing_indicators.conversation_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can set their typing status"
  ON typing_indicators FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their typing status"
  ON typing_indicators FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can clear their typing status"
  ON typing_indicators FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 5️⃣ NOTIFICATIONS MODULE

### 5.1 Notifications Tabela

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Type and content
  type TEXT NOT NULL CHECK (type IN (
    'follow', 'friend_request', 'friend_accept',
    'match_invite', 'match_reminder', 'match_started', 'match_completed',
    'message', 'club_invite', 'club_announcement',
    'tournament_invite', 'court_reminder',
    'achievement', 'system'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,

  -- Related entities (nullable - depends on type)
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,

  -- Action data (for deep linking)
  action_url TEXT,
  action_data JSONB,

  -- Status
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_from_user ON notifications(from_user_id);
CREATE INDEX idx_notifications_match ON notifications(match_id);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true); -- Will be called from triggers/functions

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 6️⃣ COURTS MODULE

### 6.1 Courts Tabela

```sql
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  court_number INT,
  surface_type TEXT NOT NULL CHECK (surface_type IN ('hard', 'clay', 'grass', 'carpet', 'indoor_hard')),
  is_indoor BOOLEAN NOT NULL DEFAULT false,
  has_lights BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  hourly_rate DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  description TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_courts_club ON courts(club_id);
CREATE INDEX idx_courts_surface ON courts(surface_type);
CREATE INDEX idx_courts_available ON courts(is_available);

-- RLS Policies
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available courts"
  ON courts FOR SELECT
  USING (is_available = true OR EXISTS (
    SELECT 1 FROM club_members cm
    WHERE cm.club_id = courts.club_id AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Club admins can manage courts"
  ON courts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.club_id = courts.club_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
    )
  );
```

### 6.2 Court Reservations Tabela

```sql
CREATE TABLE court_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,

  -- Time slot
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,

  -- Payment
  total_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'refunded')),

  -- Status
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent overlapping reservations
  CONSTRAINT no_overlap EXCLUDE USING gist (
    court_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status NOT IN ('cancelled'))
);

-- Indexes
CREATE INDEX idx_court_reservations_court ON court_reservations(court_id);
CREATE INDEX idx_court_reservations_user ON court_reservations(user_id);
CREATE INDEX idx_court_reservations_match ON court_reservations(match_id);
CREATE INDEX idx_court_reservations_time ON court_reservations(start_time, end_time);
CREATE INDEX idx_court_reservations_status ON court_reservations(status);

-- RLS Policies
ALTER TABLE court_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view confirmed reservations"
  ON court_reservations FOR SELECT
  USING (status = 'confirmed' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create reservations"
  ON court_reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their reservations"
  ON court_reservations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel their reservations"
  ON court_reservations FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 7️⃣ TOURNAMENTS MODULE

### 7.1 Tournaments Tabela

```sql
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tournament_type TEXT NOT NULL CHECK (tournament_type IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
  match_format TEXT NOT NULL CHECK (match_format IN ('singles', 'doubles')),

  -- Organization
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Details
  max_participants INT NOT NULL,
  current_participants INT NOT NULL DEFAULT 0,
  entry_fee DECIMAL(10, 2),
  prize_pool DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',

  -- Dates
  registration_start TIMESTAMPTZ NOT NULL,
  registration_end TIMESTAMPTZ NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled')),

  -- Images
  banner_url TEXT,
  logo_url TEXT,

  -- Visibility
  is_public BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_start_date ON tournaments(start_date DESC);
CREATE INDEX idx_tournaments_club ON tournaments(club_id);
CREATE INDEX idx_tournaments_organizer ON tournaments(organizer_id);

-- RLS Policies
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public tournaments"
  ON tournaments FOR SELECT
  USING (is_public = true OR organizer_id = auth.uid());

CREATE POLICY "Authenticated users can create tournaments"
  ON tournaments FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update tournaments"
  ON tournaments FOR UPDATE
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete tournaments"
  ON tournaments FOR DELETE
  USING (auth.uid() = organizer_id);
```

### 7.2 Tournament Participants Tabela

```sql
CREATE TABLE tournament_participants (
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- For doubles
  seed INT,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'withdrawn', 'eliminated')),
  final_position INT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tournament_id, user_id)
);

-- Indexes
CREATE INDEX idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_user ON tournament_participants(user_id);
CREATE INDEX idx_tournament_participants_status ON tournament_participants(status);

-- RLS Policies
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournament participants"
  ON tournament_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can register for tournaments"
  ON tournament_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can withdraw from tournaments"
  ON tournament_participants FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 8️⃣ TRIGGER FUNCTIONS & AUTOMATION

### 8.1 Update Timestamps

```sql
-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON courts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_court_reservations_updated_at BEFORE UPDATE ON court_reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 8.2 Update Follower Count

```sql
-- Update follower counts in profiles
CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following_count for follower
    UPDATE profiles SET following_count = following_count + 1
    WHERE id = NEW.follower_id;

    -- Increment followers_count for followed user
    UPDATE profiles SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement counts
    UPDATE profiles SET following_count = GREATEST(0, following_count - 1)
    WHERE id = OLD.follower_id;

    UPDATE profiles SET followers_count = GREATEST(0, followers_count - 1)
    WHERE id = OLD.following_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follower_count
  AFTER INSERT OR DELETE ON followers
  FOR EACH ROW EXECUTE FUNCTION update_follower_count();
```

### 8.3 Update Club Counts

```sql
-- Update member and follower counts for clubs
CREATE OR REPLACE FUNCTION update_club_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'club_members' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE clubs SET member_count = member_count + 1 WHERE id = NEW.club_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE clubs SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.club_id;
    END IF;
  END IF;

  IF TG_TABLE_NAME = 'club_followers' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE clubs SET follower_count = follower_count + 1 WHERE id = NEW.club_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE clubs SET follower_count = GREATEST(0, follower_count - 1) WHERE id = OLD.club_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_club_member_count
  AFTER INSERT OR DELETE ON club_members
  FOR EACH ROW EXECUTE FUNCTION update_club_counts();

CREATE TRIGGER trigger_update_club_follower_count
  AFTER INSERT OR DELETE ON club_followers
  FOR EACH ROW EXECUTE FUNCTION update_club_counts();
```

### 8.4 Update Conversation Last Message

```sql
-- Update conversation's last message info
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NOT NEW.is_deleted THEN
    UPDATE conversations
    SET
      last_message_at = NEW.created_at,
      last_message_preview = LEFT(NEW.content, 100),
      updated_at = NOW()
    WHERE id = NEW.conversation_id;

    -- Increment unread count for all participants except sender
    UPDATE conversation_participants
    SET unread_count = unread_count + 1
    WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();
```

### 8.5 Create Notification on Follow

```sql
-- Automatically create notification when someone follows you
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    body,
    from_user_id
  )
  SELECT
    NEW.following_id,
    'follow',
    'Novi pratilac',
    p.full_name || ' je počeo da te prati',
    NEW.follower_id
  FROM profiles p
  WHERE p.id = NEW.follower_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_follow_notification
  AFTER INSERT ON followers
  FOR EACH ROW EXECUTE FUNCTION create_follow_notification();
```

### 8.6 Create Notification on Friend Request

```sql
CREATE OR REPLACE FUNCTION create_friendship_notification()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
BEGIN
  -- Determine who receives the notification
  IF NEW.requested_by = NEW.user1_id THEN
    recipient_id := NEW.user2_id;
  ELSE
    recipient_id := NEW.user1_id;
  END IF;

  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    -- Friend request notification
    INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      from_user_id
    )
    SELECT
      recipient_id,
      'friend_request',
      'Zahtev za prijateljstvo',
      p.full_name || ' ti je poslao zahtev za prijateljstvo',
      NEW.requested_by
    FROM profiles p
    WHERE p.id = NEW.requested_by;

  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    -- Friend request accepted notification
    INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      from_user_id
    )
    SELECT
      NEW.requested_by,
      'friend_accept',
      'Prihvaćen zahtev',
      p.full_name || ' je prihvatio tvoj zahtev za prijateljstvo',
      recipient_id
    FROM profiles p
    WHERE p.id = recipient_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_friendship_notification
  AFTER INSERT OR UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION create_friendship_notification();
```

---

## 9️⃣ RPC FUNCTIONS (za TypeScript client)

### 9.1 Get User Feed (Followers' Activity)

```sql
CREATE OR REPLACE FUNCTION get_user_feed(user_id_param UUID, limit_count INT DEFAULT 20, offset_count INT DEFAULT 0)
RETURNS TABLE (
  match_id UUID,
  match_type TEXT,
  scheduled_at TIMESTAMPTZ,
  participant_names TEXT[],
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.match_type,
    m.scheduled_at,
    ARRAY_AGG(p.full_name) as participant_names,
    m.created_at
  FROM matches m
  JOIN match_participants mp ON mp.match_id = m.id
  JOIN profiles p ON p.id = mp.user_id
  WHERE mp.user_id IN (
    SELECT following_id FROM followers WHERE follower_id = user_id_param
  )
  AND m.is_public = true
  GROUP BY m.id
  ORDER BY m.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_feed(UUID, INT, INT) TO authenticated;
```

### 9.2 Search Users

```sql
CREATE OR REPLACE FUNCTION search_users(search_query TEXT, limit_count INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  avatar_url TEXT,
  location TEXT,
  rating DECIMAL,
  followers_count INT,
  is_following BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.avatar_url,
    p.location,
    p.rating,
    p.followers_count,
    EXISTS (
      SELECT 1 FROM followers f
      WHERE f.follower_id = auth.uid() AND f.following_id = p.id
    ) as is_following
  FROM profiles p
  WHERE
    p.full_name ILIKE '%' || search_query || '%'
    AND p.id != auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users bu
      WHERE (bu.blocker_id = auth.uid() AND bu.blocked_id = p.id)
      OR (bu.blocker_id = p.id AND bu.blocked_id = auth.uid())
    )
  ORDER BY p.followers_count DESC, p.rating DESC NULLS LAST
  LIMIT limit_count;
END;
$$;

GRANT EXECUTE ON FUNCTION search_users(TEXT, INT) TO authenticated;
```

### 9.3 Get or Create Direct Conversation

```sql
CREATE OR REPLACE FUNCTION get_or_create_direct_conversation(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conversation_id_result UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();

  -- Check if conversation already exists
  SELECT c.id INTO conversation_id_result
  FROM conversations c
  WHERE c.type = 'direct'
  AND EXISTS (
    SELECT 1 FROM conversation_participants cp1
    WHERE cp1.conversation_id = c.id AND cp1.user_id = current_user_id
  )
  AND EXISTS (
    SELECT 1 FROM conversation_participants cp2
    WHERE cp2.conversation_id = c.id AND cp2.user_id = other_user_id
  )
  AND (
    SELECT COUNT(*) FROM conversation_participants cp
    WHERE cp.conversation_id = c.id
  ) = 2
  LIMIT 1;

  -- If not found, create new conversation
  IF conversation_id_result IS NULL THEN
    INSERT INTO conversations (type, created_by)
    VALUES ('direct', current_user_id)
    RETURNING id INTO conversation_id_result;

    -- Add both participants
    INSERT INTO conversation_participants (conversation_id, user_id, role)
    VALUES
      (conversation_id_result, current_user_id, 'member'),
      (conversation_id_result, other_user_id, 'member');
  END IF;

  RETURN conversation_id_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_or_create_direct_conversation(UUID) TO authenticated;
```

### 9.4 Get Unread Counts Summary

```sql
CREATE OR REPLACE FUNCTION get_unread_counts()
RETURNS TABLE (
  total_messages INT,
  total_notifications INT,
  total_friend_requests INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COALESCE(SUM(unread_count), 0)::INT FROM conversation_participants WHERE user_id = auth.uid()),
    (SELECT COUNT(*)::INT FROM notifications WHERE user_id = auth.uid() AND is_read = false),
    (SELECT COUNT(*)::INT FROM friendships WHERE status = 'pending' AND requested_by != auth.uid() AND (user1_id = auth.uid() OR user2_id = auth.uid()));
END;
$$;

GRANT EXECUTE ON FUNCTION get_unread_counts() TO authenticated;
```

### 9.5 Get Match Statistics

```sql
CREATE OR REPLACE FUNCTION get_user_match_stats(user_id_param UUID)
RETURNS TABLE (
  total_matches INT,
  wins INT,
  losses INT,
  win_rate DECIMAL,
  total_sets_won INT,
  total_sets_lost INT,
  favorite_surface TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_matches AS (
    SELECT
      m.id,
      m.winning_team,
      mp.team,
      c.surface_type
    FROM matches m
    JOIN match_participants mp ON mp.match_id = m.id
    LEFT JOIN courts c ON c.id = m.court_id
    WHERE mp.user_id = user_id_param AND m.status = 'completed'
  ),
  match_stats AS (
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN winning_team = team THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN winning_team != team THEN 1 ELSE 0 END) as losses
    FROM user_matches
  ),
  surface_stats AS (
    SELECT surface_type, COUNT(*) as count
    FROM user_matches
    WHERE surface_type IS NOT NULL
    GROUP BY surface_type
    ORDER BY count DESC
    LIMIT 1
  )
  SELECT
    match_stats.total::INT,
    match_stats.wins::INT,
    match_stats.losses::INT,
    CASE
      WHEN match_stats.total > 0 THEN ROUND((match_stats.wins::DECIMAL / match_stats.total) * 100, 2)
      ELSE 0
    END,
    0::INT as total_sets_won, -- Can be calculated from match_sets table
    0::INT as total_sets_lost,
    surface_stats.surface_type
  FROM match_stats, surface_stats;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_match_stats(UUID) TO authenticated;
```

---

## 🔟 DODATNE KOLONE ZA `profiles` TABELU

```sql
-- Add social counts (if not already exist)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS followers_count INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS friends_count INT NOT NULL DEFAULT 0;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_followers_count ON profiles(followers_count DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON profiles(rating DESC NULLS LAST);
```

---

## ✅ PROVERA - Da li je sve postavljeno?

Posle izvršavanja svih SQL blokova, proveri da su sve tabele kreirane:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Trebalo bi da vidiš:

- ✅ profiles
- ✅ followers
- ✅ friendships
- ✅ blocked_users
- ✅ clubs
- ✅ club_members
- ✅ club_followers
- ✅ matches
- ✅ match_participants
- ✅ match_sets
- ✅ conversations
- ✅ conversation_participants
- ✅ messages
- ✅ message_read_receipts
- ✅ typing_indicators
- ✅ notifications
- ✅ courts
- ✅ court_reservations
- ✅ tournaments
- ✅ tournament_participants

---

## 🚀 NEXT STEPS

1. **Izvrši sve SQL blokove** u Supabase SQL Editor (section po section)
2. **Proveri RLS policies** - da li rade kako treba
3. **Kreiraj TypeScript types** za sve nove tabele
4. **Implementiraj UI features** korak po korak:
   - Chat sistem
   - Match creation & management
   - Social features (follow/unfollow)
   - Club management
   - Court reservations
   - Notifications

Da li da nastavim sa TypeScript type definitions ili sa konkretnim UI komponentama?

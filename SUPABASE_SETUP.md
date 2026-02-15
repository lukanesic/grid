# Supabase Database Setup - Profile Table

## 1. Kreiranje `profiles` tabele

U Supabase SQL Editor-u izvrši sledeći SQL query:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone_number TEXT,
  birth_date DATE,
  location TEXT,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'coach', 'admin')),
  score INT,
  rating DECIMAL(2,1),
  matches_played INT NOT NULL DEFAULT 0,
  win_rate DECIMAL(5,2),
  avatar_url TEXT,
  profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Authenticated users can view all profiles (social network)
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policy: Users can update their own profile only
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policy: Allow insert during registration (via service role or authenticated user)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster email lookups
CREATE INDEX profiles_email_idx ON profiles(email);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, profile_completed)
  VALUES (NEW.id, NEW.email, 'player', FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that runs after user creation (automatically creates empty profile)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## 2. Provera

Nakon izvršavanja SQL-a, proveri:

1. Da li tabela `profiles` postoji u Table Editor-u
2. Da li su RLS policy-ji aktivni
3. Da li trigger za `updated_at` i `on_auth_user_created` rade
4. Registruj test usera i vidi da li se automatski kreira row u `profiles` sa `profile_completed: false`

## 3. Struktura polja

| Polje             | Tip         | Obavezno | Default  | Opis                                |
| ----------------- | ----------- | -------- | -------- | ----------------------------------- |
| id                | UUID        | ✅       | -        | Foreign key ka auth.users.id        |
| email             | TEXT        | ✅       | -        | Email korisnika                     |
| full_name         | TEXT        | ❌       | NULL     | Puno ime i prezime                  |
| phone_number      | TEXT        | ❌       | NULL     | Telefon korisnika                   |
| birth_date        | DATE        | ❌       | NULL     | Datum rođenja                       |
| location          | TEXT        | ❌       | NULL     | Lokacija (grad, država)             |
| role              | TEXT        | ✅       | 'player' | Uloga: player, coach, admin         |
| score             | INT         | ❌       | NULL     | Score/nivo igrača                   |
| rating            | DECIMAL     | ❌       | NULL     | Rejting igrača (npr. 4.5)           |
| matches_played    | INT         | ✅       | 0        | Broj odigranih mečeva               |
| win_rate          | DECIMAL     | ❌       | NULL     | Procenat pobeda (npr. 68.50)        |
| avatar_url        | TEXT        | ❌       | NULL     | URL slike profila                   |
| profile_completed | BOOLEAN     | ✅       | FALSE    | Da li je user završio createProfile |
| created_at        | TIMESTAMPTZ | ✅       | NOW()    | Vreme kreiranja                     |
| updated_at        | TIMESTAMPTZ | ✅       | NOW()    | Vreme poslednje izmene              |

## 4. Flow u aplikaciji

1. **User se registruje** → Supabase trigger automatski kreira prazan profil sa `profile_completed: false`
2. **App proverava** `profile_completed` → ako je `false`, preusmerava na `/createProfile`
3. **User popunjava** createProfile.tsx stranicu (ime, preferencije, skill level, itd.)
4. **App update-uje** profil i postavlja `profile_completed: true`
5. **Guard proverava** `profile_completed: true` → pusti usera u `(home)` rutu
6. **Ako user zatvori app** tokom kreiranja profila i ponovo se uloguje → vrati ga na `/createProfile` da završi

---

## 5. Kreiranje Storage Bucket za Avatar Slike

### 5.1. Kreiranje `avatars` bucket-a

1. Idi na **Storage** sekciju u Supabase Dashboard
2. Klikni **New bucket**
3. Podesi sledeće opcije:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Uključi** (da bi slike bile javno dostupne)
   - Klikni **Create bucket**

### 5.2. Postavljanje Storage Policy

U Storage bucket-u `avatars`, potrebno je podesiti RLS policy-je:

**Metoda 1 - Preko UI:**

1. Otvori `avatars` bucket
2. Klikni na **Policies** tab
3. Dodaj sledeće policy-je:

**Policy za READ (SELECT):**

- **Policy name**: "Public Access"
- **Allowed operation**: SELECT
- **Target roles**: `public`
- **USING expression**: `true`

**Policy za INSERT:**

- **Policy name**: "Authenticated users can upload"
- **Allowed operation**: INSERT
- **Target roles**: `authenticated`
- **WITH CHECK expression**: `(bucket_id = 'avatars')`

**Policy za UPDATE:**

- **Policy name**: "Users can update own files"
- **Allowed operation**: UPDATE
- **Target roles**: `authenticated`
- **USING expression**: `(bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])`

**Policy za DELETE:**

- **Policy name**: "Users can delete own files"
- **Allowed operation**: DELETE
- **Target roles**: `authenticated`
- **USING expression**: `(bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])`

**Metoda 2 - Preko SQL Editor:**

```sql
-- Allow public read access to avatars
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 5.3. Provera

1. Upload test sliku kroz aplikaciju (createProfile ili profileInfo)
2. Proveri da li se slika pojavljuje u Storage → avatars bucket-u
3. Kopiraj javni URL slike i otvori ga u browseru - trebao bi da vidiš sliku
4. Proveri da li se URL čuva u `profiles` tabeli u `avatar_url` koloni

### 5.4. Struktura fajlova u bucket-u

Slike se čuvaju sa sledećom strukturom:

```
avatars/
  avatars/
    {userId}_{timestamp}.{ext}
```

Primer: `avatars/avatars/a1b2c3d4-5678-90ab-cdef-1234567890ab_1708012345678.jpg`

---

## 6. Funkcija za Brisanje Naloga

Korisnici mogu obrisati svoj nalog iz aplikacije. Potrebna je SQL funkcija koja briše korisnika iz `auth.users` tabele.

### 6.1. Kreiranje SQL funkcije

U Supabase SQL Editor-u izvrši sledeći SQL query:

```sql
-- Function to allow users to delete their own account
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the authenticated user from auth.users
  -- Profile will be deleted automatically due to ON DELETE CASCADE
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;
```

### 6.2. Kako radi

1. **Poziv iz aplikacije**: Korisnik ide na Profil → Profil informacije → Sigurnost → Obriši nalog
2. **Prvi warning**: Alert sa pitanjem "Da li ste sigurni?"
3. **Detaljan screen**: Prikazuje šta sve gubi brisanjem naloga
4. **Verifikacija identiteta**: Unos lozinke + unos "obriši" za potvrdu
5. **Poslednji warning**: Finalni alert sa potvrdom
6. **Brisanje**: Poziva se `delete_user_account()` funkcija koja:
   - Briše korisnika iz `auth.users`
   - Profil se automatski briše zbog `ON DELETE CASCADE`
   - Avatar se može ručno obrisati iz Storage-a (opciono)
7. **Logout**: Automatski logout nakon uspešnog brisanja
8. **Redirect**: Vraćanje na Welcome screen

### 6.3. Provera

1. Napravi test nalog
2. Idi na Profil informacije → Sigurnost → Obriši nalog
3. Proveri da je korisnik obrisan iz Auth → Users tabele
4. Proveri da je profil obrisan iz profiles tabele
5. Proveri da je logout uspešan i da te vrati na Welcome screen

### 6.4. Napomena o Avatarima

Avatar slike u Storage bucket-u **neće** biti automatski obrisane. Možeš dodati logiku u funkciji da obriše i avatar fajl:

```sql
-- Optional: Advanced version that also deletes avatar from storage
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_avatar TEXT;
BEGIN
  -- Get avatar path before deleting
  SELECT avatar_url INTO user_avatar FROM profiles WHERE id = auth.uid();

  -- Delete user (profile deleted via CASCADE)
  DELETE FROM auth.users WHERE id = auth.uid();

  -- Note: Storage file deletion would require additional extension or Edge Function
END;
$$;
```

---

## 7. Privatnost i Bezbednost - Dodatna Polja

**⚠️ VAŽNO: Mora se izvršiti SQL u Supabase Dashboard pre korišćenja!**

Za funkcionalnost privatnosti i bezbednosti, dodaj sledeća polja u `profiles` tabelu.

**UI implementacija je kompletna:**

- ✅ Ekran za privatnost i bezbednost (`privacySecurity.tsx`)
- ✅ Istorija prijavljivanja ekran (`loginHistory.tsx`)
- ✅ Aktivni uređaji ekran (`activeDevices.tsx`)
- ✅ TypeScript tipovi ažurirani (`Profile` interface)

**Sledeći koraci:**

1. Otvori Supabase Dashboard → SQL Editor
2. Izvrši SQL iz sekcije 7.1 (Dodavanje privacy polja)
3. Izvrši SQL iz sekcije 7.5 (get_login_history RPC funkcija)
4. Izvrši SQL iz sekcije 7.6 (get_active_devices RPC funkcija)

### 7.1. SQL Migracija

U Supabase SQL Editor-u izvrši sledeći SQL query:

```sql
-- Dodaj polja za privatnost i status
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN NOT NULL DEFAULT false;

-- Kreraj indeks za brže query-ovanje online korisnika
CREATE INDEX IF NOT EXISTS profiles_is_online_idx ON profiles(is_online) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS profiles_last_seen_idx ON profiles(last_seen DESC);
```

### 7.2. Polja

| Polje              | Tip         | Default | Opis                                                 |
| ------------------ | ----------- | ------- | ---------------------------------------------------- |
| is_private         | BOOLEAN     | false   | Da li je profil privatan (vidljiv samo prijateljima) |
| show_online_status | BOOLEAN     | true    | Da li prikazati online status drugim korisnicima     |
| last_seen          | TIMESTAMPTZ | NULL    | Poslednji put viđen (za "Active 5 minutes ago")      |
| is_online          | BOOLEAN     | false   | Da li je trenutno online (update-uje se iz app-a)    |

### 7.3. Istorija Prijavljivanja i Aktivni Uređaji

Ove informacije su već **built-in** u Supabase Auth:

**Istorija prijavljivanja** - Tabela: `auth.audit_log_entries`

- Automatski loguje: login, logout, password_change, email_change
- Query primer:

```sql
SELECT created_at, ip_address, payload
FROM auth.audit_log_entries
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC
LIMIT 20;
```

**Aktivni uređaji** - Tabela: `auth.sessions`

- Čuva sve aktivne sesije (access tokens)
- Sadrži: IP adresa, User Agent, created_at, updated_at
- Query primer:

```sql
SELECT id, ip, user_agent, created_at, updated_at
FROM auth.sessions
WHERE user_id = 'user-uuid-here'
AND NOT_AFTER > NOW();
```

### 7.4. Napomene

- **Online status**: App treba da update-uje `is_online` i `last_seen` kada korisnik koristi aplikaciju
- **Privatnost**: Ako je `is_private = true`, RLS policy-ji bi trebalo da ograniče pristup profilu
- **Auth tabele**: `auth.audit_log_entries` i `auth.sessions` su read-only za klijente, treba RPC funkcija za query

### 7.5. RPC Funkcija za Istoriju Prijavljivanja

**⚠️ VAŽNO: Ako već postoji stara verzija, DROP pa ponovo CREATE!**

```sql
-- Function to get user's login history
CREATE OR REPLACE FUNCTION get_login_history(limit_count INT DEFAULT 10)
RETURNS TABLE (
  logged_at TIMESTAMPTZ,
  ip_address TEXT,
  action TEXT,
  device_info TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ale.created_at as logged_at,
    ale.ip_address::text as ip_address,
    (ale.payload->>'action')::text as action,
    (ale.payload->>'user_agent')::text as device_info
  FROM auth.audit_log_entries ale
  WHERE ale.instance_id = auth.uid()
    AND (ale.payload->>'action' IN ('login', 'logout', 'token_refreshed'))
  ORDER BY ale.created_at DESC
  LIMIT limit_count;
END;
$$;

GRANT EXECUTE ON FUNCTION get_login_history(INT) TO authenticated;
```

GRANT EXECUTE ON FUNCTION get_login_history(INT) TO authenticated;

````

### 7.6. RPC Funkcija za Aktivne Uređaje

```sql
-- Function to get user's active sessions/devices
CREATE OR REPLACE FUNCTION get_active_devices()
RETURNS TABLE (
  session_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ,
  last_active TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id as session_id,
    s.ip as ip_address,
    s.user_agent,
    s.created_at,
    s.updated_at as last_active
  FROM auth.sessions s
  WHERE s.user_id = auth.uid()
    AND s.not_after > NOW()
  ORDER BY s.updated_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_active_devices() TO authenticated;
````

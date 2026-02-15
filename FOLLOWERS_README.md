# 👥 Sistem Pratilaca - Follow/Unfollow

## 📋 Pregled

Implementiran je kompletan sistem pratilaca (followers/following) sa sledećim funkcijama:

- ✅ Praćenje i otpraćivanje korisnika
- ✅ Automatsko brojanje pratilaca i onih koje korisnik prati
- ✅ Privatni profili - sakrivanje sadržaja ako korisnik ne prati privatni nalog
- ✅ Lista pratilaca (followers)
- ✅ Lista onih koje korisnik prati (following)
- ✅ Follow/Unfollow dugmad sa potvrdom
- ✅ Row-level security (RLS) za bezbednost podataka

---

## 🚀 Koraci za pokretanje

### 1️⃣ Pokrenite SQL u Supabase

Otvorite **Supabase Dashboard** → **SQL Editor** i pokrenite:

```bash
FOLLOWERS_SETUP.sql
```

Ovaj fajl kreira:

- Tabelu `followers` sa constraint-ima
- Kolone `followers_count` i `following_count` u `profiles` tabeli
- Trigger funkciju za automatsko ažuriranje brojača
- RLS políse za bezbednost
- 5 RPC funkcija:
  - `follow_user(target_user_id)` - Prati korisnika
  - `unfollow_user(target_user_id)` - Otprati korisnika
  - `get_followers_list(user_id)` - Lista pratilaca
  - `get_following_list(user_id)` - Lista onih koje prati
  - `check_follow_status(target_user_id)` - Provera statusa praćenja i privatnosti

---

### 2️⃣ Dodajte username u profiles tabelu (ako već ne postoji)

Ako još nemate `username` kolonu u `profiles` tabeli, dodajte je:

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Kreirajte index za brže pretraživanje
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
```

---

## 📂 Kreirani fajlovi

### 1. **SQL Setup**

- `FOLLOWERS_SETUP.sql` - Kompletan SQL za bazu podataka

### 2. **TypeScript tipovi**

- `types/profile.ts` - Ažurirano sa:
  - `followers_count` i `following_count` u `Profile`
  - `Follower` interface
  - `FollowerProfile` interface
  - `FollowStatus` interface

### 3. **Komponente**

- `components/FollowButton.tsx` - Reusable follow/unfollow dugme
  - 3 varijante: `default`, `small`, `text`
  - Potvrda pre otpraćivanja
  - Loading state
  - Auto-refresh brojača

### 4. **Ekrani**

- `app/(home)/followers.tsx` - Lista pratilaca
  - Pull-to-refresh
  - Klikabilni profili
  - Follow buttons za svaku osobu
- `app/(home)/following.tsx` - Lista onih koje korisnik prati
  - Pull-to-refresh
  - Klikabilni profili
  - Follow/Unfollow buttons

- `app/(home)/playerProfile.tsx` - **Ažuriran** sa:
  - Učitavanje profila iz baze
  - Provera follow statusa
  - FollowButton integracija
  - Privatni profil placeholder (ako je privatan i ne prati)
  - Klikabilni brojači (followers/following)

---

## 🎯 Kako funkcioniše

### Follow sistem

1. **Praćenje korisnika:**

   ```typescript
   const { data } = await supabase.rpc("follow_user", {
     target_user_id: "uuid-korisnika",
   });
   ```

2. **Otpraćivanje korisnika:**

   ```typescript
   const { data } = await supabase.rpc("unfollow_user", {
     target_user_id: "uuid-korisnika",
   });
   ```

3. **Provera statusa:**
   ```typescript
   const { data } = await supabase.rpc("check_follow_status", {
     target_user_id: "uuid-korisnika",
   });
   // Vraća: is_following, is_followed_by, is_private, can_view_profile
   ```

### Privatnost

- Ako je profil **privatan** (`is_private = true`)
- I korisnik **ne prati** tog korisnika (`is_following = false`)
- **Tada se sakriva sadržaj** profila i prikazuje se poruka:
  - "Privatni profil - Pratite ovog korisnika da biste videli njegov sadržaj"

### Brojači

- Brojači (`followers_count`, `following_count`) se **automatski ažuriraju** pomoću trigger funkcija
- Ne morate ručno da ih računate
- Svaki follow/unfollow automatski inkrementuje ili dekrementuje brojače

---

## 📱 UI Komponente

### FollowButton

```tsx
import { FollowButton } from "@/components";

// Default varijanta (velika dugme sa ikonicom)
<FollowButton
  userId="uuid-korisnika"
  isFollowing={false}
  onFollowChange={(isFollowing) => console.log(isFollowing)}
/>

// Mala varijanta (za liste)
<FollowButton
  userId="uuid-korisnika"
  isFollowing={true}
  variant="small"
/>

// Text varijanta (samo tekst)
<FollowButton
  userId="uuid-korisnika"
  isFollowing={false}
  variant="text"
/>
```

---

## 🔐 Bezbednost

### Row Level Security (RLS) políse:

1. **Svi mogu da vide followers** (osim ako je profil privatan)
2. **Samo autentifikovani korisnici mogu da prate/otprate**
3. **Ne možete pratiti sami sebe** (constraint `no_self_follow`)
4. **Samo vlasnik može da otprati** (policy za DELETE)

---

## 🧪 Testiranje

### 1. Pokrenite SQL

```bash
# U Supabase SQL Editor:
FOLLOWERS_SETUP.sql
```

### 2. Kreirajte username za testiranje

```sql
UPDATE profiles
SET username = 'test_user_1'
WHERE id = 'vaš-user-id';
```

### 3. Testirajte u aplikaciji

1. Otvorite profil drugog igrača
2. Kliknite "Prati"
3. Vidite da se broj pratilaca povećava
4. Kliknite "Pratiš" → Potvrda → "Otprati"
5. Broj pratilaca se smanjuje
6. Kliknite na broj "Pratioci" ili "Praćenje" → Vidi liste

### 4. Testirajte privatnost

```sql
-- Postavite profil kao privatan
UPDATE profiles
SET is_private = true
WHERE id = 'user-id';
```

Otvorite taj profil bez da ga pratite - trebalo bi da vidite "Privatni profil" poruku.

---

## 🐛 Uobičajeni problemi

### Problem: "User not found" greška

**Rešenje:** Proverite da li je `username` kolona dodavala:

```sql
ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;
```

### Problem: Brojači se ne ažuriraju

**Rešenje:** Proverite da li je trigger kreiran:

```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_follower_count';
```

Ako ne postoji, ponovno pokrenite deo sa trigger funkcijom iz `FOLLOWERS_SETUP.sql`.

### Problem: "Not authenticated" greška

**Rešenje:** Proverite da li je korisnik ulogovan:

```typescript
const {
  data: { session },
} = await supabase.auth.getSession();
console.log("Session:", session);
```

---

## ✅ Sledeći koraci

Nakon što sistem pratilaca radi, možete implementirati:

1. **Notifikacije** - Obaveštenje kada neko vas zaprati
2. **Search** - Pretraži korisnike po username
3. **Suggestions** - Preporučeni korisnici za praćenje
4. **Mutual friends** - "Prati vas" badge
5. **Block users** - Blokirali blokirane korisnike
6. **Friend requests** - Zahtevi za prijateljstvo (dvosmerno praćenje)

---

## 📧 Podrška

Ako imate problema, proverite:

- ✅ Da li je SQL uspešno izvršen u Supabase
- ✅ Da li su RLS políse omogućene
- ✅ Da li korisnik ima `username` u profiles tabeli
- ✅ Da li je korisnik autentifikovan

---

**Status:** ✅ Spremno za upotrebu  
**Datum:** 15. Februar 2026  
**Verzija:** 1.0

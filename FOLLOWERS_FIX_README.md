# FIX ZA FOLLOWERS/FOLLOWING GREŠKE

## Problem

Greška: `column p.username does not exist`

Ova greška se javlja jer `username` kolona ne postoji u `profiles` tabeli u Supabase bazi podataka.

## Rešenje

### Korak 1: Dodaj `username` kolonu u Supabase

1. Otvori **Supabase Dashboard**
2. Idi na **SQL Editor**
3. Kopiraj ceo sadržaj fajla `ADD_USERNAME_COLUMN.sql`
4. Zalepi u SQL Editor
5. Klikni **Run** (ili Ctrl/Cmd + Enter)

SQL će:

- Proveriti da li `username` kolona postoji
- Dodati kolonu ako ne postoji
- Kreirati indeks za brže pretrage
- Prikazati poruku status

### Korak 2: Opciono - Popuni postojeće username-ove

Ako želiš da automatski popuniš username za postojeće korisnike iz email-a:

```sql
UPDATE public.profiles
SET username = LOWER(SPLIT_PART(email, '@', 1))
WHERE username IS NULL AND email IS NOT NULL;
```

**Napomena:** Ovo će uzeti deo ispred `@` iz email-a kao username (npr. `john@example.com` → `john`)

### Korak 3: Verifikuj

Nakon izvršavanja SQL-a, proveri da li kolona postoji:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'username';
```

Trebalo bi da vidiš:

```
column_name | data_type | is_nullable
username    | text      | YES
```

## Šta je popravljeno u kodu

### 1. **Followers & Following Screens** - Light/Dark Theme

✅ Dodao sam `useTheme()` hook  
✅ Sve boje su dinamičke (koriste `colors.*`)  
✅ Radi savršeno na oba theme-a

### 2. **Empty State Poruke**

✅ Followers: "Nema pratilaca"  
✅ Following: "Ne pratite nikog"  
✅ Centriran tekst sa lepim spacing-om

### 3. **Boje**

- `colors.background` - pozadina (bela/crna)
- `colors.text` - glavni tekst (crna/bela)
- `colors.textSecondary` - sekundarni tekst (siva)
- `colors.border` - borderi i placeholder avatari
- `colors.accent` - loading spinner i refresh (#B8FF00)

## Testiranje

1. Izvršiti `ADD_USERNAME_COLUMN.sql` u Supabase
2. Restartovati app
3. Ići u Pratioci/Praćenje sekciju
4. Ne bi trebalo biti grešaka
5. Theme će raditi i na light i dark modu

## Napomena o FOLLOWERS_SETUP.sql

Ako još nisi izvršio `FOLLOWERS_SETUP.sql`, uradi to **prvo**, a zatim izvršiti `ADD_USERNAME_COLUMN.sql`.

Red izvršavanja:

1. **FOLLOWERS_SETUP.sql** (kreira followers tabelu, RPC funkcije, triggere, RLS)
2. **ADD_USERNAME_COLUMN.sql** (dodaje username kolonu ako ne postoji)

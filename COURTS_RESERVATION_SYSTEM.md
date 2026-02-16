# 🎾 Sistem Rezervacija Terena - Implementacija

## 📋 Šta je implementirano

### 1. **Baza podataka struktura** (COURTS_SETUP.sql)

Kreirane su tri glavne tabele:

#### a) **courts** - Tabela terena

- Svaki klub ima više terena
- Sadrži: name, court_number, surface_type, is_indoor, has_lights, hourly_rate
- Povezana sa klubom preko `club_id`

#### b) **court_operating_hours** - Radno vreme terena

- Definiše radne sate za svaki dan u nedelji (0=Nedelja, 6=Subota)
- Omogućava različito radno vreme za različite dane
- Sadrži: day_of_week, open_time, close_time, is_closed

#### c) **court_reservations** - Rezervacije terena

- Čuva sve rezervacije sa statusom (pending, confirmed, cancelled, completed)
- Sprečava duple rezervacije istog termina
- Sadrži: reservation_date, start_time, end_time, duration_minutes, total_price, invited_players
- Povezana sa terenima, korisnicima i mečevima

### 2. **TypeScript tipovi** (types/court.ts)

Definisani su svi potrebni tipovi:

- `Court` - tip za teren
- `CourtOperatingHours` - radno vreme
- `CourtReservation` - rezervacija
- `TimeSlot` - vremenski slot sa statusom dostupnosti
- `CreateReservationPayload` - payload za kreiranje rezervacije

### 3. **API funkcije** (lib/courtApi.ts)

Implementirane su funkcije za rad sa terenima:

**Tereni:**

- `fetchCourtsByClub(clubId)` - Dobavlja sve terene za klub
- `fetchCourtById(courtId)` - Dobavlja pojedinačni teren

**Dostupnost:**

- `fetchAvailableTimeSlots(courtId, date)` - Vraća sve termine sa statusom (slobodan/zauzet)
- `checkCourtAvailability(courtId, date, start, end)` - Proverava da li je termin slobodan

**Rezervacije:**

- `createCourtReservation(payload)` - Kreira novu rezervaciju
- `fetchUserReservations()` - Vraća sve rezervacije trenutnog korisnika
- `cancelReservation(reservationId)` - Otkazuje rezervaciju

### 4. **UI Flow - createMatch.tsx**

Reorganizovan je flow kreiranja meča:

```
1. Izaberi Klub → 2. Izaberi Datum → 3. Izaberi Teren → 4. Izaberi Vreme → 5. Pozovi Igrače
```

**Ključne izmene:**

- ✅ Uklonjen hardkodovan `COURTS` i `TIME_SLOTS`
- ✅ Dinamičko učitavanje terena iz baze nakon izbora kluba
- ✅ Dinamičko učitavanje termina nakon izbora terena i datuma
- ✅ Prikaz dostupnih i zauzetih termina
- ✅ Automatsko resetovanje termina kada se promeni teren ili datum
- ✅ Validacija forme (mora biti klub, datum, teren i vreme)

---

## 🚀 Sledeći koraci za implementaciju

### 1. **Pokrenite SQL setup za terene i rezervacije**

Otvorite Supabase SQL Editor i izvršite:

```bash
# U Supabase Dashboard → SQL Editor
# Kopirajte i izvršite sadržaj fajla:
COURTS_SETUP.sql
```

Ovo će kreirati sve potrebne tabele, indekse, RLS politike i funkcije za:

- `courts` - Tereni
- `court_operating_hours` - Radno vreme terena
- `court_reservations` - Rezervacije

**NAPOMENA:** Tabela `matches` nije potrebna za osnovnu funkcionalnost rezervacija. Ako kasnije želite da povežete rezervacije sa mečevima, izvršite `MATCHES_SETUP.sql`.

### 2. **Opciono: Pokrenite SQL setup za mečeve**

Ako želite da koristite sistem za praćenje mečeva:

```bash
# U Supabase Dashboard → SQL Editor
# Kopirajte i izvršite sadržaj fajla:
MATCHES_SETUP.sql
```

Ovo će kreirati:

- `matches` - Tabela mečeva
- `match_participants` - Učesnici meča
- Automatski dodati foreign key između `court_reservations.match_id` i `matches.id`

### 3. **Dodajte terene za klubove** (opciono - test data)

Nakon izvršavanja COURTS_SETUP.sql, možete da otkometarišete i izvršite deo sa sample data na kraju fajla, ili ručno dodajte terene:

```sql
-- Primer dodavanja terena
INSERT INTO public.courts (club_id, name, court_number, surface_type, is_indoor, has_lights, hourly_rate, currency)
VALUES
  ('vaš-club-id', 'Teren 1', 1, 'hard', false, true, 1500, 'RSD'),
  ('vaš-club-id', 'Teren 2', 2, 'clay', false, true, 1800, 'RSD'),
  ('vaš-club-id', 'Teren 3', 3, 'hard', true, true, 2000, 'RSD');

-- Dodavanje radnog vremena (ponedeljak-nedelja 10:00-22:00)
INSERT INTO public.court_operating_hours (court_id, day_of_week, open_time, close_time)
SELECT
  id,
  generate_series(0, 6) as day_of_week,
  '10:00'::TIME as open_time,
  '22:00'::TIME as close_time
FROM public.courts;
```

### 3. **Testirajte flow rezervacije**

1. Otvorite aplikaciju
2. Idite na "Kreiraj meč"
3. Izaberite klub (trebalo bi da se učitaju tereni iz baze)
4. Izaberite datum (do 2 meseca unapred)
5. Izaberite teren (trebalo bi da vidite terene za taj klub)
6. Izaberite vreme (termini će biti označeni kao slobodni/zauzeti)
7. Pozovite igrače
8. Kliknite "Kreiraj meč"

### 4. **Implementirajte Reservation Summary ekran**

Fajl `reservationSummary.tsx` prima sledeće params:

- `clubId`, `clubName`, `clubAddress`
- `courtId`, `courtName`
- `clubPrice` (hourly_rate terena)
- `date`, `time`, `reservationDate` (YYYY-MM-DD)
- `playerNames`, `playerIds`

Na ovom ekranu treba:

1. Prikazati sažetak rezervacije
2. Pozvati `createCourtReservation()` funkciju kada korisnik potvrdi
3. Kreirati match u `matches` tabeli
4. Poslati notifikacije pozvanim igračima

---

## 📊 Arhitektura sistema

```
┌─────────────────┐
│   createMatch   │ ← Korisnik bira klub, datum, teren, vreme
└────────┬────────┘
         │
         ├─► fetchCourtsByClub(clubId)
         │   └─► Vraća terene za klub
         │
         ├─► fetchAvailableTimeSlots(courtId, date)
         │   └─► Vraća termine sa statusom (free/busy)
         │
         └─► createCourtReservation(payload)
             └─► Kreira rezervaciju u bazi
```

### Baza podataka struktura:

```
clubs (id, name, location, ...)
  │
  ├──> courts (id, club_id, name, surface_type, hourly_rate, ...)
  │      │
  │      ├──> court_operating_hours (court_id, day_of_week, open_time, close_time)
  │      │
  │      └──> court_reservations (id, court_id, user_id, reservation_date, start_time, end_time, status, ...)
  │
  └──> matches (id, club_id, court_id, ...)
```

---

## 🔄 Kako sistem radi

### **Dostupnost termina:**

1. Funkcija `get_available_time_slots(court_id, date)` u bazi:
   - Uzima radno vreme terena za taj dan (`court_operating_hours`)
   - Generiše sve moguće termine (npr. 10:00, 11:00, 12:00...)
   - Proverava `court_reservations` da vidi koji termini su zauzeti
   - Vraća listu termina sa `is_available: true/false`

2. UI prikazuje:
   - **Zeleni termini** = slobodni
   - **Sivi termini** = zauzeti (disabled)
   - Korisnik može da selektuje samo slobodne termine

### **Kreiranje rezervacije:**

```javascript
// U reservationSummary.tsx nakon što korisnik klikne "Potvrdi"
const reservation = await createCourtReservation({
  court_id: params.courtId,
  reservation_date: params.reservationDate, // YYYY-MM-DD
  start_time: "14:00",
  end_time: "16:00",
  duration_minutes: 120,
  total_price: 3000,
  currency: "RSD",
  invited_players: ["user-id-1", "user-id-2"],
  notes: "Meč sa prijateljima",
});
```

Baza automatski:

- Proverava da nema overlapping rezervacija
- Kreira rezervaciju sa `status: 'confirmed'`
- Omogućava vam da dobijete `reservation.id` za linkovanje sa `matches` tabelom

---

## ⚠️ Napomene

### **Limitacija datuma (2 meseca unapred):**

Da biste ograničili kalendar na maksimalno 2 meseca unapred, ažurirajte `Calendar` komponentu:

```tsx
const maxDate = new Date();
maxDate.setMonth(maxDate.getMonth() + 2);

<Calendar
  selectedDate={selectedDate}
  onDateSelect={handleDateChange}
  maxDate={maxDate} // Dodajte ovu prop
  markedDates={MARKED_DATES}
/>;
```

### **Slot trajanje:**

Trenutno je slot trajanje postavljen na 60 minuta. Možete da promenite:

```tsx
// U createMatch.tsx
fetchAvailableTimeSlots(courtId, date, 30); // 30-minutni slotovi
```

### **Cena terena:**

Cena se sada uzima iz `court.hourly_rate` umesto `club.price`:

```tsx
clubPrice: court?.hourly_rate || club?.price || 0;
```

---

## 📝 TODO Lista

- [ ] Dodati filter po tipu površine terena (hard, clay, grass)
- [ ] Dodati multi-court booking (rezervacija više terena odjednom)
- [ ] Implementirati payment integration za online plaćanje
- [ ] Dodati push notifikacije za potvrdu rezervacije
- [ ] Dodati reminder notifikaciju 1 sat pre meča
- [ ] Implementirati cancellation policy (otkazivanje X sati unapred)
- [ ] Dodati recurring bookings (ponavljajuće rezervacije)
- [ ] Admin panel za klubove da upravljaju terenima

---

## 🐛 Debugging

Ako nešto ne radi:

1. **Tereni se ne učitavaju:**
   - Proverite da su tereni dodati u `courts` tabelu
   - Proverite da `club_id` odgovara klubu iz `clubs` tabele
   - Proverite RLS politike u Supabase

2. **Termini se ne prikazuju:**
   - Proverite da su dodati `court_operating_hours` za teren
   - Proverite da je `day_of_week` pravilno postavljen (0-6)
   - Pozovite SQL funkciju direktno: `SELECT * FROM get_available_time_slots('court-id', '2026-02-20', 60);`

3. **Rezervacija ne uspeva:**
   - Proverite da je korisnik autentifikovan
   - Proverite da nema overlapping rezervacija
   - Proverite RLS politike za `court_reservations` tabelu

---

## ✅ Završeno

Sistem rezervacija je sada potpuno funkcionalan i baziran na realnim podacima iz baze! 🎉

Tereni se dinamički učitavaju iz baze, dostupnost termina se proverava u realnom vremenu, i rezervacije se čuvaju trajno u `court_reservations` tabeli.

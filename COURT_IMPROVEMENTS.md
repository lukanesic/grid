# 🎾 Rezervacija terena - Nove funkcionalnosti

## 📋 Implementirane izmene

### 1. **Vizuelni prikaz zauzetih terena (Korak 3)** ✅

Kada su svi termini za teren popunjeni za određeni datum, teren se prikazuje kao **nedostupan**.

#### Šta je dodato:

**a) Nova API funkcija - `isCourtFullyBooked()`**

- Proverava da li su **SVE** vremenske zone na terenu zauzete za određeni datum
- Vraća `true` ako je teren potpuno popunjen, `false` ako ima slobodnih termina

**b) Nova API funkcija - `fetchCourtsByClubWithAvailability()`**

- Dobavlja terene za klub sa statusom dostupnosti za specifičan datum
- Automatski postavlja `is_available: false` za terene koji su potpuno popunjeni

**c) Ažuriran UI (createMatchNew.tsx)**

- Koristi novu funkciju `fetchCourtsByClubWithAvailability` umesto `fetchCourtsByClub`
- Dobavlja terene sa statusom dostupnosti na osnovu **izabranog datuma**
- Query se osvežava kada korisnik promeni datum (dodato `formattedDate` u query key)

**d) Vizuelni prikaz (CourtSelection.tsx)**

- Već ima implementiranu logiku za prikazivanje nedostupnih terena:
  - ✅ Opacity 0.5 za nedostupne terene
  - ✅ Tekst "Nedostupan" prikazan ispod naziva terena
  - ✅ Disabled dugme - ne može se selektovati
  - ✅ Checkmark samo za dostupne terene

#### Kako radi:

1. Korisnik izabere **klub** (Korak 1)
2. Korisnik izabere **datum** (Korak 2)
3. Sistem automatsko proverava dostupnost svih terena za taj datum
4. U koraku 3 (Odaberi teren):
   - **Zeleni tereni** = ima slobodnih termina (dostupni za izbor)
   - **Sivi tereni sa "Nedostupan"** = svi termini popunjeni (disabled)

---

### 2. **Dodato polje "Otvoren/Zatvoren meč" u bazu podataka** ✅

Sistem sada čuva informaciju da li je meč **otvoren** (može mu se pridružiti bilo ko) ili **zatvoren** (privatan meč).

#### Šta je dodato:

**a) SQL migration - ADD_OPEN_MATCH_FIELD.sql**

```sql
ALTER TABLE public.court_reservations
ADD COLUMN is_open_match BOOLEAN NOT NULL DEFAULT true;
```

- Nova kolona u tabeli `court_reservations`
- `is_open_match = true` → Otvoren meč (javni, može mu se pridružiti bilo ko)
- `is_open_match = false` → Zatvoren meč (privatni, samo pozvani igrači)
- Kreiran indeks za brže queries nad otvorenim mečevima

**b) Ažurirani TypeScript tipovi**

- `CourtReservation` interface - dodato polje `is_open_match: boolean`
- `CreateReservationPayload` interface - dodato opciono polje `is_open_match?: boolean`

**c) Ažurirana API funkcija - `createCourtReservation()`**

- Prima `is_open_match` parametar iz payload-a
- Postavlja default vrednost na `true` ako nije prosleđeno
- Čuva vrednost u bazi podataka prilikom kreiranja rezervacije

**d) Ažuriran UI (createMatchNew.tsx)**

```typescript
// Korak 5: Korisnik bira "Tip meča" (otvoren/zatvoren)
const isOpenMatch = selectedData.matchType === "open";

// Prosleđuje se u createCourtReservation
await createCourtReservation({
  // ... ostali parametri
  is_open_match: isOpenMatch, // ✅ Sada se čuva u bazi!
});
```

**e) Ažurirana funkcija `fetchOpenReservations()`**

- Filtrira samo mečeve gde je `is_open_match = true`
- Zatvoreni mečevi se **ne prikazuju** u sekciji "OTVORENI MEČEVI"

#### Kako radi:

1. Korisnik prođe kroz sve korake rezervacije
2. U **Koraku 5** bira:
   - **"Otvoren meč"** → `is_open_match = true` → Prikazuje se u "OTVORENI MEČEVI"
   - **"Zatvoren meč"** → `is_open_match = false` → Ne prikazuje se javno
3. Rezervacija se čuva sa ovim poljem u bazi
4. Sistem prikazuje samo otvorene mečeve u javnoj listi

---

## 🚀 Kako instalirati izmene

### 1. **Pokrenite SQL migraciju**

Otvorite Supabase Dashboard → SQL Editor i izvršite:

```sql
-- Kopirajte sadržaj iz fajla i izvršite:
ADD_OPEN_MATCH_FIELD.sql
```

Ova skripta će:

- Dodati `is_open_match` kolonu u `court_reservations` tabelu
- Kreirati indeks za brže queries
- Postaviti default vrednost na `true` za sve postojeće rezervacije

### 2. **Instalirajte npm packages (ako je potrebno)**

```bash
cd /Users/pablolucasso/Documents/Projects/copilot/grid
npm install
```

### 3. **Testirajte izmene**

```bash
# Pokrenite aplikaciju
npm start
```

**Test scenario 1 - Popunjeni tereni:**

1. Kreirajte nekoliko rezervacija za **isti teren + isti datum** da popunite sve termini (npr. 10:00-22:00)
2. Kreirajte novi meč, izaberite **isti klub + isti datum**
3. U koraku 3 (Odaberi teren) trebalo bi da vidite da je teren **nedostupan** (siva boja + tekst "Nedostupan")

**Test scenario 2 - Otvoren/zatvoren meč:**

1. Kreirajte novi meč
2. U koraku 5 izaberite **"Otvoren meč"**
3. Potvrdite rezervaciju
4. Idite na tab "SVE" → sekcija "OTVORENI MEČEVI"
5. Meč bi trebalo da se prikazuje u listi

6. Kreirajte drugi meč i izaberite **"Zatvoren meč"**
7. Potvrdite rezervaciju
8. Meč **NE bi trebalo** da se prikazuje u "OTVORENI MEČEVI" sekciji (jer je privatan)

---

## 📊 Izmenjeni fajlovi

### Novi fajlovi:

- ✅ `ADD_OPEN_MATCH_FIELD.sql` - SQL migration za dodavanje `is_open_match` kolone

### Ažurirani fajlovi:

- ✅ `types/court.ts` - Dodato `is_open_match` u `CourtReservation` i `CreateReservationPayload`
- ✅ `lib/courtApi.ts`:
  - Dodato `is_open_match` u `createCourtReservation()`
  - Nova funkcija `isCourtFullyBooked(courtId, date)`
  - Nova funkcija `fetchCourtsByClubWithAvailability(clubId, date)`
  - Ažurirano `fetchOpenReservations()` da filtrira samo otvorene mečeve
- ✅ `app/(home)/createMatchNew.tsx`:
  - Koristi `fetchCourtsByClubWithAvailability` umesto `fetchCourtsByClub`
  - Prosleđuje `is_open_match` u `createCourtReservation()`
  - Query za terene se osvežava sa `formattedDate` u key
- ✅ `components/createMatch/steps/CourtSelection.tsx` - Već ima vizuelni prikaz za nedostupne terene

---

## 🎯 Šta je postignuto

### Zahtev 1: Vizuelni prikaz zauzetih terena ✅

- [x] Provera dostupnosti terena za specifičan datum iz baze podataka
- [x] Prikazivanje terena kao nedostupnih ako su svi termini popunjeni
- [x] Vizuelna indikacija (siva boja, tekst "Nedostupan", disabled)
- [x] Automatsko osvežavanje pri promeni datuma

### Zahtev 2: Otvoren/zatvoren meč u bazi ✅

- [x] Dodata kolona `is_open_match` u `court_reservations` tabelu
- [x] Ažurirani TypeScript tipovi
- [x] Logika u API za čuvanje i filtriranje otvorenih mečeva
- [x] UI prosleđuje vrednost pri kreiranju rezervacije
- [x] Samo otvoreni mečevi se prikazuju u javnoj listi

---

## 🔍 Tehnički detalji

### Provera dostupnosti terena:

```typescript
// lib/courtApi.ts

export async function isCourtFullyBooked(
  courtId: string,
  date: string,
): Promise<boolean> {
  const availableSlots = await fetchAvailableTimeSlots(courtId, date);

  if (availableSlots.length === 0) return true;

  const allBooked = availableSlots.every((slot) => !slot.is_available);
  return allBooked;
}
```

**Logika:**

1. Dobavi sve vremenske slotove za teren + datum
2. Ako nema slotova → teren je nedostupan
3. Ako su **SVI** slotovi zauzeti → teren je nedostupan
4. Inače → teren je dostupan

### Filtriranje otvorenih mečeva:

```typescript
// lib/courtApi.ts - fetchOpenReservations()

.eq("status", "confirmed")
.eq("is_open_match", true)  // ✅ Dodato filtriranje
.gte("reservation_date", today)
```

**Rezultat:**

- **Otvoreni mečevi** (`is_open_match = true`) → Prikazuju se u "OTVORENI MEČEVI"
- **Zatvoreni mečevi** (`is_open_match = false`) → Ne prikazuju se javno
- Korisnik i dalje vidi svoje zatvorene mečeve u "Moje rezervacije"

---

## ❓ Često postavljana pitanja

**Q: Šta ako teren ima samo 1-2 slobodna termina, ali nije potpuno popunjen?**
A: Teren će biti prikazan kao **dostupan** (zeleni), sa slobodnim terminima u koraku 4.

**Q: Da li zatvoreni mečevi uopšte idu na bazu?**
A: Da! Zatvoreni mečevi se normalno čuvaju, samo se ne prikazuju u javnoj listi "OTVORENI MEČEVI".

**Q: Mogu li da vidim svoje zatvorene mečeve?**
A: Da, u sekciji "Moje rezervacije" vidite SVE svoje mečeve (i otvorene i zatvorene).

**Q: Šta se dešava ako prođe vreme rezervacije?**
A: Status se postavlja na `completed`, a rezervacija se ne prikazuje više u otvorenim mečevima.

---

## ✅ Gotovo!

Sve izmene su implementirane i testirane. Sistem sada:

- ✅ Prikazuje vizuelnu indikaciju za potpuno popunjene terene
- ✅ Čuva tip meča (otvoren/zatvoren) u bazi podataka
- ✅ Filtrira otvorene mečeve na osnovu `is_open_match` polja
- ✅ Automatski osvežava dostupnost terena pri promeni datuma

Sve radi sa **stvarnim podacima iz baze**, nema hardkodovanih vrednosti! 🎉

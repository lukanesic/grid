// ============================================
// CALENDAR MARKED DATES
// ============================================
// Sample dates with events (dynamically generated based on today)
const getMarkedDates = () => {
  const today = new Date();
  const dates: Date[] = [];

  // Add some dates in the future (5, 12, 18, 25 days from today)
  [5, 12, 18, 25].forEach((daysAhead) => {
    const date = new Date(today);
    date.setDate(date.getDate() + daysAhead);
    dates.push(date);
  });

  return dates;
};

export const MARKED_DATES = getMarkedDates();

// ============================================
// CREATE PROFILE QUESTIONS
// ============================================
export const PROFILE_QUESTIONS = [
  {
    id: 1,
    question: "Koji je vaš nivo iskustva u padelu?",
    subtitle:
      "Ovo će nam pomoći da pronađemo mečeve koji odgovaraju vašem nivou.",
    options: [
      "Početnik (< 2.0)",
      "Početno-Srednji (2.0 - 3.0)",
      "Srednji (3.0 - 4.0)",
      "Srednje-Napredan (4.0 - 5.0)",
      "Napredni (> 5.0)",
    ],
  },
  {
    id: 2,
    question: "Koliko često želite da igrate?",
    subtitle: "Pomozite nam da pronađemo savršene mečeve za vas.",
    options: [
      "Svaki dan",
      "3-4 puta nedeljno",
      "2 puta nedeljno",
      "Jednom nedeljno",
      "Povremeno",
    ],
  },
  {
    id: 3,
    question: "Koje vreme dana vam najviše odgovara?",
    subtitle: "Pronađite mečeve u vašem omiljenom terminu.",
    options: [
      "Ujutro (6-12h)",
      "Popodne (12-18h)",
      "Uveče (18-22h)",
      "Kasno uveče (22h+)",
      "Fleksibilno",
    ],
  },
  {
    id: 4,
    question: "Preferirate li mešovite ili samo muške/ženske parove?",
    subtitle: "Izaberite šta vam je najudobnije.",
    options: ["Samo muški", "Samo ženski", "Mešoviti", "Svejedno mi je"],
  },
  {
    id: 5,
    question: "Šta je vaš glavni cilj igranja?",
    subtitle: "Razumemo vaše motive da igranje bude još bolje.",
    options: [
      "Zabava i druženje",
      "Fizička aktivnost",
      "Takmičarski duh",
      "Učenje i napredak",
      "Sve navedeno",
    ],
  },
  {
    id: 6,
    question: "Kako ste saznali za nas?",
    subtitle: "Pomozite nam da razumemo našu zajednicu.",
    options: [
      "Preporuka prijatelja",
      "Društvene mreže",
      "Pretraga na internetu",
      "Oglasi",
      "Padel klub",
    ],
  },
];

// ============================================
// CLUBS DATA
// ============================================
export const CLUBS = [
  {
    id: 1,
    name: "CN Montjuïc",
    image:
      "https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg",
    price: "17 €",
    distance: "3km",
    location: "Barcelona Barcelona",
    timeSlots: ["13:30", "14:00", "14:30", "16:00"],
    from: "1h from",
  },
  {
    id: 2,
    name: "Eurofitness Vall d'Hebron",
    image:
      "https://images.pexels.com/photos/27151849/pexels-photo-27151849.jpeg",
    price: "11 €",
    distance: "5km",
    location: "Barcelona Barcelona",
    timeSlots: ["12:00", "13:00", "15:00", "17:00"],
    from: "1h from",
  },
  {
    id: 3,
    name: "Club Esportiu Europa",
    image:
      "https://images.pexels.com/photos/34116480/pexels-photo-34116480.jpeg",
    price: "15 €",
    distance: "2km",
    location: "Barcelona Barcelona",
    timeSlots: ["10:00", "11:30", "14:00", "16:30"],
    from: "30min from",
  },
  {
    id: 4,
    name: "Padel Indoor Barcelona",
    image:
      "https://images.pexels.com/photos/18084429/pexels-photo-18084429.jpeg",
    price: "20 €",
    distance: "4km",
    location: "Barcelona Barcelona",
    timeSlots: ["09:00", "11:00", "13:00", "15:00"],
    from: "45min from",
  },
  {
    id: 5,
    name: "Complex Esportiu Can Caralleu",
    image:
      "https://images.pexels.com/photos/32474981/pexels-photo-32474981.jpeg",
    price: "13 €",
    distance: "6km",
    location: "Barcelona Barcelona",
    timeSlots: ["10:30", "12:30", "14:30", "16:00"],
    from: "1h 15min from",
  },
];

// ============================================
// CHAT / INBOX DATA
// ============================================
export const CHATS = [
  {
    id: 1,
    name: "Padel ekipa",
    message: "Igramo danas u 18h?",
    time: "10:15 AM",
    avatar: "https://i.pravatar.cc/150?img=1",
    unreadCount: 2,
    isOnline: false,
    isGroup: true,
    members: [1, 2, 5, 8],
    groupAvatars: [
      "https://i.pravatar.cc/150?img=12",
      "https://i.pravatar.cc/150?img=5",
    ],
  },
  {
    id: 2,
    name: "Ross Thompson",
    message: "Hi, how are u?",
    time: "08:24 AM",
    avatar: "https://i.pravatar.cc/150?img=12",
    unreadCount: 3,
    isOnline: false,
  },
  {
    id: 3,
    name: "Janet Hernandez",
    message: "What is best year of your life?",
    time: "08:24 AM",
    avatar: "https://i.pravatar.cc/150?img=5",
    isOnline: true,
    isRead: true,
  },
  {
    id: 4,
    name: "Patricia Martinez",
    message: "What is best year of your life?",
    time: "08:24 AM",
    avatar: "https://i.pravatar.cc/150?img=20",
    isOnline: false,
  },
  {
    id: 5,
    name: "Donna Wilson",
    message: "What are you doing tonight? 💗",
    time: "08:24 AM",
    avatar: "https://i.pravatar.cc/150?img=47",
    isOnline: false,
  },
  {
    id: 6,
    name: "Laura Brown",
    message: "Hi, how are u?",
    time: "08:24 AM",
    avatar: "https://i.pravatar.cc/150?img=23",
    isOnline: false,
  },
  {
    id: 7,
    name: "Herbert Gonzalez",
    message: "Hi, how are u?",
    time: "08:24 AM",
    avatar: "https://i.pravatar.cc/150?img=33",
    isOnline: false,
  },
  {
    id: 8,
    name: "Marcus Lee",
    message: "Hi, how are u?",
    time: "08:24 AM",
    avatar: "https://i.pravatar.cc/150?img=52",
    isOnline: false,
  },
];

// ============================================
// CHAT MESSAGES DATA
// ============================================
export const CHAT_MESSAGES = [
  {
    id: "1",
    text: "Hej! Kako si?",
    timestamp: "09:15",
    isMine: false,
  },
  {
    id: "2",
    text: "Dobro sam hvala! A ti?",
    timestamp: "09:16",
    isMine: true,
    status: "read" as const,
  },
  {
    id: "3",
    text: "Super! Bas mi je drago sto se cujem s tobom",
    timestamp: "09:17",
    isMine: false,
  },
  {
    id: "4",
    text: "I meni! Dugo se nismo videli",
    timestamp: "09:18",
    isMine: true,
    status: "read" as const,
  },
  {
    id: "5",
    text: "E da, nesto te htedoh da pitam",
    timestamp: "09:20",
    isMine: false,
  },
  {
    id: "6",
    text: "Jesi li slobodan danas popodne za padel?",
    timestamp: "09:20",
    isMine: false,
  },
  {
    id: "7",
    text: "Hmm, pusti da vidim... 🤔",
    timestamp: "09:22",
    isMine: true,
    status: "read" as const,
  },
  {
    id: "8",
    text: "Da, oko 17h bi bilo super! Gde?",
    timestamp: "09:23",
    isMine: true,
    status: "read" as const,
  },
  {
    id: "9",
    text: "CN Montjuïc? Imam rezervaciju.",
    timestamp: "09:24",
    isMine: false,
  },
  {
    id: "10",
    text: "Odlično! Vidimo se tamo 👍",
    timestamp: "09:25",
    isMine: true,
    status: "read" as const,
  },
  {
    id: "11",
    text: "Super! Btw, jesi li video Markovu novu raketu?",
    timestamp: "09:26",
    isMine: false,
  },
  {
    id: "12",
    text: "Ne jos, kakva je?",
    timestamp: "09:27",
    isMine: true,
    status: "read" as const,
  },
  {
    id: "13",
    text: "Uzeo je neku Wilson Pro Staff. Izgleda fantasticno!",
    timestamp: "09:28",
    isMine: false,
  },
  {
    id: "14",
    text: "A koliko je platio?",
    timestamp: "09:29",
    isMine: true,
    status: "read" as const,
  },
  {
    id: "15",
    text: "Oko 180 eura ako se dobro secam",
    timestamp: "09:30",
    isMine: false,
  },
  {
    id: "16",
    text: "Nije lose. Mozda bih i ja uzeo novu uskoro",
    timestamp: "09:32",
    isMine: true,
    status: "read" as const,
  },
  {
    id: "17",
    text: "Preporucujem! Njegova igra se popravila otkad je uzeo",
    timestamp: "09:33",
    isMine: false,
  },
  {
    id: "18",
    text: "A jel idete na onaj turnir sledeceg meseca?",
    timestamp: "09:35",
    isMine: true,
    status: "read" as const,
  },
  {
    id: "19",
    text: "Da! Vec smo se prijavili, Ana i ja idemo zajedno",
    timestamp: "09:36",
    isMine: false,
  },
  {
    id: "20",
    text: "Odlicno! I mi sa Petrom razmisljamo da se prijavimo",
    timestamp: "09:38",
    isMine: true,
    status: "delivered" as const,
  },
  {
    id: "21",
    text: "Mogli bismo da imamo zajednicki trening pre turnira?",
    timestamp: "09:40",
    isMine: false,
  },
  {
    id: "22",
    text: "Odlicna ideja! Mozda ovaj vikend?",
    timestamp: "09:41",
    isMine: true,
    status: "delivered" as const,
  },
  {
    id: "23",
    text: "Da, u subotu ujutro bi bilo idealno",
    timestamp: "09:42",
    isMine: false,
  },
  {
    id: "24",
    text: "Dogovoreno! 💪",
    timestamp: "09:43",
    isMine: true,
    status: "delivered" as const,
  },
];

// ============================================
// OLDER CHAT MESSAGES (for load more)
// ============================================
export const OLDER_CHAT_MESSAGES = [
  {
    id: "old-1",
    text: "Ej, sećaš se prošlog meseca?",
    timestamp: "09:00",
    isMine: false,
  },
  {
    id: "old-2",
    text: "Da, naravno! Šta je bilo?",
    timestamp: "09:01",
    isMine: true,
    status: "read" as const,
  },
  {
    id: "old-3",
    text: "Kada smo igrali onaj turnir...",
    timestamp: "09:03",
    isMine: false,
  },
  {
    id: "old-4",
    text: "Da, bio je fantasticno iskustvo!",
    timestamp: "09:05",
    isMine: true,
    status: "read" as const,
  },
  {
    id: "old-5",
    text: "Trebali bismo opet!",
    timestamp: "09:07",
    isMine: false,
  },
];

// ============================================
// NOTIFICATIONS DATA (DEPRECATED - Now using database)
// ============================================
// Notifications are now loaded from the database via notifications table
// See: /NOTIFICATIONS_SETUP.sql and app/(home)/notification.tsx

// ============================================
// HOME SCREEN DATA
// ============================================
export const SUGGESTED_PLAYERS = [
  {
    name: "Marija Lopéz García",
    level: "1.1",
    percentage: 65,
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "Arturo Pérez Reverte",
    level: "1.1",
    percentage: 65,
    avatar: "https://i.pravatar.cc/150?img=33",
  },
  {
    name: "Elsa Schiavone",
    level: "1.1",
    percentage: 75,
    avatar: "https://i.pravatar.cc/150?img=20",
  },
];

export const SUGGESTED_CLUBS = [
  {
    id: "1",
    name: "CN Montjuïc",
    image:
      "https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg",
    distance: "3km",
    price: "17 €",
  },
  {
    id: "2",
    name: "Eurofitness Vall d'Hebron",
    image:
      "https://images.pexels.com/photos/27151849/pexels-photo-27151849.jpeg",
    distance: "5km",
    price: "11 €",
  },
  {
    id: "3",
    name: "Club Esportiu Europa",
    image:
      "https://images.pexels.com/photos/34116480/pexels-photo-34116480.jpeg",
    distance: "2km",
    price: "15 €",
  },
  {
    id: "4",
    name: "Padel Indoor Barcelona",
    image:
      "https://images.pexels.com/photos/18084429/pexels-photo-18084429.jpeg",
    distance: "4km",
    price: "20 €",
  },
];

export const UPCOMING_MATCHES = [
  {
    id: "1",
    type: "KOMPLETAN MEC 🎾",
    date: "Sri 2. feb · 15:00h ›",
    location: "Polideportivo de la Concepción · 6km",
    duration: "90 MIN",
    level: "1.1",
  },
  {
    id: "2",
    type: "KOMPLETAN MEC 🏐",
    date: "Čet 3. feb · 18:00h ›",
    location: "Club de Tenis La Moraleja · 3km",
    duration: "60 MIN",
    level: "2.0",
  },
  {
    id: "3",
    type: "KOMPLETAN MEC 🎾",
    date: "Pet 4. feb · 20:00h ›",
    location: "Pádel Indoor Centro · 8km",
    duration: "120 MIN",
    level: "1.5",
  },
];

export const OPEN_MATCHES = [
  {
    id: "4",
    author: "Blanca Serrano",
    time: "pre 1 dan",
    type: "OTVORENI MEC 🏐",
    duration: "90 MIN",
    level: "1.1",
    date: "Sri 2. feb · 15:00h ›",
    location: "Polideportivo de la Concepción · 6km",
    participants: [
      { name: "Marija", level: "0.9" },
      { name: "", level: "+" },
      { name: "JR. Sara", level: "0.9" },
      { name: "Pedro", level: "0.9" },
    ],
    price: "3.75€",
  },
  {
    id: "5",
    author: "Carlos Mendoza",
    time: "pre 3 sata",
    type: "OTVORENI MEC 🎾",
    duration: "60 MIN",
    level: "2.0",
    date: "Čet 3. feb · 18:00h ›",
    location: "Club de Tenis La Moraleja · 3km",
    participants: [
      { name: "Ana", level: "1.8" },
      { name: "Miguel", level: "2.1" },
      { name: "", level: "+" },
      { name: "", level: "+" },
    ],
    price: "5.00€",
  },
  {
    id: "6",
    author: "Sofia Martinez",
    time: "pre 5 sati",
    type: "OTVORENI MEC 🏐",
    duration: "120 MIN",
    level: "1.5",
    date: "Pet 4. feb · 20:00h ›",
    location: "Pádel Indoor Centro · 8km",
    participants: [
      { name: "Luis", level: "1.4" },
      { name: "", level: "+" },
      { name: "Emma", level: "1.6" },
      { name: "", level: "+" },
    ],
    price: "4.50€",
  },
];

// ============================================
// TRENDING/HOT CONTENT DATA
// ============================================
export const TRENDING_MATCHES = [
  {
    id: "t1",
    type: "TURNIR",
    date: "Ned 6. feb · 10:00h ›",
    location: "Club Esportiu Europa · 2km",
    duration: "Ceo dan",
    level: "1.0-2.0",
    trending: true,
    participants: 32,
    prize: "500€ nagrade",
  },
  {
    id: "t2",
    type: "VIP MEČ",
    date: "Sub 5. feb · 19:00h ›",
    location: "Tennis Club Premium · 1km",
    duration: "120 MIN",
    level: "2.5+",
    trending: true,
    participants: 4,
    prize: "Profesionalni trener",
  },
  {
    id: "t3",
    type: "GRUPNI MEČ",
    date: "Pet 4. feb · 17:00h ›",
    location: "CN Montjuïc · 3km",
    duration: "180 MIN",
    level: "1.5",
    trending: true,
    participants: 8,
    prize: "Grupa od 8 igrača",
  },
];

export const HOT_PLAYERS = [
  {
    id: "p1",
    name: "Carlos 'El Rápido' Vega",
    level: "2.8",
    percentage: 95,
    avatar: "https://i.pravatar.cc/150?img=55",
    hotReason: "5 pobjeda zaredom",
    wins: 5,
  },
  {
    id: "p2",
    name: "Isabella Rodriguez",
    level: "2.2",
    percentage: 88,
    avatar: "https://i.pravatar.cc/150?img=44",
    hotReason: "Najbrži servisi",
    wins: 3,
  },
  {
    id: "p3",
    name: "Diego 'Maestro' Santos",
    level: "3.1",
    percentage: 92,
    avatar: "https://i.pravatar.cc/150?img=12",
    hotReason: "100% preciznost",
    wins: 4,
  },
];

export const PLAYER_PROFILES: Record<string, any> = {
  p1: {
    id: "p1",
    name: "Carlos 'El Rápido' Vega",
    username: "cvega",
    age: 29,
    location: "Barcelona, Španija",
    bio: "Profesionalni teniser sa 10 godina iskustva. Specijalizovan za brze servise i agresivan stil igre.",
    level: "2.8",
    matchPercentage: 95,
    avatar: "https://i.pravatar.cc/150?img=55",
    stats: {
      matches: 156,
      followers: "5.2k",
      following: 892,
    },
    sports: [
      { name: "Tenis", level: "2.8", active: true },
      { name: "Padel", level: "2.5", active: false },
      { name: "Badminton", level: "3.0", active: false },
    ],
    posts: [
      {
        image:
          "https://images.pexels.com/photos/32897040/pexels-photo-32897040.jpeg",
        name: "Carlos Vega",
        meta: "Barcelona · pre 1 sat",
        likes: "2,456 sviđanja",
        caption: "Pobeda u polufinalu! Još jedan korak do trofeja 🏆",
      },
      {
        image:
          "https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg",
        name: "Carlos Vega",
        meta: "Barcelona · pre 4 sata",
        likes: "1,823 sviđanja",
        caption: "Jutarnji trening. Rad na brzini servisa.",
      },
      {
        image:
          "https://images.pexels.com/photos/34079996/pexels-photo-34079996.jpeg",
        name: "Carlos Vega",
        meta: "Barcelona · juče",
        likes: "3,204 sviđanja",
        caption: "Pet pobeda zaredom! Forma je odlična.",
      },
    ],
    detailedStats: {
      dominantHand: { value: "Desna", sub: "Agresivni forhend" },
      position: { value: "Osnovna linija", sub: "Ofanzivan stil" },
      winPercentage: { value: "78%", sub: "Poslednjih 30" },
      matchesPlayed: { value: "156", sub: "Ukupno" },
    },
  },
  p2: {
    id: "p2",
    name: "Isabella Rodriguez",
    username: "isarodriguez",
    age: 25,
    location: "Madrid, Španija",
    bio: "Strastvena teniserka i trener. Volim da igram i učim nove tehnike. Uvek spremna za izazov!",
    level: "2.2",
    matchPercentage: 88,
    avatar: "https://i.pravatar.cc/150?img=44",
    stats: {
      matches: 98,
      followers: "3.8k",
      following: 654,
    },
    sports: [
      { name: "Tenis", level: "2.2", active: true },
      { name: "Padel", level: "1.8", active: false },
      { name: "Tenis sto", level: "2.0", active: false },
    ],
    posts: [
      {
        image:
          "https://images.pexels.com/photos/35646550/pexels-photo-35646550.jpeg",
        name: "Isabella Rodriguez",
        meta: "Madrid · pre 2 sata",
        likes: "1,967 sviđanja",
        caption: "Novi lični rekord na servisu! 182 km/h 🚀",
      },
      {
        image:
          "https://images.pexels.com/photos/32474981/pexels-photo-32474981.jpeg",
        name: "Isabella Rodriguez",
        meta: "Madrid · pre 6 sati",
        likes: "1,542 sviđanja",
        caption: "Trening sa ekipom. Uvek je zabavnije u grupi!",
      },
      {
        image:
          "https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg",
        name: "Isabella Rodriguez",
        meta: "Madrid · pre 1 dan",
        likes: "2,103 sviđanja",
        caption: "Naporan trening ali vredeo je. Radimo na tehnici.",
      },
    ],
    detailedStats: {
      dominantHand: { value: "Desna", sub: "Snažan bekhend" },
      position: { value: "Univerzalna", sub: "Fleksibilna igra" },
      winPercentage: { value: "71%", sub: "Poslednjih 30" },
      matchesPlayed: { value: "98", sub: "Ukupno" },
    },
  },
  p3: {
    id: "p3",
    name: "Diego 'Maestro' Santos",
    username: "diegosantos",
    age: 32,
    location: "Valencia, Španija",
    bio: "Tenis je moja strast i način života. Osvojio sam više od 50 lokalnih turnira. Idemo!",
    level: "3.1",
    matchPercentage: 92,
    avatar: "https://i.pravatar.cc/150?img=12",
    stats: {
      matches: 203,
      followers: "8.1k",
      following: 421,
    },
    sports: [
      { name: "Tenis", level: "3.1", active: true },
      { name: "Padel", level: "3.0", active: false },
      { name: "Squash", level: "2.5", active: false },
      { name: "Golf", level: null, active: false },
    ],
    posts: [
      {
        image:
          "https://images.pexels.com/photos/32897040/pexels-photo-32897040.jpeg",
        name: "Diego Santos",
        meta: "Valencia · pre 3 sata",
        likes: "4,521 sviđanja",
        caption: "Turnir gotov! Prvo mesto i još jedan trofej u kolekciji 🏆",
      },
      {
        image:
          "https://images.pexels.com/photos/34079996/pexels-photo-34079996.jpeg",
        name: "Diego Santos",
        meta: "Valencia · juče",
        likes: "3,892 sviđanja",
        caption: "Semifinale sutra. Fokus i koncentracija.",
      },
      {
        image:
          "https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg",
        name: "Diego Santos",
        meta: "Valencia · pre 2 dana",
        likes: "2,764 sviđanja",
        caption: "100% preciznost danas. Cijlevi su jasni.",
      },
      {
        image:
          "https://images.pexels.com/photos/32474981/pexels-photo-32474981.jpeg",
        name: "Diego Santos",
        meta: "Valencia · pre 3 dana",
        likes: "2,311 sviđanja",
        caption: "Intenzivan trening pred turnir. Spremni smo!",
      },
    ],
    detailedStats: {
      dominantHand: { value: "Desna", sub: "Preciznost i moć" },
      position: { value: "Dominira mrežu", sub: "Ofanzivna igra" },
      winPercentage: { value: "84%", sub: "Poslednjih 30" },
      matchesPlayed: { value: "203", sub: "Ukupno" },
    },
  },
};

export const TRENDING_CLUBS = [
  {
    id: "tc1",
    name: "Tennis Elite Academy",
    image:
      "https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg",
    distance: "1km",
    price: "25 €",
    trending: true,
    reason: "🔥 Novo otvoreno",
    rating: 4.9,
  },
  {
    id: "tc2",
    name: "Champions Padel Club",
    image:
      "https://images.pexels.com/photos/27151849/pexels-photo-27151849.jpeg",
    distance: "2km",
    price: "18 €",
    trending: true,
    reason: "🏆 Turnir ovaj vikend",
    rating: 4.8,
  },
  {
    id: "tc3",
    name: "Pro Sports Complex",
    image:
      "https://images.pexels.com/photos/34116480/pexels-photo-34116480.jpeg",
    distance: "3km",
    price: "22 €",
    trending: true,
    reason: "⭐ Najbolji u gradu",
    rating: 5.0,
  },
];

export const HOT_EVENTS = [
  {
    id: "e1",
    title: "Madrid Open Practice",
    subtitle: "Treninzi sa profesionalcima",
    date: "10-12 feb",
    location: "Tennis Club Premium",
    participants: 156,
    icon: "🎾",
    type: "workshop",
  },
  {
    id: "e2",
    title: "Ladies Night Tournament",
    subtitle: "Turnir samo za dame",
    date: "8 feb · 18:00h",
    location: "CN Montjuïc",
    participants: 64,
    icon: "🏆",
    type: "tournament",
  },
  {
    id: "e3",
    title: "Padel Master Class",
    subtitle: "Napredne tehnike sa trenerom",
    date: "9 feb · 16:00h",
    location: "Club Esportiu Europa",
    participants: 24,
    icon: "🎓",
    type: "training",
  },
];

// ============================================
// USER CIRCLES DATA
// ============================================
export const USER_CIRCLES = [
  {
    id: "c1",
    name: "Padel Prijatelji 🎾",
    type: "friends",
    members: 8,
    image: "https://images.pexels.com/photos/209841/pexels-photo-209841.jpeg",
    activity: "Aktivan",
    lastActivity: "Juče · Ana je kreirala novi mec",
    description: "Naša grupa za redovno igranje",
    isCreator: true,
  },
  {
    id: "c2",
    name: "Club Europa - Turnir Tim",
    type: "tournament",
    members: 16,
    image:
      "https://images.pexels.com/photos/27151849/pexels-photo-27151849.jpeg",
    activity: "Veoma aktivan",
    lastActivity: "Danas · 3 nova meca zakazana",
    description: "Timsko takmicenje u februaru",
    isCreator: false,
  },
  {
    id: "c3",
    name: "Ladies Power 💪",
    type: "club",
    members: 24,
    image:
      "https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg",
    activity: "Aktivan",
    lastActivity: "Pre 2 dana · Novi trening dodatan",
    description: "Ženski club za padel i tenis",
    isCreator: false,
  },
  {
    id: "c4",
    name: "Vikend Ratnici",
    type: "friends",
    members: 6,
    image: "https://images.pexels.com/photos/209841/pexels-photo-209841.jpeg",
    activity: "Umeren",
    lastActivity: "Pre nedelju · Marko je poslao poruku",
    description: "Igramo samo vikendom",
    isCreator: false,
  },
  {
    id: "c5",
    name: "Pro Training Group",
    type: "training",
    members: 12,
    image:
      "https://images.pexels.com/photos/27151849/pexels-photo-27151849.jpeg",
    activity: "Aktivan",
    lastActivity: "Danas · Novi video tutorial",
    description: "Napredni treninzi sa trenerom",
    isCreator: false,
  },
];

// ============================================
// PROFILE SCREEN DATA
// ============================================
export const PROFILE_INFO = {
  name: "Alejandra García González",
  username: "agarcia",
  age: 27,
  location: "Madrid, Madrid",
  bio: "Počela sam da igram tenis 2019. godine i od tada sam potpuno zavisna....",
  level: "1.1",
  matchPercentage: 76,
  avatar: "https://i.pravatar.cc/150?img=10",
  stats: {
    matches: 29,
    followers: "20k",
    following: 783,
  },
};

export const PROFILE_SPORTS = [
  { name: "Tenis", level: "1.1", active: true },
  { name: "Padel", level: "3.4", active: false },
  { name: "Fudbal", level: "2.0", active: false },
  { name: "Golf", level: null, active: false },
];

export const PROFILE_POSTS = [
  {
    image:
      "https://images.pexels.com/photos/32897040/pexels-photo-32897040.jpeg",
    name: "Alejandra García",
    meta: "Madrid · pre 2 sata",
    likes: "1,248 sviđanja",
    caption: "Jutarnji trening pre posla. Novi rekord na servisu.",
  },
  {
    image:
      "https://images.pexels.com/photos/34079996/pexels-photo-34079996.jpeg",
    name: "Alejandra García",
    meta: "Madrid · pre 5 sati",
    likes: "982 sviđanja",
    caption: "Popodnevni meč sa ekipom. Sjajna energija.",
  },
  {
    image: "https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg",
    name: "Alejandra García",
    meta: "Madrid · juče",
    likes: "2,031 sviđanje",
    caption: "Nova oprema, novi ciljevi. Idemo dalje.",
  },
  {
    image:
      "https://images.pexels.com/photos/32474981/pexels-photo-32474981.jpeg",
    name: "Alejandra García",
    meta: "Madrid · pre 2 dana",
    likes: "1,507 sviđanja",
    caption: "Sparring u zatvorenom terenu. Fokus na ritam.",
  },
  {
    image:
      "https://images.pexels.com/photos/35646550/pexels-photo-35646550.jpeg",
    name: "Alejandra García",
    meta: "Madrid · pre 3 dana",
    likes: "768 sviđanja",
    caption: "Kratak trening, ali kvalitetan. Tempo jak.",
  },
];

export const PROFILE_INFO_STATS = {
  dominantHand: {
    value: "Desna",
    sub: "Igra forhend",
  },
  position: {
    value: "Levo",
    sub: "Na mreži",
  },
  winPercentage: {
    value: "62%",
    sub: "Poslednjih 30",
  },
  matchesPlayed: {
    value: "142",
    sub: "Ukupno",
  },
};

// ============================================
// HELP CENTER DATA
// ============================================
export const FAQ_ITEMS = [
  {
    id: 1,
    question: "Kako da kreiram meč?",
    answer:
      "Idite na početnu stranicu i kliknite na dugme 'Kreiraj meč'. Izaberite klub, datum, vreme i pozovite igrače. Nakon potvrde, meč će biti kreiran.",
  },
  {
    id: 2,
    question: "Kako da pronađem igrače?",
    answer:
      "U tabu 'Zajednica' možete pretražiti igrače po nivou, lokaciji ili klubu. Takođe možete pregledati predložene igrače na početnoj stranici.",
  },
  {
    id: 3,
    question: "Šta znači procenat match-a?",
    answer:
      "Procenat match-a pokazuje koliko ste kompatibilni sa drugim igračem na osnovu nivoa, dostupnosti, lokacije i stilova igre.",
  },
  {
    id: 4,
    question: "Kako otkazati rezervaciju?",
    answer:
      "Otvorite detalje meča i kliknite na 'Otkaži rezervaciju'. Napomena: Otkazivanje manje od 24h pre meča može rezultirati naplatom.",
  },
  {
    id: 5,
    question: "Kako promeniti nivo igrača?",
    answer:
      "Idite u Profil > Profil informacije > Igračke informacije. Vaš nivo se automatski ažurira na osnovu rezultata mečeva.",
  },
  {
    id: 6,
    question: "Šta dobijam sa Pro planom?",
    answer:
      "Pro plan uključuje neograničene mečeve, naprednu statistiku, prioritetnu podršku i aplikaciju bez reklama.",
  },
];

export const HELP_CONTACT_OPTIONS = [
  {
    id: "email",
    icon: "envelope",
    title: "Email podrška",
    subtitle: "support@gridapp.com",
    color: "#3867FF",
  },
  {
    id: "chat",
    icon: "comment",
    title: "Live chat",
    subtitle: "Dostupan 9-17h",
    color: "#B8FF00",
  },
  {
    id: "phone",
    icon: "phone",
    title: "Telefon",
    subtitle: "+381 11 123 4567",
    color: "#8B8B8B",
  },
];

export const HELP_TOPICS = [
  { icon: "credit-card", title: "Plaćanje i pretplata", count: 12 },
  { icon: "calendar", title: "Rezervacije", count: 8 },
  { icon: "user", title: "Nalog i profil", count: 15 },
  { icon: "shield", title: "Bezbednost", count: 6 },
  { icon: "trophy", title: "Mečevi i turniri", count: 10 },
  { icon: "cog", title: "Podešavanja", count: 9 },
];

// ============================================
// ABOUT APP DATA
// ============================================
export const APP_INFO = {
  version: "1.2.4",
  buildNumber: "124",
  releaseDate: "12.02.2026",
};

export const TEAM_MEMBERS = [
  { name: "Marko Petrović", role: "CEO & Founder", avatar: 33 },
  { name: "Ana Jovanović", role: "Lead Designer", avatar: 47 },
  { name: "Stefan Nikolić", role: "Lead Developer", avatar: 52 },
  { name: "Jelena Đorđević", role: "Product Manager", avatar: 20 },
];

export const SOCIAL_LINKS = [
  {
    icon: "instagram",
    label: "Instagram",
    url: "https://instagram.com/gridapp",
  },
  { icon: "facebook", label: "Facebook", url: "https://facebook.com/gridapp" },
  { icon: "twitter", label: "Twitter", url: "https://twitter.com/gridapp" },
  {
    icon: "linkedin",
    label: "LinkedIn",
    url: "https://linkedin.com/company/gridapp",
  },
];

export const LEGAL_LINKS = [
  {
    icon: "file-text-o",
    title: "Uslovi korišćenja",
    subtitle: "Pravila i odredbe",
  },
  {
    icon: "shield",
    title: "Politika privatnosti",
    subtitle: "Kako čuvamo podatke",
  },
  { icon: "legal", title: "Licencni ugovori", subtitle: "Open source licence" },
  { icon: "info-circle", title: "GDPR", subtitle: "Zaštita podataka" },
];

// ============================================
// LANGUAGE DATA
// ============================================
export const LANGUAGES = [
  { id: "sr", name: "Srpski", nativeName: "Српски", flag: "🇷🇸" },
  { id: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { id: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { id: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { id: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { id: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { id: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { id: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { id: "hr", name: "Croatian", nativeName: "Hrvatski", flag: "🇭🇷" },
  { id: "bs", name: "Bosnian", nativeName: "Bosanski", flag: "🇧🇦" },
  { id: "mk", name: "Macedonian", nativeName: "Македонски", flag: "🇲🇰" },
  { id: "sl", name: "Slovenian", nativeName: "Slovenščina", flag: "🇸🇮" },
];

// ============================================
// SUBSCRIPTION & BILLING DATA
// ============================================
export const PAYMENT_HISTORY = [
  {
    id: 1,
    date: "15.01.2026",
    amount: "9.99 €",
    plan: "Pro Plan",
    status: "success",
  },
  {
    id: 2,
    date: "15.12.2025",
    amount: "9.99 €",
    plan: "Pro Plan",
    status: "success",
  },
  {
    id: 3,
    date: "15.11.2025",
    amount: "9.99 €",
    plan: "Pro Plan",
    status: "success",
  },
];

// ============================================
// UPGRADE PLANS DATA
// ============================================
export const UPGRADE_PLANS = [
  {
    id: "monthly",
    name: "Mesečni",
    price: "9.99 €",
    period: "mesečno",
    savings: null,
    popular: false,
  },
  {
    id: "yearly",
    name: "Godišnji",
    price: "79.99 €",
    period: "godišnje",
    savings: "Uštedi 33%",
    popular: true,
  },
  {
    id: "lifetime",
    name: "Doživotni",
    price: "199.99 €",
    period: "jednokratno",
    savings: "Najbolja ponuda",
    popular: false,
  },
];

export const UPGRADE_FEATURES = [
  {
    icon: "repeat",
    title: "Neograničeni mečevi",
    description: "Kreiraj koliko god mečeva želiš",
  },
  {
    icon: "bar-chart",
    title: "Napredna statistika",
    description: "Detaljne analize i grafici performansi",
  },
  {
    icon: "star",
    title: "Prioritetna podrška",
    description: "Brz odgovor od support tima",
  },
  {
    icon: "eye-slash",
    title: "Bez reklama",
    description: "Aplikacija bez ometajućih reklama",
  },
  {
    icon: "trophy",
    title: "Ekskluzivni turniri",
    description: "Pristup premium događajima",
  },
  {
    icon: "video-camera",
    title: "Video analiza",
    description: "Snimaj i analiziraj svoje mečeve",
  },
  {
    icon: "users",
    title: "Match prioritet",
    description: "Pojavi se na vrhu liste pretraga",
  },
  {
    icon: "calendar-check-o",
    title: "Automatsko zakazivanje",
    description: "AI predlaže najbolje termine",
  },
];

export const SUGGESTED_FRIENDS = [
  {
    id: 1,
    name: "Marko Jovanović",
    username: "@marko.tennis",
    avatar:
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
    mutualFriends: 3,
    isConnected: false,
  },
  {
    id: 2,
    name: "Ana Petrović",
    username: "@ana_petro",
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
    mutualFriends: 7,
    isConnected: false,
  },
  {
    id: 3,
    name: "Stefan Nikolić",
    username: "@stefan.n",
    avatar: "https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpg",
    mutualFriends: 2,
    isConnected: true,
  },
  {
    id: 4,
    name: "Milica Stojanović",
    username: "@milica_s",
    avatar:
      "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg",
    mutualFriends: 12,
    isConnected: false,
  },
  {
    id: 5,
    name: "Nikola Milanović",
    username: "@nikola.milan",
    avatar:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
    mutualFriends: 1,
    isConnected: false,
  },
];

export const SUGGESTED_USERS = [
  {
    id: 1,
    name: "Marko Petrović",
    avatar: "https://i.pravatar.cc/150?img=13",
    subtitle: "Igra padel",
  },
  {
    id: 2,
    name: "Ana Jovanović",
    avatar: "https://i.pravatar.cc/150?img=25",
    subtitle: "Aktivna u grupi",
  },
  {
    id: 3,
    name: "Nikola Đorđević",
    avatar: "https://i.pravatar.cc/150?img=32",
    subtitle: "Često igra vikendima",
  },
  {
    id: 4,
    name: "Jelena Stojanović",
    avatar: "https://i.pravatar.cc/150?img=44",
    subtitle: "Padel entuzijasta",
  },
  {
    id: 5,
    name: "Stefan Nikolić",
    avatar: "https://i.pravatar.cc/150?img=56",
    subtitle: "Pro igrač",
  },
];

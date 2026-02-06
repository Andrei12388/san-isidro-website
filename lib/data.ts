// ================= TYPES =================

export type Role = "admin" | "member";

export type Gender = "Male" | "Female";

export type Level =
  | "pastor"
  | "head"
  | "cluster"
  | "vine"
  | "disciple";

export interface Member {
  email: string;
  id: number;
  password: string;
  name: string;
  age: number;
  phone: string;
  gender: Gender;
  address: string;
  bio: string;
  level: Level;
  mentor_id: number;
  group_name: string;
  image: string;
}

export interface Attendance {
  date: string; // or Date if you prefer
  male: number;
  female: number;
}

// ================= DATA =================

export let role: Role = "admin";

export const membersData: Member[] = [
  {
    email: "juan.delacruz@gmail.com",
    id: 1,
    password: "12345678",
    name: "Juan Dela Cruz",
    age: 28,
    phone: "09171234567",
    gender: "Male",
    address: "Quezon City, Metro Manila, Philippines",
    bio: "Passionate about community outreach.",
    level: "cluster",
    mentor_id: 0,
    group_name: "Genesis",
    image: "/profile/juan/proPic.jpg",
  },
  {
    email: "maria.santos@gmail.com",
    id: 2,
    password: "password12",
    name: "Maria Santos",
    age: 24,
    phone: "09182345678",
    gender: "Female",
    address: "Cebu City, Cebu, Philippines",
    bio: "Youth ministry volunteer.",
    level: "vine",
    mentor_id: 1,
    group_name: "Exodus",
    image: "/profile/maria/proPic.jpg",
  },
  {
    email: "paolo.reyes@gmail.com",
    id: 3,
    password: "pass1234",
    name: "Paolo Reyes",
    age: 30,
    phone: "09193456789",
    gender: "Male",
    address: "Davao City, Davao del Sur, Philippines",
    bio: "Enjoys leading small groups.",
    level: "head",
    mentor_id: 2,
    group_name: "Matthew",
    image: "/profile/paolo/proPic.jpg",
  },
  {
    email: "anna.lopez@gmail.com",
    id: 4,
    password: "anna1234",
    name: "Anna Lopez",
    age: 22,
    phone: "09911234567",
    gender: "Female",
    address: "Baguio City, Benguet, Philippines",
    bio: "Music team member.",
    level: "disciple",
    mentor_id: 3,
    group_name: "Luke",
    image: "/profile/anna/proPic.jpg",
  },
  {
    email: "mark.garcia@gmail.com",
    id: 5,
    password: "mark5678",
    name: "Mark Garcia",
    age: 27,
    phone: "09174567890",
    gender: "Male",
    address: "Iloilo City, Iloilo, Philippines",
    bio: "Helps with logistics and events.",
    level: "disciple",
    mentor_id: 3,
    group_name: "John",
    image: "/profile/mark/proPic.jpg",
  },
  {
    email: "jessa.ramos@gmail.com",
    id: 6,
    password: "jessa111",
    name: "Jessa Ramos",
    age: 25,
    phone: "09201234567",
    gender: "Female",
    address: "Taguig City, Metro Manila, Philippines",
    bio: "Community prayer leader.",
    level: "head",
    mentor_id: 2,
    group_name: "Acts",
    image: "/profile/jessa/proPic.jpg",
  },
  {
    email: "daniel.mendoza@gmail.com",
    id: 7,
    password: "daniel222",
    name: "Daniel Mendoza",
    age: 29,
    phone: "09351234567",
    gender: "Male",
    address: "Bacolod City, Negros Occidental, Philippines",
    bio: "Tech support volunteer.",
    level: "disciple",
    mentor_id: 6,
    group_name: "Romans",
    image: "/profile/daniel/proPic.jpg",
  },
  {
    email: "clarisse.tan@gmail.com",
    id: 8,
    password: "clarisse333",
    name: "Clarisse Tan",
    age: 23,
    phone: "09451234567",
    gender: "Female",
    address: "Pasig City, Metro Manila, Philippines",
    bio: "Kids ministry teacher.",
    level: "vine",
    mentor_id: 1,
    group_name: "Corinthians",
    image: "/profile/clarisse/proPic.jpg",
  },
  {
    email: "leo.castillo@gmail.com",
    id: 9,
    password: "leo4444",
    name: "Leo Castillo",
    age: 31,
    phone: "09551234567",
    gender: "Male",
    address: "Cagayan de Oro City, Misamis Oriental, Philippines",
    bio: "Leads discipleship classes.",
    level: "head",
    mentor_id: 8,
    group_name: "Ephesians",
    image: "/profile/leo/proPic.jpg",
  },
  {
    email: "michelle.flores@gmail.com",
    id: 10,
    password: "michelle555",
    name: "Michelle Flores",
    age: 26,
    phone: "09661234567",
    gender: "Female",
    address: "Antipolo City, Rizal, Philippines",
    bio: "Active in outreach missions.",
    level: "disciple",
    mentor_id: 9,
    group_name: "Philippians",
    image: "/profile/michelle/proPic.jpg",
  },
  {
    email: "robertandreib.up@gmail.com",
    id: 11,
    password: "12345678",
    name: "Robert Andrei Bardoquillo",
    age: 26,
    phone: "N/A",
    gender: "Male",
    address: "N/A",
    bio: "",
    level: "disciple",
    mentor_id: 0,
    group_name: "",
    image: "/images/userIcon.png",
  },
  {
    email: "robertandrewb.up@gmail.com",
    id: 12,
    password: "87654321",
    name: "Robert Andrew Bardoquillo",
    age: 24,
    phone: "N/A",
    gender: "Male",
    address: "N/A",
    bio: "",
    level: "disciple",
    mentor_id: 0,
    group_name: "",
    image: "/images/userIcon.png",
  },
];

export const attendanceData = [
  { date: "2026-02-01", male: 18, female: 22 },
  { date: "2026-02-08", male: 27, female: 29 },
  { date: "2026-02-15", male: 17, female: 16 },
  { date: "2026-02-22", male: 36, female: 38 },

  { date: "2026-03-01", male: 19, female: 22 },
  { date: "2026-03-08", male: 28, female: 26 },
  { date: "2026-03-15", male: 24, female: 27 },
  { date: "2026-03-22", male: 31, female: 34 },
  { date: "2026-03-29", male: 29, female: 30 },

  { date: "2026-04-05", male: 35, female: 33 },
  { date: "2026-04-12", male: 26, female: 28 },
  { date: "2026-04-19", male: 32, female: 31 },
  { date: "2026-04-26", male: 30, female: 29 },

  { date: "2026-05-03", male: 34, female: 36 },
  { date: "2026-05-10", male: 28, female: 30 },
  { date: "2026-05-17", male: 33, female: 35 },
  { date: "2026-05-24", male: 27, female: 29 },
  { date: "2026-05-31", male: 38, female: 40 },

  { date: "2026-06-07", male: 31, female: 32 },
  { date: "2026-06-14", male: 29, female: 30 },
  { date: "2026-06-21", male: 36, female: 37 },
  { date: "2026-06-28", male: 40, female: 42 },
]



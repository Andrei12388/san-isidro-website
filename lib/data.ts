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
  birthday: string | null;
  ministry: string;
}

export interface Attendance {
  date: string; // or Date if you prefer
  male: number;
  female: number;
}

// ================= DATA =================

export let role: Role = "admin";

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



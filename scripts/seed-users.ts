/**
 * Seed script to create user documents in Firebase
 * Run with: npx tsx scripts/seed-users.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Firebase config from env
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("Firebase config:", {
  projectId: firebaseConfig.projectId,
  apiKey: firebaseConfig.apiKey ? "***" : "MISSING",
});

if (!firebaseConfig.projectId) {
  console.error("❌ Missing Firebase projectId. Check .env.local file.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Grade mapping: English letter -> Hebrew letter
const gradeMap: Record<string, string> = {
  a: "א",
  b: "ב",
  c: "ג",
  d: "ד",
  e: "ה",
  f: "ו",
};

type UserRole = "admin" | "teacher" | "parent" | "student";

interface UserData {
  password: string;
  role: UserRole;
  grade: string | null;
}

// Define all users to create
const users: UserData[] = [
  // Admin
  { password: "admin-stem2026", role: "admin", grade: null },

  // Teachers (one per grade)
  { password: "teacher-a", role: "teacher", grade: "א" },
  { password: "teacher-b", role: "teacher", grade: "ב" },
  { password: "teacher-c", role: "teacher", grade: "ג" },
  { password: "teacher-d", role: "teacher", grade: "ד" },
  { password: "teacher-e", role: "teacher", grade: "ה" },
  { password: "teacher-f", role: "teacher", grade: "ו" },

  // Parents (one per grade)
  { password: "parent-a", role: "parent", grade: "א" },
  { password: "parent-b", role: "parent", grade: "ב" },
  { password: "parent-c", role: "parent", grade: "ג" },
  { password: "parent-d", role: "parent", grade: "ד" },
  { password: "parent-e", role: "parent", grade: "ה" },
  { password: "parent-f", role: "parent", grade: "ו" },

  // Students (one per grade)
  { password: "zzz-a", role: "student", grade: "א" },
  { password: "zzz-b", role: "student", grade: "ב" },
  { password: "zzz-c", role: "student", grade: "ג" },
  { password: "zzz-d", role: "student", grade: "ד" },
  { password: "zzz-e", role: "student", grade: "ה" },
  { password: "zzz-f", role: "student", grade: "ו" },
];

async function seedUsers() {
  console.log("🌱 Seeding users to Firebase...\n");

  for (const user of users) {
    try {
      await setDoc(doc(db, "users", user.password), {
        role: user.role,
        grade: user.grade,
        createdAt: serverTimestamp(),
      });
      console.log(`✅ Created: ${user.password} (${user.role}${user.grade ? ` - grade ${user.grade}` : ""})`);
    } catch (error) {
      console.error(`❌ Failed to create ${user.password}:`, error);
    }
  }

  console.log("\n✨ Seeding complete!");
  console.log("\nUsers created:");
  console.log("┌─────────────────────┬──────────┬───────┐");
  console.log("│ Password            │ Role     │ Grade │");
  console.log("├─────────────────────┼──────────┼───────┤");
  for (const user of users) {
    const pwd = user.password.padEnd(19);
    const role = user.role.padEnd(8);
    const grade = (user.grade || "-").padEnd(5);
    console.log(`│ ${pwd} │ ${role} │ ${grade} │`);
  }
  console.log("└─────────────────────┴──────────┴───────┘");

  process.exit(0);
}

seedUsers();

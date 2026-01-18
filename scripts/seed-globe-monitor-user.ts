/**
 * Seed script to create the Globe Monitor reporter user
 * Run with: npx tsx scripts/seed-globe-monitor-user.ts
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

async function seedGlobeMonitorUser() {
  console.log("🌍 Creating Globe Monitor reporter user...\n");

  try {
    // Use merge to avoid overwriting existing data if user already exists
    await setDoc(doc(db, "users", "ggg"), {
      role: "student",
      grade: "ו",
      canSubmitGlobeMonitor: true,
      createdAt: serverTimestamp(),
    }, { merge: true });
    console.log("✅ Created/Updated: ggg (student - grade ו - Globe Monitor reporter)");
    console.log("\n✨ User created successfully!");
    console.log("\nUser details:");
    console.log("┌─────────────┬──────────┬───────┬─────────────────────┐");
    console.log("│ Password    │ Role     │ Grade │ Special             │");
    console.log("├─────────────┼──────────┼───────┼─────────────────────┤");
    console.log("│ ggg         │ student  │ ו     │ Globe Monitor       │");
    console.log("└─────────────┴──────────┴───────┴─────────────────────┘");
  } catch (error) {
    console.error("❌ Failed to create user:", error);
  }

  process.exit(0);
}

seedGlobeMonitorUser();

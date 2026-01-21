/**
 * Migration script to add authorGrade to existing student forum posts
 * Run with: npx tsx scripts/migrate-student-forum-add-grade.ts
 *
 * This script:
 * 1. Fetches all posts from the student-forum collection
 * 2. Adds authorGrade field to posts that don't have it
 * 3. By default, assigns grade "ד" (can be changed via command line argument)
 *
 * Usage:
 *   npx tsx scripts/migrate-student-forum-add-grade.ts        # Default grade ד
 *   npx tsx scripts/migrate-student-forum-add-grade.ts ג      # Use grade ג
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

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

// Get grade from command line argument or default to ד
const defaultGrade = process.argv[2] || "ד";
const validGrades = ["א", "ב", "ג", "ד", "ה", "ו"];

if (!validGrades.includes(defaultGrade)) {
  console.error(`❌ Invalid grade "${defaultGrade}". Must be one of: ${validGrades.join(", ")}`);
  process.exit(1);
}

interface ForumPostDoc {
  id: string;
  authorName: string;
  authorGrade?: string;
  title: string;
  content: string;
  createdAt?: { seconds: number };
}

async function migrateStudentForumPosts() {
  console.log(`🔄 Starting student forum migration (default grade: ${defaultGrade})...\n`);

  // Fetch all student forum posts
  const snapshot = await getDocs(collection(db, "student-forum"));
  const posts: ForumPostDoc[] = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as ForumPostDoc[];

  console.log(`📋 Found ${posts.length} posts in student-forum collection\n`);

  if (posts.length === 0) {
    console.log("✅ No posts to migrate");
    process.exit(0);
  }

  let updatedCount = 0;
  let skippedCount = 0;

  // Process each post
  for (const post of posts) {
    if (post.authorGrade) {
      console.log(`  ⏭️  "${post.title}" by ${post.authorName}: already has grade "${post.authorGrade}"`);
      skippedCount++;
      continue;
    }

    // Determine grade: use "all" for admin posts, defaultGrade for student posts
    const isLikelyAdmin = post.authorName === "מנהל" || post.authorName === "עדי לוי" || post.authorName.includes("admin");
    const gradeToAssign = isLikelyAdmin ? "all" : defaultGrade;

    try {
      await updateDoc(doc(db, "student-forum", post.id), {
        authorGrade: gradeToAssign,
      });
      console.log(`  ✅ "${post.title}" by ${post.authorName}: added grade "${gradeToAssign}"${isLikelyAdmin ? " (detected as admin)" : ""}`);
      updatedCount++;
    } catch (error) {
      console.error(`  ❌ Failed to update "${post.title}":`, error);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Migration Summary");
  console.log("=".repeat(50));
  console.log(`Total posts: ${posts.length}`);
  console.log(`Updated: ${updatedCount} posts`);
  console.log(`Skipped (already had grade): ${skippedCount} posts`);
  console.log(`Default grade used: ${defaultGrade}`);
  console.log("=".repeat(50));
  console.log("\n✨ Migration complete!");

  process.exit(0);
}

migrateStudentForumPosts().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});

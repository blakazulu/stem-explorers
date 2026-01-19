/**
 * Migration script to remove unitId from all questionnaires
 * Run with: npx tsx scripts/migrate-questionnaires-remove-unitId.ts
 *
 * This script:
 * 1. Fetches all questionnaires from Firestore
 * 2. Removes the unitId field from each questionnaire
 * 3. Resolves duplicate active questionnaires per grade (keeps most recent)
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
  deleteField,
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

interface QuestionnaireDoc {
  id: string;
  name: string;
  gradeId: string;
  unitId?: string;
  isActive: boolean;
  updatedAt?: { seconds: number };
}

async function migrateQuestionnaires() {
  console.log("🔄 Starting questionnaire migration...\n");

  // Fetch all questionnaires
  const snapshot = await getDocs(collection(db, "questionnaires"));
  const questionnaires: QuestionnaireDoc[] = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as QuestionnaireDoc[];

  console.log(`📋 Found ${questionnaires.length} questionnaires\n`);

  if (questionnaires.length === 0) {
    console.log("✅ No questionnaires to migrate");
    process.exit(0);
  }

  let removedUnitIdCount = 0;
  let deactivatedCount = 0;

  // Group by grade to find duplicate actives
  const byGrade = new Map<string, QuestionnaireDoc[]>();
  for (const q of questionnaires) {
    const list = byGrade.get(q.gradeId) || [];
    list.push(q);
    byGrade.set(q.gradeId, list);
  }

  // Process each questionnaire
  for (const q of questionnaires) {
    const updates: Record<string, unknown> = {};
    let needsUpdate = false;

    // Remove unitId if present
    if ("unitId" in q && q.unitId !== undefined) {
      console.log(`  📝 ${q.name} (${q.gradeId}): removing unitId "${q.unitId}"`);
      removedUnitIdCount++;
      needsUpdate = true;
    }

    if (needsUpdate) {
      try {
        await updateDoc(doc(db, "questionnaires", q.id), {
          unitId: deleteField(),
        });
        console.log(`  ✅ Updated ${q.name}`);
      } catch (error) {
        console.error(`  ❌ Failed to update ${q.name}:`, error);
      }
    }
  }

  // Handle duplicate active questionnaires per grade
  console.log("\n🔍 Checking for duplicate active questionnaires per grade...\n");

  for (const [gradeId, gradeQuestionnaires] of byGrade) {
    const activeOnes = gradeQuestionnaires.filter((q) => q.isActive);

    if (activeOnes.length > 1) {
      console.log(`  ⚠️  Grade ${gradeId}: Found ${activeOnes.length} active questionnaires`);

      // Sort by updatedAt descending, keep the most recent one active
      activeOnes.sort((a, b) => {
        const aTime = a.updatedAt?.seconds || 0;
        const bTime = b.updatedAt?.seconds || 0;
        return bTime - aTime;
      });

      const keep = activeOnes[0];
      const toDeactivate = activeOnes.slice(1);

      console.log(`     Keeping active: "${keep.name}"`);

      for (const q of toDeactivate) {
        try {
          await updateDoc(doc(db, "questionnaires", q.id), {
            isActive: false,
          });
          console.log(`     ✅ Deactivated: "${q.name}"`);
          deactivatedCount++;
        } catch (error) {
          console.error(`     ❌ Failed to deactivate "${q.name}":`, error);
        }
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Migration Summary");
  console.log("=".repeat(50));
  console.log(`Total questionnaires: ${questionnaires.length}`);
  console.log(`Removed unitId from: ${removedUnitIdCount} questionnaires`);
  console.log(`Deactivated duplicates: ${deactivatedCount} questionnaires`);
  console.log("=".repeat(50));
  console.log("\n✨ Migration complete!");

  process.exit(0);
}

migrateQuestionnaires().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});

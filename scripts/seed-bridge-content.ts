/**
 * Seed script for Bridge Building game content
 * Run with: npx tsx scripts/seed-bridge-content.ts
 *
 * Creates Hebrew bridge building challenges for all grades (א-ו) and difficulties (easy/medium/hard)
 * 3 challenges per grade/difficulty = 54 total
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

type Grade = "א" | "ב" | "ג" | "ד" | "ה" | "ו";
type Difficulty = "easy" | "medium" | "hard";

interface BridgeMaterial {
  type: string;
  cost: number;
  strength: number;
}

interface BridgeContentData {
  gapWidth: number;
  budget: number;
  materials: BridgeMaterial[];
  vehicleWeight: number;
}

// =============================================================================
// BRIDGE CONTENT DATA
// Organized by grade, then difficulty
// Each entry has: gapWidth, budget, materials, vehicleWeight
//
// Design principles:
// - Grade א-ב: Small gaps (40-60m), high budget, simple materials, light vehicles
// - Grade ג-ד: Medium gaps (60-80m), moderate budget, more material variety
// - Grade ה-ו: Large gaps (80-100m), tight budget, complex trade-offs
// =============================================================================

const BRIDGE_CONTENT: Record<Grade, Record<Difficulty, BridgeContentData[]>> = {
  // Grade א (1st grade) - Very simple, generous budget
  א: {
    easy: [
      {
        gapWidth: 40,
        budget: 200,
        materials: [
          { type: "wood", cost: 20, strength: 50 },
          { type: "rope", cost: 10, strength: 30 },
        ],
        vehicleWeight: 30,
      },
      {
        gapWidth: 40,
        budget: 180,
        materials: [
          { type: "wood", cost: 20, strength: 50 },
          { type: "bamboo", cost: 15, strength: 40 },
        ],
        vehicleWeight: 35,
      },
      {
        gapWidth: 40,
        budget: 220,
        materials: [
          { type: "wood", cost: 25, strength: 60 },
          { type: "rope", cost: 10, strength: 25 },
        ],
        vehicleWeight: 25,
      },
    ],
    medium: [
      {
        gapWidth: 50,
        budget: 200,
        materials: [
          { type: "wood", cost: 25, strength: 55 },
          { type: "bamboo", cost: 15, strength: 40 },
          { type: "rope", cost: 10, strength: 25 },
        ],
        vehicleWeight: 40,
      },
      {
        gapWidth: 50,
        budget: 190,
        materials: [
          { type: "wood", cost: 20, strength: 50 },
          { type: "bamboo", cost: 18, strength: 45 },
        ],
        vehicleWeight: 45,
      },
      {
        gapWidth: 55,
        budget: 210,
        materials: [
          { type: "wood", cost: 22, strength: 52 },
          { type: "rope", cost: 12, strength: 30 },
        ],
        vehicleWeight: 35,
      },
    ],
    hard: [
      {
        gapWidth: 60,
        budget: 180,
        materials: [
          { type: "wood", cost: 25, strength: 55 },
          { type: "bamboo", cost: 18, strength: 45 },
          { type: "rope", cost: 10, strength: 28 },
        ],
        vehicleWeight: 50,
      },
      {
        gapWidth: 60,
        budget: 170,
        materials: [
          { type: "wood", cost: 28, strength: 60 },
          { type: "bamboo", cost: 15, strength: 40 },
        ],
        vehicleWeight: 55,
      },
      {
        gapWidth: 65,
        budget: 200,
        materials: [
          { type: "wood", cost: 25, strength: 50 },
          { type: "bamboo", cost: 20, strength: 48 },
          { type: "rope", cost: 12, strength: 30 },
        ],
        vehicleWeight: 45,
      },
    ],
  },

  // Grade ב (2nd grade) - Simple with slightly more challenge
  ב: {
    easy: [
      {
        gapWidth: 45,
        budget: 180,
        materials: [
          { type: "wood", cost: 22, strength: 55 },
          { type: "bamboo", cost: 15, strength: 40 },
        ],
        vehicleWeight: 40,
      },
      {
        gapWidth: 50,
        budget: 200,
        materials: [
          { type: "wood", cost: 25, strength: 60 },
          { type: "rope", cost: 12, strength: 30 },
        ],
        vehicleWeight: 35,
      },
      {
        gapWidth: 45,
        budget: 190,
        materials: [
          { type: "wood", cost: 20, strength: 50 },
          { type: "bamboo", cost: 18, strength: 45 },
          { type: "plastic", cost: 15, strength: 35 },
        ],
        vehicleWeight: 40,
      },
    ],
    medium: [
      {
        gapWidth: 55,
        budget: 180,
        materials: [
          { type: "wood", cost: 25, strength: 60 },
          { type: "bamboo", cost: 20, strength: 50 },
          { type: "rope", cost: 10, strength: 25 },
        ],
        vehicleWeight: 50,
      },
      {
        gapWidth: 60,
        budget: 200,
        materials: [
          { type: "wood", cost: 28, strength: 65 },
          { type: "plastic", cost: 18, strength: 40 },
        ],
        vehicleWeight: 55,
      },
      {
        gapWidth: 55,
        budget: 175,
        materials: [
          { type: "wood", cost: 25, strength: 58 },
          { type: "bamboo", cost: 18, strength: 48 },
          { type: "rope", cost: 12, strength: 28 },
        ],
        vehicleWeight: 45,
      },
    ],
    hard: [
      {
        gapWidth: 65,
        budget: 180,
        materials: [
          { type: "wood", cost: 30, strength: 70 },
          { type: "bamboo", cost: 20, strength: 50 },
          { type: "rope", cost: 10, strength: 25 },
        ],
        vehicleWeight: 60,
      },
      {
        gapWidth: 70,
        budget: 200,
        materials: [
          { type: "wood", cost: 28, strength: 65 },
          { type: "plastic", cost: 20, strength: 45 },
          { type: "bamboo", cost: 22, strength: 52 },
        ],
        vehicleWeight: 55,
      },
      {
        gapWidth: 65,
        budget: 170,
        materials: [
          { type: "wood", cost: 30, strength: 68 },
          { type: "bamboo", cost: 18, strength: 45 },
        ],
        vehicleWeight: 65,
      },
    ],
  },

  // Grade ג (3rd grade) - Intermediate challenges
  ג: {
    easy: [
      {
        gapWidth: 55,
        budget: 200,
        materials: [
          { type: "wood", cost: 25, strength: 60 },
          { type: "steel", cost: 40, strength: 100 },
          { type: "bamboo", cost: 18, strength: 45 },
        ],
        vehicleWeight: 55,
      },
      {
        gapWidth: 60,
        budget: 220,
        materials: [
          { type: "wood", cost: 28, strength: 65 },
          { type: "steel", cost: 45, strength: 110 },
          { type: "rope", cost: 12, strength: 30 },
        ],
        vehicleWeight: 60,
      },
      {
        gapWidth: 55,
        budget: 190,
        materials: [
          { type: "wood", cost: 25, strength: 58 },
          { type: "bamboo", cost: 20, strength: 50 },
          { type: "plastic", cost: 15, strength: 38 },
        ],
        vehicleWeight: 50,
      },
    ],
    medium: [
      {
        gapWidth: 65,
        budget: 200,
        materials: [
          { type: "wood", cost: 30, strength: 70 },
          { type: "steel", cost: 50, strength: 120 },
          { type: "bamboo", cost: 20, strength: 50 },
          { type: "rope", cost: 10, strength: 25 },
        ],
        vehicleWeight: 70,
      },
      {
        gapWidth: 70,
        budget: 220,
        materials: [
          { type: "steel", cost: 55, strength: 130 },
          { type: "wood", cost: 28, strength: 65 },
          { type: "plastic", cost: 18, strength: 40 },
        ],
        vehicleWeight: 80,
      },
      {
        gapWidth: 65,
        budget: 190,
        materials: [
          { type: "wood", cost: 32, strength: 75 },
          { type: "steel", cost: 48, strength: 115 },
          { type: "bamboo", cost: 22, strength: 55 },
        ],
        vehicleWeight: 75,
      },
    ],
    hard: [
      {
        gapWidth: 75,
        budget: 200,
        materials: [
          { type: "steel", cost: 55, strength: 130 },
          { type: "wood", cost: 30, strength: 70 },
          { type: "bamboo", cost: 20, strength: 50 },
          { type: "rope", cost: 12, strength: 28 },
        ],
        vehicleWeight: 90,
      },
      {
        gapWidth: 80,
        budget: 230,
        materials: [
          { type: "steel", cost: 60, strength: 140 },
          { type: "concrete", cost: 50, strength: 120 },
          { type: "wood", cost: 28, strength: 65 },
        ],
        vehicleWeight: 100,
      },
      {
        gapWidth: 75,
        budget: 190,
        materials: [
          { type: "steel", cost: 52, strength: 125 },
          { type: "wood", cost: 32, strength: 72 },
          { type: "plastic", cost: 20, strength: 45 },
        ],
        vehicleWeight: 85,
      },
    ],
  },

  // Grade ד (4th grade) - More complex materials and trade-offs
  ד: {
    easy: [
      {
        gapWidth: 60,
        budget: 220,
        materials: [
          { type: "steel", cost: 50, strength: 120 },
          { type: "wood", cost: 28, strength: 65 },
          { type: "concrete", cost: 45, strength: 100 },
        ],
        vehicleWeight: 70,
      },
      {
        gapWidth: 65,
        budget: 240,
        materials: [
          { type: "steel", cost: 55, strength: 130 },
          { type: "wood", cost: 30, strength: 70 },
          { type: "bamboo", cost: 22, strength: 55 },
        ],
        vehicleWeight: 75,
      },
      {
        gapWidth: 60,
        budget: 210,
        materials: [
          { type: "steel", cost: 48, strength: 115 },
          { type: "concrete", cost: 42, strength: 95 },
          { type: "plastic", cost: 20, strength: 45 },
        ],
        vehicleWeight: 65,
      },
    ],
    medium: [
      {
        gapWidth: 75,
        budget: 240,
        materials: [
          { type: "steel", cost: 60, strength: 140 },
          { type: "concrete", cost: 50, strength: 110 },
          { type: "wood", cost: 30, strength: 68 },
          { type: "bamboo", cost: 22, strength: 52 },
        ],
        vehicleWeight: 95,
      },
      {
        gapWidth: 80,
        budget: 260,
        materials: [
          { type: "steel", cost: 65, strength: 150 },
          { type: "concrete", cost: 55, strength: 120 },
          { type: "wood", cost: 32, strength: 72 },
        ],
        vehicleWeight: 110,
      },
      {
        gapWidth: 75,
        budget: 230,
        materials: [
          { type: "steel", cost: 58, strength: 135 },
          { type: "concrete", cost: 48, strength: 105 },
          { type: "plastic", cost: 22, strength: 48 },
          { type: "rope", cost: 12, strength: 28 },
        ],
        vehicleWeight: 100,
      },
    ],
    hard: [
      {
        gapWidth: 85,
        budget: 250,
        materials: [
          { type: "steel", cost: 65, strength: 150 },
          { type: "concrete", cost: 55, strength: 125 },
          { type: "wood", cost: 30, strength: 68 },
          { type: "carbon", cost: 80, strength: 180 },
        ],
        vehicleWeight: 130,
      },
      {
        gapWidth: 90,
        budget: 280,
        materials: [
          { type: "steel", cost: 70, strength: 160 },
          { type: "concrete", cost: 58, strength: 130 },
          { type: "carbon", cost: 85, strength: 190 },
        ],
        vehicleWeight: 150,
      },
      {
        gapWidth: 85,
        budget: 240,
        materials: [
          { type: "steel", cost: 62, strength: 145 },
          { type: "concrete", cost: 52, strength: 118 },
          { type: "wood", cost: 32, strength: 70 },
        ],
        vehicleWeight: 120,
      },
    ],
  },

  // Grade ה (5th grade) - Advanced challenges with tight budgets
  ה: {
    easy: [
      {
        gapWidth: 70,
        budget: 250,
        materials: [
          { type: "steel", cost: 60, strength: 140 },
          { type: "concrete", cost: 50, strength: 110 },
          { type: "wood", cost: 30, strength: 68 },
          { type: "carbon", cost: 75, strength: 175 },
        ],
        vehicleWeight: 100,
      },
      {
        gapWidth: 75,
        budget: 270,
        materials: [
          { type: "steel", cost: 65, strength: 150 },
          { type: "concrete", cost: 55, strength: 120 },
          { type: "bamboo", cost: 25, strength: 58 },
        ],
        vehicleWeight: 110,
      },
      {
        gapWidth: 70,
        budget: 240,
        materials: [
          { type: "steel", cost: 58, strength: 135 },
          { type: "concrete", cost: 48, strength: 105 },
          { type: "carbon", cost: 70, strength: 165 },
          { type: "plastic", cost: 22, strength: 48 },
        ],
        vehicleWeight: 95,
      },
    ],
    medium: [
      {
        gapWidth: 85,
        budget: 280,
        materials: [
          { type: "steel", cost: 68, strength: 155 },
          { type: "concrete", cost: 58, strength: 130 },
          { type: "carbon", cost: 85, strength: 195 },
          { type: "wood", cost: 30, strength: 68 },
        ],
        vehicleWeight: 140,
      },
      {
        gapWidth: 90,
        budget: 300,
        materials: [
          { type: "steel", cost: 72, strength: 165 },
          { type: "concrete", cost: 62, strength: 140 },
          { type: "carbon", cost: 90, strength: 210 },
        ],
        vehicleWeight: 160,
      },
      {
        gapWidth: 85,
        budget: 270,
        materials: [
          { type: "steel", cost: 65, strength: 150 },
          { type: "concrete", cost: 55, strength: 125 },
          { type: "stone", cost: 45, strength: 100 },
          { type: "plastic", cost: 25, strength: 52 },
        ],
        vehicleWeight: 130,
      },
    ],
    hard: [
      {
        gapWidth: 95,
        budget: 300,
        materials: [
          { type: "steel", cost: 75, strength: 170 },
          { type: "concrete", cost: 65, strength: 145 },
          { type: "carbon", cost: 95, strength: 220 },
          { type: "stone", cost: 50, strength: 110 },
        ],
        vehicleWeight: 180,
      },
      {
        gapWidth: 100,
        budget: 320,
        materials: [
          { type: "steel", cost: 80, strength: 180 },
          { type: "concrete", cost: 68, strength: 150 },
          { type: "carbon", cost: 100, strength: 235 },
        ],
        vehicleWeight: 200,
      },
      {
        gapWidth: 95,
        budget: 280,
        materials: [
          { type: "steel", cost: 72, strength: 165 },
          { type: "concrete", cost: 60, strength: 135 },
          { type: "carbon", cost: 88, strength: 205 },
          { type: "wood", cost: 32, strength: 72 },
        ],
        vehicleWeight: 170,
      },
    ],
  },

  // Grade ו (6th grade) - Expert level challenges with complex trade-offs
  ו: {
    easy: [
      {
        gapWidth: 80,
        budget: 280,
        materials: [
          { type: "steel", cost: 70, strength: 160 },
          { type: "concrete", cost: 58, strength: 130 },
          { type: "carbon", cost: 85, strength: 195 },
          { type: "stone", cost: 48, strength: 105 },
        ],
        vehicleWeight: 130,
      },
      {
        gapWidth: 85,
        budget: 300,
        materials: [
          { type: "steel", cost: 75, strength: 170 },
          { type: "concrete", cost: 62, strength: 140 },
          { type: "carbon", cost: 90, strength: 210 },
        ],
        vehicleWeight: 145,
      },
      {
        gapWidth: 80,
        budget: 270,
        materials: [
          { type: "steel", cost: 68, strength: 155 },
          { type: "concrete", cost: 55, strength: 125 },
          { type: "carbon", cost: 82, strength: 190 },
          { type: "bamboo", cost: 28, strength: 62 },
        ],
        vehicleWeight: 120,
      },
    ],
    medium: [
      {
        gapWidth: 95,
        budget: 320,
        materials: [
          { type: "steel", cost: 78, strength: 175 },
          { type: "concrete", cost: 65, strength: 145 },
          { type: "carbon", cost: 95, strength: 225 },
          { type: "stone", cost: 52, strength: 115 },
        ],
        vehicleWeight: 180,
      },
      {
        gapWidth: 100,
        budget: 350,
        materials: [
          { type: "steel", cost: 85, strength: 190 },
          { type: "concrete", cost: 72, strength: 160 },
          { type: "carbon", cost: 105, strength: 250 },
        ],
        vehicleWeight: 210,
      },
      {
        gapWidth: 95,
        budget: 310,
        materials: [
          { type: "steel", cost: 75, strength: 168 },
          { type: "concrete", cost: 62, strength: 140 },
          { type: "carbon", cost: 92, strength: 218 },
          { type: "plastic", cost: 28, strength: 58 },
        ],
        vehicleWeight: 170,
      },
    ],
    hard: [
      {
        gapWidth: 105,
        budget: 350,
        materials: [
          { type: "steel", cost: 85, strength: 190 },
          { type: "concrete", cost: 70, strength: 155 },
          { type: "carbon", cost: 105, strength: 250 },
          { type: "stone", cost: 55, strength: 120 },
        ],
        vehicleWeight: 230,
      },
      {
        gapWidth: 110,
        budget: 380,
        materials: [
          { type: "steel", cost: 90, strength: 200 },
          { type: "concrete", cost: 75, strength: 165 },
          { type: "carbon", cost: 115, strength: 275 },
        ],
        vehicleWeight: 260,
      },
      {
        gapWidth: 105,
        budget: 340,
        materials: [
          { type: "steel", cost: 82, strength: 185 },
          { type: "concrete", cost: 68, strength: 150 },
          { type: "carbon", cost: 100, strength: 240 },
          { type: "bamboo", cost: 30, strength: 68 },
        ],
        vehicleWeight: 220,
      },
    ],
  },
};

async function checkExistingContent(): Promise<number> {
  const q = query(
    collection(db, "gameContent"),
    where("gameType", "==", "bridge")
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

async function seedBridgeContent() {
  console.log("Building bridges - Starting content seeding...\n");

  // Check for existing content
  const existingCount = await checkExistingContent();
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing Bridge items in database.`);
    console.log("   Skipping seed to avoid duplicates.");
    console.log("   Delete existing content first if you want to reseed.\n");
    return;
  }

  const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
  const difficulties: Difficulty[] = ["easy", "medium", "hard"];

  let totalAdded = 0;
  let errors = 0;

  for (const grade of grades) {
    for (const difficulty of difficulties) {
      const contentSets = BRIDGE_CONTENT[grade][difficulty];

      console.log(`Adding ${contentSets.length} bridge challenges for grade ${grade}, ${difficulty}...`);

      for (const contentData of contentSets) {
        try {
          await addDoc(collection(db, "gameContent"), {
            gameType: "bridge",
            grade,
            difficulty,
            gapWidth: contentData.gapWidth,
            budget: contentData.budget,
            materials: contentData.materials,
            vehicleWeight: contentData.vehicleWeight,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          totalAdded++;
        } catch (error) {
          console.error(`   Failed to add content:`, error);
          errors++;
        }
      }
    }
  }

  console.log("\nSeeding complete!");
  console.log(`   Total items added: ${totalAdded}`);
  if (errors > 0) {
    console.log(`   Errors: ${errors}`);
  }

  // Summary by grade
  console.log("\nContent summary:");
  for (const grade of grades) {
    const gradeTotal =
      BRIDGE_CONTENT[grade].easy.length +
      BRIDGE_CONTENT[grade].medium.length +
      BRIDGE_CONTENT[grade].hard.length;
    console.log(`   Grade ${grade}: ${gradeTotal} bridge challenges`);
  }
}

// Run the seed
seedBridgeContent()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nFatal error:", error);
    process.exit(1);
  });

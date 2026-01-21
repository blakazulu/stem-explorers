/**
 * Seed script for Memory game content
 * Run with: npx tsx scripts/seed-memory-content.ts
 *
 * Creates STEM-themed matching pairs for all grades (א-ו) and difficulties (easy/medium/hard)
 * Memory game matches terms with their corresponding matches (e.g., animal + sound, planet + description)
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

interface MemoryPair {
  term: string;
  match: string;
}

interface MemoryContentData {
  pairs: MemoryPair[];
}

// =============================================================================
// MEMORY CONTENT DATA
// Organized by grade, then difficulty
// Each content set has 6-8 pairs for a 12-16 card game
// =============================================================================

const MEMORY_CONTENT: Record<Grade, Record<Difficulty, MemoryContentData[]>> = {
  // Grade א (1st grade) - Very simple pairs
  א: {
    easy: [
      {
        // Animal sounds
        pairs: [
          { term: "כלב", match: "נובח" },
          { term: "חתול", match: "מיילל" },
          { term: "פרה", match: "גועה" },
          { term: "תרנגול", match: "קורא" },
          { term: "כבש", match: "פועה" },
          { term: "ברווז", match: "מקרקר" },
        ],
      },
      {
        // Colors in nature
        pairs: [
          { term: "שמש", match: "צהוב" },
          { term: "עלה", match: "ירוק" },
          { term: "שמיים", match: "כחול" },
          { term: "עגבנייה", match: "אדום" },
          { term: "גזר", match: "כתום" },
          { term: "חציל", match: "סגול" },
        ],
      },
      {
        // Body parts
        pairs: [
          { term: "עין", match: "רואה" },
          { term: "אוזן", match: "שומעת" },
          { term: "אף", match: "מריח" },
          { term: "פה", match: "טועם" },
          { term: "יד", match: "נוגעת" },
          { term: "רגל", match: "הולכת" },
        ],
      },
    ],
    medium: [
      {
        // Fruits and their colors (each match is unique)
        pairs: [
          { term: "בננה", match: "צהובה" },
          { term: "תפוח", match: "אדום עגול" },
          { term: "ענבים", match: "סגולים" },
          { term: "תפוז", match: "כתום" },
          { term: "אבטיח", match: "ירוק ואדום" },
          { term: "דובדבן", match: "אדום קטן" },
          { term: "קיווי", match: "חום" },
        ],
      },
      {
        // Animals and their homes
        pairs: [
          { term: "ציפור", match: "קן" },
          { term: "דג", match: "ים" },
          { term: "נמלה", match: "קרקע" },
          { term: "דבורה", match: "כוורת" },
          { term: "עכביש", match: "קורים" },
          { term: "ארנב", match: "מחילה" },
        ],
      },
    ],
    hard: [
      {
        // Numbers and quantities
        pairs: [
          { term: "1", match: "אחת" },
          { term: "2", match: "שתיים" },
          { term: "3", match: "שלוש" },
          { term: "4", match: "ארבע" },
          { term: "5", match: "חמש" },
          { term: "6", match: "שש" },
          { term: "7", match: "שבע" },
        ],
      },
      {
        // Seasons
        pairs: [
          { term: "אביב", match: "פרחים" },
          { term: "קיץ", match: "שמש" },
          { term: "סתיו", match: "עלים" },
          { term: "חורף", match: "גשם" },
          { term: "חם", match: "קיץ" },
          { term: "קר", match: "חורף" },
        ],
      },
    ],
  },

  // Grade ב (2nd grade)
  ב: {
    easy: [
      {
        // Animals and their babies
        pairs: [
          { term: "כלב", match: "גור" },
          { term: "חתול", match: "גורון" },
          { term: "פרה", match: "עגל" },
          { term: "סוס", match: "סייח" },
          { term: "תרנגולת", match: "אפרוח" },
          { term: "כבשה", match: "טלה" },
        ],
      },
      {
        // Simple opposites
        pairs: [
          { term: "גדול", match: "קטן" },
          { term: "חם", match: "קר" },
          { term: "מהיר", match: "איטי" },
          { term: "יום", match: "לילה" },
          { term: "שמח", match: "עצוב" },
          { term: "גבוה", match: "נמוך" },
        ],
      },
    ],
    medium: [
      {
        // Materials and properties
        pairs: [
          { term: "ברזל", match: "קשה" },
          { term: "ספוג", match: "רך" },
          { term: "זכוכית", match: "שקוף" },
          { term: "עץ", match: "טבעי" },
          { term: "גומי", match: "גמיש" },
          { term: "אבן", match: "כבד" },
          { term: "נוצה", match: "קל" },
        ],
      },
      {
        // Weather
        pairs: [
          { term: "גשם", match: "מטריה" },
          { term: "שמש", match: "משקפיים" },
          { term: "קור", match: "מעיל" },
          { term: "רוח", match: "עפיפון" },
          { term: "שלג", match: "איש שלג" },
          { term: "חום", match: "גלידה" },
        ],
      },
    ],
    hard: [
      {
        // Life cycles
        pairs: [
          { term: "זרע", match: "צמח" },
          { term: "ביצה", match: "אפרוח" },
          { term: "זחל", match: "פרפר" },
          { term: "ראשן", match: "צפרדע" },
          { term: "גור", match: "כלב" },
          { term: "תינוק", match: "מבוגר" },
        ],
      },
      {
        // Simple machines
        pairs: [
          { term: "גלגל", match: "מתגלגל" },
          { term: "מנוף", match: "מרים" },
          { term: "מישור", match: "משופע" },
          { term: "בורג", match: "מחבר" },
          { term: "גלגלת", match: "מושכת" },
          { term: "טריז", match: "מפצל" },
        ],
      },
    ],
  },

  // Grade ג (3rd grade)
  ג: {
    easy: [
      {
        // Body systems
        pairs: [
          { term: "לב", match: "דם" },
          { term: "ריאות", match: "נשימה" },
          { term: "קיבה", match: "עיכול" },
          { term: "מוח", match: "חשיבה" },
          { term: "עצמות", match: "שלד" },
          { term: "שרירים", match: "תנועה" },
        ],
      },
      {
        // Energy sources
        pairs: [
          { term: "שמש", match: "אור" },
          { term: "סוללה", match: "חשמל" },
          { term: "אוכל", match: "אנרגיה" },
          { term: "רוח", match: "טורבינה" },
          { term: "מים", match: "סכר" },
          { term: "דלק", match: "מנוע" },
        ],
      },
    ],
    medium: [
      {
        // States of matter
        pairs: [
          { term: "מים", match: "נוזל" },
          { term: "קרח", match: "מוצק" },
          { term: "אדים", match: "גז" },
          { term: "התאדות", match: "חימום" },
          { term: "התעבות", match: "קירור" },
          { term: "המסה", match: "נמס" },
          { term: "הקפאה", match: "קופא" },
        ],
      },
      {
        // Plants parts
        pairs: [
          { term: "שורש", match: "מים" },
          { term: "גבעול", match: "תמיכה" },
          { term: "עלה", match: "אור" },
          { term: "פרח", match: "רבייה" },
          { term: "פרי", match: "זרעים" },
          { term: "קליפה", match: "הגנה" },
        ],
      },
    ],
    hard: [
      {
        // Electricity
        pairs: [
          { term: "סוללה", match: "מקור" },
          { term: "חוט", match: "מוליך" },
          { term: "נורה", match: "אור" },
          { term: "מתג", match: "שליטה" },
          { term: "מעגל", match: "סגור" },
          { term: "בידוד", match: "פלסטיק" },
          { term: "זרם", match: "אלקטרונים" },
        ],
      },
      {
        // Magnets
        pairs: [
          { term: "מגנט", match: "משיכה" },
          { term: "צפון", match: "דרום" },
          { term: "ברזל", match: "מושך" },
          { term: "עץ", match: "לא מושך" },
          { term: "קוטב", match: "קצה" },
          { term: "מצפן", match: "כיוון" },
        ],
      },
    ],
  },

  // Grade ד (4th grade)
  ד: {
    easy: [
      {
        // Planets
        pairs: [
          { term: "כדור הארץ", match: "הבית שלנו" },
          { term: "מאדים", match: "כוכב אדום" },
          { term: "צדק", match: "הגדול ביותר" },
          { term: "שבתאי", match: "טבעות" },
          { term: "נוגה", match: "הבהיר ביותר" },
          { term: "נפטון", match: "כחול" },
        ],
      },
      {
        // Human senses
        pairs: [
          { term: "ראייה", match: "עיניים" },
          { term: "שמיעה", match: "אוזניים" },
          { term: "טעם", match: "לשון" },
          { term: "ריח", match: "אף" },
          { term: "מגע", match: "עור" },
          { term: "שיווי משקל", match: "אוזן פנימית" },
        ],
      },
    ],
    medium: [
      {
        // Scientists and discoveries
        pairs: [
          { term: "ניוטון", match: "כבידה" },
          { term: "איינשטיין", match: "יחסות" },
          { term: "גלילאו", match: "טלסקופ" },
          { term: "דרווין", match: "אבולוציה" },
          { term: "פסטר", match: "חיסונים" },
          { term: "קופרניקוס", match: "השמש במרכז" },
        ],
      },
      {
        // Food chains
        pairs: [
          { term: "צמח", match: "יצרן" },
          { term: "ארנב", match: "צרכן ראשוני" },
          { term: "שועל", match: "צרכן שניוני" },
          { term: "נשר", match: "טורף עליון" },
          { term: "חיידקים", match: "מפרקים" },
          { term: "שמש", match: "מקור אנרגיה" },
        ],
      },
    ],
    hard: [
      {
        // Cell parts
        pairs: [
          { term: "גרעין", match: "מרכז פיקוד" },
          { term: "ממברנה", match: "קרום" },
          { term: "ציטופלזמה", match: "נוזל" },
          { term: "מיטוכונדריה", match: "אנרגיה" },
          { term: "ריבוזום", match: "חלבונים" },
          { term: "כלורופלסט", match: "ירוק" },
          { term: "ואקואולה", match: "אחסון" },
        ],
      },
      {
        // Chemical elements
        pairs: [
          { term: "חמצן", match: "O" },
          { term: "מימן", match: "H" },
          { term: "פחמן", match: "C" },
          { term: "חנקן", match: "N" },
          { term: "ברזל", match: "Fe" },
          { term: "זהב", match: "Au" },
        ],
      },
    ],
  },

  // Grade ה (5th grade)
  ה: {
    easy: [
      {
        // Force and motion
        pairs: [
          { term: "כוח", match: "דחיפה" },
          { term: "כבידה", match: "נפילה" },
          { term: "חיכוך", match: "התנגדות" },
          { term: "תאוצה", match: "האצה" },
          { term: "מהירות", match: "מרחק לזמן" },
          { term: "אינרציה", match: "התמדה" },
        ],
      },
      {
        // Ecosystems
        pairs: [
          { term: "יער", match: "עצים" },
          { term: "מדבר", match: "חול" },
          { term: "אוקיינוס", match: "מלח" },
          { term: "טונדרה", match: "קרח" },
          { term: "ג'ונגל", match: "לחות" },
          { term: "ערבה", match: "דשא" },
        ],
      },
    ],
    medium: [
      {
        // Waves
        pairs: [
          { term: "אור", match: "גל אלקטרומגנטי" },
          { term: "קול", match: "גל מכני" },
          { term: "אורך גל", match: "מרחק בין פסגות" },
          { term: "תדר", match: "מחזורים לשנייה" },
          { term: "משרעת", match: "גובה הגל" },
          { term: "השתקפות", match: "חזרה" },
          { term: "שבירה", match: "שינוי כיוון" },
        ],
      },
      {
        // Genetics basics
        pairs: [
          { term: "DNA", match: "מידע תורשתי" },
          { term: "גן", match: "יחידת תורשה" },
          { term: "כרומוזום", match: "נושא גנים" },
          { term: "תא", match: "יחידת חיים" },
          { term: "חלוקה", match: "ריבוי תאים" },
          { term: "תורשה", match: "העברה להורים" },
        ],
      },
    ],
    hard: [
      {
        // Chemical reactions
        pairs: [
          { term: "בעירה", match: "חמצן ואש" },
          { term: "חמצון", match: "חלודה" },
          { term: "התסיסה", match: "שמרים" },
          { term: "פוטוסינתזה", match: "צמחים ואור" },
          { term: "עיכול", match: "פירוק מזון" },
          { term: "נשימה תאית", match: "אנרגיה מגלוקוז" },
        ],
      },
      {
        // Earth systems
        pairs: [
          { term: "ליטוספירה", match: "קרום" },
          { term: "הידרוספירה", match: "מים" },
          { term: "אטמוספירה", match: "אוויר" },
          { term: "ביוספירה", match: "חיים" },
          { term: "מעטפת", match: "סלעים נוזליים" },
          { term: "גרעין", match: "מרכז כדור הארץ" },
        ],
      },
    ],
  },

  // Grade ו (6th grade)
  ו: {
    easy: [
      {
        // Renewable energy
        pairs: [
          { term: "שמש", match: "פאנל סולארי" },
          { term: "רוח", match: "טורבינה" },
          { term: "מים", match: "סכר" },
          { term: "גיאותרמי", match: "חום אדמה" },
          { term: "ביומסה", match: "חומר אורגני" },
          { term: "גלים", match: "אנרגיית ים" },
        ],
      },
      {
        // Space exploration
        pairs: [
          { term: "טיל", match: "שיגור" },
          { term: "לוויין", match: "מסלול" },
          { term: "אסטרונאוט", match: "חלל" },
          { term: "תחנת חלל", match: "מעבדה" },
          { term: "טלסקופ", match: "צפייה" },
          { term: "מאדים", match: "רובר" },
        ],
      },
    ],
    medium: [
      {
        // Atomic structure
        pairs: [
          { term: "אטום", match: "יחידת יסוד" },
          { term: "פרוטון", match: "מטען חיובי" },
          { term: "נויטרון", match: "ניטרלי" },
          { term: "אלקטרון", match: "מטען שלילי" },
          { term: "גרעין", match: "מרכז האטום" },
          { term: "אורביטל", match: "ענן אלקטרונים" },
          { term: "יון", match: "אטום טעון" },
        ],
      },
      {
        // Technology inventions
        pairs: [
          { term: "אדיסון", match: "נורה חשמלית" },
          { term: "בל", match: "טלפון" },
          { term: "מרקוני", match: "רדיו" },
          { term: "האחים רייט", match: "מטוס" },
          { term: "גוטנברג", match: "דפוס" },
          { term: "וואט", match: "מנוע קיטור" },
        ],
      },
    ],
    hard: [
      {
        // Biotechnology
        pairs: [
          { term: "שיבוט", match: "העתק גנטי" },
          { term: "GMO", match: "שינוי גנטי" },
          { term: "תאי גזע", match: "התמחות" },
          { term: "אנטיביוטיקה", match: "נגד חיידקים" },
          { term: "חיסון", match: "מניעה" },
          { term: "אנזים", match: "זרז ביולוגי" },
          { term: "CRISPR", match: "עריכת גנים" },
        ],
      },
      {
        // Physics concepts
        pairs: [
          { term: "E=mc^2", match: "איינשטיין" },
          { term: "כבידה", match: "ניוטון" },
          { term: "קוונטים", match: "פלנק" },
          { term: "רדיואקטיביות", match: "קירי" },
          { term: "יחסות", match: "זמן ומרחב" },
          { term: "אנטרופיה", match: "אי סדר" },
        ],
      },
    ],
  },
};

async function checkExistingContent(): Promise<number> {
  const q = query(
    collection(db, "gameContent"),
    where("gameType", "==", "memory")
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

async function seedMemoryContent() {
  console.log("Starting Memory game content seeding...\n");

  // Check for existing content
  const existingCount = await checkExistingContent();
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing Memory items in database.`);
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
      const contentList = MEMORY_CONTENT[grade][difficulty];

      console.log(`Adding ${contentList.length} content sets for grade ${grade}, ${difficulty}...`);

      for (const contentData of contentList) {
        try {
          await addDoc(collection(db, "gameContent"), {
            gameType: "memory",
            grade,
            difficulty,
            pairs: contentData.pairs,
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
  console.log(`   Total content sets added: ${totalAdded}`);
  if (errors > 0) {
    console.log(`   Errors: ${errors}`);
  }

  // Summary by grade
  console.log("\nContent summary:");
  for (const grade of grades) {
    const gradeTotal =
      MEMORY_CONTENT[grade].easy.length +
      MEMORY_CONTENT[grade].medium.length +
      MEMORY_CONTENT[grade].hard.length;
    console.log(`   Grade ${grade}: ${gradeTotal} content sets`);
  }
}

// Run the seed
seedMemoryContent()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nFatal error:", error);
    process.exit(1);
  });

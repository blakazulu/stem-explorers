/**
 * Seed script for Word Search game content
 * Run with: npx tsx scripts/seed-wordsearch-content.ts
 *
 * Creates STEM-related Hebrew word sets for all grades (א-ו) and difficulties
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
type Direction = "horizontal" | "vertical" | "diagonal";

interface WordSearchSet {
  words: string[];
  gridSize: number;
  directions: Direction[];
}

// =============================================================================
// WORD SEARCH CONTENT DATA
// Each set has: words array, gridSize, and allowed directions
// Difficulty affects grid size and directions:
// - Easy: 8x8, horizontal only
// - Medium: 10x10, horizontal + vertical
// - Hard: 12x12, all directions
// =============================================================================

const WORD_SEARCH_CONTENT: Record<Grade, Record<Difficulty, WordSearchSet[]>> = {
  // Grade א (1st grade) - Very simple 3-4 letter words
  א: {
    easy: [
      { words: ["שמש", "ירח", "כוכב", "ענן", "גשם"], gridSize: 8, directions: ["horizontal"] },
      { words: ["פרח", "עץ", "עלה", "דשא", "פרי"], gridSize: 8, directions: ["horizontal"] },
      { words: ["כלב", "חתול", "דג", "ציפור", "פרפר"], gridSize: 8, directions: ["horizontal"] },
      { words: ["מים", "אש", "אבן", "חול", "עפר"], gridSize: 8, directions: ["horizontal"] },
      { words: ["יד", "רגל", "ראש", "עין", "אף"], gridSize: 8, directions: ["horizontal"] },
    ],
    medium: [
      { words: ["שמש", "ירח", "כוכב", "ענן", "גשם", "שלג"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["פרח", "עץ", "עלה", "שורש", "זרע", "פרי"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["כלב", "חתול", "דג", "ציפור", "דבורה", "נמלה"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["מים", "אויר", "אבן", "חול", "אדמה", "קרח"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["יד", "רגל", "ראש", "עין", "אוזן", "פה"], gridSize: 10, directions: ["horizontal", "vertical"] },
    ],
    hard: [
      { words: ["שמש", "ירח", "כוכב", "ענן", "גשם", "שלג", "קשת"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["פרח", "עץ", "עלה", "שורש", "זרע", "גבעול", "ענף"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["כלב", "חתול", "דג", "ציפור", "דבורה", "נמלה", "עכביש"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["מים", "אויר", "אבן", "חול", "אדמה", "קרח", "רוח"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["יד", "רגל", "ראש", "עין", "אוזן", "לב", "בטן"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
    ],
  },

  // Grade ב (2nd grade) - Simple 4-5 letter words
  ב: {
    easy: [
      { words: ["חלל", "כוכב", "ירח", "שמש", "ארץ"], gridSize: 8, directions: ["horizontal"] },
      { words: ["יער", "נהר", "ים", "הר", "מדבר"], gridSize: 8, directions: ["horizontal"] },
      { words: ["חרק", "יונק", "זוחל", "עוף", "דג"], gridSize: 8, directions: ["horizontal"] },
      { words: ["גלגל", "מנוף", "כלי", "מכונה", "גשר"], gridSize: 8, directions: ["horizontal"] },
      { words: ["צמח", "חיה", "פטרייה", "אצה", "טחב"], gridSize: 8, directions: ["horizontal"] },
    ],
    medium: [
      { words: ["חלל", "כוכב", "ירח", "שמש", "ארץ", "מאדים"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["יער", "נהר", "ים", "הר", "מדבר", "אגם"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["חרק", "יונק", "זוחל", "עוף", "דג", "דו חי"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["גלגל", "מנוף", "כלי", "מכונה", "גשר", "מסוק"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["מאובן", "סלע", "מינרל", "גביש", "חול", "טין"], gridSize: 10, directions: ["horizontal", "vertical"] },
    ],
    hard: [
      { words: ["חלל", "כוכב", "ירח", "שמש", "ארץ", "מאדים", "נוגה"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["יער", "נהר", "ים", "הר", "מדבר", "אגם", "מערה"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["חרק", "יונק", "זוחל", "עוף", "טורף", "צמחוני", "נבלן"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["גלגל", "מנוף", "כלי", "מכונה", "גשר", "מסוק", "רובוט"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["מאובן", "סלע", "מינרל", "גביש", "חול", "לבה", "געש"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
    ],
  },

  // Grade ג (3rd grade) - Medium 5-6 letter words
  ג: {
    easy: [
      { words: ["אנרגיה", "חשמל", "מגנט", "כוח", "חום"], gridSize: 8, directions: ["horizontal"] },
      { words: ["תא", "עצם", "שריר", "לב", "ריאה"], gridSize: 8, directions: ["horizontal"] },
      { words: ["מדחום", "סרגל", "משקל", "שעון", "מצפן"], gridSize: 8, directions: ["horizontal"] },
      { words: ["לווין", "טיל", "חללית", "מסלול", "כבידה"], gridSize: 8, directions: ["horizontal"] },
      { words: ["סוללה", "נורה", "מתג", "חוט", "מעגל"], gridSize: 8, directions: ["horizontal"] },
    ],
    medium: [
      { words: ["אנרגיה", "חשמל", "מגנט", "כוח", "חום", "קור"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["תא", "עצם", "שריר", "לב", "ריאה", "מוח"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["מדחום", "סרגל", "משקל", "שעון", "מצפן", "משקפת"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["לווין", "טיל", "חללית", "מסלול", "כבידה", "ריחוף"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["סוללה", "נורה", "מתג", "חוט", "מעגל", "נתיך"], gridSize: 10, directions: ["horizontal", "vertical"] },
    ],
    hard: [
      { words: ["אנרגיה", "חשמל", "מגנט", "כוח", "התאדות", "התעבות", "הקפאה"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["תא", "עצם", "שריר", "לב", "ריאה", "מוח", "עצב"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["מדחום", "סרגל", "משקל", "שעון", "מצפן", "משקפת", "טלסקופ"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["לווין", "טיל", "חללית", "מסלול", "כבידה", "ריחוף", "הנעה"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["סוללה", "נורה", "מתג", "חוט", "מעגל", "נתיך", "מוליך"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
    ],
  },

  // Grade ד (4th grade) - Advanced 5-7 letter words
  ד: {
    easy: [
      { words: ["חמצן", "מימן", "פחמן", "אטום", "יסוד"], gridSize: 8, directions: ["horizontal"] },
      { words: ["גלקסיה", "שביט", "כוכב", "נבולה", "חלל"], gridSize: 8, directions: ["horizontal"] },
      { words: ["חיידק", "וירוס", "תא", "חיסון", "מחלה"], gridSize: 8, directions: ["horizontal"] },
      { words: ["עיכול", "נשימה", "דופק", "דם", "עורק"], gridSize: 8, directions: ["horizontal"] },
      { words: ["מוצק", "נוזל", "גז", "חומר", "מסה"], gridSize: 8, directions: ["horizontal"] },
    ],
    medium: [
      { words: ["חמצן", "מימן", "פחמן", "אטום", "יסוד", "מולקולה"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["גלקסיה", "שביט", "כוכב", "נבולה", "חלל", "מסלול"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["חיידק", "וירוס", "תא", "חיסון", "מחלה", "תרופה"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["עיכול", "נשימה", "דופק", "דם", "עורק", "וריד"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["מוצק", "נוזל", "גז", "חומר", "מסה", "נפח"], gridSize: 10, directions: ["horizontal", "vertical"] },
    ],
    hard: [
      { words: ["חמצן", "מימן", "פחמן", "אטום", "יסוד", "מולקולה", "תרכובת"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["גלקסיה", "שביט", "כוכב", "נבולה", "חלל", "אסטרואיד", "מטאור"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["חיידק", "וירוס", "תא", "חיסון", "מחלה", "אנטיגן", "נוגדן"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["עיכול", "נשימה", "דופק", "דם", "עורק", "וריד", "נימים"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["מוצק", "נוזל", "גז", "חומר", "מסה", "נפח", "צפיפות"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
    ],
  },

  // Grade ה (5th grade) - Complex 6-8 letter words
  ה: {
    easy: [
      { words: ["אבולוציה", "גנטיקה", "תורשה", "מין", "גן"], gridSize: 8, directions: ["horizontal"] },
      { words: ["אלקטרון", "פרוטון", "גרעין", "אטום", "יון"], gridSize: 8, directions: ["horizontal"] },
      { words: ["תא", "רקמה", "איבר", "מערכת", "גוף"], gridSize: 8, directions: ["horizontal"] },
      { words: ["גל", "תדר", "קרינה", "אור", "צליל"], gridSize: 8, directions: ["horizontal"] },
      { words: ["אנזים", "חלבון", "שומן", "סוכר", "מזון"], gridSize: 8, directions: ["horizontal"] },
    ],
    medium: [
      { words: ["אבולוציה", "גנטיקה", "תורשה", "מין", "מוטציה", "סגולה"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["אלקטרון", "פרוטון", "נויטרון", "גרעין", "אטום", "יון"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["תא", "רקמה", "איבר", "מערכת", "גוף", "תפקוד"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["גל", "תדר", "קרינה", "אור", "צליל", "משרעת"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["אנזים", "חלבון", "שומן", "סוכר", "מזון", "עמילן"], gridSize: 10, directions: ["horizontal", "vertical"] },
    ],
    hard: [
      { words: ["אבולוציה", "גנטיקה", "תורשה", "מוטציה", "כרומוזום", "אללים", "דומיננטי"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["אלקטרון", "פרוטון", "נויטרון", "גרעין", "אטום", "קוונטים", "ספקטרום"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["ממברנה", "ציטופלזמה", "גרעין", "ריבוזום", "גולגי", "ואקואל", "כלורופלסט"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["גל", "תדר", "קרינה", "אור", "צליל", "משרעת", "אורך גל"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["אנזים", "חלבון", "שומן", "סוכר", "עמילן", "צלולוז", "גלוקוז"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
    ],
  },

  // Grade ו (6th grade) - Advanced scientific terms
  ו: {
    easy: [
      { words: ["מהירות", "תאוצה", "כוח", "מסה", "משקל"], gridSize: 8, directions: ["horizontal"] },
      { words: ["חומצה", "בסיס", "מלח", "תמיסה", "ריכוז"], gridSize: 8, directions: ["horizontal"] },
      { words: ["גן", "DNA", "RNA", "חלבון", "תא"], gridSize: 8, directions: ["horizontal"] },
      { words: ["וולט", "אמפר", "אוהם", "וואט", "זרם"], gridSize: 8, directions: ["horizontal"] },
      { words: ["אקלים", "מזג אויר", "לחות", "טמפרטורה", "רוח"], gridSize: 8, directions: ["horizontal"] },
    ],
    medium: [
      { words: ["מהירות", "תאוצה", "כוח", "מסה", "משקל", "צפיפות"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["חומצה", "בסיס", "מלח", "תמיסה", "ריכוז", "חמצון"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["גן", "DNA", "RNA", "חלבון", "תא", "רפליקציה"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["וולט", "אמפר", "אוהם", "וואט", "זרם", "מתח"], gridSize: 10, directions: ["horizontal", "vertical"] },
      { words: ["אקלים", "לחות", "טמפרטורה", "משקעים", "רוח", "לחץ"], gridSize: 10, directions: ["horizontal", "vertical"] },
    ],
    hard: [
      { words: ["מהירות", "תאוצה", "כוח", "מסה", "צפיפות", "מומנטום", "אינרציה"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["חומצה", "בסיס", "מלח", "תמיסה", "חמצון", "חיזור", "קטליזה"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["גן", "DNA", "RNA", "חלבון", "רפליקציה", "תעתוק", "תרגום"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["וולט", "אמפר", "אוהם", "וואט", "זרם", "מתח", "התנגדות"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
      { words: ["אקלים", "לחות", "משקעים", "לחץ", "זרמים", "אלנינו", "מונסון"], gridSize: 12, directions: ["horizontal", "vertical", "diagonal"] },
    ],
  },
};

async function checkExistingContent(): Promise<number> {
  const q = query(
    collection(db, "gameContent"),
    where("gameType", "==", "wordSearch")
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

async function seedWordSearchContent() {
  console.log("🔍 Starting Word Search content seeding...\n");

  // Check for existing content
  const existingCount = await checkExistingContent();
  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing Word Search items in database.`);
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
      const wordSets = WORD_SEARCH_CONTENT[grade][difficulty];

      console.log(`📝 Adding ${wordSets.length} word sets for grade ${grade}, ${difficulty}...`);

      for (const setData of wordSets) {
        try {
          await addDoc(collection(db, "gameContent"), {
            gameType: "wordSearch",
            grade,
            difficulty,
            words: setData.words,
            gridSize: setData.gridSize,
            directions: setData.directions,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          totalAdded++;
        } catch (error) {
          console.error(`   ❌ Failed to add word set:`, error);
          errors++;
        }
      }
    }
  }

  console.log("\n✅ Seeding complete!");
  console.log(`   Total word sets added: ${totalAdded}`);
  if (errors > 0) {
    console.log(`   Errors: ${errors}`);
  }

  // Summary by grade
  console.log("\n📊 Content summary:");
  for (const grade of grades) {
    const gradeTotal =
      WORD_SEARCH_CONTENT[grade].easy.length +
      WORD_SEARCH_CONTENT[grade].medium.length +
      WORD_SEARCH_CONTENT[grade].hard.length;
    console.log(`   Grade ${grade}: ${gradeTotal} word sets`);
  }
}

// Run the seed
seedWordSearchContent()
  .then(() => {
    console.log("\n👋 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });

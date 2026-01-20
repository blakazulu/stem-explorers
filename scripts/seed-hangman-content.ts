/**
 * Seed script for Hangman game content
 * Run with: npx tsx scripts/seed-hangman-content.ts
 *
 * Creates STEM-related Hebrew words for all grades (א-ו) and difficulties (easy/medium/hard)
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

interface HangmanWord {
  word: string;
  hint: string;
  category: string;
}

// =============================================================================
// HANGMAN CONTENT DATA
// Organized by grade, then difficulty
// Each word has: word, hint, category
// =============================================================================

const HANGMAN_CONTENT: Record<Grade, Record<Difficulty, HangmanWord[]>> = {
  // Grade א (1st grade) - Very simple words, 3-5 letters
  א: {
    easy: [
      { word: "שמש", hint: "מאירה ביום בשמיים", category: "חלל" },
      { word: "מים", hint: "שותים אותם כשצמאים", category: "טבע" },
      { word: "עץ", hint: "צומח מהאדמה ויש לו עלים", category: "צמחים" },
      { word: "פרח", hint: "צומח בגינה וריחני", category: "צמחים" },
      { word: "דג", hint: "חי במים ויודע לשחות", category: "חיות" },
      { word: "כלב", hint: "חיית מחמד שנובחת", category: "חיות" },
      { word: "חתול", hint: "חיית מחמד שמיילת", category: "חיות" },
      { word: "ירח", hint: "נראה בשמיים בלילה", category: "חלל" },
      { word: "ענן", hint: "לבן ומרחף בשמיים", category: "טבע" },
      { word: "גשם", hint: "יורד מהשמיים ומרטיב", category: "טבע" },
    ],
    medium: [
      { word: "כוכב", hint: "נוצץ בשמיים בלילה", category: "חלל" },
      { word: "אבן", hint: "קשה ונמצאת על הקרקע", category: "טבע" },
      { word: "עלה", hint: "גדל על עץ וירוק", category: "צמחים" },
      { word: "ציפור", hint: "עפה בשמיים ושרה", category: "חיות" },
      { word: "דבורה", hint: "עפה ומייצרת דבש", category: "חיות" },
      { word: "פרפר", hint: "חרק יפה עם כנפיים צבעוניות", category: "חיות" },
      { word: "שלג", hint: "לבן וקר יורד בחורף", category: "טבע" },
      { word: "רוח", hint: "מזיזה את העלים אבל לא רואים אותה", category: "טבע" },
      { word: "חול", hint: "נמצא בחוף הים", category: "טבע" },
      { word: "זרע", hint: "שותלים אותו והוא הופך לצמח", category: "צמחים" },
    ],
    hard: [
      { word: "קשת", hint: "צבעונית בשמיים אחרי הגשם", category: "טבע" },
      { word: "שורש", hint: "חלק מהצמח שבתוך האדמה", category: "צמחים" },
      { word: "נמלה", hint: "חרק קטן שעובד קשה", category: "חיות" },
      { word: "עכביש", hint: "בונה קורים ויש לו שמונה רגליים", category: "חיות" },
      { word: "צדף", hint: "נמצא בחוף הים ובתוכו גר רכיכה", category: "חיות" },
      { word: "אדמה", hint: "הצמחים גדלים בה", category: "טבע" },
      { word: "אויר", hint: "נושמים אותו אבל לא רואים", category: "טבע" },
      { word: "קרח", hint: "מים קפואים", category: "טבע" },
      { word: "חממה", hint: "מקום לגדל צמחים בחום", category: "צמחים" },
      { word: "גבעול", hint: "החלק הארוך של הפרח", category: "צמחים" },
    ],
  },

  // Grade ב (2nd grade) - Simple words, 4-6 letters
  ב: {
    easy: [
      { word: "חלל", hint: "המקום שבו נמצאים הכוכבים", category: "חלל" },
      { word: "כדור", hint: "עגול ומתגלגל", category: "מדע" },
      { word: "מגנט", hint: "מושך ברזל", category: "פיזיקה" },
      { word: "צמח", hint: "גדל מזרע באדמה", category: "צמחים" },
      { word: "חיה", hint: "יצור חי שאינו אדם", category: "חיות" },
      { word: "ים", hint: "מים מלוחים גדולים", category: "טבע" },
      { word: "הר", hint: "גבוה מאוד ועשוי אבנים", category: "טבע" },
      { word: "נהר", hint: "מים זורמים ארוכים", category: "טבע" },
      { word: "יער", hint: "מקום עם הרבה עצים", category: "טבע" },
      { word: "פרי", hint: "גדל על עץ ואוכלים אותו", category: "צמחים" },
    ],
    medium: [
      { word: "כוח", hint: "מה שגורם לדברים לזוז", category: "פיזיקה" },
      { word: "אור", hint: "בלעדיו חשוך", category: "פיזיקה" },
      { word: "צל", hint: "נוצר כשמשהו חוסם את האור", category: "פיזיקה" },
      { word: "חום", hint: "מרגישים אותו ליד אש", category: "פיזיקה" },
      { word: "קור", hint: "מרגישים אותו בחורף", category: "פיזיקה" },
      { word: "דינוזאור", hint: "זוחל ענק שנכחד לפני מיליוני שנים", category: "חיות" },
      { word: "מדבר", hint: "מקום חם עם חול והרבה שמש", category: "טבע" },
      { word: "אגם", hint: "מים מתוקים מוקפים ביבשה", category: "טבע" },
      { word: "מערה", hint: "חור גדול בתוך הר", category: "טבע" },
      { word: "געש", hint: "הר שמתפרץ ממנו לבה", category: "טבע" },
    ],
    hard: [
      { word: "מאובן", hint: "שריד של יצור קדום באבן", category: "מדע" },
      { word: "חרק", hint: "בעל חיים קטן עם שש רגליים", category: "חיות" },
      { word: "יונק", hint: "חיה שמניקה את הגורים שלה", category: "חיות" },
      { word: "זוחל", hint: "חיה כמו לטאה או נחש", category: "חיות" },
      { word: "דו חי", hint: "חי במים וביבשה כמו צפרדע", category: "חיות" },
      { word: "טורף", hint: "חיה שצדה חיות אחרות", category: "חיות" },
      { word: "מדען", hint: "אדם שחוקר את הטבע", category: "מדע" },
      { word: "ניסוי", hint: "בדיקה מדעית", category: "מדע" },
      { word: "תצפית", hint: "להסתכל ולבדוק בעיון", category: "מדע" },
      { word: "טבע", hint: "כל מה שלא נוצר על ידי אדם", category: "טבע" },
    ],
  },

  // Grade ג (3rd grade) - Medium words, 5-7 letters
  ג: {
    easy: [
      { word: "אנרגיה", hint: "הכוח לעשות דברים", category: "פיזיקה" },
      { word: "חשמל", hint: "זורם בכבלים ומפעיל מכשירים", category: "פיזיקה" },
      { word: "תא", hint: "היחידה הבסיסית של כל יצור חי", category: "ביולוגיה" },
      { word: "עצם", hint: "חלק קשה בתוך הגוף שלנו", category: "גוף האדם" },
      { word: "שריר", hint: "מה שעוזר לנו לזוז", category: "גוף האדם" },
      { word: "לב", hint: "שואב דם בגוף שלנו", category: "גוף האדם" },
      { word: "ריאה", hint: "עוזרת לנו לנשום", category: "גוף האדם" },
      { word: "מוח", hint: "חושב ושולט בגוף", category: "גוף האדם" },
      { word: "כוכב לכת", hint: "סובב סביב השמש", category: "חלל" },
      { word: "לווין", hint: "סובב סביב כוכב לכת", category: "חלל" },
    ],
    medium: [
      { word: "גלגל", hint: "עגול ומתגלגל בקלות", category: "טכנולוגיה" },
      { word: "מנוף", hint: "עוזר להרים דברים כבדים", category: "טכנולוגיה" },
      { word: "משקפת", hint: "עוזרת לראות דברים רחוקים", category: "טכנולוגיה" },
      { word: "מיקרוסקופ", hint: "עוזר לראות דברים זעירים", category: "טכנולוגיה" },
      { word: "מדחום", hint: "מודד חום", category: "טכנולוגיה" },
      { word: "סרגל", hint: "מודד אורך", category: "טכנולוגיה" },
      { word: "משקל", hint: "מודד כמה משהו כבד", category: "טכנולוגיה" },
      { word: "שעון", hint: "מודד זמן", category: "טכנולוגיה" },
      { word: "מצפן", hint: "מראה איפה צפון", category: "טכנולוגיה" },
      { word: "טלסקופ", hint: "עוזר לראות כוכבים", category: "טכנולוגיה" },
    ],
    hard: [
      { word: "כבידה", hint: "הכוח שמושך אותנו לאדמה", category: "פיזיקה" },
      { word: "התאדות", hint: "כשמים הופכים לאדים", category: "כימיה" },
      { word: "התעבות", hint: "כשאדים הופכים למים", category: "כימיה" },
      { word: "הקפאה", hint: "כשמים הופכים לקרח", category: "כימיה" },
      { word: "המסה", hint: "כשקרח הופך למים", category: "כימיה" },
      { word: "תמיסה", hint: "כשחומר מתמוסס בנוזל", category: "כימיה" },
      { word: "מעגל חשמלי", hint: "מסלול שבו זורם חשמל", category: "פיזיקה" },
      { word: "סוללה", hint: "מאחסנת אנרגיה חשמלית", category: "פיזיקה" },
      { word: "נורה", hint: "מייצרת אור מחשמל", category: "טכנולוגיה" },
      { word: "מתג", hint: "מדליק ומכבה חשמל", category: "טכנולוגיה" },
    ],
  },

  // Grade ד (4th grade) - Advanced words, 5-8 letters
  ד: {
    easy: [
      { word: "חמצן", hint: "גז שאנחנו נושמים", category: "כימיה" },
      { word: "פחמן", hint: "יסוד בסיסי בכל יצור חי", category: "כימיה" },
      { word: "מימן", hint: "הגז הקל ביותר", category: "כימיה" },
      { word: "מולקולה", hint: "קבוצה של אטומים מחוברים", category: "כימיה" },
      { word: "אטום", hint: "החלקיק הקטן ביותר של יסוד", category: "כימיה" },
      { word: "יסוד", hint: "חומר טהור שלא ניתן לפרק", category: "כימיה" },
      { word: "גז", hint: "מצב צבירה כמו אוויר", category: "כימיה" },
      { word: "נוזל", hint: "מצב צבירה כמו מים", category: "כימיה" },
      { word: "מוצק", hint: "מצב צבירה כמו קרח", category: "כימיה" },
      { word: "חומר", hint: "כל דבר שתופס מקום ויש לו משקל", category: "כימיה" },
    ],
    medium: [
      { word: "מערכת השמש", hint: "השמש וכל מה שסובב סביבה", category: "חלל" },
      { word: "גלקסיה", hint: "קבוצה ענקית של כוכבים", category: "חלל" },
      { word: "אסטרואיד", hint: "סלע בחלל", category: "חלל" },
      { word: "שביט", hint: "גוש קרח שעף בחלל עם זנב", category: "חלל" },
      { word: "חור שחור", hint: "מקום בחלל שבולע הכל", category: "חלל" },
      { word: "נבולה", hint: "ענן גז ואבק בחלל", category: "חלל" },
      { word: "אסטרונאוט", hint: "אדם שטס לחלל", category: "חלל" },
      { word: "טיל", hint: "כלי טיס שמגיע לחלל", category: "חלל" },
      { word: "תחנת חלל", hint: "מבנה שבו גרים אסטרונאוטים בחלל", category: "חלל" },
      { word: "מסלול", hint: "הדרך שבה נע גוף בחלל", category: "חלל" },
    ],
    hard: [
      { word: "פוטוסינתזה", hint: "תהליך שבו צמחים מייצרים אוכל מאור", category: "ביולוגיה" },
      { word: "כלורופיל", hint: "החומר הירוק בעלים", category: "ביולוגיה" },
      { word: "חיידק", hint: "יצור חי זעיר שלא רואים בעין", category: "ביולוגיה" },
      { word: "וירוס", hint: "גורם למחלות ולא באמת חי", category: "ביולוגיה" },
      { word: "אנטיביוטיקה", hint: "תרופה נגד חיידקים", category: "ביולוגיה" },
      { word: "חיסון", hint: "הגנה מפני מחלות", category: "ביולוגיה" },
      { word: "עיכול", hint: "פירוק אוכל בגוף", category: "גוף האדם" },
      { word: "נשימה", hint: "הכנסת חמצן לגוף", category: "גוף האדם" },
      { word: "מחזור הדם", hint: "תנועת הדם בגוף", category: "גוף האדם" },
      { word: "מערכת העצבים", hint: "שולטת בגוף עם המוח", category: "גוף האדם" },
    ],
  },

  // Grade ה (5th grade) - Complex words, 6-9 letters
  ה: {
    easy: [
      { word: "אבולוציה", hint: "שינוי הדרגתי של יצורים חיים", category: "ביולוגיה" },
      { word: "גנטיקה", hint: "מדע התורשה", category: "ביולוגיה" },
      { word: "כרומוזום", hint: "נושא את המידע התורשתי", category: "ביולוגיה" },
      { word: "תא", hint: "יחידת החיים הבסיסית", category: "ביולוגיה" },
      { word: "רקמה", hint: "קבוצת תאים דומים", category: "ביולוגיה" },
      { word: "איבר", hint: "חלק בגוף עם תפקיד מסוים", category: "ביולוגיה" },
      { word: "מערכת", hint: "קבוצת איברים שעובדים יחד", category: "ביולוגיה" },
      { word: "אורגניזם", hint: "יצור חי שלם", category: "ביולוגיה" },
      { word: "אקולוגיה", hint: "מדע הקשר בין יצורים לסביבה", category: "ביולוגיה" },
      { word: "מערכת אקולוגית", hint: "יצורים וסביבתם יחד", category: "ביולוגיה" },
    ],
    medium: [
      { word: "אלקטרון", hint: "חלקיק שלילי באטום", category: "פיזיקה" },
      { word: "פרוטון", hint: "חלקיק חיובי בגרעין האטום", category: "פיזיקה" },
      { word: "נויטרון", hint: "חלקיק ניטרלי בגרעין האטום", category: "פיזיקה" },
      { word: "גרעין", hint: "מרכז האטום", category: "פיזיקה" },
      { word: "קרינה", hint: "אנרגיה שנעה בחלל", category: "פיזיקה" },
      { word: "גל", hint: "תנועה מחזורית של אנרגיה", category: "פיזיקה" },
      { word: "תדר", hint: "כמה פעמים גל חוזר בשנייה", category: "פיזיקה" },
      { word: "אורך גל", hint: "המרחק בין שני פסגות גל", category: "פיזיקה" },
      { word: "משרעת", hint: "גובה הגל", category: "פיזיקה" },
      { word: "ספקטרום", hint: "טווח הצבעים או הקרינות", category: "פיזיקה" },
    ],
    hard: [
      { word: "פוטוסינתזה", hint: "הפיכת אור לאנרגיה בצמחים", category: "ביולוגיה" },
      { word: "מיטוכונדריה", hint: "תחנת הכוח של התא", category: "ביולוגיה" },
      { word: "ריבוזום", hint: "מייצר חלבונים בתא", category: "ביולוגיה" },
      { word: "ממברנה", hint: "הקרום שעוטף את התא", category: "ביולוגיה" },
      { word: "ציטופלזמה", hint: "הנוזל בתוך התא", category: "ביולוגיה" },
      { word: "גולגי", hint: "אורז ושולח חומרים בתא", category: "ביולוגיה" },
      { word: "אנזים", hint: "חלבון שמזרז תגובות", category: "ביולוגיה" },
      { word: "חלבון", hint: "מולקולה בסיסית לחיים", category: "ביולוגיה" },
      { word: "חומצת גרעין", hint: "DNA או RNA", category: "ביולוגיה" },
      { word: "רפליקציה", hint: "שכפול של DNA", category: "ביולוגיה" },
    ],
  },

  // Grade ו (6th grade) - Advanced scientific terms, 7-10+ letters
  ו: {
    easy: [
      { word: "מהירות", hint: "כמה מהר משהו נע", category: "פיזיקה" },
      { word: "תאוצה", hint: "שינוי במהירות", category: "פיזיקה" },
      { word: "כוח", hint: "מה שמשנה תנועה", category: "פיזיקה" },
      { word: "מסה", hint: "כמות החומר בעצם", category: "פיזיקה" },
      { word: "משקל", hint: "כוח הכבידה על עצם", category: "פיזיקה" },
      { word: "צפיפות", hint: "מסה חלקי נפח", category: "פיזיקה" },
      { word: "נפח", hint: "כמה מקום משהו תופס", category: "פיזיקה" },
      { word: "לחץ", hint: "כוח על שטח", category: "פיזיקה" },
      { word: "טמפרטורה", hint: "מידת החום או הקור", category: "פיזיקה" },
      { word: "אנרגיה קינטית", hint: "אנרגיה של תנועה", category: "פיזיקה" },
    ],
    medium: [
      { word: "אלקטרומגנטיות", hint: "קשר בין חשמל למגנטיות", category: "פיזיקה" },
      { word: "תגובה כימית", hint: "שינוי בחומרים ליצירת חומרים חדשים", category: "כימיה" },
      { word: "קטליזטור", hint: "מזרז תגובה כימית", category: "כימיה" },
      { word: "חומצה", hint: "חומר עם pH נמוך", category: "כימיה" },
      { word: "בסיס", hint: "חומר עם pH גבוה", category: "כימיה" },
      { word: "ניטרליזציה", hint: "תגובה בין חומצה לבסיס", category: "כימיה" },
      { word: "חמצון", hint: "תגובה עם חמצן", category: "כימיה" },
      { word: "חיזור", hint: "הפוך מחמצון", category: "כימיה" },
      { word: "יון", hint: "אטום עם מטען חשמלי", category: "כימיה" },
      { word: "קשר כימי", hint: "חיבור בין אטומים", category: "כימיה" },
    ],
    hard: [
      { word: "ביוטכנולוגיה", hint: "שימוש בחיים לטכנולוגיה", category: "טכנולוגיה" },
      { word: "הנדסה גנטית", hint: "שינוי גנים בצורה מכוונת", category: "ביולוגיה" },
      { word: "אלגוריתם", hint: "סדרת הוראות לפתרון בעיה", category: "טכנולוגיה" },
      { word: "בינה מלאכותית", hint: "מחשבים שיכולים ללמוד", category: "טכנולוגיה" },
      { word: "קוונטים", hint: "פיזיקה של החלקיקים הקטנים", category: "פיזיקה" },
      { word: "יחסות", hint: "תורת איינשטיין על זמן ומרחב", category: "פיזיקה" },
      { word: "סופרנובה", hint: "התפוצצות של כוכב", category: "חלל" },
      { word: "אנטי חומר", hint: "הפוך מחומר רגיל", category: "פיזיקה" },
      { word: "פלזמה", hint: "מצב צבירה רביעי של חומר", category: "פיזיקה" },
      { word: "נאנוטכנולוגיה", hint: "טכנולוגיה בקנה מידה זעיר", category: "טכנולוגיה" },
    ],
  },
};

async function checkExistingContent(): Promise<number> {
  const q = query(
    collection(db, "gameContent"),
    where("gameType", "==", "hangman")
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

async function seedHangmanContent() {
  console.log("🎮 Starting Hangman content seeding...\n");

  // Check for existing content
  const existingCount = await checkExistingContent();
  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing Hangman items in database.`);
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
      const words = HANGMAN_CONTENT[grade][difficulty];

      console.log(`📝 Adding ${words.length} words for grade ${grade}, ${difficulty}...`);

      for (const wordData of words) {
        try {
          await addDoc(collection(db, "gameContent"), {
            gameType: "hangman",
            grade,
            difficulty,
            word: wordData.word,
            hint: wordData.hint,
            category: wordData.category,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          totalAdded++;
        } catch (error) {
          console.error(`   ❌ Failed to add "${wordData.word}":`, error);
          errors++;
        }
      }
    }
  }

  console.log("\n✅ Seeding complete!");
  console.log(`   Total items added: ${totalAdded}`);
  if (errors > 0) {
    console.log(`   Errors: ${errors}`);
  }

  // Summary by grade
  console.log("\n📊 Content summary:");
  for (const grade of grades) {
    const gradeTotal =
      HANGMAN_CONTENT[grade].easy.length +
      HANGMAN_CONTENT[grade].medium.length +
      HANGMAN_CONTENT[grade].hard.length;
    console.log(`   Grade ${grade}: ${gradeTotal} words`);
  }
}

// Run the seed
seedHangmanContent()
  .then(() => {
    console.log("\n👋 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });

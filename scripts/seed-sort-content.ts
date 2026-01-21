/**
 * Seed script for Sort game content
 * Run with: npx tsx scripts/seed-sort-content.ts
 *
 * Creates Hebrew sorting/classification tasks for all grades (א-ו) and difficulties (easy/medium/hard)
 * 3 content sets per grade/difficulty = 54 total
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

interface SortItem {
  text: string;
  correctBucket: string;
}

interface SortContentData {
  buckets: string[];
  items: SortItem[];
}

// =============================================================================
// SORT CONTENT DATA
// Organized by grade, then difficulty
// Each entry has: buckets (2-4 categories), items (8-12 items to sort)
// =============================================================================

const SORT_CONTENT: Record<Grade, Record<Difficulty, SortContentData[]>> = {
  // Grade א (1st grade) - Very simple, familiar categories
  א: {
    easy: [
      {
        buckets: ["חיות יבשה", "חיות מים"],
        items: [
          { text: "כלב", correctBucket: "חיות יבשה" },
          { text: "דג", correctBucket: "חיות מים" },
          { text: "חתול", correctBucket: "חיות יבשה" },
          { text: "דולפין", correctBucket: "חיות מים" },
          { text: "ארנב", correctBucket: "חיות יבשה" },
          { text: "צב ים", correctBucket: "חיות מים" },
          { text: "פרה", correctBucket: "חיות יבשה" },
          { text: "מדוזה", correctBucket: "חיות מים" },
        ],
      },
      {
        buckets: ["פירות", "ירקות"],
        items: [
          { text: "תפוח", correctBucket: "פירות" },
          { text: "גזר", correctBucket: "ירקות" },
          { text: "בננה", correctBucket: "פירות" },
          { text: "עגבנייה", correctBucket: "ירקות" },
          { text: "תפוז", correctBucket: "פירות" },
          { text: "מלפפון", correctBucket: "ירקות" },
          { text: "ענבים", correctBucket: "פירות" },
          { text: "חסה", correctBucket: "ירקות" },
        ],
      },
      {
        buckets: ["צבעים חמים", "צבעים קרים"],
        items: [
          { text: "אדום", correctBucket: "צבעים חמים" },
          { text: "כחול", correctBucket: "צבעים קרים" },
          { text: "צהוב", correctBucket: "צבעים חמים" },
          { text: "ירוק", correctBucket: "צבעים קרים" },
          { text: "כתום", correctBucket: "צבעים חמים" },
          { text: "סגול", correctBucket: "צבעים קרים" },
          { text: "ורוד", correctBucket: "צבעים חמים" },
          { text: "תכלת", correctBucket: "צבעים קרים" },
        ],
      },
    ],
    medium: [
      {
        buckets: ["עפים", "לא עפים"],
        items: [
          { text: "ציפור", correctBucket: "עפים" },
          { text: "כלב", correctBucket: "לא עפים" },
          { text: "פרפר", correctBucket: "עפים" },
          { text: "דג", correctBucket: "לא עפים" },
          { text: "דבורה", correctBucket: "עפים" },
          { text: "נחש", correctBucket: "לא עפים" },
          { text: "עטלף", correctBucket: "עפים" },
          { text: "צב", correctBucket: "לא עפים" },
          { text: "יונה", correctBucket: "עפים" },
          { text: "ארנב", correctBucket: "לא עפים" },
        ],
      },
      {
        buckets: ["גדל על עץ", "גדל באדמה"],
        items: [
          { text: "תפוח", correctBucket: "גדל על עץ" },
          { text: "גזר", correctBucket: "גדל באדמה" },
          { text: "אגס", correctBucket: "גדל על עץ" },
          { text: "תפוח אדמה", correctBucket: "גדל באדמה" },
          { text: "לימון", correctBucket: "גדל על עץ" },
          { text: "בצל", correctBucket: "גדל באדמה" },
          { text: "דובדבן", correctBucket: "גדל על עץ" },
          { text: "צנון", correctBucket: "גדל באדמה" },
        ],
      },
      {
        buckets: ["יום", "לילה"],
        items: [
          { text: "שמש", correctBucket: "יום" },
          { text: "ירח", correctBucket: "לילה" },
          { text: "שמיים כחולים", correctBucket: "יום" },
          { text: "כוכבים", correctBucket: "לילה" },
          { text: "פרפרים עפים", correctBucket: "יום" },
          { text: "ינשוף", correctBucket: "לילה" },
          { text: "ילדים בגן", correctBucket: "יום" },
          { text: "שינה", correctBucket: "לילה" },
        ],
      },
    ],
    hard: [
      {
        buckets: ["חי", "לא חי"],
        items: [
          { text: "עץ", correctBucket: "חי" },
          { text: "אבן", correctBucket: "לא חי" },
          { text: "פרח", correctBucket: "חי" },
          { text: "מים", correctBucket: "לא חי" },
          { text: "ציפור", correctBucket: "חי" },
          { text: "חול", correctBucket: "לא חי" },
          { text: "דשא", correctBucket: "חי" },
          { text: "ברזל", correctBucket: "לא חי" },
          { text: "חתול", correctBucket: "חי" },
          { text: "פלסטיק", correctBucket: "לא חי" },
        ],
      },
      {
        buckets: ["עונות חמות", "עונות קרות"],
        items: [
          { text: "קיץ", correctBucket: "עונות חמות" },
          { text: "חורף", correctBucket: "עונות קרות" },
          { text: "שמש חזקה", correctBucket: "עונות חמות" },
          { text: "שלג", correctBucket: "עונות קרות" },
          { text: "ים", correctBucket: "עונות חמות" },
          { text: "גשם", correctBucket: "עונות קרות" },
          { text: "גלידה", correctBucket: "עונות חמות" },
          { text: "מעיל", correctBucket: "עונות קרות" },
        ],
      },
      {
        buckets: ["טבע", "מעשה אדם"],
        items: [
          { text: "הר", correctBucket: "טבע" },
          { text: "בית", correctBucket: "מעשה אדם" },
          { text: "נהר", correctBucket: "טבע" },
          { text: "כביש", correctBucket: "מעשה אדם" },
          { text: "ענן", correctBucket: "טבע" },
          { text: "מכונית", correctBucket: "מעשה אדם" },
          { text: "יער", correctBucket: "טבע" },
          { text: "גשר", correctBucket: "מעשה אדם" },
        ],
      },
    ],
  },

  // Grade ב (2nd grade) - Simple science concepts
  ב: {
    easy: [
      {
        buckets: ["יונקים", "ציפורים"],
        items: [
          { text: "כלב", correctBucket: "יונקים" },
          { text: "נשר", correctBucket: "ציפורים" },
          { text: "חתול", correctBucket: "יונקים" },
          { text: "יונה", correctBucket: "ציפורים" },
          { text: "פרה", correctBucket: "יונקים" },
          { text: "תוכי", correctBucket: "ציפורים" },
          { text: "סוס", correctBucket: "יונקים" },
          { text: "פינגווין", correctBucket: "ציפורים" },
        ],
      },
      {
        buckets: ["רך", "קשה"],
        items: [
          { text: "כרית", correctBucket: "רך" },
          { text: "אבן", correctBucket: "קשה" },
          { text: "צמר גפן", correctBucket: "רך" },
          { text: "עץ", correctBucket: "קשה" },
          { text: "בד", correctBucket: "רך" },
          { text: "ברזל", correctBucket: "קשה" },
          { text: "ספוג", correctBucket: "רך" },
          { text: "זכוכית", correctBucket: "קשה" },
        ],
      },
      {
        buckets: ["אוכל בריא", "ממתקים"],
        items: [
          { text: "תפוח", correctBucket: "אוכל בריא" },
          { text: "שוקולד", correctBucket: "ממתקים" },
          { text: "גזר", correctBucket: "אוכל בריא" },
          { text: "סוכריה", correctBucket: "ממתקים" },
          { text: "חלב", correctBucket: "אוכל בריא" },
          { text: "עוגה", correctBucket: "ממתקים" },
          { text: "לחם", correctBucket: "אוכל בריא" },
          { text: "גלידה", correctBucket: "ממתקים" },
        ],
      },
    ],
    medium: [
      {
        buckets: ["צמחים", "חיות"],
        items: [
          { text: "עץ", correctBucket: "צמחים" },
          { text: "ציפור", correctBucket: "חיות" },
          { text: "פרח", correctBucket: "צמחים" },
          { text: "דג", correctBucket: "חיות" },
          { text: "דשא", correctBucket: "צמחים" },
          { text: "פרפר", correctBucket: "חיות" },
          { text: "שיח", correctBucket: "צמחים" },
          { text: "נמלה", correctBucket: "חיות" },
          { text: "קקטוס", correctBucket: "צמחים" },
          { text: "עכביש", correctBucket: "חיות" },
        ],
      },
      {
        buckets: ["כלי נגינה", "כלי כתיבה"],
        items: [
          { text: "גיטרה", correctBucket: "כלי נגינה" },
          { text: "עיפרון", correctBucket: "כלי כתיבה" },
          { text: "פסנתר", correctBucket: "כלי נגינה" },
          { text: "עט", correctBucket: "כלי כתיבה" },
          { text: "חליל", correctBucket: "כלי נגינה" },
          { text: "מחק", correctBucket: "כלי כתיבה" },
          { text: "תוף", correctBucket: "כלי נגינה" },
          { text: "מחדד", correctBucket: "כלי כתיבה" },
        ],
      },
      {
        buckets: ["שוקע במים", "צף במים"],
        items: [
          { text: "אבן", correctBucket: "שוקע במים" },
          { text: "עץ", correctBucket: "צף במים" },
          { text: "מפתח מתכת", correctBucket: "שוקע במים" },
          { text: "פקק", correctBucket: "צף במים" },
          { text: "מטבע", correctBucket: "שוקע במים" },
          { text: "כדור פלסטיק", correctBucket: "צף במים" },
          { text: "בורג", correctBucket: "שוקע במים" },
          { text: "עלה", correctBucket: "צף במים" },
        ],
      },
    ],
    hard: [
      {
        buckets: ["מוצק", "נוזל"],
        items: [
          { text: "קרח", correctBucket: "מוצק" },
          { text: "מים", correctBucket: "נוזל" },
          { text: "עץ", correctBucket: "מוצק" },
          { text: "חלב", correctBucket: "נוזל" },
          { text: "אבן", correctBucket: "מוצק" },
          { text: "מיץ", correctBucket: "נוזל" },
          { text: "ברזל", correctBucket: "מוצק" },
          { text: "שמן", correctBucket: "נוזל" },
          { text: "פלסטיק", correctBucket: "מוצק" },
          { text: "דבש", correctBucket: "נוזל" },
        ],
      },
      {
        buckets: ["חשמלי", "לא חשמלי"],
        items: [
          { text: "טלוויזיה", correctBucket: "חשמלי" },
          { text: "כיסא", correctBucket: "לא חשמלי" },
          { text: "מחשב", correctBucket: "חשמלי" },
          { text: "ספר", correctBucket: "לא חשמלי" },
          { text: "מקרר", correctBucket: "חשמלי" },
          { text: "שולחן", correctBucket: "לא חשמלי" },
          { text: "מנורה", correctBucket: "חשמלי" },
          { text: "כדור", correctBucket: "לא חשמלי" },
        ],
      },
      {
        buckets: ["חושים", "איברים"],
        items: [
          { text: "ראייה", correctBucket: "חושים" },
          { text: "לב", correctBucket: "איברים" },
          { text: "שמיעה", correctBucket: "חושים" },
          { text: "ריאות", correctBucket: "איברים" },
          { text: "מישוש", correctBucket: "חושים" },
          { text: "מוח", correctBucket: "איברים" },
          { text: "טעם", correctBucket: "חושים" },
          { text: "כבד", correctBucket: "איברים" },
        ],
      },
    ],
  },

  // Grade ג (3rd grade) - Basic science categories
  ג: {
    easy: [
      {
        buckets: ["מצב מוצק", "מצב נוזל", "מצב גזי"],
        items: [
          { text: "קרח", correctBucket: "מצב מוצק" },
          { text: "מים", correctBucket: "מצב נוזל" },
          { text: "אדים", correctBucket: "מצב גזי" },
          { text: "אבן", correctBucket: "מצב מוצק" },
          { text: "חלב", correctBucket: "מצב נוזל" },
          { text: "אוויר", correctBucket: "מצב גזי" },
          { text: "עץ", correctBucket: "מצב מוצק" },
          { text: "מיץ", correctBucket: "מצב נוזל" },
          { text: "חמצן", correctBucket: "מצב גזי" },
        ],
      },
      {
        buckets: ["חולייתנים", "חסרי חוליות"],
        items: [
          { text: "כלב", correctBucket: "חולייתנים" },
          { text: "נמלה", correctBucket: "חסרי חוליות" },
          { text: "דג", correctBucket: "חולייתנים" },
          { text: "פרפר", correctBucket: "חסרי חוליות" },
          { text: "ציפור", correctBucket: "חולייתנים" },
          { text: "עכביש", correctBucket: "חסרי חוליות" },
          { text: "נחש", correctBucket: "חולייתנים" },
          { text: "תולעת", correctBucket: "חסרי חוליות" },
          { text: "צפרדע", correctBucket: "חולייתנים" },
          { text: "חילזון", correctBucket: "חסרי חוליות" },
        ],
      },
      {
        buckets: ["מתכת", "לא מתכת"],
        items: [
          { text: "ברזל", correctBucket: "מתכת" },
          { text: "עץ", correctBucket: "לא מתכת" },
          { text: "נחושת", correctBucket: "מתכת" },
          { text: "פלסטיק", correctBucket: "לא מתכת" },
          { text: "זהב", correctBucket: "מתכת" },
          { text: "זכוכית", correctBucket: "לא מתכת" },
          { text: "כסף", correctBucket: "מתכת" },
          { text: "נייר", correctBucket: "לא מתכת" },
        ],
      },
    ],
    medium: [
      {
        buckets: ["אנרגיה מתחדשת", "אנרגיה לא מתחדשת"],
        items: [
          { text: "שמש", correctBucket: "אנרגיה מתחדשת" },
          { text: "נפט", correctBucket: "אנרגיה לא מתחדשת" },
          { text: "רוח", correctBucket: "אנרגיה מתחדשת" },
          { text: "פחם", correctBucket: "אנרגיה לא מתחדשת" },
          { text: "מים (הידרו)", correctBucket: "אנרגיה מתחדשת" },
          { text: "גז טבעי", correctBucket: "אנרגיה לא מתחדשת" },
          { text: "גיאותרמי", correctBucket: "אנרגיה מתחדשת" },
          { text: "דלק", correctBucket: "אנרגיה לא מתחדשת" },
        ],
      },
      {
        buckets: ["כוח משיכה", "כוח דחיפה"],
        items: [
          { text: "למשוך דלת", correctBucket: "כוח משיכה" },
          { text: "לדחוף עגלה", correctBucket: "כוח דחיפה" },
          { text: "מגנט מושך ברזל", correctBucket: "כוח משיכה" },
          { text: "לבעוט בכדור", correctBucket: "כוח דחיפה" },
          { text: "גרירת חבל", correctBucket: "כוח משיכה" },
          { text: "להרים משקולת", correctBucket: "כוח משיכה" },
          { text: "להזיז רהיט", correctBucket: "כוח דחיפה" },
          { text: "לזרוק כדור", correctBucket: "כוח דחיפה" },
        ],
      },
      {
        buckets: ["בעלי חיים טורפים", "בעלי חיים צמחונים"],
        items: [
          { text: "אריה", correctBucket: "בעלי חיים טורפים" },
          { text: "פרה", correctBucket: "בעלי חיים צמחונים" },
          { text: "זאב", correctBucket: "בעלי חיים טורפים" },
          { text: "ארנב", correctBucket: "בעלי חיים צמחונים" },
          { text: "נמר", correctBucket: "בעלי חיים טורפים" },
          { text: "סוס", correctBucket: "בעלי חיים צמחונים" },
          { text: "תנין", correctBucket: "בעלי חיים טורפים" },
          { text: "ג'ירפה", correctBucket: "בעלי חיים צמחונים" },
        ],
      },
    ],
    hard: [
      {
        buckets: ["מערכת עיכול", "מערכת נשימה", "מערכת דם"],
        items: [
          { text: "קיבה", correctBucket: "מערכת עיכול" },
          { text: "ריאות", correctBucket: "מערכת נשימה" },
          { text: "לב", correctBucket: "מערכת דם" },
          { text: "מעי דק", correctBucket: "מערכת עיכול" },
          { text: "קנה הנשימה", correctBucket: "מערכת נשימה" },
          { text: "עורקים", correctBucket: "מערכת דם" },
          { text: "ושט", correctBucket: "מערכת עיכול" },
          { text: "סימפונות", correctBucket: "מערכת נשימה" },
          { text: "ורידים", correctBucket: "מערכת דם" },
        ],
      },
      {
        buckets: ["כוכבי לכת פנימיים", "כוכבי לכת חיצוניים"],
        items: [
          { text: "כוכב חמה", correctBucket: "כוכבי לכת פנימיים" },
          { text: "צדק", correctBucket: "כוכבי לכת חיצוניים" },
          { text: "נוגה", correctBucket: "כוכבי לכת פנימיים" },
          { text: "שבתאי", correctBucket: "כוכבי לכת חיצוניים" },
          { text: "כדור הארץ", correctBucket: "כוכבי לכת פנימיים" },
          { text: "אורנוס", correctBucket: "כוכבי לכת חיצוניים" },
          { text: "מאדים", correctBucket: "כוכבי לכת פנימיים" },
          { text: "נפטון", correctBucket: "כוכבי לכת חיצוניים" },
        ],
      },
      {
        buckets: ["מוליך חשמל", "מבודד חשמל"],
        items: [
          { text: "נחושת", correctBucket: "מוליך חשמל" },
          { text: "גומי", correctBucket: "מבודד חשמל" },
          { text: "ברזל", correctBucket: "מוליך חשמל" },
          { text: "פלסטיק", correctBucket: "מבודד חשמל" },
          { text: "אלומיניום", correctBucket: "מוליך חשמל" },
          { text: "עץ", correctBucket: "מבודד חשמל" },
          { text: "זהב", correctBucket: "מוליך חשמל" },
          { text: "זכוכית", correctBucket: "מבודד חשמל" },
        ],
      },
    ],
  },

  // Grade ד (4th grade) - Intermediate science
  ד: {
    easy: [
      {
        buckets: ["יונקים", "דגים", "ציפורים"],
        items: [
          { text: "כלב", correctBucket: "יונקים" },
          { text: "כריש", correctBucket: "דגים" },
          { text: "נשר", correctBucket: "ציפורים" },
          { text: "דולפין", correctBucket: "יונקים" },
          { text: "דג זהב", correctBucket: "דגים" },
          { text: "תוכי", correctBucket: "ציפורים" },
          { text: "לווייתן", correctBucket: "יונקים" },
          { text: "סלמון", correctBucket: "דגים" },
          { text: "פינגווין", correctBucket: "ציפורים" },
        ],
      },
      {
        buckets: ["חומצות", "בסיסים"],
        items: [
          { text: "לימון", correctBucket: "חומצות" },
          { text: "סבון", correctBucket: "בסיסים" },
          { text: "חומץ", correctBucket: "חומצות" },
          { text: "סודה לשתייה", correctBucket: "בסיסים" },
          { text: "תפוז", correctBucket: "חומצות" },
          { text: "אקונומיקה", correctBucket: "בסיסים" },
          { text: "יין", correctBucket: "חומצות" },
          { text: "אמוניה", correctBucket: "בסיסים" },
        ],
      },
      {
        buckets: ["שינוי פיזיקלי", "שינוי כימי"],
        items: [
          { text: "קרח נמס", correctBucket: "שינוי פיזיקלי" },
          { text: "נייר נשרף", correctBucket: "שינוי כימי" },
          { text: "מים רותחים", correctBucket: "שינוי פיזיקלי" },
          { text: "ברזל מחליד", correctBucket: "שינוי כימי" },
          { text: "שבירת זכוכית", correctBucket: "שינוי פיזיקלי" },
          { text: "עוגה נאפית", correctBucket: "שינוי כימי" },
          { text: "קיפול נייר", correctBucket: "שינוי פיזיקלי" },
          { text: "חלב מחמיץ", correctBucket: "שינוי כימי" },
        ],
      },
    ],
    medium: [
      {
        buckets: ["אנרגיה קינטית", "אנרגיה פוטנציאלית"],
        items: [
          { text: "כדור מתגלגל", correctBucket: "אנרגיה קינטית" },
          { text: "קפיץ דחוס", correctBucket: "אנרגיה פוטנציאלית" },
          { text: "מכונית נוסעת", correctBucket: "אנרגיה קינטית" },
          { text: "כדור על מדף גבוה", correctBucket: "אנרגיה פוטנציאלית" },
          { text: "רוח נושבת", correctBucket: "אנרגיה קינטית" },
          { text: "חץ מתוח בקשת", correctBucket: "אנרגיה פוטנציאלית" },
          { text: "מטוס עף", correctBucket: "אנרגיה קינטית" },
          { text: "סוללה טעונה", correctBucket: "אנרגיה פוטנציאלית" },
        ],
      },
      {
        buckets: ["חיידקים מועילים", "חיידקים מזיקים"],
        items: [
          { text: "חיידקי יוגורט", correctBucket: "חיידקים מועילים" },
          { text: "חיידקי סלמונלה", correctBucket: "חיידקים מזיקים" },
          { text: "חיידקי עיכול", correctBucket: "חיידקים מועילים" },
          { text: "חיידקי שחפת", correctBucket: "חיידקים מזיקים" },
          { text: "חיידקי גבינה", correctBucket: "חיידקים מועילים" },
          { text: "חיידקי דלקת", correctBucket: "חיידקים מזיקים" },
          { text: "חיידקי קומפוסט", correctBucket: "חיידקים מועילים" },
          { text: "חיידקי הרעלה", correctBucket: "חיידקים מזיקים" },
        ],
      },
      {
        buckets: ["תגובת אנדותרמית", "תגובת אקסותרמית"],
        items: [
          { text: "המסת קרח", correctBucket: "תגובת אנדותרמית" },
          { text: "בעירה", correctBucket: "תגובת אקסותרמית" },
          { text: "פוטוסינתזה", correctBucket: "תגובת אנדותרמית" },
          { text: "חמצון ברזל", correctBucket: "תגובת אקסותרמית" },
          { text: "בישול ביצה", correctBucket: "תגובת אנדותרמית" },
          { text: "נשימה תאית", correctBucket: "תגובת אקסותרמית" },
          { text: "התאדות מים", correctBucket: "תגובת אנדותרמית" },
          { text: "התקשרות מלט", correctBucket: "תגובת אקסותרמית" },
        ],
      },
    ],
    hard: [
      {
        buckets: ["גלי אור נראה", "קרינה בלתי נראית"],
        items: [
          { text: "אדום", correctBucket: "גלי אור נראה" },
          { text: "קרני X", correctBucket: "קרינה בלתי נראית" },
          { text: "ירוק", correctBucket: "גלי אור נראה" },
          { text: "אינפרא-אדום", correctBucket: "קרינה בלתי נראית" },
          { text: "כחול", correctBucket: "גלי אור נראה" },
          { text: "אולטרה-סגול", correctBucket: "קרינה בלתי נראית" },
          { text: "צהוב", correctBucket: "גלי אור נראה" },
          { text: "גלי רדיו", correctBucket: "קרינה בלתי נראית" },
        ],
      },
      {
        buckets: ["מאפייני יונקים", "מאפייני זוחלים"],
        items: [
          { text: "שיער או פרווה", correctBucket: "מאפייני יונקים" },
          { text: "קשקשים", correctBucket: "מאפייני זוחלים" },
          { text: "מניקות חלב", correctBucket: "מאפייני יונקים" },
          { text: "קר-דמיים", correctBucket: "מאפייני זוחלים" },
          { text: "חם-דמיים", correctBucket: "מאפייני יונקים" },
          { text: "מטילות ביצים", correctBucket: "מאפייני זוחלים" },
          { text: "לידה חיה", correctBucket: "מאפייני יונקים" },
          { text: "מחליפות עור", correctBucket: "מאפייני זוחלים" },
        ],
      },
      {
        buckets: ["סלעים משקעים", "סלעים יסוד", "סלעים מותכים"],
        items: [
          { text: "גיר", correctBucket: "סלעים משקעים" },
          { text: "גרניט", correctBucket: "סלעים יסוד" },
          { text: "בזלת", correctBucket: "סלעים מותכים" },
          { text: "אבן חול", correctBucket: "סלעים משקעים" },
          { text: "שיש", correctBucket: "סלעים יסוד" },
          { text: "אובסידיאן", correctBucket: "סלעים מותכים" },
          { text: "צור", correctBucket: "סלעים משקעים" },
          { text: "צפחה", correctBucket: "סלעים יסוד" },
          { text: "פומיס", correctBucket: "סלעים מותכים" },
        ],
      },
    ],
  },

  // Grade ה (5th grade) - Advanced science concepts
  ה: {
    easy: [
      {
        buckets: ["יסודות", "תרכובות"],
        items: [
          { text: "חמצן O2", correctBucket: "יסודות" },
          { text: "מים H2O", correctBucket: "תרכובות" },
          { text: "מימן H2", correctBucket: "יסודות" },
          { text: "מלח NaCl", correctBucket: "תרכובות" },
          { text: "זהב Au", correctBucket: "יסודות" },
          { text: "סוכר C6H12O6", correctBucket: "תרכובות" },
          { text: "חנקן N2", correctBucket: "יסודות" },
          { text: "פחמן דו-חמצני CO2", correctBucket: "תרכובות" },
        ],
      },
      {
        buckets: ["DNA", "RNA"],
        items: [
          { text: "סליל כפול", correctBucket: "DNA" },
          { text: "סליל בודד", correctBucket: "RNA" },
          { text: "נמצא בגרעין", correctBucket: "DNA" },
          { text: "יוצא מהגרעין", correctBucket: "RNA" },
          { text: "דאוקסיריבוז", correctBucket: "DNA" },
          { text: "ריבוז", correctBucket: "RNA" },
          { text: "תימין", correctBucket: "DNA" },
          { text: "אורציל", correctBucket: "RNA" },
        ],
      },
      {
        buckets: ["כוחות מגע", "כוחות מרחוק"],
        items: [
          { text: "חיכוך", correctBucket: "כוחות מגע" },
          { text: "כבידה", correctBucket: "כוחות מרחוק" },
          { text: "לחיצה", correctBucket: "כוחות מגע" },
          { text: "מגנטיות", correctBucket: "כוחות מרחוק" },
          { text: "מתיחה", correctBucket: "כוחות מגע" },
          { text: "חשמל סטטי", correctBucket: "כוחות מרחוק" },
          { text: "התנגדות אוויר", correctBucket: "כוחות מגע" },
          { text: "כוח גרעיני", correctBucket: "כוחות מרחוק" },
        ],
      },
    ],
    medium: [
      {
        buckets: ["מיטוזה", "מיוזה"],
        items: [
          { text: "יוצר 2 תאים", correctBucket: "מיטוזה" },
          { text: "יוצר 4 תאים", correctBucket: "מיוזה" },
          { text: "תאים זהים", correctBucket: "מיטוזה" },
          { text: "תאי רבייה", correctBucket: "מיוזה" },
          { text: "גדילה ותיקון", correctBucket: "מיטוזה" },
          { text: "מגוון גנטי", correctBucket: "מיוזה" },
          { text: "מספר כרומוזומים שלם", correctBucket: "מיטוזה" },
          { text: "חצי כרומוזומים", correctBucket: "מיוזה" },
        ],
      },
      {
        buckets: ["גל אורך", "גל רוחב"],
        items: [
          { text: "גלי קול", correctBucket: "גל אורך" },
          { text: "גלי אור", correctBucket: "גל רוחב" },
          { text: "דחיסה והתפשטות", correctBucket: "גל אורך" },
          { text: "תנודה ניצבת", correctBucket: "גל רוחב" },
          { text: "גלי קפיץ נדחס", correctBucket: "גל אורך" },
          { text: "גלים בחבל", correctBucket: "גל רוחב" },
          { text: "רעידות אדמה P", correctBucket: "גל אורך" },
          { text: "רעידות אדמה S", correctBucket: "גל רוחב" },
        ],
      },
      {
        buckets: ["חומר אורגני", "חומר אי-אורגני"],
        items: [
          { text: "גלוקוז", correctBucket: "חומר אורגני" },
          { text: "מלח", correctBucket: "חומר אי-אורגני" },
          { text: "חלבון", correctBucket: "חומר אורגני" },
          { text: "מים", correctBucket: "חומר אי-אורגני" },
          { text: "שומן", correctBucket: "חומר אורגני" },
          { text: "ברזל", correctBucket: "חומר אי-אורגני" },
          { text: "DNA", correctBucket: "חומר אורגני" },
          { text: "פחמן דו-חמצני", correctBucket: "חומר אי-אורגני" },
        ],
      },
    ],
    hard: [
      {
        buckets: ["תאים פרוקריוטים", "תאים איקריוטים"],
        items: [
          { text: "חיידקים", correctBucket: "תאים פרוקריוטים" },
          { text: "תאי צמח", correctBucket: "תאים איקריוטים" },
          { text: "ללא גרעין", correctBucket: "תאים פרוקריוטים" },
          { text: "עם גרעין", correctBucket: "תאים איקריוטים" },
          { text: "ארכיאה", correctBucket: "תאים פרוקריוטים" },
          { text: "פטריות", correctBucket: "תאים איקריוטים" },
          { text: "DNA מעגלי", correctBucket: "תאים פרוקריוטים" },
          { text: "אברונים מוקפי קרום", correctBucket: "תאים איקריוטים" },
        ],
      },
      {
        buckets: ["חוקי תרמודינמיקה I", "חוקי תרמודינמיקה II"],
        items: [
          { text: "שימור אנרגיה", correctBucket: "חוקי תרמודינמיקה I" },
          { text: "אנטרופיה עולה", correctBucket: "חוקי תרמודינמיקה II" },
          { text: "אנרגיה לא נוצרת", correctBucket: "חוקי תרמודינמיקה I" },
          { text: "חום זורם מחם לקר", correctBucket: "חוקי תרמודינמיקה II" },
          { text: "אנרגיה לא נשמדת", correctBucket: "חוקי תרמודינמיקה I" },
          { text: "אי-סדר טבעי", correctBucket: "חוקי תרמודינמיקה II" },
          { text: "המרת אנרגיה", correctBucket: "חוקי תרמודינמיקה I" },
          { text: "תהליכים בלתי הפיכים", correctBucket: "חוקי תרמודינמיקה II" },
        ],
      },
      {
        buckets: ["פוטוסינתזה", "נשימה תאית"],
        items: [
          { text: "משחררת חמצן", correctBucket: "פוטוסינתזה" },
          { text: "צורכת חמצן", correctBucket: "נשימה תאית" },
          { text: "צורכת CO2", correctBucket: "פוטוסינתזה" },
          { text: "משחררת CO2", correctBucket: "נשימה תאית" },
          { text: "דורשת אור", correctBucket: "פוטוסינתזה" },
          { text: "מתרחשת בחושך", correctBucket: "נשימה תאית" },
          { text: "מייצרת גלוקוז", correctBucket: "פוטוסינתזה" },
          { text: "מפרקת גלוקוז", correctBucket: "נשימה תאית" },
        ],
      },
    ],
  },

  // Grade ו (6th grade) - Complex scientific concepts
  ו: {
    easy: [
      {
        buckets: ["מתכות", "אל-מתכות", "מתכות-למחצה"],
        items: [
          { text: "זהב", correctBucket: "מתכות" },
          { text: "פחמן", correctBucket: "אל-מתכות" },
          { text: "סיליקון", correctBucket: "מתכות-למחצה" },
          { text: "נחושת", correctBucket: "מתכות" },
          { text: "חמצן", correctBucket: "אל-מתכות" },
          { text: "גרמניום", correctBucket: "מתכות-למחצה" },
          { text: "ברזל", correctBucket: "מתכות" },
          { text: "גופרית", correctBucket: "אל-מתכות" },
          { text: "ארסן", correctBucket: "מתכות-למחצה" },
        ],
      },
      {
        buckets: ["תורשה דומיננטית", "תורשה רצסיבית"],
        items: [
          { text: "עיניים חומות", correctBucket: "תורשה דומיננטית" },
          { text: "עיניים כחולות", correctBucket: "תורשה רצסיבית" },
          { text: "שיער כהה", correctBucket: "תורשה דומיננטית" },
          { text: "שיער אדום", correctBucket: "תורשה רצסיבית" },
          { text: "נקודת יד", correctBucket: "תורשה דומיננטית" },
          { text: "אלבינות", correctBucket: "תורשה רצסיבית" },
          { text: "ראיית צבעים", correctBucket: "תורשה דומיננטית" },
          { text: "עיוורון צבעים", correctBucket: "תורשה רצסיבית" },
        ],
      },
      {
        buckets: ["אלקטרון", "פרוטון", "נייטרון"],
        items: [
          { text: "מטען שלילי", correctBucket: "אלקטרון" },
          { text: "מטען חיובי", correctBucket: "פרוטון" },
          { text: "ללא מטען", correctBucket: "נייטרון" },
          { text: "מסלול סביב הגרעין", correctBucket: "אלקטרון" },
          { text: "בתוך הגרעין", correctBucket: "פרוטון" },
          { text: "מייצב את הגרעין", correctBucket: "נייטרון" },
          { text: "קל מאוד", correctBucket: "אלקטרון" },
          { text: "קובע את היסוד", correctBucket: "פרוטון" },
          { text: "קובע את האיזוטופ", correctBucket: "נייטרון" },
        ],
      },
    ],
    medium: [
      {
        buckets: ["קשר יוני", "קשר קוולנטי"],
        items: [
          { text: "מעבר אלקטרונים", correctBucket: "קשר יוני" },
          { text: "שיתוף אלקטרונים", correctBucket: "קשר קוולנטי" },
          { text: "מתכת + אל-מתכת", correctBucket: "קשר יוני" },
          { text: "אל-מתכת + אל-מתכת", correctBucket: "קשר קוולנטי" },
          { text: "NaCl", correctBucket: "קשר יוני" },
          { text: "H2O", correctBucket: "קשר קוולנטי" },
          { text: "מוליך בתמיסה", correctBucket: "קשר יוני" },
          { text: "לא מוליך בתמיסה", correctBucket: "קשר קוולנטי" },
        ],
      },
      {
        buckets: ["ממלכת בעלי חיים", "ממלכת צמחים", "ממלכת פטריות"],
        items: [
          { text: "אדם", correctBucket: "ממלכת בעלי חיים" },
          { text: "עץ אלון", correctBucket: "ממלכת צמחים" },
          { text: "פטריית שמפיניון", correctBucket: "ממלכת פטריות" },
          { text: "נמלה", correctBucket: "ממלכת בעלי חיים" },
          { text: "ורד", correctBucket: "ממלכת צמחים" },
          { text: "שמרים", correctBucket: "ממלכת פטריות" },
          { text: "מדוזה", correctBucket: "ממלכת בעלי חיים" },
          { text: "טחב", correctBucket: "ממלכת צמחים" },
          { text: "עובש", correctBucket: "ממלכת פטריות" },
        ],
      },
      {
        buckets: ["יחסות פרטית", "יחסות כללית"],
        items: [
          { text: "E=mc2", correctBucket: "יחסות פרטית" },
          { text: "כבידה כעקמומיות מרחב-זמן", correctBucket: "יחסות כללית" },
          { text: "מהירות האור קבועה", correctBucket: "יחסות פרטית" },
          { text: "גלי כבידה", correctBucket: "יחסות כללית" },
          { text: "התארכות זמן", correctBucket: "יחסות פרטית" },
          { text: "חורים שחורים", correctBucket: "יחסות כללית" },
          { text: "קיצור אורך", correctBucket: "יחסות פרטית" },
          { text: "עיקום אור סביב כוכבים", correctBucket: "יחסות כללית" },
        ],
      },
    ],
    hard: [
      {
        buckets: ["ביקוע גרעיני", "היתוך גרעיני"],
        items: [
          { text: "פיצול גרעין כבד", correctBucket: "ביקוע גרעיני" },
          { text: "איחוד גרעינים קלים", correctBucket: "היתוך גרעיני" },
          { text: "אורניום", correctBucket: "ביקוע גרעיני" },
          { text: "מימן", correctBucket: "היתוך גרעיני" },
          { text: "כור גרעיני", correctBucket: "ביקוע גרעיני" },
          { text: "תהליך בשמש", correctBucket: "היתוך גרעיני" },
          { text: "פצצה אטומית", correctBucket: "ביקוע גרעיני" },
          { text: "פצצת מימן", correctBucket: "היתוך גרעיני" },
        ],
      },
      {
        buckets: ["חלקיקים פרמיונים", "חלקיקים בוזונים"],
        items: [
          { text: "אלקטרון", correctBucket: "חלקיקים פרמיונים" },
          { text: "פוטון", correctBucket: "חלקיקים בוזונים" },
          { text: "קווארק", correctBucket: "חלקיקים פרמיונים" },
          { text: "גלואון", correctBucket: "חלקיקים בוזונים" },
          { text: "נויטרינו", correctBucket: "חלקיקים פרמיונים" },
          { text: "בוזון היגס", correctBucket: "חלקיקים בוזונים" },
          { text: "פרוטון", correctBucket: "חלקיקים פרמיונים" },
          { text: "W ו-Z", correctBucket: "חלקיקים בוזונים" },
        ],
      },
      {
        buckets: ["סינתזת חלבון", "שכפול DNA"],
        items: [
          { text: "תרגום", correctBucket: "סינתזת חלבון" },
          { text: "הליקאז פותח סליל", correctBucket: "שכפול DNA" },
          { text: "ריבוזום", correctBucket: "סינתזת חלבון" },
          { text: "DNA פולימראז", correctBucket: "שכפול DNA" },
          { text: "tRNA", correctBucket: "סינתזת חלבון" },
          { text: "מזלג שכפול", correctBucket: "שכפול DNA" },
          { text: "קודון", correctBucket: "סינתזת חלבון" },
          { text: "פריימר", correctBucket: "שכפול DNA" },
        ],
      },
    ],
  },
};

async function checkExistingContent(): Promise<number> {
  const q = query(
    collection(db, "gameContent"),
    where("gameType", "==", "sort")
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

async function seedSortContent() {
  console.log("🎯 Starting Sort game content seeding...\n");

  // Check for existing content
  const existingCount = await checkExistingContent();
  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing Sort items in database.`);
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
      const contentSets = SORT_CONTENT[grade][difficulty];

      console.log(`📝 Adding ${contentSets.length} sort sets for grade ${grade}, ${difficulty}...`);

      for (const contentData of contentSets) {
        try {
          await addDoc(collection(db, "gameContent"), {
            gameType: "sort",
            grade,
            difficulty,
            buckets: contentData.buckets,
            items: contentData.items,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          totalAdded++;
        } catch (error) {
          console.error(`   ❌ Failed to add content:`, error);
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
      SORT_CONTENT[grade].easy.length +
      SORT_CONTENT[grade].medium.length +
      SORT_CONTENT[grade].hard.length;
    console.log(`   Grade ${grade}: ${gradeTotal} sorting tasks`);
  }
}

// Run the seed
seedSortContent()
  .then(() => {
    console.log("\n👋 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });

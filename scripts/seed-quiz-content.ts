/**
 * Seed script for Quiz game content
 * Run with: npx tsx scripts/seed-quiz-content.ts
 *
 * Creates STEM-related Hebrew quiz questions for all grades (א-ו) and difficulties (easy/medium/hard)
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

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// =============================================================================
// QUIZ CONTENT DATA
// Organized by grade, then difficulty
// Each question has: question, options (4), correctIndex, explanation
// =============================================================================

const QUIZ_CONTENT: Record<Grade, Record<Difficulty, QuizQuestion[]>> = {
  // Grade א (1st grade) - Very simple questions about nature and surroundings
  א: {
    easy: [
      {
        question: "איזה צבע הוא השמיים ביום בהיר?",
        options: ["כחול", "ירוק", "אדום", "צהוב"],
        correctIndex: 0,
        explanation: "השמיים נראים כחולים כי האור מהשמש מתפזר באוויר.",
      },
      {
        question: "מה שותים הצמחים כדי לגדול?",
        options: ["מים", "חלב", "מיץ", "שוקו"],
        correctIndex: 0,
        explanation: "צמחים צריכים מים כדי לגדול ולהישאר בריאים.",
      },
      {
        question: "כמה רגליים יש לכלב?",
        options: ["4", "2", "6", "8"],
        correctIndex: 0,
        explanation: "לכלב יש 4 רגליים, שתיים מקדימה ושתיים מאחורה.",
      },
      {
        question: "מה נותנת לנו השמש?",
        options: ["אור וחום", "מים", "אוכל", "בגדים"],
        correctIndex: 0,
        explanation: "השמש נותנת לנו אור כדי לראות וחום כדי להתחמם.",
      },
      {
        question: "איפה גרים דגים?",
        options: ["במים", "על עצים", "באדמה", "בשמיים"],
        correctIndex: 0,
        explanation: "דגים חיים במים כי הם נושמים דרך הזימים שלהם.",
      },
      {
        question: "מה יורד מהשמיים כשיש עננים?",
        options: ["גשם", "עלים", "פרחים", "כוכבים"],
        correctIndex: 0,
        explanation: "כשיש עננים, לפעמים יורד גשם שמרטיב את האדמה.",
      },
    ],
    medium: [
      {
        question: "מה עושה הפרפר לפני שהוא פרפר?",
        options: ["זחל", "דג", "ציפור", "צפרדע"],
        correctIndex: 0,
        explanation: "הפרפר מתחיל כזחל, עושה גולם, ואז הופך לפרפר יפה.",
      },
      {
        question: "מאיפה מגיע הדבש?",
        options: ["מדבורים", "מפרחים", "מעצים", "מחנות"],
        correctIndex: 0,
        explanation: "דבורים מייצרות דבש מצוף הפרחים שהן אוספות.",
      },
      {
        question: "מה אוכלים ארנבים?",
        options: ["ירקות וגזר", "בשר", "דגים", "גבינה"],
        correctIndex: 0,
        explanation: "ארנבים אוכלים ירקות, עלים וגזר כי הם צמחוניים.",
      },
      {
        question: "מה עושה הצמח כשיש לו שמש?",
        options: ["גדל", "ישן", "רץ", "שר"],
        correctIndex: 0,
        explanation: "צמחים משתמשים באור השמש כדי לייצר אוכל ולגדול.",
      },
      {
        question: "איזו חיה יודעת לעוף?",
        options: ["ציפור", "כלב", "דג", "נחש"],
        correctIndex: 0,
        explanation: "לציפורים יש כנפיים שעוזרות להן לעוף בשמיים.",
      },
      {
        question: "מה קורה לקרח כשהוא מתחמם?",
        options: ["הוא נמס למים", "הוא גדל", "הוא נעלם", "הוא הופך לאבן"],
        correctIndex: 0,
        explanation: "כשקרח מתחמם הוא נמס והופך למים נוזליים.",
      },
    ],
    hard: [
      {
        question: "למה עלים ירוקים?",
        options: ["בגלל כלורופיל", "בגלל מים", "בגלל אדמה", "בגלל שמש"],
        correctIndex: 0,
        explanation: "עלים ירוקים בגלל חומר ירוק שנקרא כלורופיל שעוזר לצמח לייצר אוכל.",
      },
      {
        question: "מה הכוכב הכי קרוב לכדור הארץ?",
        options: ["השמש", "הירח", "מאדים", "צדק"],
        correctIndex: 0,
        explanation: "השמש היא הכוכב הכי קרוב אלינו, והיא נותנת לנו אור וחום.",
      },
      {
        question: "מה גורם לרוח?",
        options: ["תנועה של אוויר", "מים", "אבנים", "עצים"],
        correctIndex: 0,
        explanation: "רוח נוצרת כשאוויר זז ממקום למקום, בדרך כלל מחם לקר.",
      },
      {
        question: "למה נשמעת רעמים אחרי ברקים?",
        options: ["כי אור מהיר יותר מקול", "כי ברקים שקטים", "כי רעמים איטיים", "כי הם רחוקים"],
        correctIndex: 0,
        explanation: "אנחנו רואים את הברק לפני ששומעים את הרעם כי אור נע מהר יותר מקול.",
      },
      {
        question: "מה החיה הכי גדולה בעולם?",
        options: ["לווייתן כחול", "פיל", "ג'ירפה", "תנין"],
        correctIndex: 0,
        explanation: "הלווייתן הכחול הוא החיה הכי גדולה שקיימת, יותר גדול אפילו מדינוזאורים.",
      },
      {
        question: "כמה עונות שנה יש?",
        options: ["4", "2", "3", "6"],
        correctIndex: 0,
        explanation: "יש 4 עונות: אביב, קיץ, סתיו וחורף.",
      },
    ],
  },

  // Grade ב (2nd grade) - Simple science questions
  ב: {
    easy: [
      {
        question: "מה מושך מגנט?",
        options: ["ברזל", "עץ", "פלסטיק", "נייר"],
        correctIndex: 0,
        explanation: "מגנט מושך חפצים מברזל ומתכות מסוימות אחרות.",
      },
      {
        question: "מאיזה חומר עשויה קרקעית הים?",
        options: ["חול ואבנים", "עץ", "פלסטיק", "בד"],
        correctIndex: 0,
        explanation: "קרקעית הים עשויה מחול, אבנים וסלעים שנשחקו במשך שנים.",
      },
      {
        question: "מה עוזר לציפורים לעוף?",
        options: ["כנפיים", "רגליים", "זנב", "מקור"],
        correctIndex: 0,
        explanation: "כנפיים עוזרות לציפורים לעוף על ידי דחיפת האוויר כלפי מטה.",
      },
      {
        question: "מה נותן לנו עץ תפוח?",
        options: ["תפוחים", "בננות", "תפוזים", "ענבים"],
        correctIndex: 0,
        explanation: "עץ תפוח מגדל תפוחים שאנחנו יכולים לאכול.",
      },
      {
        question: "מה החלק של הצמח שבאדמה?",
        options: ["שורש", "עלה", "פרח", "גבעול"],
        correctIndex: 0,
        explanation: "השורש נמצא באדמה וסופג מים ומינרלים לצמח.",
      },
      {
        question: "למה יש לנו אוזניים?",
        options: ["לשמוע קולות", "לראות", "להריח", "לטעום"],
        correctIndex: 0,
        explanation: "האוזניים עוזרות לנו לשמוע קולות מהסביבה.",
      },
    ],
    medium: [
      {
        question: "מה קורה כשמערבבים מים וסוכר?",
        options: ["הסוכר נמס", "הסוכר גדל", "המים נעלמים", "נוצר קרח"],
        correctIndex: 0,
        explanation: "כשמערבבים סוכר במים, הסוכר נמס ונהיה בלתי נראה.",
      },
      {
        question: "איזו חיה היא יונק?",
        options: ["כלב", "דג", "נחש", "צב"],
        correctIndex: 0,
        explanation: "כלב הוא יונק כי הוא נולד מאימו ויונק חלב.",
      },
      {
        question: "מה גורם ליום ולילה?",
        options: ["סיבוב כדור הארץ", "הירח", "כוכבים", "עננים"],
        correctIndex: 0,
        explanation: "כדור הארץ מסתובב, וכשהצד שלנו פונה לשמש יש יום, וכשלא - לילה.",
      },
      {
        question: "מה הדבר הקשה ביותר בגוף שלנו?",
        options: ["שיניים", "עור", "שיער", "ציפורניים"],
        correctIndex: 0,
        explanation: "השיניים הן החלק הקשה ביותר בגוף, עשויות מאמייל חזק.",
      },
      {
        question: "מאיפה מגיע החלב?",
        options: ["מפרות", "מתרנגולות", "מכבשים", "מסוסים"],
        correctIndex: 0,
        explanation: "חלב מגיע מפרות (ומיונקות אחרות) שמייצרות אותו להאכיל את הגורים.",
      },
      {
        question: "מה עושה הלב?",
        options: ["שואב דם", "עוזר לנשום", "עוזר לראות", "עוזר לשמוע"],
        correctIndex: 0,
        explanation: "הלב שואב דם לכל חלקי הגוף כדי לתת להם חמצן ואוכל.",
      },
    ],
    hard: [
      {
        question: "מהו מחזור המים?",
        options: ["מים מתאדים, הופכים לעננים וחוזרים כגשם", "מים זורמים בנהרות", "מים נשארים בים", "מים הופכים לקרח"],
        correctIndex: 0,
        explanation: "במחזור המים: מים מתאדים לשמיים, נהיים עננים, ויורדים חזרה כגשם.",
      },
      {
        question: "מה ההבדל בין צמח לחיה?",
        options: ["צמח מייצר אוכל מאור, חיה אוכלת", "צמח זז, חיה לא", "צמח שותה חלב", "אין הבדל"],
        correctIndex: 0,
        explanation: "צמחים מייצרים אוכל מאור השמש, בעוד חיות צריכות לאכול אוכל.",
      },
      {
        question: "למה שמים כבדים יותר מאוויר?",
        options: ["כי המולקולות יותר קרובות", "כי הם כחולים", "כי הם גבוהים", "כי יש בהם כוכבים"],
        correctIndex: 0,
        explanation: "מים כבדים יותר כי המולקולות שלהם דחוסות וקרובות יותר זו לזו.",
      },
      {
        question: "מה תפקיד הריאות?",
        options: ["לנשום אוויר", "לעכל אוכל", "לראות", "לשמוע"],
        correctIndex: 0,
        explanation: "הריאות מכניסות חמצן לגוף ומוציאות פחמן דו-חמצני.",
      },
      {
        question: "איך צמחים שותים מים?",
        options: ["דרך השורשים", "דרך העלים", "דרך הפרחים", "דרך הענפים"],
        correctIndex: 0,
        explanation: "צמחים סופגים מים מהאדמה דרך השורשים שלהם.",
      },
      {
        question: "מה זה מאובן?",
        options: ["שריד של חיה או צמח עתיק", "אבן יפה", "סוג של צמח", "סוג של חיה"],
        correctIndex: 0,
        explanation: "מאובן הוא שריד של יצור חי שחי לפני מיליוני שנים ונשתמר באבן.",
      },
    ],
  },

  // Grade ג (3rd grade) - Basic science concepts
  ג: {
    easy: [
      {
        question: "מה מצב הצבירה של קרח?",
        options: ["מוצק", "נוזל", "גז", "פלזמה"],
        correctIndex: 0,
        explanation: "קרח הוא מים במצב מוצק - קפוא וקשה.",
      },
      {
        question: "איזה כוכב לכת הכי קרוב לשמש?",
        options: ["כוכב חמה", "כדור הארץ", "מאדים", "צדק"],
        correctIndex: 0,
        explanation: "כוכב חמה (מרקורי) הוא הכוכב הקרוב ביותר לשמש.",
      },
      {
        question: "מה עושה החשמל?",
        options: ["מפעיל מכשירים", "נותן מים", "נותן אוכל", "נותן אוויר"],
        correctIndex: 0,
        explanation: "חשמל הוא סוג של אנרגיה שמפעיל מכשירים כמו טלוויזיה ומקרר.",
      },
      {
        question: "כמה כוכבי לכת יש במערכת השמש?",
        options: ["8", "5", "10", "12"],
        correctIndex: 0,
        explanation: "יש 8 כוכבי לכת במערכת השמש: כוכב חמה, נוגה, כדור הארץ, מאדים, צדק, שבתאי, אורנוס ונפטון.",
      },
      {
        question: "מה תפקיד השלד בגוף?",
        options: ["לתמוך ולהגן", "לעכל אוכל", "לנשום", "לראות"],
        correctIndex: 0,
        explanation: "השלד תומך בגוף, נותן לו צורה ומגן על איברים פנימיים.",
      },
      {
        question: "מהו מקור האנרגיה הגדול ביותר לכדור הארץ?",
        options: ["השמש", "הירח", "הרוח", "המים"],
        correctIndex: 0,
        explanation: "השמש היא מקור האנרגיה הגדול ביותר לכדור הארץ.",
      },
    ],
    medium: [
      {
        question: "מה זה כבידה?",
        options: ["כוח שמושך דברים למטה", "סוג של אור", "סוג של קול", "סוג של חום"],
        correctIndex: 0,
        explanation: "כבידה היא הכוח שמושך את כל הדברים לכיוון מרכז כדור הארץ.",
      },
      {
        question: "איך נוצרת קשת בענן?",
        options: ["אור עובר דרך טיפות מים", "עננים צבעוניים", "השמש צובעת את השמיים", "קסם"],
        correctIndex: 0,
        explanation: "קשת נוצרת כשאור השמש עובר דרך טיפות גשם ומתפצל לצבעים.",
      },
      {
        question: "מה ההבדל בין חיידק לוירוס?",
        options: ["חיידק הוא יצור חי, וירוס לא בדיוק", "אין הבדל", "וירוס גדול יותר", "חיידק גורם רק לטוב"],
        correctIndex: 0,
        explanation: "חיידקים הם יצורים חיים עצמאיים, בעוד וירוסים צריכים תאים אחרים כדי להתרבות.",
      },
      {
        question: "מה עושים צמחים בלילה?",
        options: ["נושמים", "מייצרים אוכל", "גדלים הכי מהר", "מתים"],
        correctIndex: 0,
        explanation: "בלילה צמחים נושמים כמונו, לוקחים חמצן ומשחררים פחמן דו-חמצני.",
      },
      {
        question: "למה ספינות צפות על המים?",
        options: ["בגלל כוח הציפה", "בגלל שהן קלות", "בגלל הרוח", "בגלל המנוע"],
        correctIndex: 0,
        explanation: "ספינות צפות בגלל כוח הציפה - הן דוחות מספיק מים כדי לשאת את משקלן.",
      },
      {
        question: "מה קורה כשמים מתאדים?",
        options: ["הופכים לאדי מים (גז)", "הופכים לקרח", "נעלמים לגמרי", "הופכים לשמן"],
        correctIndex: 0,
        explanation: "כשמים מתאדים, הם הופכים לאדים - מצב גזי של מים.",
      },
    ],
    hard: [
      {
        question: "מה זה פוטוסינתזה?",
        options: ["תהליך שבו צמחים מייצרים אוכל מאור", "תהליך נשימה", "תהליך עיכול", "תהליך גדילה"],
        correctIndex: 0,
        explanation: "פוטוסינתזה היא התהליך שבו צמחים משתמשים באור, מים ופחמן דו-חמצני לייצר סוכר וחמצן.",
      },
      {
        question: "למה יש לנו מרפקים וברכיים?",
        options: ["כדי לכופף את הגפיים", "כדי להיות גבוהים", "כדי לראות טוב", "כדי לשמוע טוב"],
        correctIndex: 0,
        explanation: "מרפקים וברכיים הם מפרקים שמאפשרים לנו לכופף ידיים ורגליים.",
      },
      {
        question: "מה גורם לרעידות אדמה?",
        options: ["תנועה של לוחות בקרום כדור הארץ", "רוח חזקה", "גשם כבד", "חום מהשמש"],
        correctIndex: 0,
        explanation: "רעידות אדמה נגרמות כשלוחות טקטוניים בקרום כדור הארץ זזים ומתנגשים.",
      },
      {
        question: "מהו האיבר הכי גדול בגוף?",
        options: ["העור", "הכבד", "המוח", "הלב"],
        correctIndex: 0,
        explanation: "העור הוא האיבר הגדול ביותר בגוף ומגן עלינו מפני מזיקים.",
      },
      {
        question: "מה ההבדל בין מסה למשקל?",
        options: ["מסה היא כמות החומר, משקל תלוי בכבידה", "אין הבדל", "משקל גדול יותר תמיד", "מסה היא לנוזלים"],
        correctIndex: 0,
        explanation: "מסה היא כמות החומר (לא משתנה), משקל הוא הכוח שכבידה מפעילה (משתנה לפי מקום).",
      },
      {
        question: "איך מודדים טמפרטורה?",
        options: ["במדחום", "בסרגל", "במשקל", "בשעון"],
        correctIndex: 0,
        explanation: "מדחום הוא מכשיר שמודד את רמת החום או הקור - הטמפרטורה.",
      },
    ],
  },

  // Grade ד (4th grade) - Intermediate science
  ד: {
    easy: [
      {
        question: "מהם שלושת מצבי הצבירה של חומר?",
        options: ["מוצק, נוזל, גז", "חם, קר, פושר", "גדול, בינוני, קטן", "קשה, רך, נוזלי"],
        correctIndex: 0,
        explanation: "שלושת מצבי הצבירה הם: מוצק (כמו קרח), נוזל (כמו מים), וגז (כמו אדים).",
      },
      {
        question: "מה הגז שאנחנו נושמים ונותן לנו חיים?",
        options: ["חמצן", "חנקן", "פחמן דו-חמצני", "מימן"],
        correctIndex: 0,
        explanation: "אנחנו נושמים חמצן שעוזר לתאי הגוף שלנו לייצר אנרגיה.",
      },
      {
        question: "מה הכוכב הגדול ביותר במערכת השמש?",
        options: ["צדק", "שבתאי", "כדור הארץ", "מאדים"],
        correctIndex: 0,
        explanation: "צדק (Jupiter) הוא הכוכב הגדול ביותר, יותר מ-1000 פעמים מכדור הארץ.",
      },
      {
        question: "מה עושה סוללה?",
        options: ["מאחסנת אנרגיה חשמלית", "מייצרת מים", "מייצרת אור", "מייצרת קול"],
        correctIndex: 0,
        explanation: "סוללה מאחסנת אנרגיה כימית ומשחררת אותה כחשמל.",
      },
      {
        question: "מהו האיבר שחושב ושולט בגוף?",
        options: ["המוח", "הלב", "הכבד", "הריאות"],
        correctIndex: 0,
        explanation: "המוח שולט בכל פעילויות הגוף, בחשיבה, בזיכרון ובתנועה.",
      },
      {
        question: "מה משותף לעכביש ולנמלה?",
        options: ["שניהם חסרי חוליות", "שניהם יונקים", "שניהם דגים", "שניהם עופות"],
        correctIndex: 0,
        explanation: "עכבישים ונמלים הם חסרי חוליות - אין להם עמוד שדרה.",
      },
    ],
    medium: [
      {
        question: "מהי גלקסיה?",
        options: ["קבוצה ענקית של כוכבים", "כוכב אחד גדול", "כוכב לכת", "ירח"],
        correctIndex: 0,
        explanation: "גלקסיה היא קבוצה ענקית של מיליארדי כוכבים, גזים ואבק הנמצאים יחד בחלל.",
      },
      {
        question: "מה קורה בתגובה כימית?",
        options: ["נוצרים חומרים חדשים", "חומרים נעלמים", "הכל נשאר אותו דבר", "חומרים גדלים"],
        correctIndex: 0,
        explanation: "בתגובה כימית, חומרים משנים את הקשרים ביניהם ונוצרים חומרים חדשים.",
      },
      {
        question: "למה יש לנו עונות שנה?",
        options: ["בגלל נטיית ציר כדור הארץ", "בגלל המרחק מהשמש", "בגלל הירח", "בגלל העננים"],
        correctIndex: 0,
        explanation: "העונות נגרמות כי ציר כדור הארץ נטוי, אז חלקים שונים מקבלים יותר שמש בזמנים שונים.",
      },
      {
        question: "מה זה אקולוגיה?",
        options: ["מדע הקשר בין יצורים לסביבה", "מדע הכוכבים", "מדע החשמל", "מדע המחשבים"],
        correctIndex: 0,
        explanation: "אקולוגיה חוקרת את הקשרים בין יצורים חיים לסביבתם.",
      },
      {
        question: "מהו מעגל חשמלי?",
        options: ["מסלול סגור שבו זורם חשמל", "סוג של סוללה", "סוג של נורה", "סוג של חוט"],
        correctIndex: 0,
        explanation: "מעגל חשמלי הוא מסלול סגור שמאפשר לחשמל לזרום ולהפעיל מכשירים.",
      },
      {
        question: "מה ההבדל בין טורף לנטרף?",
        options: ["טורף צד, נטרף נצוד", "אין הבדל", "נטרף גדול יותר", "טורף אוכל צמחים"],
        correctIndex: 0,
        explanation: "טורף הוא חיה שצדה וטורפת חיות אחרות, נטרף הוא חיה שנצודת.",
      },
    ],
    hard: [
      {
        question: "מהו DNA?",
        options: ["חומצת גרעין שנושאת מידע תורשתי", "סוג של חלבון", "סוג של סוכר", "סוג של שומן"],
        correctIndex: 0,
        explanation: "DNA הוא המולקולה שמכילה את כל המידע הגנטי שלנו - ההוראות לבניית הגוף.",
      },
      {
        question: "מה זה חור שחור?",
        options: ["אזור בחלל עם כבידה חזקה מאוד", "חור בכדור הארץ", "סוג של כוכב", "סוג של גלקסיה"],
        correctIndex: 0,
        explanation: "חור שחור הוא אזור בחלל עם כבידה כל כך חזקה שאפילו אור לא יכול לברוח ממנו.",
      },
      {
        question: "מהו pH?",
        options: ["מדד לחומציות או בסיסיות", "מדד לטמפרטורה", "מדד למשקל", "מדד לאורך"],
        correctIndex: 0,
        explanation: "pH הוא סקלה שמודדת כמה חומר הוא חומצי (pH נמוך) או בסיסי (pH גבוה).",
      },
      {
        question: "מה תפקיד תאי הדם האדומים?",
        options: ["להעביר חמצן", "להילחם במחלות", "לקרוש את הדם", "לעכל אוכל"],
        correctIndex: 0,
        explanation: "תאי דם אדומים מכילים המוגלובין שנושא חמצן מהריאות לכל הגוף.",
      },
      {
        question: "מהי התאדות?",
        options: ["מעבר מנוזל לגז", "מעבר מגז לנוזל", "מעבר ממוצק לנוזל", "מעבר מנוזל למוצק"],
        correctIndex: 0,
        explanation: "התאדות היא תהליך שבו נוזל הופך לגז, כמו כשמים מתאדים לאוויר.",
      },
      {
        question: "למה אנחנו מזיעים?",
        options: ["כדי לקרר את הגוף", "כדי לחמם את הגוף", "כדי לנקות את הגוף", "כדי לגדול"],
        correctIndex: 0,
        explanation: "זיעה מתאדה מהעור ומקררת אותנו כשחם מדי.",
      },
    ],
  },

  // Grade ה (5th grade) - Advanced science
  ה: {
    easy: [
      {
        question: "מהו אטום?",
        options: ["היחידה הקטנה ביותר של יסוד", "היחידה הגדולה ביותר", "סוג של מולקולה", "סוג של תא"],
        correctIndex: 0,
        explanation: "אטום הוא החלקיק הקטן ביותר של יסוד כימי ששומר על תכונותיו.",
      },
      {
        question: "מה ההבדל בין אנרגיה קינטית לפוטנציאלית?",
        options: ["קינטית היא אנרגיית תנועה, פוטנציאלית מאוחסנת", "אין הבדל", "פוטנציאלית היא תנועה", "קינטית מאוחסנת"],
        correctIndex: 0,
        explanation: "אנרגיה קינטית היא של גוף בתנועה, פוטנציאלית היא אנרגיה מאוחסנת (כמו בקפיץ דחוס).",
      },
      {
        question: "מהו הלווין הטבעי של כדור הארץ?",
        options: ["הירח", "השמש", "מאדים", "צדק"],
        correctIndex: 0,
        explanation: "הירח הוא הלווין הטבעי היחיד של כדור הארץ וסובב סביבנו.",
      },
      {
        question: "מה משותף לכל היסודות בטבלה המחזורית?",
        options: ["כולם עשויים מאטומים", "כולם נוזלים", "כולם מתכות", "כולם גזים"],
        correctIndex: 0,
        explanation: "כל יסוד בטבלה המחזורית מורכב מאטומים עם מספר מסוים של פרוטונים.",
      },
      {
        question: "מהי שרשרת מזון?",
        options: ["סדר של מי אוכל את מי בטבע", "סוג של אוכל", "רשימת קניות", "תפריט מסעדה"],
        correctIndex: 0,
        explanation: "שרשרת מזון מראה את הקשר בין יצורים - מי אוכל את מי, מצמחים ועד טורפים.",
      },
      {
        question: "מה זה וירוס?",
        options: ["חלקיק שצריך תא כדי להתרבות", "יצור חי עצמאי", "סוג של חיידק", "סוג של תא"],
        correctIndex: 0,
        explanation: "וירוס הוא חלקיק זעיר שחייב להיכנס לתא חי כדי להעתיק את עצמו.",
      },
    ],
    medium: [
      {
        question: "מה קורה בתהליך הנשימה התאית?",
        options: ["התא מפרק סוכר לאנרגיה", "התא גדל", "התא מתחלק", "התא מת"],
        correctIndex: 0,
        explanation: "בנשימה תאית, התא משתמש בחמצן כדי לפרק סוכר ולשחרר אנרגיה.",
      },
      {
        question: "מהם חוקי ניוטון?",
        options: ["חוקים שמתארים תנועה וכוחות", "חוקים על אור", "חוקים על חשמל", "חוקים על חום"],
        correctIndex: 0,
        explanation: "שלושת חוקי ניוטון מתארים איך גופים נעים ואיך כוחות משפיעים עליהם.",
      },
      {
        question: "מהו אפקט החממה?",
        options: ["גזים שעוצרים חום באטמוספירה", "חממה לגידול צמחים", "סוג של מזג אוויר", "סוג של ענן"],
        correctIndex: 0,
        explanation: "אפקט החממה הוא כשגזים באטמוספירה עוצרים חום ומחממים את כדור הארץ.",
      },
      {
        question: "מה תפקיד המיטוכונדריה בתא?",
        options: ["לייצר אנרגיה", "לאחסן מידע גנטי", "לייצר חלבונים", "לעכל אוכל"],
        correctIndex: 0,
        explanation: "המיטוכונדריה היא 'תחנת הכוח' של התא - מייצרת אנרגיה מסוכר.",
      },
      {
        question: "מהו קרום התא?",
        options: ["השכבה החיצונית שמגינה על התא", "גרעין התא", "החומר בתוך התא", "האיבר שמייצר אנרגיה"],
        correctIndex: 0,
        explanation: "קרום התא הוא שכבה דקה שעוטפת את התא, שולטת מה נכנס ויוצא ממנו.",
      },
      {
        question: "מה ההבדל בין מוליך לבידוד?",
        options: ["מוליך מעביר חשמל, בידוד לא", "אין הבדל", "בידוד מעביר חשמל יותר טוב", "מוליך חוסם חשמל"],
        correctIndex: 0,
        explanation: "מוליך (כמו מתכת) מאפשר לחשמל לזרום, בידוד (כמו גומי) חוסם חשמל.",
      },
    ],
    hard: [
      {
        question: "מהי תורת היחסות של איינשטיין?",
        options: ["תורה על זמן, מרחב ואנרגיה", "תורה על חשמל", "תורה על חיידקים", "תורה על צמחים"],
        correctIndex: 0,
        explanation: "תורת היחסות מסבירה שזמן ומרחב קשורים, ושאנרגיה ומסה שוות (E=mc²).",
      },
      {
        question: "מהו שינוי אקלים?",
        options: ["שינוי ארוך טווח בדפוסי מזג האוויר", "שינוי מזג אוויר יומי", "סוג של סופה", "סוג של גשם"],
        correctIndex: 0,
        explanation: "שינוי אקלים הוא שינוי משמעותי וארוך טווח בטמפרטורות ובדפוסי מזג האוויר הגלובליים.",
      },
      {
        question: "מהי הנדסה גנטית?",
        options: ["שינוי מכוון של גנים", "לימוד גנטיקה", "צילום גנים", "ספירת גנים"],
        correctIndex: 0,
        explanation: "הנדסה גנטית היא שינוי מכוון של הDNA של יצור חי לשיפור תכונות.",
      },
      {
        question: "מה ההבדל בין היתוך גרעיני לביקוע גרעיני?",
        options: ["היתוך מאחד גרעינים, ביקוע מפצל", "אין הבדל", "ביקוע מאחד", "היתוך מפצל"],
        correctIndex: 0,
        explanation: "היתוך מאחד גרעינים קלים (כמו בשמש), ביקוע מפצל גרעינים כבדים (כמו באורניום).",
      },
      {
        question: "מהו ספקטרום אלקטרומגנטי?",
        options: ["טווח כל סוגי הקרינה", "סוג של אור", "סוג של צליל", "סוג של חום"],
        correctIndex: 0,
        explanation: "הספקטרום האלקטרומגנטי כולל את כל סוגי הקרינה: גלי רדיו, אור נראה, קרני X ועוד.",
      },
      {
        question: "מהו עיקרון אי-הוודאות של הייזנברג?",
        options: ["לא ניתן לדעת בדיוק גם מיקום וגם מהירות של חלקיק", "הכל ודאי בפיזיקה", "חלקיקים לא זזים", "הכל ניתן למדידה"],
        correctIndex: 0,
        explanation: "בפיזיקה קוונטית, ככל שיודעים יותר על מיקום חלקיק, יודעים פחות על מהירותו.",
      },
    ],
  },

  // Grade ו (6th grade) - Complex science
  ו: {
    easy: [
      {
        question: "מהו הטבלה המחזורית?",
        options: ["סידור של כל היסודות הכימיים", "רשימת חיות", "רשימת צמחים", "רשימת כוכבים"],
        correctIndex: 0,
        explanation: "הטבלה המחזורית מסדרת את כל 118 היסודות הכימיים לפי תכונותיהם.",
      },
      {
        question: "מה מדד ריכטר?",
        options: ["סקלה למדידת עוצמת רעידות אדמה", "סקלה לטמפרטורה", "סקלה למשקל", "סקלה לאורך"],
        correctIndex: 0,
        explanation: "סקלת ריכטר מודדת את עוצמת רעידות אדמה, כל מספר גדול פי 10 מהקודם.",
      },
      {
        question: "מהי התפתחות אמבריונית?",
        options: ["התפתחות העובר לפני הלידה", "גדילה אחרי לידה", "לימוד", "אימון גופני"],
        correctIndex: 0,
        explanation: "התפתחות אמבריונית היא התהליך שבו עובר מתפתח מתא מופרה ליצור שלם.",
      },
      {
        question: "מהו מערך אקולוגי?",
        options: ["יצורים חיים וסביבתם הפיזית יחד", "גן חיות", "יער בלבד", "מדבר בלבד"],
        correctIndex: 0,
        explanation: "מערכת אקולוגית כוללת את כל היצורים החיים באזור יחד עם סביבתם הלא-חיה.",
      },
      {
        question: "מהי אבולוציה?",
        options: ["שינוי הדרגתי של מינים לאורך זמן", "גדילה של פרט", "לימוד", "התנהגות"],
        correctIndex: 0,
        explanation: "אבולוציה היא התהליך שבו מינים משתנים לאורך דורות רבים דרך ברירה טבעית.",
      },
      {
        question: "מהי אנרגיה מתחדשת?",
        options: ["אנרגיה ממקורות שלא נגמרים", "אנרגיה מנפט", "אנרגיה מפחם", "אנרגיה מגז"],
        correctIndex: 0,
        explanation: "אנרגיה מתחדשת מגיעה ממקורות כמו שמש, רוח ומים שלא נגמרים.",
      },
    ],
    medium: [
      {
        question: "מהי תורת הביג בנג?",
        options: ["התיאוריה על יצירת היקום", "תיאוריה על הירח", "תיאוריה על הים", "תיאוריה על האדמה"],
        correctIndex: 0,
        explanation: "תורת הביג בנג אומרת שהיקום התחיל מנקודה אחת צפופה מאוד לפני כ-13.8 מיליארד שנה.",
      },
      {
        question: "מהו קטליזטור?",
        options: ["חומר שמזרז תגובה כימית", "חומר שמאט תגובה", "חומר שעוצר תגובה", "חומר שמפעיל מכונה"],
        correctIndex: 0,
        explanation: "קטליזטור מזרז תגובות כימיות מבלי להשתנות בעצמו בסוף התגובה.",
      },
      {
        question: "מהו גן?",
        options: ["קטע DNA שמקודד לתכונה", "סוג של תא", "סוג של איבר", "סוג של רקמה"],
        correctIndex: 0,
        explanation: "גן הוא קטע של DNA שמכיל הוראות ליצירת חלבון מסוים או תכונה.",
      },
      {
        question: "מה ההבדל בין חומצה לבסיס?",
        options: ["חומצה נותנת H+, בסיס מקבל", "אין הבדל", "בסיס נותן H+", "שניהם אותו דבר"],
        correctIndex: 0,
        explanation: "חומצות משחררות יוני מימן (H+), בסיסים מקבלים אותם או משחררים OH-.",
      },
      {
        question: "מהו אלקטרון?",
        options: ["חלקיק שלילי שמקיף את גרעין האטום", "חלקיק בגרעין", "סוג של אטום", "סוג של מולקולה"],
        correctIndex: 0,
        explanation: "אלקטרון הוא חלקיק עם מטען שלילי שנע סביב גרעין האטום.",
      },
      {
        question: "מהי ברירה טבעית?",
        options: ["תהליך שבו היצורים המותאמים ביותר שורדים", "בחירה אקראית", "בחירה של בני אדם", "בחירה של מדענים"],
        correctIndex: 0,
        explanation: "ברירה טבעית היא תהליך שבו יצורים עם תכונות מועילות שורדים ומתרבים יותר.",
      },
    ],
    hard: [
      {
        question: "מהי מכניקת הקוונטים?",
        options: ["פיזיקה של חלקיקים תת-אטומיים", "פיזיקה של גופים גדולים", "פיזיקה של נוזלים", "פיזיקה של גזים"],
        correctIndex: 0,
        explanation: "מכניקת הקוונטים מתארת התנהגות של חלקיקים זעירים כמו אלקטרונים ופוטונים.",
      },
      {
        question: "מהי תאוצה?",
        options: ["קצב שינוי המהירות", "מהירות קבועה", "מרחק", "זמן"],
        correctIndex: 0,
        explanation: "תאוצה מודדת כמה מהר המהירות משתנה - עלייה או ירידה במהירות.",
      },
      {
        question: "מהו RNA?",
        options: ["מולקולה שמעתיקה ומתרגמת מידע מDNA", "סוג של DNA", "סוג של חלבון", "סוג של סוכר"],
        correctIndex: 0,
        explanation: "RNA מעתיק מידע מה-DNA ועוזר לתרגם אותו לחלבונים בתא.",
      },
      {
        question: "מהו חוק שימור האנרגיה?",
        options: ["אנרגיה לא נוצרת ולא נעלמת, רק משתנה", "אנרגיה נוצרת מאין", "אנרגיה נעלמת", "אנרגיה תמיד גדלה"],
        correctIndex: 0,
        explanation: "חוק שימור האנרגיה אומר שאנרגיה לא נברא ולא נשמד, רק עובר מצורה לצורה.",
      },
      {
        question: "מהי סופרנובה?",
        options: ["התפוצצות של כוכב מסיבי", "לידה של כוכב", "ירח גדול", "כוכב לכת"],
        correctIndex: 0,
        explanation: "סופרנובה היא התפוצצות עצומה של כוכב בסוף חייו, משחררת אנרגיה אדירה.",
      },
      {
        question: "מהי הנדסת רקמות?",
        options: ["גידול רקמות ואיברים במעבדה", "ציור של רקמות", "לימוד רקמות", "צילום רקמות"],
        correctIndex: 0,
        explanation: "הנדסת רקמות משתמשת בתאים וחומרים ביולוגיים לגדל רקמות ואיברים להשתלה.",
      },
    ],
  },
};

async function checkExistingContent(): Promise<number> {
  const q = query(
    collection(db, "gameContent"),
    where("gameType", "==", "quiz")
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

async function seedQuizContent() {
  console.log("🎯 Starting Quiz content seeding...\n");

  // Check for existing content
  const existingCount = await checkExistingContent();
  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing Quiz items in database.`);
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
      const questions = QUIZ_CONTENT[grade][difficulty];

      console.log(`📝 Adding ${questions.length} questions for grade ${grade}, ${difficulty}...`);

      for (const questionData of questions) {
        try {
          await addDoc(collection(db, "gameContent"), {
            gameType: "quiz",
            grade,
            difficulty,
            question: questionData.question,
            options: questionData.options,
            correctIndex: questionData.correctIndex,
            explanation: questionData.explanation,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          totalAdded++;
        } catch (error) {
          console.error(`   ❌ Failed to add question:`, error);
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
      QUIZ_CONTENT[grade].easy.length +
      QUIZ_CONTENT[grade].medium.length +
      QUIZ_CONTENT[grade].hard.length;
    console.log(`   Grade ${grade}: ${gradeTotal} questions`);
  }
}

// Run the seed
seedQuizContent()
  .then(() => {
    console.log("\n👋 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });

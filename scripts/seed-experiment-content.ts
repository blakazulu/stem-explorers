/**
 * Seed script for Virtual Lab (Experiment) game content
 * Run with: npx tsx scripts/seed-experiment-content.ts
 *
 * Creates Hebrew science experiment simulations for all grades (א-ו) and difficulties
 * 2 experiments per grade/difficulty = 36 total
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

interface ExperimentStep {
  instruction: string;
  imageUrl?: string;
}

interface ExperimentContentData {
  title: string;
  hypothesisPrompt: string;
  steps: ExperimentStep[];
  conclusion: string;
}

// =============================================================================
// EXPERIMENT CONTENT DATA
// Organized by grade, then difficulty
// =============================================================================

const EXPERIMENT_DATA: Record<Grade, Record<Difficulty, ExperimentContentData[]>> = {
  // Grade א (1st) - Very simple observations
  א: {
    easy: [
      {
        title: "צף או שוקע?",
        hypothesisPrompt: "מה לדעתך יקרה כשנשים תפוח במים - הוא יצוף או ישקע?",
        steps: [
          { instruction: "מלאו קערה גדולה במים" },
          { instruction: "קחו תפוח והביטו בו - האם הוא קל או כבד?" },
          { instruction: "שימו את התפוח בעדינות על פני המים" },
          { instruction: "התבוננו - מה קרה לתפוח?" },
        ],
        conclusion: "התפוח צף! למרות שהוא נראה כבד, בתוכו יש הרבה אוויר שעוזר לו לצוף על פני המים.",
      },
      {
        title: "מגנט קסום",
        hypothesisPrompt: "האם מגנט ימשוך מטבע? מה אתם חושבים?",
        steps: [
          { instruction: "קחו מגנט ומטבע" },
          { instruction: "קרבו את המגנט לאט אל המטבע" },
          { instruction: "מה קורה כשהם נוגעים?" },
          { instruction: "נסו עם חפצים נוספים - מה עובד ומה לא?" },
        ],
        conclusion: "מגנטים מושכים רק חפצים מברזל או מתכות מסוימות. לא כל דבר מתכתי נמשך למגנט!",
      },
    ],
    medium: [
      {
        title: "גלגל הצבעים",
        hypothesisPrompt: "מה יקרה אם נערבב צבע צהוב וכחול?",
        steps: [
          { instruction: "שימו כתם צבע צהוב על צלחת" },
          { instruction: "שימו כתם צבע כחול ליד הצהוב" },
          { instruction: "ערבבו את שני הצבעים יחד במכחול" },
          { instruction: "איזה צבע חדש נוצר?" },
        ],
        conclusion: "כשמערבבים צהוב וכחול מקבלים ירוק! אלו צבעי יסוד שיוצרים צבעים חדשים.",
      },
      {
        title: "זרעים מתעוררים",
        hypothesisPrompt: "מה צריך זרע כדי לצמוח - אור, מים, או שניהם?",
        steps: [
          { instruction: "קחו 3 כוסות עם צמר גפן וזרעי שעועית" },
          { instruction: "כוס 1: מים + אור. כוס 2: מים + חושך. כוס 3: בלי מים + אור" },
          { instruction: "חכו 5 ימים ובדקו כל יום" },
          { instruction: "באיזו כוס הזרעים צמחו?" },
        ],
        conclusion: "זרעים צריכים מים כדי לנבוט! הם יכולים להתחיל לצמוח גם בחושך, אבל אחר כך יצטרכו אור.",
      },
    ],
    hard: [
      {
        title: "קרח נעלם",
        hypothesisPrompt: "היכן קרח יימס מהר יותר - בשמש או בצל?",
        steps: [
          { instruction: "הכינו שני קוביות קרח באותו גודל" },
          { instruction: "שימו אחת בשמש ואחת בצל" },
          { instruction: "בדקו כל 5 דקות - מה קורה?" },
          { instruction: "מדדו כמה זמן לקח לכל אחת להיעלם" },
        ],
        conclusion: "קרח נמס מהר יותר בשמש כי חום מהשמש מחמם אותו. חום גורם לקרח להפוך למים.",
      },
      {
        title: "צלילים סביבנו",
        hypothesisPrompt: "האם נשמע צליל טוב יותר דרך אוויר או דרך שולחן?",
        steps: [
          { instruction: "בקשו מחבר להקיש על שולחן בעדינות" },
          { instruction: "הקשיבו לצליל כשאתם עומדים" },
          { instruction: "עכשיו שימו אוזן על השולחן והקשיבו שוב" },
          { instruction: "מתי הצליל היה חזק יותר?" },
        ],
        conclusion: "הצליל חזק יותר דרך השולחן! מוצקים מעבירים צליל טוב יותר מאוויר.",
      },
    ],
  },

  // Grade ב (2nd) - Simple experiments
  ב: {
    easy: [
      {
        title: "בועות סבון",
        hypothesisPrompt: "איזו צורה תהיה לבועת סבון שננפח?",
        steps: [
          { instruction: "הכינו תמיסת סבון עם מים" },
          { instruction: "טבלו קש בתמיסה" },
          { instruction: "נפחו בעדינות דרך הקש" },
          { instruction: "התבוננו בצורת הבועה" },
        ],
        conclusion: "בועות סבון תמיד עגולות! הכדור הוא הצורה שמחזיקה הכי הרבה אוויר עם הכי פחות משטח.",
      },
      {
        title: "חום וקור",
        hypothesisPrompt: "מה ירגישו הידיים אם נשים אחת במים חמים ואחת בקרים?",
        steps: [
          { instruction: "הכינו קערה עם מים חמימים וקערה עם מים קרים" },
          { instruction: "שימו יד אחת במים החמים ואחת בקרים" },
          { instruction: "אחרי דקה, שימו שתי הידיים במים פושרים" },
          { instruction: "מה כל יד מרגישה?" },
        ],
        conclusion: "היד שהייתה בחם מרגישה שהמים קרים, והיד שהייתה בקור מרגישה שהם חמים! הגוף שלנו משווה לפי מה שהיה קודם.",
      },
    ],
    medium: [
      {
        title: "צמח צמא",
        hypothesisPrompt: "לאן המים מגיעים כשמשקים צמח?",
        steps: [
          { instruction: "קחו גבעול סלרי לבן וכוס מים עם צבע מאכל" },
          { instruction: "שימו את הסלרי במים הצבעוניים" },
          { instruction: "חכו כמה שעות" },
          { instruction: "חתכו את הסלרי וראו מה בפנים" },
        ],
        conclusion: "המים הצבעוניים עלו בתוך הסלרי! צמחים שותים מים דרך צינורות קטנים בגבעול.",
      },
      {
        title: "אוויר תופס מקום",
        hypothesisPrompt: "האם נוכל להכניס נייר יבש לתוך מים בלי שיירטב?",
        steps: [
          { instruction: "קמטו נייר ודחפו אותו לתחתית כוס" },
          { instruction: "הפכו את הכוס הפוכה לתוך קערת מים" },
          { instruction: "שימו לב - הכוס הפוכה ישרה!" },
          { instruction: "הוציאו את הכוס ובדקו את הנייר" },
        ],
        conclusion: "הנייר נשאר יבש! האוויר שבכוס תפס מקום ולא נתן למים להיכנס.",
      },
    ],
    hard: [
      {
        title: "מים מטפסים",
        hypothesisPrompt: "האם מים יכולים לטפס נגד כוח הכבידה?",
        steps: [
          { instruction: "קחו שתי כוסות ומגבת נייר" },
          { instruction: "מלאו כוס אחת במים צבעוניים" },
          { instruction: "חברו את הכוסות עם מגבת הנייר" },
          { instruction: "חכו שעה וראו מה קורה" },
        ],
        conclusion: "המים טיפסו על המגבת והגיעו לכוס השנייה! זה נקרא נימיות - המים נמשכים בתוך חורים קטנים.",
      },
      {
        title: "צל משתנה",
        hypothesisPrompt: "האם הצל שלנו תמיד באותו גודל?",
        steps: [
          { instruction: "בבוקר, עמדו בחוץ וסמנו את הצל שלכם" },
          { instruction: "בצהריים, עמדו באותו מקום וסמנו שוב" },
          { instruction: "אחר הצהריים, סמנו פעם שלישית" },
          { instruction: "השוו את שלושת הצללים" },
        ],
        conclusion: "הצל משתנה! בבוקר ואחה\"צ הוא ארוך, ובצהריים קצר. זה כי השמש נמצאת במקומות שונים בשמיים.",
      },
    ],
  },

  // Grade ג (3rd) - Basic science
  ג: {
    easy: [
      {
        title: "מעגל המים",
        hypothesisPrompt: "לאן נעלמת המים מהשלולית אחרי הגשם?",
        steps: [
          { instruction: "מלאו צלחת במים ושימו בשמש" },
          { instruction: "סמנו את גובה המים" },
          { instruction: "בדקו כל כמה שעות" },
          { instruction: "לאן נעלמו המים?" },
        ],
        conclusion: "המים התאדו! החום הפך אותם לאדים בלתי נראים שעלו לאוויר. משם הם יהפכו לעננים וגשם.",
      },
      {
        title: "מוליך או לא?",
        hypothesisPrompt: "האם כל החומרים מוליכים חשמל?",
        steps: [
          { instruction: "הכינו מעגל חשמלי פשוט עם סוללה ונורה" },
          { instruction: "נתקו חוט אחד והשאירו פער" },
          { instruction: "שימו חפצים שונים בפער: מפתח, גומי, מטבע, עץ" },
          { instruction: "מתי הנורה נדלקת?" },
        ],
        conclusion: "רק מתכות הדליקו את הנורה! הן מוליכות חשמל. גומי, עץ ופלסטיק לא מוליכים.",
      },
    ],
    medium: [
      {
        title: "וולקנו תוסס",
        hypothesisPrompt: "מה יקרה אם נערבב חומץ וסודה לשתייה?",
        steps: [
          { instruction: "בנו הר קטן מפלסטלינה עם חור באמצע" },
          { instruction: "שימו כפית סודה לשתייה בחור" },
          { instruction: "הוסיפו צבע מאכל אדום" },
          { instruction: "שפכו חומץ לאט לאט" },
        ],
        conclusion: "התערובת תססה והקצף! כשחומץ פוגש סודה נוצר גז פחמן דו-חמצני שיוצר הרבה בועות.",
      },
      {
        title: "מצב צבירה",
        hypothesisPrompt: "האם קרח, מים וקיטור זה אותו דבר?",
        steps: [
          { instruction: "שימו קוביית קרח בסיר קטן" },
          { instruction: "חממו על אש קטנה (בעזרת מבוגר)" },
          { instruction: "צפו בקרח הופך למים" },
          { instruction: "המשיכו לחמם עד שתראו קיטור" },
        ],
        conclusion: "כולם מים! קרח זה מים מוצקים, מים נוזליים, וקיטור זה מים בגז. החום משנה את מצב הצבירה.",
      },
    ],
    hard: [
      {
        title: "כוח החיכוך",
        hypothesisPrompt: "על איזה משטח מכונית צעצוע תיסע רחוק יותר?",
        steps: [
          { instruction: "בנו מדרון משולחן ספרים" },
          { instruction: "שחררו מכונית על שטיח, עץ, וקרטון" },
          { instruction: "מדדו כמה רחוק היא נסעה בכל משטח" },
          { instruction: "השוו את התוצאות" },
        ],
        conclusion: "על משטח חלק המכונית נסעה יותר רחוק! חיכוך מאט תנועה. משטחים מחוספסים יוצרים יותר חיכוך.",
      },
      {
        title: "צפיפות נוזלים",
        hypothesisPrompt: "האם כל הנוזלים מתערבבים?",
        steps: [
          { instruction: "קחו כוס שקופה גבוהה" },
          { instruction: "שפכו לאט: דבש, מים, שמן" },
          { instruction: "חכו דקה שהכל יירגע" },
          { instruction: "מה אתם רואים?" },
        ],
        conclusion: "הנוזלים נשארו בשכבות! לכל נוזל צפיפות שונה. הכבד יותר שוקע והקל צף.",
      },
    ],
  },

  // Grade ד (4th) - Intermediate experiments
  ד: {
    easy: [
      {
        title: "לחץ אוויר",
        hypothesisPrompt: "האם אוויר יכול להחזיק מים בכוס הפוכה?",
        steps: [
          { instruction: "מלאו כוס מים עד הסוף" },
          { instruction: "שימו קלף על פי הכוס" },
          { instruction: "לחצו והפכו את הכוס מעל כיור" },
          { instruction: "הורידו את היד בזהירות" },
        ],
        conclusion: "המים נשארו בכוס! לחץ האוויר מבחוץ דוחף את הקלף ומחזיק את המים.",
      },
      {
        title: "התפשטות חום",
        hypothesisPrompt: "איך חום מתפשט במתכת?",
        steps: [
          { instruction: "הדביקו גרגרי חמאה על מוט מתכת במרחקים שווים" },
          { instruction: "חממו קצה אחד של המוט (בעזרת מבוגר)" },
          { instruction: "התבוננו בגרגרי החמאה" },
          { instruction: "באיזה סדר הם נמסים?" },
        ],
        conclusion: "החמאה נמסה מהקצה החם לקר בסדר! חום מתפשט לאט לאט דרך המתכת.",
      },
    ],
    medium: [
      {
        title: "עדשות ואור",
        hypothesisPrompt: "מה עדשה מגדלת עושה לקרני אור?",
        steps: [
          { instruction: "קחו זכוכית מגדלת ונייר לבן" },
          { instruction: "בחוץ בשמש, כוונו את הזכוכית מעל הנייר" },
          { instruction: "הרימו והורידו עד שתראו נקודה קטנה וחזקה" },
          { instruction: "מה קורה לאור?" },
        ],
        conclusion: "העדשה מרכזת את קרני האור לנקודה אחת! לכן הנקודה כל כך חמה ובהירה.",
      },
      {
        title: "מנועי גומי",
        hypothesisPrompt: "איך גומייה מאוחסנת אנרגיה?",
        steps: [
          { instruction: "בנו מכונית מגליל קרטון וגומייה" },
          { instruction: "סובבו את הגלגל האחורי פעמים רבות" },
          { instruction: "שחררו את המכונית על משטח חלק" },
          { instruction: "מה גרם למכונית לנוע?" },
        ],
        conclusion: "הגומייה אגרה אנרגיה פוטנציאלית כשסיבבנו. כששחררנו, האנרגיה הפכה לתנועה!",
      },
    ],
    hard: [
      {
        title: "אלקטרוליזה",
        hypothesisPrompt: "האם אפשר לפרק מים לגזים?",
        steps: [
          { instruction: "מלאו כוס מים עם מעט מלח" },
          { instruction: "חברו שני עפרונות לסוללת 9V" },
          { instruction: "טבלו את העפרונות במים (בעזרת מבוגר)" },
          { instruction: "מה אתם רואים על העפרונות?" },
        ],
        conclusion: "בועות! החשמל פירק את המים למימן וחמצן. זה נקרא אלקטרוליזה.",
      },
      {
        title: "השתקפות ושבירה",
        hypothesisPrompt: "למה עיפרון במים נראה שבור?",
        steps: [
          { instruction: "מלאו כוס שקופה במים" },
          { instruction: "שימו עיפרון בזווית בתוך המים" },
          { instruction: "הסתכלו מהצד" },
          { instruction: "למה העיפרון נראה כפוף?" },
        ],
        conclusion: "האור מאט כשהוא עובר ממים לאוויר ומשנה כיוון. זה נקרא שבירת אור והוא גורם לאשליה.",
      },
    ],
  },

  // Grade ה (5th) - Advanced experiments
  ה: {
    easy: [
      {
        title: "pH והצבעים",
        hypothesisPrompt: "איך נדע אם נוזל חומצי או בסיסי?",
        steps: [
          { instruction: "הכינו מיץ כרוב סגול (בעזרת מבוגר)" },
          { instruction: "מזגו לכמה כוסות קטנות" },
          { instruction: "הוסיפו לכל כוס: מיץ לימון, סודה, חומץ, סבון" },
          { instruction: "איזה צבעים קיבלתם?" },
        ],
        conclusion: "מיץ כרוב משנה צבע! אדום = חומצי, סגול = ניטרלי, ירוק/צהוב = בסיסי. זה אינדיקטור טבעי.",
      },
      {
        title: "מטוטלת",
        hypothesisPrompt: "מה משפיע על מהירות תנודת מטוטלת?",
        steps: [
          { instruction: "קשרו משקל לחוט ותלו מקצה" },
          { instruction: "שנו את אורך החוט וספרו תנודות ב-30 שניות" },
          { instruction: "עכשיו שנו את המשקל עם אותו אורך" },
          { instruction: "מה השפיע יותר על המהירות?" },
        ],
        conclusion: "רק אורך החוט משפיע! חוט קצר יותר = תנודות מהירות יותר. המשקל לא משנה.",
      },
    ],
    medium: [
      {
        title: "מעגל חשמלי טורי ומקבילי",
        hypothesisPrompt: "למה כדאי לחבר נורות במקביל ולא בטור?",
        steps: [
          { instruction: "בנו מעגל עם 2 נורות בטור (אחת אחרי השנייה)" },
          { instruction: "הבחינו בעוצמת האור" },
          { instruction: "עכשיו חברו את הנורות במקביל" },
          { instruction: "מה ההבדל בעוצמה? ומה קורה אם מנתקים אחת?" },
        ],
        conclusion: "במקביל הנורות יותר בהירות וכל אחת עצמאית! בטור - אם אחת נשרפת, שתיהן נכבות.",
      },
      {
        title: "כוח הארכימדס",
        hypothesisPrompt: "למה עצמים קלים יותר במים?",
        steps: [
          { instruction: "שקלו אבן באוויר עם קפיץ" },
          { instruction: "טבלו את האבן במים ושקלו שוב" },
          { instruction: "חשבו את ההפרש במשקל" },
          { instruction: "מה דוחף את האבן למעלה?" },
        ],
        conclusion: "המים דוחפים כל עצם למעלה! הדחיפה שווה למשקל המים שהעצם מזיז. זה עקרון ארכימדס.",
      },
    ],
    hard: [
      {
        title: "ספקטרום אור",
        hypothesisPrompt: "מאיפה מגיעים צבעי הקשת?",
        steps: [
          { instruction: "מלאו כוס מים ושימו בשמש חזקה על נייר לבן" },
          { instruction: "סובבו את הכוס עד שתראו צבעים על הנייר" },
          { instruction: "ספרו את הצבעים ורשמו" },
          { instruction: "באיזה סדר הצבעים מופיעים?" },
        ],
        conclusion: "אור לבן מכיל את כל הצבעים! המים פירקו אותו כמו פריזמה. סדר הצבעים: אדום, כתום, צהוב, ירוק, כחול, סגול.",
      },
      {
        title: "כימיה של חלודה",
        hypothesisPrompt: "מה גורם לברזל להחליד?",
        steps: [
          { instruction: "קחו 3 מסמרי ברזל" },
          { instruction: "שימו אחד במים, אחד במים+מלח, אחד יבש" },
          { instruction: "בדקו כל יום במשך שבוע" },
          { instruction: "איפה הופיעה הכי הרבה חלודה?" },
        ],
        conclusion: "מים+מלח יצרו הכי הרבה חלודה! חלודה נוצרת כשברזל מגיב עם חמצן ומים. מלח מאיץ את התהליך.",
      },
    ],
  },

  // Grade ו (6th) - Complex experiments
  ו: {
    easy: [
      {
        title: "אוסמוזה",
        hypothesisPrompt: "למה תפוח אדמה מצטמק במי מלח?",
        steps: [
          { instruction: "חתכו שני פרוסות תפוח אדמה באותו גודל" },
          { instruction: "שימו אחת במים רגילים ואחת במי מלח מרוכזים" },
          { instruction: "חכו שעה" },
          { instruction: "השוו את הפרוסות" },
        ],
        conclusion: "במי מלח הפרוסה התכווצה! המים יצאו מהתאים אל המלח. זו אוסמוזה - מים עוברים ממקום מרוכז פחות ליותר.",
      },
      {
        title: "חוק ניוטון השלישי",
        hypothesisPrompt: "למה רקטה עפה?",
        steps: [
          { instruction: "נפחו בלון ואל תקשרו" },
          { instruction: "הדביקו קש לבלון ומשחילו על חוט מתוח" },
          { instruction: "שחררו את פי הבלון" },
          { instruction: "לאן הבלון נע ולאן האוויר יוצא?" },
        ],
        conclusion: "הבלון נע הפוך לכיוון האוויר! כל פעולה יוצרת תגובה שווה והפוכה - זה חוק ניוטון השלישי.",
      },
    ],
    medium: [
      {
        title: "DNA בננה",
        hypothesisPrompt: "האם אפשר לראות DNA בעין?",
        steps: [
          { instruction: "מעכו בננה עם מעט מים ומלח" },
          { instruction: "סננו דרך בד והוסיפו נוזל כלים" },
          { instruction: "הוסיפו בעדינות אלכוהול קר בשכבה עליונה" },
          { instruction: "מה אתם רואים בין השכבות?" },
        ],
        conclusion: "החוטים הלבנים זה DNA! המלח והסבון פירקו את התאים, והאלכוהול גרם ל-DNA להתגבש.",
      },
      {
        title: "תגובה אנדותרמית",
        hypothesisPrompt: "האם תגובות כימיות תמיד משחררות חום?",
        steps: [
          { instruction: "שימו 3 כפות מלח אפסום בשקית" },
          { instruction: "הוסיפו 2 כפות מים" },
          { instruction: "ערבבו ומששו את השקית" },
          { instruction: "מה קרה לטמפרטורה?" },
        ],
        conclusion: "השקית התקררה! זו תגובה אנדותרמית שבולעת חום מהסביבה במקום לשחרר.",
      },
    ],
    hard: [
      {
        title: "אפקט החממה",
        hypothesisPrompt: "איך גזי חממה מחממים את כדור הארץ?",
        steps: [
          { instruction: "קחו שני צנצנות שקופות ושני מדחומים" },
          { instruction: "כסו צנצנת אחת בניילון נצמד" },
          { instruction: "שימו את שתיהן בשמש עם המדחומים בפנים" },
          { instruction: "בדקו את הטמפרטורה כל 10 דקות" },
        ],
        conclusion: "הצנצנת המכוסה התחממה יותר! הניילון עצר את החום כמו שגזי חממה עוצרים חום באטמוספרה.",
      },
      {
        title: "תאי אלקטרוכימיים",
        hypothesisPrompt: "האם פירות יכולים לייצר חשמל?",
        steps: [
          { instruction: "תקעו מטבע נחושת ומסמר אבץ בלימון" },
          { instruction: "חברו חוטים למולטימטר" },
          { instruction: "מדדו את המתח (וולט)" },
          { instruction: "נסו עם פירות אחרים" },
        ],
        conclusion: "הלימון מייצר חשמל! החומצה בפרי מאפשרת תגובה בין המתכות השונות שיוצרת זרם חשמלי.",
      },
    ],
  },
};

// =============================================================================
// SEED FUNCTION
// =============================================================================

async function seedExperimentContent() {
  console.log("Starting experiment content seeding...\n");

  const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
  const difficulties: Difficulty[] = ["easy", "medium", "hard"];

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const grade of grades) {
    for (const difficulty of difficulties) {
      const experiments = EXPERIMENT_DATA[grade][difficulty];

      // Check existing content
      const existingQuery = query(
        collection(db, "gameContent"),
        where("gameType", "==", "experiment"),
        where("grade", "==", grade),
        where("difficulty", "==", difficulty)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (existingSnapshot.size >= experiments.length) {
        console.log(`Skipping ${grade}/${difficulty} - already has ${existingSnapshot.size} experiments`);
        totalSkipped += experiments.length;
        continue;
      }

      // Create new experiments
      for (const experimentData of experiments) {
        const doc = {
          gameType: "experiment",
          grade,
          difficulty,
          title: experimentData.title,
          hypothesisPrompt: experimentData.hypothesisPrompt,
          steps: experimentData.steps,
          conclusion: experimentData.conclusion,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await addDoc(collection(db, "gameContent"), doc);
        totalCreated++;
        console.log(`Created: ${grade}/${difficulty} - "${experimentData.title}"`);
      }
    }
  }

  console.log("\n=================================");
  console.log(`Seeding complete!`);
  console.log(`Created: ${totalCreated} experiments`);
  console.log(`Skipped: ${totalSkipped} experiments (already existed)`);
  console.log("=================================");

  process.exit(0);
}

// Run the seed
seedExperimentContent().catch((error) => {
  console.error("Error seeding experiment content:", error);
  process.exit(1);
});

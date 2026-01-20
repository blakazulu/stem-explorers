import { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

/**
 * Core report generation logic - used by both on-demand handler and scheduled function
 */
export async function generateReportContent(
  journals: Array<{ answers: unknown }>,
  questionnaireName: string,
  journalCount: number,
  aiPromptInstructions?: string
): Promise<{ teacherContent: string; parentContent: string }> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const journalSummary = journals
    .map((j, i: number) => `תלמיד ${i + 1}: ${JSON.stringify(j.answers)}`)
    .join("\n");

  const prompt = `
אתה מנתח נתונים חינוכיים. יש לך ${journalCount} תגובות לשאלון "${questionnaireName}".

נתוני התגובות:
${journalSummary}

${aiPromptInstructions || ""}

צור שני דוחות:
1. דוח למורים - מפורט, כולל ניתוח דפוסים, אתגרים, והמלצות פדגוגיות
2. דוח להורים - תמציתי וידידותי, מתמקד בהישגים והתקדמות

החזר בפורמט JSON:
{
  "teacherContent": "תוכן הדוח למורים בעברית (markdown)",
  "parentContent": "תוכן הדוח להורים בעברית (markdown)"
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Find JSON by matching balanced braces
  let depth = 0;
  let startIdx = -1;
  let endIdx = -1;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      if (depth === 0) startIdx = i;
      depth++;
    } else if (text[i] === '}') {
      depth--;
      if (depth === 0 && startIdx !== -1) {
        endIdx = i + 1;
        break;
      }
    }
  }

  if (startIdx === -1 || endIdx === -1) {
    console.error("AI response did not contain JSON:", text);
    throw new Error("Failed to parse AI response - no JSON found");
  }

  const jsonStr = text.slice(startIdx, endIdx);
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    console.error("Invalid JSON in AI response:", jsonStr);
    throw new Error("Failed to parse AI response - invalid JSON");
  }

  if (!parsed.teacherContent || !parsed.parentContent) {
    console.error("Missing required fields in AI response:", parsed);
    throw new Error("AI response missing required fields");
  }

  return {
    teacherContent: parsed.teacherContent,
    parentContent: parsed.parentContent,
  };
}

/**
 * On-demand report generation endpoint
 * Used by the admin settings page for manual report generation
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  // Validate API secret to prevent unauthorized access
  const apiSecret = process.env.REPORT_API_SECRET;
  if (apiSecret && event.headers["x-api-secret"] !== apiSecret) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const { journals, questionnaireName, journalCount, reportConfig } = JSON.parse(
      event.body || "{}"
    );

    if (!journals || journals.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No journals provided" }),
      };
    }

    const { teacherContent, parentContent } = await generateReportContent(
      journals,
      questionnaireName || "שאלון",
      journalCount || journals.length,
      reportConfig?.aiPromptInstructions
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ teacherContent, parentContent }),
    };
  } catch (error) {
    console.error("Report generation error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to generate report",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

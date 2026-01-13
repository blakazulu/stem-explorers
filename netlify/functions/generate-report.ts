import { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { journals, unitName, reportConfig } = JSON.parse(event.body || "{}");

    if (!journals || journals.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No journals provided" }),
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const journalSummary = journals
      .map((j: any, i: number) => `תלמיד ${i + 1}: ${JSON.stringify(j.answers)}`)
      .join("\n");

    const prompt = `
אתה מנתח נתונים חינוכיים. יש לך ${journals.length} יומני חוקר מיחידה "${unitName}".

נתוני היומנים:
${journalSummary}

${reportConfig?.aiPromptInstructions || ""}

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

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const reportData = JSON.parse(jsonMatch[0]);

    return {
      statusCode: 200,
      body: JSON.stringify(reportData),
    };
  } catch (error) {
    console.error("Report generation error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate report" }),
    };
  }
};

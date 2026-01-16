import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getEmailConfig } from "@/lib/services/settings";

interface EquipmentRequestData {
  teacherName: string;
  program: string;
  classes: string;
  ageGroups: string[];
  resources: string[];
}

// Escape HTML to prevent XSS in email content
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Validate request data
function validateData(data: unknown): data is EquipmentRequestData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;

  if (typeof d.teacherName !== "string" || d.teacherName.length === 0 || d.teacherName.length > 100) return false;
  if (typeof d.program !== "string" || d.program.length === 0 || d.program.length > 200) return false;
  if (typeof d.classes !== "string" || d.classes.length === 0 || d.classes.length > 100) return false;
  if (!Array.isArray(d.ageGroups) || d.ageGroups.length === 0 || d.ageGroups.length > 10) return false;
  if (!Array.isArray(d.resources) || d.resources.length === 0 || d.resources.length > 50) return false;

  // Validate array contents are strings
  if (!d.ageGroups.every((g) => typeof g === "string" && g.length <= 50)) return false;
  if (!d.resources.every((r) => typeof r === "string" && r.length <= 100)) return false;

  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Check for API key configuration
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const rawData = await request.json();

    // Validate input data
    if (!validateData(rawData)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const data = rawData;

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get admin emails from settings
    const emailConfig = await getEmailConfig();
    if (!emailConfig || emailConfig.adminEmails.length === 0) {
      return NextResponse.json(
        { error: "No admin emails configured" },
        { status: 400 }
      );
    }

    // Format the email content with escaped user data
    const emailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
          טופס בקשה למשאבי למידה
        </h1>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>שם המורה:</strong> ${escapeHtml(data.teacherName)}</p>
          <p style="margin: 10px 0;"><strong>תוכנית / יחידה:</strong> ${escapeHtml(data.program)}</p>
          <p style="margin: 10px 0;"><strong>כיתה/ות:</strong> ${escapeHtml(data.classes)}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #374151;">שכבת גיל:</h3>
          <ul style="list-style: none; padding: 0;">
            ${data.ageGroups.map((g) => `<li style="margin: 5px 0;">✓ ${escapeHtml(g)}</li>`).join("")}
          </ul>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #374151;">משאבים דרושים:</h3>
          <ul style="list-style: none; padding: 0;">
            ${data.resources.map((r) => `<li style="margin: 5px 0;">✓ ${escapeHtml(r)}</li>`).join("")}
          </ul>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #6b7280; font-size: 12px;">
          נשלח מתוך מערכת חוקרי STEM
        </p>
      </div>
    `;

    // Send email to all admin emails
    const { error } = await resend.emails.send({
      from: "חוקרי STEM <noreply@resend.dev>",
      to: emailConfig.adminEmails,
      subject: `בקשה למשאבי למידה - ${escapeHtml(data.teacherName)}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in send-equipment-request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

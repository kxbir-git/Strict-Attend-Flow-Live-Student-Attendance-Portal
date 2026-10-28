import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { aiAssistantSchema } from "@/lib/validations";
import { calculateAttendanceMetrics } from "@/lib/buffer";

// Rate limiting in-memory store: studentId -> { date: string, count: number }
const queryLimitMap = new Map<string, { date: string; count: number }>();

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["STUDENT"]);
    if (auth.errorResponse) return auth.errorResponse;

    const studentId = auth.session!.user.studentId;
    if (!studentId) {
      return NextResponse.json({ success: false, error: "Student profile not found" }, { status: 404 });
    }

    // Rate Limit: 20 queries/day/student
    const today = new Date().toISOString().split("T")[0];
    const userLimit = queryLimitMap.get(studentId) || { date: today, count: 0 };
    if (userLimit.date !== today) {
      userLimit.date = today;
      userLimit.count = 0;
    }

    if (userLimit.count >= 20) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate Limit Exceeded",
          message: "You have reached your daily quota of 20 AI queries. Your quota resets at midnight.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = aiAssistantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    userLimit.count += 1;
    queryLimitMap.set(studentId, userLimit);

    const userMessage = parsed.data.message;

    // Fetch student's real data
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        class: true,
      },
    });

    const records = await prisma.attendanceRecord.findMany({
      where: {
        studentId,
        session: { status: "SUBMITTED" },
      },
      include: {
        session: {
          include: { subject: true },
        },
      },
    });

    const subjects = await prisma.subject.findMany({
      where: { classId: student?.classId },
    });

    // Compute metrics
    const subjectStats = subjects.map((sub) => {
      const subRecords = records.filter((r) => r.session.subjectId === sub.id);
      const attended = subRecords.filter(
        (r) => r.status === "PRESENT" || r.status === "LATE" || r.status === "APPROVED_LEAVE"
      ).length;
      const metrics = calculateAttendanceMetrics(attended, subRecords.length, 75);
      return {
        name: sub.name,
        code: sub.code,
        attended,
        total: subRecords.length,
        percent: metrics.percentage,
        buffer: metrics.bufferAbsences,
        neededToRecover: metrics.classesNeededToRecover,
        isDefaulter: metrics.isDefaulter,
      };
    });

    const totalHeld = records.length;
    const totalAttended = records.filter(
      (r) => r.status === "PRESENT" || r.status === "LATE" || r.status === "APPROVED_LEAVE"
    ).length;
    const overall = calculateAttendanceMetrics(totalAttended, totalHeld, 75);

    const systemPromptContext = `
You are the official AI Academic Attendance Assistant for ${student?.user.name} (Roll No: ${student?.rollNo}, Class: ${student?.class.name}).
Here is the student's real, verified attendance data:
- Overall Attendance: ${overall.percentage}% (${overall.attended}/${overall.total} attended)
- Overall Status: ${overall.isDefaulter ? "DEFAULTER (<75%)" : "SAFE (>=75%)"}
- Overall Buffer Absences: ${overall.bufferAbsences} classes
- Overall Classes Needed to Recover: ${overall.classesNeededToRecover}
- Subject-wise stats:
${subjectStats
        .map(
          (s) =>
            `  * ${s.name} (${s.code}): ${s.percent}% (${s.attended}/${s.total}). Buffer: ${s.buffer} absences. Need to recover: ${s.neededToRecover}. ${s.isDefaulter ? "RISKY" : "SAFE"}`
        )
        .join("\n")}

Rules:
1. Always base your answer strictly on the student's verified data provided above. Never invent fake stats.
2. If the user asks in Hindi/Hinglish (e.g. "Kitni classes miss kar sakta hu?"), reply naturally in friendly Hinglish or English.
3. Be supportive, concise, accurate, and motivating.
4. Never reveal any other student's data.
`;

    let reply = "";

    // If OPENAI_API_KEY is configured, call OpenAI API
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith("mock")) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPromptContext },
              { role: "user", content: userMessage },
            ],
            temperature: 0.3,
            max_tokens: 400,
          }),
        });

        if (response.ok) {
          const aiJson = await response.json();
          reply = aiJson.choices?.[0]?.message?.content?.trim();
        }
      } catch (e) {
        console.error("OpenAI API call failed, falling back to rule-based engine", e);
      }
    }

    // Fallback: Grounded intelligent rule-based academic answering engine
    if (!reply) {
      const lower = userMessage.toLowerCase();

      if (lower.includes("miss") || lower.includes("leave") || lower.includes("chutti") || lower.includes("buffer")) {
        // Find if a specific subject was asked
        const matchedSub = subjectStats.find(
          (s) => lower.includes(s.name.toLowerCase()) || lower.includes(s.code.toLowerCase())
        );

        if (matchedSub) {
          if (matchedSub.buffer > 0) {
            reply = `Aap **${matchedSub.name} (${matchedSub.code})** me **${matchedSub.buffer} classes** miss kar sakte ho aur aapka attendance 75% ke upar hi rahega! (Current: ${matchedSub.percent}%).`;
          } else {
            reply = `⚠️ **${matchedSub.name}** me aapka attendance already **${matchedSub.percent}%** hai. Aap ek bhi class miss nahi kar sakte! 75% par wapas aane ke liye aapko agle **${matchedSub.neededToRecover} lectures** lagatar attend karne honge.`;
          }
        } else {
          reply = `Aapke pass overall **${overall.bufferAbsences} spare absences** bache hain before dropping below 75% (Current overall: ${overall.percentage}%). Subject-wise breakdown:\n` +
            subjectStats.map((s) => `• **${s.name}**: ${s.buffer} miss kar sakte ho (${s.percent}%)`).join("\n");
        }
      } else if (lower.includes("attendance") || lower.includes("kitna") || lower.includes("percentage") || lower.includes("percent")) {
        reply = `Aapka current **Overall Attendance ${overall.percentage}%** hai (${overall.attended}/${overall.total} attended). ${overall.isDefaulter
            ? `⚠️ Aap defaulter category me ho (<75%). 75% reach karne ke liye aapko agle ${overall.classesNeededToRecover} classes lagatar attend karni hongi.`
            : `✅ Safe zone me ho! Aapke pass ${overall.bufferAbsences} classes ka safe buffer hai.`
          }`;
      } else if (lower.includes("risk") || lower.includes("danger") || lower.includes("kam")) {
        const risky = subjectStats.filter((s) => s.isDefaulter);
        if (risky.length === 0) {
          reply = `🎉 Badhiya khabar! Aapka koi bhi subject risky (<75%) nahi hai. Sabhi subjects me attendance safe zone me hai!`;
        } else {
          reply = `⚠️ Yeh subjects 75% se kam par hain:\n` +
            risky.map((s) => `• **${s.name} (${s.code})**: ${s.percent}% (Need ${s.neededToRecover} consecutive classes)`).join("\n");
        }
      } else {
        reply = `Hello ${student?.user.name}! Aapka overall attendance **${overall.percentage}%** hai. Aap mujhse pooch sakte hain:\n• "Kitni classes miss kar sakta hu DBMS me?"\n• "Mera overall attendance kitna hai?"\n• "Kaun se subjects risky hain?"`;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reply,
        remainingDailyQuota: 20 - userLimit.count,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "AI Assistant Error", message: error.message },
      { status: 500 }
    );
  }
}

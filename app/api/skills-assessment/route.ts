import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

// GET: list assessments or get one with questions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (id) {
      // Get assessment + questions (no correct answers exposed to client)
      const { data: assessment } = await insforge.database.from("skill_assessments").select("*").eq("id", id).single();
      const { data: questions } = await insforge.database.from("skill_questions").select("id,question,options,sort_order,explanation").eq("assessment_id", id).order("sort_order");

      // Get user's best result
      let userResult = null;
      if (userId) {
        const { data } = await insforge.database.from("skill_results").select("*").eq("user_id", userId).eq("assessment_id", id).order("score", { ascending: false }).limit(1);
        userResult = (data && data.length > 0) ? data[0] : null;
      }

      return NextResponse.json({ assessment, questions: questions || [], userResult });
    }

    // List all active assessments
    const { data: assessments } = await insforge.database.from("skill_assessments").select("*").eq("is_active", true).order("skill_name");

    // Get user's verified skills and results
    let verifiedSkills: string[] = [];
    let results: any[] = [];
    if (userId) {
      const [vRes, rRes] = await Promise.all([
        insforge.database.from("verified_skills").select("skill_name").eq("user_id", userId),
        insforge.database.from("skill_results").select("assessment_id,score,passed,created_at").eq("user_id", userId),
      ]);
      verifiedSkills = (vRes.data || []).map((v: any) => v.skill_name);
      results = rRes.data || [];
    }

    return NextResponse.json({ assessments: assessments || [], verifiedSkills, results });
  } catch { return NextResponse.json({ assessments: [], verifiedSkills: [], results: [] }); }
}

// POST: submit quiz answers
export async function POST(req: NextRequest) {
  try {
    const { userId, assessmentId, answers, timeTaken } = await req.json();
    if (!userId || !assessmentId || !answers) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Fetch questions with correct answers
    const { data: questions } = await insforge.database.from("skill_questions").select("id,correct_answer,explanation").eq("assessment_id", assessmentId);
    const { data: assessment } = await insforge.database.from("skill_assessments").select("*").eq("id", assessmentId).single();

    if (!questions || !assessment) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

    const q = questions as any[];
    const a = assessment as any;

    // Score the answers
    let correct = 0;
    const scoredAnswers = answers.map((ans: any) => {
      const question = q.find(q => q.id === ans.questionId);
      const isCorrect = question?.correct_answer === ans.answer;
      if (isCorrect) correct++;
      return { ...ans, isCorrect, explanation: question?.explanation };
    });

    const score = q.length > 0 ? Math.round((correct / q.length) * 100) : 0;
    const passed = score >= (a.pass_mark || 70);

    // Get attempt number
    const { data: prevResults } = await insforge.database.from("skill_results").select("attempt_number").eq("user_id", userId).eq("assessment_id", assessmentId).order("attempt_number", { ascending: false }).limit(1);
    const attemptNumber = ((prevResults?.[0] as any)?.attempt_number || 0) + 1;

    // Save result
    const { data: result } = await insforge.database.from("skill_results").insert({
      user_id: userId,
      assessment_id: assessmentId,
      score,
      passed,
      answers: scoredAnswers,
      time_taken_seconds: timeTaken || null,
      attempt_number: attemptNumber,
    }).select().single();

    // Award verified skill badge if passed
    if (passed) {
      try {
        await insforge.database.from("verified_skills").upsert({
          user_id: userId,
          skill_name: a.skill_name,
          assessment_id: assessmentId,
          verified_at: new Date().toISOString(),
        });
      } catch { /* non-blocking */ }
    }

    return NextResponse.json({ success: true, score, passed, correct, total: q.length, result, scoredAnswers, skillName: a.skill_name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

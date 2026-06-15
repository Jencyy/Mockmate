// app/api/evaluate/route.js
// This API route evaluates the user's answers using Google Gemini AI.
// It then tries to save the results to MongoDB.
// If MongoDB is unavailable, it still returns AI feedback — just without saving.

import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { GoogleGenerativeAI } from "@google/generative-ai";

// A fallback evaluator used when Gemini AI is not available (no API key)
// It gives a basic score and feedback without any AI
function generateFallbackEvaluation(questions) {
  const evaluations = questions.map((q) => {
    const wordCount = q.userAnswer?.trim().split(/\s+/).length || 0;
    // Give a basic score based on answer length — longer = more effort
    const score = Math.min(10, Math.max(3, Math.round(wordCount / 10)));
    return {
      aiScore: score,
      aiFeedback: `Your answer had ${wordCount} words. A strong answer typically covers: the concept definition, a real-world example, and why it matters. Consider expanding on these points for a better score.`,
    };
  });
  const totalScore = Math.round(
    evaluations.reduce((sum, e) => sum + e.aiScore, 0) / evaluations.length
  );
  return { totalScore, evaluations };
}

export async function POST(req) {
  try {
    // Verify the user is logged in using NextAuth session
    // getServerSession reads the session cookie securely on the server
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const { role, category = "General", difficulty = "Medium", questions } = body;

    if (!role || !questions || questions.length === 0) {
      return Response.json({ error: "Invalid data: role and questions are required." }, { status: 400 });
    }

    // --- Step 1: Get AI Evaluation ---
    let evaluationData;

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // We build a clear, structured prompt so the AI returns consistent JSON
        const prompt = `You are an expert, strict, and highly analytical technical interviewer evaluating a candidate for a ${role} position.
        The category/topic is ${category} and the difficulty level is ${difficulty}.
        
Here are the interview questions and the candidate's answers:
${JSON.stringify(questions, null, 2)}

Evaluate each answer HONESTLY and strictly. Do not give high scores for generic or shallow answers. Provide:
- A score out of 10. (Be highly critical. Reserve 9-10 for exceptional answers, 7-8 for good, 5-6 for average, and below 5 for poor).
- Detailed, constructive, and brutal feedback pointing out exactly what was missing or incorrect.

Return ONLY a valid JSON object (no markdown, no extra text) in this exact format:
{
  "totalScore": 7,
  "evaluations": [
    { "aiScore": 7, "aiFeedback": "Good answer. Could improve by mentioning X." }
  ]
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Strip any markdown code blocks the AI might accidentally add
        const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        evaluationData = JSON.parse(cleaned);

      } catch (aiError) {
        console.error("Gemini evaluation failed, using fallback:", aiError.message);
        // If Gemini fails, use the fallback evaluator
        evaluationData = generateFallbackEvaluation(questions);
      }
    } else {
      // No Gemini API key — use the basic fallback evaluator
      console.log("No GEMINI_API_KEY — using fallback evaluation.");
      evaluationData = generateFallbackEvaluation(questions);
    }

    // --- Step 2: Combine questions with AI feedback ---
    const finalQuestions = questions.map((q, i) => ({
      questionText: q.questionText,
      userAnswer: q.userAnswer,
      aiScore: evaluationData.evaluations[i]?.aiScore || 5,
      aiFeedback: evaluationData.evaluations[i]?.aiFeedback || "No feedback available.",
    }));

    // --- Step 3: Try to save to MongoDB ---
    // We try to save, but if MongoDB is down, we still return results
    // by encoding them in a temporary "offline" ID format.
    let interviewId = null;

    try {
      // Dynamically import to avoid crashing if DB is unreachable at module load time
      const connectToDatabase = (await import("@/lib/mongodb")).default;
      const { default: Interview } = await import("@/models/Interview");

      await connectToDatabase();

      const newInterview = await Interview.create({
        userId: session.user.id,
        role: role,
        category: category,
        difficulty: difficulty,
        totalScore: evaluationData.totalScore || 0,
        questions: finalQuestions,
      });

      interviewId = newInterview._id.toString();
      console.log("Interview saved to MongoDB:", interviewId);

    } catch (dbError) {
      // MongoDB is unavailable — log it and proceed without saving
      console.error("Could not save to MongoDB (DB unavailable):", dbError.message);
      // We encode the results in a base64 "offline" ID so the results page can still display them
      const offlineData = { role, category, difficulty, totalScore: evaluationData.totalScore, questions: finalQuestions, offline: true };
      // Use URL-safe base64: replace +→-, /→_, and strip = padding
      // This ensures the ID can be used safely in a Next.js URL without causing 404 errors
      interviewId = "offline_" + Buffer.from(JSON.stringify(offlineData))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    }

    return Response.json({ interviewId });

  } catch (error) {
    console.error("Unexpected error in /api/evaluate:", error.message);
    return Response.json({ error: "Evaluation failed. Please try again." }, { status: 500 });
  }
}

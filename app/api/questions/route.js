// app/api/questions/route.js
// This API route returns interview questions for a selected job role.
// It first tries Gemini AI to generate dynamic questions.
// If Gemini is unavailable or the API key is missing, it falls back to
// a curated set of hardcoded questions — so the app never breaks.

import { GoogleGenerativeAI } from "@google/generative-ai";

// A bank of good questions for each role — used as fallback when Gemini is unavailable
const questionBank = {
  "Frontend Developer": [
    "Can you explain the difference between CSS Flexbox and CSS Grid? When would you use one over the other?",
    "What is the Virtual DOM in React and why does it improve performance?",
    "Explain what 'closure' means in JavaScript with a real-world example.",
    "How do you optimize the performance of a web application? List at least 3 techniques.",
    "What is the difference between 'localStorage', 'sessionStorage', and 'cookies'?"
  ],
  "Backend Developer": [
    "What is the difference between SQL and NoSQL databases? When would you choose each?",
    "Explain what REST API is and what makes an API RESTful.",
    "What is middleware in Express.js and how does it work?",
    "How do you handle authentication and authorization in a backend application?",
    "What is database indexing and why is it important for performance?"
  ],
  "Full Stack Developer": [
    "How would you design the architecture for a scalable web application from scratch?",
    "Explain the difference between Server-Side Rendering (SSR) and Client-Side Rendering (CSR).",
    "How do you manage state in a large React application?",
    "What is CORS and how do you handle it in a Node.js backend?",
    "Describe your typical debugging process when something breaks in production."
  ],
  "Database Admin": [
    "What is the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN in SQL?",
    "How do you approach database backup and disaster recovery planning?",
    "What are database transactions and why are ACID properties important?",
    "Explain the difference between horizontal and vertical database scaling.",
    "How would you identify and fix a slow-running query?"
  ],
};

// Default questions used if the role doesn't match any key in the bank above
const defaultQuestions = [
  "Tell me about a challenging technical project you have worked on and how you overcame obstacles.",
  "What is your approach to writing clean, maintainable code?",
  "How do you handle working under pressure or tight deadlines?",
  "Describe a time when you had to learn a new technology quickly. How did you approach it?",
  "Where do you see yourself growing technically in the next 2-3 years?"
];

export async function POST(req) {
  try {
    const body = await req.json();
    const { role, category = "General", difficulty = "Medium" } = body;

    if (!role) {
      return Response.json({ error: "Role is required" }, { status: 400 });
    }

    // --- Try Gemini AI first (if API key exists) ---
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        // Initialize Gemini only if we have an API key
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
 
        let specialInstructions = "Ensure the questions are highly practical, unpredictable, and assess deep understanding rather than just standard definitions.";
        
        if (role === "Corporate Jargon") {
          specialInstructions = "DO NOT ask questions. Instead, just return a list of 5 common 'heavy' office words or corporate jargon terms along with their simple meanings. Format each item as 'Word: Meaning'. Example: 'Bandwidth: The capacity or time to take on more work.'";
        } else if (role === "Learning & Explanations") {
          specialInstructions = "The user is a beginner trying to learn. Frame the question as a learning exercise: provide a very simple, brief explanation of a concept first, and then ask a related easy question to test their understanding.";
        } else {
          specialInstructions += " Make sure the language used is simple, clear, and realistic.";
        }

        const prompt = `You are an expert technical interviewer. 
        Generate exactly 5 interview questions for a ${role} position. 
        The category/topic is ${category} and the difficulty level should be ${difficulty}.
        ${specialInstructions}
        Generate unique questions every time so the user does not see the same questions repeatedly.
        Keep the questions relatively concise to ensure fast generation times.
        Return the output STRICTLY as a JSON array of strings with no other text or markdown.
        Example format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean out any markdown formatting the AI might add (```json ... ```)
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const questions = JSON.parse(cleanedText);

        if (Array.isArray(questions) && questions.length > 0) {
          return Response.json({ questions, source: "ai" });
        }
      } catch (aiError) {
        // Gemini failed — log it and fall through to the hardcoded questions below
        console.error("Gemini AI failed, using fallback questions:", aiError.message);
      }
    } else {
      // No API key — this is expected during early development
      console.log("No GEMINI_API_KEY found — using hardcoded fallback questions.");
    }

    // --- Fallback: Use hardcoded questions ---
    // We look for the role in our question bank first.
    // If not found, we use the generic default questions.
    const fallbackQuestions = questionBank[role] || defaultQuestions;

    return Response.json({ questions: fallbackQuestions, source: "fallback" });

  } catch (error) {
    // This catches truly unexpected errors (e.g., bad request body)
    console.error("Unexpected error in /api/questions:", error.message);
    return Response.json({ questions: defaultQuestions, source: "fallback" }, { status: 200 });
  }
}

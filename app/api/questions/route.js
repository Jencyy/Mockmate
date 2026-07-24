// app/api/questions/route.js
// Returns interview questions + correct answers for each role.
// Uses Gemini AI — falls back to a hardcoded bank if AI is unavailable.

import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Fallback Question Banks ───────────────────────────────────────────────────
// Each question is an object: { question, correctAnswer }
const questionBank = {
  "Frontend Developer": [
    {
      question: "What is the difference between CSS Flexbox and CSS Grid? When would you use one over the other?",
      correctAnswer: "Flexbox is 1D (works in one direction — row or column) and is best for components like navbars and button groups. CSS Grid is 2D (rows AND columns at the same time) and is best for full page layouts. Use Flexbox when aligning items in a line; use Grid when you need to control both rows and columns together."
    },
    {
      question: "What is the Virtual DOM in React and why does it improve performance?",
      correctAnswer: "The Virtual DOM is a lightweight JavaScript copy of the real DOM. When state changes, React updates the Virtual DOM first, diffs it against the previous version, then only updates the actual DOM nodes that changed. This avoids expensive full re-renders of the real DOM, making UI updates much faster."
    },
    {
      question: "Explain what a 'closure' means in JavaScript with a simple real-world example.",
      correctAnswer: "A closure is when an inner function remembers and can access variables from its outer function even after the outer function has finished running. Example: a counter function that returns another function — the returned function still 'remembers' the count variable and can increment it."
    },
    {
      question: "How do you optimize the performance of a web application? Name at least 3 techniques.",
      correctAnswer: "1) Lazy loading — load images and JS only when needed. 2) Code splitting — break JS into smaller chunks loaded on demand. 3) Caching — store assets in the browser or a CDN. 4) Minification — remove whitespace/comments from JS/CSS. 5) Use a CDN to serve static files from servers closer to the user."
    },
    {
      question: "What is the difference between 'localStorage', 'sessionStorage', and 'cookies'?",
      correctAnswer: "localStorage persists data even after the browser is closed (no expiry). sessionStorage only lasts for the browser tab session and clears when the tab is closed. Cookies are sent to the server with every HTTP request, can have an expiry date, and are mainly used for authentication. localStorage and sessionStorage are client-side only."
    }
  ],

  "Backend Developer": [
    {
      question: "What is the difference between SQL and NoSQL databases? When would you choose each?",
      correctAnswer: "SQL databases (like MySQL, PostgreSQL) store data in structured tables with fixed schemas and are great for complex queries and relationships. NoSQL databases (like MongoDB, Redis) store data as documents, key-value pairs, or graphs — they are flexible and scale horizontally. Choose SQL when data is highly relational; choose NoSQL for flexible, high-volume, or unstructured data."
    },
    {
      question: "Explain what a REST API is and what makes an API 'RESTful'.",
      correctAnswer: "REST (Representational State Transfer) is an architectural style for APIs. A RESTful API uses HTTP methods: GET (read), POST (create), PUT/PATCH (update), DELETE (remove). It is stateless (each request contains all needed info), uses standard HTTP status codes, and treats everything as a resource accessed via a URL."
    },
    {
      question: "What is middleware in Express.js and how does it work?",
      correctAnswer: "Middleware is a function that sits between the request and response cycle in Express. It has access to req, res, and next. It runs code, modifies the request/response, and either sends a response or calls next() to pass control to the next middleware. Common uses: authentication, logging, body parsing, CORS handling."
    },
    {
      question: "How do you handle authentication and authorization in a backend application?",
      correctAnswer: "Authentication verifies WHO the user is (login). Authorization checks WHAT they are allowed to do. Common approach: use JWT (JSON Web Tokens) — user logs in, server issues a signed token, client sends the token with each request, server verifies it. For authorization, use role-based access control (RBAC) to check permissions."
    },
    {
      question: "What is database indexing and why is it important for performance?",
      correctAnswer: "An index is a data structure (like a lookup table) that speeds up data retrieval. Without an index, the database scans every row (full table scan). With an index, it jumps directly to matching rows. Indexes are especially important on columns used in WHERE, JOIN, or ORDER BY. The tradeoff: indexes speed up reads but slow down writes."
    }
  ],

  "Full Stack Developer": [
    {
      question: "How would you design the architecture for a scalable web application from scratch?",
      correctAnswer: "Key components: 1) Frontend (React/Next.js), 2) Backend API (Node.js/Express or serverless), 3) Database (SQL for relational data, NoSQL for flexible data), 4) CDN for static assets, 5) Load balancer for distributing traffic, 6) Cache layer (Redis) for frequent queries, 7) Message queue for async tasks. Start simple, then scale horizontally."
    },
    {
      question: "What is the difference between Server-Side Rendering (SSR) and Client-Side Rendering (CSR)?",
      correctAnswer: "CSR: The server sends a bare HTML page + JS bundle; the browser runs JS and builds the UI. Fast after initial load, but slow first paint and bad for SEO. SSR: The server renders the full HTML and sends it ready. Better SEO and faster first paint, but higher server load. Next.js supports both."
    },
    {
      question: "How do you manage state in a large React application?",
      correctAnswer: "For local component state: useState. For shared state across components: Context API or Zustand/Redux. For server data: React Query or SWR (they handle caching, refetching, loading states automatically). The rule: keep state as local as possible, lift it up only when needed, and use a server-state library for API data."
    },
    {
      question: "What is CORS and how do you handle it in a Node.js backend?",
      correctAnswer: "CORS (Cross-Origin Resource Sharing) is a browser security feature that blocks requests from a different origin (domain/port) than the server. To allow it, the server must send Access-Control-Allow-Origin headers. In Express, install the `cors` npm package and use app.use(cors({ origin: 'https://yourfrontend.com' }))."
    },
    {
      question: "Describe your debugging process when something breaks in production.",
      correctAnswer: "1) Check logs first (server logs, browser console). 2) Reproduce the bug in a local/staging environment. 3) Narrow down the scope using git blame or recent deployments. 4) Add logging around the suspected area. 5) Fix the issue with a proper understanding of root cause. 6) Write a test to prevent regression. 7) Deploy with monitoring."
    }
  ],

  "Database Admin": [
    {
      question: "What is the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN in SQL?",
      correctAnswer: "INNER JOIN returns only rows where there is a match in BOTH tables. LEFT JOIN returns ALL rows from the left table plus matching rows from the right (nulls where no match). RIGHT JOIN returns ALL rows from the right table plus matching rows from the left. Most developers prefer LEFT JOIN for clarity."
    },
    {
      question: "What are database transactions and why are ACID properties important?",
      correctAnswer: "A transaction is a group of SQL operations that either ALL succeed or ALL fail together. ACID stands for: Atomicity (all or nothing), Consistency (data stays valid), Isolation (concurrent transactions don't interfere), Durability (committed data persists). ACID ensures data integrity in critical operations like bank transfers."
    },
    {
      question: "How would you identify and fix a slow-running query?",
      correctAnswer: "1) Use EXPLAIN or EXPLAIN ANALYZE to see the query execution plan. 2) Look for full table scans. 3) Add indexes on columns used in WHERE, JOIN, ORDER BY. 4) Avoid SELECT * — only fetch needed columns. 5) Rewrite subqueries as JOINs where possible. 6) Check for N+1 query problems. 7) Consider query caching."
    },
    {
      question: "Explain the difference between horizontal and vertical database scaling.",
      correctAnswer: "Vertical scaling = making the server bigger (more CPU, RAM, storage). It is simpler but has limits and is expensive. Horizontal scaling = adding more servers and distributing the load (sharding). It scales infinitely but requires more complex architecture. NoSQL databases like MongoDB support horizontal scaling better than traditional SQL."
    },
    {
      question: "How do you approach database backup and disaster recovery?",
      correctAnswer: "1) Regular automated backups (daily full, hourly incremental). 2) Store backups in a separate location or cloud (offsite). 3) Test restores regularly — a backup you haven't tested is unreliable. 4) Define RPO (how much data loss is acceptable) and RTO (how fast you must recover). 5) Use point-in-time recovery (PITR) for databases that support it."
    }
  ],

  "HR Round": [
    {
      question: "Tell me about yourself. Walk me through your background.",
      correctAnswer: "A strong answer covers: 1) Who you are professionally (current role/skills). 2) How you got here (brief background). 3) Why you're here today (why this opportunity). Keep it to 90 seconds. Focus on what's relevant to the role, not your life story."
    },
    {
      question: "What is your biggest weakness, and what are you doing about it?",
      correctAnswer: "A good answer names a real weakness (not a fake one like 'I work too hard'), explains how it affected you, and shows what concrete steps you've taken to improve it. Interviewers want self-awareness and a growth mindset — not perfection."
    },
    {
      question: "Tell me about a time you had a conflict with a teammate. How did you handle it?",
      correctAnswer: "Use the STAR method: Situation (what was the conflict), Task (your responsibility), Action (what you specifically did to resolve it), Result (how it ended). Focus on communication, empathy, and collaboration. Avoid blaming the other person."
    },
    {
      question: "Where do you see yourself in 5 years?",
      correctAnswer: "A strong answer shows ambition aligned with the company's growth. Example: 'I'd like to deepen my technical skills in [relevant area] and eventually take on more responsibility, whether that's mentoring others or leading a team. I see this role as a strong foundation for that growth.' Be honest but show commitment."
    },
    {
      question: "Why do you want to work at this company specifically?",
      correctAnswer: "Research the company before the interview. Mention specific things: their product, mission, culture, technology stack, or recent news. Show that you genuinely want THIS company, not just any job. Generic answers like 'I love your growth' without specifics are a red flag to interviewers."
    }
  ],

  "Corporate Jargon": [
    {
      word: "Bandwidth",
      meaning: "The capacity or time someone has to take on more work.",
      usage: "Let's sync next week once I have more bandwidth to focus on this project."
    },
    {
      word: "Boil the ocean",
      meaning: "To attempt an impossible or unnecessarily huge task — overcomplicating something simple.",
      usage: "We just need a basic proof of concept, let's not boil the ocean here."
    },
    {
      word: "Circle back",
      meaning: "To revisit a topic later or follow up on something at a future time.",
      usage: "I'll review the metrics and circle back with the team tomorrow morning."
    },
    {
      word: "Synergy",
      meaning: "The combined power of two groups working together that is greater than each alone.",
      usage: "This partnership will create great synergy between our product and sales teams."
    },
    {
      word: "Low-hanging fruit",
      meaning: "Tasks or goals that are easy to achieve and require minimal effort.",
      usage: "Optimizing image assets is low-hanging fruit for improving our page load speed."
    }
  ],

  "Learning & Explanations": [
    {
      question: "What is an API? Think of it like a waiter at a restaurant — what role does the waiter play between you and the kitchen?",
      correctAnswer: "An API (Application Programming Interface) is a way for two programs to talk to each other. Like a waiter who takes your order to the kitchen and brings back your food, an API takes your request to another system (like a weather service or database) and brings back the response — without you needing to know how it works internally."
    },
    {
      question: "What does it mean for a website to be 'responsive'? Why does it matter?",
      correctAnswer: "A responsive website automatically adjusts its layout to look good on any screen size — desktop, tablet, or phone. It matters because over 60% of web traffic comes from mobile devices. A non-responsive site forces mobile users to zoom and scroll horizontally, which is a poor experience and hurts SEO rankings."
    },
    {
      question: "What is the difference between a variable and a function in programming?",
      correctAnswer: "A variable stores a value (like a labeled box). A function is a reusable block of code that performs a task (like a machine). You can store values in variables and call functions to run logic. Functions can also return values, which can then be stored in variables."
    },
    {
      question: "What is 'version control' and why do developers use tools like Git?",
      correctAnswer: "Version control tracks every change made to code over time — like a save history for your entire project. Git lets multiple developers work on the same codebase without overwriting each other's work. If something breaks, you can roll back to a previous working version. It also enables collaboration through branches and pull requests."
    },
    {
      question: "What does 'debugging' mean in software development?",
      correctAnswer: "Debugging is the process of finding and fixing errors (called 'bugs') in your code. It involves reading error messages, using tools like console.log or a debugger to inspect what the code is actually doing at each step, and systematically narrowing down where the logic goes wrong. Good debugging is a core developer skill."
    }
  ]
};

const defaultQuestions = [
  {
    question: "Tell me about a challenging technical project you worked on and how you overcame obstacles.",
    correctAnswer: "A strong answer uses the STAR method: Situation (the project and challenge), Task (your specific role), Action (what you did to solve it), Result (the outcome). Be specific about technologies used and what you personally contributed."
  },
  {
    question: "What is your approach to writing clean, maintainable code?",
    correctAnswer: "Key principles: meaningful variable/function names, small focused functions (single responsibility), consistent formatting, comments for WHY not WHAT, writing tests, avoiding duplication (DRY principle), and regular code reviews."
  },
  {
    question: "How do you handle working under pressure or tight deadlines?",
    correctAnswer: "Good answers mention: prioritizing tasks by impact, breaking work into smaller chunks, communicating proactively about blockers, asking for help when needed, and staying calm by focusing on what you can control."
  }
];

// ─── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json();
    const { role, category = "General", difficulty = "Medium" } = body;

    if (!role) {
      return Response.json({ error: "Role is required" }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY?.trim();

    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        // Use the correct model name
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let prompt = "";

        if (role === "Corporate Jargon") {
          prompt = `You are a corporate communications expert.
Generate exactly 5 common office buzzwords, business slang terms, or corporate jargon phrases.
For each term provide:
1. The jargon term (word)
2. A simple, plain-English meaning (meaning)
3. A realistic office sentence showing how it's used (usage)

Return ONLY a valid JSON array — no markdown, no code blocks, no extra text:
[
  {
    "word": "Bandwidth",
    "meaning": "The capacity or time someone has to take on more work.",
    "usage": "Let me check my bandwidth before committing to that project."
  }
]`;

        } else if (role === "HR Round") {
          prompt = `You are an experienced HR interviewer at a corporate company.
Generate exactly 5 realistic HR interview questions — the kind asked in real job interviews.
Use clear, direct, conversational language. Mix behavioral questions (Tell me about a time...), 
situational questions (What would you do if...), and self-reflection questions.

For each question also provide the ideal answer a candidate should give.

Return ONLY a valid JSON array — no markdown, no code blocks, no extra text:
[
  {
    "question": "Tell me about a time you failed at something. What did you learn?",
    "correctAnswer": "A strong answer admits a real failure, explains what went wrong, what was learned, and how it was applied afterwards. Avoid blaming others."
  }
]`;

        } else if (role === "Learning & Explanations") {
          prompt = `You are a friendly tutor helping beginners understand technology concepts.
Generate exactly 5 beginner-friendly learning questions. 
For each question: first briefly explain the concept in one simple sentence, then ask a related question to test understanding.
Use simple words and real-world analogies. No jargon.

For each question also provide a simple, clear correct answer.

Return ONLY a valid JSON array — no markdown, no code blocks, no extra text:
[
  {
    "question": "An API is like a waiter at a restaurant — it takes your order to the kitchen and brings back your food. What does API stand for, and what problem does it solve?",
    "correctAnswer": "API stands for Application Programming Interface. It lets two programs communicate with each other without needing to know how the other one works internally."
  }
]`;

        } else {
          prompt = `You are an encouraging and beginner-friendly technical interviewer. 
Generate exactly 5 ${difficulty} difficulty interview questions for a ${role} position.
Topic/category focus: ${category}.

Rules:
- Make the questions VERY EASY, basic, and geared towards absolute beginners or juniors
- Use simple, clear language — no unnecessary jargon
- Focus on fundamental concepts rather than complex, tricky, or advanced scenarios
- Make questions practical and distinct from each other
- For each question, also provide a simple, easy-to-understand correct answer

Return ONLY a valid JSON array — no markdown, no code blocks, no extra text:
[
  {
    "question": "What does HTML stand for and what is its main purpose?",
    "correctAnswer": "HTML stands for HyperText Markup Language. Its main purpose is to structure the content on a web page, like creating paragraphs, headings, and links."
  }
]`;
        }

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean out any accidental markdown fences
        const cleanedText = responseText
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

        const parsed = JSON.parse(cleanedText);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return Response.json({ questions: parsed, source: "ai" });
        }

      } catch (aiError) {
        console.error("Gemini AI failed, using fallback questions:", aiError.message);
      }
    } else {
      console.log("No GEMINI_API_KEY found — using hardcoded fallback questions.");
    }

    // ─── Fallback: hardcoded question bank ────────────────────────────────────
    const fallbackQuestions = questionBank[role] || defaultQuestions;
    return Response.json({ questions: fallbackQuestions, source: "fallback" });

  } catch (error) {
    console.error("Unexpected error in /api/questions:", error.message);
    return Response.json({ questions: defaultQuestions, source: "fallback" }, { status: 200 });
  }
}

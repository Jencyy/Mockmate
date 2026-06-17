# MockMate — Full Architecture & Code Walkthrough

> This guide was written to help you understand and debug the entire project.
> Every file is listed with its purpose, where it gets its data from, and where it sends data to.

---

## 🗂️ Project File Structure

```
c:\Jen\mockmate\
│
├── app/                          ← All pages and API routes (Next.js App Router)
│   ├── layout.js                 ← Root layout wrapping every page (navbar, providers)
│   ├── globals.css               ← Global styles + CSS theme variables (light/dark)
│   ├── page.js                   ← The "/" home landing page (public, no auth needed)
│   │
│   ├── login/
│   │   └── page.js               ← Login + Signup page with tabs and OAuth buttons
│   │
│   ├── dashboard/
│   │   └── page.js               ← User's dashboard: shows all past interviews
│   │
│   ├── setup/[role]/
│   │   └── page.js               ← Interview config screen: pick category & difficulty
│   │
│   ├── interview/[role]/
│   │   └── page.js               ← Core interview: timer, question display, answer input
│   │
│   ├── results/[id]/
│   │   └── page.js               ← Results page: shows AI scores + feedback per question
│   │
│   └── api/                      ← Backend API routes (run on the server, not the browser)
│       ├── auth/
│       │   ├── [...nextauth]/
│       │   │   └── route.js      ← Handles ALL login/OAuth/session logic (NextAuth hub)
│       │   └── signup/
│       │       └── route.js      ← Handles new user registration with email + password
│       │
│       ├── questions/
│       │   └── route.js          ← Generates interview questions using Gemini AI
│       │
│       └── evaluate/
│           └── route.js          ← Evaluates answers with Gemini AI + saves to MongoDB
│
├── components/                   ← Reusable React components
│   ├── Navbar.jsx                ← Top navigation bar (auth-aware, responsive)
│   ├── AuthProvider.jsx          ← NextAuth SessionProvider wrapper for App Router
│   ├── ThemeProvider.jsx         ← next-themes wrapper for dark/light mode
│   └── ThemeToggle.jsx           ← Sun/Moon toggle button in the Navbar
│
├── lib/
│   └── mongodb.js                ← MongoDB connection with caching (prevents reconnects)
│
├── models/                       ← Mongoose schemas (defines MongoDB document shapes)
│   ├── User.js                   ← User schema (name, email, hashed password, avatar)
│   └── Interview.js              ← Interview schema (questions, scores, AI feedback)
│
└── .env.local                    ← Secret environment variables (NOT committed to git)
```

---

## 🔑 Environment Variables (`.env.local`)

These are secret keys that the app reads at runtime. You MUST set these up for things to work:

| Variable | Where to get it | What it does |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas dashboard | Connection string for your database |
| `NEXTAUTH_SECRET` | Any random 32+ char string | Signs and encrypts session tokens |
| `NEXTAUTH_URL` | `http://localhost:3000` in dev | Tells NextAuth what URL the app runs on |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com) | Enables "Sign in with Google" |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console | Secret key for Google OAuth |
| `GITHUB_ID` | [GitHub Developer Settings](https://github.com/settings/developers) | Enables "Sign in with GitHub" |
| `GITHUB_SECRET` | GitHub Developer Settings | Secret key for GitHub OAuth |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com) | Powers question generation & AI evaluation |

---

## 🏗️ How Next.js App Router Works Here

Next.js uses a **file-system based router** — a file's location determines its URL:

```
app/page.js              → URL: /
app/login/page.js        → URL: /login
app/dashboard/page.js    → URL: /dashboard
app/setup/[role]/page.js → URL: /setup/Frontend%20Developer
app/interview/[role]/page.js → URL: /interview/Frontend%20Developer
app/results/[id]/page.js → URL: /results/abc123

app/api/questions/route.js → API: POST /api/questions
app/api/evaluate/route.js  → API: POST /api/evaluate
app/api/auth/signup/route.js → API: POST /api/auth/signup
app/api/auth/[...nextauth]/route.js → API: /api/auth/* (all auth endpoints)
```

**Server vs Client Components:**
- By default in Next.js, all components are **Server Components** (rendered on the server, no React hooks)
- Adding `"use client"` at the top makes it a **Client Component** (runs in the browser, can use `useState`, `useEffect`, etc.)
- API routes (`route.js` files) always run on the **server only** — they are never sent to the browser

---

## 🔐 Authentication Flow

```
User visits /login
     │
     ├── Email/Password Login:
     │   └── signIn("credentials", {email, password})
     │       └── NextAuth calls 'authorize()' in route.js
     │           └── Finds user in MongoDB, verifies bcrypt password
     │               └── Returns user object → session created → redirect to /dashboard
     │
     ├── New Account Signup:
     │   └── POST /api/auth/signup → creates user in MongoDB with hashed password
     │       └── Then calls signIn("credentials") automatically
     │
     ├── Google Login:
     │   └── signIn("google") → redirects to Google → Google sends back profile
     │       └── NextAuth's signIn() callback saves user to MongoDB
     │           └── session created → redirect to /dashboard
     │
     └── GitHub Login:
         └── Same as Google but through GitHub's OAuth system
```

**How session works across pages:**
1. After login, NextAuth stores user info in a **signed JWT cookie** in the browser
2. On every page, `getServerSession()` (server) or `useSession()` (client) reads this cookie
3. The session contains `{ user: { id, name, email, image } }`
4. Pages that need auth check `if (!session) redirect('/login')`

---

## 🤖 Gemini AI Integration

### Question Generation (`/api/questions/route.js`)
```
Browser (interview/[role]/page.js)
     │
     └── POST /api/questions { role, category, difficulty }
         │
         ├── If GEMINI_API_KEY exists:
         │   └── Sends prompt to Gemini Flash model
         │       └── Parses JSON array of 5 questions
         │           └── Returns { questions: [...], source: "ai" }
         │
         └── If no API key (fallback):
             └── Uses hardcoded questionBank object
                 └── Returns { questions: [...], source: "fallback" }
```

### Answer Evaluation (`/api/evaluate/route.js`)
```
Browser (interview/[role]/page.js — after last question)
     │
     └── POST /api/evaluate { role, category, difficulty, questions: [{questionText, userAnswer}] }
         │
         ├── Step 1: Evaluate with Gemini AI
         │   └── Sends all Q&A pairs to Gemini with a strict scoring prompt
         │       └── Parses JSON: { totalScore, evaluations: [{aiScore, aiFeedback}] }
         │
         ├── Step 2: Merge AI feedback with original questions
         │   └── Creates finalQuestions array with question + user answer + score + feedback
         │
         └── Step 3: Save to MongoDB
             ├── Success: saves Interview document, returns { interviewId: "abc123" }
             └── Failure (DB down): encodes results as base64 URL-safe string
                 └── Returns { interviewId: "offline_eyJyb2xl..." }
```

---

## 🗄️ MongoDB & Mongoose

### What is Mongoose?
Mongoose is a library that makes it easier to work with MongoDB. Instead of raw JSON, you define **schemas** (like blueprints) that tell MongoDB what shape your data should be.

### The Two Collections

**`users` collection** (defined in `models/User.js`):
```json
{
  "_id": "ObjectId('64abc...')",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "$2b$12$hashedpassword...",  // bcrypt hash, never plain text
  "image": "https://lh3.googleusercontent.com/...",
  "provider": "credentials",  // or "google" / "github"
  "createdAt": "2025-01-15T10:30:00Z"
}
```

**`interviews` collection** (defined in `models/Interview.js`):
```json
{
  "_id": "ObjectId('65def...')",
  "userId": "ObjectId('64abc...')",  // References the user above
  "role": "Frontend Developer",
  "category": "React",
  "difficulty": "Medium",
  "totalScore": 7,
  "questions": [
    {
      "questionText": "What is the Virtual DOM?",
      "userAnswer": "It's a copy of the real DOM...",
      "aiScore": 8,
      "aiFeedback": "Good answer! You correctly identified..."
    }
  ],
  "createdAt": "2025-01-15T11:00:00Z"
}
```

### Connection Caching (`lib/mongodb.js`)
Next.js API routes run as **serverless functions** — each request can spin up a new instance. Without caching, each request would open a new MongoDB connection (up to 1000/sec!) which would crash the database. The caching in `mongodb.js` stores the connection on `global.mongoose` so it's reused across requests in the same server instance.

---

## 🎨 Theming System

```
app/globals.css → Defines CSS variables:
  :root { --color-background: white; --color-foreground: black; }
  .dark { --color-background: #09090b; --color-foreground: white; }

app/layout.js → Wraps app in <ThemeProvider attribute="class" defaultTheme="system">

next-themes → Adds class="dark" or class="light" to <html> element

Tailwind CSS → 'dark:' prefix classes activate when html has class="dark"

ThemeToggle.jsx → Clicking this calls setTheme() which changes the html class

Result: any component using dark:bg-X / dark:text-X automatically responds
```

---

## 🐛 Debugging Tips

### "MongoDB connection failed"
- Check your `MONGODB_URI` in `.env.local`
- Make sure your IP is whitelisted in MongoDB Atlas (Network Access tab)
- The app has fallback behavior — it will still work offline using base64 encoding

### "AI questions not loading"
- Check `GEMINI_API_KEY` in `.env.local`
- If missing/invalid, the app automatically uses hardcoded fallback questions
- Open browser DevTools → Network tab → look for the `/api/questions` request

### "Login not working"
- For email/password: Make sure you signed up first (hit "Create Account" tab)
- For Google/GitHub: Make sure the OAuth client IDs and secrets are correctly set in `.env.local`
- Check the terminal where `npm run dev` is running for error logs

### "Session shows undefined"
- Make sure `NEXTAUTH_SECRET` is set
- Make sure `NEXTAUTH_URL` matches the URL you're accessing (`http://localhost:3000`)
- Check that `AuthProvider.jsx` wraps your layout in `app/layout.js`

### Common NextAuth error codes
| Error | Meaning |
|---|---|
| `CredentialsSignin` | Wrong email or password |
| `OAuthSignin` | Google/GitHub OAuth setup issue |
| `OAuthCallback` | Redirect URI mismatch in OAuth settings |

---

## 📡 Data Flow Summary

```
User Action → Next.js Page → API Route → AI / Database → Response → UI Update

Example: Completing an interview
  1. User submits last answer (interview/[role]/page.js)
  2. Page calls POST /api/evaluate with all answers
  3. API calls Gemini AI with a scoring prompt
  4. Gemini returns JSON with scores and feedback
  5. API saves the Interview document to MongoDB
  6. API returns { interviewId }
  7. Page redirects to /results/[interviewId]
  8. Results page fetches the Interview from MongoDB using the ID
  9. Renders all questions with scores and AI feedback
```

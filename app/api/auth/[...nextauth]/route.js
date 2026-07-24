// =============================================================================
// app/api/auth/[...nextauth]/route.js — Authentication Hub
// =============================================================================
// Purpose  : Handles ALL authentication for the entire MockMate app.
//            NextAuth's [...nextauth] "catch-all" route means any URL like:
//            /api/auth/signin, /api/auth/callback/google, /api/auth/session,
//            /api/auth/signout — all get routed here automatically.
//
// Providers: 3 ways to log in:
//            1. Google OAuth   → needs GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env
//            2. GitHub OAuth   → needs GITHUB_ID + GITHUB_SECRET in .env
//            3. Credentials    → our own email/password system (bcrypt verified)
//
// Data Flow: User clicks Sign In → NextAuth calls the relevant provider →
//            signIn() callback saves user to MongoDB if new →
//            session() callback attaches the MongoDB _id to every page session
// =============================================================================

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

// ─── Auth Configuration ───────────────────────────────────────────────────────
// This object is exported separately so other server-side code (like pages and
// API routes) can call getServerSession(authOptions) to check if a user is logged in.
export const authOptions = {
  providers: [

    // ── Provider 1: Google OAuth ──────────────────────────────────────────────
    // When user clicks "Continue with Google", they are redirected to Google's
    // consent screen. After they approve, Google sends back a token with their
    // name, email, and profile picture. NextAuth handles all of this automatically.
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // ── Provider 2: GitHub OAuth ──────────────────────────────────────────────
    // Same flow as Google, but through GitHub's OAuth system.
    // Set up at: https://github.com/settings/developers
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),

    // ── Provider 3: Email / Password (Credentials) ────────────────────────────
    // This is OUR custom login. The user types an email and password,
    // and the 'authorize' function below verifies them against MongoDB.
    // Unlike OAuth, WE handle the credential verification ourselves.
    CredentialsProvider({
      name: "Email",
      credentials: {
        email:    { label: "Email",    type: "email",    placeholder: "you@example.com" },
        password: { label: "Password", type: "password", placeholder: "••••••••" },
      },

      // 'authorize' is called when the user submits the login form.
      // Return the user object on success, or null/throw on failure.
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password.");
        }

        // Connect to MongoDB and find the user by their email
        await connectToDatabase();

        // We use .select('+password') because 'select: false' on the password field
        // means Mongoose won't include it in normal queries — we must ask for it explicitly
        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');

        // No user found with that email
        if (!user) {
          throw new Error("No account found with that email. Please sign up first.");
        }

        // User signed up with Google/GitHub — they don't have a password
        if (!user.password) {
          throw new Error("This account uses Google or GitHub login. Please use that instead.");
        }

        // Compare the entered password against the bcrypt hash stored in MongoDB
        // (comparePassword is a method we defined in models/User.js)
        const isPasswordValid = await user.comparePassword(credentials.password);

        if (!isPasswordValid) {
          throw new Error("Incorrect password. Please try again.");
        }

        // Return the user data — NextAuth will store this in the JWT token
        return {
          id:    user._id.toString(),
          name:  user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  // ─── Callbacks ─────────────────────────────────────────────────────────────
  // Callbacks let us customize what happens at key points in the auth flow.
  callbacks: {

    // ── signIn Callback ───────────────────────────────────────────────────────
    // Called after a successful OAuth sign-in (Google or GitHub).
    // NOT called for Credentials — that's handled in 'authorize' above.
    // We use this to save new OAuth users to our MongoDB database.
    async signIn({ user, account }) {
      // Skip DB logic for credentials — already handled in 'authorize'
      if (account?.provider === "credentials") return true;

      try {
        await connectToDatabase();

        // Check if this OAuth user already has an account
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // First time logging in with this OAuth account — create a user document
          await User.create({
            name:     user.name,
            email:    user.email,
            image:    user.image,
            provider: account.provider, // 'google' or 'github'
          });
        }

        return true; // Allow the sign-in to proceed
      } catch (error) {
        console.error("[OAUTH SIGN-IN ERROR]", error);
        return false; // Returning false cancels the login
      }
    },

    // ── session Callback ──────────────────────────────────────────────────────
    // Called every time a page or API route checks for the current session
    // (via getServerSession or useSession).
    // We use it to attach the MongoDB _id to the session object so all pages
    // can associate data (like interviews) with the correct user.
    async session({ session, token }) {
      // First, use the JWT token's subject (sub) which holds the user's id
      if (token?.sub) {
        session.user.id = token.sub;
      }

      // Then look up the real MongoDB _id for accuracy
      // This is important when the JWT token contains a temporary ID
      try {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          session.user.id = dbUser._id.toString();
        }
      } catch {
        // If the DB lookup fails, we still return the session — the app won't crash
        // The user stays logged in, they just might not be able to save new interviews
      }

      return session;
    },
  },

  // ─── Session Strategy ──────────────────────────────────────────────────────
  // "jwt" means sessions are stored in a signed cookie, NOT in a database table.
  // This works great with MongoDB — no separate sessions collection needed.
  session: {
    strategy: "jwt",
  },

  // ─── Custom Pages ─────────────────────────────────────────────────────────
  // Redirect to our custom login page instead of NextAuth's default ugly one
  pages: {
    signIn: "/login",
  },

  // ─── Secret ───────────────────────────────────────────────────────────────
  // Required by NextAuth to sign and encrypt JWT tokens.
  // Set NEXTAUTH_SECRET to any random 32+ char string in .env.local
  secret: process.env.NEXTAUTH_SECRET,
};

// ─── Route Handler ─────────────────────────────────────────────────────────
// Create the GET and POST handler from our config above.
// Next.js App Router requires us to export named HTTP method handlers.
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
  
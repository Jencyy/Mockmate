// app/api/auth/[...nextauth]/route.js
// This file handles ALL authentication for the app.
// NextAuth's catch-all route [...nextauth] means any URL like /api/auth/signin,
// /api/auth/callback/google etc., will all be handled here automatically.

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    // --- PROVIDER 1: Google Login ---
    // Needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // --- PROVIDER 2: GitHub Login ---
    // Needs GITHUB_ID and GITHUB_SECRET in .env
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),

    // --- PROVIDER 3: Credentials (for local testing ONLY) ---
    // IMPORTANT: This bypasses MongoDB entirely so you can test without a DB connection.
    // It returns a hardcoded fake user — perfect for testing the interview flow locally.
    CredentialsProvider({
      name: "Test Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // MongoDB is working now! Let's save the test user to the database
        // so that they get a real MongoDB ObjectId.
        await connectToDatabase();

        const email = credentials?.email || "test@mockmate.com";
        const name = credentials?.email?.split("@")[0] || "TestUser";

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name,
            email,
            image: `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff`,
          });
        }

        // Return real user from DB
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    // The signIn callback runs when Google/GitHub login happens
    // For Credentials, the 'authorize' function above handles it instead
    async signIn({ user, account }) {
      // Only run DB logic for OAuth providers (google, github), not credentials
      if (account?.provider === "credentials") return true;

      try {
        await connectToDatabase();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
          });
        }
        return true;
      } catch (error) {
        console.error("OAuth signIn error:", error);
        return false;
      }
    },

    // The session callback runs every time a page checks "who is logged in"
    // We use it to attach the MongoDB _id to the session so we can save interviews
    async session({ session, token }) {
      // With JWT strategy, user id is stored in the token
      // We attach it to session.user so all pages can access it easily
      if (token?.sub) {
        session.user.id = token.sub;
      }
      
      // Also look up the real MongoDB _id from the database
      try {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          session.user.id = dbUser._id.toString();
        }
      } catch (e) {
        // If DB lookup fails, we still return the session — app won't crash
      }

      return session;
    },
  },

  // JWT strategy works great without a database adapter for sessions
  session: {
    strategy: "jwt",
  },

  // Use our custom login page instead of NextAuth's default one
  pages: {
    signIn: "/login",
  },

  // This secret is required by NextAuth to sign tokens securely
  secret: process.env.NEXTAUTH_SECRET,
};

// Create the GET and POST handler from our config
const handler = NextAuth(authOptions);

// Export both — Next.js App Router requires named HTTP method exports
export { handler as GET, handler as POST };

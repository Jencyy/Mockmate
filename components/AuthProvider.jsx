"use client";

// components/AuthProvider.jsx
// In Next.js App Router, layout.js is a Server Component by default.
// However, NextAuth's SessionProvider uses React Context, which requires a Client Component.
// Therefore, we create this wrapper component, mark it with "use client", 
// and wrap our entire app with it in layout.js.

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}

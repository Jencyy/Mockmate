"use client";

// components/Navbar.jsx
// This component provides the top navigation bar for the entire app.
// It uses "use client" because it depends on the useSession hook for auth state.

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, LayoutDashboard, Sparkles } from "lucide-react";

export default function Navbar() {
  // useSession hook gives us the current user's login state
  // 'data: session' renames the 'data' property to 'session'
  // 'status' can be "loading", "authenticated", or "unauthenticated"
  const { data: session, status } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">MockMate AI</span>
          </Link>

          {/* Right side navigation items */}
          <div className="flex items-center gap-4">
            {status === "loading" ? (
              // Show a loading skeleton or nothing while checking session
              <div className="w-20 h-8 bg-white/10 rounded animate-pulse"></div>
            ) : session ? (
              // If user is logged in, show Dashboard link and Logout button
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="h-6 w-px bg-white/10 mx-2"></div>
                <div className="flex items-center gap-3">
                  {/* Display user profile image if available */}
                  {session.user?.image && (
                    <img 
                      src={session.user.image} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border border-white/20"
                    />
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-gray-400 hover:text-red-400 flex items-center gap-2 transition-colors text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              // If user is not logged in, show Login/Register buttons
              <>
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

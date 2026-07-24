// =============================================================================
// components/Navbar.jsx — App Navigation Bar
// =============================================================================
// Purpose  : Renders the sticky top navigation bar shown on every page.
//            Adjusts its content based on whether the user is logged in or not.
//
// "use client" : Required because it uses React hooks (useState) and NextAuth's
//                useSession() — both of which only work in Client Components.
//
// Auth State  : useSession() returns:
//               - status: 'loading' | 'authenticated' | 'unauthenticated'
//               - data: the session object (has .user.name, .user.email, .user.image)
//
// Theme       : Uses ThemeToggle component to switch between light/dark mode
//               (managed globally by ThemeProvider in app/layout.js)
// =============================================================================

"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, LayoutDashboard, Sparkles, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";

export default function Navbar() {
  // useSession() from NextAuth — tells us if a user is currently signed in
  // 'session' contains user info (name, email, image, id)
  // 'status' is 'loading' while the session check is in progress
  const { data: session, status } = useSession();

  // Controls the mobile hamburger menu open/close state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 group">
            {/* The user will put their logo here */}
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white transition-colors">MockMate AI</span>
          </Link>

          {/* Right side navigation items (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            
            {status === "loading" ? (
              <div className="w-20 h-8 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-300 dark:bg-white/10 mx-2"></div>
                <div className="flex items-center gap-3">
                  {session.user?.image && (
                    <img 
                      src={session.user.image} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border border-gray-300 dark:border-white/20"
                    />
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-2 transition-colors text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4 flex flex-col gap-4">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-2 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-700 dark:text-gray-300 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

// =============================================================================
// app/login/page.js — Login & Signup Page
// =============================================================================
// Purpose  : The single-page authentication UI for MockMate. Users can either:
//            1. Sign in with an existing email/password account
//            2. Register a new account with name, email, and password
//            3. Continue with Google or GitHub (OAuth)
//
// Auth Flow: Email/password → calls NextAuth's signIn("credentials", {...})
//            which hits the CredentialsProvider in /api/auth/[...nextauth]/route.js
//            Signup → calls /api/auth/signup first to create the user, then signIn()
//            OAuth   → calls signIn("google") or signIn("github") which redirects
//            to the respective provider's consent page.
//
// State    : 'mode' toggles between "login" and "signup" tabs
//            'isLoading' tracks form submission state for button feedback
//            'error' holds any server-side error messages from NextAuth
// =============================================================================

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Sparkles, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";

// ─── Google SVG Icon ──────────────────────────────────────────────────────────
// Using the official Google "G" logo as inline SVG for best quality
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── GitHub SVG Icon ─────────────────────────────────────────────────────────
function GitHubIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function LoginPage() {
  // Toggle between 'login' and 'signup' modes
  const [mode, setMode] = useState("login");

  // Form field state
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState("");
  const [successMsg, setSuccessMsg]     = useState("");

  // ── Handle Email/Password Submit ─────────────────────────────────────────
  // This function handles both login and signup depending on the current 'mode'
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form reload
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    if (mode === "signup") {
      // ── Signup Flow ──────────────────────────────────────────────────────
      // Step 1: Call our custom /api/auth/signup route to create the user in MongoDB
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setIsLoading(false);
        return;
      }

      // Step 2: Account created — now automatically sign them in
      setSuccessMsg("Account created! Signing you in...");
      await signIn("credentials", { email, password, callbackUrl: "/dashboard" });

    } else {
      // ── Login Flow ───────────────────────────────────────────────────────
      // NextAuth's signIn("credentials") calls our 'authorize' function in
      // /api/auth/[...nextauth]/route.js with the provided credentials.
      // 'redirect: false' prevents automatic page redirect so we can catch errors.
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Handle the redirect ourselves
      });

      if (result?.error) {
        // NextAuth passes error messages as query params when redirect: false
        setError(result.error === "CredentialsSignin"
          ? "Invalid email or password. Please try again."
          : result.error
        );
        setIsLoading(false);
      } else {
        // Success — redirect to dashboard
        window.location.href = "/dashboard";
      }
    }
  };

  return (
    // ── Page Container ────────────────────────────────────────────────────────
    <div className="flex-1 flex items-center justify-center bg-background p-4 relative overflow-hidden min-h-screen transition-colors duration-300">

      {/* Decorative background glows — purely visual */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none"></div>

      {/* ── Auth Card ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground transition-colors">MockMate</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-powered interview practice</p>
        </div>

        {/* ── Login / Signup Tab Switcher ──────────────────────────────────── */}
        <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 mb-6 border border-gray-200 dark:border-white/10">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              mode === "login"
                ? "bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              mode === "signup"
                ? "bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* ── Main Card ────────────────────────────────────────────────────── */}
        <div className="bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl transition-colors">

          {/* Error Banner — shown when auth fails */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
              <span className="text-base leading-none mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner — shown after signup */}
          {successMsg && (
            <div className="mb-5 p-3.5 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── Email / Password Form ────────────────────────────────────── */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">

            {/* Name field — only shown in signup mode */}
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 text-sm transition-colors"
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 text-sm transition-colors"
              />
            </div>

            {/* Password field with show/hide toggle */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Min. 6 characters" : "••••••••"}
                  required
                  className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 text-sm transition-colors"
                />
                {/* Toggle password visibility */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 text-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                // Spinner shown while the auth request is processing
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ── Divider ──────────────────────────────────────────────────── */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-white/10 transition-colors"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
              or continue with
            </span>
            <div className="flex-grow border-t border-gray-200 dark:border-white/10 transition-colors"></div>
          </div>

          {/* ── OAuth Buttons ─────────────────────────────────────────────── */}
          <div className="space-y-3">

            {/* Google Sign In — redirects to Google's OAuth consent screen */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 dark:bg-white text-gray-800 dark:text-gray-900 dark:hover:bg-gray-100 px-6 py-3.5 rounded-xl font-semibold transition-all active:scale-[0.98] cursor-pointer text-sm shadow-sm border border-gray-200 dark:border-gray-300"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* GitHub Sign In — redirects to GitHub's OAuth consent screen */}
            <button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 dark:bg-[#1e2329] dark:hover:bg-[#2d333b] text-white px-6 py-3.5 rounded-xl font-semibold transition-all active:scale-[0.98] cursor-pointer text-sm shadow-sm border border-gray-700 dark:border-white/10"
            >
              <GitHubIcon />
              Continue with GitHub
            </button>
          </div>
        </div>

        {/* ── Footer Note ────────────────────────────────────────────────────── */}
        <p className="mt-6 text-center text-xs text-gray-500 leading-relaxed">
          By continuing, you agree to our{" "}
          <span className="underline cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Terms of Service</span>
          {" "}and{" "}
          <span className="underline cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

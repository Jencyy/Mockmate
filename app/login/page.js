// app/login/page.js
// This is our custom login page. It replaces the default NextAuth login screen.
// We use 'use client' because we are using onClick handlers and NextAuth hooks.

"use client";

import { signIn } from "next-auth/react";
// We use simple text for provider icons since lucide-react doesn't include brand icons anymore

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Background glowing effects for premium feel */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20"></div>
      
      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome to MockMate</h1>
          <p className="text-gray-400">Sign in to start practicing interviews</p>
        </div>

        <div className="space-y-4">
          {/* Test Login Button for development without OAuth */}
          <button
            onClick={() => signIn("credentials", { email: "test@example.com", password: "password", callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90 active:scale-95 border border-white/10 shadow-lg shadow-purple-500/20"
          >
            <span className="font-bold text-lg">🧪</span>
            Quick Test Login
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase">Or continue with</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Google Sign In Button */}
          {/* We pass { callbackUrl: "/dashboard" } to redirect the user after a successful login */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 bg-white text-black px-6 py-3 rounded-lg font-medium transition-all hover:bg-gray-100 active:scale-95"
          >
            <span className="font-bold text-lg">G</span>
            Continue with Google
          </button>

          {/* GitHub Sign In Button */}
          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 bg-[#24292F] text-white px-6 py-3 rounded-lg font-medium transition-all hover:bg-[#24292F]/80 active:scale-95 border border-white/10"
          >
            <span className="font-bold text-lg">GH</span>
            Continue with GitHub
          </button>
        </div>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

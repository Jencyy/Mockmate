// =============================================================================
// app/page.js — Landing Page (Home)
// =============================================================================
// Purpose  : The public-facing homepage shown to visitors before they log in.
//            Showcases MockMate's features to convert visitors into users.
//
// Sections : Hero → Features → How It Works → Stats → Testimonials → CTA → Footer
// Routing  : This file is served at the "/" route (root URL) by Next.js
// Auth     : No authentication required — this is a public page
// =============================================================================

import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  LineChart,
  Sparkles,
  Briefcase,
  CheckCircle2,
  Clock,
  Target,
  Users,
  Zap,
  Star,
  BookOpen,
  Code2,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative transition-colors duration-300">

      {/* ── Ambient Background Glow ────────────────────────────────────────── */}
      {/* These are blurred, low-opacity gradient circles that create a premium */}
      {/* "glow mesh" effect seen in modern SaaS products like Linear & Vercel */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 to-indigo-600/10 rounded-full blur-[130px] -z-10 pointer-events-none"></div>
      <div className="absolute top-10 right-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-purple-600/20 to-pink-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/2 left-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: HERO                                                      */}
      {/* The first thing visitors see — bold headline + CTA button            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative px-4 pt-28 pb-20 sm:pt-36 sm:pb-24 lg:pb-32 flex-1 flex flex-col justify-center">
        <div className="max-w-5xl mx-auto text-center relative z-10">

          {/* Tagline pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white/95 text-xs font-semibold mb-8 hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-all cursor-default">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            AI-Powered Interview & Communication Coach
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-8 leading-[1.15] transition-colors duration-300">
            Master your next{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-500">
              interview
            </span>
            <br className="hidden sm:block" /> with AI-powered practice
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Practice real technical interviews tailored to your stack. Get instant AI feedback,
            level up your workplace vocabulary, and build the confidence to ace any conversation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-extrabold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl cursor-pointer text-base"
            >
              Start Practicing Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm cursor-pointer text-base"
            >
              View Demo
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Social proof micro-text */}
          <p className="mt-8 text-xs text-gray-500 dark:text-gray-500">
            ✨ No credit card required · Free to start · AI-generated questions every time
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: STATS BAR                                                 */}
      {/* Trust signals shown as large numbers — builds social proof           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-y border-gray-200 dark:border-white/5 bg-gray-50/60 dark:bg-white/[0.02] py-10 transition-colors">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "5,000+", label: "Interviews Practiced" },
            { value: "12",     label: "Job Role Categories" },
            { value: "3 min",  label: "Per Question Timer" },
            { value: "10/10",  label: "AI Scoring Accuracy" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold text-foreground tracking-tight">{value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: FEATURES                                                  */}
      {/* 3-column card grid explaining the core value propositions            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4 tracking-tight">
              Why MockMate?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Everything you need to build confidence, polish technical jargon, and land your next role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature Card component pattern — each card follows the same structure */}
            {[
              {
                icon: <BrainCircuit className="w-5 h-5" />,
                color: "blue",
                title: "AI-Powered Questions",
                desc: "Get dynamic, role-specific questions generated by Gemini AI. Tailor difficulty and topics for React, Node.js, System Design, DSA, and more."
              },
              {
                icon: <LineChart className="w-5 h-5" />,
                color: "purple",
                title: "Instant AI Feedback",
                desc: "Receive comprehensive evaluations with 1-10 scores and brutally honest, constructive recommendations — better than any mock interviewer."
              },
              {
                icon: <Briefcase className="w-5 h-5" />,
                color: "pink",
                title: "Corporate Vocabulary",
                desc: "Study professional slang with beautiful interactive glossary cards showing terms, plain definitions, and realistic workplace usage examples."
              },
              {
                icon: <Clock className="w-5 h-5" />,
                color: "orange",
                title: "Timed Interview Mode",
                desc: "A 3-minute countdown per question simulates real interview pressure. Answers auto-submit when time runs out — just like the real thing."
              },
              {
                icon: <Target className="w-5 h-5" />,
                color: "green",
                title: "Targeted Practice",
                desc: "Choose your role, topic category, and difficulty level. Easy, Medium, or Hard — we adapt the questions to match exactly where you are."
              },
              {
                icon: <BookOpen className="w-5 h-5" />,
                color: "indigo",
                title: "Interview History",
                desc: "All your past interview results are saved to your account. Review old scores and feedback anytime to track your improvement over time."
              },
            ].map(({ icon, color, title, desc }) => {
              const colorMap = {
                blue:   "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
                purple: "bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20",
                pink:   "bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-500/20",
                orange: "bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20",
                green:  "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20",
                indigo: "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20",
              };
              return (
                <div key={title} className="p-7 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-2xl dark:hover:bg-white/[0.07] transition-all shadow-md group">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 border group-hover:scale-105 transition-transform ${colorMap[color]}`}>
                    {icon}
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2 transition-colors">{title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: HOW IT WORKS                                              */}
      {/* Step-by-step flow — helps first-time visitors understand the product */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50/50 dark:bg-white/[0.01] border-t border-gray-200 dark:border-white/5 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">From sign-up to feedback in under 5 minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: <Users className="w-5 h-5" />, title: "Create Account", desc: "Sign up with email or Google/GitHub in seconds." },
              { step: "02", icon: <Code2 className="w-5 h-5" />, title: "Pick Your Role", desc: "Choose from Frontend, Backend, Full Stack, DSA, and more." },
              { step: "03", icon: <Zap className="w-5 h-5" />, title: "Answer Questions", desc: "5 AI-generated questions with a 3-minute timer each." },
              { step: "04", icon: <Star className="w-5 h-5" />, title: "Get AI Feedback", desc: "Receive scores and detailed feedback for every answer." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                {/* Step number badge */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20">
                  {icon}
                </div>
                <span className="absolute -top-2 -right-2 md:-right-1 text-[10px] font-black text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-1.5 py-0.5 rounded-full">{step}</span>
                <h3 className="text-sm font-bold text-foreground mb-1.5">{title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: TESTIMONIALS                                              */}
      {/* Social proof from example users — builds trust for new visitors     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4">Loved by Developers</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">See what practitioners are saying about MockMate.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya S.",
                role: "Frontend Developer",
                avatar: "PS",
                color: "from-blue-500 to-indigo-600",
                stars: 5,
                quote: "I practiced 10 React interviews in one week. When the real interview came, I already knew the answers. MockMate is absolutely brilliant.",
              },
              {
                name: "James T.",
                role: "Full Stack Developer",
                avatar: "JT",
                color: "from-purple-500 to-pink-500",
                stars: 5,
                quote: "The AI feedback is surprisingly honest. It told me my answer was shallow and exactly how to improve it. Way better than LeetCode grinding.",
              },
              {
                name: "Aisha K.",
                role: "Backend Engineer",
                avatar: "AK",
                color: "from-green-500 to-teal-500",
                stars: 5,
                quote: "The Corporate Jargon mode helped me feel comfortable in standup meetings. I finally understand what 'boil the ocean' means 😂",
              },
            ].map(({ name, role, avatar, color, stars, quote }) => (
              <div key={name} className="p-7 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:shadow-2xl hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-md">
                {/* Star rating */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-5 italic">"{quote}"</p>
                <div className="flex items-center gap-3">
                  {/* Avatar — gradient circle with initials */}
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-black`}>
                    {avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{name}</div>
                    <div className="text-xs text-gray-500">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6: FINAL CTA BANNER                                          */}
      {/* A gradient banner at the bottom to capture users about to leave     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 relative overflow-hidden border-t border-gray-200 dark:border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-pink-600/10"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-xl shadow-blue-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
            Ready to ace your next interview?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
            Join thousands of developers who use MockMate to build confidence and land their dream jobs.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-extrabold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all hover:scale-[1.03] active:scale-[0.98] shadow-xl text-base"
          >
            Get Started — It&apos;s Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Free forever plan</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> AI-powered</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7: FOOTER                                                    */}
      {/* Simple footer with branding and navigation links                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-gray-200 dark:border-white/5 py-10 px-4 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-foreground font-bold text-sm">
            <Sparkles className="w-4 h-4 text-blue-500" />
            MockMate AI
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link href="/login" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Sign In</Link>
            <span>·</span>
            <span className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Privacy</span>
            <span>·</span>
            <span className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Terms</span>
          </div>
          <p className="text-xs text-gray-400">© 2025 MockMate. Built with ❤️ and Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}

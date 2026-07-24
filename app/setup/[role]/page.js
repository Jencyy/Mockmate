"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft, Play, BookOpen, Code2, Server, Layers,
  Database, Users, GraduationCap, Briefcase, CheckCircle, Clock, Hash,
} from "lucide-react";
import Link from "next/link";

// ─── Per-Role Configuration ────────────────────────────────────────────────────
const ROLE_CONFIG = {
  "Frontend Developer": {
    icon: Code2,
    tagline: "HTML · CSS · JavaScript · Frameworks",
    description: "Practice the exact questions real frontend interviewers ask — from React hooks and closures to browser performance and CSS layout.",
    categories: ["React", "JavaScript", "CSS & HTML", "Performance", "TypeScript", "General"],
    tips: [
      { label: "Explain the WHY", sub: "Not just what a thing is, but why it exists" },
      { label: "Mention real projects", sub: "Ground every answer in something you built" },
      { label: "Discuss trade-offs", sub: "Every tech decision has pros and cons" },
    ],
  },
  "Backend Developer": {
    icon: Server,
    tagline: "APIs · Databases · Auth · Security",
    description: "Get tested on REST APIs, database design, authentication flows, and the server-side fundamentals that backend engineers use every day.",
    categories: ["Node.js", "REST APIs", "Authentication", "Databases", "Security", "General"],
    tips: [
      { label: "Always handle errors", sub: "Interviewers notice when you skip this" },
      { label: "Think about scale", sub: "Will your solution work at 10x traffic?" },
      { label: "Give code examples", sub: "A snippet speaks louder than theory" },
    ],
  },
  "Full Stack Developer": {
    icon: Layers,
    tagline: "Frontend + Backend + System Design",
    description: "Full stack means owning the whole feature. Expect architecture decisions, SSR vs CSR trade-offs, state management, and end-to-end system thinking.",
    categories: ["System Design", "React + Node.js", "Databases", "DevOps", "Performance", "General"],
    tips: [
      { label: "Own the full feature", sub: "Show you can think from DB to UI" },
      { label: "Mention deployment", sub: "Talk about CI/CD, hosting, infra" },
      { label: "Know the handoffs", sub: "API contract between frontend & backend" },
    ],
  },
  "Database Admin": {
    icon: Database,
    tagline: "SQL · Indexing · Optimization · Recovery",
    description: "Practice DBA-level thinking: query optimization, indexing strategies, ACID transactions, and data modeling that handles real-world scale.",
    categories: ["SQL Queries", "Indexing", "Transactions", "Backup & Recovery", "Data Modeling", "General"],
    tips: [
      { label: "Explain the index trade-off", sub: "Fast reads, slower writes — say it" },
      { label: "Know ACID properties", sub: "Atomicity, Consistency, Isolation, Durability" },
      { label: "Think at scale", sub: "How does this work with 100M rows?" },
    ],
  },
  "HR Round": {
    icon: Users,
    tagline: "Behavioral · Situational · Personality",
    description: "HR rounds are about how you communicate, handle conflict, and fit the team. Practice with the STAR method and learn to tell your story confidently.",
    categories: ["Behavioral", "Situational", "Self-Reflection", "Career Goals", "Conflict Resolution", "General"],
    tips: [
      { label: "Use the STAR method", sub: "Situation → Task → Action → Result" },
      { label: "Be honest, not perfect", sub: "Authenticity beats a rehearsed script" },
      { label: "Show you did research", sub: "Mention the company specifically" },
    ],
  },
  "Learning & Explanations": {
    icon: GraduationCap,
    tagline: "Beginner-friendly concepts with real examples",
    description: "Every question starts with a simple analogy explaining the concept — then asks you to answer in your own words. Learn by doing, at your own pace.",
    categories: ["Web Basics", "JavaScript Fundamentals", "How the Internet Works", "Git & Tools", "Career Concepts", "General"],
    tips: [
      { label: "Read the hint first", sub: "Each question includes a concept explanation" },
      { label: "Use your own words", sub: "Paraphrasing is better than memorizing" },
      { label: "Wrong answers are OK", sub: "The ideal answer is shown right after" },
    ],
  },
  "Corporate Jargon": {
    icon: Briefcase,
    tagline: "Office buzzwords · Slang · Workplace vocabulary",
    description: "Not a quiz — this is a glossary. We generate 5 real corporate buzzwords with plain-English meanings and realistic office usage examples. Perfect for anyone joining a corporate team.",
    categories: [],
    tips: [
      { label: "Read each term slowly", sub: "Let the meaning sink in before moving on" },
      { label: "Try it in a sentence", sub: "Mental practice makes it stick" },
      { label: "Regenerate for more", sub: "Click 'Load Different Words' anytime" },
    ],
  },
};

const DIFFICULTY_CONFIG = {
  Easy: {
    label: "Easy",
    sub: "Core concepts & definitions",
    active: "border-gray-900 dark:border-white ring-1 ring-gray-900 dark:ring-white bg-gray-50 dark:bg-white/5",
    inactive: "text-gray-500 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20",
    dot: "bg-green-500",
  },
  Medium: {
    label: "Medium",
    sub: "Real interview questions",
    active: "border-gray-900 dark:border-white ring-1 ring-gray-900 dark:ring-white bg-gray-50 dark:bg-white/5",
    inactive: "text-gray-500 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20",
    dot: "bg-blue-500",
  },
  Hard: {
    label: "Hard",
    sub: "Senior / expert level",
    active: "border-gray-900 dark:border-white ring-1 ring-gray-900 dark:ring-white bg-gray-50 dark:bg-white/5",
    inactive: "text-gray-500 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20",
    dot: "bg-red-500",
  },
};

export default function SetupPage() {
  const { role } = useParams();
  const router = useRouter();
  const decodedRole = decodeURIComponent(role);

  const config = ROLE_CONFIG[decodedRole] || ROLE_CONFIG["Frontend Developer"];
  const isJargon = decodedRole === "Corporate Jargon";
  const Icon = config.icon;

  const defaultCategory = config.categories[0] || "General";
  const defaultDifficulty = "Medium";

  const [category, setCategory] = useState(defaultCategory);
  const [difficulty, setDifficulty] = useState(defaultDifficulty);

  const handleStart = () => {
    router.push(
      `/interview/${role}?category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(difficulty)}`
    );
  };

  return (
    <div className="flex-1 min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* ── Back link ──────────────────────────────────────────────────────── */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ════════════════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN — main config                                           */}
          {/* ════════════════════════════════════════════════════════════════════ */}
          <div className="space-y-5">

            {/* ── Role Header Card ─────────────────────────────────────────────── */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent">
              <div className="flex items-start gap-5 p-7">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <Icon className="w-5 h-5 text-gray-900 dark:text-white" strokeWidth={2} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-1">
                    {config.tagline}
                  </p>
                  <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                    {decodedRole}
                  </h1>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                    {config.description}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Jargon: no config needed ─────────────────────────────────────── */}
            {isJargon ? (
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-6">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-gray-900 dark:text-white flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Glossary mode — no setup needed</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      We&apos;ll generate 5 fresh office buzzwords with plain-English meanings and realistic usage sentences. Just hit Start.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* ── Topic Selector ─────────────────────────────────────────── */}
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent p-6">
                  <div className="mb-5">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                      Topic focus
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Questions will be tailored to this specific area
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {config.categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all duration-150 ${
                          category === c
                            ? "bg-gray-900 text-white dark:bg-white dark:text-black border-transparent"
                            : "bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Difficulty Selector ─────────────────────────────────────── */}
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent p-6">
                  <div className="mb-5">
                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                      Difficulty
                    </h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      How hard should the AI make the questions?
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {["Easy", "Medium", "Hard"].map((d) => {
                      const dc = DIFFICULTY_CONFIG[d];
                      const isActive = difficulty === d;
                      return (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={`relative flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl border text-sm font-bold transition-all duration-150 ${
                            isActive ? dc.active : dc.inactive
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isActive ? dc.dot : "bg-gray-300 dark:bg-gray-600"}`} />
                          <span className={isActive ? "text-gray-900 dark:text-white" : ""}>{dc.label}</span>
                          <span className={`text-[10px] font-normal leading-tight text-center ${isActive ? "text-gray-500 dark:text-gray-400" : ""}`}>
                            {dc.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ── Start Button ────────────────────────────────────────────────── */}
            <button
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-bold text-base text-white dark:text-black bg-gray-900 dark:bg-white hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              {isJargon ? "Start Learning" : `Start Interview`}
            </button>

            {!isJargon && (
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 -mt-1">
                5 questions · 3 min timer each · Correct answer shown after every submission
              </p>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN — tips + session summary                               */}
          {/* ════════════════════════════════════════════════════════════════════ */}
          <div className="space-y-5">

            {/* ── Tips Card ───────────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                How to ace this
              </p>
              <div className="space-y-3">
                {config.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-3 h-3 text-gray-900 dark:text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{tip.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{tip.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Session Summary Card ─────────────────────────────────────────── */}
            {!isJargon && (
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                  Session summary
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Role", value: decodedRole },
                    { label: "Topic", value: category },
                    { label: "Difficulty", value: difficulty },
                    { label: "Questions", value: "5 total", icon: Hash },
                    { label: "Timer", value: "3 min / question", icon: Clock },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white text-right max-w-[55%] truncate">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── What happens next blurb ──────────────────────────────────────── */}
            <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                {isJargon
                  ? "A glossary of 5 buzzwords will be generated. You can reload for more terms any time."
                  : "After each answer you'll see the ideal response. At the end, AI gives you a score and detailed feedback on every question."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

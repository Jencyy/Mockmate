"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, PlayCircle, Settings2, BookOpen } from "lucide-react";
import Link from "next/link";

const categories = ["React", "Node.js", "DSA", "System Design", "General"];
const difficulties = ["Easy", "Medium", "Hard"];

export default function SetupPage() {
  const { role } = useParams();
  const router = useRouter();
  const decodedRole = decodeURIComponent(role);
  const isJargon = decodedRole === "Corporate Jargon";

  const [category, setCategory] = useState("General");
  const [difficulty, setDifficulty] = useState("Medium");

  const handleStart = () => {
    router.push(`/interview/${role}?category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(difficulty)}`);
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 transition-colors duration-300">    
      <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-2 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden transition-colors">
        {/* Background glow styling */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center border border-purple-200 dark:border-purple-500/30 transition-colors">
              {isJargon ? (
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              ) : (
                <Settings2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground transition-colors">
                {isJargon ? "Corporate Jargon Glossary" : `${decodedRole} Interview`}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                {isJargon ? "Review vocabulary and context usage" : "Configure your interview settings"}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {isJargon ? (
              /* Custom layout for corporate jargon */
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/15 text-gray-700 dark:text-gray-300 space-y-4 transition-colors">
                <p className="text-lg font-medium text-foreground flex items-center gap-2">
                  💼 Professional Slang Study Guide
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Instead of a standard timed technical interview with answering and scoring, this mode runs as an interactive glossary. 
                  We will generate a list of 5 common corporate office terms, their clear definitions, and realistic usage scenarios.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Take your time, read through the terms, and regenerate whenever you want to learn more buzzwords.
                </p>
              </div>
            ) : (
              /* Standard interview category/difficulty options */
              <>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 transition-colors">Select Category</h3>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-6 py-3 rounded-xl border font-medium transition-all ${
                          category === c 
                            ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-400 shadow-md dark:shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                            : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 transition-colors">Select Difficulty</h3>
                  <div className="flex flex-wrap gap-3">
                    {difficulties.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`px-6 py-3 rounded-xl border font-medium transition-all ${
                          difficulty === d 
                            ? d === 'Hard' ? 'bg-red-500 text-white border-red-500 dark:border-red-400 shadow-md dark:shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                              : d === 'Medium' ? 'bg-yellow-400 dark:bg-yellow-500 text-black border-yellow-500 dark:border-yellow-400 shadow-md dark:shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                              : 'bg-green-500 text-white border-green-500 dark:border-green-400 shadow-md dark:shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                            : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="pt-8 mt-8 border-t border-gray-200 dark:border-white/10 transition-colors">
              <button
                onClick={handleStart}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all text-lg cursor-pointer hover:scale-[1.02] shadow-xl duration-200"
              >
                {isJargon ? "Start Learning" : "Start Interview"}
                <PlayCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

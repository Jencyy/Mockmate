"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, PlayCircle, Settings2 } from "lucide-react";
import Link from "next/link";

const categories = ["React", "Node.js", "DSA", "System Design", "General"];
const difficulties = ["Easy", "Medium", "Hard"];

export default function SetupPage() {
  const { role } = useParams();
  const router = useRouter();
  const decodedRole = decodeURIComponent(role);

  const [category, setCategory] = useState("General");
  const [difficulty, setDifficulty] = useState("Medium");

  const handleStart = () => {
    router.push(`/interview/${role}?category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(difficulty)}`);
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
      <Link href="/dashboard" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Settings2 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{decodedRole} Interview</h1>
              <p className="text-gray-400 mt-1">Configure your interview settings</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Select Category</h3>
              <div className="flex flex-wrap gap-3">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-6 py-3 rounded-xl border font-medium transition-all ${
                      category === c 
                        ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Select Difficulty</h3>
              <div className="flex flex-wrap gap-3">
                {difficulties.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-6 py-3 rounded-xl border font-medium transition-all ${
                      difficulty === d 
                        ? d === 'Hard' ? 'bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                          : d === 'Medium' ? 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                          : 'bg-green-500 text-white border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-white/10">
              <button
                onClick={handleStart}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors text-lg"
              >
                Start Interview
                <PlayCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

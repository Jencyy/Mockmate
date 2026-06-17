// app/results/[id]/page.js
// This page displays the interview results and AI feedback with premium styling.

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, LayoutDashboard, WifiOff, RefreshCcw, Award } from "lucide-react";

export default async function ResultsPage({ params }) {
  const { id } = await params;

  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  let interview = null;
  let isOffline = false;

  // --- Case 1: Offline results (MongoDB was unavailable) ---
  if (id.startsWith("offline_")) {
    isOffline = true;
    try {
      const base64Data = id.replace("offline_", "");
      const standardBase64 = base64Data
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const padded = standardBase64 + "=".repeat((4 - standardBase64.length % 4) % 4);
      const decoded = JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
      interview = {
        role: decoded.role,
        category: decoded.category || "General",
        difficulty: decoded.difficulty || "Medium",
        totalScore: decoded.totalScore,
        questions: decoded.questions,
        createdAt: new Date(),
      };
    } catch (e) {
      console.error("Could not decode offline results:", e.message);
    }
  } else {
    // --- Case 2: Online results — fetch from MongoDB ---
    try {
      const connectToDatabase = (await import("@/lib/mongodb")).default;
      const { default: Interview } = await import("@/models/Interview");

      await connectToDatabase();
      interview = await Interview.findById(id).lean();

      // Security check
      if (interview && interview.userId.toString() !== session.user.id) {
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-background text-foreground min-h-screen transition-colors duration-300">
            <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">You do not have permission to view these results.</p>
          </div>
        );
      }
    } catch (e) {
      console.error("Could not fetch results from MongoDB:", e.message);
    }
  }

  // If we still have no interview data, show an error
  if (!interview) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-foreground min-h-screen transition-colors duration-300">
        <h1 className="text-2xl font-bold mb-4">Results Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Could not load your interview results.</p>
        <Link href="/dashboard" className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Decorative gradient meshes */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Offline Warning Banner */}
        {isOffline && (
          <div className="mb-8 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 flex items-center gap-3 text-yellow-800 dark:text-yellow-300 backdrop-blur-md transition-colors">
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Offline Mode:</strong> These results were not saved to the database because MongoDB is currently unavailable.
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row items-start justify-between gap-8 border-b border-gray-200 dark:border-white/10 pb-8 transition-colors">
          <div>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-2 mb-4 transition-colors text-sm font-medium">
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight transition-colors">
              {interview.role} Evaluation
            </h1>
            
            <div className="flex items-center gap-2.5 mt-3 flex-wrap">
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-white/5 font-semibold transition-colors">
                {interview.category || "General"}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border transition-colors ${interview.difficulty === 'Hard' ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' : interview.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20' : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'}`}>
                {interview.difficulty || "Medium"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 transition-colors">
                Completed {new Date(interview.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Total Score Badge Card */}
          <div className="bg-gradient-to-br from-blue-50 dark:from-blue-500/10 to-purple-50 dark:to-purple-500/10 border border-gray-200 dark:border-white/15 p-6 rounded-2xl text-center shadow-xl dark:shadow-[0_0_40px_rgba(59,130,246,0.15)] flex-shrink-0 w-full md:w-auto relative overflow-hidden group transition-colors">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-1.5 flex items-center justify-center gap-1 transition-colors">
              <Award className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> Overall Score
            </p>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 tracking-tighter">
              {interview.totalScore}
              <span className="text-2xl text-gray-400 dark:text-gray-500 font-medium">/10</span>
            </div>
          </div>
        </div>

        {/* Per-Question Feedback */}
        <h2 className="text-xl font-bold text-foreground mb-6 tracking-wide transition-colors">Detailed AI Feedback</h2>

        <div className="space-y-6">
          {interview.questions.map((q, index) => (
            <div key={index} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 hover:shadow-2xl dark:hover:bg-white/[0.08] hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
              
              <div className="flex items-start justify-between gap-4 mb-6">
                <h3 className="text-lg font-bold text-foreground leading-snug transition-colors">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">Q{index + 1}:</span>
                  {q.questionText}
                </h3>
                <div className="flex-shrink-0 bg-blue-50 dark:bg-black/50 px-3.5 py-1.5 rounded-xl border border-blue-200 dark:border-white/5 font-mono font-bold text-base text-blue-600 dark:text-blue-400 transition-colors">
                  {q.aiScore}/10
                </div>
              </div>

              <div className="mb-6">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold block mb-2 transition-colors">Your Answer</span>
                <div className="bg-gray-50 dark:bg-black/40 rounded-xl p-4 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/5 leading-relaxed text-sm font-sans whitespace-pre-line transition-colors">
                  {q.userAnswer || <span className="text-gray-400 dark:text-gray-500 italic">No answer provided</span>}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 uppercase tracking-widest font-bold block mb-2 flex items-center gap-1.5 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" /> AI feedback evaluation
                </span>
                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-4 text-purple-900 dark:text-purple-100 border border-purple-200 dark:border-purple-500/20 leading-relaxed text-sm transition-colors">
                  {q.aiFeedback}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/interview/${encodeURIComponent(interview.role)}?category=${encodeURIComponent(interview.category || 'General')}&difficulty=${encodeURIComponent(interview.difficulty || 'Medium')}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-purple-500/20 text-sm cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4" />
            Retake Interview
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-white/5 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm text-sm cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

// app/results/[id]/page.js
// This page displays the interview results and AI feedback.
// It handles two cases:
//   1. "online" - results were saved to MongoDB, we fetch by ID
//   2. "offline_..." - MongoDB was unavailable, results are encoded in the URL itself

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, LayoutDashboard, WifiOff, RefreshCcw } from "lucide-react";

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
  // The ID will start with "offline_" followed by base64-encoded JSON
  if (id.startsWith("offline_")) {
    isOffline = true;
    try {
      const base64Data = id.replace("offline_", "");
      // Reverse the URL-safe encoding: -→+, _→/, then add back = padding
      const standardBase64 = base64Data
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      // Add = padding back so Buffer can decode it correctly (base64 length must be multiple of 4)
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
      // .lean() converts the Mongoose document to a plain JS object (needed for React props)
      interview = await Interview.findById(id).lean();

      // Security check: make sure this interview belongs to the logged-in user
      if (interview && interview.userId.toString() !== session.user.id) {
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-black text-white">
            <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
            <p className="text-gray-400">You do not have permission to view these results.</p>
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
      <div className="flex-1 flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-2xl font-bold mb-4">Results Not Found</h1>
        <p className="text-gray-400 mb-6">Could not load your interview results.</p>
        <Link href="/dashboard" className="text-blue-400 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-black min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Offline Warning Banner */}
        {isOffline && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3 text-yellow-300">
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              <strong>Offline Mode:</strong> These results were not saved to the database because MongoDB is currently unavailable. Fix your Atlas IP whitelist to enable saving.
            </p>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link href="/dashboard" className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">{interview.role} Interview Results</h1>
            <div className="flex gap-2 mb-2">
              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">{interview.category || "General"}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${interview.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' : interview.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {interview.difficulty || "Medium"}
              </span>
            </div>
            <p className="text-gray-400">
              Completed on {new Date(interview.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Total Score */}
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 p-6 rounded-2xl text-center shadow-2xl flex-shrink-0">
            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-1">Total Score</p>
            <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              {interview.totalScore}
              <span className="text-2xl text-gray-500">/10</span>
            </div>
          </div>
        </div>

        {/* Per-Question Feedback */}
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Detailed Feedback</h2>

        <div className="space-y-8">
          {interview.questions.map((q, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/10 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h3 className="text-xl font-semibold text-white leading-relaxed">
                  <span className="text-blue-400 mr-2">Q{index + 1}:</span>
                  {q.questionText}
                </h3>
                <div className="flex-shrink-0 bg-black/50 px-4 py-2 rounded-lg border border-white/5 font-bold text-lg text-white">
                  {q.aiScore}/10
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Your Answer</p>
                <div className="bg-black/30 rounded-lg p-4 text-gray-300 border border-white/5 leading-relaxed">
                  {q.userAnswer || <span className="text-gray-500 italic">No answer provided</span>}
                </div>
              </div>

              <div>
                <p className="text-sm text-purple-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> AI Feedback
                </p>
                <div className="bg-purple-500/10 rounded-lg p-4 text-purple-100 border border-purple-500/20 leading-relaxed">
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 hover:scale-105 transition-all shadow-lg shadow-purple-500/25"
          >
            <RefreshCcw className="w-5 h-5" />
            Retake Interview
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

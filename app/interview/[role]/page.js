"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Loader2, Send, BrainCircuit, Clock, AlertCircle,
  BookOpen, RefreshCw, ChevronLeft, CheckCircle2,
  Lightbulb, ChevronRight
} from "lucide-react";
import Link from "next/link";

// ─── Helper: extract question text from object or string ─────────────────────
function getQuestionText(q) {
  if (!q) return "";
  if (typeof q === "string") return q;
  return q.question || q.questionText || "";
}

function getCorrectAnswer(q) {
  if (!q || typeof q === "string") return "";
  return q.correctAnswer || "";
}

// ─── Under Review Panel — shown after each answer is submitted ─────────────────
function UnderReviewPanel({ question, userAnswer, correctAnswer, onNext, isLast }) {
  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-full text-xs font-bold mb-4">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Answer Submitted — Under Review
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed transition-colors">
          {getQuestionText(question)}
        </h2>
      </div>

      <div className="space-y-5">
        {/* User's Answer */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 transition-colors">
          <span className="text-[10px] tracking-widest text-gray-500 dark:text-gray-400 uppercase font-bold block mb-3">
            Your Answer
          </span>
          <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-line transition-colors">
            {userAnswer?.trim() || <span className="italic text-gray-400 dark:text-gray-500">No answer provided</span>}
          </p>
        </div>

        {/* Correct / Model Answer */}
        {correctAnswer && (
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-6 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] tracking-widest text-blue-600 dark:text-blue-400 uppercase font-bold">
                Ideal Answer — What You Should Know
              </span>
            </div>
            <p className="text-blue-900 dark:text-blue-100 text-sm leading-relaxed whitespace-pre-line transition-colors">
              {correctAnswer}
            </p>
          </div>
        )}

        {/* Hint note */}
        <p className="text-xs text-center text-gray-400 dark:text-gray-500 transition-colors">
          Compare your answer with the ideal one above. You'll get detailed AI scoring at the end.
        </p>
      </div>

      {/* Next / Submit button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer shadow-md shadow-blue-500/20"
        >
          {isLast ? "Submit & Get AI Score" : "Next Question"}
          {isLast ? <Send className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Main Interview Content ────────────────────────────────────────────────────
function InterviewContent() {
  const { role } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const decodedRole = decodeURIComponent(role);
  const category = searchParams.get("category") || "General";
  const difficulty = searchParams.get("difficulty") || "Medium";

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [source, setSource] = useState("ai");
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // After submitting an answer, show the "Under Review" panel before moving on
  const [showReview, setShowReview] = useState(false);
  const [reviewData, setReviewData] = useState(null);

  const isJargon = decodedRole === "Corporate Jargon";

  // Timer (3 minutes per question)
  const TIMER_SECONDS = 180;
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // ── Fetch questions on mount ────────────────────────────────────────────────
  useEffect(() => {
    async function fetchQuestions() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: decodedRole, category, difficulty }),
        });
        const data = await res.json();
        setQuestions(data.questions || []);
        setSource(data.source || "ai");
      } catch (error) {
        console.error("Failed to fetch questions", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchQuestions();
    }
  }, [decodedRole, category, difficulty, status, fetchTrigger]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isJargon || isLoading || isEvaluating || showReview || questions.length === 0) return;
    if (timeLeft <= 0) {
      handleSubmitAnswer();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isLoading, isEvaluating, showReview, questions.length, isJargon]);

  // ── Handle answer submit (shows review panel before moving on) ────────────
  const handleSubmitAnswer = () => {
    const currentQ = questions[currentIndex];
    const questionText = getQuestionText(currentQ);
    const correctAnswer = getCorrectAnswer(currentQ);

    // Save answer
    const newAnswers = [
      ...answers,
      { questionText, userAnswer: currentAnswer, correctAnswer },
    ];
    setAnswers(newAnswers);

    // Show review panel
    setReviewData({
      question: currentQ,
      userAnswer: currentAnswer,
      correctAnswer,
      isLast: currentIndex >= questions.length - 1,
      allAnswers: newAnswers,
    });
    setShowReview(true);
    setCurrentAnswer("");
    setTimeLeft(TIMER_SECONDS);
  };

  // ── Handle "Next" from review panel ───────────────────────────────────────
  const handleNextFromReview = async () => {
    setShowReview(false);
    setReviewData(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All questions done — evaluate
      setIsEvaluating(true);
      try {
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: decodedRole,
            category,
            difficulty,
            questions: reviewData?.allAnswers || answers,
          }),
        });
        const data = await res.json();
        if (data.interviewId) {
          router.push(`/results/${data.interviewId}`);
        } else {
          alert("Something went wrong during evaluation.");
          setIsEvaluating(false);
        }
      } catch (error) {
        console.error("Evaluation failed", error);
        setIsEvaluating(false);
      }
    }
  };

  const handleRegenerateJargon = () => setFetchTrigger((prev) => prev + 1);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const parseJargonItem = (q) => {
    if (!q) return { word: "", meaning: "", usage: "" };
    if (typeof q === "object" && q.word) return q;
    const str = String(q);
    const colonIndex = str.indexOf(":");
    if (colonIndex !== -1) {
      return {
        word: str.substring(0, colonIndex).trim(),
        meaning: str.substring(colonIndex + 1).trim(),
        usage: "",
      };
    }
    return { word: str, meaning: "A common corporate jargon phrase.", usage: "" };
  };

  // ── Loading states ─────────────────────────────────────────────────────────
  if (status === "loading" || isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background min-h-screen transition-colors duration-300">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin absolute -top-6 -left-6 opacity-30" />
          {isJargon ? (
            <BookOpen className="w-12 h-12 text-purple-500 dark:text-purple-400 animate-pulse relative z-10" />
          ) : (
            <BrainCircuit className="w-12 h-12 text-blue-500 dark:text-blue-400 animate-pulse relative z-10" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-foreground mt-8 tracking-tight transition-colors">
          {isJargon ? "Curating Jargon Glossary..." : "Generating questions..."}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-sm text-center transition-colors">
          {isJargon
            ? "Gathering office buzzwords and usage examples."
            : `Tailoring ${difficulty} questions for ${decodedRole} (${category}).`}
        </p>
      </div>
    );
  }

  if (isEvaluating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background min-h-screen transition-colors duration-300">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-foreground transition-colors">
          Evaluating your answers...
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm transition-colors">
          AI is analyzing your responses and generating honest feedback.
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-foreground p-4 transition-colors duration-300">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold">Failed to load questions</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-center text-sm transition-colors">
          Please check your API configuration and try again.
        </p>
        <button
          onClick={handleRegenerateJargon}
          className="mt-4 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ── Under Review Panel ────────────────────────────────────────────────────── */
  if (showReview && reviewData) {
    return (
      <UnderReviewPanel
        question={reviewData.question}
        userAnswer={reviewData.userAnswer}
        correctAnswer={reviewData.correctAnswer}
        onNext={handleNextFromReview}
        isLast={reviewData.isLast}
      />
    );
  }

  /* ── Corporate Jargon Glossary ────────────────────────────────────────────── */
  if (isJargon) {
    return (
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 flex flex-col transition-colors duration-300">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200 dark:border-white/10 pb-8 transition-colors">
          <div>
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-2 mb-4 transition-colors text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3 transition-colors">
              Corporate Jargon
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">
                Glossary
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm transition-colors">
              Office buzzwords with plain-English meanings and real workplace examples.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRegenerateJargon}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-white/5 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm text-sm"
            >
              <RefreshCw className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              Load Different Words
            </button>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 text-white hover:bg-purple-700 font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-purple-500/20 text-sm"
            >
              Finish Study
            </Link>
          </div>
        </div>

        {source === "fallback" && (
          <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl text-orange-600 dark:text-orange-400 flex items-start gap-3 transition-colors">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Offline Mode: Using Curated Slang Bank</p>
              <p className="text-xs opacity-90 mt-1">
                AI generation is unavailable. Showing our curated dictionary instead.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {questions.map((q, idx) => {
            const { word, meaning, usage } = parseJargonItem(q);
            return (
              <div
                key={idx}
                className="group relative bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 hover:bg-gray-50 dark:hover:bg-white/[0.08] hover:border-gray-300 dark:hover:border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-l-2xl opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="pl-3 md:pl-4">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {word}
                  </h3>
                  <div className="mt-4">
                    <span className="text-[10px] tracking-widest text-purple-600 dark:text-purple-400 font-bold uppercase block mb-1 transition-colors">
                      Meaning
                    </span>
                    <p className="text-gray-700 dark:text-gray-200 text-base leading-relaxed transition-colors">
                      {meaning}
                    </p>
                  </div>
                  {usage && (
                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5 transition-colors">
                      <span className="text-[10px] tracking-widest text-blue-600 dark:text-blue-400 font-bold uppercase block mb-1.5 transition-colors">
                        How to use it
                      </span>
                      <div className="bg-gray-100 dark:bg-black/40 rounded-xl p-4 border border-gray-200 dark:border-white/5 text-gray-800 dark:text-gray-300 leading-relaxed text-sm italic font-mono transition-colors">
                        &ldquo;{usage}&rdquo;
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Standard Interview Session ───────────────────────────────────────────── */
  const isLowTime = timeLeft <= 30;
  const currentQ = questions[currentIndex];

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground transition-colors">
              {decodedRole} Interview
            </h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border transition-colors ${
                difficulty === "Hard"
                  ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
                  : difficulty === "Easy"
                  ? "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20"
                  : "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20"
              }`}
            >
              {difficulty}
            </span>
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-white/5 transition-colors">
              {category}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-base font-bold border transition-all ${
              isLowTime
                ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30 animate-pulse"
                : "bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 shadow-sm"
            }`}
          >
            <Clock className={`w-4 h-4 ${isLowTime ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`} />
            {formatTime(timeLeft)}
          </div>

          {/* Progress bar */}
          <div className="w-32 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timer progress bar */}
      <div className="w-full h-1 bg-gray-200 dark:bg-white/5 mb-8 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 linear ${isLowTime ? "bg-red-500" : "bg-blue-500"}`}
          style={{ width: `${(timeLeft / TIMER_SECONDS) * 100}%` }}
        />
      </div>

      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-10 shadow-xl relative overflow-hidden group transition-colors">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-700 pointer-events-none" />

        {source === "fallback" && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl text-orange-600 dark:text-orange-400 flex items-start gap-3 transition-colors">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Using Standard Questions</p>
              <p className="text-xs opacity-90 mt-1">
                AI generation failed (invalid API key or network issue). Using static questions instead.
              </p>
            </div>
          </div>
        )}

        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8 leading-relaxed transition-colors">
          {getQuestionText(currentQ)}
        </h2>

        {isLowTime && (
          <div className="mb-4 text-sm text-red-500 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Time is almost up! Your answer will auto-submit.
          </div>
        )}

        <div className="relative z-10">
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here. Include definitions, real examples, and key concepts where applicable..."
            className={`w-full h-48 bg-gray-50 dark:bg-black/60 border rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 resize-none transition-all text-sm leading-relaxed ${
              isLowTime
                ? "border-red-300 dark:border-red-500/30 focus:ring-red-500"
                : "border-gray-200 dark:border-white/10 focus:ring-purple-500"
            }`}
          />
          <div className="absolute bottom-4 right-4 text-xs text-gray-400 dark:text-gray-500">
            {currentAnswer.length} characters
          </div>
        </div>

        <div className="mt-8 flex justify-end relative z-10">
          <button
            onClick={handleSubmitAnswer}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer shadow-md shadow-blue-500/20"
          >
            Submit Answer
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center bg-background min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <InterviewContent />
    </Suspense>
  );
}

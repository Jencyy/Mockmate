"use client";

// app/interview/[role]/page.js
// This page handles the actual mock interview experience.
// It fetches questions, displays them one by one, collects answers,
// and submits the final answers for evaluation.

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Send, BrainCircuit, Clock, AlertCircle } from "lucide-react";

function InterviewContent() {
  const { role } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  
  const decodedRole = decodeURIComponent(role);
  const category = searchParams.get('category') || 'General';
  const difficulty = searchParams.get('difficulty') || 'Medium';

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [source, setSource] = useState("ai");
  
  // Timer state (3 minutes = 180 seconds)
  const TIMER_SECONDS = 180;
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchQuestions() {
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
  }, [decodedRole, category, difficulty, status]);

  // Timer effect
  useEffect(() => {
    if (isLoading || isEvaluating || questions.length === 0) return;

    if (timeLeft <= 0) {
      handleNext();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isLoading, isEvaluating, questions.length]);

  const handleNext = async () => {
    const newAnswers = [...answers, { questionText: questions[currentIndex], userAnswer: currentAnswer }];
    setAnswers(newAnswers);
    setCurrentAnswer(""); 
    setTimeLeft(TIMER_SECONDS); // reset timer

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsEvaluating(true);
      try {
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: decodedRole, category, difficulty, questions: newAnswers }), 
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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black">
        <BrainCircuit className="w-12 h-12 text-blue-500 animate-pulse mb-4" />
        <h2 className="text-xl font-semibold text-white">Generating your interview questions...</h2>
        <p className="text-gray-400 mt-2">Tailoring {difficulty} questions for a {decodedRole} ({category}).</p>
      </div>
    );
  }

  if (isEvaluating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-white">Evaluating your answers...</h2>
        <p className="text-gray-400 mt-2">The AI is analyzing your responses and generating honest feedback.</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="text-center text-white mt-20">Failed to load questions. Please try again.</div>;
  }

  const isLowTime = timeLeft <= 30;

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{decodedRole} Interview</h1>
            <span className={`text-xs px-2 py-1 rounded-full ${difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' : difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{difficulty}</span>
            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">{category}</span>
          </div>
          <p className="text-gray-400">Question {currentIndex + 1} of {questions.length}</p>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Timer Display */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold border transition-colors ${isLowTime ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse' : 'bg-white/5 text-gray-300 border-white/10'}`}>
            <Clock className={`w-5 h-5 ${isLowTime ? 'text-red-400' : 'text-gray-400'}`} />
            {formatTime(timeLeft)}
          </div>
          
          <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Timer Progress Bar */}
      <div className="w-full h-1 bg-white/5 mb-8 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 linear ${isLowTime ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${(timeLeft / TIMER_SECONDS) * 100}%` }}
        ></div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-700"></div>
        
        {source === "fallback" && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-400 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Using Standard Questions</p>
              <p className="text-sm opacity-90 mt-1">AI generation failed (likely due to an invalid API key). Using static fallback questions instead.</p>
            </div>
          </div>
        )}

        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8 leading-relaxed">
          {questions[currentIndex]}
        </h2>

        {isLowTime && (
          <div className="mb-4 text-sm text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Time is almost up! Your answer will auto-submit.
          </div>
        )}

        <div className="relative z-10">
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className={`w-full h-48 bg-black/50 border rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 resize-none transition-all ${isLowTime ? 'border-red-500/30 focus:ring-red-500' : 'border-white/10 focus:ring-purple-500'}`}
          />
          <div className="absolute bottom-4 right-4 text-xs text-gray-500">
            {currentAnswer.length} characters
          </div>
        </div>

        <div className="mt-8 flex justify-end relative z-10">
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            {currentIndex < questions.length - 1 ? "Next Question" : "Submit Interview"}
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex flex-col items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <InterviewContent />
    </Suspense>
  );
}

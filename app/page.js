// app/page.js
// This is the main landing page.
// We make it a beautiful, responsive, animated entry point for the app.

import Link from "next/link";
import { ArrowRight, BrainCircuit, LineChart, Timer } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden relative">
      {/* Hero Section */}
      <section className="relative px-4 pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pb-32 flex-1 flex flex-col justify-center">
        {/* Background Gradients to create a premium "glow" effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-8 leading-tight">
            Master your next interview <br className="hidden sm:block" /> with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">AI</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Practice real technical interviews tailored to your role. Get instant feedback, detailed scores, and improve your skills before the real thing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Call to Action Button */}
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Start Practicing Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/[0.02] border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why use MockMate AI?</h2>
            <p className="text-gray-400 text-lg">Everything you need to confidently land your dream job.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-xl">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-6">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Questions</h3>
              <p className="text-gray-400 leading-relaxed">
                Get dynamic, role-specific questions generated instantly. No two interviews are exactly the same.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-xl">
              <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center mb-6">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Instant Feedback</h3>
              <p className="text-gray-400 leading-relaxed">
                Receive detailed evaluations on every answer with actionable tips to improve your responses.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-xl">
              <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center mb-6">
                <Timer className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Track Progress</h3>
              <p className="text-gray-400 leading-relaxed">
                Save your interview history and watch your scores improve over time on your personalized dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

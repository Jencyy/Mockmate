// app/dashboard/page.js
// This is the user dashboard, now a Server Component to securely fetch data directly from MongoDB.
// This is faster and more secure than writing a separate API route.

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Code, Server, Layout, Database, PlayCircle, LineChart, Calendar, ChevronRight, BookOpen, Briefcase } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import Interview from "@/models/Interview";

export default async function DashboardPage() {
  // Check if the user is authenticated securely on the server
  const session = await getServerSession(authOptions);

  // If the user is unauthenticated, redirect them to the login page.
  if (!session) {
    redirect("/login");
  }

  let pastInterviews = [];
  try {
    await connectToDatabase();
    pastInterviews = await Interview.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();
  } catch (error) { 
    console.error("Dashboard: Could not connect to MongoDB:", error.message);
  }

  // Define the available roles for interviews with descriptions
  const jobRoles = [
    { 
      id: "Frontend Developer", 
      name: "Frontend Developer", 
      icon: Layout, 
      color: "text-blue-600 dark:text-blue-400", 
      bg: "bg-blue-100 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-500/20",
      description: "Practice topics like React, CSS Grid, Virtual DOM, and web performance optimization."
    },
    { 
      id: "Backend Developer", 
      name: "Backend Developer", 
      icon: Server, 
      color: "text-green-600 dark:text-green-400", 
      bg: "bg-green-100 dark:bg-green-500/10",
      border: "border-green-200 dark:border-green-500/20",
      description: "Prepare for SQL vs NoSQL, Express middleware, authentication, and index strategies."
    },
    { 
      id: "Full Stack Developer", 
      name: "Full Stack Developer", 
      icon: Code, 
      color: "text-purple-600 dark:text-purple-400", 
      bg: "bg-purple-100 dark:bg-purple-500/10",
      border: "border-purple-200 dark:border-purple-500/20",
      description: "Master architecture scaling, rendering options (SSR/CSR), and state design."
    },
    { 
      id: "Database Admin", 
      name: "Database Admin", 
      icon: Database, 
      color: "text-orange-600 dark:text-orange-400", 
      bg: "bg-orange-100 dark:bg-orange-500/10",
      border: "border-orange-200 dark:border-orange-500/20",
      description: "Test queries on ACID transactions, indices, relational joins, and database scaling."
    },
    { 
      id: "Learning & Explanations", 
      name: "Learning & Explanations", 
      icon: BookOpen, 
      color: "text-teal-600 dark:text-teal-400", 
      bg: "bg-teal-100 dark:bg-teal-500/10",
      border: "border-teal-200 dark:border-teal-500/20",
      description: "Excellent for beginners. Explains complex terms simply before asking questions."
    },
    { 
      id: "Corporate Jargon", 
      name: "Corporate Jargon", 
      icon: Briefcase, 
      color: "text-pink-600 dark:text-pink-400", 
      bg: "bg-pink-100 dark:bg-pink-500/10",
      border: "border-pink-200 dark:border-pink-500/20",
      description: "Learn office terms and business buzzwords with meanings and context usage."
    },
  ];

  const totalInterviews = pastInterviews.length;
  const averageScore = totalInterviews > 0
    ? (pastInterviews.reduce((acc, curr) => acc + (curr.totalScore || 0), 0) / totalInterviews).toFixed(1)
    : 0;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden transition-colors duration-300">
      {/* Decorative gradient glowing mesh */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="mb-10 relative z-10">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl mb-2 transition-colors">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Developer'}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base transition-colors">
          Select a track below to start your AI mock interview or practice corporate communication vocabulary.
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl hover:border-gray-300 dark:hover:border-white/15 transition-all">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-2">Total Interviews</p>
          <p className="text-4xl font-extrabold text-foreground">{totalInterviews}</p>
        </div>
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl hover:border-gray-300 dark:hover:border-white/15 transition-all relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-100 dark:bg-blue-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform"></div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-2">Average Score</p>
          <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            {averageScore} <span className="text-lg text-gray-400 dark:text-gray-500 font-medium">/10</span>
          </p>
        </div>
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl hover:border-gray-300 dark:hover:border-white/15 transition-all">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-2">Last Activity</p>
          <p className="text-xl font-bold text-foreground mt-1">
            {totalInterviews > 0 ? new Date(pastInterviews[0].createdAt).toLocaleDateString() : "No activity recorded"}
          </p>
        </div>
      </div>

      {/* Role Selection Grid */}
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-foreground mb-6 tracking-wide transition-colors">Available Study Tracks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobRoles.map((role) => {
            const Icon = role.icon;
            const isJargon = role.id === "Corporate Jargon";
            return (
              <Link 
                href={`/setup/${encodeURIComponent(role.id)}`} 
                key={role.id}
                className="group relative p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:shadow-2xl hover:-translate-y-1 hover:border-gray-300 dark:hover:bg-white/[0.08] dark:hover:border-white/20 transition-all overflow-hidden shadow-xl flex flex-col justify-between"
              >
                {/* Decorative gradient blob that appears on hover */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-10 blur-2xl transition-all duration-500 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${role.border} ${role.bg} ${role.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-300 transition-all">
                    {role.name}
                  </h3>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-6 transition-colors">
                    {role.description}
                  </p>
                  
                  <div className="mt-auto pt-4 flex items-center text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    <span className="text-sm font-semibold">
                      {isJargon ? "Start Learning" : "Start Interview"}
                    </span>
                    <PlayCircle className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all" />
                  </div>
                </div>  
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Interview History Section */}
      <div className="mt-20 relative z-10">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 tracking-wide transition-colors">
          <LineChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Past Technical Interviews
        </h2>
        
        {pastInterviews.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center shadow-xl">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <LineChart className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1 transition-colors">No past sessions</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed transition-colors">
              Your completed mock interviews and feedback logs will appear here. Select a study track above to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastInterviews.map((interview) => (
              <Link 
                href={`/results/${interview._id}`} 
                key={interview._id.toString()}
                className="group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:shadow-2xl hover:border-gray-300 dark:hover:bg-white/[0.08] dark:hover:border-white/15 transition-all shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-foreground text-lg tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {interview.role}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {/* Score badge */}
                    <div className="bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-500/20">
                      {interview.totalScore}/10
                    </div>
                  </div>
                  
                  <div className="flex gap-2.5 mt-2 flex-wrap">
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded border border-gray-200 dark:border-white/5 font-semibold transition-colors">
                      {interview.category || "General"}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${interview.difficulty === 'Hard' ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' : interview.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20' : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'}`}>
                      {interview.difficulty || "Medium"}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
                  View full feedback
                  <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

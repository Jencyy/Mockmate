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

  // We wrap the database call in try/catch.
  // This means if MongoDB is unavailable (e.g., IP not whitelisted in Atlas),
  // the dashboard still loads — just with an empty interview history instead of crashing.
  let pastInterviews = [];
  try {
    await connectToDatabase();
    pastInterviews = await Interview.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();
  } catch (error) {
    // Log the error on the server but don't crash the page
    console.error("Dashboard: Could not connect to MongoDB:", error.message);
    // pastInterviews stays as empty array — the UI will show "No interviews yet"
  }

  // Define the available roles for interviews
  const jobRoles = [
    { id: "Frontend Developer", name: "Frontend Developer", icon: Layout, color: "text-blue-400", bg: "bg-blue-500/10" },
    { id: "Backend Developer", name: "Backend Developer", icon: Server, color: "text-green-400", bg: "bg-green-500/10" },
    { id: "Full Stack Developer", name: "Full Stack Developer", icon: Code, color: "text-purple-400", bg: "bg-purple-500/10" },
    { id: "Database Admin", name: "Database Admin", icon: Database, color: "text-orange-400", bg: "bg-orange-500/10" },
    { id: "Learning & Explanations", name: "Learning & Explanations", icon: BookOpen, color: "text-teal-400", bg: "bg-teal-500/10" },
    { id: "Corporate Jargon", name: "Corporate Jargon", icon: Briefcase, color: "text-pink-400", bg: "bg-pink-500/10" },
  ];

  const totalInterviews = pastInterviews.length;
  const averageScore = totalInterviews > 0
    ? (pastInterviews.reduce((acc, curr) => acc + (curr.totalScore || 0), 0) / totalInterviews).toFixed(1)
    : 0;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Developer'}! 👋
        </h1>
        <p className="text-gray-400">Select a role below to start your AI mock interview.</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
          <p className="text-sm text-gray-400 font-medium mb-1">Total Interviews</p>
          <p className="text-3xl font-bold text-white">{totalInterviews}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
          <p className="text-sm text-gray-400 font-medium mb-1">Average Score</p>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {averageScore} <span className="text-lg text-gray-500">/10</span>
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
          <p className="text-sm text-gray-400 font-medium mb-1">Last Activity</p>
          <p className="text-xl font-semibold text-white mt-1">
            {totalInterviews > 0 ? new Date(pastInterviews[0].createdAt).toLocaleDateString() : "No activity"}
          </p>
        </div>
      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {jobRoles.map((role) => {
          const Icon = role.icon;
          return (
            <Link 
              href={`/setup/${encodeURIComponent(role.id)}`} 
              key={role.id}
              className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all overflow-hidden shadow-xl"
            >
              {/* Decorative gradient blob that appears on hover */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${role.bg} ${role.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">{role.name}</h3>
                
                <div className="mt-auto pt-6 flex items-center text-gray-400 group-hover:text-white transition-colors">
                  <span className="text-sm font-medium">Start Interview</span>
                  <PlayCircle className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Interview History Section */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <LineChart className="w-6 h-6 text-purple-400" />
          Past Interviews
        </h2>
        
        {pastInterviews.length === 0 ? (
          // Empty State if no interviews exist
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center shadow-xl">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <LineChart className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No interviews yet</h3>
            <p className="text-gray-400 max-w-md">
              Your completed mock interviews and feedback will appear here. Select a role above to get started!
            </p>
          </div>
        ) : (
          // List of past interviews
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastInterviews.map((interview) => (
              <Link 
                href={`/results/${interview._id}`} 
                key={interview._id.toString()}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors shadow-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{interview.role}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">{interview.category || "General"}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${interview.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' : interview.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {interview.difficulty || "Medium"}
                      </span>
                    </div>
                  </div>
                  {/* Score badge */}
                  <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-bold border border-blue-500/20">
                    {interview.totalScore}/10
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-400 group-hover:text-white transition-colors mt-6">
                  View full feedback
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

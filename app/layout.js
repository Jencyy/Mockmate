import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MockMate AI - Interview Practice",
  description: "AI Powered Mock Interview Platform to help you land your dream job.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        {/* We wrap the entire application in the AuthProvider so that 
            authentication state (session) is available globally to all components */}
        <AuthProvider>
          <Navbar />
          {/* Add padding top to account for fixed navbar */}
          <main className="flex-1 pt-16 flex flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

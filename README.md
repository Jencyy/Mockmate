# MockMate 🤖🎤

MockMate is an AI-powered mock interview application designed to help developers and professionals practice for their technical interviews. Built with Next.js, it leverages Google's Gemini AI to generate customized interview questions and provide detailed feedback on user answers.

## ✨ Features

- **AI-Generated Questions**: Dynamic question generation tailored to specific roles, categories, and difficulty levels using Gemini AI.
- **Smart Evaluation**: Get instant, detailed feedback and scoring on your answers powered by AI.
- **Authentication**: Secure login system with Email/Password and OAuth providers (Google, GitHub) via NextAuth.js.
- **Dashboard**: Track your interview history, scores, and review past feedback.
- **Dark Mode**: Fully supported dark/light theme toggling.
- **Responsive Design**: Modern and clean UI built with Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **AI Integration**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun
- A MongoDB database (e.g., MongoDB Atlas)

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   git clone https://github.com/Jencyy/Mockmate.git
   cd mockmate
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add the following environment variables. You will need to obtain API keys for Google OAuth, GitHub OAuth, MongoDB, and Gemini AI.

   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # NextAuth
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # OAuth - Google
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # OAuth - GitHub
   GITHUB_ID=your_github_client_id
   GITHUB_SECRET=your_github_client_secret

   # AI integration
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure Overview

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable React components (Navbar, ThemeProvider, etc.).
- `lib/`: Utility functions and database connection setup.
- `models/`: Mongoose schemas for User and Interview data.

For a detailed breakdown of the architecture, data flow, and file structure, refer to the [CODE_WALKTHROUGH.md](CODE_WALKTHROUGH.md) included in the repository.

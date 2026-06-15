// models/Interview.js
// This file defines the Mongoose schema for an Interview session.

import mongoose, { Schema, models } from 'mongoose';

// Define the structure of an individual question and answer within an interview
const questionSchema = new Schema({
  questionText: {
    type: String,
    required: true,
  },
  userAnswer: {
    type: String,
    // It's not required immediately because the user might skip it or leave it blank
  },
  aiScore: {
    type: Number,
    // The score out of 10 given by the AI
  },
  aiFeedback: {
    type: String,
    // Detailed feedback text provided by the AI
  }
});

// Define the structure of the overall interview document
const interviewSchema = new Schema(
  {
    userId: {
      // This links the interview to a specific user in the User collection
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      // The job role the user selected (e.g., 'Frontend Developer')
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      default: 'Medium',
    },
    category: {
      type: String,
      default: 'General',
    },
    totalScore: {
      // The average or total score for the entire interview
      type: Number,
      default: 0,
    },
    questions: {
      // An array of the question objects defined above
      type: [questionSchema],
      default: [],
    }
  },
  {
    timestamps: true, // Automatically adds 'createdAt' (useful for showing interview date) and 'updatedAt'
  }
);

// Export the Interview model, ensuring we don't recreate it if it already exists
const Interview = models.Interview || mongoose.model('Interview', interviewSchema);

export default Interview;

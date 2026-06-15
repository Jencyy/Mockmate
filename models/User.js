// models/User.js
// This file defines the Mongoose schema (structure) for our User data in MongoDB.

import mongoose, { Schema, models } from 'mongoose';

// Define the shape of a User document
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures no two users can have the same email
    },
    image: {
      type: String, // URL to the user's profile picture (from Google/GitHub)
    },
    // We do not need a password field here because we are using NextAuth with Google/GitHub
    // which handles authentication via OAuth instead of passwords.
  },
  {
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields to the document
  }
);

// In Next.js, models might be compiled multiple times during development.
// We check if the 'User' model already exists in 'mongoose.models' to prevent "OverwriteModelError".
// If it exists, we reuse it. Otherwise, we create a new model.
const User = models.User || mongoose.model('User', userSchema);

export default User;

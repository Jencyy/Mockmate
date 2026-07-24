// =============================================================================
// models/User.js — MongoDB User Schema
// =============================================================================
// Purpose : Defines the shape of a "User" document stored in MongoDB.
// Used by : NextAuth callbacks (auth/[...nextauth]/route.js) to create/look up
//           users, and by the evaluate API to associate interviews with users.
// =============================================================================

import mongoose, { Schema, models } from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── Schema Definition ────────────────────────────────────────────────────────
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,     // Prevents duplicate accounts with the same email
      lowercase: true,  // Always store emails in lowercase for case-insensitive matching
    },
    password: {
      type: String,
      // Optional — only set for email/password sign-ups.
      // OAuth users (Google/GitHub) do NOT have a password field.
      select: false,    // Never return password in queries unless explicitly asked (.select('+password'))
    },
    image: {
      type: String,     // Profile picture URL — from Google/GitHub, or auto-generated avatar
    },
    provider: {
      type: String,
      default: 'credentials', // 'credentials' | 'google' | 'github'
    },
  },
  {
    // Mongoose will automatically manage 'createdAt' and 'updatedAt' timestamps
    timestamps: true,
  }
);

// ─── Pre-Save Hook — Hash Password ───────────────────────────────────────────
// Runs automatically BEFORE a user document is saved to MongoDB.
// Only runs if the 'password' field was actually changed (avoids re-hashing on every update).
userSchema.pre('save', async function () {
  // 'this' refers to the document being saved
  // In Mongoose v9, async pre-hooks don't receive `next` — Mongoose awaits the returned promise automatically
  if (!this.isModified('password') || !this.password) return;

  // Hash the password with a salt factor of 12 (secure but not too slow)
  // bcrypt generates a unique salt for each user automatically
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── Instance Method — Password Comparison ───────────────────────────────────
// We add a reusable method to compare a plain-text password with the stored hash.
// Usage: const isValid = await user.comparePassword('enteredPassword')
userSchema.methods.comparePassword = async function (candidatePassword) {
  // bcrypt.compare() returns true if the hash matches, false otherwise
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Export ──────────────────────────────────────────────────────────────────
// In Next.js hot-reload environments, 'mongoose.model()' can throw "OverwriteModelError"
// if the model was already compiled. Checking 'models.User' first prevents this.
const User = models.User || mongoose.model('User', userSchema);

export default User;

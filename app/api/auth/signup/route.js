// =============================================================================
// app/api/auth/signup/route.js — New User Registration Endpoint
// =============================================================================
// Purpose  : Handles POST requests to create a brand new user account using
//            an email and password (as opposed to OAuth with Google/GitHub).
// Flow     : Request → validate fields → check for existing email → create user
//            → respond with success (the client then calls signIn())
// Called by: The signup form on app/login/page.js
// =============================================================================

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    // ── 1. Parse the request body ────────────────────────────────────────────
    const body = await req.json();
    const { name, email, password } = body;

    // ── 2. Validate required fields ──────────────────────────────────────────
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are all required." },
        { status: 400 }
      );
    }

    // Basic password length check
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // ── 3. Connect to MongoDB ─────────────────────────────────────────────────
    await connectToDatabase();

    // ── 4. Check if email is already taken ───────────────────────────────────
    // We use .lowercase: true in the schema, so we lowercase here for comparison
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try logging in." },
        { status: 409 } // 409 Conflict
      );
    }

    // ── 5. Create the user ────────────────────────────────────────────────────
    // The password will be hashed automatically by the pre-save hook in User.js
    // (see models/User.js for how bcrypt hashing works)
    const newUser = await User.create({
      name,
      email,
      password,  // plain text — the pre-save hook will hash this before storing
      provider: "credentials",
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
    });

    // ── 6. Return success ─────────────────────────────────────────────────────
    // We do NOT return the password, even hashed. Just confirm success.
    return NextResponse.json(
      {
        message: "Account created successfully! You can now sign in.",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 } // 201 Created
    );

  } catch (error) {
    console.error("[SIGNUP ERROR]", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// =============================================================================
// components/ThemeProvider.jsx — Dark/Light Mode Provider
// =============================================================================
// Purpose  : Wraps the entire app so any component can read and change the
//            current theme (light/dark) using the useTheme() hook from next-themes.
//
// "use client": Required because next-themes uses React Context under the hood,
//               which is a client-side feature.
//
// How it works:
//   - next-themes adds a 'dark' or 'light' class to the <html> element
//   - Tailwind's 'dark:' prefix variants are activated when <html> has class="dark"
//   - ThemeProvider detects the user's system preference on first load
//   - The chosen theme is saved to localStorage so it persists between visits
//
// Used in : app/layout.js — wraps the entire app there so all pages get access
// =============================================================================

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// We re-export as 'ThemeProvider' to abstract away the next-themes dependency
export function ThemeProvider({ children, ...props }) {
  // NextThemesProvider accepts props like: attribute="class", defaultTheme="system"
  // These are passed from app/layout.js when this component is used
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

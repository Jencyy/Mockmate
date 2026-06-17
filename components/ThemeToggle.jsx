// =============================================================================
// components/ThemeToggle.jsx — Sun/Moon Theme Switch Button
// =============================================================================
// Purpose  : A button that toggles between dark and light mode when clicked.
//            Displays a Sun icon in dark mode, Moon icon in light mode.
//
// "use client": Required — uses React hooks (useEffect, useState) and reads
//               the current theme from the next-themes context.
//
// Hydration Fix:
//   On the first render, Next.js renders on the SERVER where the theme is unknown.
//   If we rendered the icon immediately, it would mismatch between server/client
//   and cause a React hydration error. The 'mounted' state trick fixes this:
//   - On the server, we render an empty placeholder div (same size as the button)
//   - Once the component mounts on the CLIENT and we know the theme, we swap it
//
// Used in  : components/Navbar.jsx
// =============================================================================

"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  // useTheme() gives us the current theme string and a setter function
  const { theme, setTheme } = useTheme();

  // 'mounted' prevents hydration mismatch (see comment block above)
  const [mounted, setMounted] = useState(false);

  // useEffect runs only on the client, never on the server.
  // When this fires, we know we're safely on the client and can show the icon.
  useEffect(() => {
    setMounted(true);
  }, []); // Empty dependency array = runs once when component first mounts

  // Before client mount, return a placeholder of the same size to avoid layout shift
  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
      aria-label="Toggle theme"
    >
      {/* Show Sun when in dark mode (clicking will switch to light) */}
      {/* Show Moon when in light mode (clicking will switch to dark) */}
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-gray-300 hover:text-white transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700 hover:text-black transition-colors" />
      )}
    </button>
  );
}

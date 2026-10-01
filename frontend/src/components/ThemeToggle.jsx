"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return localStorage.getItem("theme") !== "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      darkMode
    );
  }, [darkMode]);

  const toggleTheme = () => {
    const nextDarkMode = !darkMode;

    setDarkMode(nextDarkMode);

    localStorage.setItem(
      "theme",
      nextDarkMode ? "dark" : "light"
    );
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={
        darkMode
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-full
        border
        border-slate-300
        bg-white
        text-lg
        shadow-sm
        transition-all
        duration-200
        hover:bg-slate-100

        dark:border-slate-700
        dark:bg-slate-800
        dark:hover:bg-slate-700
      "
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
}
import React from "react";
import { Sun, Moon, Focus } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../styles/colors";
import { LanguageSelector } from "./LanguageSelector";

export const ThemeControls: React.FC = () => {
  const { isDark, toggleTheme, isFocusMode, toggleFocusMode } = useTheme();
  const themeColors = getThemeColors(isDark, isFocusMode);

  return (
    <div
      className="fixed right-4 bottom-8 z-[60] flex flex-col items-center gap-3 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-md border border-gray-200 dark:border-neutral-700 shadow-xl rounded-2xl p-2.5 transition-all duration-300 hover:shadow-2xl"
    >
      {/* Language Selector */}
      <LanguageSelector variant="dock" />

      {/* Divider */}
      <div className="w-6 h-[1px] bg-gray-200 dark:bg-neutral-700" />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="flex flex-col items-center gap-1 group focus:outline-none"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun
            size={22}
            className="text-yellow-400 transition-transform duration-300 group-hover:rotate-180 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]"
          />
        ) : (
          <Moon
            size={22}
            className="text-gray-800 dark:text-gray-200 transition-transform duration-300 group-hover:-rotate-180"
          />
        )}
        <span
          className={`text-[10px] font-semibold transition-colors duration-300 ${
            isDark ? "text-yellow-400" : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {isDark ? "Dark" : "Light"}
        </span>
      </button>

    {/* Focus Mode Toggle */}
      <button
        onClick={toggleFocusMode}
        className="flex flex-col items-center gap-1 group focus:outline-none"
        aria-label="Toggle focus mode"
      >
        <div
          className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
            isFocusMode ? "bg-green-500" : "bg-gray-400/70"
          }`}
        >
          <div
            className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
              isFocusMode ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </div>
        
        <span
          className={`text-[10px] font-semibold transition-colors duration-300 ${
            isFocusMode
              ? "text-green-500"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {isFocusMode ? "Focus On" : "Focus Off"}
        </span>
      </button>
    </div>
  );
};

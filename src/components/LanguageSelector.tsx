// src/components/LanguageSelector.tsx
import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown, Search } from "lucide-react";
import { useLanguage, SUPPORTED_LANGUAGES, Language } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

interface LanguageSelectorProps {
  isMobile?: boolean;
  variant?: "navbar" | "dock";
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  isMobile = false,
  variant = "navbar"
}) => {
  const { currentLanguage, currentLanguageObj, setLanguage } = useLanguage();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      // Auto-focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (lang: Language) => {
    setLanguage(lang.code);
    setIsOpen(false);
    setSearch("");
  };

  // Dock Variant (floating controls on bottom right)
  if (variant === "dock") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col items-center gap-1 group focus:outline-none cursor-pointer"
          aria-label="Change Language"
          title="Change Website Language"
        >
          <div className="relative p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition">
            <Globe
              size={20}
              className="text-gray-700 dark:text-gray-200 transition-transform duration-300 group-hover:rotate-45"
            />
            <span className="absolute -top-1 -right-1 text-[10px]">
              {currentLanguageObj.flag}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">
            {currentLanguageObj.code.toUpperCase()}
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 bottom-12 z-[70] w-64 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95">
            <div className="px-2 py-1.5 flex items-center gap-2 border-b border-gray-100 dark:border-neutral-800 mb-1.5">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search language..."
                className="w-full text-xs bg-transparent outline-none text-gray-800 dark:text-neutral-100 placeholder-gray-400"
              />
            </div>

            <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang)}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center justify-between transition cursor-pointer ${
                    currentLanguage === lang.code
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold"
                      : "hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    <span className="text-[11px] text-gray-400 dark:text-neutral-500">
                      ({lang.name})
                    </span>
                  </span>
                  {currentLanguage === lang.code && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mobile drawer variant
  if (isMobile) {
    return (
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 rounded-xl font-semibold flex items-center justify-between bg-white/10 dark:bg-neutral-800/60 text-white hover:bg-white/20 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-sm">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Language: {currentLanguageObj.flag} {currentLanguageObj.nativeName}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="mt-2 bg-neutral-900/95 border border-neutral-700 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto space-y-1">
            <div className="px-2 py-1.5 flex items-center gap-2 border-b border-neutral-800 mb-1">
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search language..."
                className="w-full text-xs bg-transparent outline-none text-white placeholder-neutral-400"
              />
            </div>
            {filteredLanguages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang)}
                className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between cursor-pointer ${
                  currentLanguage === lang.code
                    ? "bg-emerald-900/50 text-emerald-300 font-bold"
                    : "hover:bg-neutral-800 text-neutral-200"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  <span className="text-[11px] text-neutral-400">({lang.name})</span>
                </span>
                {currentLanguage === lang.code && (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop Navbar Variant (pill style matching DE-ECO navbar)
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-90 bg-white/10 hover:bg-white/20 text-white border border-white/10"
        title="Translate Website"
      >
        <Globe className="w-3.5 h-3.5 opacity-80" />
        <span className="text-xs">{currentLanguageObj.flag}</span>
        <span className="tracking-wide uppercase font-bold text-[11px]">
          {currentLanguageObj.code}
        </span>
        <ChevronDown
          className={`w-3 h-3 opacity-70 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-[70] w-64 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
          {/* Search bar */}
          <div className="px-2.5 py-1.5 flex items-center gap-2 border-b border-gray-100 dark:border-neutral-800 mb-1.5">
            <Search className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language..."
              className="w-full text-xs bg-transparent outline-none text-gray-800 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500"
            />
          </div>

          {/* Languages list */}
          <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
            {filteredLanguages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang)}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center justify-between transition cursor-pointer ${
                  currentLanguage === lang.code
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold"
                    : "hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  <span className="text-[11px] text-gray-400 dark:text-neutral-500">
                    ({lang.name})
                  </span>
                </span>
                {currentLanguage === lang.code && (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

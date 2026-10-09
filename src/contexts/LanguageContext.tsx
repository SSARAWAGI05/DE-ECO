// src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction?: "ltr" | "rtl";
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", direction: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", direction: "ltr" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳", direction: "ltr" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", direction: "ltr" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", direction: "ltr" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", direction: "ltr" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳", direction: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", direction: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", direction: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", direction: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", direction: "rtl" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", direction: "ltr" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", direction: "ltr" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", direction: "ltr" },
  { code: "zh-CN", name: "Chinese", nativeName: "简体中文", flag: "🇨🇳", direction: "ltr" }
];

interface LanguageContextType {
  currentLanguage: string;
  currentLanguageObj: Language;
  setLanguage: (langCode: string) => void;
  languages: Language[];
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to thoroughly clear googtrans cookies across all domains and paths
const clearTranslateCookie = () => {
  const hostname = window.location.hostname;
  const domainParts = hostname.split('.');
  
  const domainsToClear = ['', hostname, `.${hostname}`];
  if (domainParts.length >= 2) {
    const rootDomain = domainParts.slice(-2).join('.');
    domainsToClear.push(rootDomain, `.${rootDomain}`);
  }

  domainsToClear.forEach((domain) => {
    const domainAttr = domain ? `; domain=${domain}` : '';
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainAttr}`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${domainAttr}`;
  });
};

// Helper to set cookies across root and domain
const setTranslateCookie = (langCode: string) => {
  clearTranslateCookie();
  if (langCode === "en") return;

  const hostname = window.location.hostname;
  const cookieVal = `/en/${langCode}`;

  document.cookie = `googtrans=${cookieVal}; path=/;`;

  if (hostname && hostname !== "localhost" && !hostname.includes("127.0.0.1")) {
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${hostname};`;
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const rootDomain = parts.slice(-2).join('.');
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${rootDomain};`;
    }
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<string>(() => {
    return localStorage.getItem("deeco_language") || "en";
  });

  const currentLanguageObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const isRTL = currentLanguageObj.direction === "rtl";

  // Sync RTL and language tag on HTML root
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [currentLanguage, isRTL]);

  // On initial mount, ensure cookie is set and check if translation combo needs triggering
  useEffect(() => {
    const saved = localStorage.getItem("deeco_language");
    if (saved && saved !== "en") {
      setTranslateCookie(saved);
      // Wait for Google Translate dropdown to become available
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
        if (combo) {
          if (combo.value !== saved) {
            combo.value = saved;
            combo.dispatchEvent(new Event("change", { bubbles: true }));
          }
          clearInterval(interval);
        }
        if (attempts > 30) clearInterval(interval);
      }, 250);
      return () => clearInterval(interval);
    } else {
      clearTranslateCookie();
    }
  }, []);

  const setLanguage = (langCode: string) => {
    if (langCode === currentLanguage) return;

    setCurrentLanguageState(langCode);
    localStorage.setItem("deeco_language", langCode);

    if (langCode === "en") {
      clearTranslateCookie();
      const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
      if (combo) {
        combo.value = "";
        combo.dispatchEvent(new Event("change", { bubbles: true }));
      }
      setTimeout(() => {
        window.location.reload();
      }, 50);
      return;
    }

    setTranslateCookie(langCode);

    const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event("change", { bubbles: true }));
      // When switching between non-English languages, reload cleans up DOM nodes
      if (currentLanguage !== "en") {
        setTimeout(() => {
          window.location.reload();
        }, 80);
      }
    } else {
      // Reload if combo is not available yet
      window.location.reload();
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        currentLanguageObj,
        setLanguage,
        languages: SUPPORTED_LANGUAGES,
        isRTL
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

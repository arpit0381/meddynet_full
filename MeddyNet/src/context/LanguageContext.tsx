"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Locale } from "@/lib/translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  tArray: (key: string) => string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type TranslationValue = string | string[] | { [key: string]: TranslationValue } | unknown[];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Load from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem("meddynet_language") as Locale;
    if (savedLocale && Object.keys(translations).includes(savedLocale)) {
      Promise.resolve().then(() => {
        setLocaleState(savedLocale);
      });
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("meddynet_language", newLocale);
    // Optionally update document lang attribute
    document.documentElement.lang = newLocale;
  };

  // Safe translation function that handles nested keys like 'hero.title1'
  const t = (key: string): string => {
    const keys = key.split(".");
    let current: TranslationValue = translations[locale];

    for (const k of keys) {
      if (current && typeof current === "object" && !Array.isArray(current) && k in current) {
        current = current[k];
      } else {
        // Fallback to English if key missing in current locale
        current = translations["en"];
        for (const enK of keys) {
          if (current && typeof current === "object" && !Array.isArray(current) && enK in current) {
            current = current[enK];
          } else {
            return key; // Return the key itself as last resort
          }
        }
        break;
      }
    }

    return (current !== undefined ? current : key) as string;
  };

  const tArray = (key: string): string[] => {
    const keys = key.split(".");
    let current: TranslationValue = translations[locale];

    for (const k of keys) {
      if (current && typeof current === "object" && !Array.isArray(current) && k in current) {
        current = current[k];
      } else {
        current = translations["en"];
        for (const enK of keys) {
          if (current && typeof current === "object" && !Array.isArray(current) && enK in current) {
            current = current[enK];
          } else {
            return [];
          }
        }
        break;
      }
    }

    return Array.isArray(current) ? (current as string[]) : [];
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, tArray }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

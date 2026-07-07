import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "./translations";

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => localStorage.getItem("locale") || "en");
  const dir = locale === "he" ? "rtl" : "ltr";

  useEffect(() => {
    localStorage.setItem("locale", locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  function t(key, ...args) {
    const entry = translations[locale]?.[key] ?? translations.en[key] ?? key;
    return typeof entry === "function" ? entry(...args) : entry;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}

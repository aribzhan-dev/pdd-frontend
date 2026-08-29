// Application root: holds the language choice and mounts the router.

import { useState } from "react";
import { BrowserRouter } from "react-router-dom";

import { AppRoutes } from "@/app/routes";
import { AuthProvider } from "@/features/auth/AuthContext";
import { languageStorage } from "@/lib/storage";
import type { Language } from "@/types/api";

const DEFAULT_LANGUAGE: Language = "ru";

function readStoredLanguage(): Language {
  return languageStorage.get() === "kz" ? "kz" : DEFAULT_LANGUAGE;
}

export function App() {
  const [language, setLanguage] = useState<Language>(readStoredLanguage);

  function changeLanguage(next: Language): void {
    setLanguage(next);
    languageStorage.set(next);
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes language={language} onLanguageChange={changeLanguage} />
      </AuthProvider>
    </BrowserRouter>
  );
}

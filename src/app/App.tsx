// Application root: providers and the router.
//
// Language lives in its own provider rather than in state here, because two
// very different things depend on it — the dictionary of interface strings and
// the `lang` parameter on content requests — and screens deep in the tree need
// both. Passing it down as a prop meant only the screens that remembered to
// thread it through actually switched.

import { BrowserRouter } from "react-router-dom";

import { AppRoutes } from "@/app/routes";
import { AuthProvider } from "@/features/auth/AuthContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ThemeProvider } from "@/theme/ThemeContext";

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

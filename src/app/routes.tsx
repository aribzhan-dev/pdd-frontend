// Route table. Students and staff see different trees, and an unauthenticated
// visitor sees only the login screen — there is no public area.

import { Navigate, Route, Routes } from "react-router-dom";

import { Header } from "@/components/Header";
import { useAuth } from "@/features/auth/AuthContext";
import { LoginPage } from "@/features/auth/LoginPage";
import { HomePage } from "@/features/catalog/HomePage";
import { HistoryPage } from "@/features/history/HistoryPage";
import { QuizPage } from "@/features/quiz/QuizPage";
import { ResultPage } from "@/features/quiz/ResultPage";
import { ManagersPage } from "@/features/staff/ManagersPage";
import { StudentsPage } from "@/features/staff/StudentsPage";
import { useStrings } from "@/i18n/LanguageContext";

export function AppRoutes() {
  const t = useStrings();
  const { user, isLoading, isStaff, role } = useAuth();

  if (isLoading) return <div className="state">{t.loading}</div>;
  if (!user) return <LoginPage />;

  return (
    <>
      <Header />
      <Routes>
        {isStaff ? (
          <>
            <Route path="/staff/students" element={<StudentsPage />} />
            {role === "admin" && (
              <Route path="/staff/managers" element={<ManagersPage />} />
            )}
            <Route path="*" element={<Navigate to="/staff/students" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/result/:sessionId" element={<ResultPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </>
  );
}

// Top bar. For a student it shows who they are, which category they study and
// how much access is left — the confirmation the student asked to see.

import { Link, useLocation } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthContext";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLanguage } from "@/i18n/LanguageContext";
import { pluralDays } from "@/lib/format";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut, isStaff } = useAuth();
  const { pathname } = useLocation();
  if (!user) return null;

  const student = user.student;

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__brand">
          <span className="header__mark">{t.appName}</span>
        </Link>

        <nav className="header__nav">
          {isStaff ? (
            <>
              <HeaderLink to="/staff/students" current={pathname}>
                {t.students}
              </HeaderLink>
              {user.role.value === "admin" && (
                <HeaderLink to="/staff/managers" current={pathname}>
                  {t.managers}
                </HeaderLink>
              )}
            </>
          ) : (
            <>
              <HeaderLink to="/" current={pathname}>
                {t.topics}
              </HeaderLink>
              <HeaderLink to="/history" current={pathname}>
                {t.history}
              </HeaderLink>
            </>
          )}
        </nav>

        <div className="header__account">
          <LanguageSwitch value={language} onChange={setLanguage} />
          <div className="header__identity">
            <span className="header__name">{user.full_name}</span>
            <span className="header__meta">
              {student
                ? `${t.category} ${student.category.label} · ${student.status.label} · ${pluralDays(student.days_left)}`
                : user.role.label}
            </span>
          </div>
          <button type="button" className="btn btn--ghost" onClick={signOut}>
            {t.signOut}
          </button>
        </div>
      </div>
    </header>
  );
}

function HeaderLink({
  to,
  current,
  children,
}: {
  to: string;
  current: string;
  children: string;
}) {
  return (
    <Link to={to} className={`header__link ${current === to ? "is-active" : ""}`}>
      {children}
    </Link>
  );
}

// The only way into the app: there is no registration, accounts are issued by
// the training centre.

import { useState, type FormEvent } from "react";

import { ApiError } from "@/api/client";
import { PasswordField } from "@/components/PasswordField";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/features/auth/AuthContext";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { useLanguage } from "@/i18n/LanguageContext";

const IIN_LENGTH = 12;
//: Every issued password is at least this long (enforced by the backend), so
//: a shorter entry is necessarily a typo — no point sending it.
const MIN_PASSWORD_LENGTH = 6;

export function LoginPage() {
  const { language, setLanguage, t } = useLanguage();
  const { signIn } = useAuth();
  const [iin, setIin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(iin, password);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t.error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Only digits, capped at the IIN length — the backend rejects anything else.
  function handleIinChange(value: string): void {
    setIin(value.replace(/\D/g, "").slice(0, IIN_LENGTH));
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <div className="login__lang">
          <LanguageSwitch value={language} onChange={setLanguage} />
          <ThemeSwitch />
        </div>

        <div className="login__brand">
          <span className="login__mark">{t.appName}</span>
          <p className="login__tagline">{t.tagline}</p>
        </div>

        <TextField
          label={t.iin}
          value={iin}
          onChange={handleIinChange}
          placeholder={t.iinPlaceholder}
          autoComplete="username"
          inputMode="numeric"
          maxLength={IIN_LENGTH}
          required
        />

        <PasswordField value={password} onChange={setPassword} />

        {error && <div className="notice notice--error">{error}</div>}

        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={
            isSubmitting ||
            iin.length !== IIN_LENGTH ||
            password.length < MIN_PASSWORD_LENGTH
          }
        >
          {isSubmitting ? t.signingIn : t.signIn}
        </button>

        <p className="login__hint">{t.loginHint}</p>
      </form>
    </div>
  );
}

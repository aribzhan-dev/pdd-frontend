// The only way into the app: there is no registration, accounts are issued by
// the training centre.

import { useState, type FormEvent } from "react";

import { ApiError } from "@/api/client";
import { PasswordField } from "@/components/PasswordField";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/features/auth/AuthContext";
import { UI } from "@/i18n/strings";

const IIN_LENGTH = 12;

//: WhatsApp opens with the message already written, so a prospective student
//: only has to press send. The number is in international form without "+",
//: which is what wa.me expects.
const CONTACT_PHONE = "77756270762";
const CONTACT_MESSAGE = "Здравствуйте! Хотел бы узнать подробнее.";
const CONTACT_URL = `https://wa.me/${CONTACT_PHONE}?text=${encodeURIComponent(
  CONTACT_MESSAGE,
)}`;

export function LoginPage() {
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
      setError(cause instanceof ApiError ? cause.message : UI.error);
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
        <div className="login__brand">
          <span className="login__mark">{UI.appName}</span>
          <p className="login__tagline">{UI.tagline}</p>
        </div>

        <TextField
          label={UI.iin}
          value={iin}
          onChange={handleIinChange}
          placeholder={UI.iinPlaceholder}
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
          disabled={isSubmitting || iin.length !== IIN_LENGTH || !password}
        >
          {isSubmitting ? UI.signingIn : UI.signIn}
        </button>

        <p className="login__hint">{UI.loginHint}</p>

        <a
          className="login__contact"
          href={CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {UI.contactUs}
        </a>
      </form>
    </div>
  );
}

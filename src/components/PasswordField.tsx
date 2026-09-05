// Password input with a show/hide toggle.

import { useId, useState } from "react";

import { useStrings } from "@/i18n/LanguageContext";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}

export function PasswordField({
  value,
  onChange,
  label,
  placeholder,
  autoComplete = "current-password",
  required = true,
}: PasswordFieldProps) {
  const t = useStrings();
  const [isVisible, setIsVisible] = useState(false);
  const inputId = useId();

  return (
    <label className="field" htmlFor={inputId}>
      <span className="field__label">{label ?? t.password}</span>
      <span className="field__control">
        <input
          id={inputId}
          type={isVisible ? "text" : "password"}
          className="field__input"
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="field__toggle"
          onClick={() => setIsVisible((shown) => !shown)}
          aria-label={isVisible ? t.hidePassword : t.showPassword}
          title={isVisible ? t.hidePassword : t.showPassword}
        >
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </span>
    </label>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7c2 0 3.7.7 5.1 1.6M22 12s-3.5 7-10 7c-2 0-3.7-.7-5.1-1.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="m4 4 16 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

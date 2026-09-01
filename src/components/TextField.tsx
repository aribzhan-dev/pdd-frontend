// Labelled text input, matching PasswordField so forms line up.

import { useId } from "react";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "tel" | "number";
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  inputMode?: "text" | "numeric" | "tel";
  maxLength?: number;
  readOnly?: boolean;
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  required = false,
  inputMode,
  maxLength,
  readOnly = false,
}: TextFieldProps) {
  const inputId = useId();

  return (
    <label className="field" htmlFor={inputId}>
      <span className="field__label">{label}</span>
      <span className="field__control">
        <input
          id={inputId}
          type={type}
          className="field__input"
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          inputMode={inputMode}
          maxLength={maxLength}
          readOnly={readOnly}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  );
}

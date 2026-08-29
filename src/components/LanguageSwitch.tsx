// RU / KZ switch. The content itself is localised by the backend, so changing
// the language changes what the next request returns.

import type { Language } from "@/types/api";

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "kz", label: "KZ" },
];

interface LanguageSwitchProps {
  value: Language;
  onChange: (language: Language) => void;
}

export function LanguageSwitch({ value, onChange }: LanguageSwitchProps) {
  return (
    <div className="langswitch">
      {LANGUAGES.map((language, index) => (
        <span key={language.code}>
          {index > 0 && <span className="langswitch__sep">/</span>}
          <button
            type="button"
            className={`langswitch__item ${
              language.code === value ? "is-active" : ""
            }`}
            onClick={() => onChange(language.code)}
          >
            {language.label}
          </button>
        </span>
      ))}
    </div>
  );
}

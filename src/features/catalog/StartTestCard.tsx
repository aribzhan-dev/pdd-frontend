// "Начать новое тестирование" — the two ways to start a 40-question run.
//
// The exam is timed like the real one; training mode has no clock. Both draw
// the same 40 questions, so the choice is only about the pressure.

import { useState } from "react";

import type { QuizMode } from "@/api/quiz";
import { useStrings } from "@/i18n/LanguageContext";

interface StartTestCardProps {
  onStart: (mode: QuizMode) => void;
  isStarting: boolean;
}

export function StartTestCard({ onStart, isStarting }: StartTestCardProps) {
  const t = useStrings();
  const [mode, setMode] = useState<QuizMode>("exam");

  // Built here rather than at module scope: the labels come from the
  // dictionary, which only exists once a language has been chosen.
  const options: { mode: QuizMode; label: string; hint: string }[] = [
    { mode: "exam", label: t.exam, hint: t.examHint },
    { mode: "training", label: t.training, hint: t.trainingHint },
  ];

  return (
    <section className="start">
      <h2 className="start__title">{t.startNewTest}</h2>

      <div className="start__options">
        {options.map((option) => (
          <label
            key={option.mode}
            className={`radio ${option.mode === mode ? "is-active" : ""}`}
          >
            <input
              type="radio"
              name="quiz-mode"
              value={option.mode}
              checked={option.mode === mode}
              onChange={() => setMode(option.mode)}
            />
            <span className="radio__body">
              <span className="radio__label">{option.label}</span>
              <span className="radio__hint">{option.hint}</span>
            </span>
          </label>
        ))}
      </div>

      <button
        type="button"
        className="btn btn--start"
        disabled={isStarting}
        onClick={() => onStart(mode)}
      >
        {isStarting ? t.loading : t.startTest}
      </button>
    </section>
  );
}

// The numbered strip above the question.
//
// Each chip shows the state of one slot at a glance: green when answered
// correctly, red when answered wrongly, filled blue for the question on
// screen, and plain grey while still unanswered.
//
// Forty chips wrapped onto six rows swallowed most of a phone screen, so the
// strip scrolls sideways instead and keeps the current chip in view. The
// progress bar underneath restores the sense of "how far along am I" that the
// wrapped grid used to give at a glance.

import { useEffect, useRef, type ReactNode } from "react";

import type { ItemState } from "@/types/api";

interface QuestionNavProps {
  items: ItemState[];
  currentPosition: number;
  answeredCount: number;
  onSelect: (position: number) => void;
  /** Rendered at the end of the strip — the exam clock sits here. */
  trailing?: ReactNode;
}

function chipModifier(item: ItemState, isCurrent: boolean): string {
  if (isCurrent) return "chip--current";
  if (!item.is_answered) return "chip--idle";
  return item.is_correct ? "chip--correct" : "chip--wrong";
}

function chipTitle(item: ItemState): string {
  if (!item.is_answered) return "Без ответа";
  return item.is_correct ? "Верно" : "Неверно";
}

export function QuestionNav({
  items,
  currentPosition,
  answeredCount,
  onSelect,
  trailing,
}: QuestionNavProps) {
  const stripRef = useRef<HTMLDivElement>(null);

  // Keep the current chip visible: on a phone only a handful fit at a time.
  useEffect(() => {
    const strip = stripRef.current;
    const chip = strip?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!strip || !chip) return;
    const offset =
      chip.offsetLeft - strip.clientWidth / 2 + chip.clientWidth / 2;
    strip.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
  }, [currentPosition]);

  const percent = items.length
    ? Math.round((answeredCount / items.length) * 100)
    : 0;

  return (
    <div className="nav">
      <div className="nav__row">
        <div className="chips" ref={stripRef} aria-label="Навигация по вопросам">
          {items.map((item) => {
            const isCurrent = item.position === currentPosition;
            return (
              <button
                key={item.position}
                type="button"
                className={`chip ${chipModifier(item, isCurrent)}`}
                title={chipTitle(item)}
                aria-current={isCurrent ? "true" : undefined}
                onClick={() => onSelect(item.position)}
              >
                {item.position + 1}
              </button>
            );
          })}
        </div>
        {trailing && <div className="nav__trailing">{trailing}</div>}
      </div>

      <div
        className="progress"
        role="progressbar"
        aria-valuenow={answeredCount}
        aria-valuemin={0}
        aria-valuemax={items.length}
      >
        <div className="progress__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

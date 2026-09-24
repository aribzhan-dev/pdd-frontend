// The slips of this run, gathering under the numbered strip as they happen.
//
// The main strip already colours a wrong chip red, but among forty of them a
// student has to hunt for the red ones. This is the same chips pulled out and
// kept together, so "what did I get wrong" is answered without scanning, and
// each one still jumps back to its question.
//
// It stays empty-handed during an exam: nothing is known to be wrong until the
// paper is handed in, and QuizPage withholds it there.

import type { ItemState } from "@/types/api";

interface MistakeStripProps {
  items: ItemState[];
  currentPosition: number;
  label: string;
  onSelect: (position: number) => void;
}

export function MistakeStrip({
  items,
  currentPosition,
  label,
  onSelect,
}: MistakeStripProps) {
  // Answered and wrong. An unanswered slot scores as a mistake at the end,
  // but calling it one mid-run would be accusing a student of a question they
  // have not reached.
  const wrong = items.filter(
    (item) => item.is_answered && item.is_correct === false,
  );

  if (wrong.length === 0) return null;

  return (
    <div className="mistakes-strip">
      <span className="mistakes-strip__label">
        {label} ({wrong.length})
      </span>
      <div className="mistakes-strip__chips">
        {wrong.map((item) => (
          <button
            key={item.position}
            type="button"
            className={`chip chip--wrong ${
              item.position === currentPosition ? "is-current" : ""
            }`}
            aria-current={item.position === currentPosition ? "true" : undefined}
            onClick={() => onSelect(item.position)}
          >
            {item.position + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

// One topic in the catalogue: a checkbox and the topic itself.
//
// The two controls do different things on purpose. Tapping the row runs that
// single topic; ticking the box adds it to a selection that several topics can
// share. A checkbox cannot live inside a <button>, so the row is a container
// holding both side by side.
//
// A chapter of 168 questions is not a sitting, so a topic longer than one
// exam's worth is offered in parts. There the row stops being a start button
// and becomes a disclosure: tapping it reveals 1/5 … 5/5, and the part is what
// starts the run. Short topics are untouched — they still start on the first
// tap, which is the common case and should stay one gesture.

import { useState } from "react";

import { useStrings } from "@/i18n/LanguageContext";
import type { TopicBrief } from "@/types/api";

interface TopicRowProps {
  topic: TopicBrief;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: (topicId: number) => void;
  onStart: (topicId: number, part?: number) => void;
}

export function TopicRow({
  topic,
  isSelected,
  isDisabled,
  onToggle,
  onStart,
}: TopicRowProps) {
  const t = useStrings();
  const [isOpen, setIsOpen] = useState(false);
  const isSplit = topic.part_count > 1;

  const parts = Array.from({ length: topic.part_count }, (_, index) => index + 1);

  return (
    <div className={`topic-row ${isSelected ? "is-selected" : ""}`}>
      <div className="topic-row__main">
        <input
          type="checkbox"
          className="topic-row__check"
          checked={isSelected}
          disabled={isDisabled}
          onChange={() => onToggle(topic.id)}
          aria-label={topic.title}
        />

        <button
          type="button"
          className="topic"
          disabled={isDisabled}
          aria-expanded={isSplit ? isOpen : undefined}
          onClick={() =>
            isSplit ? setIsOpen((open) => !open) : onStart(topic.id)
          }
        >
          <span className="topic__number">{topic.number}</span>
          <span className="topic__body">
            <span className="topic__title">{topic.title}</span>
            <span className="topic__meta">
              {topic.question_count} {t.questions}
              {isSplit && ` · ${t.partsCount(topic.part_count)}`}
            </span>
          </span>
          {topic.best_percent !== null && (
            <span className="pill pill--success">{topic.best_percent}%</span>
          )}
          {isSplit && (
            <span className={`topic__chevron ${isOpen ? "is-open" : ""}`}>
              ⌄
            </span>
          )}
        </button>
      </div>

      {isSplit && isOpen && (
        <div className="topic-parts">
          <span className="topic-parts__label">{t.choosePart}</span>
          <div className="topic-parts__list">
            {parts.map((part) => (
              <button
                key={part}
                type="button"
                className="topic-parts__item"
                disabled={isDisabled}
                onClick={() => onStart(topic.id, part)}
              >
                {part}/{topic.part_count}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

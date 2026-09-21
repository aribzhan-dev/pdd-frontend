// One topic in the catalogue: a checkbox and the topic itself.
//
// The two controls do different things on purpose. Tapping the row starts that
// single topic in full, the way it always has; ticking the box adds it to a
// selection that several topics can share. A checkbox cannot live inside a
// <button>, so the row is a container holding both side by side.

import type { TopicBrief } from "@/types/api";

interface TopicRowProps {
  topic: TopicBrief;
  isSelected: boolean;
  isDisabled: boolean;
  questionsLabel: string;
  onToggle: (topicId: number) => void;
  onStart: (topicId: number) => void;
}

export function TopicRow({
  topic,
  isSelected,
  isDisabled,
  questionsLabel,
  onToggle,
  onStart,
}: TopicRowProps) {
  return (
    <div className={`topic-row ${isSelected ? "is-selected" : ""}`}>
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
        onClick={() => onStart(topic.id)}
      >
        <span className="topic__number">{topic.number}</span>
        <span className="topic__body">
          <span className="topic__title">{topic.title}</span>
          <span className="topic__meta">
            {topic.question_count} {questionsLabel}
          </span>
        </span>
        {topic.best_percent !== null && (
          <span className="pill pill--success">{topic.best_percent}%</span>
        )}
      </button>
    </div>
  );
}

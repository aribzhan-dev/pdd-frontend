// The bar that appears once topics are ticked, offering to start a run on them.
//
// It sticks to the bottom of the viewport: the topic list is long, and a
// student who ticks a box near the end should not have to scroll back up to
// find the button that acts on it.

import { useStrings } from "@/i18n/LanguageContext";

interface TopicPickerBarProps {
  count: number;
  isStarting: boolean;
  onStart: () => void;
  onClear: () => void;
}

export function TopicPickerBar({
  count,
  isStarting,
  onStart,
  onClear,
}: TopicPickerBarProps) {
  const t = useStrings();

  return (
    <div className="picker" role="region" aria-label={t.startPicked}>
      <div className="picker__summary">
        <span className="picker__count">{t.topicsPicked(count)}</span>
        <span className="picker__hint">{t.pickedRunHint}</span>
      </div>

      <div className="picker__actions">
        <button
          type="button"
          className="btn btn--ghost"
          disabled={isStarting}
          onClick={onClear}
        >
          {t.clearPicked}
        </button>
        <button
          type="button"
          className="btn btn--primary"
          disabled={isStarting}
          onClick={onStart}
        >
          {isStarting ? t.loading : t.startPicked}
        </button>
      </div>
    </div>
  );
}

// Which topics the student has ticked for a custom run.
//
// Kept as an ordered array rather than a Set: the order is the order they were
// ticked in, which is what the request sends, and every update returns a new
// array so React sees the change.

import { useCallback, useMemo, useState } from "react";

interface TopicSelection {
  /** Ticked topic ids, in the order they were ticked. */
  readonly topicIds: readonly number[];
  readonly count: number;
  readonly hasSelection: boolean;
  isSelected: (topicId: number) => boolean;
  toggle: (topicId: number) => void;
  clear: () => void;
}

export function useTopicSelection(): TopicSelection {
  const [topicIds, setTopicIds] = useState<readonly number[]>([]);

  const toggle = useCallback((topicId: number) => {
    setTopicIds((current) =>
      current.includes(topicId)
        ? current.filter((id) => id !== topicId)
        : [...current, topicId],
    );
  }, []);

  const clear = useCallback(() => setTopicIds([]), []);

  const isSelected = useCallback(
    (topicId: number) => topicIds.includes(topicId),
    [topicIds],
  );

  return useMemo(
    () => ({
      topicIds,
      count: topicIds.length,
      hasSelection: topicIds.length > 0,
      isSelected,
      toggle,
      clear,
    }),
    [topicIds, isSelected, toggle, clear],
  );
}

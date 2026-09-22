// Enter moves to the next question, so a student on a laptop can work through
// a test without reaching for the mouse.
//
// Two guards keep it from firing twice. It is enabled only while the "Далее"
// button is actually on screen, and it steps aside whenever focus sits on a
// control that already does something with Enter — pressing Enter on the
// "Далее" button itself would otherwise advance two questions at once.

import { useEffect } from "react";

//: Elements that act on Enter themselves. Letting the handler run as well
//: would double the effect of a single keypress.
const SELF_HANDLING_TAGS = new Set([
  "BUTTON",
  "A",
  "INPUT",
  "TEXTAREA",
  "SELECT",
]);

export function useEnterToAdvance(
  isEnabled: boolean,
  onAdvance: () => void,
): void {
  useEffect(() => {
    if (!isEnabled) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Enter") return;
      // A held key would race through the remaining questions.
      if (event.repeat) return;
      // A modifier means the student is doing something else entirely.
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (target && SELF_HANDLING_TAGS.has(target.tagName)) return;

      event.preventDefault();
      onAdvance();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEnabled, onAdvance]);
}

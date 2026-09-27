import { useSyncExternalStore } from "react";

const NARROW_VIEWPORT = "(max-width: 600px)";
const TOUCH_POINTER = "(pointer: coarse)";

function isPhoneLayout(): boolean {
  if (window.matchMedia(NARROW_VIEWPORT).matches) return true;

  // A phone's layout viewport can be wide in landscape or desktop-site mode.
  // Screen dimensions are CSS pixels; the short edge survives rotation.
  const shortEdge = Math.min(window.screen.width, window.screen.height);
  const hasTouch = navigator.maxTouchPoints > 0 ||
    window.matchMedia(TOUCH_POINTER).matches;
  return hasTouch && shortEdge > 0 && shortEdge <= 600;
}

function subscribe(onChange: () => void): () => void {
  const queries = [NARROW_VIEWPORT, TOUCH_POINTER].map((query) =>
    window.matchMedia(query),
  );
  queries.forEach((query) => query.addEventListener("change", onChange));
  window.addEventListener("resize", onChange);
  window.screen.orientation?.addEventListener("change", onChange);
  return () => {
    queries.forEach((query) => query.removeEventListener("change", onChange));
    window.removeEventListener("resize", onChange);
    window.screen.orientation?.removeEventListener("change", onChange);
  };
}

/** One decision for both the quiz layout and which media player is mounted. */
export function usePhoneLayout(): boolean {
  return useSyncExternalStore(subscribe, isPhoneLayout, () => false);
}

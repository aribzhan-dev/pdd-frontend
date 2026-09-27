// The visual half of a question: the situation clip, then the explanation clip
// once the student has answered — and only in the modes that explain.
//
// URLs arrive from the backend already absolute, because production serves the
// clips from the platform they were taken from rather than from this server.
// Many questions share one file, so hundreds resolve to the same URL and the
// browser caches it once.

import { useSyncExternalStore } from "react";

import { SituationVideo } from "@/features/quiz/SituationVideo";
import { useStrings } from "@/i18n/LanguageContext";
import type { Media } from "@/types/api";

interface MediaPanelProps {
  image: Media | null;
  situationVideo: Media | null;
  explanationVideoUrl: string | null;
}

// Keep the phone cutoff aligned with quiz.css. Tablets retain both players.
const PHONE_QUERY = "(max-width: 600px)";

function subscribeToPhoneSize(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function isPhoneSize() {
  return window.matchMedia(PHONE_QUERY).matches;
}

export function MediaPanel({
  image,
  situationVideo,
  explanationVideoUrl,
}: MediaPanelProps) {
  const t = useStrings();
  const isPhone = useSyncExternalStore(subscribeToPhoneSize, isPhoneSize, () => false);
  // Unmount the situation on phones, rather than hiding a still-playing video.
  const showSituation = !isPhone || !explanationVideoUrl;
  if (!image && !situationVideo && !explanationVideoUrl) return null;

  return (
    <div className="media">
      {showSituation && situationVideo && (
        <SituationVideo
          key="situation"
          src={situationVideo.url}
          autoPlay
          muted
          label={t.situation}
        />
      )}

      {showSituation && image && !situationVideo && (
        <figure className="clip">
          <div className="clip__stage">
            <img className="clip__video" src={image.url} alt="" />
          </div>
        </figure>
      )}

      {explanationVideoUrl && (
        <SituationVideo key="explanation" src={explanationVideoUrl} label={t.explanation} />
      )}
    </div>
  );
}

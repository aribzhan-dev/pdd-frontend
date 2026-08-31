// The visual half of a question: the situation clip, then the explanation clip
// once the student has answered — and only in the modes that explain.
//
// URLs arrive from the backend already absolute, because production serves the
// clips from the platform they were taken from rather than from this server.
// Many questions share one file, so hundreds resolve to the same URL and the
// browser caches it once.

import { SituationVideo } from "@/features/quiz/SituationVideo";
import { UI } from "@/i18n/strings";
import type { Media } from "@/types/api";

interface MediaPanelProps {
  image: Media | null;
  situationVideo: Media | null;
  explanationVideoUrl: string | null;
}

export function MediaPanel({
  image,
  situationVideo,
  explanationVideoUrl,
}: MediaPanelProps) {
  if (!image && !situationVideo && !explanationVideoUrl) return null;

  return (
    <div className="media">
      {situationVideo && (
        <SituationVideo
          src={situationVideo.url}
          autoPlay
          muted
          label={UI.situation}
        />
      )}

      {image && !situationVideo && (
        <figure className="clip">
          <div className="clip__stage">
            <img className="clip__video" src={image.url} alt="" />
          </div>
        </figure>
      )}

      {explanationVideoUrl && (
        <SituationVideo src={explanationVideoUrl} label={UI.explanation} />
      )}
    </div>
  );
}

// The visual half of a question: the situation clip, then the explanation clip
// once the student has answered.
//
// URLs arrive from the backend already absolute, because production serves
// the clips from the platform they were taken from rather than from this
// server. Many questions share one file, so hundreds resolve to the same URL
// and the browser caches it once. `key` forces a remount when the URL really
// changes, so autoplay fires for the new clip.

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
  const hasMedia = image ?? situationVideo ?? explanationVideoUrl;
  if (!hasMedia) return null;

  return (
    <div className="media">
      {situationVideo && (
        <figure className="media__frame">
          <video
            key={situationVideo.url}
            controls
            autoPlay
            muted
            playsInline
            // Older iOS Safari ignores playsInline without the vendor form.
            webkit-playsinline="true"
            preload="metadata"
          >
            <source src={situationVideo.url} type="video/mp4" />
          </video>
          <figcaption className="media__caption">{UI.situation}</figcaption>
        </figure>
      )}

      {image && !situationVideo && (
        <figure className="media__frame">
          <img src={image.url} alt="" />
        </figure>
      )}

      {explanationVideoUrl && (
        <figure className="media__frame">
          <video
            key={explanationVideoUrl}
            controls
            playsInline
            webkit-playsinline="true"
            preload="metadata"
          >
            <source src={explanationVideoUrl} type="video/mp4" />
          </video>
          <figcaption className="media__caption">{UI.explanation}</figcaption>
        </figure>
      )}
    </div>
  );
}

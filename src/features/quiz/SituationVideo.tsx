// Situation clip with one control: replay.
//
// The browser's own control bar carries a timeline, volume, download and a
// picture-in-picture menu — none of which mean anything for a five-second
// silent loop, and all of which render differently on every platform. A single
// replay button behaves identically on a phone, a tablet and a desktop.

import { useEffect, useRef, useState } from "react";

interface SituationVideoProps {
  src: string;
  /** Muted clips are allowed to autoplay; explanation clips are not. */
  autoPlay?: boolean;
  muted?: boolean;
  label?: string;
}

export function SituationVideo({
  src,
  autoPlay = false,
  muted = false,
  label,
}: SituationVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // A new question means a new clip: rewind and, when allowed, start it.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // React sets `muted` as a property but not reliably as the HTML attribute,
    // and the browser's autoplay policy reads the attribute — so a muted clip
    // can still be treated as "has sound" and blocked. Setting it imperatively
    // here guarantees the element is muted before play() is attempted.
    video.muted = muted;
    video.currentTime = 0;
    if (autoPlay) {
      // Autoplay can still be refused (a device in low-power mode, for
      // instance); preload="auto" means the first frame is already painted, so
      // the student sees the situation even when it does not start on its own.
      void video.play().catch(() => setIsPlaying(false));
    }
  }, [src, autoPlay, muted]);

  function replay(): void {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => setIsPlaying(false));
  }

  return (
    <figure className="clip">
      <div className="clip__stage">
        <video
          ref={videoRef}
          key={src}
          className="clip__video"
          autoPlay={autoPlay}
          loop={autoPlay}
          muted={muted}
          playsInline
          webkit-playsinline="true"
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload noplaybackrate"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onClick={replay}
        >
          <source src={src} type="video/mp4" />
        </video>

        <button
          type="button"
          className={`clip__replay ${isPlaying ? "is-playing" : ""}`}
          onClick={replay}
          aria-label="Повторить"
          title="Повторить"
        >
          <ReplayIcon />
        </button>
      </div>
      {label && <figcaption className="clip__caption">{label}</figcaption>}
    </figure>
  );
}

function ReplayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5V2L8 6l4 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Z"
        fill="currentColor"
      />
    </svg>
  );
}

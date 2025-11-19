import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface VideoPlayerProps {
  src: string;
  className?: string;
}

export interface VideoPlayerRef {
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ src, className }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      seekTo: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
      play: () => {
        if (videoRef.current) {
          videoRef.current.play();
        }
      },
      pause: () => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      },
      getCurrentTime: () => {
        return videoRef.current?.currentTime || 0;
      },
    }));

    return (
      <video
        ref={videoRef}
        controls
        className={className}
        src={src}
      >
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

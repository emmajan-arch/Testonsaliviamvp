import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { PictureInPicture2, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  className?: string;
}

export interface VideoPlayerRef {
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
  requestPictureInPicture: () => void;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ src, className }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isPiPSupported, setIsPiPSupported] = useState(false);
    
    // Déterminer si c'est un lien Google Drive, YouTube ou autre
    const isGoogleDrive = src.includes('drive.google.com');
    const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
    const isEmbed = isGoogleDrive || isYouTube;

    useImperativeHandle(ref, () => ({
      seekTo: (time: number) => {
        if (videoRef.current && !isEmbed) {
          videoRef.current.currentTime = time;
        }
      },
      play: () => {
        if (videoRef.current && !isEmbed) {
          videoRef.current.play();
        }
      },
      pause: () => {
        if (videoRef.current && !isEmbed) {
          videoRef.current.pause();
        }
      },
      getCurrentTime: () => {
        return videoRef.current?.currentTime || 0;
      },
      requestPictureInPicture: async () => {
        if (videoRef.current && !isEmbed && document.pictureInPictureEnabled) {
          try {
            if (document.pictureInPictureElement) {
              await document.exitPictureInPicture();
            } else {
              await videoRef.current.requestPictureInPicture();
            }
          } catch (error) {
            console.error('Erreur Picture-in-Picture:', error);
          }
        }
      },
    }));

    const handlePiP = async () => {
      if (videoRef.current && document.pictureInPictureEnabled) {
        try {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
          } else {
            await videoRef.current.requestPictureInPicture();
          }
        } catch (error) {
          console.error('Erreur Picture-in-Picture:', error);
        }
      }
    };

    if (isEmbed) {
      return (
        <div className={className}>
          <div className="relative group">
            <iframe
              ref={iframeRef}
              src={src}
              className="w-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              style={{ border: 'none', width: '100%', height: '400px' }}
            />
            
            {/* Bouton pour ouvrir dans un nouvel onglet */}
            <a
              href={src.replace('/preview', '/view')}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-[var(--radius)] transition-all opacity-0 group-hover:opacity-100"
              style={{ zIndex: 10000 }}
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className={className}>
        <div className="relative group">
          <video
            ref={videoRef}
            controls
            className="w-full"
            src={src}
            onLoadedMetadata={() => {
              if (typeof document !== 'undefined') {
                setIsPiPSupported(document.pictureInPictureEnabled || false);
              }
            }}
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
          
          {/* Bouton Picture-in-Picture manuel */}
          {isPiPSupported && (
            <button
              onClick={handlePiP}
              className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-[var(--radius)] transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-white text-xs"
              style={{ zIndex: 10000 }}
              title="Picture-in-Picture"
            >
              <PictureInPicture2 className="w-4 h-4" />
              <span className="hidden sm:inline">PiP</span>
            </button>
          )}
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

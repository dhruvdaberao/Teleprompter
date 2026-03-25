import { useEffect } from 'react';
import type { RefObject } from 'react';


type Props = {
  stream: MediaStream | null;
  videoRef: RefObject<HTMLVideoElement>;
  mirrorPreview: boolean;
};

export function CameraPreview({ stream, videoRef, mirrorPreview }: Props) {
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={`h-full w-full rounded-2xl object-cover ${mirrorPreview ? 'scale-x-[-1]' : ''}`}
    />
  );
}

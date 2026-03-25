import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useCameraStream(initialFacingMode: 'user' | 'environment', initialMicMuted: boolean) {
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(initialFacingMode);
  const [micMuted, setMicMuted] = useState(initialMicMuted);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const startStream = useCallback(
    async (mode = facingMode) => {
      setLoading(true);
      setError('');
      try {
        stopStream();
        const next = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode } },
          audio: true,
        });

        next.getAudioTracks().forEach((track) => {
          track.enabled = !micMuted;
        });

        streamRef.current = next;
        setStream(next);
        setFacingMode(mode);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not access camera/microphone.');
      } finally {
        setLoading(false);
      }
    },
    [facingMode, micMuted, stopStream],
  );

  const switchCamera = useCallback(async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    await startStream(nextMode);
  }, [facingMode, startStream]);

  const toggleMic = useCallback(() => {
    setMicMuted((prev) => {
      const next = !prev;
      streamRef.current?.getAudioTracks().forEach((track) => {
        track.enabled = !next;
      });
      return next;
    });
  }, []);

  useEffect(() => {
    void startStream(initialFacingMode);
    return () => stopStream();
  }, [initialFacingMode, startStream, stopStream]);

  return useMemo(
    () => ({
      stream,
      facingMode,
      micMuted,
      error,
      loading,
      startStream,
      switchCamera,
      toggleMic,
      setMicMuted,
      stopStream,
    }),
    [stream, facingMode, micMuted, error, loading, startStream, switchCamera, toggleMic, stopStream],
  );
}

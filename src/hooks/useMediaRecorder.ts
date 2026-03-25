import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { OverlaySettings, RecorderStatus } from '../types';


const MIME_CANDIDATES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];

function pickMimeType() {
  if (!('MediaRecorder' in window)) return '';
  return MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
}

export function useMediaRecorder(stream: MediaStream | null, videoRef: RefObject<HTMLVideoElement>) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [mimeType, setMimeType] = useState('');
  const [error, setError] = useState('');

  const timerRef = useRef<number | null>(null);
  const composedStreamRef = useRef<MediaStream | null>(null);

  const cleanupComposed = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    composedStreamRef.current?.getTracks().forEach((t) => t.stop());
    composedStreamRef.current = null;
  }, []);

  useEffect(() => {
    setMimeType(pickMimeType());
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }, [stopTimer]);

  const buildBurnStream = useCallback(
    (overlay: OverlaySettings, scriptText: string, scrollTop: number, mirrorPreview: boolean): MediaStream | null => {
      if (!stream || !videoRef.current) return null;
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const lines = scriptText.split('\n');
      const linePx = overlay.fontSize * overlay.lineHeight;

      const render = () => {
        ctx.save();
        if (mirrorPreview) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        const x = (overlay.xPct / 100) * canvas.width;
        const y = (overlay.yPct / 100) * canvas.height;
        const width = (overlay.widthPct / 100) * canvas.width;
        const maxHeight = (overlay.maxHeightPct / 100) * canvas.height;

        ctx.save();
        ctx.globalAlpha = overlay.opacity;
        if (overlay.blur) ctx.filter = 'blur(0px)';
        ctx.fillStyle = overlay.bgColor;
        ctx.beginPath();
        ctx.roundRect(x, y, width, maxHeight, overlay.borderRadius);
        ctx.fill();
        if (overlay.showBorder) {
          ctx.strokeStyle = 'rgba(255,255,255,.3)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.fillStyle = overlay.textColor;
        ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
        ctx.textAlign = overlay.align;
        const tx = overlay.align === 'left' ? x + overlay.padding : overlay.align === 'center' ? x + width / 2 : x + width - overlay.padding;
        const startLine = Math.floor(scrollTop / linePx);
        const yOffset = scrollTop - startLine * linePx;
        for (let i = startLine; i < lines.length; i += 1) {
          const py = y + overlay.padding + (i - startLine + 1) * linePx - yOffset;
          if (py > y + maxHeight - overlay.padding) break;
          ctx.fillText(lines[i], tx, py, width - overlay.padding * 2);
        }
        ctx.restore();

        animationRef.current = requestAnimationFrame(render);
      };
      render();

      const composed = canvas.captureStream(30);
      const audio = stream.getAudioTracks()[0];
      if (audio) composed.addTrack(audio);
      composedStreamRef.current = composed;
      return composed;
    },
    [stream, videoRef],
  );

  const start = useCallback(
    (burnOverlay: boolean, overlay: OverlaySettings, scriptText: string, scrollTop: number, mirrorPreview: boolean) => {
      if (!stream || !mimeType) {
        setError('Recording not supported in this browser.');
        return;
      }
      setError('');
      setBlob(null);
      setSeconds(0);
      chunksRef.current = [];
      const source = burnOverlay ? buildBurnStream(overlay, scriptText, scrollTop, mirrorPreview) : stream;
      if (!source) {
        setError('Unable to initialize burn-in recording stream.');
        return;
      }

      const recorder = new MediaRecorder(source, { mimeType });
      recorder.ondataavailable = (evt) => {
        if (evt.data.size > 0) chunksRef.current.push(evt.data);
      };
      recorder.onstop = () => {
        stopTimer();
        const next = new Blob(chunksRef.current, { type: mimeType });
        setBlob(next);
        setStatus('stopped');
        cleanupComposed();
      };
      recorder.onerror = () => {
        setError('Recording failed unexpectedly.');
        stopTimer();
        setStatus('idle');
        cleanupComposed();
      };

      recorder.start(250);
      recorderRef.current = recorder;
      setStatus('recording');
      startTimer();
    },
    [buildBurnStream, cleanupComposed, mimeType, startTimer, stopTimer, stream],
  );

  const pause = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.pause();
      setStatus('paused');
      stopTimer();
    }
  }, [stopTimer]);

  const resume = useCallback(() => {
    if (recorderRef.current?.state === 'paused') {
      recorderRef.current.resume();
      setStatus('recording');
      startTimer();
    }
  }, [startTimer]);

  const stop = useCallback(() => {
    if (!recorderRef.current) return;
    if (recorderRef.current.state !== 'inactive') recorderRef.current.stop();
  }, []);

  const discard = useCallback(() => {
    setBlob(null);
    setStatus('idle');
    setSeconds(0);
  }, []);

  useEffect(() => () => {
    stopTimer();
    cleanupComposed();
  }, [cleanupComposed, stopTimer]);

  return useMemo(
    () => ({ status, seconds, blob, error, mimeType, start, pause, resume, stop, discard }),
    [status, seconds, blob, error, mimeType, start, pause, resume, stop, discard],
  );
}

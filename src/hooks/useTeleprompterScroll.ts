import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

export function useTeleprompterScroll(scrollRef: RefObject<HTMLElement>, initialSpeed: number, initialTop = 0) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const speedRef = useRef(initialSpeed);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const initializedTopRef = useRef(false);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = null;
    lastRef.current = null;
  }, []);

  const step = useCallback(
    (ts: number) => {
      const el = scrollRef.current;
      if (!el) {
        pause();
        return;
      }
      if (lastRef.current === null) lastRef.current = ts;
      const delta = (ts - lastRef.current) / 1000;
      lastRef.current = ts;

      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
      const next = Math.min(maxScroll, el.scrollTop + speedRef.current * delta);
      el.scrollTop = next;

      if (next >= maxScroll) {
        pause();
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    },
    [pause, scrollRef],
  );

  const play = useCallback(() => {
    if (rafRef.current !== null) return;
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(step);
  }, [step]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
      return;
    }
    play();
  }, [isPlaying, pause, play]);

  const reset = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    pause();
    el.scrollTop = 0;
  }, [pause, scrollRef]);

  const jumpEnd = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    pause();
    el.scrollTop = el.scrollHeight;
  }, [pause, scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || initializedTopRef.current) return;
    el.scrollTop = initialTop;
    initializedTopRef.current = true;
  }, [initialTop, scrollRef]);

  useEffect(() => pause, [pause]);

  return { isPlaying, speed, setSpeed, play, pause, toggle, reset, jumpEnd };
}

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

export function useTeleprompterScroll(scrollRef: RefObject<HTMLElement>, initialSpeed: number, initialTop = 0) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  const step = useCallback(
    (ts: number) => {
      if (!scrollRef.current) return;
      if (lastRef.current === null) lastRef.current = ts;
      const delta = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      scrollRef.current.scrollTop += speed * delta;
      rafRef.current = requestAnimationFrame(step);
    },
    [scrollRef, speed],
  );

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastRef.current = null;
  }, []);

  const play = useCallback(() => {
    if (rafRef.current) return;
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(step);
  }, [step]);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const reset = useCallback(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = 0;
  }, [scrollRef]);

  const jumpEnd = useCallback(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [scrollRef]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = initialTop;
    }
  }, [initialTop, scrollRef]);

  useEffect(() => pause, [pause]);

  return { isPlaying, speed, setSpeed, play, pause, toggle, reset, jumpEnd };
}

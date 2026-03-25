import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

export function useTeleprompterScroll(scrollRef: RefObject<HTMLElement>, initialSpeed: number, initialTop = 0) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const [scrollTop, setScrollTop] = useState(initialTop);
  const [maxScroll, setMaxScroll] = useState(0);

  const speedRef = useRef(initialSpeed);
  const positionRef = useRef(initialTop);
  const maxScrollRef = useRef(0);
  const isPlayingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const initializedTopRef = useRef(false);

  const syncFromDom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nextMax = Math.max(0, el.scrollHeight - el.clientHeight);
    maxScrollRef.current = nextMax;
    setMaxScroll(nextMax);

    const clampedTop = Math.max(0, Math.min(el.scrollTop, nextMax));
    positionRef.current = clampedTop;
    setScrollTop(clampedTop);
  }, [scrollRef]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const pause = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastRef.current = null;
  }, []);

  const setScrollPosition = useCallback(
    (next: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(next, maxScrollRef.current));
      if (Math.abs(clamped - positionRef.current) < 0.1) return;
      positionRef.current = clamped;
      el.scrollTop = clamped;
      setScrollTop(clamped);
    },
    [scrollRef],
  );

  const step = useCallback(
    (ts: number) => {
      const el = scrollRef.current;
      if (!el || !isPlayingRef.current) {
        pause();
        return;
      }

      if (lastRef.current === null) lastRef.current = ts;
      const delta = (ts - lastRef.current) / 1000;
      lastRef.current = ts;

      const nextMax = Math.max(0, el.scrollHeight - el.clientHeight);
      maxScrollRef.current = nextMax;
      setMaxScroll(nextMax);

      const next = positionRef.current + speedRef.current * delta;
      if (next >= nextMax) {
        setScrollPosition(nextMax);
        pause();
        return;
      }

      setScrollPosition(next);
      rafRef.current = requestAnimationFrame(step);
    },
    [pause, scrollRef, setScrollPosition],
  );

  const play = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isPlayingRef.current) return;
    syncFromDom();
    if (positionRef.current >= maxScrollRef.current) return;
    isPlayingRef.current = true;
    setIsPlaying(true);
    lastRef.current = null;
    rafRef.current = requestAnimationFrame(step);
  }, [scrollRef, step, syncFromDom]);

  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
      return;
    }
    play();
  }, [pause, play]);

  const reset = useCallback(() => {
    pause();
    setScrollPosition(0);
  }, [pause, setScrollPosition]);

  const jumpEnd = useCallback(() => {
    pause();
    syncFromDom();
    setScrollPosition(maxScrollRef.current);
  }, [pause, setScrollPosition, syncFromDom]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || initializedTopRef.current) return;
    const nextMax = Math.max(0, el.scrollHeight - el.clientHeight);
    maxScrollRef.current = nextMax;
    setMaxScroll(nextMax);
    const clampedInitial = Math.max(0, Math.min(initialTop, nextMax));
    positionRef.current = clampedInitial;
    el.scrollTop = clampedInitial;
    setScrollTop(clampedInitial);
    initializedTopRef.current = true;
  }, [initialTop, scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const nextMax = Math.max(0, el.scrollHeight - el.clientHeight);
      maxScrollRef.current = nextMax;
      setMaxScroll(nextMax);
      const clampedTop = Math.max(0, Math.min(el.scrollTop, nextMax));
      positionRef.current = clampedTop;
      setScrollTop(clampedTop);
    };

    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    const firstChild = el.firstElementChild;
    if (firstChild) ro.observe(firstChild);

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', onScroll);
    };
  }, [scrollRef]);

  useEffect(() => pause, [pause]);

  return { isPlaying, speed, setSpeed, play, pause, toggle, reset, jumpEnd, scrollTop, maxScroll, setScrollPosition };
}

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

export function useTeleprompterScroll(scrollRef: RefObject<HTMLElement>, initialSpeed: number, initialTop = 0) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const [scrollTop, setScrollTop] = useState(initialTop);
  const [maxScroll, setMaxScroll] = useState(0);

  const speedRef = useRef(initialSpeed);
  const isPlayingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const initializedTopRef = useRef(false);

  const syncMetrics = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return { top: 0, max: 0 };

    const nextMax = Math.max(0, el.scrollHeight - el.clientHeight);
    const nextTop = Math.max(0, Math.min(el.scrollTop, nextMax));

    if (el.scrollTop !== nextTop) el.scrollTop = nextTop;

    setMaxScroll(nextMax);
    setScrollTop(nextTop);

    return { top: nextTop, max: nextMax };
  }, [scrollRef]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const pause = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    lastFrameRef.current = null;
  }, []);

  const setScrollPosition = useCallback(
    (next: number) => {
      const el = scrollRef.current;
      if (!el) return;

      const nextMax = Math.max(0, el.scrollHeight - el.clientHeight);
      const clamped = Math.max(0, Math.min(next, nextMax));

      el.scrollTop = clamped;
      setScrollTop(clamped);
      setMaxScroll(nextMax);
    },
    [scrollRef],
  );

  const step = useCallback(
    (timestamp: number) => {
      const el = scrollRef.current;
      if (!el || !isPlayingRef.current) {
        pause();
        return;
      }

      const nextMax = Math.max(0, el.scrollHeight - el.clientHeight);
      setMaxScroll(nextMax);

      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }

      const deltaSeconds = (timestamp - lastFrameRef.current) / 1000;
      lastFrameRef.current = timestamp;

      const distance = speedRef.current * deltaSeconds;
      const nextTop = Math.min(el.scrollTop + distance, nextMax);

      el.scrollTop = nextTop;
      setScrollTop(nextTop);

      if (nextTop >= nextMax) {
        pause();
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    },
    [pause, scrollRef],
  );

  const play = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isPlayingRef.current) return;

    const { top, max } = syncMetrics();
    if (top >= max) return;

    isPlayingRef.current = true;
    setIsPlaying(true);
    lastFrameRef.current = null;
    rafRef.current = requestAnimationFrame(step);
  }, [scrollRef, step, syncMetrics]);

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
    const { max } = syncMetrics();
    setScrollPosition(max);
  }, [pause, setScrollPosition, syncMetrics]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || initializedTopRef.current) return;

    const nextMax = Math.max(0, el.scrollHeight - el.clientHeight);
    const clamped = Math.max(0, Math.min(initialTop, nextMax));

    el.scrollTop = clamped;
    setScrollTop(clamped);
    setMaxScroll(nextMax);

    initializedTopRef.current = true;
  }, [initialTop, scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const nextMax = Math.max(0, el.scrollHeight - el.clientHeight);
      const clamped = Math.max(0, Math.min(el.scrollTop, nextMax));
      setScrollTop(clamped);
      setMaxScroll(nextMax);
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

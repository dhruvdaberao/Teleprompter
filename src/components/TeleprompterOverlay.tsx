import { useMemo, useRef, useState } from 'react';
import type { PointerEventHandler, RefObject } from 'react';
import type { OverlaySettings } from '../types';

type Props = {
  script: string;
  settings: OverlaySettings;
  onSettingsChange: (next: OverlaySettings) => void;
  scrollRef: RefObject<HTMLDivElement>;
  onToggleScroll: () => void;
};

export function TeleprompterOverlay({ script, settings, onSettingsChange, scrollRef, onToggleScroll }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [draggingCard, setDraggingCard] = useState(false);
  const [draggingGuide, setDraggingGuide] = useState(false);

  const style = useMemo(
    () => ({
      left: `${settings.xPct}%`,
      top: `${settings.yPct}%`,
      width: `${settings.widthPct}%`,
      maxHeight: `${settings.maxHeightPct}%`,
      backgroundColor: settings.bgColor,
      color: settings.textColor,
      opacity: settings.opacity,
      fontSize: `${settings.fontSize}px`,
      lineHeight: settings.lineHeight,
      letterSpacing: `${settings.letterSpacing}px`,
      padding: `${settings.padding}px`,
      borderRadius: `${settings.borderRadius}px`,
      boxShadow: `0 14px ${settings.shadow}px rgba(0,0,0,.4)`,
      textAlign: settings.align,
      fontFamily: settings.fontFamily,
      backdropFilter: settings.blur ? 'blur(8px)' : 'none',
      border: settings.showBorder ? '1px solid rgba(255,255,255,.22)' : 'none',
      transform: settings.mirrorScript ? 'scaleX(-1)' : undefined,
      touchAction: 'none' as const,
    }),
    [settings],
  );

  const onCardPointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    if ((event.target as HTMLElement).dataset.role === 'guide-line') return;
    const el = cardRef.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    event.preventDefault();
    setDraggingCard(true);
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = settings.xPct;
    const startTop = settings.yPct;

    const move = (ev: PointerEvent) => {
      ev.preventDefault();
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const nextLeft = startLeft + (dx / parent.clientWidth) * 100;
      const nextTop = startTop + (dy / parent.clientHeight) * 100;
      onSettingsChange({
        ...settings,
        xPct: Math.max(0, Math.min(nextLeft, 100 - settings.widthPct)),
        yPct: Math.max(0, Math.min(nextTop, 100 - settings.maxHeightPct)),
      });
    };

    const up = () => {
      setDraggingCard(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
  };

  const onGuidePointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    const el = cardRef.current;
    if (!el) return;
    setDraggingGuide(true);
    const startY = event.clientY;
    const startGuide = settings.guideLineYPct;

    const move = (ev: PointerEvent) => {
      ev.preventDefault();
      const dy = ev.clientY - startY;
      const next = startGuide + (dy / el.clientHeight) * 100;
      onSettingsChange({ ...settings, guideLineYPct: Math.max(0, Math.min(100, next)) });
    };

    const up = () => {
      setDraggingGuide(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
  };

  return (
    <div
      ref={cardRef}
      className={`absolute z-20 overflow-hidden ${draggingCard ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      style={style}
      onPointerDown={onCardPointerDown}
      onDoubleClick={onToggleScroll}
      aria-label="Teleprompter overlay"
      role="region"
    >
      <div ref={scrollRef} className="max-h-full overflow-y-auto whitespace-pre-wrap pr-2 [scrollbar-width:thin]">
        {script || 'Type your script to begin...'}
      </div>

      {settings.showGuideLine && (
        <div
          data-role="guide-line"
          className={`pointer-events-auto absolute left-0 right-0 h-[2px] -translate-y-1/2 bg-cyan-300/85 shadow-[0_0_8px_rgba(34,211,238,0.6)] ${draggingGuide ? 'cursor-ns-resize' : 'cursor-row-resize'}`}
          style={{ top: `${settings.guideLineYPct}%` }}
          onPointerDown={onGuidePointerDown}
          aria-label="Reading guide line"
        />
      )}
    </div>
  );
}

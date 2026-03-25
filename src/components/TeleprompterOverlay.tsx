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
  const [dragging, setDragging] = useState(false);

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
      boxShadow: `0 20px ${settings.shadow}px rgba(0,0,0,.45)`,
      textAlign: settings.align,
      fontFamily: settings.fontFamily,
      backdropFilter: settings.blur ? 'blur(10px)' : 'none',
      border: settings.showBorder ? '1px solid rgba(255,255,255,.25)' : 'none',
      transform: settings.mirrorScript ? 'scaleX(-1)' : undefined,
      touchAction: 'none' as const,
    }),
    [settings],
  );

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    const el = cardRef.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    event.preventDefault();
    setDragging(true);
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = settings.xPct;
    const startTop = settings.yPct;

    const move = (ev: PointerEvent) => {
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
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
  };

  return (
    <div
      ref={cardRef}
      className={`absolute z-20 overflow-hidden ${dragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      style={style}
      onPointerDown={onPointerDown}
      onDoubleClick={onToggleScroll}
      aria-label="Teleprompter overlay"
      role="region"
    >
      <div ref={scrollRef} className="max-h-full overflow-y-auto whitespace-pre-wrap pr-2 scrollbar-thin scrollbar-thumb-slate-500">
        {script || 'Type your script to begin...'}
      </div>
    </div>
  );
}

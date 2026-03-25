import { useMemo, useRef, useState } from 'react';
import type { PointerEventHandler, RefObject } from 'react';
import type { OverlaySettings } from '../types';

type Props = {
  script: string;
  settings: OverlaySettings;
  onSettingsChange: (next: OverlaySettings) => void;
  scrollRef: RefObject<HTMLDivElement>;
  onToggleScroll: () => void;
  manualScrollEnabled?: boolean;
};

type ResizeMode = 'width' | 'height' | 'both';

const MIN_WIDTH_PCT = 30;
const MIN_HEIGHT_PCT = 22;
const GUIDE_PADDING_PX = 6;
const FLOW_SPACER_VH = 42;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function TeleprompterOverlay({ script, settings, onSettingsChange, scrollRef, onToggleScroll, manualScrollEnabled = true }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [draggingCard, setDraggingCard] = useState(false);
  const [draggingGuide, setDraggingGuide] = useState(false);

  const style = useMemo(
    () => ({
      left: `${settings.xPct}%`,
      top: `${settings.yPct}%`,
      width: `${settings.widthPct}%`,
      height: `${settings.maxHeightPct}%`,
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
    }),
    [settings],
  );

  const onCardPointerDown: PointerEventHandler<HTMLElement> = (event) => {
    const el = cardRef.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    event.preventDefault();
    event.stopPropagation();
    setDraggingCard(true);

    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = settings.xPct;
    const startTop = settings.yPct;
    const { widthPct, maxHeightPct } = settings;

    const move = (ev: PointerEvent) => {
      ev.preventDefault();
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const nextLeft = startLeft + (dx / parent.clientWidth) * 100;
      const nextTop = startTop + (dy / parent.clientHeight) * 100;

      onSettingsChange({
        ...settings,
        xPct: clamp(nextLeft, 0, 100 - widthPct),
        yPct: clamp(nextTop, 0, 100 - maxHeightPct),
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
    event.preventDefault();
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
      const minPct = (GUIDE_PADDING_PX / el.clientHeight) * 100;
      const maxPct = 100 - minPct;
      onSettingsChange({ ...settings, guideLineYPct: clamp(next, minPct, maxPct) });
    };

    const up = () => {
      setDraggingGuide(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
  };

  const onResizePointerDown = (mode: ResizeMode): PointerEventHandler<HTMLDivElement> => (event) => {
    const el = cardRef.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = settings.widthPct;
    const startHeight = settings.maxHeightPct;

    const move = (ev: PointerEvent) => {
      ev.preventDefault();
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      const nextWidthPct = startWidth + (dx / parent.clientWidth) * 100;
      const nextHeightPct = startHeight + (dy / parent.clientHeight) * 100;

      const maxWidthPct = 100 - settings.xPct;
      const maxHeightPct = 100 - settings.yPct;

      const widthPct = clamp(nextWidthPct, MIN_WIDTH_PCT, maxWidthPct);
      const heightPct = clamp(nextHeightPct, MIN_HEIGHT_PCT, maxHeightPct);

      const nextSettings: OverlaySettings = {
        ...settings,
        widthPct: mode === 'height' ? settings.widthPct : widthPct,
        maxHeightPct: mode === 'width' ? settings.maxHeightPct : heightPct,
      };

      const guideMinPct = (GUIDE_PADDING_PX / el.clientHeight) * 100;
      const guideMaxPct = 100 - guideMinPct;
      nextSettings.guideLineYPct = clamp(nextSettings.guideLineYPct, guideMinPct, guideMaxPct);

      onSettingsChange(nextSettings);
    };

    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
  };

  return (
    <div
      ref={cardRef}
      className="absolute z-20 overflow-hidden max-w-full"
      style={style}
      onDoubleClick={manualScrollEnabled ? onToggleScroll : undefined}
      aria-label="Teleprompter overlay"
      role="region"
    >
      <button
        type="button"
        onPointerDown={onCardPointerDown}
        className={`absolute left-1/2 top-2 z-30 h-1.5 w-20 -translate-x-1/2 rounded-full bg-white/40 transition hover:bg-white/70 ${draggingCard ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ touchAction: 'none' }}
        aria-label="Drag teleprompter overlay"
      />

      <div
        ref={scrollRef}
        className={`h-full whitespace-pre-wrap pr-2 pt-7 [scrollbar-width:thin] ${manualScrollEnabled ? 'touch-pan-y overflow-y-auto' : 'overflow-y-hidden'}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div aria-hidden="true" style={{ minHeight: `${FLOW_SPACER_VH}%` }} />
        <div>{script || 'Type your script to begin...'}</div>
        <div aria-hidden="true" style={{ minHeight: `${FLOW_SPACER_VH}%` }} />
      </div>

      {settings.showGuideLine && (
        <div
          data-role="guide-line-hit-area"
          className={`absolute left-0 right-0 z-40 h-7 -translate-y-1/2 ${draggingGuide ? 'cursor-ns-resize' : 'cursor-row-resize'}`}
          style={{ top: `${settings.guideLineYPct}%`, touchAction: 'none' }}
          onPointerDown={onGuidePointerDown}
          aria-label="Move reading guide"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(settings.guideLineYPct)}
          tabIndex={0}
        >
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-cyan-300/90 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/90 bg-cyan-300/80" />
        </div>
      )}

      <div
        className={`absolute bottom-0 right-0 top-0 z-50 w-4 cursor-ew-resize`}
        style={{ touchAction: 'none' }}
        onPointerDown={onResizePointerDown('width')}
        aria-label="Resize teleprompter width"
      >
        <div className="absolute bottom-4 right-1 top-4 w-[2px] rounded-full bg-white/25" />
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 z-50 h-4 cursor-ns-resize`}
        style={{ touchAction: 'none' }}
        onPointerDown={onResizePointerDown('height')}
        aria-label="Resize teleprompter height"
      >
        <div className="absolute bottom-1 left-4 right-4 h-[2px] rounded-full bg-white/25" />
      </div>

      <div
        className={`absolute bottom-0 right-0 z-[60] h-7 w-7 cursor-nwse-resize`}
        style={{ touchAction: 'none' }}
        onPointerDown={onResizePointerDown('both')}
        aria-label="Resize teleprompter width and height"
      >
        <div className="absolute bottom-[5px] right-[5px] h-3.5 w-3.5 rounded-sm border-r-2 border-b-2 border-white/55" />
      </div>
    </div>
  );
}

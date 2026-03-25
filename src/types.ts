export type TextAlignMode = 'left' | 'center' | 'right';

export type OverlaySettings = {
  xPct: number;
  yPct: number;
  widthPct: number;
  maxHeightPct: number;
  opacity: number;
  bgColor: string;
  textColor: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  padding: number;
  borderRadius: number;
  shadow: number;
  align: TextAlignMode;
  fontFamily: string;
  blur: boolean;
  showBorder: boolean;
  mirrorScript: boolean;
  showGuideLine: boolean;
  guideLineYPct: number;
};

export type RecorderStatus = 'idle' | 'recording' | 'paused' | 'stopped';

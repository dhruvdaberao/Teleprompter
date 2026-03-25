import type { OverlaySettings } from '../types';

export const SAMPLE_SCRIPT = `Welcome to your teleprompter recording session.

Speak naturally, smile, and keep your eye line steady.
This app helps you stay on script while recording clean footage.

Tip: slow down for emphasis on key points.

When you're ready, hit record and deliver with confidence.`;

export const DEFAULT_OVERLAY_SETTINGS: OverlaySettings = {
  xPct: 16,
  yPct: 10,
  widthPct: 68,
  maxHeightPct: 52,
  opacity: 0.62,
  bgColor: '#0f172a',
  textColor: '#f8fafc',
  fontSize: 30,
  lineHeight: 1.45,
  letterSpacing: 0,
  padding: 18,
  borderRadius: 16,
  shadow: 18,
  align: 'left',
  fontFamily: 'Inter, system-ui, sans-serif',
  blur: true,
  showBorder: true,
  mirrorScript: false,
  showGuideLine: true,
  guideLineYPct: 50,
};

export const STORAGE_KEYS = {
  script: 'teleprompter_script',
  overlay: 'teleprompter_overlay_settings',
  scrollSpeed: 'teleprompter_scroll_speed',
  scrollTop: 'teleprompter_scroll_top',
  mirrorPreview: 'teleprompter_mirror_preview',
  burnOverlay: 'teleprompter_burn_overlay',
  facingMode: 'teleprompter_facing_mode',
  mutedMic: 'teleprompter_mic_muted',
};

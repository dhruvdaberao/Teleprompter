# Teleprompter Video Recorder

A production-focused React + TypeScript + Vite + Tailwind web app for recording talking-head videos while reading a draggable teleprompter overlay.

## Features

- Live camera + microphone preview with front/rear switch and mic toggle.
- Draggable teleprompter card over video with rich styling controls.
- Script editor with sample/paste/clear and persisted local state.
- Smooth teleprompter auto-scroll with keyboard shortcuts.
- Recording controls (start/pause/resume/stop), timer, red recording indicator.
- Default **overlay-only mode** (clean output), plus optional **burn-in mode**.
- Download and share flow with review panel, file size, and custom file name.
- Error handling for unsupported APIs and permission issues.
- Mobile-first responsive layout.

## Quick start

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Browser notes

- Best on Chromium browsers (Chrome/Edge desktop + Android).
- Safari support varies by MediaRecorder codec support and camera constraints.
- Burn-in mode is heavier and can reduce performance on low-end mobile devices.

## Keyboard shortcuts (desktop)

- `Space`: play/pause teleprompter scroll
- `ArrowUp`: slower scroll
- `ArrowDown`: faster scroll
- `R`: reset to top

## Architecture

- `src/hooks/useCameraStream.ts`: camera + mic lifecycle and controls
- `src/hooks/useMediaRecorder.ts`: recording pipeline, MIME negotiation, optional burn-in composition
- `src/hooks/useTeleprompterScroll.ts`: smooth requestAnimationFrame scrolling
- `src/components/*`: modular UI panels and preview overlays

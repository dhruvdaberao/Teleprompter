import { useEffect, useMemo, useRef } from 'react';
import { CameraPreview } from './components/CameraPreview';
import { ExportPanel } from './components/ExportPanel';
import { OverlayControls } from './components/OverlayControls';
import { RecordingControls } from './components/RecordingControls';
import { ScriptEditor } from './components/ScriptEditor';
import { ScrollControls } from './components/ScrollControls';
import { TeleprompterOverlay } from './components/TeleprompterOverlay';
import { useCameraStream } from './hooks/useCameraStream';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { useMediaRecorder } from './hooks/useMediaRecorder';
import { useTeleprompterScroll } from './hooks/useTeleprompterScroll';
import { DEFAULT_OVERLAY_SETTINGS, SAMPLE_SCRIPT, STORAGE_KEYS } from './utils/constants';

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num));
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [script, setScript] = useLocalStorageState(STORAGE_KEYS.script, SAMPLE_SCRIPT);
  const [overlaySettings, setOverlaySettings] = useLocalStorageState(STORAGE_KEYS.overlay, DEFAULT_OVERLAY_SETTINGS);
  const [scrollSpeed, setScrollSpeed] = useLocalStorageState(STORAGE_KEYS.scrollSpeed, 58);
  const [scrollTop, setScrollTop] = useLocalStorageState(STORAGE_KEYS.scrollTop, 0);
  const [mirrorPreview, setMirrorPreview] = useLocalStorageState(STORAGE_KEYS.mirrorPreview, true);
  const [burnOverlay, setBurnOverlay] = useLocalStorageState(STORAGE_KEYS.burnOverlay, false);
  const [facingMode, setFacingMode] = useLocalStorageState<'user' | 'environment'>(STORAGE_KEYS.facingMode, 'user');
  const [savedMicMuted, setSavedMicMuted] = useLocalStorageState(STORAGE_KEYS.mutedMic, false);

  const camera = useCameraStream(facingMode, savedMicMuted);
  const recorder = useMediaRecorder(camera.stream, videoRef);
  const teleprompter = useTeleprompterScroll(scrollRef, scrollSpeed, scrollTop);

  useEffect(() => setScrollSpeed(teleprompter.speed), [setScrollSpeed, teleprompter.speed]);
  useEffect(() => setSavedMicMuted(camera.micMuted), [camera.micMuted, setSavedMicMuted]);
  useEffect(() => setFacingMode(camera.facingMode), [camera.facingMode, setFacingMode]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [setScrollTop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        teleprompter.toggle();
      }
      if (e.key === 'ArrowUp') teleprompter.setSpeed((s) => clamp(s - 8, 15, 260));
      if (e.key === 'ArrowDown') teleprompter.setSpeed((s) => clamp(s + 8, 15, 260));
      if (e.key.toLowerCase() === 'r') teleprompter.reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [teleprompter]);

  const error = useMemo(() => camera.error || recorder.error, [camera.error, recorder.error]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-3 md:p-6">
      <div className="mx-auto max-w-[1400px] space-y-4">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur">
          <h1 className="text-xl font-semibold">Teleprompter Video Recorder</h1>
          <p className="text-sm text-slate-400">Record polished talking-head videos with a draggable, customizable teleprompter overlay.</p>
        </header>

        {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

        <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4">
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-slate-700 bg-black sm:aspect-video">
              <CameraPreview stream={camera.stream} videoRef={videoRef} mirrorPreview={mirrorPreview} />
              <TeleprompterOverlay
                script={script}
                settings={overlaySettings}
                onSettingsChange={setOverlaySettings}
                scrollRef={scrollRef}
                onToggleScroll={teleprompter.toggle}
              />
              {camera.loading && <div className="absolute inset-0 grid place-items-center bg-black/60 text-sm">Connecting camera…</div>}
            </div>

            <RecordingControls
              status={recorder.status}
              seconds={recorder.seconds}
              canPause={typeof MediaRecorder !== 'undefined' && 'pause' in MediaRecorder.prototype}
              onStart={() => recorder.start(burnOverlay, overlaySettings, script, scrollRef.current?.scrollTop ?? 0, mirrorPreview)}
              onPause={recorder.pause}
              onResume={recorder.resume}
              onStop={recorder.stop}
              onSwitchCamera={camera.switchCamera}
              onToggleMic={camera.toggleMic}
              micMuted={camera.micMuted}
            />
            <ExportPanel blob={recorder.blob} onDiscard={recorder.discard} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <ScriptEditor script={script} onScriptChange={setScript} disabled={recorder.status === 'recording'} />
            <ScrollControls
              isPlaying={teleprompter.isPlaying}
              speed={teleprompter.speed}
              onSpeedChange={teleprompter.setSpeed}
              onToggle={teleprompter.toggle}
              onReset={teleprompter.reset}
              onJumpEnd={teleprompter.jumpEnd}
            />
            <OverlayControls
              settings={overlaySettings}
              onChange={setOverlaySettings}
              mirrorPreview={mirrorPreview}
              onMirrorPreviewChange={setMirrorPreview}
              burnOverlay={burnOverlay}
              onBurnOverlayChange={setBurnOverlay}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

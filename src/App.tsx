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
import type { OverlaySettings } from './types';
import { DEFAULT_OVERLAY_SETTINGS, SAMPLE_SCRIPT, STORAGE_KEYS } from './utils/constants';

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num));
}

function normalizeSettings(settings: OverlaySettings): OverlaySettings {
  return { ...DEFAULT_OVERLAY_SETTINGS, ...settings };
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [script, setScript] = useLocalStorageState(STORAGE_KEYS.script, SAMPLE_SCRIPT);
  const [overlaySettings, setOverlaySettings] = useLocalStorageState(STORAGE_KEYS.overlay, DEFAULT_OVERLAY_SETTINGS);
  const [scrollSpeed, setScrollSpeed] = useLocalStorageState(STORAGE_KEYS.scrollSpeed, 52);
  const [scrollTop, setScrollTop] = useLocalStorageState(STORAGE_KEYS.scrollTop, 0);
  const [mirrorPreview, setMirrorPreview] = useLocalStorageState(STORAGE_KEYS.mirrorPreview, true);
  const [burnOverlay, setBurnOverlay] = useLocalStorageState(STORAGE_KEYS.burnOverlay, false);
  const [facingMode, setFacingMode] = useLocalStorageState<'user' | 'environment'>(STORAGE_KEYS.facingMode, 'user');
  const [savedMicMuted, setSavedMicMuted] = useLocalStorageState(STORAGE_KEYS.mutedMic, false);

  const mergedSettings = useMemo(() => normalizeSettings(overlaySettings), [overlaySettings]);

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
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [setScrollTop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        teleprompter.toggle();
      }
      if (e.key === 'ArrowUp') teleprompter.setSpeed((s) => clamp(s - 8, 10, 260));
      if (e.key === 'ArrowDown') teleprompter.setSpeed((s) => clamp(s + 8, 10, 260));
      if (e.key.toLowerCase() === 'r') teleprompter.reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [teleprompter]);

  const error = useMemo(() => camera.error || recorder.error, [camera.error, recorder.error]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-3 md:p-5">
      <div className="mx-auto max-w-[1500px] space-y-4">
        <header className="rounded-2xl border border-slate-800/90 bg-slate-900/75 p-4">
          <h1 className="text-xl font-semibold">Teleprompter Video Recorder</h1>
          <p className="text-sm text-slate-400">Centered preview, cleaner sidebars, and smooth teleprompter scrolling.</p>
        </header>

        {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

        <section className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
          <aside className="order-2 space-y-4 xl:order-1">
            <div className="hidden xl:block">
              <ScriptEditor script={script} onScriptChange={setScript} disabled={recorder.status === 'recording'} />
              <div className="mt-4">
                <ScrollControls
                  isPlaying={teleprompter.isPlaying}
                  canResume={teleprompter.scrollTop > 0 && teleprompter.scrollTop < teleprompter.maxScroll}
                  speed={teleprompter.speed}
                  showGuideLine={mergedSettings.showGuideLine}
                  onSpeedChange={teleprompter.setSpeed}
                  onToggle={teleprompter.toggle}
                  onReset={teleprompter.reset}
                  onJumpEnd={teleprompter.jumpEnd}
                  onToggleGuideLine={() => setOverlaySettings({ ...mergedSettings, showGuideLine: !mergedSettings.showGuideLine })}
                  onResetGuideLine={() => setOverlaySettings({ ...mergedSettings, guideLineYPct: 50 })}
                />
              </div>
            </div>

            <div className="xl:hidden panel space-y-2">
              <details open>
                <summary className="cursor-pointer text-sm font-medium">Script</summary>
                <div className="mt-3">
                  <ScriptEditor script={script} onScriptChange={setScript} disabled={recorder.status === 'recording'} />
                </div>
              </details>
              <details>
                <summary className="cursor-pointer text-sm font-medium">Teleprompter controls</summary>
                <div className="mt-3">
                  <ScrollControls
                    isPlaying={teleprompter.isPlaying}
                    canResume={teleprompter.scrollTop > 0 && teleprompter.scrollTop < teleprompter.maxScroll}
                    speed={teleprompter.speed}
                    showGuideLine={mergedSettings.showGuideLine}
                    onSpeedChange={teleprompter.setSpeed}
                    onToggle={teleprompter.toggle}
                    onReset={teleprompter.reset}
                    onJumpEnd={teleprompter.jumpEnd}
                    onToggleGuideLine={() => setOverlaySettings({ ...mergedSettings, showGuideLine: !mergedSettings.showGuideLine })}
                    onResetGuideLine={() => setOverlaySettings({ ...mergedSettings, guideLineYPct: 50 })}
                  />
                </div>
              </details>
            </div>
          </aside>

          <section className="order-1 xl:order-2 space-y-4">
            <div className="relative mx-auto aspect-[9/16] w-full max-w-[860px] overflow-hidden rounded-2xl border border-slate-700 bg-black sm:aspect-video">
              <CameraPreview stream={camera.stream} videoRef={videoRef} mirrorPreview={mirrorPreview} />
              <TeleprompterOverlay
                script={script}
                settings={mergedSettings}
                onSettingsChange={setOverlaySettings}
                scrollRef={scrollRef}
                onToggleScroll={teleprompter.toggle}
              />
              {camera.loading && <div className="absolute inset-0 grid place-items-center bg-black/60 text-sm">Connecting camera…</div>}
            </div>

            <div className="mx-auto w-full max-w-[860px]">
              <RecordingControls
                status={recorder.status}
                seconds={recorder.seconds}
                canPause={typeof MediaRecorder !== 'undefined' && 'pause' in MediaRecorder.prototype}
                onStart={() => recorder.start(burnOverlay, mergedSettings, script, scrollRef.current?.scrollTop ?? 0, mirrorPreview)}
                onPause={recorder.pause}
                onResume={recorder.resume}
                onStop={recorder.stop}
                onSwitchCamera={camera.switchCamera}
                onToggleMic={camera.toggleMic}
                micMuted={camera.micMuted}
              />
            </div>
          </section>

          <aside className="order-3 space-y-4">
            <OverlayControls
              settings={mergedSettings}
              onChange={setOverlaySettings}
              mirrorPreview={mirrorPreview}
              onMirrorPreviewChange={setMirrorPreview}
              burnOverlay={burnOverlay}
              onBurnOverlayChange={setBurnOverlay}
            />
            <ExportPanel blob={recorder.blob} onDiscard={recorder.discard} />
          </aside>
        </section>
      </div>
    </main>
  );
}

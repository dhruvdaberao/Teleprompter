import type { RecorderStatus } from '../types';

type Props = {
  status: RecorderStatus;
  seconds: number;
  canPause: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSwitchCamera: () => void;
  onToggleMic: () => void;
  micMuted: boolean;
};

const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export function RecordingControls({ status, seconds, canPause, onStart, onPause, onResume, onStop, onSwitchCamera, onToggleMic, micMuted }: Props) {
  const active = status === 'recording' || status === 'paused';
  return (
    <section className="panel">
      <div className="flex items-center justify-between">
        <h2 className="panel-title">Recording</h2>
        <div className="flex items-center gap-2 text-xs">
          {status === 'recording' && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />}
          <span>{formatTime(seconds)}</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        {!active && <button className="btn-primary" onClick={onStart}>Start</button>}
        {status === 'recording' && canPause && <button className="btn-secondary" onClick={onPause}>Pause</button>}
        {status === 'paused' && canPause && <button className="btn-secondary" onClick={onResume}>Resume</button>}
        {active && <button className="btn-danger" onClick={onStop}>Stop</button>}
        <button className="btn-secondary" onClick={onSwitchCamera} disabled={active}>Switch Cam</button>
        <button className="btn-secondary" onClick={onToggleMic}>{micMuted ? 'Mic Off' : 'Mic On'}</button>
      </div>
    </section>
  );
}

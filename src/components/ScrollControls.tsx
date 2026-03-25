type Props = {
  isPlaying: boolean;
  canResume: boolean;
  speed: number;
  showGuideLine: boolean;
  onSpeedChange: (value: number) => void;
  onToggle: () => void;
  onReset: () => void;
  onJumpEnd: () => void;
  onToggleGuideLine: () => void;
  onResetGuideLine: () => void;
};

export function ScrollControls({
  isPlaying,
  canResume,
  speed,
  showGuideLine,
  onSpeedChange,
  onToggle,
  onReset,
  onJumpEnd,
  onToggleGuideLine,
  onResetGuideLine,
}: Props) {
  return (
    <section className="panel">
      <h2 className="panel-title">Teleprompter</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button className="btn-primary" onClick={onToggle}>{isPlaying ? 'Pause' : canResume ? 'Resume' : 'Play'}</button>
        <button className="btn-secondary" onClick={onReset}>Top</button>
        <button className="btn-secondary" onClick={onJumpEnd}>End</button>
      </div>

      <label className="mt-3 block text-xs text-slate-300">
        Scroll speed ({Math.round(speed)} px/s)
        <input type="range" min={10} max={260} value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))} className="mt-1 w-full" />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <button className="btn-secondary" onClick={onToggleGuideLine}>{showGuideLine ? 'Hide guide' : 'Show guide'}</button>
        <button className="btn-secondary" onClick={onResetGuideLine}>Center guide</button>
      </div>
    </section>
  );
}

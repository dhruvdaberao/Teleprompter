type Props = {
  isPlaying: boolean;
  speed: number;
  onSpeedChange: (value: number) => void;
  onToggle: () => void;
  onReset: () => void;
  onJumpEnd: () => void;
};

export function ScrollControls({ isPlaying, speed, onSpeedChange, onToggle, onReset, onJumpEnd }: Props) {
  return (
    <section className="panel">
      <h2 className="panel-title">Teleprompter</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button className="btn-secondary" onClick={onToggle}>{isPlaying ? 'Pause' : 'Play'}</button>
        <button className="btn-secondary" onClick={onReset}>Top</button>
        <button className="btn-secondary" onClick={onJumpEnd}>End</button>
      </div>
      <label className="mt-3 block text-xs text-slate-300">
        Scroll speed ({Math.round(speed)} px/s)
        <input type="range" min={15} max={260} value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))} className="mt-1 w-full" />
      </label>
    </section>
  );
}

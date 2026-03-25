import { SAMPLE_SCRIPT } from '../utils/constants';

type Props = {
  script: string;
  onScriptChange: (value: string) => void;
  disabled: boolean;
};

export function ScriptEditor({ script, onScriptChange, disabled }: Props) {
  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;

  return (
    <section className="panel">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="panel-title">Script</h2>
        <span className="text-xs text-slate-400">{wordCount} words</span>
      </div>
      <textarea
        value={script}
        disabled={disabled}
        onChange={(e) => onScriptChange(e.target.value)}
        className="h-44 w-full resize-y rounded-xl border border-slate-700 bg-slate-950/80 p-3 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
        placeholder="Paste or write your script here..."
      />
      <div className="mt-2 grid grid-cols-3 gap-2">
        <button className="btn-secondary" onClick={() => onScriptChange('')} disabled={disabled}>Clear</button>
        <button className="btn-secondary" onClick={() => onScriptChange(SAMPLE_SCRIPT)} disabled={disabled}>Sample</button>
        <button className="btn-secondary" onClick={() => navigator.clipboard.readText().then(onScriptChange).catch(() => undefined)} disabled={disabled}>Paste</button>
      </div>
    </section>
  );
}

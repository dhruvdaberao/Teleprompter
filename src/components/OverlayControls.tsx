import type { OverlaySettings, TextAlignMode } from '../types';

type Props = {
  settings: OverlaySettings;
  onChange: (next: OverlaySettings) => void;
  mirrorPreview: boolean;
  onMirrorPreviewChange: (next: boolean) => void;
  burnOverlay: boolean;
  onBurnOverlayChange: (next: boolean) => void;
};

const alignments: TextAlignMode[] = ['left', 'center', 'right'];

export function OverlayControls({ settings, onChange, mirrorPreview, onMirrorPreviewChange, burnOverlay, onBurnOverlayChange }: Props) {
  const update = <K extends keyof OverlaySettings>(key: K, value: OverlaySettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <section className="panel space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="panel-title">Appearance</h2>
        <button className="btn-secondary px-2 py-1 text-xs" onClick={() => onChange({ ...settings, xPct: 16, yPct: 10 })}>Reset position</button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <label>Width<input className="input-range" type="range" min={30} max={96} value={settings.widthPct} onChange={(e) => update('widthPct', Number(e.target.value))} /></label>
        <label>Height<input className="input-range" type="range" min={22} max={92} value={settings.maxHeightPct} onChange={(e) => update('maxHeightPct', Number(e.target.value))} /></label>
        <label>Opacity<input className="input-range" type="range" min={0.2} max={1} step={0.05} value={settings.opacity} onChange={(e) => update('opacity', Number(e.target.value))} /></label>
        <label>Font size<input className="input-range" type="range" min={16} max={64} value={settings.fontSize} onChange={(e) => update('fontSize', Number(e.target.value))} /></label>
      </div>

      <details className="rounded-lg border border-slate-700/80 p-2">
        <summary className="cursor-pointer text-xs text-slate-300">Advanced text & export</summary>
        <div className="mt-3 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <label>Line height<input className="input-range" type="range" min={1} max={2.2} step={0.05} value={settings.lineHeight} onChange={(e) => update('lineHeight', Number(e.target.value))} /></label>
            <label>Padding<input className="input-range" type="range" min={8} max={36} value={settings.padding} onChange={(e) => update('padding', Number(e.target.value))} /></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs">Text color<input className="mt-1 h-9 w-full" type="color" value={settings.textColor} onChange={(e) => update('textColor', e.target.value)} /></label>
            <label className="text-xs">Panel color<input className="mt-1 h-9 w-full" type="color" value={settings.bgColor} onChange={(e) => update('bgColor', e.target.value)} /></label>
          </div>

          <div className="flex gap-2">
            {alignments.map((align) => (
              <button key={align} className={`btn-secondary ${settings.align === align ? 'ring-2 ring-indigo-400' : ''}`} onClick={() => update('align', align)}>{align}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="toggle"><input type="checkbox" checked={mirrorPreview} onChange={(e) => onMirrorPreviewChange(e.target.checked)} />Mirror preview</label>
            <label className="toggle"><input type="checkbox" checked={settings.mirrorScript} onChange={(e) => update('mirrorScript', e.target.checked)} />Mirror script</label>
            <label className="toggle"><input type="checkbox" checked={settings.blur} onChange={(e) => update('blur', e.target.checked)} />Glass blur</label>
            <label className="toggle"><input type="checkbox" checked={settings.showBorder} onChange={(e) => update('showBorder', e.target.checked)} />Border</label>
            <label className="toggle col-span-2"><input type="checkbox" checked={burnOverlay} onChange={(e) => onBurnOverlayChange(e.target.checked)} />Burn overlay into export</label>
          </div>
        </div>
      </details>
    </section>
  );
}

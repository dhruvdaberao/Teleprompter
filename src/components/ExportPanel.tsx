import { useEffect, useMemo, useState } from 'react';

type Props = {
  blob: Blob | null;
  onDiscard: () => void;
};

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export function ExportPanel({ blob, onDiscard }: Props) {
  const [filename, setFilename] = useState(`teleprompter-${stamp()}`);

  const { url, size } = useMemo(() => {
    if (!blob) return { url: '', size: '' };
    const objectUrl = URL.createObjectURL(blob);
    const mb = (blob.size / (1024 * 1024)).toFixed(2);
    return { url: objectUrl, size: `${mb} MB` };
  }, [blob]);

  useEffect(() => {
    if (!blob) return;
    setFilename(`teleprompter-${stamp()}`);
  }, [blob]);

  useEffect(() => {
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  if (!blob) return null;

  return (
    <section className="panel">
      <h2 className="panel-title">Review & Export</h2>
      <video src={url} controls className="mt-3 w-full rounded-xl" />
      <p className="mt-2 text-xs text-slate-400">File size: {size}</p>
      <label className="mt-2 block text-xs text-slate-300">
        File name
        <input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-2" value={filename} onChange={(e) => setFilename(e.target.value.replace(/[^a-zA-Z0-9-_]/g, '-'))} />
      </label>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a className="btn-primary text-center" href={url} download={`${filename || 'teleprompter'}.webm`}>Download</a>
        <button className="btn-secondary" onClick={async () => {
          if (!navigator.share || !blob) return;
          const file = new File([blob], `${filename || 'teleprompter'}.webm`, { type: blob.type });
          await navigator.share({ files: [file], title: 'Teleprompter Recording' });
        }}>Share</button>
        <button className="btn-danger col-span-2" onClick={onDiscard}>Discard / Re-record</button>
      </div>
    </section>
  );
}

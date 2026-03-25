export function Header() {
  return (
    <header className="flex items-start gap-3 px-1 py-1 sm:items-center">
      <div className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-900/40 transition-transform duration-200 hover:scale-105">
        <div className="pointer-events-none absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-br from-blue-500/25 to-purple-600/25 blur-md transition-opacity duration-200 group-hover:opacity-90" />
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5 text-white"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="4" y="5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 10L12.7 12L9 14V10Z" fill="currentColor" />
          <path d="M14.5 10.5H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M14.5 13.5H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>

      <div className="min-w-0">
        <h1 className="bg-gradient-to-r from-slate-100 via-blue-100 to-purple-200 bg-clip-text text-xl font-semibold tracking-tight text-transparent">
          PromptFlow
        </h1>
        <p className="text-sm text-slate-400">Record naturally. Speak confidently.</p>
      </div>
    </header>
  );
}

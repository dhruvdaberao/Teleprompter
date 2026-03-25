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
          <rect x="3.5" y="4" width="17" height="16" rx="4" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8 9.25C8 7.45 9.4 6 11.2 6C13 6 14.4 7.45 14.4 9.25V12.75C14.4 14.55 13 16 11.2 16C9.4 16 8 14.55 8 12.75V9.25Z" fill="currentColor" />
          <path d="M16.8 11.5C16.8 14.45 14.45 16.8 11.5 16.8C8.55 16.8 6.2 14.45 6.2 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M11.5 16.9V18.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M9.2 19.6H13.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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

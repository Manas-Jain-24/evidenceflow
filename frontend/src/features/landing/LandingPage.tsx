import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onEnterWorkspace: () => void;
  isDark?: boolean;
}

export function LandingPage({ onEnterWorkspace }: LandingPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9f7] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200/80 px-6 py-5 dark:border-slate-800 sm:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-base font-semibold tracking-tight">EvidenceFlow</span>
          <button type="button" onClick={onEnterWorkspace} className="text-sm font-medium text-teal-800 hover:underline dark:text-teal-300">Open workspace</button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16 sm:px-10">
        <div className="max-w-2xl">
          <p className="mb-5 text-sm font-medium text-teal-700 dark:text-teal-300">Systematic review workspace</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Follow the evidence.<br />Keep every decision.</h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
            Search PubMed and Europe PMC, screen papers, and track what changes when a search or review criterion evolves.
          </p>
          <button type="button" onClick={onEnterWorkspace} className="mt-9 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
            Open workspace <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-20 grid max-w-3xl gap-8 border-t border-slate-200 pt-7 text-sm dark:border-slate-800 sm:grid-cols-3">
          <div><span className="font-semibold">Search</span><p className="mt-2 leading-6 text-slate-600 dark:text-slate-400">Bring in records from live literature sources.</p></div>
          <div><span className="font-semibold">Decide</span><p className="mt-2 leading-6 text-slate-600 dark:text-slate-400">Screen with reasons and keep a clear audit trail.</p></div>
          <div><span className="font-semibold">Revisit</span><p className="mt-2 leading-6 text-slate-600 dark:text-slate-400">See which decisions may need another look.</p></div>
        </div>
      </main>

      <footer className="px-6 py-5 text-center text-xs text-slate-500 dark:text-slate-500">EvidenceFlow</footer>
    </div>
  );
}

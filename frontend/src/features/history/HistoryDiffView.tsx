import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../lib/api';
import { useAction, useData, useWorkspace } from '../../lib/workspace';
import type { EntityId } from '../../types/api';

interface HistoryDiffViewProps {
  onNavigateToConflicts?: () => void;
}

export function HistoryDiffView({ onNavigateToConflicts }: HistoryDiffViewProps) {
  const { reviewId } = useWorkspace();
  const [queries] = useData(['queries'], () => api.getQueries(reviewId));
  const [fromId, setFromId] = useState<EntityId>(queries[0]?.id || '');
  const [toId, setToId] = useState<EntityId>(queries[queries.length - 1]?.id || '');
  const [restoreId, setRestoreId] = useState<EntityId>(queries[0]?.id || '');

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [revertMessage, setRevertMessage] = useState('');

  // Category list expansion states
  const [expandedSection, setExpandedSection] = useState<'added' | 'retained' | 'dropped' | null>('added');

  const [diff] = useData(
    ['diff', fromId, toId],
    () => (fromId && toId && fromId !== toId ? api.getDiff(toId, fromId) : Promise.resolve(null))
  );

  const restore = queries.find(q => q.id === restoreId);

  const handleExecuteRevert = useAction(async () => {
    if (!restore || pending) return;
    try {
      setPending(true);
      const result = await api.revertQuery(restore.id);
      setRevertMessage(
        `Restored v${restore.version_no}: ${result.restored_records_count ?? 0} records visible, ${
          result.hidden_records_count ?? 0
        } hidden. No source requests were made.`
      );
      setConfirmModalOpen(false);
    } finally {
      setPending(false);
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-5 py-2">
      {/* Top Header */}
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Search changes</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Compare search versions and see what was added, retained, or dropped.</p>
      </div>

      {!queries.length ? (
        <div className="p-12 text-center rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
          Create and import a query in Search before comparing or restoring versions.
        </div>
      ) : (
        <>
          {/* Version Selection & Timeline */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-500 dark:text-slate-400">Compare Query Iterations</h3>
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                From version
                <select
                  className="block p-2 mt-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                  value={fromId}
                  onChange={e => setFromId(e.target.value)}
                >
                  {queries.map(q => (
                    <option key={q.id} value={q.id}>
                      v{q.version_no} — {q.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="pt-4 text-slate-400">
                <ArrowRight className="w-4 h-4" />
              </div>

              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                To version
                <select
                  className="block p-2 mt-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                  value={toId}
                  onChange={e => setToId(e.target.value)}
                >
                  {queries.map(q => (
                    <option key={q.id} value={q.id}>
                      v{q.version_no} — {q.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Diff Metric Cards */}
          {diff ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 space-y-1 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono">New Records</span>
                  <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">{diff.records_added}</div>
                  <span className="text-[10px] text-slate-500">Added to scope</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 space-y-1 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono">Retained Records</span>
                  <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-300 tabular-nums">{diff.already_present}</div>
                  <span className="text-[10px] text-slate-500">Across versions</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 space-y-1 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono">Dropped Records</span>
                  <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">{diff.records_removed}</div>
                  <span className="text-[10px] text-slate-500">Outside new scope</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 space-y-1 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono">Preserved Decisions</span>
                  <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {diff.decisions_preserved}
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400/80 font-mono">100% human safe</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 space-y-1 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono">Open Conflicts</span>
                  <div className="text-2xl font-bold font-mono text-violet-600 dark:text-violet-400 tabular-nums">
                    {diff.conflicts_opened}
                  </div>
                  {(diff.conflicts_opened ?? 0) > 0 && onNavigateToConflicts ? (
                    <button
                      onClick={onNavigateToConflicts}
                      className="text-[10px] text-violet-700 dark:text-violet-300 underline font-medium hover:text-violet-900 dark:hover:text-violet-200"
                    >
                      Arbitrate conflicts →
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500">No merge clashes</span>
                  )}
                </div>
              </div>

              {/* Expandable Category Breakdown Lists */}
              <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                <h4 className="text-xs font-mono uppercase font-bold text-slate-500 dark:text-slate-400">Detailed Record Delta Breakdown</h4>
                <div className="space-y-2">
                  {/* Category 1: Added */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 overflow-hidden text-xs">
                    <button
                      onClick={() => setExpandedSection(expandedSection === 'added' ? null : 'added')}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-900/60 transition"
                    >
                      <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Added Records in v{queries.find(q => q.id === toId)?.version_no} ({diff.records_added})</span>
                      </span>
                      {expandedSection === 'added' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {expandedSection === 'added' && (
                      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2 text-slate-700 dark:text-slate-300">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {diff.records_added} records appear in the selected version but not the baseline version.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Category 2: Retained & Preserved */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 overflow-hidden text-xs">
                    <button
                      onClick={() => setExpandedSection(expandedSection === 'retained' ? null : 'retained')}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-900/60 transition"
                    >
                      <span className="font-semibold text-teal-800 dark:text-teal-300 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Retained Records & Preserved Decisions ({diff.already_present})</span>
                      </span>
                      {expandedSection === 'retained' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {expandedSection === 'retained' && (
                      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2 text-slate-700 dark:text-slate-300">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {diff.already_present} records appear in both versions. The backend reports {diff.decisions_preserved} preserved screening decisions.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 p-4">Select two different versions to compare their stored results.</p>
          )}

          {/* Exact Revert Section */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Exact Workspace Revert</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Restore a query's saved grouping snapshot. Zero external source requests will be performed. Studies outside that version become hidden, but no human decision is ever deleted.
            </p>

            <div className="flex items-center gap-3">
              <select
                className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                value={restoreId}
                onChange={e => setRestoreId(e.target.value)}
              >
                {queries.map(q => (
                  <option key={q.id} value={q.id}>
                    Restore v{q.version_no} — {q.label}
                  </option>
                ))}
              </select>

              <button
                disabled={!restore || restore.imported_count == null || pending}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 font-semibold text-xs text-white disabled:opacity-40 shadow-sm transition"
                onClick={() => setConfirmModalOpen(true)}
              >
                Restore v{restore?.version_no}
              </button>
            </div>
          </div>

          {/* Revert success message */}
          {revertMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 text-xs text-emerald-800 dark:text-emerald-300 font-mono">
              {revertMessage}
            </div>
          )}

          {/* Exact Revert Confirmation Modal */}
          <Modal
            isOpen={confirmModalOpen}
            onClose={() => setConfirmModalOpen(false)}
            title={`Restore Query v${restore?.version_no}?`}
            description="This restores the saved query snapshot without re-fetching PubMed or Europe PMC. Reviewer decisions remain stored."
          >
            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
                <div>Target: Query v{restore?.version_no}</div>
                <div>Status: Restores previous record visibility and cluster grouping</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">Guarantee: Reviewer decisions remain 100% intact</div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  disabled={pending}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 font-bold text-xs text-white disabled:opacity-40 shadow-sm transition"
                  onClick={handleExecuteRevert}
                >
                  {pending ? 'Restoring…' : 'Execute restore'}
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}

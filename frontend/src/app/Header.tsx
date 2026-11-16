import { useQuery } from '@tanstack/react-query';
import { Check, ChevronDown, MoreHorizontal, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, getActiveReviewer, setActiveReviewer } from '../lib/api';
import type { EntityId, Review } from '../types/api';

interface HeaderProps {
  onRefresh: () => void;
  onBackToLanding?: () => void;
  onOpenCommandPalette?: () => void;
  onToggleTheme?: () => void;
  onOpenShortcuts?: () => void;
  isDark?: boolean;
  reviews?: Review[];
  activeReviewId?: EntityId;
  onSelectReview?: (id: EntityId) => void;
  onOpenCreateReview?: () => void;
}

const reviewers = ['Member D (Lead)', 'Member A', 'Member B', 'Member C', 'Auditor'];

export function Header({
  onRefresh, onBackToLanding, onOpenCommandPalette, onToggleTheme,
  onOpenShortcuts, isDark = false, reviews = [], activeReviewId,
  onSelectReview, onOpenCreateReview
}: HeaderProps) {
  const [reviewer, setReviewer] = useState(getActiveReviewer());
  const [reviewerOpen, setReviewerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const health = useQuery({ queryKey: ['health'], queryFn: api.getHealth, refetchInterval: 15000 });
  const status = health.isSuccess ? 'Connected' : health.isPending ? 'Connecting' : 'Offline';

  useEffect(() => {
    const syncReviewer = () => setReviewer(getActiveReviewer());
    window.addEventListener('reviewer_changed', syncReviewer);
    return () => window.removeEventListener('reviewer_changed', syncReviewer);
  }, []);

  const selectReviewer = (name: string) => {
    setActiveReviewer(name);
    setReviewer(name);
    setReviewerOpen(false);
    onRefresh();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 md:px-6">
      <button type="button" onClick={onBackToLanding} className="shrink-0 text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100" title="EvidenceFlow overview">
        EvidenceFlow
      </button>

      <span className="hidden h-5 border-l border-slate-200 dark:border-slate-800 sm:block" />

      {reviews.length > 0 && onSelectReview && (
        <div className="flex min-w-0 items-center gap-1">
          <select
            id="active-review"
            aria-label="Active Review"
            value={activeReviewId || ''}
            onChange={event => onSelectReview(event.target.value)}
            className="max-w-[125px] truncate rounded-md border-0 bg-transparent px-1 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-slate-200 sm:max-w-64"
          >
            {reviews.map(review => <option key={review.id} value={review.id}>{review.title}</option>)}
          </select>
          {onOpenCreateReview && (
            <button type="button" onClick={onOpenCreateReview} aria-label="New review" title="New review" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900">
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        {onOpenCommandPalette && (
          <button type="button" onClick={onOpenCommandPalette} aria-label="Search or jump to a page" title="Search or jump to a page (Ctrl+K)" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900">
            <Search className="h-4 w-4" />
          </button>
        )}
        <span title={`Backend ${status.toLowerCase()}`} className="hidden items-center gap-1.5 px-2 text-xs text-slate-500 dark:text-slate-400 sm:flex">
          <span className={`h-1.5 w-1.5 rounded-full ${health.isSuccess ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {status}
        </span>
        <div className="relative">
          <button type="button" aria-expanded={reviewerOpen} onClick={() => { setReviewerOpen(!reviewerOpen); setMenuOpen(false); }} className="flex items-center gap-1 rounded-md px-2 py-2 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">
            <span className="max-w-24 truncate">{reviewer}</span><ChevronDown className="h-3 w-3" />
          </button>
          {reviewerOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <p className="px-2 py-1 text-xs text-slate-500">Reviewing as</p>
              {reviewers.map(name => (
                <button key={name} type="button" onClick={() => selectReviewer(name)} className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                  {name}{name === reviewer && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button type="button" aria-label="More options" aria-expanded={menuOpen} onClick={() => { setMenuOpen(!menuOpen); setReviewerOpen(false); }} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900">
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              {[
                { label: 'Refresh data', action: onRefresh },
                { label: isDark ? 'Light theme' : 'Dark theme', action: onToggleTheme },
                { label: 'Keyboard shortcuts', action: onOpenShortcuts },
              ].filter(item => item.action).map(item => (
                <button key={item.label} type="button" onClick={() => { item.action?.(); setMenuOpen(false); }} className="w-full rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">{item.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

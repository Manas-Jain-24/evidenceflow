import {
  Activity, AlertTriangle, FileSearch, FileSpreadsheet, FileText,
  GitCompare, GitMerge, History, Lightbulb, Search, Tag, ChevronDown
} from 'lucide-react';
import { useState } from 'react';

export type NavTab =
  | 'setup' | 'search' | 'runs' | 'duplicates' | 'screening' | 'pico'
  | 'history' | 'conflicts' | 'audit' | 'export' | 'intelligence';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  stats?: { uncertain_duplicates?: number; unscreened?: number; conflicts?: number; included?: number };
}

const primary = [
  { id: 'setup', label: 'Protocol', icon: FileText },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'screening', label: 'Screen', icon: FileSearch },
  { id: 'pico', label: 'Extract', icon: Tag },
  { id: 'export', label: 'Export', icon: FileSpreadsheet },
] as const;

const secondary = [
  { id: 'runs', label: 'Runs', icon: Activity },
  { id: 'duplicates', label: 'Duplicates', icon: GitMerge },
  { id: 'intelligence', label: 'Review intelligence', icon: Lightbulb },
  { id: 'history', label: 'Changes', icon: GitCompare },
  { id: 'conflicts', label: 'Conflicts', icon: AlertTriangle },
  { id: 'audit', label: 'Audit trail', icon: History },
] as const;

export function Sidebar({ activeTab, onSelectTab, stats }: SidebarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const showMore = moreOpen || secondary.some(item => item.id === activeTab);
  const countFor = (id: NavTab) => id === 'screening' ? stats?.unscreened
    : id === 'duplicates' ? stats?.uncertain_duplicates
    : id === 'conflicts' ? stats?.conflicts : undefined;

  const renderItem = (item: { id: NavTab; label: string; icon: typeof Search }) => {
    const Icon = item.icon;
    const count = countFor(item.id);
    const selected = activeTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        aria-current={selected ? 'page' : undefined}
        onClick={() => onSelectTab(item.id)}
        className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors md:w-full ${selected
          ? 'bg-teal-50 text-teal-800 font-semibold dark:bg-teal-950/50 dark:text-teal-200'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'}`}
      >
        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
        <span className="flex-1 whitespace-nowrap">{item.label}</span>
        {count !== undefined && count > 0 && <span className="tabular-nums text-xs text-slate-500 dark:text-slate-400">{count}</span>}
      </button>
    );
  };

  return (
    <aside className="relative z-30 shrink-0 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:w-52 md:border-b-0 md:border-r" aria-label="Review navigation">
      <nav className="flex gap-1 overflow-x-auto px-3 py-2 md:flex-col md:gap-0.5 md:overflow-visible md:p-4" aria-label="Pipeline navigation">
        {primary.map(renderItem)}
        <div className="hidden my-3 border-t border-slate-200 dark:border-slate-800 md:block" />
        <button
          type="button"
          aria-expanded={showMore}
          onClick={() => setMoreOpen(!showMore)}
          className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 md:w-full"
        >
          <span className="flex-1 text-left">More</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
        </button>
        {showMore && <div className="absolute left-3 right-3 top-full z-30 flex flex-col rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900 md:static md:gap-0.5 md:border-0 md:bg-transparent md:p-0 md:shadow-none dark:md:bg-transparent">{secondary.map(renderItem)}</div>}
      </nav>
    </aside>
  );
}

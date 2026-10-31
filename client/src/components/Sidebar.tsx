import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Target,
  Map,
  FolderGit2,
  Mic,
  TrendingUp,
  Briefcase,
  Settings,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText },
    { label: 'Skill Gap Analyzer', path: '/skill-gap', icon: Target },
    { label: 'Learning Roadmap', path: '/roadmap', icon: Map },
    { label: 'Portfolio Projects', path: '/projects', icon: FolderGit2 },
    { label: 'AI Mock Interview', path: '/mock-interview', icon: Mic },
    { label: 'Progress Tracker', path: '/progress', icon: TrendingUp },
    { label: 'Application Tracker', path: '/applications', icon: Briefcase },
    { label: 'Profile & Settings', path: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between border-r border-slate-200 bg-white p-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between md:hidden px-2 pt-2">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Navigation</span>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Core Modules
          </p>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs border border-brand-200/60'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0 text-slate-500" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-brand-50/40 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-700">Career Pivot MVP</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          All 7 coaching systems connected & ready for evaluation.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:block w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

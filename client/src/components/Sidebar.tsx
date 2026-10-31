import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  FileText,
  Target,
  Map,
  FolderGit2,
  Mic,
  TrendingUp,
  Briefcase,
  Settings,
  X,
  Sparkles,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Assessment', path: '/assessment', icon: Compass, badge: 'AI' },
    { label: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText },
    { label: 'Skill Gap Analyzer', path: '/skill-gap', icon: Target },
    { label: 'Learning Roadmap', path: '/roadmap', icon: Map },
    { label: 'Portfolio Projects', path: '/projects', icon: FolderGit2 },
    { label: 'AI Mock Interview', path: '/mock-interview', icon: Mic },
    { label: 'Job Recommendations', path: '/jobs', icon: Briefcase },
    { label: 'Progress Tracker', path: '/progress', icon: TrendingUp },
    { label: 'Application Tracker', path: '/applications', icon: Briefcase },
    { label: 'Profile & Settings', path: '/settings', icon: Settings },
    { label: 'Admin Telemetry', path: '/admin', icon: Activity, badge: 'Live' },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between border-r border-electric-500/15 bg-cyber-bg/95 p-4 backdrop-blur-md">
      <div className="space-y-6">
        <div className="flex items-center justify-between md:hidden px-2 pt-2">
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">Navigation</span>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div>
          <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-electric-400/70">
            Intelligence Modules
          </p>
          <nav className="mt-2.5 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-electric-500/15 text-electric-400 font-semibold shadow-glow-sm border border-electric-500/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded-md bg-neon-purple/20 px-1.5 py-0.5 text-[9px] font-mono text-neon-purple border border-neon-purple/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="rounded-2xl border border-electric-500/20 bg-cyber-surface/60 p-3.5 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-electric-400 shadow-glow-sm animate-pulse"></span>
          <span className="text-xs font-bold text-white flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-electric-400" />
            Futuristic 3D Active
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400 leading-snug">
          Google Gemini reasoning & Supabase RLS live.
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
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-cyber-bg shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

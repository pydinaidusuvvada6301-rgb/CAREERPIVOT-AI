import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Menu,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, profile, signOut, isSupabaseLive } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-electric-500/15 bg-cyber-bg/90 px-4 md:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 via-electric-500 to-neon-purple shadow-glow-sm text-white group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white">CareerPivot</span>
            <span className="ml-1.5 rounded-md bg-electric-500/15 px-1.5 py-0.5 text-xs font-mono font-bold text-electric-400 border border-electric-500/30">
              AI 3D
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Navigation shortcut */}
        <Link
          to="/assessment"
          className="hidden lg:flex items-center gap-1.5 rounded-full border border-electric-500/20 bg-cyber-surface/60 px-3 py-1 text-xs font-medium text-electric-300 hover:border-electric-400/50 hover:bg-electric-500/10 transition-all"
        >
          <Compass className="h-3.5 w-3.5 text-electric-400" />
          <span>AI Career Assessment</span>
        </Link>

        {/* Backend & Auth Connection Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-slate-900/80 text-slate-300 border border-slate-800">
          {isSupabaseLive ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-mono text-[11px]">Auth Live</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-mono text-[11px]">Dev Sandbox</span>
            </>
          )}
        </div>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 rounded-full p-1 pl-2 text-left hover:bg-slate-800/60 transition-colors border border-slate-800 hover:border-electric-500/30"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-neon-purple text-white font-bold text-xs shadow-xs">
                {profile?.fullName ? profile.fullName[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-white leading-none">
                  {profile?.fullName || user.email?.split('@')[0]}
                </p>
                <p className="text-[11px] text-electric-400 leading-tight mt-0.5 truncate max-w-[140px]">
                  {profile?.targetRole || 'Candidate'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-electric-500/20 bg-cyber-bg/95 py-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 z-50"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="border-b border-slate-800 px-4 py-2">
                  <p className="text-[11px] text-slate-400">Signed in as</p>
                  <p className="truncate text-xs font-semibold text-white">{user.email}</p>
                </div>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Profile & Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-gradient-to-r from-brand-600 to-electric-600 px-4 py-2 text-xs font-bold text-white shadow-glow-sm hover:shadow-glow-md transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

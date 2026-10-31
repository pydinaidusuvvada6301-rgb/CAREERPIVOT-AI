import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  Bell,
  CheckCircle2,
  AlertCircle,
  Menu,
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 md:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-blue-500 shadow-md shadow-brand-500/20 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-navy-900">CareerPivot</span>
            <span className="ml-1 rounded bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand-600 border border-brand-200">
              AI
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Backend & Auth Connection Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {isSupabaseLive ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Supabase Auth Live</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              <span>Local Dev Sandbox</span>
            </>
          )}
        </div>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 rounded-full p-1 pl-2 text-left hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold text-sm">
                {profile?.fullName ? profile.fullName[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-slate-900 leading-none">
                  {profile?.fullName || user.email?.split('@')[0]}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  {profile?.targetRole || 'Candidate'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="border-b border-slate-100 px-4 py-2">
                  <p className="text-xs text-slate-500">Signed in as</p>
                  <p className="truncate text-sm font-semibold text-slate-900">{user.email}</p>
                </div>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Profile & Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

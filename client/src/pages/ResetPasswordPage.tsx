import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../api/supabase';

export const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error('Supabase service is not configured.');
      }

      const { error: resetErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (resetErr) throw resetErr;

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Session may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-neon-purple text-white shadow-glow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold text-white">CareerPivot AI</span>
        </Link>
        <h2 className="text-2xl font-bold text-white">Choose New Password</h2>
        <p className="text-xs text-slate-400 mt-1">
          Set a secure password for your CareerPivot account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-3xl cyber-card p-8 space-y-6">
          {success ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center space-y-2">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Password Updated Successfully!</h4>
              <p className="text-xs text-slate-300">Redirecting to login page...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-cyber-surface pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-electric-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-cyber-surface pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-electric-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-600 via-electric-600 to-blue-600 py-3 text-xs font-bold text-white shadow-glow-sm hover:shadow-glow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

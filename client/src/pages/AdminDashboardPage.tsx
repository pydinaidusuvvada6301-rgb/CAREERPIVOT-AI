import React, { useEffect, useState } from 'react';
import {
  Activity,
  Server,
  Cpu,
  Database,
  ShieldCheck,
  RefreshCw,
  Clock,
  Sparkles,
  BarChart3,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../api/client';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export const AdminDashboardPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminMetrics();
      if (res.success) {
        setMetrics(res);
        setLastRefreshed(new Date());
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch administrator telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d > 0 ? `${d}d ` : ''}${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-electric-500/15">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-neon-purple/20 px-2.5 py-0.5 text-xs font-mono font-bold text-neon-purple border border-neon-purple/40">
                  Platform Operations
                </span>
                <span className="text-xs font-mono text-slate-400">Production Telemetry & Health</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white mt-1">Admin & Infrastructure Command Center</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time service health, resource utilization, API error logs, and module usage metrics.
              </p>
            </div>

            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="rounded-xl border border-electric-500/30 bg-cyber-surface px-4 py-2.5 text-xs font-bold text-white shadow-glow-sm hover:border-electric-400 transition-all flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 text-electric-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>

          {error && <ErrorState message={error} onRetry={fetchMetrics} />}

          {loading && !metrics && (
            <LoadingState
              message="Querying Live Telemetry Stream..."
              subtext="Measuring process heap allocation, active connections, and security event triggers."
            />
          )}

          {metrics && (
            <div className="space-y-6">
              {/* Infrastructure Top Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl cyber-card p-4">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-mono uppercase">Backend Service</span>
                    <Server className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-glow-sm"></span>
                    <span className="text-lg font-bold text-white">Healthy</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">Express on Render (Node {metrics.server?.nodeVersion})</p>
                </div>

                <div className="rounded-2xl cyber-card p-4">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-mono uppercase">Process Uptime</span>
                    <Clock className="h-4 w-4 text-electric-400" />
                  </div>
                  <p className="text-lg font-bold text-white mt-2 font-mono">
                    {formatUptime(metrics.server?.uptimeSeconds || 0)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">Platform: {metrics.server?.platform}</p>
                </div>

                <div className="rounded-2xl cyber-card p-4">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-mono uppercase">Memory Heap</span>
                    <HardDrive className="h-4 w-4 text-cyan-400" />
                  </div>
                  <p className="text-lg font-bold text-cyan-300 mt-2 font-mono">
                    {metrics.server?.memory?.heapUsedMb || 0} MB / {metrics.server?.memory?.heapTotalMb || 0} MB
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">RSS: {metrics.server?.memory?.rssMb || 0} MB</p>
                </div>

                <div className="rounded-2xl cyber-card p-4">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-mono uppercase">Rate Limiting</span>
                    <ShieldCheck className="h-4 w-4 text-neon-purple" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold text-white">Active</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{metrics.rateLimiting?.policy}</p>
                </div>
              </div>

              {/* Engine Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl cyber-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-electric-400" />
                    AI Reasoning & Database Engine Capabilities
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-cyber-bg border border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="h-4 w-4 text-neon-purple" />
                        <div>
                          <p className="text-xs font-bold text-white">Google Gemini Reasoning Engine</p>
                          <p className="text-[10px] text-slate-400">Structured JSON schema output & fallback synthesis</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${metrics.capabilities?.geminiConfigured ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
                        {metrics.capabilities?.geminiConfigured ? 'Live LLM Active' : 'Fallback Engine Active'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-cyber-bg border border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <Database className="h-4 w-4 text-electric-400" />
                        <div>
                          <p className="text-xs font-bold text-white">Supabase PostgreSQL & Auth</p>
                          <p className="text-[10px] text-slate-400">Row Level Security (RLS) & JWT Authentication</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${metrics.capabilities?.supabaseConfigured ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
                        {metrics.capabilities?.supabaseConfigured ? 'RLS Live' : 'Local Storage Mode'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Module Usage Aggregates */}
                <div className="rounded-2xl cyber-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    Module Invocation Telemetry
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(metrics.moduleUsage || {}).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-xl bg-cyber-bg border border-slate-800">
                        <p className="text-[10px] font-mono text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-base font-black text-white mt-0.5 font-mono">{String(val)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Event Logs Stream */}
              <div className="rounded-2xl cyber-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    Live Security & Operational Event Log
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Sanitized System Stream</span>
                </div>

                <div className="divide-y divide-slate-800/80 font-mono text-xs">
                  {(metrics.recentEvents || []).map((ev: any) => (
                    <div key={ev.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="text-slate-200">{ev.event}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Briefcase,
  ExternalLink,
  Plus,
  Trash2,
  Calendar,
  Tag,
  TrendingUp,
  Info,
  X,
} from 'lucide-react';
import { JobApplication, ApplicationAnalytics } from '../types';

interface ApplicationTableProps {
  applications: JobApplication[];
  analytics: ApplicationAnalytics;
  onAddApplication: (app: Omit<JobApplication, 'id'>) => Promise<void>;
  onUpdateStatus: (id: string, status: JobApplication['status']) => Promise<void>;
  onDeleteApplication: (id: string) => Promise<void>;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  analytics,
  onAddApplication,
  onUpdateStatus,
  onDeleteApplication,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobCategory, setJobCategory] = useState('Full-Stack Engineering');
  const [applicationDate, setApplicationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<JobApplication['status']>('Applied');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const statusColors = {
    Saved: 'bg-slate-800 text-slate-300 border-slate-700',
    Applied: 'bg-electric-500/15 text-electric-400 border-electric-500/30',
    Interview: 'bg-neon-purple/20 text-neon-purple border-neon-purple/40',
    Offer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    Rejected: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) return;

    setSubmitting(true);
    try {
      await onAddApplication({
        companyName,
        jobTitle,
        jobUrl: jobUrl.trim() || undefined,
        jobCategory,
        applicationDate,
        status,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setCompanyName('');
      setJobTitle('');
      setJobUrl('');
      setNotes('');
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to add application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl cyber-card p-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total</span>
          <p className="text-2xl font-black text-white mt-1">{analytics.totalApplications}</p>
        </div>
        <div className="rounded-2xl cyber-card p-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Responses</span>
          <p className="text-2xl font-black text-slate-200 mt-1">{analytics.totalResponses}</p>
        </div>
        <div className="rounded-2xl cyber-card p-4">
          <span className="text-[10px] font-mono text-neon-purple uppercase tracking-wider">Interviews</span>
          <p className="text-2xl font-black text-neon-purple mt-1">{analytics.interviewInvitations}</p>
        </div>
        <div className="rounded-2xl cyber-card p-4">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Offers</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{analytics.offers}</p>
        </div>
        <div className="rounded-2xl cyber-card p-4">
          <span className="text-[10px] font-mono text-electric-400 uppercase tracking-wider">Response Rate</span>
          <p className="text-2xl font-black text-electric-400 mt-1">{analytics.responseRate}%</p>
        </div>
        <div className="rounded-2xl cyber-card p-4">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Conversion</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{analytics.interviewConversionRate}%</p>
        </div>
      </div>

      {/* Statistical Note Alert */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-electric-500/20 bg-cyber-surface/70 p-3.5 text-xs text-slate-300">
        <Info className="h-4 w-4 text-electric-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Pipeline Methodology: </span>
          {analytics.statisticalNote}
        </div>
      </div>

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-white">Active Job Pipeline</h3>
          <p className="text-xs text-slate-400">Track application stages, response milestones, and interview loops.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-electric-600 px-4 py-2 text-xs font-bold text-white shadow-glow-sm hover:shadow-glow-md transition-all"
        >
          <Plus className="h-4 w-4" />
          Log Application
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl cyber-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cyber-surface/90 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Company & Role</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Notes</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 italic">
                    No applications tracked yet. Click "Log Application" above to begin tracking.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold text-white">{app.companyName}</div>
                      <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                        <span>{app.jobTitle}</span>
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-electric-400 hover:underline"
                            title="View job posting"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                        <Tag className="h-3 w-3 text-slate-400" />
                        {app.jobCategory}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        {app.applicationDate}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          onUpdateStatus(app.id, e.target.value as JobApplication['status'])
                        }
                        aria-label={`Update status for ${app.companyName}`}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold border cursor-pointer bg-cyber-bg focus:outline-hidden ${
                          statusColors[app.status]
                        }`}
                      >
                        <option value="Saved">Saved</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-slate-400 max-w-xs truncate text-xs">
                      {app.notes || '—'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => onDeleteApplication(app.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                        title="Delete application"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl cyber-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-electric-400" />
                Log Job Application
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, OpenAI, Google"
                  className="w-full rounded-xl border border-slate-700 bg-cyber-bg px-3.5 py-2 text-white focus:border-electric-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g. Junior Full-Stack Engineer"
                  className="w-full rounded-xl border border-slate-700 bg-cyber-bg px-3.5 py-2 text-white focus:border-electric-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Category</label>
                  <select
                    value={jobCategory}
                    onChange={e => setJobCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-cyber-bg px-3 py-2 text-white focus:border-electric-400 focus:outline-hidden"
                  >
                    <option value="Full-Stack Engineering">Full-Stack Engineering</option>
                    <option value="Frontend Development">Frontend Development</option>
                    <option value="Backend / Systems">Backend / Systems</option>
                    <option value="AI / Machine Learning">AI / Machine Learning</option>
                    <option value="Cloud / DevOps">Cloud / DevOps</option>
                    <option value="Data Engineering">Data Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-cyber-bg px-3 py-2 text-white focus:border-electric-400 focus:outline-hidden"
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Posting URL (Optional)</label>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={e => setJobUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-700 bg-cyber-bg px-3.5 py-2 text-white focus:border-electric-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Notes / Next Steps</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Recruiter reachout on LinkedIn..."
                  className="w-full rounded-xl border border-slate-700 bg-cyber-bg p-3 text-white focus:border-electric-400 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-brand-600 to-electric-600 px-5 py-2 font-bold text-white shadow-glow-sm hover:shadow-glow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

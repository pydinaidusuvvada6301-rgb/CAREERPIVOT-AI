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
    Saved: 'bg-slate-100 text-slate-700 border-slate-200',
    Applied: 'bg-blue-50 text-brand-700 border-brand-200',
    Interview: 'bg-purple-50 text-purple-700 border-purple-200',
    Offer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
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
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total</span>
          <p className="text-xl font-bold text-navy-900 mt-1">{analytics.totalApplications}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Responses</span>
          <p className="text-xl font-bold text-slate-800 mt-1">{analytics.totalResponses}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">Interviews</span>
          <p className="text-xl font-bold text-purple-700 mt-1">{analytics.interviewInvitations}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Offers</span>
          <p className="text-xl font-bold text-emerald-700 mt-1">{analytics.offers}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">Response Rate</span>
          <p className="text-xl font-bold text-brand-700 mt-1">{analytics.responseRate}%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Conversion</span>
          <p className="text-xl font-bold text-emerald-700 mt-1">{analytics.interviewConversionRate}%</p>
        </div>
      </div>

      {/* Statistical Note Alert */}
      <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-600">
        <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Pipeline Methodology: </span>
          {analytics.statisticalNote}
        </div>
      </div>

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-navy-900">Active Job Pipeline</h3>
          <p className="text-xs text-slate-500">Track application stages, response milestones, and interview loops.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Log Application
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Company & Role</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400 italic">
                    No applications tracked yet. Click "Log Application" above to begin tracking.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{app.companyName}</div>
                      <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                        <span>{app.jobTitle}</span>
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:text-brand-800"
                            title="View job posting"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        <Tag className="h-3 w-3 text-slate-400" />
                        {app.jobCategory}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {app.applicationDate}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          onUpdateStatus(app.id, e.target.value as JobApplication['status'])
                        }
                        aria-label={`Update status for ${app.companyName}`}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold border cursor-pointer ${
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
                    <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                      {app.notes || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => onDeleteApplication(app.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete application"
                        aria-label={`Delete application for ${app.companyName}`}
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

      {/* Modal for adding new application */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-navy-900">Log Job Application</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep your transition momentum organized and generate accurate conversion metrics.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, OpenAI, Datadog"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Junior Full-Stack Engineer"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Category</label>
                  <select
                    value={jobCategory}
                    onChange={(e) => setJobCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                  >
                    <option value="Full-Stack Engineering">Full-Stack Engineering</option>
                    <option value="Frontend Development">Frontend Development</option>
                    <option value="Backend Development">Backend Development</option>
                    <option value="AI / ML Engineering">AI / ML Engineering</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Data Engineering">Data Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Application Date</label>
                  <input
                    type="date"
                    value={applicationDate}
                    onChange={(e) => setApplicationDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job URL (Optional)</label>
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Recruiter contact, referral details, or round updates..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 disabled:opacity-50"
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

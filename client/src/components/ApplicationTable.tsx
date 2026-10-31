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
  Search,
  Download,
  Edit2,
  Clock,
  User,
  Mail,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { JobApplication, ApplicationAnalytics } from '../types';

interface ApplicationTableProps {
  applications: JobApplication[];
  analytics: ApplicationAnalytics;
  onAddApplication: (app: Omit<JobApplication, 'id'>) => Promise<void>;
  onUpdateStatus: (id: string, status: JobApplication['status']) => Promise<void>;
  onUpdateApplication?: (id: string, app: Partial<JobApplication>) => Promise<void>;
  onDeleteApplication: (id: string) => Promise<void>;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  analytics,
  onAddApplication,
  onUpdateStatus,
  onUpdateApplication,
  onDeleteApplication,
}) => {
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobCategory, setJobCategory] = useState('Full-Stack Engineering');
  const [applicationDate, setApplicationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<JobApplication['status']>('Applied');
  const [notes, setNotes] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const statusColors: Record<string, string> = {
    Interested: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    Applied: 'bg-electric-500/15 text-electric-400 border-electric-500/30',
    Assessment: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Interview: 'bg-neon-purple/20 text-neon-purple border-neon-purple/40',
    Offer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    Rejected: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    Withdrawn: 'bg-slate-700/40 text-slate-400 border-slate-600',
    Saved: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const handleOpenAddModal = () => {
    setCompanyName('');
    setJobTitle('');
    setJobUrl('');
    setJobCategory('Full-Stack Engineering');
    setApplicationDate(new Date().toISOString().split('T')[0]);
    setStatus('Applied');
    setNotes('');
    setRecruiterName('');
    setRecruiterEmail('');
    setInterviewDate('');
    setFollowUpDate('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (app: JobApplication) => {
    setEditingApp(app);
    setCompanyName(app.companyName);
    setJobTitle(app.jobTitle);
    setJobUrl(app.jobUrl || '');
    setJobCategory(app.jobCategory);
    setApplicationDate(app.applicationDate);
    setStatus(app.status);
    setNotes(app.notes || '');
    setRecruiterName(app.recruiterName || '');
    setRecruiterEmail(app.recruiterEmail || '');
    setInterviewDate(app.interviewDate || '');
    setFollowUpDate(app.followUpDate || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) return;

    setSubmitting(true);
    try {
      if (editingApp) {
        if (onUpdateApplication) {
          await onUpdateApplication(editingApp.id, {
            companyName,
            jobTitle,
            jobUrl: jobUrl.trim() || undefined,
            jobCategory,
            applicationDate,
            status,
            notes: notes.trim() || undefined,
            recruiterName: recruiterName.trim() || undefined,
            recruiterEmail: recruiterEmail.trim() || undefined,
            interviewDate: interviewDate || undefined,
            followUpDate: followUpDate || undefined,
          });
        } else {
          await onUpdateStatus(editingApp.id, status);
        }
        setEditingApp(null);
      } else {
        await onAddApplication({
          companyName,
          jobTitle,
          jobUrl: jobUrl.trim() || undefined,
          jobCategory,
          applicationDate,
          status,
          notes: notes.trim() || undefined,
          recruiterName: recruiterName.trim() || undefined,
          recruiterEmail: recruiterEmail.trim() || undefined,
          interviewDate: interviewDate || undefined,
          followUpDate: followUpDate || undefined,
        });
        setShowAddModal(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save application');
    } finally {
      setSubmitting(false);
    }
  };

  // CSV Export Function
  const handleExportCsv = () => {
    if (applications.length === 0) {
      alert('No applications to export.');
      return;
    }

    const headers = [
      'Company Name',
      'Job Title',
      'Category',
      'Status',
      'Application Date',
      'Recruiter Name',
      'Recruiter Email',
      'Interview Date',
      'Follow-Up Date',
      'Job URL',
      'Notes',
    ];

    const rows = applications.map((app) => [
      `"${(app.companyName || '').replace(/"/g, '""')}"`,
      `"${(app.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(app.jobCategory || '').replace(/"/g, '""')}"`,
      `"${app.status}"`,
      `"${app.applicationDate}"`,
      `"${(app.recruiterName || '').replace(/"/g, '""')}"`,
      `"${(app.recruiterEmail || '').replace(/"/g, '""')}"`,
      `"${app.interviewDate || ''}"`,
      `"${app.followUpDate || ''}"`,
      `"${(app.jobUrl || '').replace(/"/g, '""')}"`,
      `"${(app.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `careerpivot-pipeline-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobCategory.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Conversion</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">{analytics.interviewConversionRate}%</p>
        </div>
      </div>

      {/* Control Bar: Search, Status Filter, Export, Add */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, role, or tech category..."
              className="w-full rounded-xl bg-cyber-surface border border-slate-800 pl-10 pr-4 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl bg-cyber-surface border border-slate-800 px-3 py-2 text-xs font-mono text-slate-300 focus:border-electric-400 focus:outline-hidden"
          >
            <option value="All">All Statuses ({applications.length})</option>
            <option value="Interested">Interested</option>
            <option value="Applied">Applied</option>
            <option value="Assessment">Assessment</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
            <option value="Saved">Saved</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleExportCsv}
            className="rounded-xl border border-slate-800 bg-cyber-surface px-3.5 py-2 text-xs font-mono font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1.5"
            title="Download pipeline data as CSV"
          >
            <Download className="h-4 w-4 text-electric-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="rounded-xl bg-gradient-to-r from-brand-600 via-electric-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-glow-sm hover:scale-105 transition-all flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="overflow-x-auto rounded-3xl cyber-card border-electric-500/20">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-cyber-bg/90 font-mono text-[11px] text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 font-semibold">Company & Position</th>
              <th className="py-3.5 px-4 font-semibold">Category</th>
              <th className="py-3.5 px-4 font-semibold">Applied Date</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold">Recruiter / Follow-Up</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-mono">
                  No applications found. Click "Add Application" to track your job search.
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-800/40 transition-colors group">
                  {/* Company & Title */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{app.companyName}</span>
                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-electric-400 transition-colors"
                          title="Open original job posting"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{app.jobTitle}</div>
                    {app.notes && (
                      <p className="text-[10px] text-slate-500 italic mt-1 max-w-xs truncate">
                        "{app.notes}"
                      </p>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-slate-300 text-[11px]">{app.jobCategory}</span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                    {app.applicationDate}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4">
                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value as any)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-mono font-bold border transition-all ${
                        statusColors[app.status] || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <option value="Interested">Interested</option>
                      <option value="Applied">Applied</option>
                      <option value="Assessment">Assessment</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Withdrawn">Withdrawn</option>
                      <option value="Saved">Saved</option>
                    </select>
                  </td>

                  {/* Recruiter / Follow-up */}
                  <td className="py-3.5 px-4 text-[11px] font-mono">
                    {app.recruiterName ? (
                      <div className="text-slate-300 flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-500" />
                        <span>{app.recruiterName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}

                    {app.followUpDate && (
                      <div className="text-amber-400 text-[10px] flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>Follow-up: {app.followUpDate}</span>
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(app)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Edit application details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteApplication(app.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete application"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Application Modal */}
      {(showAddModal || editingApp) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl cyber-card p-6 md:p-8 border-electric-500/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {editingApp ? 'Edit Application Details' : 'Add New Job Application'}
                </h3>
                <p className="text-xs text-slate-400">Track key recruiter contacts, interview dates, and status velocity.</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingApp(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Stripe, Linear"
                    className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Job Position *</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Full-Stack Engineer"
                    className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Category</label>
                  <select
                    value={jobCategory}
                    onChange={(e) => setJobCategory(e.target.value)}
                    className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                  >
                    <option value="Full-Stack Engineering">Full-Stack Engineering</option>
                    <option value="Backend Systems">Backend Systems</option>
                    <option value="Frontend Engineering">Frontend Engineering</option>
                    <option value="AI / ML Engineering">AI / ML Engineering</option>
                    <option value="DevOps & Cloud">DevOps & Cloud</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                  >
                    <option value="Interested">Interested</option>
                    <option value="Applied">Applied</option>
                    <option value="Assessment">Assessment</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Withdrawn">Withdrawn</option>
                    <option value="Saved">Saved</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Recruiter Name</label>
                  <input
                    type="text"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Recruiter Email</label>
                  <input
                    type="email"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                    placeholder="recruiter@company.com"
                    className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Interview Date</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Follow-Up Reminder Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Job URL</label>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://boards.greenhouse.io/company/jobs/..."
                  className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Personal Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Mentioned high throughput distributed systems in cover note."
                  className="w-full rounded-xl bg-cyber-bg border border-slate-800 p-3 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingApp(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-electric-600 text-xs font-bold text-white shadow-glow-sm hover:scale-105 transition-all"
                >
                  {editingApp ? 'Update Application' : 'Save to Pipeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

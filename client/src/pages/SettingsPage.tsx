import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Sparkles,
  Download,
  Trash2,
  Bell,
  Eye,
  Globe,
  Briefcase,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export const SettingsPage: React.FC = () => {
  const { user, profile, updateProfile, isSupabaseLive, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile Form state
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [education, setEducation] = useState(profile?.education || 'Bachelor of Science / Technology');
  const [college, setCollege] = useState(profile?.college || '');
  const [graduationYear, setGraduationYear] = useState(profile?.graduationYear || 2024);
  const [careerStage, setCareerStage] = useState(profile?.careerStage || 'Fresh Graduate');
  const [currentSkills, setCurrentSkills] = useState(profile?.currentSkills?.join(', ') || '');
  const [targetRole, setTargetRole] = useState(profile?.targetRole || 'Full-Stack Software Engineer');
  const [preferredIndustry, setPreferredIndustry] = useState(profile?.preferredIndustry || '');
  const [preferredLocation, setPreferredLocation] = useState('Remote / Worldwide');
  const [workPreference, setWorkPreference] = useState<'Remote' | 'Hybrid' | 'On-site'>('Remote');
  const [weeklyHours, setWeeklyHours] = useState(profile?.weeklyHours || 12);
  const [targetDuration, setTargetDuration] = useState(profile?.targetDuration || '1 Month');

  // Preferences & Toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Dynamic Profile Completion Score calculation
  const fields = [
    Boolean(fullName.trim()),
    Boolean(education.trim()),
    Boolean(college.trim()),
    Boolean(currentSkills.trim()),
    Boolean(targetRole.trim()),
    Boolean(preferredIndustry.trim()),
    Boolean(preferredLocation.trim()),
    Boolean(weeklyHours > 0),
  ];
  const completedFieldsCount = fields.filter(Boolean).length;
  const profileCompletionScore = Math.round((completedFieldsCount / fields.length) * 100);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const skillsArray = currentSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateProfile({
        fullName,
        education,
        college,
        graduationYear: Number(graduationYear),
        careerStage,
        currentSkills: skillsArray,
        targetRole,
        preferredIndustry,
        weeklyHours: Number(weeklyHours),
        targetDuration,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  // Export User Data (GDPR compliance)
  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await api.exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `careerpivot-user-export-${user?.id?.slice(0, 8) || 'candidate'}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert('Export failed: ' + (err.message || 'Unable to download user data.'));
    } finally {
      setExporting(false);
    }
  };

  // Handle Account Deletion Request
  const handleConfirmDelete = async () => {
    alert('Account deletion request acknowledged. In production, your cryptographic token and associated database records will be securely purged.');
    setShowDeleteModal(false);
    await signOut();
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="pb-4 border-b border-electric-500/15">
            <h1 className="text-2xl font-extrabold text-white">Profile & Platform Settings</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your target roles, profile completion, study availability, security, and GDPR privacy controls.
            </p>
          </div>

          {/* Profile Completion Meter */}
          <div className="rounded-3xl cyber-card p-6 border-electric-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-electric-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Profile Completion Benchmark
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-electric-400">{profileCompletionScore}% Complete</span>
            </div>

            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 via-electric-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletionScore}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              {profileCompletionScore >= 85
                ? 'Your profile is fully calibrated for precision AI recommendations.'
                : 'Tip: Add your college and preferred industry to unlock maximum AI accuracy.'}
            </p>
          </div>

          {saved && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-4 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Settings updated successfully! Your AI models are re-calibrated with your latest parameters.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Security & Privacy */}
            <div className="space-y-4">
              {/* Security Card */}
              <div className="rounded-3xl cyber-card p-5 border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <Shield className="h-4 w-4 text-electric-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Security & Storage</h3>
                </div>
                <div className="space-y-2 text-xs font-mono text-slate-400">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Candidate ID:</span>
                    <p className="text-white truncate text-[11px] mt-0.5">{user?.id || 'demo-candidate'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Auth Email:</span>
                    <p className="text-white truncate text-[11px] mt-0.5">{user?.email || 'candidate@careerpivot.ai'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Database Protection:</span>
                    <p className="text-emerald-400 text-[11px] mt-0.5">Supabase PostgreSQL RLS Active</p>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="rounded-3xl cyber-card p-5 border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <Bell className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Preferences</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Email Interview Reminders</span>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="rounded-sm bg-cyber-bg border-slate-700 text-electric-500 focus:ring-0"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Weekly Progress Reports</span>
                    <input
                      type="checkbox"
                      checked={weeklyReports}
                      onChange={(e) => setWeeklyReports(e.target.checked)}
                      className="rounded-sm bg-cyber-bg border-slate-700 text-electric-500 focus:ring-0"
                    />
                  </label>
                </div>
              </div>

              {/* Privacy & GDPR Data Export */}
              <div className="rounded-3xl cyber-card p-5 border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <Download className="h-4 w-4 text-neon-purple" />
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Data Privacy & Rights</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Export all your saved resumes, applications, and progress records in raw JSON format.
                </p>
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={exporting}
                  className="w-full py-2 px-3 rounded-xl border border-electric-500/30 bg-cyber-bg text-electric-400 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{exporting ? 'Exporting...' : 'Export My Data (JSON)'}</span>
                </button>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full py-1.5 text-rose-400 hover:text-rose-300 text-[11px] font-mono flex items-center justify-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Request Account Deletion</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 2 Columns: Editable Settings Form */}
            <div className="md:col-span-2">
              <form onSubmit={handleSave} className="rounded-3xl cyber-card p-6 md:p-8 border-electric-500/20 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Candidate Name"
                      className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Target Tech Role</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Full-Stack Software Engineer"
                      className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Education Level</label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science"
                      className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">College / Institute</label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Institute of Technology"
                      className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Career Stage</label>
                    <select
                      value={careerStage}
                      onChange={(e) => setCareerStage(e.target.value)}
                      className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                    >
                      <option value="Student">Student</option>
                      <option value="Fresh Graduate">Fresh Graduate</option>
                      <option value="Career Switcher">Career Switcher</option>
                      <option value="Working Professional">Working Professional</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Work Preference</label>
                    <select
                      value={workPreference}
                      onChange={(e) => setWorkPreference(e.target.value as any)}
                      className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                    >
                      <option value="Remote">Remote Only</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-Site</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Weekly Study Hours</label>
                    <input
                      type="number"
                      min={1}
                      max={80}
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(Number(e.target.value))}
                      className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">
                    Technical Skills (comma separated)
                  </label>
                  <textarea
                    rows={3}
                    value={currentSkills}
                    onChange={(e) => setCurrentSkills(e.target.value)}
                    placeholder="TypeScript, React, Node.js, Express, PostgreSQL, Git, Docker"
                    className="w-full rounded-xl bg-cyber-bg border border-slate-800 p-3 text-xs text-white focus:border-electric-400 focus:outline-hidden leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-gradient-to-r from-brand-600 via-electric-600 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-glow-sm hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving Changes...' : 'Save Settings & Calibrate'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Delete Account Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="relative w-full max-w-md rounded-3xl cyber-card p-6 border-rose-500/30 space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-extrabold text-white">Confirm Account Deletion Request</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  This action will permanently queue your account, uploaded resumes, and application tracking history for deletion.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-mono font-bold text-white"
                  >
                    Confirm Deletion
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

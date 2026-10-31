import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, profile, updateProfile, isSupabaseLive } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [education, setEducation] = useState(profile?.education || 'Bachelor of Science / Technology');
  const [college, setCollege] = useState(profile?.college || '');
  const [graduationYear, setGraduationYear] = useState(profile?.graduationYear || 2024);
  const [careerStage, setCareerStage] = useState(profile?.careerStage || 'Fresh Graduate');
  const [currentSkills, setCurrentSkills] = useState(profile?.currentSkills?.join(', ') || '');
  const [targetRole, setTargetRole] = useState(profile?.targetRole || 'Full-Stack Software Engineer');
  const [preferredIndustry, setPreferredIndustry] = useState(profile?.preferredIndustry || '');
  const [weeklyHours, setWeeklyHours] = useState(profile?.weeklyHours || 12);
  const [targetDuration, setTargetDuration] = useState(profile?.targetDuration || '1 Month');

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8">
          <div className="pb-4 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-navy-900">Profile & Platform Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your career transition goals, study availability, and account security.
            </p>
          </div>

          {saved && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Settings updated successfully! Your AI models are calibrated with your latest parameters.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Account & Security Summary */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2.5 mb-3">
                  <Shield className="h-5 w-5 text-brand-600" />
                  <h3 className="text-sm font-bold text-navy-900">Security & Privacy</h3>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-700">User ID:</span>
                    <p className="font-mono text-[11px] text-slate-400 truncate mt-0.5">{user?.id}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Auth Email:</span>
                    <p className="text-slate-800 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Storage Protection:</span>
                    <p className="text-slate-800 mt-0.5">Supabase PostgreSQL Row Level Security (RLS) Active</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5 text-xs text-brand-900">
                <span className="font-bold flex items-center gap-1.5 mb-1 text-brand-950">
                  <Sparkles className="h-4 w-4 text-brand-600" /> Data Ownership
                </span>
                <p className="leading-relaxed text-[11px]">
                  Your uploaded resumes, interview answers, and job applications are tied strictly to your cryptographic user token and cannot be accessed by other candidates.
                </p>
              </div>
            </div>

            {/* Profile Edit Form */}
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-navy-900 mb-2">Candidate Information</h3>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Career Stage</label>
                    <select
                      value={careerStage}
                      onChange={(e) => setCareerStage(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                    >
                      <option value="Student">Student</option>
                      <option value="Fresh Graduate">Fresh Graduate</option>
                      <option value="Career Switcher">Career Switcher</option>
                      <option value="Working Professional">Working Professional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Graduation Year</label>
                    <input
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Education Level</label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">College / University</label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Target Trajectory
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Target Job Role</label>
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                      >
                        <option value="Full-Stack Software Engineer">Full-Stack Software Engineer</option>
                        <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                        <option value="Cloud DevOps Engineer">Cloud DevOps Engineer</option>
                        <option value="Frontend Development Specialist">Frontend Development Specialist</option>
                        <option value="Backend / Systems Engineer">Backend / Systems Engineer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Preferred Industry</label>
                      <input
                        type="text"
                        value={preferredIndustry}
                        onChange={(e) => setPreferredIndustry(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Current Skills (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={currentSkills}
                      onChange={(e) => setCurrentSkills(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Weekly Study Hours: <strong>{weeklyHours} hrs</strong>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="40"
                        value={weeklyHours}
                        onChange={(e) => setWeeklyHours(Number(e.target.value))}
                        className="w-full accent-brand-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Target Sprint Duration</label>
                      <select
                        value={targetDuration}
                        onChange={(e) => setTargetDuration(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                      >
                        <option value="1 Month">1 Month Sprint</option>
                        <option value="2 Months">2 Months</option>
                        <option value="3 Months">3 Months</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

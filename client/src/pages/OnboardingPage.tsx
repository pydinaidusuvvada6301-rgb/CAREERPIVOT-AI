import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, User, GraduationCap, Briefcase, Target, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export const OnboardingPage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.fullName || user?.user_metadata?.full_name || '');
  const [education, setEducation] = useState(profile?.education || 'Bachelor of Science / Technology');
  const [college, setCollege] = useState(profile?.college || '');
  const [graduationYear, setGraduationYear] = useState<number>(profile?.graduationYear || 2024);
  const [careerStage, setCareerStage] = useState(profile?.careerStage || 'Fresh Graduate');
  const [currentSkillsInput, setCurrentSkillsInput] = useState(
    profile?.currentSkills ? profile.currentSkills.join(', ') : 'JavaScript, HTML/CSS, Git, Python'
  );
  const [targetRole, setTargetRole] = useState(profile?.targetRole || 'Full-Stack Software Engineer');
  const [preferredIndustry, setPreferredIndustry] = useState(profile?.preferredIndustry || 'Fintech & Cloud SaaS');
  const [weeklyHours, setWeeklyHours] = useState<number>(profile?.weeklyHours || 12);
  const [targetDuration, setTargetDuration] = useState(profile?.targetDuration || '1 Month');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const parsedSkills = currentSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      await updateProfile({
        fullName,
        education,
        college,
        graduationYear,
        careerStage,
        currentSkills: parsedSkills,
        targetRole,
        preferredIndustry,
        weeklyHours,
        targetDuration,
      });

      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to save onboarding profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Personalize Your Career Pivot</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Tell us about your background and target aspirations to calibrate your AI recommendations.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6 text-xs">
            {/* 1. Identity & Education */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Education & Identity
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Career Stage *</label>
                  <select
                    value={careerStage}
                    onChange={(e) => setCareerStage(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                  >
                    <option value="Student">Student (Enrolled)</option>
                    <option value="Fresh Graduate">Fresh Graduate</option>
                    <option value="Career Switcher">Career Switcher</option>
                    <option value="Working Professional">Working Professional (Upskilling)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">College or Institution</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. University of Technology"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    min="1980"
                    max="2035"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* 2. Target Aspirations */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Target Career Goals
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Job Role *</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                  >
                    <option value="Full-Stack Software Engineer">Full-Stack Software Engineer</option>
                    <option value="Frontend Development Specialist">Frontend Development Specialist</option>
                    <option value="Backend / Systems Engineer">Backend / Systems Engineer</option>
                    <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                    <option value="Cloud DevOps Engineer">Cloud DevOps Engineer</option>
                    <option value="Data Engineer">Data Engineer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Industry</label>
                  <input
                    type="text"
                    value={preferredIndustry}
                    onChange={(e) => setPreferredIndustry(e.target.value)}
                    placeholder="e.g. Fintech, Healthcare AI, SaaS"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={currentSkillsInput}
                  onChange={(e) => setCurrentSkillsInput(e.target.value)}
                  placeholder="e.g. JavaScript, Python, React, Git, SQL"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* 3. Availability & Timeline */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Learning Schedule & Timeline
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Weekly Available Learning Hours: <span className="text-brand-600 font-bold">{weeklyHours} hrs/week</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="1"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(parseInt(e.target.value, 10))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>5 hrs (Casual)</span>
                    <span>15 hrs (Balanced)</span>
                    <span>40 hrs (Full-time Sprint)</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Pivot Duration</label>
                  <select
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                  >
                    <option value="1 Month">1 Month Sprint (Intensive)</option>
                    <option value="2 Months">2 Months (Standard Transition)</option>
                    <option value="3 Months">3 Months (Deep Foundational)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <span>{submitting ? 'Calibrating...' : 'Launch Dashboard'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

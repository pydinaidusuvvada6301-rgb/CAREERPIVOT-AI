import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Briefcase,
  Code2,
  Target,
  Clock,
  Layers,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AICareerMentor } from '../components/AICareerMentor';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { CareerAssessmentInput, AssessmentResult, CareerRecommendation } from '../types';

export const CareerAssessmentPage: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Multi-step form state
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<CareerAssessmentInput>({
    degree: profile?.education || 'B.Tech / B.E.',
    branch: 'Computer Science and Engineering',
    academicYear: 'Final Year / Fresh Graduate',
    technicalSkills: profile?.currentSkills || ['JavaScript', 'HTML/CSS', 'Git'],
    programmingLanguages: ['JavaScript', 'Python'],
    interests: ['Web Development', 'Artificial Intelligence', 'Cloud Computing'],
    workExperience: 'Academic projects and personal GitHub repositories',
    preferredIndustries: ['FinTech', 'SaaS', 'AI Startups'],
    careerGoal: profile?.targetRole || 'Full-Stack Software Engineer',
    preferredEnvironment: 'Remote',
    learningPreferences: ['Hands-on coding', 'Documentation', 'Project-based sprints'],
  });

  const availableLanguages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'Go', 'SQL', 'Rust'];
  const availableInterests = ['Full-Stack Development', 'AI & Machine Learning', 'Cloud Infrastructure', 'Cybersecurity', 'Mobile Apps', 'DevOps & CI/CD'];
  const availableEnvironments: ('Remote' | 'Hybrid' | 'On-site' | 'Flexible')[] = ['Remote', 'Hybrid', 'On-site', 'Flexible'];

  const toggleLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      programmingLanguages: prev.programmingLanguages.includes(lang)
        ? prev.programmingLanguages.filter(l => l !== lang)
        : [...prev.programmingLanguages, lang],
    }));
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleRunAssessment = async () => {
    setLoading(true);
    try {
      const res = await api.assessCareer(formData);
      setResult(res.assessment);
      setStep(3); // Go to Results View
    } catch (err) {
      console.error('Career Assessment failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCareer = async (rec: CareerRecommendation) => {
    setSelectedRole(rec.roleTitle);
    await updateProfile({
      targetRole: rec.roleTitle,
      education: `${formData.degree} in ${formData.branch}`,
      currentSkills: Array.from(new Set([...formData.technicalSkills, ...formData.programmingLanguages])),
    });
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-electric-500/15 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-cyber-surface/80 px-3 py-1 text-xs font-mono text-electric-400 mb-2">
                <Compass className="h-3.5 w-3.5 text-electric-400" />
                <span>Career Intelligence Engine • Part 5 & 6</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                AI Career Assessment & Recommendation Engine
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Multi-dimensional evaluation mapping your exact degree, languages, and technical strengths to verified high-growth tech career paths.
              </p>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <span className={`px-2.5 py-1 rounded-lg border ${step === 1 ? 'border-electric-400 bg-electric-500/20 text-electric-300' : 'border-slate-800'}`}>
                1. Background
              </span>
              <span>&rarr;</span>
              <span className={`px-2.5 py-1 rounded-lg border ${step === 2 ? 'border-electric-400 bg-electric-500/20 text-electric-300' : 'border-slate-800'}`}>
                2. Preferences
              </span>
              <span>&rarr;</span>
              <span className={`px-2.5 py-1 rounded-lg border ${step === 3 ? 'border-electric-400 bg-electric-500/20 text-electric-300' : 'border-slate-800'}`}>
                3. Path Recommendations
              </span>
            </div>
          </div>

          {/* STEP 1: Academic & Language Foundation */}
          {step === 1 && (
            <div className="rounded-3xl cyber-card p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-electric-400" />
                  Academic Profile & Programming Languages
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter your verified education details to calibrate learning difficulty and timeline.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">Degree / Certification</label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={e => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-cyber-surface px-3.5 py-2.5 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">Branch / Specialization</label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-cyber-surface px-3.5 py-2.5 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">Academic Standing / Year</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-cyber-surface px-3.5 py-2.5 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Programming Languages Selection */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-2">
                  Programming Languages Known
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableLanguages.map(lang => {
                    const isSelected = formData.programmingLanguages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-mono transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-electric-400 bg-electric-500/20 text-electric-300 shadow-glow-sm'
                            : 'border-slate-800 bg-cyber-surface/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Work or Project Experience Summary */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Current Practical Experience / Projects
                </label>
                <textarea
                  rows={3}
                  value={formData.workExperience}
                  onChange={e => setFormData({ ...formData, workExperience: e.target.value })}
                  placeholder="e.g. Built a student portal in React; wrote basic C algorithms; completed a Python data analysis course..."
                  className="w-full rounded-xl border border-slate-700 bg-cyber-surface p-3 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-electric-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow-sm hover:shadow-glow-md transition-all"
                >
                  <span>Continue to Preferences</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Work Environment & Goals */}
          {step === 2 && (
            <div className="rounded-3xl cyber-card p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-neon-purple" />
                  Work Environment & Transition Goals
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Specify your ideal work structure and learning style so recommendations match your lifestyle.
                </p>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-2">Technical Areas of Interest</label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map(interest => {
                    const isSelected = formData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`rounded-xl border px-3 py-1.5 text-xs transition-all ${
                          isSelected
                            ? 'border-neon-purple bg-neon-purple/20 text-neon-purple shadow-glow-sm'
                            : 'border-slate-800 bg-cyber-surface/60 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Environment */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-2">Preferred Work Setup</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableEnvironments.map(env => (
                    <button
                      key={env}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredEnvironment: env })}
                      className={`rounded-xl border p-3 text-center text-xs font-semibold transition-all ${
                        formData.preferredEnvironment === env
                          ? 'border-electric-400 bg-electric-500/20 text-electric-300'
                          : 'border-slate-800 bg-cyber-surface/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Role Idea */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Initial Career Target in Mind (Optional)
                </label>
                <input
                  type="text"
                  value={formData.careerGoal}
                  onChange={e => setFormData({ ...formData, careerGoal: e.target.value })}
                  placeholder="e.g. AI Engineer, Full-Stack Developer, DevOps Specialist..."
                  className="w-full rounded-xl border border-slate-700 bg-cyber-surface px-3.5 py-2.5 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-slate-800 bg-cyber-surface px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  &larr; Back
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRunAssessment}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-electric-600 to-neon-purple px-6 py-2.5 text-xs font-bold text-white shadow-glow-md hover:shadow-glow-lg transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin text-white" />
                      <span>Reasoning with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Execute AI Career Assessment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Assessment Results & Recommendations */}
          {step === 3 && result && (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="rounded-3xl cyber-card p-6 border-electric-500/30 bg-gradient-to-r from-cyber-surface to-cyber-bg">
                <div className="flex items-center gap-2 text-xs font-mono text-electric-400 mb-2">
                  <Sparkles className="h-4 w-4 text-electric-400" />
                  <span>Executive Assessment Summary</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {result.executiveSummary}
                </p>
              </div>

              {/* Recommendation Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {result.topRecommendations.map((rec, idx) => {
                  const isSelected = selectedRole === rec.roleTitle || profile?.targetRole === rec.roleTitle;
                  return (
                    <div
                      key={idx}
                      className={`rounded-3xl cyber-card p-6 flex flex-col justify-between transition-all ${
                        isSelected ? 'border-electric-400/80 shadow-glow-md bg-cyber-surface/90' : ''
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                              Recommendation #{idx + 1}
                            </span>
                            <h3 className="text-lg font-extrabold text-white mt-0.5">{rec.roleTitle}</h3>
                          </div>

                          <div className="flex flex-col items-end">
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-electric-400">{rec.matchScore}%</span>
                              <span className="text-[10px] font-mono text-slate-400">Match</span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400">
                              {rec.marketDemandTier} Demand
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {rec.matchExplanation}
                        </p>

                        {/* Current Strengths vs. Missing Skills */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <div>
                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                              Matching Strengths:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {rec.userStrengths.map((s, i) => (
                                <span key={i} className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-300">
                                  ✓ {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block mb-1">
                              Priority Missing Skills:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {rec.missingSkills.map((s, i) => (
                                <span key={i} className="rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[11px] text-rose-300">
                                  ! {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* First Recommended Project Blueprint */}
                        <div className="rounded-2xl border border-electric-500/20 bg-cyber-bg/80 p-3.5 space-y-1">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-electric-400 block">
                            Bridging Project Blueprint:
                          </span>
                          <h4 className="text-xs font-bold text-white">{rec.recommendedFirstProject.title}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {rec.recommendedFirstProject.description}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-5 border-t border-slate-800 mt-4 flex items-center justify-between gap-3">
                        <span className="text-[11px] font-mono text-slate-400">
                          Estimated Sprint: <strong className="text-white">{rec.estimatedTimeToReady}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectCareer(rec)}
                            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-500 text-black shadow-glow-sm'
                                : 'border border-electric-400/40 text-electric-400 hover:bg-electric-500/10'
                            }`}
                          >
                            {isSelected ? '✓ Active Career Goal' : 'Select As Goal'}
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate('/roadmap')}
                            className="rounded-xl bg-electric-500/20 text-electric-300 px-3 py-2 text-xs font-semibold hover:bg-electric-500/30 transition-colors"
                          >
                            Generate Roadmap &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Alternative Paths */}
              {result.alternativePaths && result.alternativePaths.length > 0 && (
                <div className="rounded-2xl cyber-card p-4 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-neon-purple" />
                    <span>Alternative paths to explore:</span>
                    <span className="text-white font-mono">{result.alternativePaths.join(', ')}</span>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-electric-400 hover:underline text-xs"
                  >
                    Retake Assessment
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <AICareerMentor />
    </div>
  );
};

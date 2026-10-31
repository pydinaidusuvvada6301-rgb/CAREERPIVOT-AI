import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Target,
  ArrowRight,
  Briefcase,
  Sparkles,
  Info,
  RefreshCw,
  Building,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
  Layers,
  Zap,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../api/client';
import { SkillGapData, ResumeParsedData } from '../types';
import { SkillGapChart } from '../components/SkillGapChart';
import { SkillCard } from '../components/SkillCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useAuth } from '../context/AuthContext';

export const SkillGapPage: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Resume data passed via route navigation or storage
  const [resumeData, setResumeData] = useState<ResumeParsedData | null>(null);
  const [targetRole, setTargetRole] = useState(
    (location.state as any)?.targetRole || profile?.targetRole || 'Full-Stack Software Engineer'
  );

  const [sampleJobs, setSampleJobs] = useState<any[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');
  const [customJobText, setCustomJobText] = useState('');
  const [jobInputMode, setJobInputMode] = useState<'sample' | 'custom'>('sample');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gapData, setGapData] = useState<SkillGapData | null>(null);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  // Load sample jobs and stored resume data on mount
  useEffect(() => {
    async function init() {
      const passedResume = (location.state as any)?.resumeData;
      if (passedResume) {
        setResumeData(passedResume);
      } else {
        const stored = sessionStorage.getItem('careerpivot_resume_analysis');
        if (stored) {
          try {
            setResumeData(JSON.parse(stored));
          } catch {
            // ignore
          }
        }
      }

      // Fetch sample jobs
      try {
        const res = await api.getSampleJobs();
        if (res.success && res.samples.length > 0) {
          setSampleJobs(res.samples);
          setSelectedSampleId(res.samples[0].id);
        }
      } catch (err) {
        console.warn('Could not load sample jobs from API:', err);
      }
    }

    init();
  }, [location.state]);

  const handleExecuteGapAnalysis = async () => {
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        targetRole,
        resumeSkills: resumeData?.technicalSkills || profile?.currentSkills || ['JavaScript', 'HTML/CSS', 'Python'],
        resumeText: resumeData?.summary || '',
      };

      if (jobInputMode === 'sample' && selectedSampleId) {
        payload.jobDescriptionId = selectedSampleId;
      } else if (jobInputMode === 'custom' && customJobText.trim()) {
        payload.jobDescriptionText = customJobText;
      }

      const res = await api.analyzeSkillGap(payload);
      if (res.success) {
        setGapData(res.data);
        setApiNotice(res.notice || null);
        sessionStorage.setItem('careerpivot_skill_gaps', JSON.stringify(res.data));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze skill gaps.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToRoadmap = () => {
    navigate('/roadmap', {
      state: {
        skillGaps: gapData?.missingSkills.map((s) => s.skill) || [],
        targetRole,
      },
    });
  };

  const selectedSample = sampleJobs.find((j) => j.id === selectedSampleId);
  const candidateSkills = resumeData?.technicalSkills || profile?.currentSkills || ['TypeScript', 'React', 'Node.js', 'Express', 'Git', 'REST APIs'];

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
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/40">
                  Module 2
                </span>
                <span className="text-xs font-mono text-slate-400">Evidence-Based Benchmarking</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white mt-1">Skill Gap Analyzer</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Compare your current resume profile against verified target job specifications with explainable matching.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-cyber-surface rounded-2xl border border-slate-800 p-2">
              <span className="text-xs font-mono text-slate-400 pl-2">Target Role:</span>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="rounded-xl border-0 bg-cyber-bg px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-hidden"
              >
                <option value="Full-Stack Software Engineer">Full-Stack Software Engineer</option>
                <option value="Backend Software Engineer">Backend Software Engineer</option>
                <option value="Frontend Software Engineer">Frontend Software Engineer</option>
                <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                <option value="AI / ML Engineer">AI / ML Engineer</option>
              </select>
            </div>
          </div>

          {/* Current Candidate Skill Inventory */}
          <div className="rounded-3xl cyber-card p-5 border-electric-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-electric-400" />
                Verified Candidate Skill Inventory ({candidateSkills.length} skills)
              </span>
              <span className="text-[10px] font-mono text-slate-400">Grounding Source: Parsed Resume / Profile</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {candidateSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-cyber-bg border border-slate-800 px-2.5 py-1 text-xs font-mono text-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Job Specification Source Selector */}
          <div className="rounded-3xl cyber-card p-6 border-electric-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-cyan-400" />
                Select Benchmark Job Specification
              </h3>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-cyber-bg border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setJobInputMode('sample')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    jobInputMode === 'sample'
                      ? 'bg-electric-500/20 text-electric-400 border border-electric-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Verified Samples
                </button>
                <button
                  onClick={() => setJobInputMode('custom')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    jobInputMode === 'custom'
                      ? 'bg-electric-500/20 text-electric-400 border border-electric-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Paste Custom Job
                </button>
              </div>
            </div>

            {jobInputMode === 'sample' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {sampleJobs.map((job) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => setSelectedSampleId(job.id)}
                      className={`rounded-2xl p-4 text-left transition-all border ${
                        selectedSampleId === job.id
                          ? 'border-electric-400 bg-electric-500/10 shadow-glow-sm'
                          : 'border-slate-800 bg-cyber-bg hover:border-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-electric-400 font-bold block mb-1">{job.company}</span>
                      <h4 className="text-xs font-bold text-white">{job.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{job.location || 'Remote / Hybrid'}</p>
                    </button>
                  ))}
                </div>

                {selectedSample && (
                  <div className="p-4 rounded-2xl bg-cyber-bg border border-slate-800 text-xs text-slate-300 space-y-2">
                    <span className="font-bold text-white block">Required Competencies in this benchmark:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSample.requiredSkills?.map((sk: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-cyber-surface border border-slate-700 text-[11px] font-mono text-cyan-300">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <textarea
                  rows={4}
                  value={customJobText}
                  onChange={(e) => setCustomJobText(e.target.value)}
                  placeholder="Paste the full job description or requirements here..."
                  className="w-full rounded-2xl bg-cyber-bg border border-slate-800 p-3.5 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleExecuteGapAnalysis}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-glow-sm hover:scale-105 transition-all flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                <span>{loading ? 'Analyzing Gap Alignment...' : 'Run Skill Gap Analysis'}</span>
              </button>
            </div>
          </div>

          {error && <ErrorState message={error} onRetry={handleExecuteGapAnalysis} />}

          {loading && (
            <LoadingState
              message="Computing Explainable Skill Gap Alignment..."
              subtext="Cross-referencing verified resume evidence against target job requirements without hallucination."
            />
          )}

          {/* Results View */}
          {gapData && !loading && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Match Gauge Card */}
              <div className="rounded-3xl cyber-card p-6 md:p-8 border-electric-500/25 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Role Alignment: {gapData.matchPercentage}%
                  </span>
                  <h3 className="text-xl font-extrabold text-white">
                    Target Alignment for {gapData.targetRole}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    {gapData.explanation}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 italic">
                    Source: {gapData.sourceDescription}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-cyber-bg border border-slate-800 min-w-[160px] text-center">
                  <span className="text-4xl font-black text-emerald-400 font-mono">
                    {gapData.matchPercentage}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase mt-1">Verified Match</span>
                </div>
              </div>

              {/* Missing Skills Ranked by Priority */}
              <div className="rounded-3xl cyber-card p-6 border-electric-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                      Priority Skill Gaps Requiring Bridge Projects ({gapData.missingSkills.length})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ranked by importance to recruiters with estimated learning duration.
                    </p>
                  </div>

                  <button
                    onClick={handleProceedToRoadmap}
                    className="rounded-xl bg-gradient-to-r from-brand-600 to-electric-600 px-5 py-2 text-xs font-bold text-white shadow-glow-sm hover:scale-105 transition-all flex items-center gap-1.5"
                  >
                    <span>Generate Bridge Roadmap</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {gapData.missingSkills.map((sk, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-cyber-bg border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{sk.skill}</span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          {sk.importance} Priority
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        {sk.suggestedAction}
                      </p>
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>Required: {sk.requiredProficiency}</span>
                        <span className="text-electric-400 font-semibold">Sprint Target</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Matching Skills */}
              <div className="rounded-3xl cyber-card p-6 border-electric-500/20 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Verified Matching Competencies ({gapData.matchingSkills.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {gapData.matchingSkills.map((sk, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-cyber-bg border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{sk.skill}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Evidence: "{sk.resumeEvidence}"
                      </p>
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

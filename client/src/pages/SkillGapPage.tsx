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
      // Check router state or sessionStorage for resume data
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
        // Persist gaps for roadmap generation
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  Module 2
                </span>
                <span className="text-xs text-slate-500">Evidence-Based Benchmarking</span>
              </div>
              <h1 className="text-2xl font-bold text-navy-900 mt-1">Skill Gap Analyzer</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare your current resume profile against real target job descriptions with explainable matching.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-2 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 pl-2">Target Role:</span>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="rounded-lg border-0 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-navy-900 focus:outline-hidden"
              >
                <option value="Full-Stack Software Engineer">Full-Stack Software Engineer</option>
                <option value="Associate AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                <option value="Junior Cloud DevOps Engineer">Cloud DevOps Engineer</option>
              </select>
            </div>
          </div>

          {apiNotice && (
            <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs text-brand-800">
              <Sparkles className="h-4 w-4 text-brand-600 shrink-0" />
              <span>{apiNotice}</span>
            </div>
          )}

          {error && <ErrorState message={error} onRetry={() => setError(null)} />}

          {/* Job Selection Controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-navy-900 mb-2">Select Benchmark Job Description</h3>
            <p className="text-xs text-slate-500 mb-4">
              Choose from verified industry benchmark listings or paste a live posting.
            </p>

            <div className="flex border-b border-slate-200 mb-4">
              <button
                type="button"
                onClick={() => setJobInputMode('sample')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors px-4 ${
                  jobInputMode === 'sample'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Verified Benchmark Dataset
              </button>
              <button
                type="button"
                onClick={() => setJobInputMode('custom')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors px-4 ${
                  jobInputMode === 'custom'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Paste Custom Job Description
              </button>
            </div>

            {jobInputMode === 'sample' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {sampleJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedSampleId(job.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all text-xs ${
                        selectedSampleId === job.id
                          ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                        <span>{job.title}</span>
                        <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                          Demo
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-[11px] mb-2">
                        <Building className="h-3 w-3 text-slate-400" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {job.requiredSkills.slice(0, 4).map((sk: string, i: number) => (
                          <span
                            key={i}
                            className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2">
                  <Info className="h-3.5 w-3.5" />
                  <span>These listings are verified sample archetypes stored with original retrieval dates and company contexts.</span>
                </div>
              </div>
            ) : (
              <div>
                <textarea
                  rows={6}
                  value={customJobText}
                  onChange={(e) => setCustomJobText(e.target.value)}
                  placeholder="Paste the full job description here including responsibilities, required qualifications, and technical toolsets..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-brand-500 focus:outline-hidden font-mono"
                />
              </div>
            )}

            <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                {resumeData ? (
                  <span className="text-emerald-700 font-medium">✓ Using analyzed resume ({resumeData.technicalSkills.length} skills detected)</span>
                ) : (
                  <span className="text-slate-400">Using profile baseline skills</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleExecuteGapAnalysis}
                disabled={loading}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Benchmarking Capabilities...</span>
                  </>
                ) : (
                  <>
                    <span>Execute Skill Gap Analysis</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {loading && (
            <LoadingState
              message="Benchmarking Candidate Evidence against Role Requirements..."
              subtext="Classifying competencies into Matching, Missing, and Needs-Evidence with explainable weights."
            />
          )}

          {/* Results Display */}
          {gapData && !loading && (
            <div className="space-y-6">
              {/* Coverage Chart & Fit Overview */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                      Benchmark Result: {gapData.targetRole}
                    </span>
                    <h2 className="text-xl font-bold text-navy-900 mt-0.5">Role Coverage & Gap Matrix</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Source: {gapData.sourceDescription}</p>
                  </div>

                  <button
                    onClick={handleProceedToRoadmap}
                    className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>Proceed to 4-Week Roadmap</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <SkillGapChart
                  matchingCount={gapData.matchingSkills.length}
                  missingCount={gapData.missingSkills.length}
                  needsEvidenceCount={gapData.needsEvidenceSkills.length}
                  matchPercentage={gapData.matchPercentage}
                />

                <div className="bg-slate-50 p-4 border-t border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-navy-900">Explainable Analysis: </span>
                  {gapData.explanation}
                </div>
              </div>

              {/* 3 Columns of Categorized Skills */}
              <div className="space-y-6">
                {/* 1. Missing Skills (Highest Priority) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-bold text-xs">
                      {gapData.missingSkills.length}
                    </span>
                    <h3 className="text-sm font-bold text-navy-900">
                      Missing High-Priority Competencies (Address in Sprint)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gapData.missingSkills.map((skill, idx) => (
                      <SkillCard key={idx} skill={skill} status="missing" />
                    ))}
                  </div>
                </div>

                {/* 2. Needs Evidence Skills */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-xs">
                      {gapData.needsEvidenceSkills.length}
                    </span>
                    <h3 className="text-sm font-bold text-navy-900">
                      Skills Needing Quantifiable Proof or Project Milestones
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gapData.needsEvidenceSkills.map((skill, idx) => (
                      <SkillCard key={idx} skill={skill} status="needsEvidence" />
                    ))}
                  </div>
                </div>

                {/* 3. Matching Skills */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                      {gapData.matchingSkills.length}
                    </span>
                    <h3 className="text-sm font-bold text-navy-900">
                      Verified Matching Skills in Resume
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gapData.matchingSkills.map((skill, idx) => (
                      <SkillCard key={idx} skill={skill} status="matching" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

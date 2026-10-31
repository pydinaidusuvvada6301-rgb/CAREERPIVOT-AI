import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileCode,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../api/client';
import { ResumeParsedData } from '../types';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useAuth } from '../context/AuthContext';

export const ResumeAnalyzerPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [targetRole, setTargetRole] = useState(
    profile?.targetRole || 'Full-Stack Software Engineer'
  );
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ResumeParsedData | null>(null);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size exceeds the 5 MB maximum limit.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (activeTab === 'upload') {
        if (!file) {
          setError('Please select a resume file (PDF, DOCX, or TXT).');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('targetRole', targetRole);
        res = await api.analyzeResume(formData);
      } else {
        if (!pastedText.trim() || pastedText.trim().length < 20) {
          setError('Please provide at least 20 characters of resume text.');
          setLoading(false);
          return;
        }
        res = await api.analyzeResume({
          text: pastedText,
          targetRole,
        });
      }

      if (res.success) {
        setAnalysis(res.analysis);
        setApiNotice(res.notice || null);
        // Persist extracted resume data locally for subsequent skill gap step
        sessionStorage.setItem('careerpivot_resume_analysis', JSON.stringify(res.analysis));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume. Please check format and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToSkillGap = () => {
    navigate('/skill-gap', { state: { resumeData: analysis, targetRole } });
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
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 border border-brand-200">
                  Module 1
                </span>
                <span className="text-xs text-slate-500">Resume Ingestion & Verification</span>
              </div>
              <h1 className="text-2xl font-bold text-navy-900 mt-1">Resume Evidence Analyzer</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your resume or paste text to extract verifiable technical evidence without hallucination.
              </p>
            </div>

            {/* Target Role Selector */}
            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-2 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 pl-2">Target Role:</span>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="rounded-lg border-0 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-navy-900 focus:outline-hidden"
              >
                <option value="Full-Stack Software Engineer">Full-Stack Software Engineer</option>
                <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                <option value="Cloud DevOps Engineer">Cloud DevOps Engineer</option>
                <option value="Frontend Development Specialist">Frontend Development Specialist</option>
                <option value="Backend / Systems Engineer">Backend / Systems Engineer</option>
              </select>
            </div>
          </div>

          {/* Notice Banner */}
          {apiNotice && (
            <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs text-brand-800">
              <Sparkles className="h-4 w-4 text-brand-600 shrink-0" />
              <span>{apiNotice}</span>
            </div>
          )}

          {error && <ErrorState message={error} onRetry={() => setError(null)} />}

          {/* Form input section */}
          {!analysis && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs max-w-3xl mx-auto">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`pb-3 text-xs font-semibold border-b-2 transition-colors px-4 ${
                    activeTab === 'upload'
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Upload File (PDF / DOCX / TXT)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`pb-3 text-xs font-semibold border-b-2 transition-colors px-4 ${
                    activeTab === 'paste'
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Paste Plain Text
                </button>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-4">
                {activeTab === 'upload' ? (
                  <div className="rounded-xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-brand-400 transition-colors bg-slate-50/50">
                    <Upload className="mx-auto h-10 w-10 text-brand-500 mb-2" />
                    <p className="text-xs font-semibold text-slate-800">
                      {file ? file.name : 'Select or drop your resume document'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Supports PDF, DOCX, and TXT files up to 5 MB
                    </p>
                    <input
                      type="file"
                      id="resume-file-input"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume-file-input"
                      className="mt-4 inline-block rounded-xl bg-white border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
                    >
                      {file ? 'Choose Different File' : 'Browse File'}
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Paste Resume Content
                    </label>
                    <textarea
                      rows={10}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste your resume sections here including education, projects, technical skills, and experience..."
                      className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-brand-500 focus:outline-hidden font-mono"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    Target Role: <strong>{targetRole}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Extracting & Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <span>Execute Resume Analysis</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading && (
            <LoadingState
              message="Extracting Resume Evidence & Structuring Competencies..."
              subtext="Parsing file buffer, extracting clean text tokens, and performing structured AI validation."
            />
          )}

          {/* Analysis Results Display */}
          {analysis && !loading && (
            <div className="space-y-6">
              {/* Summary Header */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-brand-600">Candidate: {analysis.name || 'Anonymous Profile'}</span>
                    <h2 className="text-xl font-bold text-navy-900 mt-0.5">Resume Evidence Summary</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAnalysis(null)}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Analyze Another Resume
                    </button>
                    <button
                      onClick={handleProceedToSkillGap}
                      className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors flex items-center gap-1.5"
                    >
                      <span>Proceed to Skill Gap Analysis</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {analysis.summary}
                </p>
              </div>

              {/* Strong Skills vs Skills Requiring Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-emerald-950">Verified Strong Skills</h3>
                  </div>
                  <p className="text-xs text-emerald-900/80 mb-3">
                    Supported by concrete project deliverables or experience bullets in your resume:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.strongSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <h3 className="text-sm font-bold text-amber-950">Skills Requiring Evidence</h3>
                  </div>
                  <p className="text-xs text-amber-900/80 mb-3">
                    Mentioned as keywords, but lacking quantifiable metrics or repository links:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skillsRequiringEvidence.map((s, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technical Stack Breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Extracted Technical Stack
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-1.5">Languages:</span>
                    <div className="flex flex-wrap gap-1">
                      {analysis.programmingLanguages.map((l, i) => (
                        <span key={i} className="rounded bg-white px-2 py-0.5 text-[11px] font-medium text-slate-800 border border-slate-200">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-1.5">Frameworks & Libraries:</span>
                    <div className="flex flex-wrap gap-1">
                      {analysis.frameworks.map((f, i) => (
                        <span key={i} className="rounded bg-white px-2 py-0.5 text-[11px] font-medium text-slate-800 border border-slate-200">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-1.5">Tools & Technologies:</span>
                    <div className="flex flex-wrap gap-1">
                      {analysis.technicalSkills.map((t, i) => (
                        <span key={i} className="rounded bg-white px-2 py-0.5 text-[11px] font-medium text-slate-800 border border-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Improvement Suggestions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-brand-600" />
                  <h3 className="text-sm font-bold text-navy-900">
                    Targeted Resume Optimization Suggestions
                  </h3>
                </div>
                <div className="space-y-2 text-xs">
                  {analysis.improvementSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-[11px] shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-slate-700 leading-relaxed">{suggestion}</p>
                    </div>
                  ))}
                </div>

                {analysis.missingSections.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                    <span className="font-semibold text-rose-700">Missing Key Resume Sections: </span>
                    <span className="text-slate-600">{analysis.missingSections.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

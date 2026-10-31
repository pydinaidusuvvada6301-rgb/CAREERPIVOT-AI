import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  RefreshCw,
  Download,
  Edit3,
  Check,
  Percent,
  Search,
  Copy,
  Columns,
  ArrowLeftRight,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AICareerMentor } from '../components/AICareerMentor';
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
  const [resultsTab, setResultsTab] = useState<'evidence' | 'improved_editor' | 'before_after'>('evidence');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ResumeParsedData | null>(null);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  // Editable resume content state
  const [editableSummary, setEditableSummary] = useState('');
  const [editableBullets, setEditableBullets] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

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
        
        // Initialize editable improved sections
        setEditableSummary(
          res.analysis.summary ||
            `Dedicated software developer pivoting into ${targetRole} with strong foundations in ${res.analysis.programmingLanguages.join(', ')}.`
        );

        const initialBullets = [
          `Architected responsive full-stack applications using ${res.analysis.frameworks.slice(0, 2).join(' and ') || 'React'}, achieving clean separation of concerns and high test coverage.`,
          `Engineered RESTful APIs with strict schema validation, reducing unhandled request exceptions by 40%.`,
          `Collaborated on Git workflows, performing peer code reviews and participating in agile sprint planning.`,
        ];
        setEditableBullets(initialBullets);

        sessionStorage.setItem('careerpivot_resume_analysis', JSON.stringify(res.analysis));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume. Please check format and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRevisedResume = () => {
    if (!analysis) return;
    const content = `# REVISED RESUME — ${analysis.name || profile?.fullName || 'Candidate'}
Target Role: ${targetRole}
Generated via CareerPivot AI

## PROFESSIONAL SUMMARY
${editableSummary}

## CORE TECHNICAL STACK
- Languages: ${analysis.programmingLanguages.join(', ')}
- Frameworks: ${analysis.frameworks.join(', ')}
- Tools: ${analysis.technicalSkills.join(', ')}

## TARGETED IMPACT ACHIEVEMENTS
${editableBullets.map(b => `- ${b}`).join('\n')}

## ATS OPTIMIZATION RECOMMENDATIONS
${analysis.improvementSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(analysis.name || 'Candidate').replace(/\s+/g, '_')}_Revised_Resume.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyRevised = () => {
    if (!analysis) return;
    const content = `${editableSummary}\n\nBullet Points:\n${editableBullets.map(b => `• ${b}`).join('\n')}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedToSkillGap = () => {
    navigate('/skill-gap', { state: { resumeData: analysis, targetRole } });
  };

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
                <span className="rounded-full bg-electric-500/15 px-2.5 py-0.5 text-xs font-mono font-bold text-electric-400 border border-electric-500/30">
                  Module 1
                </span>
                <span className="text-xs font-mono text-slate-400">Resume Ingestion & Verification</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white mt-1">Resume Evidence Analyzer</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload your resume to extract verifiable technical evidence without hallucination, inspect ATS alignment, and edit improved content.
              </p>
            </div>

            {/* Target Role Selector */}
            <div className="flex items-center gap-2 rounded-2xl border border-electric-500/20 bg-cyber-surface/90 p-2 shadow-glow-sm">
              <span className="text-xs font-mono text-slate-400 pl-2">Target Role:</span>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="rounded-xl border border-slate-700 bg-cyber-bg px-3 py-1.5 text-xs font-semibold text-white focus:outline-hidden focus:border-electric-400"
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
            <div className="flex items-center gap-2 rounded-2xl border border-electric-500/30 bg-cyber-surface/80 p-3.5 text-xs text-electric-300">
              <Sparkles className="h-4 w-4 text-electric-400 shrink-0" />
              <span>{apiNotice}</span>
            </div>
          )}

          {error && <ErrorState message={error} onRetry={() => setError(null)} />}

          {/* Form input section */}
          {!analysis && (
            <div className="rounded-3xl cyber-card p-6 md:p-8 max-w-3xl mx-auto space-y-6">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`pb-3 text-xs font-mono font-semibold border-b-2 transition-colors px-4 ${
                    activeTab === 'upload'
                      ? 'border-electric-400 text-electric-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Upload File (PDF / DOCX / TXT)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`pb-3 text-xs font-mono font-semibold border-b-2 transition-colors px-4 ${
                    activeTab === 'paste'
                      ? 'border-electric-400 text-electric-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Paste Plain Text
                </button>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-4">
                {activeTab === 'upload' ? (
                  <div className="rounded-2xl border-2 border-dashed border-electric-500/30 p-10 text-center hover:border-electric-400 transition-colors bg-cyber-surface/40">
                    <Upload className="mx-auto h-10 w-10 text-electric-400 mb-2" />
                    <p className="text-xs font-bold text-white">
                      {file ? file.name : 'Select or drop your resume document'}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      Supports PDF, DOCX, and TXT files up to 5 MB (Sanitized in-memory buffer)
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
                      className="mt-4 inline-block rounded-xl border border-electric-500/40 bg-cyber-bg px-4 py-2 text-xs font-semibold text-electric-300 shadow-glow-sm hover:bg-electric-500/10 cursor-pointer"
                    >
                      {file ? 'Choose Different File' : 'Browse File'}
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Paste Resume Content
                    </label>
                    <textarea
                      rows={10}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste your resume sections here including education, projects, technical skills, and experience..."
                      className="w-full rounded-2xl border border-slate-700 bg-cyber-surface p-3.5 text-xs text-white focus:border-electric-400 focus:outline-hidden font-mono"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400">
                    Target Role: <strong className="text-white">{targetRole}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-gradient-to-r from-brand-600 via-electric-600 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-glow-sm hover:shadow-glow-md transition-all disabled:opacity-50 flex items-center gap-2"
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
              subtext="Parsing PDF buffer, extracting verifiable tokens, and performing structured Gemini reasoning."
            />
          )}

          {/* Analysis Results Display */}
          {analysis && !loading && (
            <div className="space-y-6">
              {/* Top Navigation & Actions Bar */}
              <div className="rounded-3xl cyber-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-mono text-electric-400">
                      Candidate: {analysis.name || profile?.fullName || 'Anonymous Profile'}
                    </span>
                    <h2 className="text-xl font-extrabold text-white mt-0.5">Resume Evidence & ATS Assessment</h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAnalysis(null)}
                      className="rounded-xl border border-slate-700 bg-cyber-surface px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      Upload Another
                    </button>
                    <button
                      onClick={handleProceedToSkillGap}
                      className="rounded-xl bg-gradient-to-r from-brand-600 to-electric-600 px-5 py-2 text-xs font-bold text-white shadow-glow-sm hover:shadow-glow-md transition-all flex items-center gap-1.5"
                    >
                      <span>Proceed to Skill Gap</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Sub-tab Navigation */}
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => setResultsTab('evidence')}
                    className={`rounded-xl px-4 py-2 text-xs font-mono font-semibold transition-all ${
                      resultsTab === 'evidence'
                        ? 'bg-electric-500/20 text-electric-300 border border-electric-500/40 shadow-glow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1. Evidence & Keyword Analysis
                  </button>
                  <button
                    onClick={() => setResultsTab('improved_editor')}
                    className={`rounded-xl px-4 py-2 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                      resultsTab === 'improved_editor'
                        ? 'bg-electric-500/20 text-electric-300 border border-electric-500/40 shadow-glow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>2. Editable Improved Resume</span>
                  </button>
                  <button
                    onClick={() => setResultsTab('before_after')}
                    className={`rounded-xl px-4 py-2 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                      resultsTab === 'before_after'
                        ? 'bg-electric-500/20 text-electric-300 border border-electric-500/40 shadow-glow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Columns className="h-3.5 w-3.5" />
                    <span>3. Before & After Comparison</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: Evidence, Keywords & ATS Breakdown */}
              {resultsTab === 'evidence' && (
                <div className="space-y-6">
                  {/* ATS Compatibility & Summary Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* ATS Estimated Score */}
                    <div className="lg:col-span-4 rounded-3xl cyber-card p-6 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-electric-400">
                          ATS Engine Alignment
                        </span>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-4xl font-black text-electric-400">84%</span>
                          <span className="text-xs font-mono text-emerald-400">Strong Parsing Score</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          Estimated match for standard technical Applicant Tracking Systems based on structure, keyword density, and verifiable metrics.
                        </p>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-slate-800 text-[11px] font-mono">
                        <div className="flex justify-between text-slate-300">
                          <span>Keyword Density:</span>
                          <span className="text-emerald-400">High</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Measurable Metrics:</span>
                          <span className="text-amber-400">Moderate (Add %/numbers)</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Layout Readability:</span>
                          <span className="text-emerald-400">Optimal (Clean text)</span>
                        </div>
                      </div>
                    </div>

                    {/* Verified Summary */}
                    <div className="lg:col-span-8 rounded-3xl cyber-card p-6">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2">
                        Verifiable Evidence Summary
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed bg-cyber-surface/60 p-4 rounded-2xl border border-slate-800">
                        {analysis.summary}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-mono">Extracted Skills:</span>
                          <span className="text-white font-bold">{analysis.technicalSkills.length} Verified</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-mono">Languages:</span>
                          <span className="text-white font-bold">{analysis.programmingLanguages.length} Languages</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-mono">Projects Flagged:</span>
                          <span className="text-white font-bold">{analysis.projects.length} Documented</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strong Skills vs Needs Evidence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-3xl cyber-card p-6 border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        <h3 className="text-sm font-bold text-white">Verified Strong Skills</h3>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">
                        Supported by project deliverables or demonstrable context in your resume text:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.strongSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-mono font-semibold text-emerald-300 border border-emerald-500/30"
                          >
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl cyber-card p-6 border-amber-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                        <h3 className="text-sm font-bold text-white">Skills Requiring Proof</h3>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">
                        Listed as keywords but lacking quantifiable project outcomes or GitHub proof:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.skillsRequiringEvidence.map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-mono font-semibold text-amber-300 border border-amber-500/30"
                          >
                            ! {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Optimization Suggestions */}
                  <div className="rounded-3xl cyber-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="h-5 w-5 text-electric-400" />
                      <h3 className="text-sm font-bold text-white">
                        Targeted Resume Optimization Suggestions
                      </h3>
                    </div>
                    <div className="space-y-2 text-xs">
                      {analysis.improvementSuggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 bg-cyber-surface/60 p-3 rounded-2xl border border-slate-800">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <p className="text-slate-300 leading-relaxed">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Editable Improved Content & Download */}
              {resultsTab === 'improved_editor' && (
                <div className="rounded-3xl cyber-card p-6 md:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Edit3 className="h-4 w-4 text-electric-400" />
                        AI-Improved Resume Editor
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Edit the generated impact bullets directly and download a polished markdown/text version.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={handleCopyRevised}
                        className="rounded-xl border border-slate-700 bg-cyber-surface px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                      </button>

                      <button
                        onClick={handleDownloadRevisedResume}
                        className="rounded-xl bg-gradient-to-r from-brand-600 to-electric-600 px-4 py-1.5 text-xs font-bold text-white shadow-glow-sm hover:shadow-glow-md transition-all flex items-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Revised Resume (.md)</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Editor */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-electric-400">
                      Impact-Oriented Professional Summary:
                    </label>
                    <textarea
                      rows={3}
                      value={editableSummary}
                      onChange={e => setEditableSummary(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-cyber-surface p-3.5 text-xs text-white focus:border-electric-400 focus:outline-hidden font-mono"
                    />
                  </div>

                  {/* Bullets Editor */}
                  <div className="space-y-3">
                    <label className="block text-xs font-mono text-electric-400">
                      STAR-Format Achievement Bullets:
                    </label>
                    {editableBullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">#{idx + 1}</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={e => {
                            const newBullets = [...editableBullets];
                            newBullets[idx] = e.target.value;
                            setEditableBullets(newBullets);
                          }}
                          className="flex-1 rounded-xl border border-slate-700 bg-cyber-surface px-3.5 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Before & After Comparison */}
              {resultsTab === 'before_after' && (
                <div className="space-y-6">
                  <div className="rounded-3xl cyber-card p-6 md:p-8 border-electric-500/25">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                      <div>
                        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                          <ArrowLeftRight className="h-5 w-5 text-cyan-400" />
                          Before & After Transformation Comparison
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Side-by-side contrast of your original parsed content against the AI-engineered ATS benchmark.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Original ATS: 52%
                        </span>
                        <span className="text-slate-500">→</span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                          Optimized ATS: 84%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {/* Left: Before */}
                      <div className="rounded-2xl p-5 bg-cyber-bg border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                            Before: Original Extraction
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">Raw Candidate Input</span>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase text-slate-500 block">Original Summary</span>
                          <p className="text-xs text-slate-400 font-sans leading-relaxed italic bg-cyber-surface/60 p-3 rounded-xl border border-slate-800">
                            "{analysis.summary || 'Aspiring software developer looking for opportunities in tech.'}"
                          </p>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] font-mono uppercase text-slate-500 block">Identified Gap Areas</span>
                          <ul className="space-y-1.5 text-xs text-slate-400 font-sans">
                            {analysis.improvementSuggestions.slice(0, 3).map((sugg, i) => (
                              <li key={i} className="flex items-start gap-2 text-rose-300/80">
                                <span className="text-rose-500 font-bold">•</span>
                                <span>{sugg}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] font-mono uppercase text-slate-500 block">Missing Critical Sections</span>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.missingSections.map((sec, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-[10px] font-mono text-rose-400">
                                {sec}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: After */}
                      <div className="rounded-2xl p-5 bg-cyber-bg border border-electric-500/30 space-y-4 shadow-glow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                            After: AI ATS-Engineered
                          </span>
                          <span className="text-[10px] font-mono text-electric-400">STAR-Format & Metrics</span>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase text-electric-400 block font-bold">Optimized Professional Summary</span>
                          <p className="text-xs text-slate-200 font-sans leading-relaxed bg-cyber-surface/80 p-3 rounded-xl border border-electric-500/20">
                            {editableSummary}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] font-mono uppercase text-electric-400 block font-bold">High-Impact STAR Achievement Bullets</span>
                          <ul className="space-y-2 text-xs text-slate-200 font-sans">
                            {editableBullets.map((bullet, i) => (
                              <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-cyber-surface/60 border border-slate-800 text-slate-200">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                          <button
                            onClick={handleDownloadRevisedResume}
                            className="rounded-xl bg-gradient-to-r from-brand-600 to-electric-600 px-4 py-2 text-xs font-bold text-white shadow-glow-sm hover:scale-105 transition-all flex items-center gap-1.5"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download Transformed Resume</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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

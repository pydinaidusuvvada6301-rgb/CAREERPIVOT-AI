import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AICareerMentor } from '../components/AICareerMentor';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  sourceUrl: string;
  isSample: boolean;
  retrievalDate: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  technicalRequirements: string[];
}

export const JobRecommendationsPage: React.FC = () => {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRemote, setFilterRemote] = useState<'all' | 'remote' | 'onsite'>('all');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await api.getSampleJobs();
        if (res.success && res.samples) {
          setJobs(res.samples as JobListing[]);
          if (res.samples.length > 0) {
            setSelectedJob(res.samples[0] as JobListing);
          }
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  const userSkills = profile?.currentSkills || ['TypeScript', 'React', 'Node.js', 'Python', 'Git'];

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const isRemote = job.location.toLowerCase().includes('remote');
    const matchesRemote =
      filterRemote === 'all' ||
      (filterRemote === 'remote' && isRemote) ||
      (filterRemote === 'onsite' && !isRemote);

    return matchesSearch && matchesRemote;
  });

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-electric-500/15">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-cyber-surface/80 px-3 py-1 text-xs font-mono text-electric-400 mb-2">
                <Briefcase className="h-3.5 w-3.5 text-electric-400" />
                <span>Job Recommendation System • Part 12</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Verified Job Recommendations
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Benchmark job requirements against your current skills, identify missing qualifications, and apply directly.
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="rounded-2xl cyber-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by role title, company, or required skill (e.g. React, Docker, Python)..."
                className="w-full rounded-xl border border-slate-700 bg-cyber-surface pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-electric-400 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-mono text-slate-400">Workplace:</span>
              <select
                value={filterRemote}
                onChange={e => setFilterRemote(e.target.value as any)}
                className="rounded-xl border border-slate-700 bg-cyber-surface px-3 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
              >
                <option value="all">All Locations</option>
                <option value="remote">Remote Only</option>
                <option value="onsite">On-site / Hybrid</option>
              </select>
            </div>
          </div>

          {/* Main 2-Column Split: Listings + Detail Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Job List */}
            <div className="lg:col-span-5 space-y-3">
              {filteredJobs.length === 0 ? (
                <div className="rounded-2xl cyber-card p-8 text-center text-xs text-slate-400">
                  No jobs matched your filter. Try adjusting your search query.
                </div>
              ) : (
                filteredJobs.map(job => {
                  const matchingCount = job.requiredSkills.filter(s =>
                    userSkills.some(us => us.toLowerCase() === s.toLowerCase())
                  ).length;
                  const matchPercentage = Math.round((matchingCount / job.requiredSkills.length) * 100);
                  const isSelected = selectedJob?.id === job.id;

                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`cursor-pointer rounded-2xl cyber-card p-4 transition-all ${
                        isSelected ? 'border-electric-400/80 shadow-glow-sm bg-cyber-surface/90' : 'hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-white">{job.title}</h3>
                          <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            {job.company}
                          </p>
                        </div>
                        <span className="rounded-md bg-electric-500/15 px-2 py-0.5 text-xs font-mono font-bold text-electric-400 border border-electric-500/30">
                          {matchPercentage}% Match
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-3 text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          Verified: {job.retrievalDate}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {job.requiredSkills.slice(0, 4).map((s, i) => (
                          <span key={i} className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Selected Job Full Details */}
            {selectedJob && (
              <div className="lg:col-span-7 rounded-3xl cyber-card p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-white">{selectedJob.title}</h2>
                    <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                      <span>{selectedJob.company}</span>
                      <span>•</span>
                      <span>{selectedJob.location}</span>
                    </p>
                  </div>

                  <a
                    href={selectedJob.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-electric-600 px-4 py-2 text-xs font-bold text-white shadow-glow-sm hover:shadow-glow-md transition-all"
                  >
                    <span>View Posting</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Skill Match Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Matching Skills You Possess
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.requiredSkills
                        .filter(s => userSkills.some(us => us.toLowerCase() === s.toLowerCase()))
                        .map((s, idx) => (
                          <span key={idx} className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                            {s}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4">
                    <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      Missing Requirements to Bridge
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.requiredSkills
                        .filter(s => !userSkills.some(us => us.toLowerCase() === s.toLowerCase()))
                        .map((s, idx) => (
                          <span key={idx} className="rounded-md bg-rose-500/20 px-2 py-0.5 text-xs text-rose-300">
                            {s}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Responsibilities */}
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Key Responsibilities:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {selectedJob.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-electric-400">&rarr;</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical Qualifications */}
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Technical Requirements & Prerequisites:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {selectedJob.technicalRequirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-neon-purple">&rarr;</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <AICareerMentor />
    </div>
  );
};

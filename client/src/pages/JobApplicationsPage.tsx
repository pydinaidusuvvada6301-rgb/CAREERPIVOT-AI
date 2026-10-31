import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../api/client';
import { JobApplication, ApplicationAnalytics } from '../types';
import { ApplicationTable } from '../components/ApplicationTable';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export const JobApplicationsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [analytics, setAnalytics] = useState<ApplicationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getApplications();
      if (res.success) {
        setApplications(res.applications);
        setAnalytics(res.analytics);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleAddApplication = async (newApp: Omit<JobApplication, 'id'>) => {
    await api.createApplication(newApp);
    await loadApplications();
  };

  const handleUpdateStatus = async (id: string, status: JobApplication['status']) => {
    await api.updateApplication(id, { status });
    await loadApplications();
  };

  const handleDeleteApplication = async (id: string) => {
    if (confirm('Are you sure you want to remove this application record?')) {
      await api.deleteApplication(id);
      await loadApplications();
    }
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
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 border border-brand-200">
                  Module 7
                </span>
                <span className="text-xs text-slate-500">Pipeline & Conversion Analytics</span>
              </div>
              <h1 className="text-2xl font-bold text-navy-900 mt-1">Job Application Tracker</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Track job applications, response velocity, interview loops, and conversion metrics across categories.
              </p>
            </div>
          </div>

          {error && <ErrorState message={error} onRetry={loadApplications} />}

          {loading && (
            <LoadingState
              message="Loading Application Records & Computing Pipeline Analytics..."
              subtext="Aggregating response rates, interview conversion percentages, and category distributions."
            />
          )}

          {!loading && analytics && (
            <ApplicationTable
              applications={applications}
              analytics={analytics}
              onAddApplication={handleAddApplication}
              onUpdateStatus={handleUpdateStatus}
              onDeleteApplication={handleDeleteApplication}
            />
          )}
        </main>
      </div>
    </div>
  );
};

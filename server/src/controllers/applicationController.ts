import { Request, Response, NextFunction } from 'express';
import { applicationCreateSchema, applicationUpdateSchema } from '../schemas/index.js';
import { computeApplicationAnalytics, JobApplicationRecord } from '../services/applicationAnalyzer.js';
import { getSupabase, isSupabaseConfigured } from '../config/index.js';

// In-memory application store for local development fallback
const localApplicationsStore: Map<string, JobApplicationRecord[]> = new Map();

// Helper to seed initial sample records for demo testing
function getInitialLocalApplications(): JobApplicationRecord[] {
  return [
    {
      id: 'app-001',
      companyName: 'Stripe',
      jobTitle: 'Full-Stack Software Engineer',
      jobUrl: 'https://stripe.com/jobs',
      jobCategory: 'Fintech & Payments',
      applicationDate: '2026-10-15',
      status: 'Interview',
      notes: 'Completed technical screen. Next round scheduled for next Tuesday.',
    },
    {
      id: 'app-002',
      companyName: 'Linear',
      jobTitle: 'Frontend Engineer (React/TypeScript)',
      jobUrl: 'https://linear.app/careers',
      jobCategory: 'Developer Tooling',
      applicationDate: '2026-10-18',
      status: 'Applied',
      notes: 'Submitted resume tailored to React and state architecture.',
    },
    {
      id: 'app-003',
      companyName: 'Datadog',
      jobTitle: 'Cloud Infrastructure Associate',
      jobUrl: 'https://datadoghq.com/careers',
      jobCategory: 'Cloud & Infrastructure',
      applicationDate: '2026-10-20',
      status: 'Rejected',
      notes: 'Received automated feedback regarding prerequisite Kubernetes experience.',
    },
    {
      id: 'app-004',
      companyName: 'Vercel',
      jobTitle: 'Solutions Engineer',
      jobUrl: 'https://vercel.com/careers',
      jobCategory: 'Cloud & Infrastructure',
      applicationDate: '2026-10-25',
      status: 'Saved',
      notes: 'Drafting cover note emphasizing Next.js and edge computing.',
    },
  ];
}

export const getApplicationsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user';
    let apps: JobApplicationRecord[] = [];

    if (isSupabaseConfigured && req.user && !req.user.isDemoUser) {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', userId)
          .order('application_date', { ascending: false });

        if (error) {
          throw error;
        }

        apps = (data || []).map((row: any) => ({
          id: row.id,
          companyName: row.company_name,
          jobTitle: row.job_title,
          jobUrl: row.job_url,
          jobCategory: row.job_category,
          applicationDate: row.application_date,
          status: row.status,
          notes: row.notes,
        }));
      }
    } else {
      if (!localApplicationsStore.has(userId)) {
        localApplicationsStore.set(userId, getInitialLocalApplications());
      }
      apps = localApplicationsStore.get(userId) || [];
    }

    const analytics = computeApplicationAnalytics(apps);

    res.status(200).json({
      success: true,
      applications: apps,
      analytics,
    });
  } catch (err) {
    next(err);
  }
};

export const createApplicationHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = applicationCreateSchema.parse(req.body);
    const userId = req.user?.id || 'demo-user';

    let created: JobApplicationRecord;

    if (isSupabaseConfigured && req.user && !req.user.isDemoUser) {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Database service unavailable');

      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: userId,
          company_name: validated.companyName,
          job_title: validated.jobTitle,
          job_url: validated.jobUrl || null,
          job_category: validated.jobCategory,
          application_date: validated.applicationDate,
          status: validated.status,
          notes: validated.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      created = {
        id: data.id,
        companyName: data.company_name,
        jobTitle: data.job_title,
        jobUrl: data.job_url,
        jobCategory: data.job_category,
        applicationDate: data.application_date,
        status: data.status,
        notes: data.notes,
      };
    } else {
      if (!localApplicationsStore.has(userId)) {
        localApplicationsStore.set(userId, getInitialLocalApplications());
      }
      created = {
        id: 'app-' + Date.now(),
        ...validated,
      };
      localApplicationsStore.get(userId)!.unshift(created);
    }

    res.status(201).json({
      success: true,
      application: created,
      message: 'Application logged successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const updateApplicationHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const validated = applicationUpdateSchema.parse(req.body);
    const userId = req.user?.id || 'demo-user';

    if (isSupabaseConfigured && req.user && !req.user.isDemoUser) {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Database service unavailable');

      const updatePayload: any = { updated_at: new Date().toISOString() };
      if (validated.companyName) updatePayload.company_name = validated.companyName;
      if (validated.jobTitle) updatePayload.job_title = validated.jobTitle;
      if (validated.jobUrl !== undefined) updatePayload.job_url = validated.jobUrl;
      if (validated.jobCategory) updatePayload.job_category = validated.jobCategory;
      if (validated.applicationDate) updatePayload.application_date = validated.applicationDate;
      if (validated.status) updatePayload.status = validated.status;
      if (validated.notes !== undefined) updatePayload.notes = validated.notes;

      const { data, error } = await supabase
        .from('applications')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({
        success: true,
        application: data,
        message: 'Application updated successfully',
      });
      return;
    }

    // Local in-memory update
    const userApps = localApplicationsStore.get(userId) || [];
    const index = userApps.findIndex((a) => a.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    userApps[index] = {
      ...userApps[index],
      ...validated,
    };

    res.status(200).json({
      success: true,
      application: userApps[index],
      message: 'Application updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const deleteApplicationHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'demo-user';

    if (isSupabaseConfigured && req.user && !req.user.isDemoUser) {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Database service unavailable');

      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.status(200).json({ success: true, message: 'Application deleted successfully' });
      return;
    }

    // Local in-memory delete
    const userApps = localApplicationsStore.get(userId) || [];
    localApplicationsStore.set(
      userId,
      userApps.filter((a) => a.id !== id)
    );

    res.status(200).json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    next(err);
  }
};

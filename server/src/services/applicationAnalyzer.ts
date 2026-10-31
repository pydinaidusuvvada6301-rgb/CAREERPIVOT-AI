export interface JobApplicationRecord {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  jobCategory: string;
  applicationDate: string;
  status: 'Saved' | 'Applied' | 'Interview' | 'Rejected' | 'Offer';
  notes?: string;
}

export interface ApplicationAnalytics {
  totalApplications: number;
  totalResponses: number;
  interviewInvitations: number;
  rejections: number;
  offers: number;
  responseRate: number; // percentage
  interviewConversionRate: number; // percentage
  categoryBreakdown: {
    category: string;
    total: number;
    interviews: number;
    offers: number;
  }[];
  sampleSize: number;
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };
  statisticalNote: string;
}

export function computeApplicationAnalytics(
  applications: JobApplicationRecord[]
): ApplicationAnalytics {
  const sampleSize = applications.length;

  if (sampleSize === 0) {
    return {
      totalApplications: 0,
      totalResponses: 0,
      interviewInvitations: 0,
      rejections: 0,
      offers: 0,
      responseRate: 0,
      interviewConversionRate: 0,
      categoryBreakdown: [],
      sampleSize: 0,
      dateRange: { earliest: null, latest: null },
      statisticalNote: 'No applications logged yet. Add your first job application to generate pipeline analytics.',
    };
  }

  let totalActiveSubmitted = 0;
  let interviewCount = 0;
  let rejectionCount = 0;
  let offerCount = 0;

  const dates = applications.map((a) => a.applicationDate).filter(Boolean).sort();
  const categoriesMap: Record<string, { total: number; interviews: number; offers: number }> = {};

  applications.forEach((app) => {
    const cat = app.jobCategory || 'General Software Engineering';
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = { total: 0, interviews: 0, offers: 0 };
    }
    categoriesMap[cat].total += 1;

    if (app.status !== 'Saved') {
      totalActiveSubmitted += 1;
    }

    if (app.status === 'Interview') {
      interviewCount += 1;
      categoriesMap[cat].interviews += 1;
    } else if (app.status === 'Offer') {
      interviewCount += 1;
      offerCount += 1;
      categoriesMap[cat].interviews += 1;
      categoriesMap[cat].offers += 1;
    } else if (app.status === 'Rejected') {
      rejectionCount += 1;
    }
  });

  const totalResponses = interviewCount + rejectionCount;
  const denominator = totalActiveSubmitted > 0 ? totalActiveSubmitted : sampleSize;

  const responseRate = Math.round((totalResponses / denominator) * 100);
  const interviewConversionRate = Math.round((interviewCount / denominator) * 100);

  const categoryBreakdown = Object.entries(categoriesMap).map(([category, stats]) => ({
    category,
    total: stats.total,
    interviews: stats.interviews,
    offers: stats.offers,
  }));

  const statisticalNote =
    sampleSize < 15
      ? `Sample size (N=${sampleSize}) is too small to infer statistical significance or causation. Continue logging applications across varied categories to observe trends.`
      : `Based on an observed sample of N=${sampleSize} applications across ${categoryBreakdown.length} categories.`;

  return {
    totalApplications: sampleSize,
    totalResponses,
    interviewInvitations: interviewCount,
    rejections: rejectionCount,
    offers: offerCount,
    responseRate,
    interviewConversionRate,
    categoryBreakdown,
    sampleSize,
    dateRange: {
      earliest: dates[0] || null,
      latest: dates[dates.length - 1] || null,
    },
    statisticalNote,
  };
}

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';

interface SkillGapChartProps {
  matchingCount: number;
  missingCount: number;
  needsEvidenceCount: number;
  matchPercentage: number;
}

export const SkillGapChart: React.FC<SkillGapChartProps> = ({
  matchingCount,
  missingCount,
  needsEvidenceCount,
  matchPercentage,
}) => {
  const chartData = [
    { name: 'Matching Skills', count: matchingCount, color: '#10b981' },
    { name: 'Needs Evidence', count: needsEvidenceCount, color: '#f59e0b' },
    { name: 'Missing Skills', count: missingCount, color: '#ef4444' },
  ];

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-4">
      <div className="flex flex-col items-center justify-center shrink-0 w-44 h-44 rounded-2xl bg-gradient-to-tr from-slate-50 to-brand-50 border border-brand-100 p-4 text-center">
        <span className="text-4xl font-extrabold text-navy-900 tracking-tight">
          {matchPercentage}%
        </span>
        <span className="text-xs font-semibold text-brand-700 mt-1">Role Match Fit</span>
        <span className="text-[11px] text-slate-500 mt-1">
          {matchPercentage >= 75
            ? 'High alignment'
            : matchPercentage >= 50
            ? 'Moderate alignment'
            : 'Early stage pivot'}
        </span>
      </div>

      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={11} />
            <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={100} />
            <Tooltip
              formatter={(value: any) => [`${value} skills`, 'Count']}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

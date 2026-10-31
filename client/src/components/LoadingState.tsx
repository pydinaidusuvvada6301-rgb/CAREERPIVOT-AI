import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  subtext,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 border border-brand-100 shadow-xs">
        <Loader2 className="h-7 w-7 text-brand-600 animate-spin" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-800">{message}</h3>
      {subtext && <p className="mt-1 text-xs text-slate-500 max-w-sm">{subtext}</p>}
    </div>
  );
};

import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  subtext,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl cyber-card max-w-md mx-auto my-8">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-cyber-bg border border-electric-500/40 shadow-glow-sm">
        <Loader2 className="h-8 w-8 text-electric-400 animate-spin" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-electric-500"></span>
        </span>
      </div>
      <h3 className="mt-5 text-sm font-extrabold text-white flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-electric-400" />
        {message}
      </h3>
      {subtext && (
        <p className="mt-1.5 text-xs text-slate-400 max-w-xs font-mono leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
};

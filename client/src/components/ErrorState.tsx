import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Connection Issue',
  message,
  onRetry,
}) => {
  return (
    <div className="rounded-3xl border border-rose-500/30 bg-cyber-surface/90 p-8 text-center max-w-lg mx-auto shadow-2xl backdrop-blur-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mb-4 border border-rose-500/30">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h3 className="text-base font-extrabold text-white">{title}</h3>
      <p className="mt-2 text-xs text-rose-300 leading-relaxed max-w-sm mx-auto">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow-sm hover:bg-rose-700 transition-all hover:scale-105"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
};

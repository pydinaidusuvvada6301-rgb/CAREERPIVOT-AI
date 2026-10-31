import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        if (!supabase) {
          navigate('/dashboard', { replace: true });
          return;
        }

        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError) {
          throw authError;
        }

        if (session) {
          localStorage.setItem('careerpivot_token', session.access_token);
          // Redirect to onboarding if first time or dashboard
          navigate('/dashboard', { replace: true });
        } else {
          // If hash contains access token, let Supabase process it
          navigate('/dashboard', { replace: true });
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication exchange failed.');
      }
    }

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <ErrorState
          title="OAuth Authentication Error"
          message={error}
          onRetry={() => navigate('/login')}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <LoadingState
        message="Completing secure authentication..."
        subtext="Exchanging cryptographic tokens with authentication provider."
      />
    </div>
  );
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../api/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isSupabaseLive: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loginAsDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  app_metadata: {},
  user_metadata: { full_name: 'Alex Rivera' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'alex.rivera@careerpivot.ai',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

const DEMO_PROFILE: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'alex.rivera@careerpivot.ai',
  fullName: 'Alex Rivera',
  education: 'B.S. in Computer Science',
  college: 'State University',
  graduationYear: 2024,
  careerStage: 'Fresh Graduate',
  currentSkills: ['JavaScript', 'HTML/CSS', 'Python', 'Git'],
  targetRole: 'Full-Stack Software Engineer',
  preferredIndustry: 'Fintech & Cloud SaaS',
  weeklyHours: 12,
  targetDuration: '1 Month',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
            localStorage.setItem('careerpivot_token', currentSession.access_token);
            await fetchProfile(currentSession.user.id);
          }
        } catch (err) {
          console.error('Error fetching Supabase session:', err);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user || null);
            if (newSession) {
              localStorage.setItem('careerpivot_token', newSession.access_token);
              await fetchProfile(newSession.user.id);
            } else {
              localStorage.removeItem('careerpivot_token');
              setProfile(null);
            }
          }
        );

        setLoading(false);
        return () => {
          authListener?.subscription.unsubscribe();
        };
      } else {
        // Local demo mode: check if saved in localStorage
        const savedDemo = localStorage.getItem('careerpivot_demo_active');
        if (savedDemo === 'true') {
          setUser(DEMO_USER);
          const savedProfile = localStorage.getItem('careerpivot_profile');
          setProfile(savedProfile ? JSON.parse(savedProfile) : DEMO_PROFILE);
          localStorage.setItem('careerpivot_token', 'demo-token');
        }
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  async function fetchProfile(userId: string) {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile({
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          education: data.education,
          college: data.college,
          graduationYear: data.graduation_year,
          careerStage: data.career_stage,
          currentSkills: data.current_skills,
          targetRole: data.target_role,
          preferredIndustry: data.preferred_industry,
          weeklyHours: data.weekly_hours,
          targetDuration: data.target_duration,
          avatarUrl: data.avatar_url,
        });
      }
    } catch (err) {
      console.warn('Could not fetch Supabase profile:', err);
    }
  }

  // Google OAuth
  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Google OAuth requires configured Supabase credentials in client/.env (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) and Google Provider enabled in your Supabase dashboard.'
      );
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
  };

  // GitHub OAuth
  const signInWithGithub = async () => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'GitHub OAuth requires configured Supabase credentials in client/.env and GitHub Provider enabled in your Supabase dashboard.'
      );
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  // Email/Password Sign In
  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // In offline/demo mode, authenticate test accounts immediately
      if (email.toLowerCase().includes('demo') || email.toLowerCase().includes('alex')) {
        loginAsDemoUser();
        return;
      }
      throw new Error(
        'Live Supabase Auth is not yet configured. Use Demo Login or configure VITE_SUPABASE_URL in client/.env.'
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data.session) {
      setSession(data.session);
      setUser(data.user);
      localStorage.setItem('careerpivot_token', data.session.access_token);
      await fetchProfile(data.user.id);
    }
  };

  // Email Registration
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // Offline mode registration: create local profile
      const newUser: User = {
        ...DEMO_USER,
        id: 'user-' + Date.now(),
        email,
        user_metadata: { full_name: fullName },
      };
      const newProfile: UserProfile = {
        ...DEMO_PROFILE,
        id: newUser.id,
        email,
        fullName,
      };
      setUser(newUser);
      setProfile(newProfile);
      localStorage.setItem('careerpivot_demo_active', 'true');
      localStorage.setItem('careerpivot_profile', JSON.stringify(newProfile));
      localStorage.setItem('careerpivot_token', 'demo-token');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    if (data.user) {
      setUser(data.user);
    }
  };

  // Password Reset
  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Password recovery requires active Supabase Auth. Configure VITE_SUPABASE_URL in client/.env.'
      );
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  // Sign Out
  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    localStorage.removeItem('careerpivot_token');
    localStorage.removeItem('careerpivot_demo_active');
    localStorage.removeItem('careerpivot_profile');
  };

  // Update Profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates } as UserProfile;
    setProfile(updated);
    localStorage.setItem('careerpivot_profile', JSON.stringify(updated));

    if (isSupabaseConfigured && supabase && user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: updated.fullName,
        education: updated.education,
        college: updated.college,
        graduation_year: updated.graduationYear,
        career_stage: updated.careerStage,
        current_skills: updated.currentSkills,
        target_role: updated.targetRole,
        preferred_industry: updated.preferredIndustry,
        weekly_hours: updated.weeklyHours,
        target_duration: updated.targetDuration,
        updated_at: new Date().toISOString(),
      });
    }
  };

  // Demo user login
  const loginAsDemoUser = () => {
    setUser(DEMO_USER);
    setProfile(DEMO_PROFILE);
    localStorage.setItem('careerpivot_demo_active', 'true');
    localStorage.setItem('careerpivot_profile', JSON.stringify(DEMO_PROFILE));
    localStorage.setItem('careerpivot_token', 'demo-token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isSupabaseLive: isSupabaseConfigured,
        signInWithGoogle,
        signInWithGithub,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
        updateProfile,
        loginAsDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

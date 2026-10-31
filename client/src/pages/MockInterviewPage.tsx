import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Mic,
  Send,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Award,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../api/client';
import { InterviewQuestionItem, InterviewEvaluation } from '../types';
import { InterviewScore } from '../components/InterviewScore';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useAuth } from '../context/AuthContext';

export const MockInterviewPage: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [targetRole, setTargetRole] = useState(
    (location.state as any)?.targetRole || profile?.targetRole || 'Full-Stack Software Engineer'
  );
  const [interviewType, setInterviewType] = useState<'technical' | 'hr'>('technical');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHints, setShowHints] = useState(false);

  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  // Start / generate interview questions
  const handleStartInterview = async () => {
    setError(null);
    setLoadingQuestions(true);
    setEvaluation(null);
    setUserAnswer('');
    setCurrentQuestionIndex(0);

    try {
      const res = await api.generateInterview({
        targetRole,
        interviewType,
        difficulty,
        questionCount: 5,
      });

      if (res.success && res.questions.length > 0) {
        setQuestions(res.questions);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate interview questions.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Evaluate typed answer
  const handleEvaluateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || userAnswer.trim().length < 5) {
      setError('Please provide a substantive answer (at least 5 characters).');
      return;
    }

    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    setError(null);
    setEvaluating(true);

    try {
      const res = await api.evaluateInterview({
        question: currentQ.question,
        userAnswer,
        targetRole,
        interviewType,
        difficulty,
      });

      if (res.success) {
        setEvaluation(res.evaluation);
        setApiNotice(res.notice || null);
      }
    } catch (err: any) {
      setError(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setEvaluation(null);
    setUserAnswer('');
    setShowHints(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      alert('Congratulations! You have completed all questions in this interview drill.');
    }
  };

  const currentQ = questions[currentQuestionIndex];

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
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                  Module 5
                </span>
                <span className="text-xs text-slate-500">Fixed 100-Point Rubric Evaluation</span>
              </div>
              <h1 className="text-2xl font-bold text-navy-900 mt-1">AI Mock Interview Simulator</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate authentic technical & behavioral interview loops with structured rubric feedback.
              </p>
            </div>
          </div>

          {apiNotice && (
            <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs text-brand-800">
              <Sparkles className="h-4 w-4 text-brand-600 shrink-0" />
              <span>{apiNotice}</span>
            </div>
          )}

          {error && <ErrorState message={error} onRetry={() => setError(null)} />}

          {/* Session Setup Controls */}
          {questions.length === 0 && !loadingQuestions && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs max-w-2xl mx-auto">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">Configure Interview Session</h3>
                  <p className="text-xs text-slate-500">
                    Select your target role, interview format, and difficulty level.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Job Role</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                  >
                    <option value="Full-Stack Software Engineer">Full-Stack Software Engineer</option>
                    <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                    <option value="Cloud DevOps Engineer">Cloud DevOps Engineer</option>
                    <option value="Frontend Development Specialist">Frontend Development Specialist</option>
                    <option value="Backend / Systems Engineer">Backend / Systems Engineer</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Interview Type</label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                    >
                      <option value="technical">Technical & System Design</option>
                      <option value="hr">Behavioral & Cultural (HR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Difficulty Level</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-hidden"
                    >
                      <option value="beginner">Associate / Entry-Level</option>
                      <option value="intermediate">Mid-Level Engineer</option>
                      <option value="advanced">Senior / Tech Lead</option>
                    </select>
                  </div>
                </div>

                {/* 100-Point Rubric Explanation */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">
                    Standard 100-Point Rubric Dimensions:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                    <div>• Technical: <strong>30 pts</strong></div>
                    <div>• Problem-Solving: <strong>25 pts</strong></div>
                    <div>• Communication: <strong>20 pts</strong></div>
                    <div>• Practical Examples: <strong>15 pts</strong></div>
                    <div>• Structure: <strong>10 pts</strong></div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartInterview}
                  className="w-full mt-2 rounded-xl bg-brand-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Launch Interview Simulator</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {loadingQuestions && (
            <LoadingState
              message="Generating Realistic Interview Scenario..."
              subtext="Synthesizing challenging technical questions and architectural trade-offs."
            />
          )}

          {/* Active Question & Answer Session */}
          {questions.length > 0 && currentQ && (
            <div className="space-y-6">
              {/* Question Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 border border-brand-200">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="text-xs text-slate-500">• {currentQ.category}</span>
                  </div>

                  <span className="text-xs font-medium text-slate-400 capitalize">
                    {difficulty} Level
                  </span>
                </div>

                <h2 className="text-base md:text-lg font-bold text-navy-900 leading-snug">
                  {currentQ.question}
                </h2>

                {/* Hint Toggle */}
                {currentQ.hints.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      {showHints ? 'Hide Candidate Hints' : 'View Coaching Hints'}
                    </button>
                    {showHints && (
                      <div className="mt-2 rounded-xl bg-amber-50/60 p-3.5 border border-amber-200 text-xs text-amber-900 space-y-1">
                        <span className="font-bold">What interviewers want to hear:</span>
                        <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                          {currentQ.hints.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Typed Answer Form */}
              {!evaluation && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <form onSubmit={handleEvaluateAnswer} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Your Candidate Response (Typed)
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {userAnswer.split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                      <textarea
                        rows={7}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Structure your answer clearly. Walk through your technical reasoning, mention specific trade-offs, and reference real-world project experience where appropriate..."
                        className="w-full rounded-xl border border-slate-300 p-3.5 text-xs focus:border-brand-500 focus:outline-hidden font-sans leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">
                        Evaluated strictly across technical accuracy, problem-solving & communication.
                      </span>

                      <button
                        type="submit"
                        disabled={evaluating || userAnswer.trim().length < 5}
                        className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {evaluating ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Scoring with 100-Pt Rubric...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Submit for Evaluation</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Evaluation Results Component */}
              {evaluation && (
                <InterviewScore
                  evaluation={evaluation}
                  onRetake={() => setEvaluation(null)}
                  onNextQuestion={handleNextQuestion}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, ShieldCheck, Zap, Brain, 
  Map, FileText, HelpCircle, BarChart3, Users, CheckCircle2, Award 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = ({ onOpenJudgeDemo }) => {
  const { loginAsDemo, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = async (role = 'student') => {
    await loginAsDemo(role);
    if (role === 'student') navigate('/dashboard');
    else if (role === 'instructor') navigate('/instructor');
    else if (role === 'admin') navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 selection:bg-brand-500 selection:text-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 dark:border-slate-800">
        
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-500/20 via-indigo-500/15 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          {/* Government MoSPI Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="font-bold text-brand-700 dark:text-brand-400">MoSPI</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>SIH 2026 Problem ID: <strong>SIH26101</strong></span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500">Smart Education</span>
          </div>

          {/* Main Title & Tagline */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Turn Learning Gaps into{' '}
            <span className="bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
              Career Growth.
            </span>
          </h1>

          <p className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Know Your Gaps. Learn Smarter. Grow Faster.
          </p>

          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            AI-Powered Personalized Learning and Competency Intelligence Platform. Identify skill gaps, get adaptive learning paths, and track progress — built for government & enterprise capacity building.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => handleDemoClick('student')}
              className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>Start Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleDemoClick('student')}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-500" />
              <span>Explore Platform</span>
            </button>

            <button
              onClick={onOpenJudgeDemo}
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>1-Click Judge Demo</span>
            </button>
          </div>

          {/* Persona Switchers */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Or quick launch persona:</span>
            <button
              onClick={() => handleDemoClick('instructor')}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Instructor Portal (Dr. Sunita)
            </button>
            <span>•</span>
            <button
              onClick={() => handleDemoClick('admin')}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              MoSPI Administrator
            </button>
          </div>

        </div>
      </section>

      {/* Problem vs Solution Comparison */}
      <section className="py-16 bg-white dark:bg-navy-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Transforming EdTech Capacity Building
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Why Traditional Learning Platforms Fail
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Traditional Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center font-bold">
                ✕
              </div>
              <h4 className="text-lg font-bold text-rose-950 dark:text-rose-200">
                Traditional Learning Platforms
              </h4>
              <ul className="space-y-2.5 text-xs text-rose-800 dark:text-rose-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Provides identical, rigid syllabus to every student regardless of background.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Zero insight into specific conceptual gaps or weak topics until final exam failure.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Static question banks with repetitive, non-adaptive assessments.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Disconnected from national civil service & governmental competency frameworks.</span>
                </li>
              </ul>
            </div>

            {/* SkillSphere AI Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-4 shadow-lg shadow-emerald-500/5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center font-bold">
                ✓
              </div>
              <h4 className="text-lg font-bold text-emerald-950 dark:text-emerald-200">
                SkillSphere AI Solution
              </h4>
              <ul className="space-y-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Multi-source weighted competency engine (Quizzes, Courses, Assessments, Self-Rating).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Dynamic 30-Day Personalized Learning Roadmap updated in real-time as gaps close.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Generates adaptive MCQs & quizzes directly from uploaded lecture notes (PDF/Word).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Architected with an <strong>iGOT Karmayogi Integration Layer</strong> for national capacity building.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* How It Works (6-Step Cycle) */}
      <section className="py-16 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Continuous Optimization Cycle
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              How SkillSphere AI Closes Knowledge Gaps
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { num: '01', title: 'Assess', desc: 'Baseline diagnostic & self-rating calibration' },
              { num: '02', title: 'Detect', desc: 'AI identifies Critical & Developing skill gaps' },
              { num: '03', title: 'Personalize', desc: 'Generates customized 30-day sprint' },
              { num: '04', title: 'Learn', desc: 'Modular lessons & AI Mentor with citations' },
              { num: '05', title: 'Measure', desc: 'Adaptive AI assessments from uploaded notes' },
              { num: '06', title: 'Improve', desc: 'Real-time score recalculation & badges' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-center space-y-2 hover:border-brand-500 transition-colors shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-mono font-bold text-xs flex items-center justify-center mx-auto">
                  {step.num}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{step.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 bg-white dark:bg-navy-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              End-to-End Functionality
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Built for Enterprise & Government EdTech
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-900/60 text-brand-600 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                AI Competency Gap Engine
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Multi-source weighted mathematical model: 30% Quiz, 20% Assessment, 20% Course, 15% Self, 15% Activity. Classifies skills into Critical, Developing, Proficient, and Mastery.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 flex items-center justify-center">
                <Map className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Personalized 30-Day Path
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Dynamic roadmap generator structuring remediation for priority gaps first, followed by secondary reinforcement, capstone projects, and certification readiness.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                AI Document Quiz Generator
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Upload PDFs, DOCX, or TXT notes. The semantic chunker and AI engine instantly create adaptive MCQs, True/False, and diagnostic quizzes with pedagogical explanations.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                iGOT Karmayogi Layer
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Modular provider pattern with mock REST synchronization, MoSPI statistical competency frameworks, and national civil service learning record passes.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                SkillSphere AI Mentor
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Chatbot capable of explaining math, code, and theories with verified document citations, practice question generation, and 100% offline fallback resilience.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Instructor & Admin Portals
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Classroom competency heatmaps, at-risk learner identification, weak topic analytics, course authoring, audit logging, and downloadable CSV/PDF reports.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white text-center text-xs space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center text-slate-950 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-sm tracking-tight">SkillSphere AI</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">MoSPI SIH26101 Working Prototype</span>
        </div>
        <p className="text-slate-400 max-w-md mx-auto text-[11px]">
          Developed for Smart India Hackathon 2026. Aligned with National Education Policy (NEP 2020) & Mission Karmayogi capacity building standards.
        </p>
      </footer>

    </div>
  );
};

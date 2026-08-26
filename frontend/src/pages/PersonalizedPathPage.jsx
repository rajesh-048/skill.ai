import React, { useState, useEffect } from 'react';
import { 
  Map, CheckCircle2, Circle, Clock, Play, HelpCircle, 
  Award, Sparkles, RefreshCw, ArrowRight, Shield 
} from 'lucide-react';
import { getLearningPathApi, updateMilestoneApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PersonalizedPathPage = ({ onOpenQuiz }) => {
  const { showToast } = useAuth();
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchPath = async () => {
    try {
      const data = await getLearningPathApi();
      setPathData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPath();
  }, []);

  const handleToggleDay = async (dayNumber, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await updateMilestoneApi(dayNumber, nextStatus);
      setPathData((prev) => {
        if (!prev) return prev;
        const updated = prev.milestones.map((m) =>
          m.day === dayNumber ? { ...m, status: nextStatus } : m
        );
        const completedCount = updated.filter((m) => m.status === 'completed').length;
        return {
          ...prev,
          milestones: updated,
          completion_percentage: Math.round((completedCount / updated.length) * 100),
        };
      });
      showToast(`Day ${dayNumber} marked as ${nextStatus}!`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-xs text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
          <span>Generating Dynamic 30-Day Learning Path...</span>
        </div>
      </div>
    );
  }

  const milestones = pathData?.milestones || [];
  const completedDays = milestones.filter((m) => m.status === 'completed').length;
  const filteredMilestones =
    activeFilter === 'completed'
      ? milestones.filter((m) => m.status === 'completed')
      : activeFilter === 'pending'
      ? milestones.filter((m) => m.status !== 'completed')
      : milestones;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy-900 to-indigo-950 text-white shadow-xl border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI Generated 30-Day Sprint
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {pathData?.title || '30-Day Personalized Learning Roadmap'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {pathData?.description || 'Customized dynamically based on your competency gaps to accelerate career readiness.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="text-rose-400 font-bold">🔴 Priority 1: {pathData?.priority_1_skill}</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-bold">🟠 Priority 2: {pathData?.priority_2_skill}</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-bold">🟢 Synthesis: {pathData?.priority_3_skill}</span>
          </div>
        </div>

        {/* Progress Circular/Stats */}
        <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[140px] flex-shrink-0">
          <div className="text-3xl sm:text-4xl font-black text-white">
            {completedDays}/30
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-brand-300 mt-0.5">
            Days Completed ({pathData?.completion_percentage || 10}%)
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full"
              style={{ width: `${pathData?.completion_percentage || 10}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${activeFilter === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
          >
            All 30 Days
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${activeFilter === 'pending' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
          >
            In Progress & Pending ({30 - completedDays})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${activeFilter === 'completed' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
          >
            Completed ({completedDays})
          </button>
        </div>

        <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
          Commitment: ~60 mins/day
        </span>
      </div>

      {/* 30-Day Milestone Timeline */}
      <div className="space-y-4">
        {filteredMilestones.map((m) => {
          const isCompleted = m.status === 'completed';
          const isCurrent = m.day === (pathData?.current_day || 4);

          return (
            <div
              key={m.day}
              className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isCurrent
                  ? 'bg-brand-50/60 dark:bg-brand-950/40 border-brand-400 dark:border-brand-600 shadow-md ring-1 ring-brand-500'
                  : isCompleted
                  ? 'bg-white dark:bg-navy-900 border-emerald-200/80 dark:border-emerald-900/40'
                  : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-4">
                
                {/* Day Badge / Checkbox */}
                <button
                  onClick={() => handleToggleDay(m.day, m.status)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-transform active:scale-90 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-brand-500 text-white animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : `D${m.day}`}
                </button>

                {/* Topic Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {m.phase}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        ⚡ Today's Goal
                      </span>
                    )}
                  </div>

                  <h3 className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                    Day {m.day}: {m.topic}
                  </h3>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {m.estimated_minutes} mins
                    </span>
                    <span>•</span>
                    <span>Focus: <strong>{m.focus_skill}</strong></span>
                    <span>•</span>
                    <span>Type: {m.task_type}</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {m.task_type === 'Quiz' ? (
                  <button
                    onClick={() => onOpenQuiz && onOpenQuiz({ topic: m.topic })}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Launch Quiz</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleDay(m.day, m.status)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      isCompleted
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        : 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm'
                    }`}
                  >
                    <span>{isCompleted ? 'Mark Pending' : 'Mark Completed'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

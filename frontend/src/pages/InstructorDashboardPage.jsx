import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, Users, AlertTriangle, CheckCircle2, TrendingUp, 
  Download, Plus, Sparkles, BookOpen, Activity, RefreshCw 
} from 'lucide-react';
import { getInstructorDashboardApi, createCourseApi, getPerformanceReportApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const InstructorDashboardPage = () => {
  const { showToast } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    category: 'Machine Learning',
    level: 'Intermediate',
    duration_hours: 12.0,
    description: '',
  });

  const fetchData = async () => {
    try {
      const res = await getInstructorDashboardApi();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await createCourseApi(courseForm);
      showToast(`Course '${courseForm.title}' created and published successfully!`, 'success');
      setShowCreateModal(false);
      setCourseForm({ title: '', category: 'Machine Learning', level: 'Intermediate', duration_hours: 12.0, description: '' });
      await fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error creating course.', 'error');
    }
  };

  const handleDownloadReport = async () => {
    try {
      const report = await getPerformanceReportApi();
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SkillSphere_MoSPI_Class_Report_${Date.now()}.json`;
      a.click();
      showToast('Class Performance Report generated and downloaded!', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const skillAverages = data?.skill_averages || [];
  const weakTopics = data?.weak_topics || [];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy-900 to-indigo-950 text-white shadow-xl border border-indigo-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Faculty & Institution Portal • MoSPI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Instructor Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time classroom cohort analytics, weak topic diagnostics, and competency gap heatmaps across 120 enrolled learners.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Class Report</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Total Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {metrics.total_students || 120}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">Active CSE Cohort</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Avg Competency</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {metrics.average_competency || 74.2}%
          </div>
          <p className="text-[11px] text-slate-400">+4.2% from baseline</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Course Completion</span>
            <BookOpen className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {metrics.average_completion_rate || 68.4}%
          </div>
          <p className="text-[11px] text-slate-400">82 active modules</p>
        </div>

        <div className="p-5 rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-xs font-bold uppercase">At-Risk Learners</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-400">
            {metrics.at_risk_learners || 18}
          </div>
          <p className="text-[11px] text-rose-600 font-semibold">Critical gaps in ML & DSA</p>
        </div>
      </div>

      {/* Grid: Skill Gap Breakdown (6 cols) + Weak Topics Identified by AI (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Skill Averages */}
        <div className="lg:col-span-6 bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Class Skill Proficiency & Gap Distribution
              </h3>
            </div>
            <Link to="/instructor/heatmap" className="text-xs font-bold text-brand-600 hover:underline">
              View Heatmap →
            </Link>
          </div>

          <div className="space-y-3">
            {skillAverages.map((s, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{s.skill}</span>
                  <span
                    className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
                    style={{ color: s.color, backgroundColor: `${s.color}15`, border: `1px solid ${s.color}30` }}
                  >
                    {s.gap} Gap ({s.average}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${s.average}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Topics Identified by AI */}
        <div className="lg:col-span-6 bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI-Detected Weak Topics Requiring Remediation
            </h3>
          </div>

          <div className="space-y-3">
            {weakTopics.map((wt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{wt.topic}</span>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${wt.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {wt.priority} Priority
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Domain: {wt.domain} • Failure Rate: <strong>{wt.failure_rate}</strong> ({wt.affected_students} students affected)
                  </p>
                </div>

                <Link
                  to="/quizzes"
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-brand-600 hover:text-white text-[11px] font-bold text-slate-700 dark:text-slate-200 flex-shrink-0 transition-colors"
                >
                  Deploy Quiz
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Course Module</h3>
            
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. Advanced Graph Algorithms & Optimization"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Category</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  >
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Computer Science Core">Computer Science Core</option>
                    <option value="Data & Storage">Data & Storage</option>
                    <option value="MoSPI Analytics">MoSPI Analytics</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Level</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Course Overview</label>
                <textarea
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Comprehensive technical curriculum overview..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

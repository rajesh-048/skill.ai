import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Flame, Award, BookOpen, ArrowRight, Play, 
  HelpCircle, FileText, CheckCircle2, RefreshCw, AlertTriangle, 
  Zap, Calendar, Clock, BarChart2, ShieldCheck, ChevronRight, Brain 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { getStudentDashboardApi, recalculateCompetencyApi, getCoursesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CompetencyRadar } from '../components/CompetencyRadar';
import CompetencyInterviewModal from '../components/CompetencyInterviewModal';

export const StudentDashboardPage = ({ onOpenQuiz, onOpenUpload, onOpenDemoModal }) => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [showInterview, setShowInterview] = useState(false);

  const fetchDashboard = async () => {
    try {
      const data = await getStudentDashboardApi();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      showToast('Loaded offline cached learner dashboard.', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await recalculateCompetencyApi();
      await fetchDashboard();
      showToast('Competency gaps dynamically updated!', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-xs text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
          <span>Synthesizing Competency Radar & Dashboard...</span>
        </div>
      </div>
    );
  }

  const profile = dashboardData?.profile || user?.profile || {};
  const firstName = profile.full_name?.split(' ')[0] || 'Ravi';
  const overallScore = dashboardData?.overall_learning_score || 72.0;
  const streak = profile.streak_days || 7;
  const xp = profile.xp_points || 350;
  const skills = dashboardData?.skills || [];
  const criticalGaps = dashboardData?.critical_gaps || [];
  const topRec = dashboardData?.top_recommendation;
  const enrollments = dashboardData?.active_enrollments || [];
  const weeklyProgress = dashboardData?.weekly_progress || [];
  const quizChart = dashboardData?.quiz_chart_data || [];

  // Skill distribution for Pie Chart
  const skillDistData = skills.length > 0 ? [
    { name: 'Mastery (80-100%)', value: skills.filter(s => s.score >= 80).length, color: '#10b981' },
    { name: 'Proficient (60-79%)', value: skills.filter(s => s.score >= 60 && s.score < 80).length, color: '#3b82f6' },
    { name: 'Developing (40-59%)', value: skills.filter(s => s.score >= 40 && s.score < 60).length, color: '#f59e0b' },
    { name: 'Critical (<40%)', value: skills.filter(s => s.score < 40).length, color: '#ef4444' },
  ].filter(d => d.value > 0) : [
    { name: 'Mastery', value: 2, color: '#10b981' },
    { name: 'Proficient', value: 3, color: '#3b82f6' },
    { name: 'Developing', value: 4, color: '#f59e0b' },
    { name: 'Critical', value: 2, color: '#ef4444' },
  ];
  
  const LEARN_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Ambient glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-brand-500/10 blur-3xl rounded-full -z-0 pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
              MoSPI Competency Portal
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-300">CSE Semester {profile.semester || 4}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Good morning, {firstName} 👋
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Target Goal: <span className="text-white font-bold">{profile.career_goal || 'AI/ML Engineer'}</span>. AI identified <span className="text-rose-400 font-bold">{criticalGaps.length} Critical Skill Gap(s)</span> requiring remediation this week.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={onOpenDemoModal}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>SIH Judge Demo Walkthrough</span>
            </button>

            <Link
              to="/learning-path"
              className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
            >
              <span>Resume 30-Day Path (Day 4)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Highlight Score Badge */}
        <div className="flex items-center gap-4 z-10 flex-shrink-0">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[120px]">
            <div className="text-3xl sm:text-4xl font-black text-white">{overallScore}%</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-brand-300 mt-0.5">Overall Score</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{streak} Day Streak 🔥</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>{xp} XP Earned</span>
            </div>
          </div>
        </div>

      </div>

      {/* Critical Competency Gaps Alert Banner */}
      {criticalGaps.length > 0 && (
        <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200">
                  Priority Competency Gap Detected: {criticalGaps[0]?.skill_name} ({criticalGaps[0]?.score}%)
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 max-w-2xl">
                Your ML proficiency is 35%, which creates a gap for your target goal of '{profile.career_goal || 'AI/ML Engineer'}'. We recommend starting <strong>Machine Learning Fundamentals</strong> or uploading notes for a practice quiz.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onOpenQuiz && onOpenQuiz({ topic: criticalGaps[0]?.skill_name })}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Practice AI Quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Radar Chart + Today's Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Radar & Progress (8 cols) */}
        <div className="lg:col-span-8">
          <CompetencyRadar
            skills={skills}
            onRecalculate={handleRecalculate}
            isRecalculating={recalculating}
          />
        </div>

        {/* Today's Recommendation & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Top Recommendation Card */}
          {topRec && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl border border-indigo-700/40 relative overflow-hidden flex flex-col justify-between h-[320px]">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold border border-indigo-400/30">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  AI Recommended Priority 1
                </div>

                <h4 className="text-base font-extrabold text-white leading-tight">
                  {topRec.title}
                </h4>

                {/* "WHY" Explanation */}
                <div className="p-3 rounded-2xl bg-white/10 text-[11px] text-indigo-100 border border-white/10 leading-relaxed">
                  <span className="font-bold text-amber-300 block mb-0.5">Why recommended for you:</span>
                  {topRec.why_explanation}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-white/10">
                <span className="text-[11px] text-slate-300 font-semibold">{topRec.level} • {topRec.duration_hours}h</span>
                <Link
                  to={`/courses/${topRec.item_id || 'course_ml_101'}`}
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <span>Start Course</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Quick Hub Launchers */}
          <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quick Learning Tools
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenUpload && onOpenUpload()}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left border border-slate-200/80 dark:border-slate-700/60 transition-colors group"
              >
                <FileText className="w-4 h-4 text-indigo-600 mb-1" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600">
                  Upload Notes
                </div>
                <div className="text-[10px] text-slate-400">PDF, DOCX, TXT</div>
              </button>

              <button
                onClick={() => onOpenQuiz && onOpenQuiz({})}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left border border-slate-200/80 dark:border-slate-700/60 transition-colors group"
              >
                <HelpCircle className="w-4 h-4 text-brand-600 mb-1" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600">
                  Generate Quiz
                </div>
                <div className="text-[10px] text-slate-400">Adaptive AI MCQs</div>
              </button>

              <button
                onClick={() => setShowInterview(true)}
                className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-left border border-emerald-200/80 dark:border-emerald-700/60 transition-colors group"
              >
                <Brain className="w-4 h-4 text-emerald-600 mb-1" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600">
                  Competency Interview
                </div>
                <div className="text-[10px] text-slate-400">AI Adaptive Q&A</div>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Continue Learning Course Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Continue Learning
            </h3>
          </div>
          <Link to="/courses" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
            <span>Browse All Courses</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {enrollments.map((e) => (
            <div
              key={e.id}
              className="p-4 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <img
                    src={e.thumbnail_url || 'https://images.unsplash.com/photo-1516116211227-bbc155b9910d?w=600&auto=format&fit=crop&q=60'}
                    alt={e.course_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-sm">
                    {e.course_level}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600">
                    {e.course_title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{e.course_category}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                    <span>Progress</span>
                    <span>{e.progress_percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${e.progress_percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">{e.duration_hours} hrs total</span>
                <Link
                  to={`/courses/${e.course_id}`}
                  className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-xs font-bold hover:bg-brand-100 flex items-center gap-1"
                >
                  <span>Resume</span>
                  <Play className="w-3 h-3 fill-current" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Distribution Pie Chart + Competency Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Distribution Pie */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-rose-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Skill Distribution
            </h4>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={skillDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {skillDistData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '10px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Breakdown Cards */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-600" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Competency Breakdown
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {skillDistData.map((d, i) => (
              <div key={i} className="p-3 rounded-2xl text-center" style={{ backgroundColor: d.color + '15', border: `1px solid ${d.color}30` }}>
                <div className="text-2xl font-black" style={{ color: d.color }}>{d.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: d.color }}>{d.name.split(' ')[0]}</div>
              </div>
            ))}
          </div>

          {/* Skills list with scores */}
          <div className="space-y-2 pt-2">
            {skills.slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-32 text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                  {s.skill_name || s.name}
                </div>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${s.score}%`,
                      backgroundColor: s.score >= 80 ? '#10b981' : s.score >= 60 ? '#3b82f6' : s.score >= 40 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-500 w-8 text-right">{s.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid: Weekly Study Hours & Quiz Performance Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Hours Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Weekly Learning Activity (Hours)
              </h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Target: 1.0h / day</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="hours" name="Logged Hours" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quiz Performance Timeline */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Assessment Accuracy Progression (%)
              </h4>
            </div>
            <span className="text-[10px] font-bold text-emerald-600">Adaptive Trajectory</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quizChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Score %"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6366f1' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* AI Competency Interview Modal */}
      <CompetencyInterviewModal
        isOpen={showInterview}
        onClose={() => setShowInterview(false)}
      />

    </div>
  );
};

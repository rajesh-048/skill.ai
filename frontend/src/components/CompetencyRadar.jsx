import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { ShieldAlert, AlertTriangle, CheckCircle, Award, Info, RefreshCw } from 'lucide-react';

export const CompetencyRadar = ({ skills = [], onRecalculate, isRecalculating }) => {
  // Format data for radar chart
  const radarData = skills.slice(0, 6).map((s) => ({
    skill: s.skill_name.length > 14 ? s.skill_name.substring(0, 12) + '...' : s.skill_name,
    fullName: s.skill_name,
    score: s.score,
    target: 80,
  }));

  const getGapBadge = (gapLevel, score) => {
    switch (gapLevel) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            🔴 Critical Gap ({score}%)
          </span>
        );
      case 'developing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            🟠 Developing ({score}%)
          </span>
        );
      case 'proficient':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-yellow-50 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            🟡 Proficient ({score}%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            🟢 Advanced ({score}%)
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-colors">
      
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Competency Gap Radar
            </h3>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              Multi-Source Model
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time competency score computed from quizzes (30%), assessments (20%), courses (20%), self-rating (15%), & activity (15%).
          </p>
        </div>

        {onRecalculate && (
          <button
            onClick={onRecalculate}
            disabled={isRecalculating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>{isRecalculating ? 'Recalculating...' : 'Recalculate Gaps'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Radar Chart */}
        <div className="lg:col-span-6 h-64 sm:h-72 w-full flex items-center justify-center">
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#94a3b8" strokeDasharray="3 3" opacity={0.3} />
                <PolarAngleAxis 
                  dataKey="skill" 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <Radar
                  name="Target Benchmark"
                  dataKey="target"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.1}
                  strokeDasharray="4 4"
                />
                <Radar
                  name="Learner Competency"
                  dataKey="score"
                  stroke="#16a34a"
                  fill="#22c55e"
                  fillOpacity={0.4}
                />
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-xs text-slate-400">No skill competencies recorded yet.</div>
          )}
        </div>

        {/* Competency Skill Progress Breakdown */}
        <div className="lg:col-span-6 space-y-3.5">
          {skills.slice(0, 5).map((s) => (
            <div key={s.id || s.skill_id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">{s.skill_name}</span>
                {getGapBadge(s.gap_level, s.score)}
              </div>
              
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${s.score}%`,
                    backgroundColor: s.color || (s.score < 40 ? '#ef4444' : s.score < 60 ? '#f97316' : s.score < 80 ? '#eab308' : '#10b981')
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Quizzes: {s.quiz_score}% • Courses: {s.course_completion}%</span>
                <span className="italic">{s.action}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Classification Matrix Info Bar */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
        <div className="p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
          <span className="font-bold text-rose-700 dark:text-rose-400">0–39%: Critical Gap</span>
          <p className="text-[10px] text-slate-500">Immediate remediation</p>
        </div>
        <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
          <span className="font-bold text-amber-700 dark:text-amber-400">40–59%: Developing</span>
          <p className="text-[10px] text-slate-500">Structured exercises</p>
        </div>
        <div className="p-2 rounded-xl bg-yellow-50/60 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/40">
          <span className="font-bold text-yellow-700 dark:text-yellow-400">60–79%: Proficient</span>
          <p className="text-[10px] text-slate-500">Capstone projects</p>
        </div>
        <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
          <span className="font-bold text-emerald-700 dark:text-emerald-400">80–100%: Mastery</span>
          <p className="text-[10px] text-slate-500">Advanced certification</p>
        </div>
      </div>

    </div>
  );
};

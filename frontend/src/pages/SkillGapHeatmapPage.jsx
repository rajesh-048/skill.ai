import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Users, Search, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSkillHeatmapApi } from '../services/api';

export const SkillGapHeatmapPage = () => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyAtRisk, setOnlyAtRisk] = useState(false);

  const fetchHeatmap = async () => {
    try {
      const data = await getSkillHeatmapApi();
      setHeatmapData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    );
  }

  const skills = heatmapData?.skills || [];
  const matrix = heatmapData?.matrix || [];

  const filteredMatrix = matrix.filter((row) => {
    const matchesSearch = row.student_name.toLowerCase().includes(search.toLowerCase()) || row.branch.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = !onlyAtRisk || row.is_at_risk;
    return matchesSearch && matchesRisk;
  });

  const getCellColor = (score) => {
    if (score < 40) return 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-300 font-black';
    if (score < 60) return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-300 font-bold';
    if (score < 80) return 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-200 border-yellow-200 font-semibold';
    return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-300 font-bold';
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Back Button */}
      <Link
        to="/instructor"
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Instructor Overview</span>
      </Link>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Cohort Analytics Matrix
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Class Competency Gap Heatmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
            Visual matrix of individual student proficiencies across core curriculum subjects. Identify at-risk learners at a glance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyAtRisk(!onlyAtRisk)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              onlyAtRisk
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            {onlyAtRisk ? 'Showing At-Risk Only (🔴)' : 'Filter At-Risk Learners'}
          </button>
        </div>
      </div>

      {/* Heatmap Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by student name or branch..."
            className="w-full text-xs pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className="px-2 py-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-700">🔴 &lt;40% Critical</span>
          <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700">🟠 40-59% Developing</span>
          <span className="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-950 text-yellow-700">🟡 60-79% Proficient</span>
          <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700">🟢 80-100% Mastery</span>
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4">Learner Name</th>
                <th className="py-3.5 px-4">Branch / Semester</th>
                {skills.map((s, idx) => (
                  <th key={idx} className="py-3.5 px-4 text-center">
                    {s.length > 16 ? s.substring(0, 14) + '...' : s}
                  </th>
                ))}
                <th className="py-3.5 px-4 text-center">Overall Average</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMatrix.map((row) => (
                <tr key={row.student_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {row.student_name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {row.branch} (Sem {row.semester})
                  </td>

                  {skills.map((sName, sIdx) => {
                    const sk = row.skills[sName] || { score: 50 };
                    return (
                      <td key={sIdx} className="py-2.5 px-3 text-center">
                        <div className={`py-1.5 px-2 rounded-xl text-[11px] border inline-block min-w-[54px] ${getCellColor(sk.score)}`}>
                          {sk.score}%
                        </div>
                      </td>
                    );
                  })}

                  <td className="py-3.5 px-4 text-center font-black text-slate-800 dark:text-slate-200">
                    {row.average_score}%
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {row.is_at_risk ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                        At-Risk
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                        On Track
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

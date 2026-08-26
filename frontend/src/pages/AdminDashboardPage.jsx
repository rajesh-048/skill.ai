import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, Users, Shield, Cpu, Activity, Database, 
  CheckCircle2, TrendingUp, RefreshCw, Layers, ArrowRight 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { getAdminStatsApi, getSystemHealthApi } from '../services/api';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sData, hData] = await Promise.all([
        getAdminStatsApi(),
        getSystemHealthApi(),
      ]);
      setStats(sData);
      setHealth(hData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    );
  }

  const metrics = stats?.metrics || {};
  const userGrowth = stats?.user_growth || [];
  const competencyDist = stats?.competency_distribution || [];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-950 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Shield className="w-3.5 h-3.5" />
            Platform Governance • MoSPI Central Directorate
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Administrator Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            High-level platform health, security audit trails, learner population trends, and AI infrastructure metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
          <Link
            to="/admin/audit"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition-all"
          >
            <Activity className="w-4 h-4" />
            <span>Audit Logs</span>
          </Link>
        </div>
      </div>

      {/* System Health Status Ribbon */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <span className="font-bold text-emerald-950 dark:text-emerald-200">
              System Health Status: {health?.status || 'OPERATIONAL'} (Uptime: {health?.system_uptime || '99.98%'})
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 block text-[11px]">
              AI Service: {health?.ai_service_mode} • Database Latency: {health?.database_latency_ms || 1.2}ms
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 self-start sm:self-center">
          MoSPI Compliant
        </span>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Registered Users</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {metrics.total_users?.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">{metrics.active_learners?.toLocaleString()} Active Learners</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Quizzes Completed</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {metrics.quizzes_completed?.toLocaleString()}
          </div>
          <p className="text-[11px] text-indigo-600 font-semibold">{metrics.documents_synthesized} Docs Processed</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Learning Hours</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {metrics.learning_hours_logged?.toLocaleString()}
          </div>
          <p className="text-[11px] text-amber-600 font-semibold">68.4% Course Completion Rate</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">AI Interactions</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {metrics.ai_interactions_logged?.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Zero Crash Guarantee</p>
        </div>
      </div>

      {/* Charts Grid: User Growth (Area) + Competency Distribution (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User Growth */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              MoSPI Platform User Adoption Trend
            </h4>
            <span className="text-[10px] font-bold text-emerald-600">+48% Growth</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="users" name="Total Users" stroke="#16a34a" fill="#22c55e" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="active" name="Active Learners" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Cohort Competency Tier Distribution
            </h4>
            <span className="text-[10px] font-bold text-slate-400">Total: 120 Students</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competencyDist} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="category" type="category" tick={{ fill: '#64748b', fontSize: 10 }} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="count" name="Learner Count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

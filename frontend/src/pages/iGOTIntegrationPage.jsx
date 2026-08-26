import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, RefreshCw, Layers, CheckCircle2, ArrowRight, 
  ExternalLink, Database, Server, Clock, AlertCircle, Sparkles, Send 
} from 'lucide-react';
import { getIGOTStatusApi, getIGOTCompetenciesApi, getIGOTCoursesApi, triggerIGOTSyncApi, getIGOTHistoryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const iGOTIntegrationPage = () => {
  const { showToast } = useAuth();
  const [status, setStatus] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [externalCourses, setExternalCourses] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchIGOTData = async () => {
    try {
      const [sData, cData, crData, hData] = await Promise.all([
        getIGOTStatusApi(),
        getIGOTCompetenciesApi(),
        getIGOTCoursesApi(),
        getIGOTHistoryApi()
      ]);
      setStatus(sData);
      setCompetencies(cData || []);
      setExternalCourses(crData || []);
      setHistory(hData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIGOTData();
  }, []);

  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      const res = await triggerIGOTSyncApi({ sync_direction: 'bidirectional' });
      showToast('iGOT Karmayogi mock synchronization completed successfully!', 'success');
      await fetchIGOTData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Sync error.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy-900 to-emerald-950 text-white shadow-xl border border-emerald-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              National Capacity Building Framework
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Prototype / Mock Integration Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            iGOT Karmayogi Integration Layer
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Pluggable architecture connecting SkillSphere AI competency models with the <strong>iGOT Karmayogi Bharat</strong> government capacity building ecosystem.
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={syncing}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 flex-shrink-0 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Synchronizing Records...' : 'Trigger Bidirectional Sync'}</span>
        </button>
      </div>

      {/* Provider Architecture Diagram Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Integration Provider Interface Architecture
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
            Active Provider: {status?.active_provider || 'DemoProvider'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <div className="font-bold text-brand-600 dark:text-brand-400">LearningProvider (Abstract Base Class)</div>
          <div className="pl-4">├── <strong>DemoProvider</strong> (Built-in MoSPI & Civil Services mock repository) [ACTIVE]</div>
          <div className="pl-4">└── <strong>iGOTProvider</strong> (Ready for REST/GraphQL production endpoints via Karmayogi Bharat Sandbox)</div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {status?.compliance || 'MoSPI Capacity Building & National Competency Framework v2.0 compliant.'}
        </p>
      </div>

      {/* Grid: Mapped Competencies (6 cols) + Synchronized Courses (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* National Competencies Framework Mapping */}
        <div className="lg:col-span-6 bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              MoSPI / Civil Services Competency Taxonomy
            </h3>
          </div>

          <div className="space-y-3">
            {competencies.map((c, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    {c.code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{c.domain}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {c.name}
                </h4>

                <div className="flex flex-wrap gap-1 pt-1">
                  {(c.mapped_skills || []).map((sk, sIdx) => (
                    <span key={sIdx} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200">
                      {sk}
                    </span>
                  ))}
                </div>

                <div className="text-[10px] text-emerald-600 font-semibold pt-1">
                  Target Proficiency: {c.target_proficiency}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* External Synchronized Courses */}
        <div className="lg:col-span-6 bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Synchronized iGOT Registry Modules
            </h3>
          </div>

          <div className="space-y-3">
            {externalCourses.map((ec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {ec.igot_course_id}
                  </span>
                  <span className="text-[10px] text-slate-400">{ec.department}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {ec.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Level: {ec.level}</span>
                  <span className="font-bold text-amber-500">Credits: {ec.credits}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sync Log Feed */}
      {history.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              iGOT Synchronization Audit History
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {history.map((h) => (
              <div key={h.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Sync Batch ({h.sync_type}) • {h.records_synced} Records Mapped
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(h.synced_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

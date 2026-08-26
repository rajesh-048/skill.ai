import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, ArrowLeft, RefreshCw, Key, LogIn, FileText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAuditLogsApi } from '../services/api';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const data = await getAuditLogsApi();
      setLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      <Link
        to="/admin"
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Control Center</span>
      </Link>

      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Security & Compliance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            System & Security Audit Trails
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
            Immutable log of authentications, competency evaluations, document processing events, and iGOT synchronization calls.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-colors self-start sm:self-center"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">User / Actor</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 font-mono text-[11px]">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900 dark:text-white">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-600 dark:text-slate-300">
                    {l.user_email || l.user_id || 'System Worker'}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-500">
                    {l.entity_type} ({l.entity_id || 'Global'})
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{l.ip_address || '127.0.0.1'}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-sans">
                    {new Date(l.created_at).toLocaleString()}
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

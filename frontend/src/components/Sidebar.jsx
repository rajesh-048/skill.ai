import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Map, HelpCircle, FileText, BookOpen, 
  ShieldCheck, Trophy, BarChart3, Users, Activity, Sparkles, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ onOpenJudgeDemo }) => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/learning-path', label: '30-Day Learning Path', icon: Map, badge: 'AI Gen' },
    { to: '/quizzes', label: 'AI Quiz Center', icon: HelpCircle },
    { to: '/documents', label: 'Knowledge Docs', icon: FileText },
    { to: '/courses', label: 'Course Catalog', icon: BookOpen },
    { to: '/achievements', label: 'Achievements & XP', icon: Trophy },
    { to: '/igot', label: 'iGOT Karmayogi Hub', icon: ShieldCheck, badge: 'Gov' },
  ];

  const instructorLinks = [
    { to: '/instructor', label: 'Class Overview', icon: BarChart3 },
    { to: '/instructor/heatmap', label: 'Skill Gap Heatmap', icon: Activity, badge: 'Live' },
    { to: '/courses', label: 'Course Management', icon: BookOpen },
    { to: '/quizzes', label: 'Assessments', icon: HelpCircle },
    { to: '/documents', label: 'Shared Materials', icon: FileText },
    { to: '/igot', label: 'iGOT Integration', icon: ShieldCheck },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Platform Stats', icon: BarChart3 },
    { to: '/admin/users', label: 'User Governance', icon: Users },
    { to: '/admin/audit', label: 'Audit & Security', icon: Activity },
    { to: '/courses', label: 'Course Catalog', icon: BookOpen },
    { to: '/igot', label: 'iGOT Bridge', icon: ShieldCheck },
  ];

  const links = role === 'admin' ? adminLinks : role === 'instructor' ? instructorLinks : studentLinks;

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-slate-800 p-4 transition-colors">
      
      {/* Role Tag */}
      <div className="mb-4 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Portal</span>
        <span className="text-xs font-bold capitalize px-2 py-0.5 rounded-md bg-brand-600 text-white shadow-sm">
          {role}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 shadow-sm border border-brand-200/60 dark:border-brand-800/60 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-200">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Judge Demo Launcher Card */}
      <div className="mt-8 p-3.5 rounded-2xl bg-gradient-to-br from-brand-900 to-slate-900 text-white shadow-lg border border-brand-700/40">
        <div className="flex items-center gap-2 mb-1.5">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">SIH 2026 Demo</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-snug mb-3">
          1-Click end-to-end journey: Gap Detection → Doc Upload → AI Quiz → Live Recalculation.
        </p>
        <button
          onClick={onOpenJudgeDemo}
          className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Launch Test Drive
        </button>
      </div>

      {/* MoSPI Compliance Footer */}
      <div className="mt-6 px-2 text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
        MoSPI SIH26101 • Smart Education
        <br />
        iGOT Karmayogi v2.0 Sandbox
      </div>
    </aside>
  );
};

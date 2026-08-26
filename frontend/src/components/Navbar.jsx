import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Search, Bell, Flame, Award, Shield, User, 
  LogOut, Compass, BookOpen, Layers, CheckCircle2, ChevronDown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenSearch, onOpenNotifications, onOpenDemoModal }) => {
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);

  const currentRole = user?.role || 'student';
  const streak = user?.profile?.streak_days || 7;
  const xp = user?.profile?.xp_points || 350;
  const fullName = user?.profile?.full_name || 'Ravi Kumar';

  const handlePersonaSwitch = async (role) => {
    setPersonaOpen(false);
    await loginAsDemo(role);
    if (role === 'student') navigate('/dashboard');
    else if (role === 'instructor') navigate('/instructor');
    else if (role === 'admin') navigate('/admin');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-navy-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & MoSPI Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">SkillSphere</span>
                  <span className="text-xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">AI</span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">MoSPI • SIH26101</span>
              </div>
            </Link>

            {/* SIH Hackathon Demo Button */}
            <button
              onClick={onOpenDemoModal}
              className="ml-3 hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-700 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              ⚡ SIH Judge Test Drive
            </button>
          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-400 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 hover:border-brand-500 transition-colors shadow-inner"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search courses, documents, quizzes...</span>
              </span>
              <kbd className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">⌘K</kbd>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Gamification Counters for Student */}
                {currentRole === 'student' && (
                  <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{streak}d streak</span>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      <Award className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{xp} XP</span>
                    </div>
                  </div>
                )}

                {/* 1-Click Demo Persona Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setPersonaOpen(!personaOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors"
                  >
                    <span className="font-semibold capitalize">Persona: {currentRole}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </button>

                  {personaOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Switch Demo Role</div>
                      <button
                        onClick={() => handlePersonaSwitch('student')}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${currentRole === 'student' ? 'text-brand-600 font-bold bg-brand-50/50' : 'text-slate-700 dark:text-slate-200'}`}
                      >
                        <div>
                          <div className="font-semibold">Learner (Ravi Kumar)</div>
                          <div className="text-[10px] text-slate-400">CSE Sem 4 • ML Gap Focus</div>
                        </div>
                        {currentRole === 'student' && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </button>

                      <button
                        onClick={() => handlePersonaSwitch('instructor')}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${currentRole === 'instructor' ? 'text-brand-600 font-bold bg-brand-50/50' : 'text-slate-700 dark:text-slate-200'}`}
                      >
                        <div>
                          <div className="font-semibold">Instructor (Dr. Sunita)</div>
                          <div className="text-[10px] text-slate-400">Heatmaps & Class Analytics</div>
                        </div>
                        {currentRole === 'instructor' && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </button>

                      <button
                        onClick={() => handlePersonaSwitch('admin')}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${currentRole === 'admin' ? 'text-brand-600 font-bold bg-brand-50/50' : 'text-slate-700 dark:text-slate-200'}`}
                      >
                        <div>
                          <div className="font-semibold">MoSPI Administrator</div>
                          <div className="text-[10px] text-slate-400">Governance & System Health</div>
                        </div>
                        {currentRole === 'admin' && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Notifications Bell */}
                <button
                  onClick={onOpenNotifications}
                  className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {fullName[0]}
                    </div>
                    <div className="hidden md:block text-left text-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{fullName}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{currentRole}</div>
                    </div>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-navy-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50">
                      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                        <p className="font-semibold text-slate-900 dark:text-white">{fullName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      </div>
                      
                      <Link
                        to={currentRole === 'admin' ? '/admin' : currentRole === 'instructor' ? '/instructor' : '/dashboard'}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span>My Dashboard</span>
                      </Link>

                      <Link
                        to="/igot"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span>iGOT Karmayogi Portal</span>
                      </Link>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left border-t border-slate-100 dark:border-slate-800"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePersonaSwitch('student')}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors"
                >
                  ⚡ Try Demo
                </button>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

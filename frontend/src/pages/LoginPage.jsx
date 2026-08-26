import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, UserCheck, ShieldCheck, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'instructor') navigate('/instructor');
      else navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    try {
      const user = await loginAsDemo(role);
      if (role === 'admin') navigate('/admin');
      else if (role === 'instructor') navigate('/instructor');
      else navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign In to SkillSphere AI
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            MoSPI Problem ID: SIH26101 • Smart Education Platform
          </p>
        </div>

        {/* 1-Click Demo Persona Access Box */}
        <div className="p-4 rounded-3xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-brand-800 dark:text-brand-300 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1-Click Demo Personas (SIH Hackathon)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('student')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-brand-300 dark:border-brand-800 hover:border-brand-500 text-slate-800 dark:text-slate-200 text-xs font-bold text-center transition-all hover:scale-[1.02] shadow-sm flex flex-col items-center justify-center gap-1"
            >
              <UserCheck className="w-4 h-4 text-brand-600" />
              <span>Student</span>
              <span className="text-[9px] font-normal text-slate-400">Ravi Kumar</span>
            </button>

            <button
              onClick={() => handleDemoLogin('instructor')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-brand-300 dark:border-brand-800 hover:border-brand-500 text-slate-800 dark:text-slate-200 text-xs font-bold text-center transition-all hover:scale-[1.02] shadow-sm flex flex-col items-center justify-center gap-1"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Instructor</span>
              <span className="text-[9px] font-normal text-slate-400">Dr. Sunita</span>
            </button>

            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-brand-300 dark:border-brand-800 hover:border-brand-500 text-slate-800 dark:text-slate-200 text-xs font-bold text-center transition-all hover:scale-[1.02] shadow-sm flex flex-col items-center justify-center gap-1"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin</span>
              <span className="text-[9px] font-normal text-slate-400">MoSPI Officer</span>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <div className="bg-white dark:bg-navy-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
          <form onSubmit={handleStandardLogin} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo.student@skillsphere.ai"
                  required
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-brand-600 font-medium cursor-pointer hover:underline" onClick={() => alert('Demo accounts password is: Demo@123')}>
                  Demo: Demo@123
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Create Learner Profile
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

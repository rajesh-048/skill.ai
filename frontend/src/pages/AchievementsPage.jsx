import React, { useState, useEffect } from 'react';
import { Trophy, Award, Flame, Star, CheckCircle2, Lock, Sparkles, RefreshCw, Users } from 'lucide-react';
import { getAchievementsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AchievementsPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    try {
      const res = await getAchievementsApi();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    );
  }

  const badges = data?.badges || [];
  const xp = user?.profile?.xp_points || 350;
  const streak = user?.profile?.streak_days || 7;
  const level = Math.floor(xp / 100) + 1;
  const nextLevelXP = level * 100;
  const currentLevelProgress = xp % 100;

  // Mock Leaderboard
  const leaderboard = [
    { rank: 1, name: 'Divya Sen', branch: 'CSE Sem 8', xp: 890, badge: '🧠 AI Master', streak: 20 },
    { rank: 2, name: 'Rahul Nair', branch: 'MoSPI Trainee', xp: 680, badge: '📊 Stats Lead', streak: 15 },
    { rank: 3, name: 'Pooja Rao', branch: 'CSE Sem 6', xp: 560, badge: '🛡️ Cyber Guard', streak: 11 },
    { rank: 4, name: 'Priya Sharma', branch: 'Data Science', xp: 520, badge: '🎯 Gap Closer', streak: 12 },
    { rank: 5, name: 'Sneha Patel', branch: 'IT Sem 4', xp: 440, badge: '🔥 Streak Champ', streak: 9 },
    { rank: 6, name: 'Ravi Kumar (You)', branch: 'CSE Sem 4', xp: xp, badge: '🏆 First Quiz', streak: streak, isYou: true },
    { rank: 7, name: 'Anita Desai', branch: 'CSE Sem 6', xp: 410, badge: '📚 Note Scholar', streak: 8 },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy-900 to-indigo-950 text-white shadow-xl border border-indigo-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Gamified Learning & Capacity Milestones
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Achievements & Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Earn experience points (XP), maintain daily learning streaks, and unlock accredited competency badges aligned with MoSPI standards.
          </p>
        </div>

        {/* Level & XP Card */}
        <div className="p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center min-w-[160px] flex-shrink-0 space-y-2">
          <div className="text-3xl font-black text-amber-400">Level {level}</div>
          <div className="text-[10px] font-bold uppercase text-brand-300">Emerging Specialist</div>
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${currentLevelProgress}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">{xp} / {nextLevelXP} XP</span>
          </div>
        </div>
      </div>

      {/* Grid: Badges (7 cols) + Leaderboard (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Badges Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Competency Badges ({data?.unlocked_count || 0} / {badges.length} Unlocked)
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges.map((b) => (
              <div
                key={b.code}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                  b.unlocked
                    ? 'bg-white dark:bg-navy-900 border-amber-300/80 dark:border-amber-900/60 shadow-sm'
                    : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${
                  b.unlocked ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200' : 'bg-slate-200 dark:bg-slate-800'
                }`}>
                  {b.unlocked ? b.icon : <Lock className="w-4 h-4 text-slate-400" />}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{b.name}</h4>
                    {b.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{b.desc}</p>
                  <span className="inline-block text-[10px] font-bold text-amber-600 mt-1">+{b.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MoSPI Cohort Leaderboard */}
        <div className="lg:col-span-5 bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              MoSPI Cohort Leaderboard
            </h3>
          </div>

          <div className="space-y-2">
            {leaderboard.map((u) => (
              <div
                key={u.rank}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  u.isYou
                    ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 shadow-sm ring-1 ring-brand-500'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    u.rank === 1 ? 'bg-amber-400 text-slate-950' : u.rank === 2 ? 'bg-slate-300 text-slate-900' : u.rank === 3 ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {u.rank}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                      <span>{u.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{u.branch}</div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{u.xp} XP</div>
                  <div className="text-[10px] text-amber-500 font-semibold">🔥 {u.streak}d</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

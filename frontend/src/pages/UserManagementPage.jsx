import React, { useState, useEffect } from 'react';
import { Users, Shield, Search, ArrowLeft, RefreshCw, CheckCircle2, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllUsersApi, updateUserRoleApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const UserManagementPage = () => {
  const { showToast } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchUsers = async () => {
    try {
      const data = await getAllUsersApi();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRoleApi(userId, newRole);
      showToast(`User role updated to ${newRole}.`, 'success');
      await fetchUsers();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to update role.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.career_goal || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            User Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Platform Users & Role Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
            Manage student, instructor, and administrative credentials across the MoSPI SkillSphere AI directory.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-white">{users.length}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">Total Accounts</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or goal..."
            className="w-full text-xs pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {['All', 'student', 'instructor', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                roleFilter === r
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Branch & Semester</th>
                <th className="py-3.5 px-4">Career Goal</th>
                <th className="py-3.5 px-4">Gamification</th>
                <th className="py-3.5 px-4">Role Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{u.full_name || 'Anonymous User'}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {u.branch ? `${u.branch} (Sem ${u.semester || 1})` : 'Faculty / Administrator'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {u.career_goal || 'Institutional Governance'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-[11px] font-semibold text-slate-500">
                      🔥 {u.streak_days || 0}d • ⭐ {u.xp_points || 0} XP
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 capitalize"
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Administrator</option>
                    </select>
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

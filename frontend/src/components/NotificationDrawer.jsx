import React from 'react';
import { X, Bell, BookOpen, Flame, HelpCircle, CheckCircle2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { markNotificationReadApi } from '../services/api';

export const NotificationDrawer = ({ isOpen, onClose, notifications = [], onNotificationUpdated }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await markNotificationReadApi(notif.id);
        if (onNotificationUpdated) onNotificationUpdated();
      } catch (err) {
        console.error(err);
      }
    }
    if (notif.link_url) {
      onClose();
      navigate(notif.link_url);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'course': return <BookOpen className="w-4 h-4 text-brand-600" />;
      case 'streak': return <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'quiz': return <HelpCircle className="w-4 h-4 text-indigo-600" />;
      case 'announcement': return <Shield className="w-4 h-4 text-emerald-600" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white dark:bg-navy-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Notification Center</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                All caught up! No unread notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    n.is_read
                      ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/60 opacity-80'
                      : 'bg-white dark:bg-slate-800 border-brand-200 dark:border-brand-900/60 shadow-sm hover:border-brand-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex-shrink-0">
                      {getIcon(n.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className={`text-xs font-bold truncate ${n.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                          {n.title}
                        </h4>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="mt-2 text-[10px] text-slate-400">
                        {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400">
            Powered by SkillSphere Dynamic Alert Engine
          </div>

        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, FileText, HelpCircle, Layers, X, ArrowRight, Loader2 } from 'lucide-react';
import { globalSearchApi } from '../services/api';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ courses: [], documents: [], skills: [], quizzes: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ courses: [], documents: [], skills: [], quizzes: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await globalSearchApi(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalHits = results.courses.length + results.documents.length + results.skills.length + results.quizzes.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a skill, topic, course title, or document name..."
            autoFocus
            className="flex-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
          {loading && <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() && (
            <div className="text-center py-8 text-xs text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              Search across the entire MoSPI SkillSphere repository: courses, quizzes, documents, and skills.
            </div>
          )}

          {query.trim() && totalHits === 0 && !loading && (
            <div className="text-center py-8 text-xs text-slate-400">
              No direct matches found for "<span className="font-semibold text-slate-600 dark:text-slate-300">{query}</span>".
            </div>
          )}

          {/* Courses */}
          {results.courses.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                Courses ({results.courses.length})
              </div>
              <div className="space-y-1.5">
                {results.courses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onClose();
                      navigate(`/courses/${c.id}`);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600">
                        {c.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.category} • {c.level}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {results.documents.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Documents & Notes ({results.documents.length})
              </div>
              <div className="space-y-1.5">
                {results.documents.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onClose();
                      navigate('/documents');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600">
                        {d.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {d.file_type} • {d.page_count} pages
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quizzes */}
          {results.quizzes.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                Quizzes & Assessments ({results.quizzes.length})
              </div>
              <div className="space-y-1.5">
                {results.quizzes.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      onClose();
                      navigate('/quizzes');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600">
                        {q.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {q.difficulty} • {q.total_questions} Questions
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {results.skills.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                Competency Domains ({results.skills.length})
              </div>
              <div className="grid grid-cols-2 gap-2">
                {results.skills.map((s) => (
                  <div key={s.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.name}</div>
                    <div className="text-[10px] text-slate-400">{s.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">ESC</kbd> to close</span>
          <span>MoSPI SkillSphere Global Index</span>
        </div>

      </div>
    </div>
  );
};

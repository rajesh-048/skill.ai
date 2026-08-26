import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Sparkles, Clock, Award, Play, History, 
  CheckCircle2, XCircle, RefreshCw, FileText, ArrowRight, Loader2 
} from 'lucide-react';
import { getQuizzesApi, getQuizHistoryApi, generateQuizApi, getDocumentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const QuizCenterPage = ({ onStartQuiz }) => {
  const { showToast } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [history, setHistory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form State
  const [topic, setTopic] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [questionType, setQuestionType] = useState('mcq');

  const fetchData = async () => {
    try {
      const [qData, hData, dData] = await Promise.all([
        getQuizzesApi(),
        getQuizHistoryApi(),
        getDocumentsApi()
      ]);
      setQuizzes(qData || []);
      setHistory(hData || []);
      setDocuments(dData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic && !documentId) {
      alert('Please enter a topic or select an uploaded document.');
      return;
    }

    setGenerating(true);
    try {
      const res = await generateQuizApi({
        topic: topic || undefined,
        document_id: documentId || undefined,
        difficulty,
        question_count: questionCount,
        question_type: questionType,
      });

      showToast(`AI generated ${res.quiz.total_questions} questions successfully!`, 'success');
      await fetchData();
      if (onStartQuiz) onStartQuiz(res.quiz);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Quiz generation failed.', 'error');
    } finally {
      setGenerating(false);
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
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy-900 to-amber-950 text-white shadow-xl border border-amber-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI Diagnostic & Adaptive Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AI Assessment Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Generate custom quizzes from uploaded notes or curriculum topics. Performance dynamically recalibrates your competency scores.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center min-w-[120px]">
            <div className="text-2xl font-black text-white">{history.length}</div>
            <div className="text-[10px] font-bold text-amber-300 uppercase">Quizzes Completed</div>
          </div>
        </div>
      </div>

      {/* Grid: Generator Form (5 cols) + Active Assessments (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Generator Form */}
        <div className="lg:col-span-5 bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Instant AI Quiz Generator
            </h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject Topic or Skill
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Machine Learning Optimization, Binary Search Trees"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* Document Context Selector */}
            {documents.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Or Generate Directly from Uploaded Document
                </label>
                <select
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">-- Optional: Select Document --</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>{d.title} ({d.file_type})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Easy">Easy (Foundations)</option>
                  <option value="Medium">Medium (Standard)</option>
                  <option value="Hard">Hard (Advanced)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Count
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value={3}>3 Questions (Quick Check)</option>
                  <option value={5}>5 Questions (Standard)</option>
                  <option value={8}>8 Questions (Sprint)</option>
                  <option value={10}>10 Questions (Comprehensive)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="mcq">Multiple Choice Questions (MCQ)</option>
                <option value="true_false">True / False Diagnostics</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Synthesizing Assessment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Assessment</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Ready-to-take Quizzes */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Available & Recommended Assessments
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{quizzes.length} Quizzes</span>
          </div>

          <div className="space-y-3">
            {quizzes.slice(0, 6).map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 hover:border-brand-500 transition-colors shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                      {q.difficulty}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">{q.skill_name || 'Technical Competency'}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {q.title}
                  </h4>
                  <div className="text-[10px] text-slate-400">
                    {q.total_questions} Questions • ~{q.time_limit_minutes} Mins
                  </div>
                </div>

                <button
                  onClick={() => onStartQuiz && onStartQuiz(q)}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 flex-shrink-0 transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Quiz</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Past Assessment Attempts History Table */}
      {history.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Assessment Attempt History
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Assessment Title</th>
                  <th className="py-2.5 px-3">Difficulty</th>
                  <th className="py-2.5 px-3">Score / Accuracy</th>
                  <th className="py-2.5 px-3">AI Adaptive Feedback</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {h.quiz_title}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {h.quiz_difficulty || 'Adaptive'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-bold ${h.percentage >= 70 ? 'text-emerald-600' : h.percentage >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {h.percentage}% ({h.score}/{h.total_questions})
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-500 max-w-xs truncate">
                      {h.adaptive_level}: Next quiz difficulty tuned.
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(h.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

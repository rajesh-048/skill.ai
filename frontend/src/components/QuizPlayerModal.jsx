import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, 
  ArrowLeft, Send, Award, Flame, RefreshCw, X, Sparkles, BookOpen 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitQuizApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const QuizPlayerModal = ({ quiz, isOpen, onClose, onQuizCompleted }) => {
  const { refreshUser } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState((quiz?.time_limit_minutes || 10) * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const questions = quiz?.questions || [];
  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (!isOpen || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, result]);

  if (!isOpen || !quiz) return null;

  const handleSelectOption = (qId, optionText) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionText,
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const submissionPayload = {
        answers: questions.map((q) => ({
          question_id: q.id,
          user_answer: answers[q.id] || '',
        })),
        time_spent_seconds: (quiz.time_limit_minutes * 60) - timeLeft,
      };

      const res = await submitQuizApi(quiz.id, submissionPayload);
      setResult(res.result);
      if (res.result.percentage >= 60) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      await refreshUser();
      if (onQuizCompleted) onQuizCompleted(res.result);
    } catch (err) {
      console.error(err);
      alert('Error submitting quiz: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-navy-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                {quiz.difficulty || 'Adaptive'} Assessment
              </span>
              <span className="text-xs font-bold text-slate-500">• {quiz.topic || 'General'}</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate max-w-md mt-0.5">
              {quiz.title}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {!result && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!result ? (
            /* Active Quiz View */
            <div className="space-y-6">
              
              {/* Progress & Palette */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Question {currentIndex + 1} of {questions.length}</span>
                  <span>{answeredCount} of {questions.length} answered</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              {currentQ ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                      {currentQ.question_text}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {(currentQ.options || []).map((opt, idx) => {
                      const isSelected = answers[currentQ.id] === opt;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(currentQ.id, opt)}
                          className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm font-medium border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 dark:border-brand-500 text-brand-900 dark:text-brand-200 shadow-sm font-semibold'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600'
                          }`}
                        >
                          <span>{opt}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-brand-600 bg-brand-600'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Question Navigation Palette */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                {questions.map((q, idx) => {
                  const isDone = !!answers[q.id];
                  const isCurr = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        isCurr
                          ? 'ring-2 ring-brand-500 bg-brand-600 text-white shadow-md'
                          : isDone
                          ? 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

            </div>
          ) : (
            /* Results & Review View */
            <div className="space-y-6 animate-in fade-in">
              
              {/* Score Hero Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-navy-900 text-white shadow-xl text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Assessment Completed
                </div>
                
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {result.percentage}%
                </div>

                <p className="text-xs sm:text-sm text-slate-300">
                  You answered <span className="font-bold text-emerald-400">{result.correct_count}</span> of <span className="font-bold">{result.total_questions}</span> questions correctly ({result.score} pts earned).
                </p>

                {/* Adaptive Feedback */}
                <div className="p-3 rounded-2xl bg-white/10 text-left text-xs text-amber-200 border border-white/10 flex items-start gap-2.5">
                  <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">AI Adaptive Feedback:</div>
                    <div>{result.adaptive_feedback}</div>
                  </div>
                </div>
              </div>

              {/* Dynamic Competency Impact Pill */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Competency Engine Recalculated!
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      {result.recommendation || 'Your skill gaps and 30-day roadmap have updated automatically.'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60">
                  +{result.xp_earned} XP
                </span>
              </div>

              {/* Strong Areas & Weak Areas Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strong Areas */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">Strong Areas</h4>
                  </div>
                  <div className="space-y-1.5">
                    {(result.answers || []).filter(a => a.is_correct).length > 0 ?
                      [...new Set((result.answers || []).filter(a => a.is_correct).map(a => a.topic))].map((topic, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                          <span className="text-emerald-500">✓</span>
                          <span className="font-semibold">{topic}</span>
                        </div>
                      )) :
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 italic">Keep practicing — you'll get there!</p>
                    }
                  </div>
                </div>

                {/* Weak Areas */}
                <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider">Weak Areas</h4>
                  </div>
                  <div className="space-y-1.5">
                    {(result.answers || []).filter(a => !a.is_correct).length > 0 ?
                      [...new Set((result.answers || []).filter(a => !a.is_correct).map(a => a.topic))].map((topic, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300">
                          <span className="text-rose-500">×</span>
                          <span className="font-semibold">{topic}</span>
                        </div>
                      )) :
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">No weak areas — excellent performance! 🎉</p>
                    }
                  </div>
                </div>
              </div>

              {/* Recommended Learning */}
              {((result.answers || []).filter(a => !a.is_correct).length > 0) && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">Recommended Learning</h4>
                  </div>
                  <div className="space-y-1.5">
                    {[...new Set((result.answers || []).filter(a => !a.is_correct).map(a => a.topic))].map((topic, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-indigo-800 dark:text-indigo-300">
                        <ArrowRight className="w-3 h-3 text-indigo-500" />
                        <span>Review <strong>{topic}</strong> — {result.answers.find(a => a.topic === topic && !a.is_correct)?.explanation?.substring(0, 80)}...</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Question Answers with Explanations */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Detailed Answer Review ({result.answers?.length || 0} Questions)
                </h4>

                <div className="space-y-3">
                  {(result.answers || []).map((ans, idx) => (
                    <div
                      key={ans.question_id || idx}
                      className={`p-4 rounded-2xl border ${
                        ans.is_correct
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                          : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {ans.is_correct ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          )}
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Q{idx + 1}. {ans.question_text}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {ans.topic}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 pl-6">
                        <div className="text-slate-600 dark:text-slate-400">
                          Your Answer: <span className={`font-semibold ${ans.is_correct ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{ans.user_answer || '(No answer)'}</span>
                        </div>
                        {!ans.is_correct && (
                          <div className="text-slate-600 dark:text-slate-400">
                            Correct Answer: <span className="font-semibold text-emerald-700 dark:text-emerald-300">{ans.correct_answer}</span>
                          </div>
                        )}
                        <div className="mt-2 p-2.5 rounded-xl bg-white/80 dark:bg-navy-900/80 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                          <span className="font-bold text-slate-800 dark:text-slate-100">Explanation: </span>
                          {ans.explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-navy-950/60">
          {!result ? (
            <>
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Assessment'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-md transition-all"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-500 transition-all shadow-md"
            >
              Close & View Updated Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

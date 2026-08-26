import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Star, Clock, Target, BookOpen, Layers } from 'lucide-react';
import { submitOnboardingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const StudentOnboardingPage = () => {
  const { user, refreshUser, showToast } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user?.profile?.full_name || 'Ravi Kumar',
    education_level: user?.profile?.education_level || 'B.Tech',
    branch: user?.profile?.branch || 'Computer Science & Engineering',
    semester: user?.profile?.semester || 4,
    career_goal: user?.profile?.career_goal || 'AI/ML Engineer',
    preferred_learning_style: 'Hands-on Projects & AI Quizzes',
    daily_learning_time_min: 60,
  });

  const [skills, setSkills] = useState([
    { name: 'Python Programming', rating: 'advanced' },
    { name: 'Java Programming', rating: 'intermediate' },
    { name: 'Database Management Systems', rating: 'intermediate' },
    { name: 'Data Structures & Algorithms', rating: 'beginner' },
    { name: 'Machine Learning', rating: 'beginner' },
  ]);

  const [loading, setLoading] = useState(false);

  const handleSkillRatingChange = (index, rating) => {
    const updated = [...skills];
    updated[index].rating = rating;
    setSkills(updated);
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      await submitOnboardingApi({
        ...formData,
        skills,
      });
      await refreshUser();
      showToast('Personalization complete! Competency gaps mapped.', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Onboarding failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-brand-600 to-emerald-600 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white/20 text-white">
              Step {step} of 2 • Personalization Wizard
            </span>
            <h2 className="text-lg font-extrabold text-white mt-1">
              {step === 1 ? 'Academic Profile & Target Goal' : 'Skill Calibration & Self-Rating'}
            </h2>
          </div>
          <Sparkles className="w-6 h-6 text-emerald-200" />
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {step === 1 ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Learner Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Education Level
                  </label>
                  <select
                    value={formData.education_level}
                    onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="B.Tech">B.Tech / B.E.</option>
                    <option value="B.Sc">B.Sc / BCA</option>
                    <option value="M.Tech">M.Tech / MCA</option>
                    <option value="MoSPI Trainee">MoSPI / Civil Services Trainee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Branch / Major
                  </label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    placeholder="Computer Science & Engineering"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-brand-600" />
                  Primary Career Goal (Drives AI Recommendations)
                </label>
                <input
                  type="text"
                  value={formData.career_goal}
                  onChange={(e) => setFormData({ ...formData, career_goal: e.target.value })}
                  placeholder="e.g. AI/ML Engineer, Data Scientist, Full Stack Developer"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Daily Learning Commitment
                  </label>
                  <select
                    value={formData.daily_learning_time_min}
                    onChange={(e) => setFormData({ ...formData, daily_learning_time_min: parseInt(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value={30}>30 Minutes / day</option>
                    <option value={60}>60 Minutes / day (Recommended)</option>
                    <option value={90}>90 Minutes / day (Intensive)</option>
                    <option value={120}>120 Minutes / day (Immersion)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Style
                  </label>
                  <select
                    value={formData.preferred_learning_style}
                    onChange={(e) => setFormData({ ...formData, preferred_learning_style: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Hands-on Projects & AI Quizzes">Hands-on Projects & AI Quizzes</option>
                    <option value="Structured Theory & Video Lectures">Structured Theory & Video Lectures</option>
                    <option value="Fast-Paced Speed Run">Fast-Paced Speed Run</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2"
                >
                  <span>Continue to Skill Self-Rating</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 text-xs text-brand-800 dark:text-brand-300">
                ⭐ Rate your current competency level in foundational topics. SkillSphere AI uses this to initialize your competency radar and prioritize gap remediation.
              </div>

              <div className="space-y-3">
                {skills.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</div>
                      <div className="text-[10px] text-slate-400">Core Subject Area</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleSkillRatingChange(idx, lvl)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                            s.rating === lvl
                              ? lvl === 'beginner'
                                ? 'bg-rose-500 text-white shadow-sm'
                                : lvl === 'intermediate'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Initializing AI Engine...' : 'Generate My Competency Profile'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Star, Clock, User, CheckCircle2, Play, 
  HelpCircle, ArrowLeft, ShieldCheck, RefreshCw, Sparkles 
} from 'lucide-react';
import { getCourseDetailApi, enrollCourseApi, updateCourseProgressApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CourseDetailPage = ({ onOpenQuiz }) => {
  const { id } = useParams();
  const { showToast, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState(30);

  const fetchDetail = async () => {
    try {
      const data = await getCourseDetailApi(id);
      setCourse(data);
      if (data.modules && data.modules.length > 0 && data.modules[0].lessons?.length > 0) {
        setActiveLesson(data.modules[0].lessons[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleMarkComplete = async () => {
    const nextProg = Math.min(progress + 25, 100);
    setProgress(nextProg);
    try {
      await updateCourseProgressApi(course.id, nextProg);
      await refreshUser();
      showToast(`Lesson completed! Course progress updated to ${nextProg}%.`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-sm text-slate-500">Course not found.</p>
        <Link to="/courses" className="text-xs font-bold text-brand-600 hover:underline">
          Return to Course Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Courses</span>
      </button>

      {/* Course Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {course.level} Specialization
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {course.category}
            </span>
            {course.igot_competency_code && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                🏛️ iGOT: {course.igot_competency_code}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {course.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-amber-400" />
              {course.duration_hours} Total Hours
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User className="w-4 h-4 text-indigo-400" />
              {course.instructor_name || 'Dr. Sunita Sharma'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-current" />
              {course.rating || 4.9} / 5.0 Rating
            </span>
          </div>
        </div>

        {/* Progress & Quiz Trigger */}
        <div className="p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center min-w-[160px] flex-shrink-0 space-y-3">
          <div>
            <div className="text-2xl font-black text-white">{progress}%</div>
            <div className="text-[10px] font-bold uppercase text-brand-300">Course Progress</div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <button
            onClick={() => onOpenQuiz && onOpenQuiz({ course_id: course.id, topic: course.title })}
            className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Take Course Quiz</span>
          </button>
        </div>
      </div>

      {/* Grid: Lesson Content Reader (8 cols) + Module Syllabus (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lesson Player & Reader */}
        <div className="lg:col-span-8 bg-white dark:bg-navy-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Current Lesson</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {activeLesson?.title || 'Lesson Overview & Fundamental Concepts'}
              </h2>
            </div>

            <button
              onClick={handleMarkComplete}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Lesson Complete</span>
            </button>
          </div>

          {/* Video Placeholder Player */}
          <div className="w-full h-64 sm:h-80 rounded-2xl bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden shadow-inner group">
            <img
              src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516116211227-bbc155b9910d?w=600&auto=format&fit=crop&q=60'}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
            />
            <div className="w-14 h-14 rounded-full bg-brand-500 text-slate-950 flex items-center justify-center shadow-2xl z-10 group-hover:scale-110 transition-transform cursor-pointer">
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            </div>
            <span className="z-10 text-xs font-semibold text-slate-300 mt-2">
              Interactive MoSPI Lecture Video • 1080p HD
            </span>
          </div>

          {/* Academic Lesson Notes */}
          <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Conceptual Overview & Key Takeaways</h3>
            <p>
              This module provides exhaustive coverage of fundamental principles, mathematical formulations, and industry best practices. In machine learning and statistics, mastering baseline hypotheses, optimization dynamics, and generalization bounds prevents high variance and underfitting in production environments.
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white">🏛️ MoSPI Competency Objective:</span>
              <p className="text-slate-600 dark:text-slate-400">
                Aligns with <strong>National Statistics & Capacity Building Framework</strong>. Successful completion contributes 20% weight to your skill competency score.
              </p>
            </div>
          </div>

        </div>

        {/* Course Syllabus / Modules Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Course Syllabus ({course.modules?.length || 0} Modules)
            </h3>
          </div>

          <div className="space-y-3">
            {(course.modules || []).map((m, mIdx) => (
              <div
                key={m.id || mIdx}
                className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {m.title}
                </div>
                <p className="text-[11px] text-slate-400">{m.description}</p>

                {/* Lessons in Module */}
                <div className="space-y-1.5 pt-2">
                  {(m.lessons || []).map((l, lIdx) => {
                    const isSelected = activeLesson?.id === l.id;
                    return (
                      <button
                        key={l.id || lIdx}
                        onClick={() => setActiveLesson(l)}
                        className={`w-full p-2.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold border border-brand-300 dark:border-brand-800'
                            : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Play className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{l.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{l.duration_minutes}m</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

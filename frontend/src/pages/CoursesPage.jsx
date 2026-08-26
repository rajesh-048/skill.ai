import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Search, Star, Clock, User, ShieldCheck, 
  Sparkles, Filter, Play, CheckCircle2, RefreshCw 
} from 'lucide-react';
import { getCoursesApi, enrollCourseApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CoursesPage = () => {
  const { showToast } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const fetchCourses = async () => {
    try {
      const data = await getCoursesApi();
      setCourses(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await enrollCourseApi(courseId);
      showToast('Enrolled successfully! You can now access all modules.', 'success');
      await fetchCourses();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Enrollment error.', 'error');
    }
  };

  const categories = ['All', 'Machine Learning', 'Computer Science Core', 'Programming Languages', 'Data & Storage', 'Software Engineering', 'MoSPI Analytics', 'Security & Governance'];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            MoSPI & iGOT Synchronized Curriculum
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Curated Course Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Industry-aligned modules mapped directly to national competency standards. Choose courses to fill critical gaps in Machine Learning, DSA, and Database Systems.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-2xl font-black text-white">{courses.length}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">Accredited Courses</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic, keyword, or skill..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selectedLevel === lvl
                    ? 'bg-brand-600 text-white'
                    : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold border border-brand-300 dark:border-brand-800'
                  : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((c) => (
          <div
            key={c.id}
            className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Thumbnail */}
              <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                <img
                  src={c.thumbnail_url || 'https://images.unsplash.com/photo-1516116211227-bbc155b9910d?w=600&auto=format&fit=crop&q=60'}
                  alt={c.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-sm">
                    {c.level}
                  </span>
                  {c.igot_competency_code && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-900/90 text-emerald-200 backdrop-blur-sm">
                      🏛️ {c.igot_competency_code}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{c.category}</span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {c.rating || 4.8}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 transition-colors">
                  {c.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {c.duration_hours} Hours
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {c.instructor_name || 'MoSPI Faculty'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="p-5 pt-0 flex items-center gap-2">
              <Link
                to={`/courses/${c.id}`}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
              >
                <span>View Syllabus</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </Link>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

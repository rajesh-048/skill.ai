import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Play, ChevronRight, Upload, Brain, BarChart3, Users, Zap, Shield, Globe, BookOpen, Target, TrendingUp, CheckCircle2, Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── GSAP Animated Background Particles ─── */
const ParticleField = ({ count = 40 }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const particles = ref.current.querySelectorAll('.particle');
    particles.forEach((p, i) => {
      gsap.set(p, { x: Math.random() * 100 + '%', y: Math.random() * 100 + '%' });
      gsap.to(p, {
        y: '-=30',
        x: '+=' + (Math.random() * 20 - 10),
        opacity: Math.random() * 0.5 + 0.2,
        duration: 4 + Math.random() * 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 3,
      });
    });
  }, []);
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="particle absolute rounded-full bg-cyan-400/30"
          style={{ width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px` }}
        />
      ))}
    </div>
  );
};

/* ─── GSAP AI Brain SVG ─── */
const AIBrain = () => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const nodes = [
    { x: 200, y: 120, label: 'Python', pct: 72, color: '#3b82f6' },
    { x: 80, y: 200, label: 'Statistics', pct: 85, color: '#10b981' },
    { x: 320, y: 200, label: 'SQL', pct: 68, color: '#f59e0b' },
    { x: 100, y: 300, label: 'Data Viz', pct: 60, color: '#8b5cf6' },
    { x: 300, y: 300, label: 'AI/ML', pct: 45, color: '#ef4444' },
    { x: 200, y: 340, label: 'GIS', pct: 70, color: '#06b6d4' },
  ];
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const ctx = gsap.context(() => {
      const svg = svgRef.current;
      // Animate brain center
      const center = svg.querySelector('.brain-center');
      if (center) {
        gsap.from(center, { scale: 0, opacity: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)', delay: 0.3 });
        gsap.to(center, { scale: 1.05, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.5 });
      }
      // Animate connection lines
      const lines = svg.querySelectorAll('.brain-line');
      lines.forEach((line, i) => {
        gsap.from(line, { opacity: 0, attr: { x1: 200, y1: 200 }, duration: 0.6, delay: 0.5 + i * 0.1, ease: 'power2.out' });
      });
      // Animate skill nodes with stagger
      const skillNodes = svg.querySelectorAll('.skill-node');
      gsap.from(skillNodes, {
        scale: 0, opacity: 0, duration: 0.8, stagger: 0.12, delay: 0.8, ease: 'back.out(2)',
      });
      // Continuous orbital float for each node
      skillNodes.forEach((node, i) => {
        gsap.to(node, {
          y: '+=' + (4 + i * 2),
          duration: 2.5 + i * 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2,
        });
      });
      // Orbit ring rotation
      const rings = svg.querySelectorAll('.orbit-ring');
      rings.forEach((ring, i) => {
        gsap.to(ring, {
          rotation: i % 2 === 0 ? 360 : -360,
          duration: 30 + i * 15,
          repeat: -1,
          ease: 'none',
          transformOrigin: '200px 200px',
        });
      });
      // Scan ring effect after 4 seconds
      const scanRing = svg.querySelector('.scan-ring');
      if (scanRing) {
        gsap.fromTo(scanRing,
          { y: -100, scale: 0.8, opacity: 0 },
          { y: 100, scale: 1.2, opacity: 0.6, duration: 2, delay: 4, repeat: -1, repeatDelay: 6, ease: 'power1.inOut' }
        );
      }
    }, svgRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-[420px] aspect-square mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-violet-500/20 blur-2xl animate-pulse" />
      </div>
      <svg ref={svgRef} viewBox="0 0 400 400" className="w-full h-full relative z-10">
        {/* Connection lines */}
        {nodes.map((n, i) => (
          <line key={i} className="brain-line" x1={200} y1={200} x2={n.x} y2={n.y}
            stroke="url(#lineGrad)" strokeWidth="1" opacity="0.4"
            style={{ opacity: hovered === i ? 0.9 : 0.3 }}
          />
        ))}
        {/* Orbit rings */}
        <circle className="orbit-ring" cx="200" cy="200" r="140" fill="none" stroke="url(#orbitGrad)" strokeWidth="0.5" opacity="0.3" strokeDasharray="4 8" style={{ transformOrigin: '200px 200px' }} />
        <circle className="orbit-ring" cx="200" cy="200" r="170" fill="none" stroke="url(#orbitGrad)" strokeWidth="0.3" opacity="0.15" strokeDasharray="2 12" style={{ transformOrigin: '200px 200px' }} />
        {/* Scan ring */}
        <ellipse className="scan-ring" cx="200" cy="200" rx="130" ry="10" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0" />
        {/* Brain center */}
        <g className="brain-center">
          <circle cx="200" cy="200" r="28" fill="url(#brainGrad)" opacity="0.9" />
          <text x="200" y="207" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">AI</text>
        </g>
        {/* Skill nodes */}
        {nodes.map((n, i) => (
          <g key={i} className="skill-node cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <circle cx={n.x} cy={n.y} r={hovered === i ? 30 : 24} fill="rgba(15,23,42,0.8)" stroke={n.color}
              strokeWidth={hovered === i ? 2 : 1} className="transition-all duration-300"
              style={{ filter: hovered === i ? `drop-shadow(0 0 12px ${n.color})` : 'none' }}
            />
            <text x={n.x} y={n.y - 4} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="700">{n.pct}%</text>
            <text x={n.x} y={n.y + 8} textAnchor="middle" fill="#94a3b8" fontSize="7">{n.label}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <radialGradient id="brainGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </radialGradient>
        </defs>
      </svg>
      {/* Hover card with GSAP */}
      {hovered !== null && (
        <div className="absolute z-20 bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 shadow-xl shadow-cyan-500/10 text-xs min-w-[180px]"
          style={{ left: nodes[hovered].x > 200 ? '10%' : '55%', top: `${(nodes[hovered].y / 400) * 100 - 5}%` }}>
          <div className="font-bold text-cyan-400 mb-1">Skill Gap Detected</div>
          <div className="text-slate-400">Current: <span className="text-white font-semibold">{nodes[hovered].pct}%</span></div>
          <div className="text-slate-400">Target: <span className="text-emerald-400 font-semibold">85%</span></div>
          <div className="text-slate-400">Gap: <span className="text-amber-400 font-semibold">{85 - nodes[hovered].pct}%</span></div>
          <div className="mt-1 text-[10px] text-cyan-300 border-t border-slate-700 pt-1">AI recommends: {nodes[hovered].label} Fundamentals</div>
        </div>
      )}
    </div>
  );
};

/* ─── GSAP Animated Counter ─── */
const Counter = ({ end, suffix = '', duration = 2 }) => {
  const ref = useRef(null);
  const valRef = useRef({ v: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.to(valRef.current, {
        v: end,
        duration,
        ease: 'power2.out',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
        onUpdate: () => { if (ref.current) ref.current.textContent = Math.round(valRef.current.v) + suffix; },
      });
    });
    return () => ctx.revert();
  }, [end, suffix, duration]);
  return <span ref={ref}>0{suffix}</span>;
};

/* ─── GSAP Scroll Reveal ─── */
const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: delay / 1000,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 88%',
          once: true,
        },
      });
    });
    return () => ctx.revert();
  }, [delay]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

/* ─── Radar Chart ─── */
const SkillRadar = () => {
  const skills = [
    { name: 'Statistics', value: 85 },
    { name: 'Python', value: 72 },
    { name: 'SQL', value: 68 },
    { name: 'GIS', value: 70 },
    { name: 'AI/ML', value: 45 },
    { name: 'Data Viz', value: 60 },
    { name: 'Digital Gov', value: 55 },
    { name: 'Communication', value: 75 },
  ];
  const cx = 150, cy = 150, r = 120;
  const angleStep = (2 * Math.PI) / skills.length;
  const getPoint = (i, val) => {
    const angle = angleStep * i - Math.PI / 2;
    const dist = (val / 100) * r;
    return [cx + dist * Math.cos(angle), cy + dist * Math.sin(angle)];
  };
  const polygonPoints = skills.map((s, i) => getPoint(i, s.value).join(',')).join(' ');

  return (
    <div className="relative">
      <svg viewBox="0 0 300 300" className="w-full max-w-[320px] mx-auto">
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((pct, i) => (
          <polygon key={i} points={skills.map((_, j) => getPoint(j, pct * 100).join(',')).join(' ')} fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.4" />
        ))}
        {/* Axes */}
        {skills.map((_, i) => {
          const [x, y] = getPoint(i, 100);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#334155" strokeWidth="0.5" opacity="0.3" />;
        })}
        {/* Data polygon */}
        <polygon points={polygonPoints} fill="url(#radarFill)" stroke="#06b6d4" strokeWidth="2" opacity="0.85" />
        {/* Data points */}
        {skills.map((s, i) => {
          const [x, y] = getPoint(i, s.value);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
              <text x={x} y={y - 10} textAnchor="middle" fill="#e2e8f0" fontSize="8" fontWeight="700">{s.name}</text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

/* ═══════════════ MAIN LANDING PAGE ═══════════════ */
export const LandingPage = () => {
  const { loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const handleDemo = async (role = 'student') => {
    await loginAsDemo(role);
    navigate('/dashboard');
  };

  const journeySteps = [
    { num: '01', title: 'Assess', desc: 'AI evaluates your current competencies.', icon: <Brain size={20} /> },
    { num: '02', title: 'Discover', desc: 'Identify knowledge and skill gaps.', icon: <Target size={20} /> },
    { num: '03', title: 'Personalize', desc: 'Create an individualized learning path.', icon: <Sparkles size={20} /> },
    { num: '04', title: 'Learn', desc: 'Connect with relevant learning resources.', icon: <BookOpen size={20} /> },
    { num: '05', title: 'Grow', desc: 'Measure progress and update competency.', icon: <TrendingUp size={20} /> },
  ];

  const heroRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-badge', { y: 20, opacity: 0, duration: 0.6 })
        .from('.hero-title span', { y: 40, opacity: 0, duration: 0.8, stagger: 0.15 }, '-=0.3')
        .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.3')
        .from('.hero-stats > div', { y: 15, opacity: 0, duration: 0.4, stagger: 0.1 }, '-=0.2')
        .from('.hero-brain', { scale: 0.8, opacity: 0, duration: 1, ease: 'elastic.out(1, 0.6)' }, '-=0.8');
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="min-h-screen bg-[#0a0e1a] text-slate-100 font-sans overflow-x-hidden">

      {/* ═══ GLOBAL STYLES ═══ */}
      <style>{`
        @keyframes float-particle { 0%,100%{transform:translateY(0) scale(1);opacity:.3} 50%{transform:translateY(-20px) scale(1.2);opacity:.7} }
        @keyframes float-node { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 15px rgba(6,182,212,0.15)} 50%{box-shadow:0 0 30px rgba(6,182,212,0.3)} }
        @keyframes scan-ring { 0%{transform:translateY(-100%) scale(0.8);opacity:0} 50%{opacity:1} 100%{transform:translateY(100%) scale(1.2);opacity:0} }
        @keyframes gradient-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes orbit-slow { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .glass { background: rgba(15,23,42,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(148,163,184,0.1); }
        .glass-hover:hover { border-color: rgba(6,182,212,0.4); box-shadow: 0 0 30px rgba(6,182,212,0.1); }
        .gradient-text { background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .glow-border { border: 1px solid rgba(6,182,212,0.2); box-shadow: 0 0 20px rgba(6,182,212,0.05); }
        .journey-line { background: linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6); height: 2px; }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>

      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-slate-800/50 shadow-lg shadow-black/20' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white tracking-tight">SkillIntell<span className="text-cyan-400">AI</span></span>
              <span className="hidden sm:block text-[9px] text-slate-500 -mt-0.5">Powered for Official Statistics</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            {['Home', 'How It Works', 'Features', 'For Organizations'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/\s/g, '-')}`} className="hover:text-cyan-400 transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => handleDemo('student')} className="hidden sm:flex px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
              Get Started <ArrowRight size={14} className="inline ml-1" />
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-slate-400 hover:text-white">
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-[#0a0e1a]/95 backdrop-blur-xl border-t border-slate-800/50 px-4 py-4 space-y-3">
            {['Home', 'How It Works', 'Features', 'For Organizations'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/\s/g, '-')}`} className="block text-sm text-slate-300 hover:text-cyan-400" onClick={() => setMobileMenu(false)}>{l}</a>
            ))}
            <button onClick={() => { handleDemo('student'); setMobileMenu(false); }} className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold">Get Started</button>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16">
        <ParticleField />
        {/* Atmospheric glow */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/8 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="hero-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass glow-border text-xs font-semibold text-cyan-300">
                <Sparkles size={12} /> AI-POWERED SKILL INTELLIGENCE
              </div>
              <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                <span className="block">Know Your <span className="text-cyan-400">Skills</span>.</span>
                <span className="block">Find Your <span className="text-blue-400">Gaps</span>.</span>
                <span className="block">Build Your <span className="gradient-text">Future</span>.</span>
              </h1>
              <p className="hero-subtitle text-base sm:text-lg text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                AI-powered skill intelligence that transforms competency gaps into personalized learning journeys for India's future-ready statistical workforce.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <button onClick={() => handleDemo('student')} className="hero-cta px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:shadow-xl hover:shadow-cyan-500/25 transition-all flex items-center gap-2">
                  Discover My Skill Path <ArrowRight size={16} />
                </button>
                <button className="hero-cta px-6 py-3 rounded-2xl glass glow-border text-slate-300 font-bold text-sm hover:text-white transition-all flex items-center gap-2">
                  <Play size={14} className="text-cyan-400" /> Watch How It Works
                </button>
              </div>
              <div className="hero-stats flex gap-8 pt-4 justify-center lg:justify-start">
                {[
                  { val: 50, suffix: 'K+', label: 'Learners' },
                  { val: 120, suffix: '+', label: 'Learning Resources' },
                  { val: 0, suffix: '', label: 'AI-Powered Growth', text: true },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xl font-black text-white">{s.text ? s.label : <Counter end={s.val} suffix={s.suffix} />}</div>
                    {!s.text && <div className="text-[10px] text-slate-500 font-medium">{s.label}</div>}
                  </div>
                ))}
              </div>
            </div>
            {/* Right: AI Brain */}
            <div className="hero-brain flex justify-center">
              <AIBrain />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: CORE JOURNEY ═══ */}
      <section id="how-it-works" className="relative py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black">From Skill Gaps <span className="gradient-text">to Skill Growth</span></h2>
              <p className="text-slate-400 max-w-xl mx-auto">One intelligent learning journey, continuously adapting to you.</p>
            </div>
          </Reveal>
          {/* Journey line */}
          <div className="relative">
            <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-violet-500/50" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
              {journeySteps.map((step, i) => (
                <Reveal key={i} delay={i * 120}>
                  <div className="glass glass-hover rounded-2xl p-5 text-center space-y-3 hover:scale-105 transition-transform duration-300 relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                      {step.icon}
                    </div>
                    <div className="text-[10px] font-bold text-cyan-500 tracking-widest">{step.num}</div>
                    <div className="text-sm font-bold text-white">{step.title}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: SKILL DNA ═══ */}
      <section id="features" className="relative py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black">Your <span className="gradient-text">Skill DNA</span></h2>
              <p className="text-slate-400 max-w-xl mx-auto">A living competency profile that evolves as you learn.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <SkillRadar />
            </Reveal>
            <Reveal delay={200}>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass glow-border text-[10px] font-bold text-cyan-300 tracking-wider">
                  <Sparkles size={10} /> AI ANALYSIS COMPLETE
                </div>
                <div className="glass rounded-2xl p-6 space-y-4">
                  <div className="text-sm font-bold text-slate-300">Current Competency</div>
                  <div className="text-5xl font-black gradient-text">3.2 <span className="text-lg text-slate-500">/ 5</span></div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
                    <div className="text-center">
                      <div className="text-2xl font-black text-white">8</div>
                      <div className="text-[10px] text-slate-500">Skills Assessed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-amber-400">3</div>
                      <div className="text-[10px] text-slate-500">Skill Gaps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-emerald-400">+12%</div>
                      <div className="text-[10px] text-slate-500">Growth</div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4: PERSONALIZED LEARNING ═══ */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black">Your AI Knows What You Need <span className="gradient-text">Next</span></h2>
              <p className="text-slate-400 max-w-xl mx-auto">Stop searching through hundreds of resources. Let AI identify the learning that matters most to your role.</p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="max-w-lg mx-auto glass rounded-3xl p-6 space-y-5 glow-border" style={{ animation: 'glow-pulse 3s ease-in-out infinite' }}>
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <Target size={14} /> Recommended for You
              </div>
              <h3 className="text-lg font-extrabold text-white">Python for Statistical Analysis</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <div className="text-slate-500 mb-1">Current competency</div>
                  <div className="text-lg font-black text-amber-400">2.1 / 5</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <div className="text-slate-500 mb-1">Target competency</div>
                  <div className="text-lg font-black text-emerald-400">3.5 / 5</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <div className="text-slate-500 mb-1">Skill gap</div>
                  <div className="text-lg font-black text-rose-400">1.4</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <div className="text-slate-500 mb-1">Role relevance</div>
                  <div className="text-lg font-black text-cyan-400">High</div>
                </div>
              </div>
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-3 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-cyan-400">Why this recommendation?</span><br />
                "Your current competency indicates that strengthening Python would help close an identified technical skill gap for your career goal."
              </div>
              <button onClick={() => handleDemo('student')} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2">
                View Learning Path <ArrowRight size={14} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ SECTION 5: iGOT + NSSTA ECOSYSTEM ═══ */}
      <section id="for-organizations" className="relative py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black">One Intelligence Layer. <span className="gradient-text">Multiple Ecosystems.</span></h2>
              <p className="text-slate-400 max-w-xl mx-auto">Seamlessly connects with India's learning infrastructure.</p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Left */}
              <div className="glass rounded-2xl p-6 text-center space-y-3 glow-border">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto text-cyan-400 border border-cyan-500/30">
                  <Brain size={22} />
                </div>
                <div className="text-sm font-bold text-white">Your Competency Profile</div>
                <p className="text-xs text-slate-400">AI-analyzed skill assessment with real-time tracking</p>
              </div>
              {/* Center */}
              <div className="space-y-4">
                <div className="glass rounded-2xl p-5 text-center space-y-2 glow-border border-cyan-500/30">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-cyan-500/20">
                    <Zap size={22} />
                  </div>
                  <div className="text-sm font-bold text-white">AI Skill Intelligence Engine</div>
                  <p className="text-[10px] text-cyan-400">Gap Analysis + Path Generation + Adaptive Assessment</p>
                </div>
                <div className="flex justify-center text-cyan-500/40 text-lg">↓</div>
                <div className="glass rounded-2xl p-5 text-center glow-border">
                  <div className="text-sm font-bold text-white">Personalized Learning Path</div>
                  <p className="text-[10px] text-slate-400 mt-1">Continuous competency-driven recommendations</p>
                </div>
              </div>
              {/* Right columns */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-2xl p-4 text-center space-y-2">
                  <div className="text-lg">🏛️</div>
                  <div className="text-[11px] font-bold text-white">iGOT Karmayogi</div>
                  <div className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">iGOT-ready</div>
                </div>
                <div className="glass rounded-2xl p-4 text-center space-y-2">
                  <div className="text-lg">📊</div>
                  <div className="text-[11px] font-bold text-white">NSSTA</div>
                  <div className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold">NSSTA-ready</div>
                </div>
                <div className="glass rounded-2xl p-4 text-center space-y-2 col-span-2">
                  <div className="text-sm font-bold text-white">Courses & Training Programmes</div>
                  <p className="text-[10px] text-slate-400">Connected learning ecosystem for capacity building</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ SECTION 6: AI QUIZ GENERATOR ═══ */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black"><span className="gradient-text">Upload. Generate. Assess.</span></h2>
              <p className="text-slate-400 max-w-xl mx-auto">Turn learning materials into intelligent assessments in seconds.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <Reveal delay={0}>
              <div className="glass rounded-2xl p-6 text-center space-y-3 glow-border">
                <Upload size={28} className="text-cyan-400 mx-auto" />
                <div className="text-sm font-bold text-white">Upload Material</div>
                <p className="text-xs text-slate-400">PDF, PPT, DOCX, TXT</p>
                <div className="p-3 rounded-xl bg-slate-800/50 border border-dashed border-slate-600 text-xs text-slate-500">
                  📄 Sampling_Methodology.pdf
                </div>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center animate-pulse shadow-lg shadow-cyan-500/30">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div className="text-xs font-bold text-cyan-400 tracking-widest">AI PROCESSING</div>
                <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full" style={{ width: '100%', animation: 'gradient-shift 2s ease infinite', backgroundSize: '200% 100%' }} />
                </div>
              </div>
            </Reveal>
            <Reveal delay={400}>
              <div className="glass rounded-2xl p-6 space-y-4 glow-border">
                <div className="text-sm font-bold text-white">10 AI-Generated MCQs</div>
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                  <div className="text-[10px] font-bold text-cyan-400">QUESTION 01</div>
                  <p className="text-xs text-slate-300">What is the primary purpose of stratified sampling?</p>
                  <div className="space-y-1 text-[11px]">
                    <div className="text-slate-500">A. Increase population size</div>
                    <div className="text-emerald-400 font-semibold">B. Divide into homogeneous groups ✓</div>
                    <div className="text-slate-500">C. Remove all sampling error</div>
                    <div className="text-slate-500">D. Eliminate data collection</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">AI Explanation included</div>
                  <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold">8 / 10</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 7: WORKFORCE INTELLIGENCE ═══ */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black">From Individual Growth to <span className="gradient-text">Workforce Intelligence</span></h2>
              <p className="text-slate-400 max-w-xl mx-auto">Give organizations a clear view of skills, gaps, and capabilities.</p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="max-w-2xl mx-auto glass rounded-3xl p-6 space-y-4 glow-border">
              {[
                { skill: 'AI / ML', pct: 35, gap: 'HIGH GAP', color: '#ef4444' },
                { skill: 'Python', pct: 58, gap: 'MEDIUM GAP', color: '#f59e0b' },
                { skill: 'SQL', pct: 62, gap: 'MEDIUM GAP', color: '#f59e0b' },
                { skill: 'GIS', pct: 72, gap: 'LOW GAP', color: '#3b82f6' },
                { skill: 'Statistics', pct: 85, gap: 'STRONG', color: '#10b981' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-28 text-xs font-bold text-slate-300">{s.skill}</div>
                  <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.color + '20', color: s.color }}>{s.gap}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
                <BarChart3 size={14} className="text-cyan-400" />
                <span className="text-[10px] text-slate-400 font-medium">Workforce analytics for organizational decision-making</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ SECTION 8: FUTURE SKILLS ═══ */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black">Prepare for <span className="gradient-text">What Comes Next</span></h2>
              <p className="text-slate-400 max-w-xl mx-auto">Identify emerging skills before they become critical.</p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
              {['AI / ML', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'GIS', 'Automation', 'Data Visualization', 'APIs'].map((skill, i) => (
                <div key={i} className="px-5 py-3 rounded-2xl glass glow-border text-sm font-semibold text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-default" style={{ animation: `float-node ${4 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}>
                  {skill}
                </div>
              ))}
              <div className="w-full flex justify-center pt-6">
                <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/30 text-sm font-bold text-cyan-400">
                  FUTURE-READY WORKFORCE
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
        <ParticleField />
        <Reveal>
          <div className="max-w-3xl mx-auto text-center px-4 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black">Your Next Skill Is <span className="gradient-text">Waiting</span></h2>
            <p className="text-slate-400 max-w-lg mx-auto text-lg">Discover where you are. Understand where you need to go. Let AI build the path.</p>
            <button onClick={() => handleDemo('student')} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base hover:shadow-2xl hover:shadow-cyan-500/30 transition-all inline-flex items-center gap-2" style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}>
              <Sparkles size={18} /> Discover My Skill Path <ArrowRight size={18} />
            </button>
            <p className="text-[10px] text-slate-600 pt-4">Prototype demo • Built for SIH 2026 Problem Statement 26101</p>
          </div>
        </Reveal>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-slate-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"><Brain size={14} className="text-white" /></div>
                <span className="text-sm font-extrabold text-white">SkillIntell<span className="text-cyan-400">AI</span></span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">AI-powered skill intelligence for a future-ready statistical workforce.</p>
            </div>
            {[
              { title: 'Platform', links: ['How It Works', 'Features', 'AI Quiz Generator'] },
              { title: 'Organization', links: ['For MoSPI', 'iGOT Integration', 'NSSTA Training'] },
              { title: 'Connect', links: ['Contact', 'GitHub', 'SIH 2026'] },
            ].map((col, i) => (
              <div key={i} className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">{col.title}</div>
                {col.links.map(l => <a key={l} href="#" className="block text-xs text-slate-500 hover:text-cyan-400 transition-colors">{l}</a>)}
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-600">
            <span>SIH 2026 • Problem Statement 26101 • MoSPI</span>
            <span>Prototype demo. Demo data used throughout.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

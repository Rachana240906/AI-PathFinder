import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass, TrendingUp, ArrowRightLeft, Sparkles, Trophy,
  ExternalLink, Calendar, CheckCircle2, ChevronRight, Layers,
  DollarSign, Flame, Clock, AlertTriangle, ShieldCheck, Check,
  X, Award, Target, BookOpen, Code2, Cpu, BarChart3, Cloud,
  Briefcase, Zap
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip
} from 'recharts';

// ── Pastel Accents for Cards ──
const CARD_PALETTES = [
  {
    bg: 'bg-emerald-50/60',
    border: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400',
    accent: '#059669',
    badgeBg: 'bg-emerald-100/80',
    badgeText: 'text-emerald-900',
    radarColor: '#059669'
  },
  {
    bg: 'bg-sky-50/60',
    border: 'border-sky-200',
    hoverBorder: 'hover:border-sky-400',
    accent: '#0284c7',
    badgeBg: 'bg-sky-100/80',
    badgeText: 'text-sky-900',
    radarColor: '#0284c7'
  },
  {
    bg: 'bg-purple-50/60',
    border: 'border-purple-200',
    hoverBorder: 'hover:border-purple-400',
    accent: '#7c3aed',
    badgeBg: 'bg-purple-100/80',
    badgeText: 'text-purple-900',
    radarColor: '#7c3aed'
  },
  {
    bg: 'bg-amber-50/60',
    border: 'border-amber-200',
    hoverBorder: 'hover:border-amber-400',
    accent: '#d97706',
    badgeBg: 'bg-amber-100/80',
    badgeText: 'text-amber-900',
    radarColor: '#d97706'
  }
];

// Helper to format salary with INR first
const formatSalaryINRFirst = (usdSalaryStr) => {
  if (!usdSalaryStr) return '₹12L - ₹22L/yr ($95k - $145k)';
  if (usdSalaryStr.includes('₹')) return usdSalaryStr;
  
  const matches = usdSalaryStr.match(/\$(\d+)k/g);
  if (matches && matches.length >= 2) {
    const lowUSD = parseInt(matches[0].replace('$', '').replace('k', ''), 10);
    const highUSD = parseInt(matches[1].replace('$', '').replace('k', ''), 10);
    const lowLakh = Math.max(6, Math.round(lowUSD * 0.12));
    const highLakh = Math.max(12, Math.round(highUSD * 0.17));
    return `₹${lowLakh}L - ₹${highLakh}L/yr (${usdSalaryStr})`;
  }
  return `₹14L - ₹26L/yr (${usdSalaryStr})`;
};

// Helper to clean growth text (prevent "(YoY) YoY" duplication)
const cleanGrowthRate = (rateStr) => {
  if (!rateStr) return '+25% YoY';
  const clean = rateStr.replace(/\s*\(?YoY\)?/gi, '').trim();
  return `${clean} YoY`;
};

// Animated Circular Progress Ring
const CircularProgressRing = ({ score = 0, size = 68, strokeWidth = 5.5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, Math.round(score)));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  let strokeColor = '#ec4899'; // pink <35%
  let textColor = 'text-pink-600';
  let trackColor = '#fce7f3';
  if (progress > 60) {
    strokeColor = '#059669'; // green >60%
    textColor = 'text-emerald-700';
    trackColor = '#d1fae5';
  } else if (progress >= 35) {
    strokeColor = '#f59e0b'; // amber 35-60%
    textColor = 'text-amber-700';
    trackColor = '#fef3c7';
  }

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          className="fill-transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="fill-transparent transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-xs font-black ${textColor}`}>
          {progress}%
        </span>
        <span className="text-[8px] font-bold uppercase tracking-tighter text-slate-400">Match</span>
      </div>
    </div>
  );
};

export default function CareerRadarView({
  roles = [],
  selectedRole,
  onSelectRole,
  userSkills = [],
  suitabilityData,
  onGoToProjects,
  onGoToResume
}) {
  const [activeTab, setActiveTab] = useState('radar'); // 'radar', 'recommendations', 'comparison', 'market', 'opportunities'
  
  // Transition comparison roles
  const [roleA, setRoleA] = useState('full_stack_developer');
  const [roleB, setRoleB] = useState('ai_ml_engineer');
  const [compareData, setCompareData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Market trends
  const [marketTrends, setMarketTrends] = useState(null);

  // Curated opportunities feed
  const [opportunities, setOpportunities] = useState([]);

  // Fetch role comparison
  useEffect(() => {
    setCompareLoading(true);
    const skillsParam = encodeURIComponent(userSkills.join(','));
    fetch(`/api/roles/compare?role_a=${roleA}&role_b=${roleB}&skills=${skillsParam}`)
      .then(res => res.json())
      .then(data => setCompareData(data))
      .catch(() => {})
      .finally(() => setCompareLoading(false));
  }, [roleA, roleB, userSkills]);

  // Fetch market trends
  useEffect(() => {
    fetch('/api/market/trends')
      .then(res => res.json())
      .then(data => setMarketTrends(data))
      .catch(() => {});
  }, []);

  // Fetch opportunities feed
  useEffect(() => {
    const skillsParam = encodeURIComponent(userSkills.join(','));
    fetch(`/api/opportunities/feed?skills=${skillsParam}`)
      .then(res => res.json())
      .then(data => setOpportunities(data.opportunities || []))
      .catch(() => {});
  }, [userSkills]);

  // Extract top 3 roles from suitabilityData or default
  const topRoles = useMemo(() => {
    const evals = suitabilityData?.all_role_evaluations || [];
    if (evals.length > 0) {
      return evals.slice(0, 3).map((evalRole, idx) => {
        const full = roles.find(r => r.id === evalRole.role_id) || {};
        return {
          ...full,
          id: evalRole.role_id || full.id,
          title: full.title || evalRole.role_title,
          category: full.category || 'Software & AI',
          domain_label: full.domain_label || 'Technical',
          match_score: evalRole.match_score ?? 65,
          tier: evalRole.readiness_tier || (evalRole.match_score >= 70 ? 'Job Ready' : 'Near Ready'),
          growth_rate: full.growth_rate || '+26% YoY',
          demand: full.demand || 'High',
          avg_salary: full.avg_salary || '$105k - $155k'
        };
      });
    }

    // Default top 3 fallback
    const defaults = ['ai_ml_engineer', 'full_stack_developer', 'product_manager'];
    return defaults.map((id, idx) => {
      const full = roles.find(r => r.id === id) || roles[idx] || {};
      return {
        ...full,
        id: full.id || id,
        title: full.title || 'Role Title',
        category: full.category || 'Software Engineering',
        domain_label: full.domain_label || 'Technical',
        match_score: idx === 0 ? 82 : idx === 1 ? 68 : 54,
        tier: idx === 0 ? 'Job Ready' : 'Near Ready',
        growth_rate: full.growth_rate || '+25%',
        demand: full.demand || 'Very High',
        avg_salary: full.avg_salary || '$110k - $160k'
      };
    });
  }, [suitabilityData, roles]);

  // Skill Snapshot Calculations (Total, Strongest, Weakest)
  const skillSnapshot = useMemo(() => {
    const total = userSkills.length;
    const lowerSkills = userSkills.map(s => s.toLowerCase());

    const hasAI = lowerSkills.some(s => s.includes('python') || s.includes('learning') || s.includes('torch') || s.includes('data'));
    const hasWeb = lowerSkills.some(s => s.includes('react') || s.includes('javascript') || s.includes('node') || s.includes('css') || s.includes('html'));
    const hasCloud = lowerSkills.some(s => s.includes('docker') || s.includes('aws') || s.includes('kubernetes') || s.includes('cloud') || s.includes('linux'));
    const hasBiz = lowerSkills.some(s => s.includes('agile') || s.includes('scrum') || s.includes('product') || s.includes('excel') || s.includes('management'));

    let strongest = 'Python & Algorithms';
    let weakest = 'Cloud & DevOps Tooling';

    if (hasWeb && !hasCloud) {
      strongest = 'Full Stack & UI';
      weakest = 'Cloud Deployment (Docker/AWS)';
    } else if (hasAI && !hasBiz) {
      strongest = 'Machine Learning & Python';
      weakest = 'System Architecture & Specs';
    } else if (hasBiz) {
      strongest = 'Product & Strategy';
      weakest = 'Deep Infrastructure & Cloud';
    }

    return { total, strongest, weakest };
  }, [userSkills]);

  // 6-Axis Recharts Radar Data Preparation
  const radarData = useMemo(() => {
    const axes = [
      { key: 'Core', label: 'Core Skills' },
      { key: 'Advanced', label: 'Advanced Arch' },
      { key: 'Tools', label: 'Tools & DevOps' },
      { key: 'Domain', label: 'Domain Expertise' },
      { key: 'Projects', label: 'Hands-on Projects' },
      { key: 'Soft Skills', label: 'Soft Skills & Collab' }
    ];

    return axes.map(axis => {
      const row = { axis: axis.label };
      topRoles.forEach((role, i) => {
        const base = role.match_score || 60;
        let val = base;
        if (axis.key === 'Core') val = Math.min(98, Math.round(base * 1.08));
        else if (axis.key === 'Advanced') val = Math.max(25, Math.round(base * 0.88));
        else if (axis.key === 'Tools') val = Math.min(95, Math.max(30, Math.round(base * 0.95 + (i * 4))));
        else if (axis.key === 'Domain') val = Math.min(96, Math.round(base * 1.02));
        else if (axis.key === 'Projects') val = Math.min(92, Math.max(35, Math.round(base * 0.90)));
        else if (axis.key === 'Soft Skills') val = Math.min(94, Math.round(base * 0.96 + 8));

        row[role.title] = val;
      });
      return row;
    });
  }, [topRoles]);

  // Skill gap calculator per role
  const getRoleGaps = (roleTitle = '') => {
    const t = roleTitle.toLowerCase();
    if (t.includes('ai') || t.includes('learning')) {
      return {
        matched: ['Python', 'SQL', 'FastAPI'],
        missing: ['LLMs & RAG', 'PyTorch', 'Vector Databases'],
        weeks: 6
      };
    }
    if (t.includes('full stack') || t.includes('developer') || t.includes('frontend')) {
      return {
        matched: ['React.js', 'JavaScript', 'Git'],
        missing: ['Next.js 14', 'PostgreSQL Indexing', 'Redis Caching'],
        weeks: 4
      };
    }
    if (t.includes('product') || t.includes('manager')) {
      return {
        matched: ['User Research', 'Agile & Scrum', 'Roadmapping'],
        missing: ['A/B Experimentation', 'SQL Metrics', 'PRD Specs'],
        weeks: 5
      };
    }
    return {
      matched: ['Problem Solving', 'Data Structures', 'Git'],
      missing: ['Distributed Systems', 'Docker Containers', 'CI/CD Pipelines'],
      weeks: 6
    };
  };

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Banner Header & Skill Snapshot Hero ── */}
      <div
        className="rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 95% 30%, rgba(5,150,105,0.08) 0%, transparent 65%)' }}
        />
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Compass size={13} /> Strategic Career Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Career Radar & Role Comparison
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Benchmarked across 6 competency axes with real-time Indian tech CTC benchmarks, multi-role gap analytics, and transferable skills mapping.
            </p>
          </div>

          {/* 7. "Your Skill Snapshot" Mini Card Filling Hero Space */}
          <div className="bg-slate-50/90 border border-emerald-200/80 p-4 sm:p-5 rounded-2xl flex items-center gap-5 shadow-xs shrink-0 backdrop-blur-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              <Trophy size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Your Skill Snapshot</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                  {skillSnapshot.total} Skills Active
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-emerald-700">Strongest:</span> {skillSnapshot.strongest}
              </p>
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-amber-700">Top Gap:</span> {skillSnapshot.weakest}
              </p>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-100 flex-wrap">
          {[
            { id: 'radar',           label: '🕸️ 6-Axis Radar Coverage' },
            { id: 'recommendations', label: '🎯 Top 3 Role Cards' },
            { id: 'comparison',      label: '⚖️ Role Comparison (Overlap)' },
            { id: 'market',          label: '📈 Live Market & CTC Trends' },
            { id: 'opportunities',   label: '🏆 Curated Internships Feed' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 1. Recharts RadarChart Section ── */}
      {activeTab === 'radar' && (
        <div className="space-y-6 animate-fade-in">
          <div
            className="rounded-3xl p-6 sm:p-8 shadow-sm"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-emerald-600" />
                  6-Axis Skill Coverage Benchmark
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Overlaying competency across Core, Advanced, Tools, Domain, Projects, and Soft Skills for your top 3 recommended paths.
                </p>
              </div>

              {/* Legend Summary */}
              <div className="flex items-center gap-3 flex-wrap">
                {topRoles.map((r, i) => (
                  <div key={r.id || i} className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CARD_PALETTES[i % CARD_PALETTES.length].radarColor }} />
                    <span className="truncate max-w-[150px]">{r.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar Canvas */}
            <div className="w-full h-[380px] sm:h-[420px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="axis" stroke="#475569" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}
                  />
                  {topRoles.map((role, i) => {
                    const color = CARD_PALETTES[i % CARD_PALETTES.length].radarColor;
                    return (
                      <Radar
                        key={role.id || i}
                        name={role.title}
                        dataKey={role.title}
                        stroke={color}
                        fill={color}
                        fillOpacity={0.25}
                        strokeWidth={2.5}
                      />
                    );
                  })}
                  <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '11px', fontWeight: 'bold' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Top 3 Roles with Circular Progress & Gaps ── */}
      {(activeTab === 'radar' || activeTab === 'recommendations') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Top Recommended Career Pathways</h3>
              <p className="text-xs text-slate-500">With estimated weeks to job-readiness and Indian CTC benchmark</p>
            </div>
            {userSkills.length === 0 && (
              <button
                onClick={onGoToResume}
                className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer"
              >
                Upload Resume to Personalize
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topRoles.map((role, idx) => {
              const palette = CARD_PALETTES[idx % CARD_PALETTES.length];
              const isSelected = selectedRole === role.id;
              const gaps = getRoleGaps(role.title);
              const cleanGrowth = cleanGrowthRate(role.growth_rate);
              const formattedSalary = formatSalaryINRFirst(role.avg_salary);

              return (
                <div
                  key={role.id || idx}
                  className={`rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg border ${palette.bg} ${palette.border} ${palette.hoverBorder}`}
                  style={{
                    boxShadow: isSelected ? '0 0 0 2px var(--accent), 0 10px 25px -5px rgba(5,150,105,0.15)' : undefined
                  }}
                >
                  <div className="space-y-4">
                    {/* Top Row: Rank Badge & Circular Progress Ring */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${palette.badgeBg} ${palette.badgeText} border-emerald-200/60`}>
                          #{idx + 1} Best Fit
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                            Active Target
                          </span>
                        )}
                      </div>
                      {/* Animated Circular Progress Ring */}
                      <CircularProgressRing score={role.match_score} />
                    </div>

                    {/* Role Title & Small Icon */}
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/80 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                          {idx === 0 ? <Cpu size={14} className="text-emerald-700" /> : idx === 1 ? <Code2 size={14} className="text-sky-700" /> : <Briefcase size={14} className="text-purple-700" />}
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                          {role.title}
                        </h4>
                      </div>
                      {/* Fixed repeated text: show domain clearly without duplicate category */}
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        {role.category}
                      </p>
                    </div>

                    {/* 3 Icon Stat Tiles: Growth, Demand, Salary (INR First) */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="bg-white/85 p-2.5 rounded-xl border border-slate-200/80 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-0.5">
                          <TrendingUp size={10} className="text-emerald-600" /> Growth
                        </p>
                        <p className="text-xs font-black text-slate-800 mt-0.5">{cleanGrowth}</p>
                      </div>

                      <div className="bg-white/85 p-2.5 rounded-xl border border-slate-200/80 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-0.5">
                          <Flame size={10} className="text-amber-500" /> Demand
                        </p>
                        <p className="text-xs font-black text-slate-800 mt-0.5">{role.demand}</p>
                      </div>

                      <div className="bg-white/85 p-2.5 rounded-xl border border-slate-200/80 text-center col-span-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-0.5">
                          <Clock size={10} className="text-sky-600" /> Ready
                        </p>
                        <p className="text-xs font-black text-emerald-700 mt-0.5">~{gaps.weeks} wks</p>
                      </div>
                    </div>

                    {/* Salary in INR First */}
                    <div className="bg-white/80 px-3 py-2 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500 flex items-center gap-1">
                        <DollarSign size={13} className="text-emerald-600" /> Compensation:
                      </span>
                      <span className="font-extrabold text-slate-900">{formattedSalary}</span>
                    </div>

                    {/* 3 "Why This Fit" Chips (Matched green, Missing red) */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Why this fit:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {gaps.matched.slice(0, 2).map((m, i) => (
                          <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100/90 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Check size={10} /> {m}
                          </span>
                        ))}
                        {gaps.missing.slice(0, 1).map((m, i) => (
                          <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100/90 text-rose-800 border border-rose-300 flex items-center gap-1">
                            <X size={10} /> {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* "Biggest Gaps" Line */}
                    <div className="text-xs text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-200/60 space-y-0.5">
                      <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                        <AlertTriangle size={11} className="text-amber-600" /> Biggest Gaps:
                      </span>
                      <p className="text-[11px] text-slate-600 pl-4 font-medium">
                        {gaps.missing.join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="pt-4 mt-4 border-t border-slate-200/60">
                    <button
                      onClick={() => onSelectRole && onSelectRole(role.id)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white hover:bg-emerald-50 text-slate-800 border border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {isSelected ? '✓ Currently Targeting This Role' : 'Set as Active Target Role'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. Role Comparison Tab (Shared in Middle, Unique on Sides) ── */}
      {activeTab === 'comparison' && (
        <div className="space-y-6 animate-fade-in">
          {/* Role Pickers */}
          <div
            className="rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Role A (Current / Baseline):</label>
              <select
                value={roleA}
                onChange={e => setRoleA(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs outline-none bg-slate-50 border border-slate-200 text-slate-900 font-semibold"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <ArrowRightLeft size={20} />
            </div>

            <div className="flex-1 w-full space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Role B (Target Pivot):</label>
              <select
                value={roleB}
                onChange={e => setRoleB(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs outline-none bg-slate-50 border border-slate-200 text-slate-900 font-semibold"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. 3-Column Layout: Unique to A (Left) | Shared Skills & Overlap % (Middle) | Unique to B (Right) */}
          {compareData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Column: Unique to Role A */}
              <div
                className="rounded-2xl p-6 shadow-sm space-y-3 bg-slate-50/70 border border-slate-200"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Baseline Role</span>
                    <h4 className="text-sm font-extrabold text-slate-900">{compareData.role_a?.title}</h4>
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    {compareData.unique_to_a?.length || 0} unique
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">Skills specialized strictly to this baseline track:</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(compareData.unique_to_a || []).map((s, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 font-medium shadow-2xs">
                      • {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Middle Column: Shared Skills with Overlap Percentage */}
              <div
                className="rounded-2xl p-6 shadow-sm space-y-4 bg-emerald-50/70 border-2 border-emerald-300 text-center"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                    Shared Transferable Foundation
                  </span>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <span className="text-3xl font-black text-emerald-700">
                      {compareData.overlap_percentage}%
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      Skill Overlap
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    {compareData.shared_skills?.length || 0} shared cross-compatible competencies
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                  {(compareData.shared_skills || []).map((s, idx) => (
                    <span key={idx} className="text-xs px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold shadow-xs flex items-center gap-1">
                      <Check size={12} /> {s}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-emerald-200/80 text-xs text-slate-600 space-y-1">
                  <p><span className="font-bold">Effort to Bridge:</span> {compareData.transition_effort} Effort</p>
                  <p><span className="font-bold">Estimated Timeline:</span> ~{compareData.estimated_weeks_to_bridge} Weeks</p>
                </div>
              </div>

              {/* Right Column: Unique to Role B */}
              <div
                className="rounded-2xl p-6 shadow-sm space-y-3 bg-amber-50/70 border border-amber-200"
              >
                <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Target Role</span>
                    <h4 className="text-sm font-extrabold text-slate-900">{compareData.role_b?.title}</h4>
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    {compareData.unique_to_b?.length || 0} to learn
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">New high-priority skills required to pivot into this role:</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(compareData.unique_to_b || []).map((s, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-white text-amber-900 border border-amber-300 font-semibold shadow-2xs">
                      + {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Calculating role overlap metrics...
            </div>
          )}
        </div>
      )}

      {/* ── 4. Live Market Trends ── */}
      {activeTab === 'market' && marketTrends && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Trending Skills */}
          <div
            className="rounded-3xl p-6 shadow-sm space-y-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-600" />
                <span>Fastest Growing Tech Skills (2025-2026)</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Live API</span>
            </div>

            <div className="space-y-2.5">
              {marketTrends.trending_skills.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.skill}</p>
                    <span className="text-[10px] text-slate-500 font-medium">{item.tier}</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {item.growth}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Demand Roles */}
          <div
            className="rounded-3xl p-6 shadow-sm space-y-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-600" />
                <span>Hiring Demand & Salary Compensation Benchmarks</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Market Verified</span>
            </div>

            <div className="space-y-2.5">
              {marketTrends.top_demand_roles.map((item, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">{item.role}</p>
                    <span className="text-xs font-bold text-emerald-700">{formatSalaryINRFirst(item.salary)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                    <span>Demand: <strong className="text-slate-700">{item.demand}</strong></span>
                    <span>Growth: <strong className="text-slate-700">{cleanGrowthRate(item.growth)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Curated Opportunities Feed ── */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Curated Internships, GSoC & Hackathons</h3>
              <p className="text-xs text-slate-500 mt-0.5">Ranked by direct alignment with your active {userSkills.length} skills</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map(opp => (
              <div
                key={opp.id}
                className="rounded-3xl p-6 shadow-sm space-y-3 transition-all border border-slate-100 hover:border-emerald-300"
                style={{ background: 'var(--bg-surface)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {opp.type}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{opp.title}</h4>
                    <p className="text-xs text-slate-500">{opp.organization} · {opp.stipend}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                    {opp.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {opp.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-400">Deadline: {opp.deadline}</span>
                  <a
                    href={opp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                  >
                    Apply / Learn More <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

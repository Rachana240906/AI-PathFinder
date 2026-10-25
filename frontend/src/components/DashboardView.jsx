import React, { useState } from 'react';
import {
  Cpu, Code2, BarChart3, Cloud, ShieldCheck, Monitor,
  Server, Smartphone, Link, MessageSquare, Database, Layers,
  Gamepad2, Briefcase, CheckCircle, TrendingUp, ChevronRight,
  UploadCloud, Sparkles, AlertCircle, Search, Flame, Award, BookOpen
} from 'lucide-react';

const iconMap = {
  Cpu, Code2, BarChart3, Cloud, ShieldCheck, Monitor,
  Server, Smartphone, Link, MessageSquare, Database, Layers,
  Gamepad2, Briefcase,
};

export default function DashboardView({
  roles = [],
  selectedRole,
  onSelectRole,
  suitabilityData,
  gapAnalysis,
  userSkills = [],
  verifiedSkills = [],
  loading,
  onAnalyze,
  onGoToResume,
  onGoToRoadmap,
  onGoToProjects,
  onGoToJobMatcher,
  onGoToInterview,
  currentUser,
}) {
  const [domainFilter, setDomainFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const hasSkills = userSkills && userSkills.length > 0;
  
  const scoreMap = {};
  if (hasSkills && suitabilityData?.all_role_evaluations) {
    suitabilityData.all_role_evaluations.forEach(item => {
      scoreMap[item.role_id] = item.match_score;
    });
  }

  const sortedRoles = [...roles].sort((a, b) => {
    if (!hasSkills) return 0;
    return (scoreMap[b.id] ?? 0) - (scoreMap[a.id] ?? 0);
  });

  const filteredRoles = sortedRoles.filter(role => {
    const matchesDomain = domainFilter === 'all' 
      ? true 
      : (domainFilter === 'technical' ? (role.domain === 'technical' || !role.domain) : role.domain === 'non_technical');
    
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = !query || 
      role.title?.toLowerCase().includes(query) || 
      role.category?.toLowerCase().includes(query) ||
      role.domain_label?.toLowerCase().includes(query);
    
    return matchesDomain && matchesQuery;
  });

  const bestFit = hasSkills ? suitabilityData?.best_fit_role_title : null;
  const score = hasSkills ? (gapAnalysis?.match_score ?? (suitabilityData?.best_fit_match_score ?? 68)) : 0;
  const categories = hasSkills ? (gapAnalysis?.category_scores ?? { core: 70, advanced: 50, tools: 60 }) : { core: 0, advanced: 0, tools: 0 };
  const masteredSkills = hasSkills ? (gapAnalysis?.mastered_skills ?? userSkills) : [];
  const missingCore = hasSkills ? (gapAnalysis?.missing_core_skills ?? []) : [];
  const missingAdv = hasSkills ? (gapAnalysis?.missing_advanced_skills ?? []) : [];
  const missingTools = hasSkills ? (gapAnalysis?.missing_tools ?? []) : [];

  // Streak & Gamification
  const streakDays = currentUser?.streak_count || 5;
  const badges = currentUser?.badges || [
    'Profile Activated 🎯',
    'First Analysis 🚀',
    '5 Core Skills Mastered 💡',
    'Streak Master 🔥'
  ];

  // Score History (Day 1 -> Today)
  const scoreHistory = currentUser?.score_history || [
    { date: 'Day 1', score: 35 },
    { date: 'Day 3', score: 48 },
    { date: 'Day 5', score: 62 },
    { date: 'Today', score: score || 75 }
  ];

  // SVG Arc gauge parameters
  const radius = 52;
  const circumference = Math.PI * radius;
  const arcOffset = circumference - (circumference * score) / 100;

  const handleRoleClick = (roleId) => {
    onSelectRole(roleId);
    if (onAnalyze && userSkills.length > 0) {
      onAnalyze(userSkills, roleId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Welcome Hero Banner with Gamification Streak ── */}
      <div
        className="rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-sm"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 90% 40%, rgba(5,150,105,0.08) 0%, transparent 65%)' }}
        />
        
        <div className="flex-1 relative z-10 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Student Career Success Intelligence
            </span>
            {hasSkills ? (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Flame size={13} className="text-amber-500 fill-amber-500" />
                <span>{streakDays}-Day Learning Streak!</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Awaiting Resume
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Welcome, {currentUser?.name || 'Student'} 👋
          </h1>
          <p className="text-xs sm:text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            {hasSkills
              ? `You're tracking readiness for ${roles.find(r => r.id === selectedRole)?.title || 'your target career track'}. Your profile is benchmarked in real-time across industry requirements.`
              : 'Upload your resume to calculate your real-time Readiness Score, benchmark skill gaps, and unlock your personalized 12-week roadmap.'}
          </p>
          
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onGoToResume}
              className="text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm text-white"
              style={{ background: 'var(--accent)' }}
            >
              <UploadCloud size={15} />
              <span>{hasSkills ? 'Manage Resume & Skills' : 'Upload Resume'}</span>
              <ChevronRight size={13} />
            </button>

            {onGoToJobMatcher && (
              <button
                onClick={onGoToJobMatcher}
                className="text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200"
              >
                <Sparkles size={13} className="text-emerald-600" />
                <span>Job Description Matcher</span>
              </button>
            )}

            {onGoToRoadmap && (
              <button
                onClick={onGoToRoadmap}
                className="text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200"
              >
                <BookOpen size={13} className="text-emerald-600" />
                <span>12-Week Roadmap</span>
              </button>
            )}
          </div>
        </div>

        {/* Arc Gauge & Readiness Card */}
        <div className="relative z-10 flex-shrink-0 flex flex-col items-center bg-slate-50 px-6 py-4 rounded-3xl border border-slate-200/80 shadow-2xs">
          <svg width="150" height="90" viewBox="0 0 140 85">
            <path
              d="M 18 74 A 52 52 0 0 1 122 74"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M 18 74 A 52 52 0 0 1 122 74"
              fill="none"
              stroke={score > 0 ? 'var(--accent)' : '#94a3b8'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${arcOffset}`}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
            />
            <text x="70" y="68" textAnchor="middle" fill="var(--text-primary)" fontSize="24" fontWeight="900" fontFamily="Inter, sans-serif">
              {score}%
            </text>
          </svg>
          <p className="text-xs font-bold text-slate-800 mt-1">
            Career Readiness
          </p>
          <p className="text-[10px] text-slate-500 font-medium text-center">
            {hasSkills ? (gapAnalysis?.readiness_tier || 'Calculated') : 'Upload resume to calculate'}
          </p>
        </div>
      </div>

      {/* ── Gamification Badges Strip ── */}
      <div
        className="rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Award size={18} className="text-amber-500" />
          <span className="text-xs font-bold text-slate-800">Earned Gamification Badges:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {badges.map((b, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1 rounded-xl font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1 shadow-2xs"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main Grid: Career Tracks Left (5 cols) | Skill Gap & Score History Right (7 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Role Selection Panel (5 cols) */}
        <div
          className="lg:col-span-5 rounded-3xl overflow-hidden shadow-sm flex flex-col"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div className="px-6 py-4 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2 text-slate-900">
                  <span>Career Tracks</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {roles.length} Roles
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a track to inspect immediate skill gaps
                </p>
              </div>
            </div>

            {/* Domain Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              {[
                { id: 'all', label: `✨ All (${roles.length})` },
                { id: 'technical', label: `💻 Tech (${roles.filter(r => r.domain === 'technical' || !r.domain).length})` },
                { id: 'non_technical', label: `📈 Non-Tech (${roles.filter(r => r.domain === 'non_technical').length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDomainFilter(tab.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                    domainFilter === tab.id
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search e.g. Full Stack, AI, Product Manager..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs outline-none bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Roles List */}
          <div className="divide-y max-h-[460px] overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
            {filteredRoles.map(role => {
              const Icon = iconMap[role.icon] || Code2;
              const isSelected = selectedRole === role.id;
              const matchScore = hasSkills ? (scoreMap[role.id] ?? 0) : 0;
              const isNonTech = role.domain === 'non_technical';

              return (
                <div
                  key={role.id}
                  onClick={() => handleRoleClick(role.id)}
                  className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-all"
                  style={{
                    background: isSelected ? 'rgba(5,150,105,0.08)' : 'transparent',
                    borderLeft: isSelected ? '4px solid var(--accent)' : '4px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                    style={{
                      background: isSelected ? 'var(--accent)' : (isNonTech ? 'rgba(124,58,237,0.1)' : 'var(--bg-card)'),
                      color: isSelected ? '#ffffff' : (isNonTech ? '#7c3aed' : 'var(--text-secondary)'),
                    }}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className="text-xs font-bold truncate"
                        style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}
                      >
                        {role.title}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {role.growth_rate} YoY · {role.demand} Demand
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0"
                    style={{
                      background: hasSkills
                        ? (matchScore >= 70 ? 'rgba(5,150,105,0.12)' : matchScore >= 50 ? 'rgba(234,179,8,0.15)' : 'rgba(0,0,0,0.04)')
                        : 'rgba(0,0,0,0.04)',
                      color: hasSkills
                        ? (matchScore >= 70 ? 'var(--accent)' : matchScore >= 50 ? '#b45309' : 'var(--text-muted)')
                        : 'var(--text-muted)',
                    }}
                  >
                    {hasSkills ? `${matchScore}%` : '0%'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Breakdown & Score History (7 cols - NEVER EMPTY!) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Skill Gap Breakdown Category Bars */}
          <div
            className="rounded-3xl p-6 shadow-sm space-y-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Target Skill Gap Breakdown — {roles.find(r => r.id === selectedRole)?.title || 'Selected Track'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Weighted across Core (55%), Advanced (30%), Tools (15%)</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {score}% Matched
              </span>
            </div>

            <div className="space-y-3.5 pt-1">
              {[
                { label: 'Core Foundations', value: categories.core, color: 'var(--accent)', weight: '55%' },
                { label: 'Advanced Competencies', value: categories.advanced, color: '#0284c7', weight: '30%' },
                { label: 'Tools & DevOps', value: categories.tools, color: '#7c3aed', weight: '15%' },
              ].map(({ label, value, color, weight }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-medium text-slate-700">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">weight {weight}</span>
                      <span className="font-bold text-slate-900">{value}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${value}%`, background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score History Interactive Line Chart */}
          <div
            className="rounded-3xl p-6 shadow-sm space-y-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <span>Readiness Score History & Growth Trajectory</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Tracking score increases as milestones get verified</p>
              </div>
              <span className="text-xs font-bold text-emerald-600">
                +{scoreHistory.length > 1 ? (scoreHistory[scoreHistory.length - 1].score - scoreHistory[0].score) : 40}% Growth
              </span>
            </div>

            {/* SVG Line Chart */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <svg width="100%" height="110" viewBox="0 0 360 90" className="overflow-visible">
                {/* Horizontal gridlines */}
                <line x1="0" y1="20" x2="360" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="360" y2="50" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="360" y2="80" stroke="#e2e8f0" />

                {/* Gradient area */}
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polygon
                  points="20,80 20,55 120,45 220,32 320,18 320,80"
                  fill="url(#scoreGrad)"
                />

                {/* Trajectory Polyline */}
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="20,55 120,45 220,32 320,18"
                />

                {/* Score dots */}
                {[
                  { cx: 20, cy: 55, score: '35%', label: 'Day 1' },
                  { cx: 120, cy: 45, score: '48%', label: 'Day 3' },
                  { cx: 220, cy: 32, score: '62%', label: 'Day 5' },
                  { cx: 320, cy: 18, score: `${score || 75}%`, label: 'Today' }
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.cx} cy={pt.cy} r="5" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
                    <text x={pt.cx} y={pt.cy - 9} textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">
                      {pt.score}
                    </text>
                    <text x={pt.cx} y={88} textAnchor="middle" fill="#64748b" fontSize="9">
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Missing Skills to Bridge Card */}
          <div
            className="rounded-3xl p-6 shadow-sm space-y-3"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertCircle size={15} className="text-amber-600" />
                <span>Highest-Impact Gaps to Bridge</span>
              </h3>
              {onGoToRoadmap && (
                <button
                  onClick={onGoToRoadmap}
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View 12-Week Roadmap <ChevronRight size={13} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {[...missingCore, ...missingAdv, ...missingTools].slice(0, 8).map((s, idx) => {
                const name = typeof s === 'object' ? s.name : s;
                return (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-semibold flex items-center gap-1.5"
                  >
                    + {name}
                  </span>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

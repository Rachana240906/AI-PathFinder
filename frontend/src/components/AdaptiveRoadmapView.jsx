import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Check, Trophy, Clock, Sparkles, Sliders,
  Download, ExternalLink, Calendar, ChevronRight, Zap, Flame,
  CheckCircle2, AlertCircle, Sun, Moon, CalendarDays, CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PHASE_COLORS = ['var(--accent)', '#0284c7', '#7c3aed', '#ea580c'];

const SCHEDULE_STYLES = [
  { id: 'consistent', label: '📅 Daily Consistent', desc: 'Equal study sessions every single day' },
  { id: 'evenings',   label: '🌙 Weekday Evenings', desc: 'Mon–Fri focused, lighter weekends' },
  { id: 'weekends',   label: '⚡ Weekend Sprint',    desc: 'Light weekdays, power study on Sat & Sun' }
];

export default function AdaptiveRoadmapView({
  roadmap,
  userSkills = [],
  selectedRole,
  roles = [],
  onGoToResume,
  onUpdateMilestoneProgress
}) {
  const [hoursPerWeek, setHoursPerWeek] = useState(14);
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [scheduleStyle, setScheduleStyle] = useState('evenings');
  const [localRoadmap, setLocalRoadmap] = useState(roadmap);
  
  // Completed milestone tasks
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('pathfinder_completed_milestones');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Completed daily timetable study blocks (persisted)
  const [dailyCheckins, setDailyCheckins] = useState(() => {
    try {
      const saved = localStorage.getItem('pathfinder_daily_checkins');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roadmap) setLocalRoadmap(roadmap);
  }, [roadmap]);

  useEffect(() => {
    localStorage.setItem('pathfinder_completed_milestones', JSON.stringify(completedTasks));
  }, [completedTasks]);

  useEffect(() => {
    localStorage.setItem('pathfinder_daily_checkins', JSON.stringify(dailyCheckins));
  }, [dailyCheckins]);

  const handleAdaptiveRegenerate = async (newHours = hoursPerWeek, newWeeks = durationWeeks) => {
    setLoading(true);
    try {
      const res = await fetch('/api/roadmap/generate-adaptive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: userSkills,
          target_role_id: selectedRole,
          hours_per_week: newHours,
          duration_weeks: newWeeks
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLocalRoadmap(data.roadmap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (phaseId, idx) => {
    const key = `${phaseId}-${idx}`;
    const next = { ...completedTasks, [key]: !completedTasks[key] };
    setCompletedTasks(next);

    if (!completedTasks[key]) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.75 }
      });
    }

    if (onUpdateMilestoneProgress) {
      onUpdateMilestoneProgress(next);
    }
  };

  const toggleDailyCheckin = (dayKey) => {
    const next = { ...dailyCheckins, [dayKey]: !dailyCheckins[dayKey] };
    setDailyCheckins(next);
    if (!dailyCheckins[dayKey]) {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }
  };

  const currentRoleObj = roles.find(r => r.id === selectedRole) || roles[0];
  const roleTitle = currentRoleObj?.title || 'Selected Career Track';

  // Calculate target job-ready date
  const targetDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (durationWeeks * 7));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [durationWeeks]);

  // Compute 7-day schedule distribution
  const weeklyTimetable = useMemo(() => {
    const days = [
      { key: 'mon', name: 'Monday', short: 'Mon' },
      { key: 'tue', name: 'Tuesday', short: 'Tue' },
      { key: 'wed', name: 'Wednesday', short: 'Wed' },
      { key: 'thu', name: 'Thursday', short: 'Thu' },
      { key: 'fri', name: 'Friday', short: 'Fri' },
      { key: 'sat', name: 'Saturday', short: 'Sat' },
      { key: 'sun', name: 'Sunday', short: 'Sun' },
    ];

    const activeTopics = (localRoadmap?.phases || [])
      .flatMap(p => p.topics || [])
      .slice(0, 7);

    return days.map((day, idx) => {
      let hours = (hoursPerWeek / 7);
      let timeSlot = '7:30 PM – 9:30 PM';

      if (scheduleStyle === 'evenings') {
        if (idx < 5) {
          hours = (hoursPerWeek * 0.8) / 5;
          timeSlot = '7:00 PM – 9:15 PM';
        } else {
          hours = (hoursPerWeek * 0.2) / 2;
          timeSlot = '11:00 AM – 12:30 PM';
        }
      } else if (scheduleStyle === 'weekends') {
        if (idx < 5) {
          hours = (hoursPerWeek * 0.3) / 5;
          timeSlot = '8:30 PM – 9:30 PM';
        } else {
          hours = (hoursPerWeek * 0.7) / 2;
          timeSlot = '10:00 AM – 2:00 PM';
        }
      }

      const focusTopic = activeTopics[idx % Math.max(1, activeTopics.length)] || 'Core Concept Hands-on Practice';
      const isDone = Boolean(dailyCheckins[day.key]);

      return {
        ...day,
        hours: Math.round(hours * 10) / 10,
        timeSlot,
        focusTopic,
        isDone
      };
    });
  }, [hoursPerWeek, scheduleStyle, localRoadmap, dailyCheckins]);

  if (!localRoadmap?.phases) {
    return (
      <div
        className="rounded-3xl p-12 text-center shadow-sm"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <BookOpen size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Adaptive Milestone Roadmap</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Upload your resume in the Resume section so our AI can calculate your skill gaps and generate your customized milestone roadmap.
        </p>
        {onGoToResume && (
          <button
            onClick={onGoToResume}
            className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
            style={{ background: 'var(--accent)' }}
          >
            Go to Resume Upload <ChevronRight size={14} />
          </button>
        )}
      </div>
    );
  }

  // Calculate overall task progress
  let totalTasks = 0;
  let doneTasks = 0;
  localRoadmap.phases.forEach(p => {
    (p.topics || []).forEach((_, i) => {
      totalTasks++;
      if (completedTasks[`${p.phase_id}-${i}`]) doneTasks++;
    });
  });
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Banner Header ── */}
      <div
        className="rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 95% 30%, rgba(5,150,105,0.08) 0%, transparent 65%)' }}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Zap size={13} /> Interactive Gamified Roadmap & Schedule
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Adaptive Career Milestone Roadmap
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Targeting <span className="font-bold text-emerald-600">{roleTitle}</span>. Adjust your weekly study hours to automatically build a daily timetable, tick off learning milestones, and elevate your Readiness Score!
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
            <div className="text-right">
              <p className="text-2xl font-black text-emerald-600">{progressPct}%</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {doneTasks} of {totalTasks} Tasks Completed
              </p>
            </div>
            <button
              onClick={handleExportPDF}
              className="p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 shadow-xs cursor-pointer transition-all"
              title="Export Roadmap as PDF"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Actionable Weekly Study Timetable & Daily Schedule Planner ── */}
      <div
        className="rounded-3xl p-6 sm:p-7 shadow-sm space-y-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {/* Controls & Projection Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          {/* Slider */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock size={15} className="text-emerald-600" />
                <span>Adjust Study Commitment: <strong className="text-emerald-700 text-sm">{hoursPerWeek} hrs/week</strong> (~{(hoursPerWeek / 7).toFixed(1)}h/day)</span>
              </label>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {hoursPerWeek <= 8 ? 'Casual Pace' : hoursPerWeek <= 18 ? 'Balanced Standard' : 'Intensive Sprint'}
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="35"
              step="1"
              value={hoursPerWeek}
              onChange={e => {
                const val = parseInt(e.target.value);
                setHoursPerWeek(val);
                handleAdaptiveRegenerate(val, durationWeeks);
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-semibold text-slate-400">
              <span>4 hrs/wk (Light)</span>
              <span>15 hrs/wk (Recommended)</span>
              <span>35 hrs/wk (Bootcamp)</span>
            </div>
          </div>

          {/* Timeline & Projected Target Date */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Target Pace</span>
              <div className="flex items-center gap-1.5">
                {[
                  { weeks: 6, label: '⚡ 6 Wks' },
                  { weeks: 12, label: '🎯 12 Wks' },
                  { weeks: 24, label: '🏆 24 Wks' },
                ].map(opt => (
                  <button
                    key={opt.weeks}
                    onClick={() => {
                      setDurationWeeks(opt.weeks);
                      handleAdaptiveRegenerate(hoursPerWeek, opt.weeks);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      durationWeeks === opt.weeks
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Job-Ready Date Card */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CalendarDays size={20} className="text-emerald-700" />
              <div>
                <p className="text-[10px] font-bold text-emerald-800 uppercase">Projected Job-Ready</p>
                <p className="text-xs font-black text-emerald-900">{targetDateStr}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Calendar size={16} className="text-emerald-600" />
              Your Actionable Weekly Study Timetable
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live calculated based on your {hoursPerWeek} hrs/week pace. Check off daily study blocks to maintain your streak!
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            {SCHEDULE_STYLES.map(st => (
              <button
                key={st.id}
                onClick={() => setScheduleStyle(st.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  scheduleStyle === st.id
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={st.desc}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* 7-Day Timetable Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-1">
          {weeklyTimetable.map(d => (
            <div
              key={d.key}
              onClick={() => toggleDailyCheckin(d.key)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                d.isDone
                  ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200/90 hover:border-emerald-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">{d.short}</span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                  d.isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {d.hours}h
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <Clock size={10} className="text-emerald-600" /> {d.timeSlot}
                </p>
                <p className="text-[11px] font-semibold text-slate-700 line-clamp-2 leading-snug">
                  {d.focusTopic}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                <span className={d.isDone ? 'text-emerald-700' : 'text-slate-400'}>
                  {d.isDone ? '✓ Completed' : 'Mark Done'}
                </span>
                <CheckSquare size={14} className={d.isDone ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300'} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Phase Cards Grid ── */}
      <div className="space-y-6">
        {localRoadmap.phases.map((phase, pIdx) => {
          const color = PHASE_COLORS[pIdx % PHASE_COLORS.length];
          const phaseDone = (phase.topics || []).filter((_, i) => completedTasks[`${phase.phase_id}-${i}`]).length;
          const phaseTotal = (phase.topics || []).length;
          const isPhaseComplete = phaseTotal > 0 && phaseDone === phaseTotal;

          return (
            <div
              key={phase.phase_id}
              className="rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 transition-all border"
              style={{
                background: 'var(--bg-surface)',
                borderColor: isPhaseComplete ? 'var(--accent)' : 'var(--border)'
              }}
            >
              {/* Phase Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-black px-2.5 py-0.5 rounded-full text-white"
                      style={{ background: color }}
                    >
                      {phase.duration || `Weeks ${pIdx * 3 + 1} - ${pIdx * 3 + 3}`}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Phase {pIdx + 1}</span>
                    {isPhaseComplete && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check size={11} /> Phase Completed!
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {phase.title}
                  </h3>
                  <p className="text-xs text-slate-500">{phase.focus}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-slate-700">
                    {phaseDone} / {phaseTotal} Milestones
                  </span>
                </div>
              </div>

              {/* Milestones Check-off List */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">Weekly Learning Milestones & Actions (Click to tick off):</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {(phase.topics || []).map((topic, tIdx) => {
                    const isDone = Boolean(completedTasks[`${phase.phase_id}-${tIdx}`]);
                    return (
                      <div
                        key={tIdx}
                        onClick={() => toggleTask(phase.phase_id, tIdx)}
                        className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center gap-3 cursor-pointer transition-all ${
                          isDone
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 shadow-2xs'
                            : 'bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-slate-100/80 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isDone && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className={`flex-1 ${isDone ? 'line-through text-slate-500' : ''}`}>
                          {topic}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Milestone Project Card */}
              {phase.project_milestone && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Trophy size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cap-Stone Project Target</span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{phase.project_milestone}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

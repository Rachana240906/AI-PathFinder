import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, FileText, X, Plus, Check, ChevronRight,
  BookOpen, Cpu, Sparkles, History, Trash2, RotateCcw, Clock,
  CheckCircle2, ShieldCheck, AlertCircle, ArrowRight, Printer, Download
} from 'lucide-react';

const PRESETS = [
  { key: 'rachana',   label: 'Rachana — AI/ML',          role: 'AI / ML Engineer',      domain: 'Technical' },
  { key: 'fullstack', label: 'Aditya — Full Stack',       role: 'Full Stack Developer',  domain: 'Technical' },
  { key: 'priya',     label: 'Priya — Product Manager',   role: 'Product Manager',       domain: 'Product' },
  { key: 'sneha',     label: 'Sneha — Business Analyst',  role: 'Business Analyst',      domain: 'Business' },
  { key: 'cyber',     label: 'Karan — Cybersecurity',     role: 'Security Specialist',   domain: 'Technical' },
];

const HISTORY_KEY = 'pathfinder_resume_history';

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}

function saveHistory(items) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 10))); } catch {}
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function ResumeView({
  profile,
  setProfile,
  userSkills = [],
  setUserSkills,
  verifiedSkills = [],
  onAnalyze,
  loading,
  onLoadPreset,
  onGoToQuizzes,
  onGoToRoadmap
}) {
  const [dragActive, setDragActive] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [pasteMode, setPasteMode] = useState(false);
  const [rawText, setRawText] = useState('');
  const [resumeHistory, setResumeHistory] = useState(loadHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [atsFeedback, setAtsFeedback] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Persist history to localStorage
  useEffect(() => { saveHistory(resumeHistory); }, [resumeHistory]);

  // Run ATS audit when profile changes
  const runAtsAudit = async (text = rawText) => {
    setAtsLoading(true);
    try {
      const projText = Array.isArray(profile?.projects)
        ? profile.projects.map(p => typeof p === 'object' ? `${p.title || ''} ${p.description || ''}` : String(p)).join('\n')
        : '';
      const res = await fetch('/api/resume/ats-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: text || projText + '\n' + (userSkills || []).join(', '),
          profile: profile
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAtsFeedback(data);
      }
    } catch {
      // fallback
    } finally {
      setAtsLoading(false);
    }
  };

  useEffect(() => {
    if (userSkills.length > 0) {
      runAtsAudit();
    }
  }, [userSkills.length]);

  const addToHistory = (parsedData, sourceLabel) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      source: sourceLabel,
      name: parsedData?.contact?.name || 'Unknown Candidate',
      skillCount: (parsedData?.extracted_skills || []).length,
      profile: parsedData,
      skills: parsedData?.extracted_skills || [],
    };
    setResumeHistory(prev => [entry, ...prev]);
  };

  const restoreHistory = (entry) => {
    setProfile(entry.profile);
    setUserSkills(entry.skills);
    onAnalyze(entry.skills);
    setShowHistory(false);
  };

  const deleteHistory = (id) => {
    setResumeHistory(prev => prev.filter(e => e.id !== id));
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleFileUpload = async (file) => {
    if (uploadedFileUrl) URL.revokeObjectURL(uploadedFileUrl);
    const fileUrl = URL.createObjectURL(file);
    setUploadedFileUrl(fileUrl);
    setShowPdfViewer(false);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('/api/resume/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.status === 'success') {
        setProfile(data.data);
        setUserSkills(data.data.extracted_skills || []);
        onAnalyze(data.data.extracted_skills || []);
        addToHistory(data.data, file.name || 'Uploaded PDF');
        runAtsAudit(file.name);
      }
    } catch {
      onLoadPreset('rachana');
    }
  };

  const handleTextSubmit = async () => {
    if (!rawText.trim()) return;
    try {
      const res = await fetch('/api/resume/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.status === 'success') {
        setProfile(data.data);
        setUserSkills(data.data.extracted_skills || []);
        onAnalyze(data.data.extracted_skills || []);
        addToHistory(data.data, 'Pasted Text');
        runAtsAudit(rawText);
        setPasteMode(false);
      }
    } catch { /* silent */ }
  };

  const addSkill = (e) => {
    e.preventDefault();
    const s = newSkill.trim();
    if (s && !userSkills.includes(s)) {
      const updated = [...userSkills, s];
      setUserSkills(updated);
      onAnalyze(updated);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    const updated = userSkills.filter(s => s !== skillToRemove);
    setUserSkills(updated);
    onAnalyze(updated);
  };

  const contact = profile?.contact || {};
  const education = profile?.education || [];
  const projects = profile?.projects || [];
  const profileScore = profile?.profile_strength_score || 0;

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Upload & Parsed Profile Top Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upload / Paste Panel */}
        <div
          className="rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Resume Parser & Uploader</h2>
              <p className="text-xs text-slate-500 mt-0.5">PDF and direct text parsing supported</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Toggle PDF / Paste */}
            <div className="flex rounded-2xl overflow-hidden p-1 bg-slate-100">
              {[{ label: '📄 Upload PDF', value: false }, { label: '✍️ Paste Text', value: true }].map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => setPasteMode(opt.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    pasteMode === opt.value
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {pasteMode ? (
              <div className="space-y-3">
                <textarea
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder="Paste your full resume text here (Education, Experience, Projects, Skills)…"
                  rows={7}
                  className="w-full p-4 rounded-2xl text-xs outline-none bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 transition-all resize-none leading-relaxed"
                />
                <button
                  onClick={handleTextSubmit}
                  className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  Parse Resume Text <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                style={{
                  borderColor: dragActive ? 'var(--accent)' : 'var(--border)',
                  background: dragActive ? 'var(--accent-dim)' : 'var(--bg-card)',
                }}
                onDragEnter={handleDrag} onDragLeave={handleDrag}
                onDragOver={handleDrag} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-xs text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  <Upload size={22} />
                </div>
                <p className="text-sm font-bold text-slate-800 mb-1">
                  Drop your PDF resume here
                </p>
                <p className="text-xs text-slate-400">
                  or click to browse files · PDF format supported
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </div>
            )}

            {/* Presets */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Demo Student Profiles
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map(p => (
                  <button
                    key={p.key}
                    onClick={() => onLoadPreset(p.key)}
                    className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Parsed Profile Card */}
        <div
          className="rounded-3xl overflow-hidden shadow-sm flex flex-col"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Extracted Candidate Details</h2>
              <p className="text-xs text-slate-500 mt-0.5">Parsed candidate metadata and sections</p>
            </div>
            <div className="flex items-center gap-2">
              {uploadedFileUrl && (
                <button
                  onClick={() => setShowPdfViewer(v => !v)}
                  className="text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <FileText size={13} />
                  {showPdfViewer ? 'Hide PDF' : 'View PDF'}
                </button>
              )}
              <div className="text-center px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-base font-black text-emerald-700 leading-none">
                  {userSkills.length > 0 ? profileScore : 0}%
                </p>
                <p className="text-[9px] font-bold text-emerald-600 mt-0.5">Profile Strength</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 flex-1">
            {contact.name || userSkills.length > 0 ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-xs">
                    {contact.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{contact.name || 'Candidate'}</p>
                    {contact.email && <p className="text-xs text-slate-500">{contact.email}</p>}
                  </div>
                </div>

                {education.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Education</p>
                    {education.slice(0, 2).map((ed, i) => (
                      <div key={i} className="text-xs py-1 flex items-start gap-2 text-slate-700">
                        <BookOpen size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                        <span>{typeof ed === 'object' ? (ed.degree_or_institution || ed.degree || ed.college || 'Education') : String(ed)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {projects.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Projects</p>
                    {projects.slice(0, 2).map((p, i) => (
                      <div key={i} className="text-xs py-1 flex items-start gap-2 text-slate-700">
                        <Cpu size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{typeof p === 'object' ? (p.title || p.name || p.description || 'Project') : String(p)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <FileText size={32} className="text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-700">No Profile Extracted Yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                  Upload a PDF resume or click any demo student profile to view extracted skills and metrics.
                </p>
              </div>
            )}

            {showPdfViewer && uploadedFileUrl && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <iframe src={uploadedFileUrl} title="Resume PDF" className="w-full h-80 rounded-2xl border border-slate-200" />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── ATS Score & Weak Bullet Points Rewriter ── */}
      {atsFeedback && (
        <div
          className="rounded-3xl p-6 sm:p-7 shadow-sm space-y-6"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          {/* Header & Score Gauge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ATS Scanner Engine
                </span>
                <span className="text-xs font-bold text-slate-600">
                  Status: <strong>{atsFeedback.verdict}</strong>
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Applicant Tracking System (ATS) Friendliness Audit
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Analyzed for keyword indexing, active verb density, quantifiable metrics, and section structure.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-3xl font-black text-emerald-600">{atsFeedback.ats_score}/100</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">ATS Score</p>
              </div>
              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${atsFeedback.ats_score}%` }} />
              </div>
            </div>
          </div>

          {/* Section Completeness Checklist */}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-2.5">Section Completeness Verification:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {Object.entries(atsFeedback.sections_detected || {}).map(([sec, present]) => (
                <div
                  key={sec}
                  className={`p-2.5 rounded-xl border text-center text-[11px] font-semibold flex items-center justify-center gap-1.5 ${
                    present
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  {present ? <Check size={12} className="text-emerald-600" /> : <X size={12} />}
                  <span className="truncate">{sec.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Bullet Points AI Rewrites */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-600" />
              <span>AI Weak Bullet Point Upgrades (Before vs After):</span>
            </h4>

            <div className="space-y-3">
              {(atsFeedback.rewrite_suggestions || []).map((rw, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-slate-600">
                    <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px] shrink-0 mt-0.5">
                      Before (Weak)
                    </span>
                    <span className="line-through">{rw.original}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-900 font-medium">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0 mt-0.5">
                      AI Upgraded
                    </span>
                    <span className="text-emerald-950 font-semibold">{rw.suggested}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1">
                    <strong className="text-slate-700">Reason:</strong> {rw.critique}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Active Skills & Verification Card ── */}
      <div
        className="rounded-3xl p-6 sm:p-7 shadow-sm space-y-5"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Active Skills ({userSkills.length}) — Claimed vs Verified
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified skills carry +15% higher weight in your Readiness Score. Click "Verify with Quiz" to prove proficiency.
            </p>
          </div>
          {onGoToQuizzes && (
            <button
              onClick={onGoToQuizzes}
              className="text-xs px-3.5 py-2 rounded-xl font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck size={14} /> Open Skill Verification Center
            </button>
          )}
        </div>

        {/* Skill Badges */}
        <div className="flex flex-wrap gap-2">
          {userSkills.map((skill, i) => {
            const isVerified = verifiedSkills.some(v => v.toLowerCase() === skill.toLowerCase());
            return (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isVerified
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {isVerified ? (
                  <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                ) : (
                  <Check size={12} className="text-slate-400 shrink-0" />
                )}
                <span>{skill}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  isVerified ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isVerified ? 'Verified' : 'Claimed'}
                </span>
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-slate-400 hover:text-red-600 cursor-pointer ml-1"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add Skill Form */}
        <form onSubmit={addSkill} className="flex gap-2 max-w-md pt-2">
          <input
            type="text"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            placeholder="Add a new skill (e.g., Docker, PyTorch, Figma)..."
            className="flex-1 px-4 py-2 rounded-xl text-xs outline-none bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer flex items-center gap-1"
          >
            <Plus size={13} /> Add
          </button>
        </form>
      </div>

    </div>
  );
}

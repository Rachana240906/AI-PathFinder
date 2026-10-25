import React, { useState } from 'react';
import {
  Briefcase, Search, Sparkles, CheckCircle2, AlertCircle,
  ArrowRight, Copy, Check, TrendingUp, FileText, Zap, ChevronRight
} from 'lucide-react';

export default function JobMatcherView({
  userSkills = [],
  selectedRole,
  roles = [],
  onGoToResume,
  onGoToRoadmap
}) {
  const [jdText, setJdText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Demo job posting presets for quick testing
  const DEMO_JDS = [
    {
      title: 'Junior Machine Learning Engineer',
      company: 'OpenTech Labs',
      text: `We are looking for an ML Engineer to build production deep learning and NLP services.
Requirements:
- Strong proficiency in Python, PyTorch or TensorFlow, and Scikit-Learn.
- Experience with FastAPI or Flask to deploy machine learning models.
- Familiarity with Docker containerization, SQL databases (PostgreSQL), and Git version control.
- Knowledge of Data Preprocessing with Pandas and NumPy.
- Understanding of Cloud platforms (AWS or GCP) and CI/CD pipelines is a plus.`
    },
    {
      title: 'Full Stack Web Developer',
      company: 'ScaleVelocity Inc',
      text: `ScaleVelocity is hiring a Full Stack Developer to build customer-facing web applications.
Requirements:
- 1+ years building responsive SPAs with React.js, TypeScript, and modern CSS/Tailwind.
- Strong backend experience with Node.js, Express.js, and REST APIs.
- Experience with relational (PostgreSQL) or NoSQL (MongoDB) databases.
- Familiarity with Git, automated unit testing, Docker, and cloud deployments on AWS or Render.
- Excellent communication and Agile/Scrum team collaboration.`
    },
    {
      title: 'Associate Product Manager',
      company: 'FinTrack Global',
      text: `Looking for an APM to drive growth and product roadmap execution.
Requirements:
- Proven experience in Product Management, PRD writing, and user research.
- Ability to analyze user metrics using SQL, Advanced Excel, or Tableau/Power BI.
- Experience with Agile/Scrum sprint planning, Jira, and cross-functional engineering leadership.
- Basic understanding of API workflows and system architecture.
- Wireframing and prototyping with Figma.`
    }
  ];

  const handleMatch = async (textToMatch = jdText) => {
    if (!textToMatch.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/match-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jd_text: textToMatch,
          user_skills: userSkills,
          target_role_id: selectedRole
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMatchResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset) => {
    setJobTitle(preset.title);
    setCompanyName(preset.company);
    setJdText(preset.text);
    handleMatch(preset.text);
  };

  const copyTips = () => {
    if (!matchResult) return;
    const content = `ATS Keywords to Add:\n${matchResult.ats_recommendations.join('\n')}\n\nTailoring Tips:\n${matchResult.resume_tailoring_tips.join('\n')}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const score = matchResult ? matchResult.match_score : 0;

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
              <Sparkles size={13} /> Practical Application Matcher
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Job Description Matcher & Gap Radar
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Paste any real job posting or internship description from LinkedIn, Indeed, or company careers pages.
              Our semantic gap engine benchmarks your current profile against that exact posting in seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1">Try preset:</span>
            {DEMO_JDS.map((p, i) => (
              <button
                key={i}
                onClick={() => loadPreset(p)}
                className="text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-transparent text-slate-700"
              >
                {p.title.split(' ')[0]} {p.title.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Layout: Input Left | Match Results Right ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Job Description Input */}
        <div
          className="lg:col-span-5 rounded-3xl p-6 shadow-sm flex flex-col space-y-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <FileText size={16} className="text-emerald-600" />
              <span>Paste Job Description</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              {userSkills.length} active skills loaded
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Job Title (e.g. SDE-1)"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs outline-none bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <input
              type="text"
              placeholder="Company (e.g. Google, Stripe)"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs outline-none bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <textarea
            rows={12}
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            placeholder="Paste the full job requirements or qualifications here (e.g. 'Must have experience with Python, FastAPI, Docker, and PostgreSQL...')..."
            className="w-full p-4 rounded-2xl text-xs outline-none bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none leading-relaxed"
          />

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => handleMatch()}
              disabled={loading || !jdText.trim()}
              className="flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-opacity cursor-pointer shadow-sm text-white"
              style={{
                background: !jdText.trim() ? '#94a3b8' : 'var(--accent)',
                cursor: loading ? 'wait' : (!jdText.trim() ? 'not-allowed' : 'pointer')
              }}
            >
              {loading ? (
                <span>Analyzing JD Requirements…</span>
              ) : (
                <>
                  <Zap size={14} /> Compare Against My Skills
                </>
              )}
            </button>
            {jdText && (
              <button
                onClick={() => { setJdText(''); setMatchResult(null); }}
                className="px-3 py-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Comparative Evaluation */}
        <div className="lg:col-span-7 space-y-6">

          {!matchResult ? (
            <div
              className="rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center h-full min-h-[380px]"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-200">
                <Briefcase size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Awaiting Job Description</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Paste a job posting on the left or click any preset to see your real-time Match Score %, Matched Skills, and ATS Resume Tailoring Tips.
              </p>
            </div>
          ) : (
            <>
              {/* Match Score Banner */}
              <div
                className="rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {jobTitle || 'Target Posting'} {companyName ? `at ${companyName}` : ''}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    JD Match Score: <span className="text-emerald-600">{score}%</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {matchResult.matched_skills.length} matched out of {matchResult.total_extracted_requirements} key requirements
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 text-right">
                    <span className="text-xs font-bold text-slate-700">
                      {score >= 75 ? '🔥 High Match' : score >= 50 ? '⚡ Good Match' : '📚 Gap to Bridge'}
                    </span>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${score}%`,
                          background: score >= 75 ? 'var(--accent)' : score >= 50 ? '#0284c7' : '#ea580c'
                        }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={copyTips}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 text-slate-600 hover:text-emerald-700 transition-all cursor-pointer"
                    title="Copy tailored advice"
                  >
                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Matched vs Missing Skills breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Matched Skills */}
                <div
                  className="rounded-3xl p-5 shadow-sm space-y-3"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" /> Matched Skills
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                      {matchResult.matched_skills.length}
                    </span>
                  </div>
                  {matchResult.matched_skills.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3">No skills matched directly with this posting.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.matched_skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"
                        >
                          <Check size={10} className="text-emerald-600" /> {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Missing Skills */}
                <div
                  className="rounded-3xl p-5 shadow-sm space-y-3"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <AlertCircle size={14} className="text-amber-600" /> Missing from Resume
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                      {matchResult.missing_skills.length}
                    </span>
                  </div>
                  {matchResult.missing_skills.length === 0 ? (
                    <p className="text-xs text-emerald-600 py-3 font-semibold">
                      🎉 Outstanding! Your resume covers all extracted requirements.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.missing_skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200"
                        >
                          + {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tailoring Recommendations & ATS Checklist */}
              <div
                className="rounded-3xl p-6 shadow-sm space-y-4"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-600" />
                    <span>How to Tailor Your Resume for this Job</span>
                  </h3>
                  <button
                    onClick={copyTips}
                    className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    {copied ? 'Copied!' : 'Copy Recommendations'}
                  </button>
                </div>

                <div className="space-y-2.5">
                  {matchResult.resume_tailoring_tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>

                {matchResult.missing_skills.length > 0 && onGoToRoadmap && (
                  <div className="pt-2">
                    <button
                      onClick={onGoToRoadmap}
                      className="text-xs px-4 py-2 rounded-xl font-bold inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Bridge these skills in your 12-Week Roadmap <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

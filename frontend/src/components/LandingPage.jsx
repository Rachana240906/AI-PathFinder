import React, { useState } from 'react';
import {
  Compass, ArrowRight, Eye, EyeOff,
  Lock, Mail, User, Sparkles
} from 'lucide-react';

const TECH_ROLES = [
  { id: 'ai_ml_engineer',        label: 'AI / Machine Learning Engineer' },
  { id: 'full_stack_developer',  label: 'Full Stack Web Developer' },
  { id: 'data_scientist',        label: 'Data Scientist / Analytics Lead' },
  { id: 'cloud_devops_engineer', label: 'Cloud & DevOps Engineer' },
  { id: 'cybersecurity_analyst', label: 'Cybersecurity & AppSec Specialist' },
  { id: 'frontend_engineer',     label: 'Frontend / UI Engineer' },
  { id: 'backend_engineer',      label: 'Backend & Distributed Systems' },
  { id: 'data_engineer',         label: 'Data Engineer & Pipeline Architect' },
  { id: 'ml_ops_engineer',       label: 'MLOps & AI Platform Engineer' },
  { id: 'mobile_developer',      label: 'Mobile App Developer (iOS/Android)' },
  { id: 'blockchain_engineer',   label: 'Blockchain & Web3 Engineer' },
  { id: 'site_reliability_engineer', label: 'Site Reliability Engineer (SRE)' },
];

const NON_TECH_ROLES = [
  { id: 'product_manager',       label: 'Technical Product Manager / APM' },
  { id: 'ui_ux_designer',        label: 'UI/UX & Product Designer' },
  { id: 'business_analyst',      label: 'Business Analyst & Operations Lead' },
  { id: 'financial_analyst',     label: 'Financial Analyst & Quantitative Modeler' },
  { id: 'digital_marketer',      label: 'Digital Marketing & Growth Strategist' },
  { id: 'content_seo_strategist', label: 'Content Strategy & SEO Specialist' },
  { id: 'management_consultant', label: 'Management & Strategy Consultant' },
  { id: 'scrum_project_manager', label: 'Agile Project Manager & Scrum Master' },
  { id: 'sales_bd_specialist',   label: 'Business Development & Tech Sales' },
  { id: 'hr_talent_specialist',  label: 'Tech Talent Acquisition & HR Specialist' },
  { id: 'technical_writer',      label: 'Technical Writer & Documentation Lead' },
  { id: 'customer_success_manager', label: 'Customer Success & Client Solutions' },
];

export default function LandingPage({ onLogin, onRegister, backendStatus }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [targetRole, setTargetRole] = useState('ai_ml_engineer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('Email and password are required.'); return; }
    if (isSignUp && !name.trim()) { setError('Please enter your name.'); return; }
    if (isSignUp && password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      if (isSignUp) await onRegister({ name, email, password, target_role: targetRole });
      else await onLogin({ email, password });
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white relative overflow-hidden font-sans select-none">

      {/* ── Ambient Background Glow ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-60 -left-60 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-60 -right-60 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-600/8 rounded-full blur-[160px]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* ── Logo + Brand ── */}
      <div className="relative z-10 flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-5">
          <Compass className="w-8 h-8 text-slate-950" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          PathFinder AI
        </h1>
        <p className="text-sm text-slate-400 mt-1.5 font-medium">
          Your AI-Powered Career Navigator
        </p>
      </div>

      {/* ── Auth Card ── */}
      <div className="relative z-10 w-full max-w-[420px] mx-4">
        <div className="bg-slate-800/80 backdrop-blur-2xl border border-slate-700/60 p-8 rounded-3xl shadow-2xl shadow-black/20 space-y-6 relative overflow-hidden">
          {/* Subtle card top glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center relative">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isSignUp ? 'Sign up to start your career journey.' : 'Sign in to continue where you left off.'}
            </p>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative">
            {isSignUp && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-900/70 border border-slate-600/60 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-900/70 border border-slate-600/60 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-slate-900/70 border border-slate-600/60 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Target Dream Role</label>
                <select
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-900/70 border border-slate-600/60 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                >
                  <optgroup label="💻 Technical Career Tracks">
                    {TECH_ROLES.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="📈 Non-Technical & Business Tracks">
                    {NON_TECH_ROLES.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold tracking-wide text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all cursor-pointer shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>

      {/* ── Subtle Footer ── */}
      <p className="relative z-10 text-[11px] text-slate-600 mt-8">
        © 2026 PathFinder AI · Team Twix · SVNIT Surat
      </p>
    </div>
  );
}

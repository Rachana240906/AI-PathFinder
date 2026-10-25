import React, { useState, useEffect } from 'react';
import {
  User, Mail, Briefcase, Target, Edit3, Save, X, CheckCircle2,
  AlertCircle, Shield, Calendar, Sparkles, ChevronRight, Phone,
  Globe, Link2
} from 'lucide-react';

const ROLE_LABELS = {
  ai_ml_engineer: 'AI / Machine Learning Engineer',
  full_stack_developer: 'Full Stack Web Developer',
  data_scientist: 'Data Scientist / Analytics Lead',
  cloud_devops_engineer: 'Cloud & DevOps Engineer',
  cybersecurity_analyst: 'Cybersecurity & AppSec Specialist',
  frontend_engineer: 'Frontend / UI Engineer',
  backend_engineer: 'Backend & Distributed Systems Engineer',
  data_engineer: 'Data Engineer & Pipeline Architect',
  ml_ops_engineer: 'MLOps & AI Platform Engineer',
  mobile_developer: 'Mobile App Developer',
  blockchain_engineer: 'Blockchain & Web3 Engineer',
  site_reliability_engineer: 'Site Reliability Engineer (SRE)',
  product_manager: 'Technical Product Manager',
  ui_ux_designer: 'UI/UX & Product Designer',
  business_analyst: 'Business Analyst & Operations Lead',
  financial_analyst: 'Financial Analyst',
  digital_marketer: 'Digital Marketing Strategist',
  content_seo_strategist: 'Content Strategy & SEO Specialist',
  management_consultant: 'Management Consultant',
  scrum_project_manager: 'Agile Project Manager',
  sales_bd_specialist: 'Business Development Exec',
  hr_talent_specialist: 'Tech Talent Acquisition',
  technical_writer: 'Technical Writer',
  customer_success_manager: 'Customer Success Lead',
};

function getProfileKey(email) {
  return email ? `pathfinder_account_profile_${email}` : 'pathfinder_account_profile';
}

function loadSavedProfile(email) {
  try {
    const key = getProfileKey(email);
    const data = localStorage.getItem(key) || localStorage.getItem('pathfinder_account_profile');
    return JSON.parse(data || '{}');
  } catch { return {}; }
}

function saveSavedProfile(email, data) {
  try {
    const key = getProfileKey(email);
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem('pathfinder_account_profile', JSON.stringify(data));
  } catch {}
}

export default function MyAccountView({ currentUser, userSkills, onUpdateUser }) {
  const savedExtra = loadSavedProfile(currentUser?.email);

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(savedExtra.phone || '');
  const [linkedin, setLinkedin] = useState(savedExtra.linkedin || '');
  const [github, setGithub] = useState(savedExtra.github || '');
  const [bio, setBio] = useState(savedExtra.bio || '');
  const [college, setCollege] = useState(savedExtra.college || '');
  const [degree, setDegree] = useState(savedExtra.degree || '');
  const [graduationYear, setGraduationYear] = useState(savedExtra.graduationYear || '');

  // Keep displayName synced if currentUser changes (e.g. on background reload sync)
  useEffect(() => {
    if (currentUser?.name) {
      setDisplayName(currentUser.name);
    }
  }, [currentUser?.name]);

  // Calculate profile completeness
  const fields = [
    displayName || currentUser?.name,
    currentUser?.email,
    phone,
    linkedin,
    github,
    bio,
    college,
    degree,
    graduationYear,
    userSkills?.length > 0 ? 'has_skills' : '',
  ];
  const filledCount = fields.filter(f => f && f.trim && f.trim() !== '').length;
  const completeness = Math.round((filledCount / fields.length) * 100);

  const missingFields = [];
  if (!phone) missingFields.push('Phone Number');
  if (!linkedin) missingFields.push('LinkedIn URL');
  if (!github) missingFields.push('GitHub URL');
  if (!bio) missingFields.push('Short Bio');
  if (!college) missingFields.push('College / University');
  if (!degree) missingFields.push('Degree');
  if (!graduationYear) missingFields.push('Graduation Year');
  if (!userSkills || userSkills.length === 0) missingFields.push('Skills (upload a resume)');

  const handleSave = async () => {
    const profileData = { phone, linkedin, github, bio, college, degree, graduationYear };
    saveSavedProfile(currentUser?.email, profileData);

    const updatedUser = { ...currentUser, name: displayName.trim() || currentUser?.name };
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    if (currentUser?.email) {
      try {
        const res = await fetch('/api/auth/update-gamification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: currentUser.email,
            name: displayName.trim() || currentUser?.name
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user && onUpdateUser) {
            onUpdateUser(data.user);
          }
        }
      } catch (err) {
        console.error('Failed to sync name to backend:', err);
      }
    }

    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => {
    const s = loadSavedProfile(currentUser?.email);
    setDisplayName(currentUser?.name || '');
    setPhone(s.phone || '');
    setLinkedin(s.linkedin || '');
    setGithub(s.github || '');
    setBio(s.bio || '');
    setCollege(s.college || '');
    setDegree(s.degree || '');
    setGraduationYear(s.graduationYear || '');
    setEditing(false);
  };

  const inputClass = editing
    ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40'
    : 'bg-slate-50 border-slate-200 text-slate-700 cursor-default';

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>My Account</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Manage your profile information
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 size={13} />
              Saved
            </span>
          )}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Edit3 size={13} />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <X size={13} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Save size={13} />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Profile Completeness Banner ── */}
      {completeness < 100 && (
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/70 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
            <AlertCircle size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Complete Your Profile</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Your profile is {completeness}% complete. Add the missing information to get better career recommendations.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {missingFields.map((f, i) => (
                <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-black text-amber-600">{completeness}%</div>
            <div className="w-16 h-1.5 rounded-full bg-amber-200 mt-1 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-700"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {completeness >= 100 && (
        <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">Profile Complete!</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Great job! Your profile is fully set up for the best career insights.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main Profile Info ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Info Card */}
          <div className="rounded-2xl border p-6 space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2 mb-1">
              <User size={16} style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  readOnly={!editing}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputClass}`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={currentUser?.email || ''}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none bg-slate-50 border-slate-200 text-slate-500 cursor-default"
                  />
                  <Shield size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" title="Email cannot be changed" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  readOnly={!editing}
                  placeholder={editing ? '+91 98765 43210' : 'Not provided'}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputClass}`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Short Bio</label>
                <input
                  type="text"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  readOnly={!editing}
                  placeholder={editing ? 'AI enthusiast & developer' : 'Not provided'}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputClass}`}
                />
              </div>
            </div>
          </div>

          {/* Education Card */}
          <div className="rounded-2xl border p-6 space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase size={16} style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Education</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>College / University</label>
                <input
                  type="text"
                  value={college}
                  onChange={e => setCollege(e.target.value)}
                  readOnly={!editing}
                  placeholder={editing ? 'e.g. SVNIT Surat' : 'Not provided'}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputClass}`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Degree</label>
                <input
                  type="text"
                  value={degree}
                  onChange={e => setDegree(e.target.value)}
                  readOnly={!editing}
                  placeholder={editing ? 'e.g. BTech AI' : 'Not provided'}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputClass}`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Graduation Year</label>
                <input
                  type="text"
                  value={graduationYear}
                  onChange={e => setGraduationYear(e.target.value)}
                  readOnly={!editing}
                  placeholder={editing ? 'e.g. 2028' : 'Not provided'}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputClass}`}
                />
              </div>
            </div>
          </div>

          {/* Social Links Card */}
          <div className="rounded-2xl border p-6 space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Globe size={16} style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Social & Professional Links</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>LinkedIn Profile</label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={e => setLinkedin(e.target.value)}
                  readOnly={!editing}
                  placeholder={editing ? 'https://linkedin.com/in/yourname' : 'Not provided'}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputClass}`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>GitHub Profile</label>
                <input
                  type="url"
                  value={github}
                  onChange={e => setGithub(e.target.value)}
                  readOnly={!editing}
                  placeholder={editing ? 'https://github.com/yourname' : 'Not provided'}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputClass}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-5">

          {/* Profile Card */}
          <div className="rounded-2xl border p-6 text-center space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto shadow-lg"
              style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-accent)' }}
            >
              {(currentUser?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                {currentUser?.name || 'User'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {currentUser?.email || ''}
              </p>
            </div>
            <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                Target Role
              </p>
              <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                {ROLE_LABELS[currentUser?.target_role] || currentUser?.target_role || 'Not set'}
              </p>
            </div>
          </div>

          {/* Skills Summary */}
          <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Skills</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                {userSkills?.length || 0} total
              </span>
            </div>

            {userSkills && userSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {userSkills.slice(0, 12).map((skill, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    {skill}
                  </span>
                ))}
                {userSkills.length > 12 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    +{userSkills.length - 12} more
                  </span>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-card)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>No skills yet</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Upload your resume to extract skills
                </p>
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Account Details</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Member Since</span>
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {currentUser?.created_at
                    ? new Date(currentUser.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Today'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Profile Status</span>
                <span className={`font-bold ${completeness >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {completeness >= 100 ? 'Complete' : `${completeness}% Complete`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Skills Count</span>
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {userSkills?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

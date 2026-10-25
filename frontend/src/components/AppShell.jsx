import React, { useState } from 'react';
import {
  LayoutDashboard, FileText, FolderGit2, UserCircle, Compass, LogOut,
  BookOpenCheck, BookOpen, Briefcase, MessageSquareCode, Bot, Sparkles,
  Sun, Moon, Share2, Check
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',               icon: LayoutDashboard },
  { id: 'resume',       label: 'Resume & ATS',            icon: FileText },
  { id: 'roadmap',      label: 'Adaptive Roadmap',        icon: BookOpen },
  { id: 'job_matcher',  label: 'Job Matcher',             icon: Briefcase },
  { id: 'interview',    label: 'Interview & Quizzes',     icon: MessageSquareCode },
  { id: 'career_radar', label: 'Career Radar',            icon: Compass },
  { id: 'projects',     label: 'Recommended Projects',    icon: FolderGit2 },
  { id: 'account',      label: 'My Account',              icon: UserCircle },
];

export default function AppShell({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenPitch,
  onOpenMentorChat,
  children
}) {
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShareProfile = () => {
    const url = window.location.origin + `?candidate=${encodeURIComponent(currentUser?.name || 'student')}`;
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>

      {/* ── Sidebar ── */}
      <aside
        className="sidebar flex-shrink-0 flex flex-col border-r h-full z-30 relative shadow-xs"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 cursor-pointer"
          style={{ height: 'var(--header-height)', borderBottom: '1px solid var(--border)' }}
          onClick={() => setActiveTab('dashboard')}
        >
          <div
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-xs text-white"
            style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-accent)' }}
          >
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="sidebar-label font-black text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
            PathFinder AI
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;

            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative cursor-pointer"
                style={{
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full"
                    style={{ background: 'var(--accent)' }}
                  />
                )}
                <Icon className="flex-shrink-0 w-4.5 h-4.5" size={18} />
                <span className="sidebar-label text-xs font-bold">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Instructions & User Footer */}
        <div className="px-2 pb-3 space-y-1" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <button
            onClick={onOpenMentorChat}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer bg-emerald-50 text-emerald-800 border border-emerald-200"
          >
            <Bot size={18} className="flex-shrink-0 text-emerald-600" />
            <span className="sidebar-label text-xs font-bold">AI Career Mentor</span>
          </button>

          <button
            onClick={onOpenPitch}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <BookOpenCheck size={18} className="flex-shrink-0" />
            <span className="sidebar-label text-xs font-bold">Instructions</span>
          </button>

          {currentUser && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs"
                style={{ background: 'var(--accent)' }}
              >
                {currentUser.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="sidebar-label flex-1 min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {currentUser.name}
                </p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {currentUser.email}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="sidebar-label flex-shrink-0 p-1 rounded transition-colors cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-6 shadow-xs"
          style={{
            height: 'var(--header-height)',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-slate-900">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <span className="text-slate-300">·</span>
            <p className="text-xs text-slate-500 font-medium">
              PathFinder AI Ecosystem
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Share Public Profile Button */}
            <button
              onClick={handleShareProfile}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 cursor-pointer transition-colors"
              title="Copy shareable public profile link"
            >
              {copiedShare ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
              <span>{copiedShare ? 'Copied Link!' : 'Share Profile'}</span>
            </button>

            {/* AI Career Mentor Floating Launcher */}
            <button
              onClick={onOpenMentorChat}
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white shadow-xs cursor-pointer transition-opacity"
              style={{ background: 'var(--accent)' }}
            >
              <Bot size={14} />
              <span className="hidden sm:inline">Ask AI Mentor</span>
            </button>

            {/* Engine Status Dot */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 pl-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden md:inline">Online</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content (No white empty gaps, smooth scrolling) */}
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-base)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  MessageSquareCode, HelpCircle, CheckCircle2, Award, Clock,
  Play, Sparkles, RotateCcw, ChevronRight, Check, X, ShieldCheck
} from 'lucide-react';

const GithubIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function MockInterviewView({
  selectedRole,
  roles = [],
  userSkills = [],
  verifiedSkills = [],
  onSkillVerified
}) {
  const [activeTab, setActiveTab] = useState('interview'); // 'interview', 'quizzes', 'github'
  const [questions, setQuestions] = useState([]);
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  
  // Timer
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Skill Quiz State
  const [selectedQuizSkill, setSelectedQuizSkill] = useState('Python');
  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizResults, setQuizResults] = useState(() => {
    try {
      const s = localStorage.getItem('pathfinder_quiz_results');
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });

  // GitHub State
  const [githubUser, setGithubUser] = useState('');
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubResult, setGithubResult] = useState(null);
  const [githubError, setGithubError] = useState(null);

  const currentRoleObj = roles.find(r => r.id === selectedRole) || roles[0];
  const roleTitle = currentRoleObj?.title || 'Target Role';

  // Fetch interview questions
  useEffect(() => {
    fetch(`/api/mock-interview/questions/${selectedRole}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || []);
        setActiveQIndex(0);
        setUserAnswer('');
        setEvalResult(null);
        setSeconds(0);
        setTimerRunning(false);
      })
      .catch(() => {});
  }, [selectedRole]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Load Quiz Data
  const loadQuiz = (skill) => {
    setSelectedQuizSkill(skill);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    fetch(`/api/skills/quiz/${encodeURIComponent(skill)}`)
      .then(res => res.json())
      .then(data => setQuizData(data.quiz))
      .catch(() => {});
  };

  useEffect(() => {
    loadQuiz(selectedQuizSkill);
  }, []);

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim() || !questions[activeQIndex]) return;
    setEvaluating(true);
    setTimerRunning(false);
    try {
      const res = await fetch('/api/mock-interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_id: selectedRole,
          question_id: questions[activeQIndex].id,
          answer: userAnswer
        })
      });
      if (res.ok) {
        const data = await res.json();
        setEvalResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleQuizSubmit = () => {
    if (!quizData || quizData.length === 0) return;
    let correct = 0;
    quizData.forEach((q, i) => {
      if (quizAnswers[i] === q.answer) correct++;
    });
    setQuizScore(correct);
    setQuizSubmitted(true);

    const total = quizData.length;
    let status = 'retake_required';
    if (correct >= 8) status = 'verified';
    else if (correct >= 5) status = 'practicing';

    const nextResults = {
      ...quizResults,
      [selectedQuizSkill.toLowerCase()]: {
        score: correct,
        total,
        status,
        date: new Date().toISOString()
      }
    };
    setQuizResults(nextResults);
    localStorage.setItem('pathfinder_quiz_results', JSON.stringify(nextResults));

    if (onSkillVerified) {
      onSkillVerified(selectedQuizSkill, status, correct, total);
    }
  };

  const handleGitHubVerify = async () => {
    if (!githubUser.trim()) return;
    setGithubLoading(true);
    setGithubError(null);
    setGithubResult(null);
    try {
      const res = await fetch(`/api/github/verify?username=${encodeURIComponent(githubUser)}`);
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        setGithubError(data.message || `GitHub user '${githubUser}' not found.`);
      } else {
        setGithubResult(data);
        if (data.verified_skills && onSkillVerified) {
          data.verified_skills.forEach(s => onSkillVerified(s, 'verified', 10, 10));
        }
      }
    } catch (err) {
      setGithubError('Network error connecting to GitHub verifier. Please try again.');
    } finally {
      setGithubLoading(false);
    }
  };

  const fmtTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = questions[activeQIndex];

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
              <Sparkles size={13} /> AI Interview & Verification Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Mock Interview Simulator & Skill Verification
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Practice realistic technical and HR interview questions tailored to <span className="font-bold text-emerald-600">{roleTitle}</span> with instant AI evaluation,
              or verify your claimed skills via short quizzes and GitHub repository detection.
            </p>
          </div>

          {/* Sub tabs switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0">
            {[
              { id: 'interview', label: '🎙️ Mock Interview', icon: MessageSquareCode },
              { id: 'quizzes',   label: '⚡ Skill Quizzes',  icon: HelpCircle },
              { id: 'github',    label: '🐙 GitHub Verifier', icon: GithubIcon },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 1. Mock Interview Simulator ── */}
      {activeTab === 'interview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Questions Navigation Sidebar */}
          <div
            className="lg:col-span-4 rounded-3xl p-5 shadow-sm space-y-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Questions Queue</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {questions.length} Ready
              </span>
            </div>

            <div className="space-y-2">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  onClick={() => {
                    setActiveQIndex(idx);
                    setUserAnswer('');
                    setEvalResult(null);
                    setSeconds(0);
                    setTimerRunning(false);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeQIndex === idx
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Question {idx + 1}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      q.type === 'Technical' ? 'bg-sky-50 text-sky-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {q.type}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                    {q.question}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Question & Answer Area */}
          <div
            className="lg:col-span-8 rounded-3xl p-6 shadow-sm space-y-5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            {currentQ ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      {currentQ.type} Question · {roleTitle}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">
                      {currentQ.question}
                    </h3>
                  </div>

                  {/* Timer pill */}
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl shrink-0">
                    <Clock size={14} className="text-slate-500" />
                    <span className="text-xs font-bold font-mono text-slate-800">{fmtTimer(seconds)}</span>
                    <button
                      onClick={() => setTimerRunning(r => !r)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-emerald-700 shadow-xs cursor-pointer ml-1"
                    >
                      {timerRunning ? 'Pause' : 'Start'}
                    </button>
                  </div>
                </div>

                {/* Key Points hint */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-700 mb-1">Expected Key Concepts to Cover:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentQ.key_points.map((pt, i) => (
                      <span key={i} className="text-[10px] font-medium bg-white text-slate-600 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        • {pt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* User Answer Textarea */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Your Answer (Type or record your verbal talking points):</label>
                  <textarea
                    rows={6}
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    placeholder="Structure your answer using the STAR format (Situation, Task, Action, Result) or state technical tradeoffs clearly..."
                    className="w-full p-4 rounded-2xl text-xs outline-none bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      if (activeQIndex < questions.length - 1) {
                        setActiveQIndex(i => i + 1);
                        setUserAnswer('');
                        setEvalResult(null);
                        setSeconds(0);
                        setTimerRunning(false);
                      }
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Skip to Next Question
                  </button>

                  <button
                    onClick={handleEvaluateAnswer}
                    disabled={evaluating || !userAnswer.trim()}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity shadow-sm cursor-pointer flex items-center gap-2"
                    style={{
                      background: !userAnswer.trim() ? '#94a3b8' : 'var(--accent)',
                      cursor: evaluating ? 'wait' : (!userAnswer.trim() ? 'not-allowed' : 'pointer')
                    }}
                  >
                    {evaluating ? 'AI Evaluating Answer…' : (
                      <>
                        <Sparkles size={14} /> Submit for AI Critique & Score
                      </>
                    )}
                  </button>
                </div>

                {/* Evaluation Results Card */}
                {evalResult && (
                  <div className="mt-5 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                          AI Answer Evaluation
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                          Score: <span className="text-emerald-700 text-lg">{evalResult.score}/100</span> · {evalResult.clarity}
                        </h4>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-emerald-800 border border-emerald-200 shadow-xs">
                        STAR Rating: {evalResult.star_method_rating}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-700 bg-white p-4 rounded-xl border border-emerald-100">
                      <p><span className="font-bold text-slate-900">Feedback:</span> {evalResult.feedback}</p>
                      <p className="pt-1.5 border-t border-slate-100">
                        <span className="font-bold text-slate-900">Pro Tip for Next Round:</span> {evalResult.model_answer_tip}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Select a question from the queue on the left to begin practice.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 2. Skill Quizzes Tab ── */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">

          {/* Skill Selector pills */}
          <div
            className="rounded-3xl p-5 shadow-sm flex items-center gap-2 flex-wrap"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <span className="text-xs font-bold text-slate-700 mr-2">Select Skill to Verify:</span>
            {['Python', 'Docker', 'SQL', 'React', 'Machine Learning'].map(skill => {
              const res = quizResults[skill.toLowerCase()];
              const isSelected = selectedQuizSkill.toLowerCase() === skill.toLowerCase();
              const isMastered = res?.status === 'verified' || verifiedSkills.some(v => v.toLowerCase() === skill.toLowerCase());
              const isPractice = res?.status === 'practicing';
              const isRetake = res?.status === 'retake_required';

              return (
                <button
                  key={skill}
                  onClick={() => loadQuiz(skill)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isMastered && <CheckCircle2 size={13} className={isSelected ? 'text-white' : 'text-emerald-600'} />}
                  {isPractice && <span className="text-amber-500 font-bold">⚡</span>}
                  {isRetake && <span className="text-rose-500 font-bold">⚠️</span>}
                  <span>{skill}</span>
                  {isMastered && <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${isSelected ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>Mastered ({res?.score || 10}/10)</span>}
                  {isPractice && <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-normal">Practice ({res.score}/10)</span>}
                  {isRetake && <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-normal">Retake ({res.score}/10)</span>}
                  {!res && !isMastered && <span className="text-[10px] text-slate-400 font-normal">(10 Qs)</span>}
                </button>
              );
            })}
          </div>

          {/* Quiz Container */}
          <div
            className="rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {selectedQuizSkill} Competency Verification Quiz (10 Questions)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Answer 10 industry-standard technical questions. Score ≥ 8/10 to be officially marked as <strong className="text-emerald-700">Mastered & Verified 🛡️</strong> on your profile.
                </p>
              </div>

              {quizSubmitted && (
                <div className={`px-4 py-2 rounded-2xl text-xs font-bold border shrink-0 ${
                  quizScore >= 8
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : quizScore >= 5
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}>
                  {quizScore >= 8 && `🎉 Mastered & Verified! (${quizScore}/10) — Boosted Readiness Score`}
                  {quizScore >= 5 && quizScore < 8 && `⚡ Needs Practice (${quizScore}/10) — Review Key Principles`}
                  {quizScore < 5 && `⚠️ Foundational / Retake Required (${quizScore}/10) — Revisit Core Syntax`}
                </div>
              )}
            </div>

            {quizData && quizData.map((q, qIdx) => (
              <div key={qIdx} className="space-y-3 pt-2">
                <p className="text-xs font-bold text-slate-900">
                  {qIdx + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = quizAnswers[qIdx] === optIdx;
                    const isCorrect = q.answer === optIdx;
                    let btnStyle = 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800';

                    if (quizSubmitted) {
                      if (isCorrect) btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                      else if (isSelected && !isCorrect) btnStyle = 'border-red-400 bg-red-50 text-red-900';
                    } else if (isSelected) {
                      btnStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={quizSubmitted}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                        className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizSubmitted && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-1">
                    <span className="font-bold text-slate-800">Explanation:</span> {q.explanation}
                  </p>
                )}
              </div>
            ))}

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={() => loadQuiz(selectedQuizSkill)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={13} /> Retake Quiz
              </button>

              {!quizSubmitted && (
                <button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(quizAnswers).length < (quizData?.length || 10)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity shadow-sm cursor-pointer"
                  style={{
                    background: Object.keys(quizAnswers).length < (quizData?.length || 10) ? '#94a3b8' : 'var(--accent)',
                    cursor: Object.keys(quizAnswers).length < (quizData?.length || 10) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Submit 10 Answers ({Object.keys(quizAnswers).length}/{quizData?.length || 10} answered)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 3. GitHub Verifier Tab ── */}
      {activeTab === 'github' && (
        <div
          className="rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <div className="max-w-xl space-y-2">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <GithubIcon size={18} /> Automated GitHub Language & Repo Detection
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Link your public GitHub profile. PathFinder AI inspects your repositories, primary programming languages, and topics to automatically verify matching skills and boost your Readiness Score.
            </p>
          </div>

          <div className="flex items-center gap-3 max-w-md">
            <input
              type="text"
              placeholder="Enter GitHub username (e.g. torvalds, octocat)"
              value={githubUser}
              onChange={e => setGithubUser(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs outline-none bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={handleGitHubVerify}
              disabled={githubLoading || !githubUser.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity shadow-sm cursor-pointer shrink-0"
              style={{
                background: !githubUser.trim() ? '#94a3b8' : 'var(--accent)',
                cursor: githubLoading ? 'wait' : (!githubUser.trim() ? 'not-allowed' : 'pointer')
              }}
            >
              {githubLoading ? 'Scanning Repos…' : 'Detect & Verify'}
            </button>
          </div>

          {githubError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <X size={16} className="text-rose-600 shrink-0" />
              <span>{githubError}</span>
            </div>
          )}

          {githubResult && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>@{githubResult.username} — Verification Summary</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {githubResult.public_repos} Public Repositories · {githubResult.total_stars} Total Stars
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Verified Skills Added
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">Detected Languages & Topics:</p>
                <div className="flex flex-wrap gap-2">
                  {githubResult.verified_skills.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-900 font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <ShieldCheck size={12} className="text-emerald-600" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

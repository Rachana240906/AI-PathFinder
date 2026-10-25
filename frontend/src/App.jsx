import React, { useState, useEffect } from 'react';
import AppShell from './components/AppShell';
import LandingPage from './components/LandingPage';
import DashboardView from './components/DashboardView';
import ResumeView from './components/ResumeView';
import ProjectsView from './components/ProjectsView';
import PresentationModal from './components/PresentationModal';
import MyAccountView from './components/MyAccountView';
import JobMatcherView from './components/JobMatcherView';
import MockInterviewView from './components/MockInterviewView';
import CareerRadarView from './components/CareerRadarView';
import AdaptiveRoadmapView from './components/AdaptiveRoadmapView';
import AIMentorChat from './components/AIMentorChat';

// ─── Static Multi-Domain Catalog (24 Roles) ──────────────────────────
const DEFAULT_ROLES = [
  // Technical Roles
  { id: 'ai_ml_engineer',        domain: 'technical', domain_label: 'Technical', title: 'AI / Machine Learning Engineer',         category: 'Artificial Intelligence & Data',    icon: 'Cpu',           demand: 'Very High', growth_rate: '+36%', avg_salary: '$115k - $165k' },
  { id: 'full_stack_developer',  domain: 'technical', domain_label: 'Technical', title: 'Full Stack Web Developer',               category: 'Software Engineering',              icon: 'Code2',         demand: 'Very High', growth_rate: '+24%', avg_salary: '$95k - $145k' },
  { id: 'data_scientist',        domain: 'technical', domain_label: 'Technical', title: 'Data Scientist / Analytics Lead',        category: 'Data Science & Analytics',         icon: 'BarChart3',     demand: 'High',      growth_rate: '+28%', avg_salary: '$105k - $155k' },
  { id: 'cloud_devops_engineer', domain: 'technical', domain_label: 'Technical', title: 'Cloud & DevOps Engineer',                category: 'Cloud & Infrastructure',            icon: 'Cloud',         demand: 'Very High', growth_rate: '+30%', avg_salary: '$110k - $160k' },
  { id: 'cybersecurity_analyst', domain: 'technical', domain_label: 'Technical', title: 'Cybersecurity & AppSec Specialist',      category: 'Information Security',              icon: 'ShieldCheck',   demand: 'Very High', growth_rate: '+32%', avg_salary: '$100k - $150k' },
  { id: 'frontend_engineer',     domain: 'technical', domain_label: 'Technical', title: 'Frontend / UI Engineer',                 category: 'Software Engineering',              icon: 'Monitor',       demand: 'High',      growth_rate: '+22%', avg_salary: '$90k - $135k' },
  { id: 'backend_engineer',      domain: 'technical', domain_label: 'Technical', title: 'Backend & Distributed Systems Engineer',  category: 'Software Engineering',              icon: 'Server',        demand: 'High',      growth_rate: '+25%', avg_salary: '$100k - $150k' },
  { id: 'data_engineer',         domain: 'technical', domain_label: 'Technical', title: 'Data Engineer & Pipeline Architect',     category: 'Data Engineering',                  icon: 'Database',      demand: 'Very High', growth_rate: '+29%', avg_salary: '$110k - $160k' },
  { id: 'ml_ops_engineer',       domain: 'technical', domain_label: 'Technical', title: 'MLOps & AI Platform Engineer',           category: 'AI Infrastructure',                 icon: 'Layers',        demand: 'Very High', growth_rate: '+38%', avg_salary: '$120k - $170k' },
  { id: 'mobile_developer',      domain: 'technical', domain_label: 'Technical', title: 'Mobile App Developer (iOS & Android)',   category: 'Mobile Engineering',                icon: 'Smartphone',    demand: 'High',      growth_rate: '+20%', avg_salary: '$90k - $140k' },
  { id: 'blockchain_engineer',   domain: 'technical', domain_label: 'Technical', title: 'Blockchain & Web3 Engineer',             category: 'Decentralized Tech',                icon: 'Link',          demand: 'Medium',    growth_rate: '+18%', avg_salary: '$110k - $165k' },
  { id: 'site_reliability_engineer', domain: 'technical', domain_label: 'Technical', title: 'Site Reliability Engineer (SRE)',  category: 'Cloud & Infrastructure',            icon: 'Layers',        demand: 'Very High', growth_rate: '+31%', avg_salary: '$115k - $165k' },

  // Non-Technical & Business / Design / Management Roles
  { id: 'product_manager',       domain: 'non_technical', domain_label: 'Product & Strategy',      title: 'Technical Product Manager / APM',        category: 'Product & Strategy',                icon: 'Briefcase',     demand: 'Very High', growth_rate: '+26%', avg_salary: '$105k - $155k' },
  { id: 'ui_ux_designer',        domain: 'non_technical', domain_label: 'Design & Creative',       title: 'UI/UX & Product Designer',               category: 'Design & Creative',                 icon: 'Sparkles',      demand: 'Very High', growth_rate: '+24%', avg_salary: '$85k - $135k' },
  { id: 'business_analyst',      domain: 'non_technical', domain_label: 'Business & Analytics',   title: 'Business Analyst & Operations Lead',      category: 'Business & Analytics',              icon: 'BarChart3',     demand: 'High',      growth_rate: '+21%', avg_salary: '$85k - $130k' },
  { id: 'financial_analyst',     domain: 'non_technical', domain_label: 'Finance & Economics',    title: 'Financial Analyst & Quantitative Modeler', category: 'Finance & Economics',              icon: 'TrendingUp',    demand: 'High',      growth_rate: '+19%', avg_salary: '$90k - $140k' },
  { id: 'digital_marketer',      domain: 'non_technical', domain_label: 'Marketing & Growth',     title: 'Digital Marketing & Growth Strategist',   category: 'Marketing & Growth',                icon: 'TrendingUp',    demand: 'High',      growth_rate: '+22%', avg_salary: '$75k - $125k' },
  { id: 'content_seo_strategist', domain: 'non_technical', domain_label: 'Media & Comms',          title: 'Content Strategy & SEO Specialist',       category: 'Media & Communications',            icon: 'FileText',      demand: 'High',      growth_rate: '+18%', avg_salary: '$70k - $115k' },
  { id: 'management_consultant', domain: 'non_technical', domain_label: 'Consulting & Strategy',  title: 'Management & Strategy Consultant',        category: 'Consulting & Strategy',             icon: 'Briefcase',     demand: 'Very High', growth_rate: '+20%', avg_salary: '$110k - $165k' },
  { id: 'scrum_project_manager', domain: 'non_technical', domain_label: 'Project Management',     title: 'Agile Project Manager & Scrum Master',    category: 'Project & Program Management',      icon: 'CheckCircle2',  demand: 'High',      growth_rate: '+23%', avg_salary: '$95k - $140k' },
  { id: 'sales_bd_specialist',   domain: 'non_technical', domain_label: 'Sales & Growth',          title: 'Business Development & Tech Sales Exec',  category: 'Sales & Business Development',      icon: 'Users',         demand: 'Very High', growth_rate: '+24%', avg_salary: '$80k - $145k' },
  { id: 'hr_talent_specialist',  domain: 'non_technical', domain_label: 'People & Talent',         title: 'Tech Talent Acquisition & HR Specialist', category: 'People & Talent',                  icon: 'Users',         demand: 'High',      growth_rate: '+20%', avg_salary: '$75k - $120k' },
  { id: 'technical_writer',      domain: 'non_technical', domain_label: 'Media & Comms',          title: 'Technical Writer & Documentation Lead',   category: 'Media & Communications',            icon: 'FileText',      demand: 'High',      growth_rate: '+19%', avg_salary: '$80k - $125k' },
  { id: 'customer_success_manager', domain: 'non_technical', domain_label: 'Customer Solutions',   title: 'Customer Success & Client Solutions Lead', category: 'Operations & Customer Experience', icon: 'Users',         demand: 'Very High', growth_rate: '+25%', avg_salary: '$80k - $130k' },
];

const EMPTY_PROFILE = {
  contact: { name: '', email: '', phone: '', linkedin: '', github: '' },
  education: [],
  projects: [],
  skills: [],
  profile_strength_score: 0,
  default_role: 'ai_ml_engineer',
};

const DEMO_PRESETS = {
  rachana: {
    contact: { name: 'Rachana K', email: 'rachana@example.com', phone: '+91 98765 43210', linkedin: 'linkedin.com/in/rachanak', github: 'github.com/rachana' },
    extracted_skills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy', 'Docker', 'Git', 'FastAPI'],
    skills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy', 'Docker', 'Git', 'FastAPI'],
    education: ['B.Tech in Computer Science & Artificial Intelligence (2022–2026)'],
    projects: [
      { title: 'Multimodal Career Path Recommendation Engine with NLP', description: 'Engineered an end-to-end skill gap analyzer and roadmap pipeline in FastAPI & React.' },
      { title: 'Transformer-Based Sentiment Analyzer with BERT', description: 'Fine-tuned HuggingFace transformers achieving 92% F1 score.' }
    ],
    profile_strength_score: 85,
    default_role: 'ai_ml_engineer',
  },
  fullstack: {
    contact: { name: 'Aditya Sharma', email: 'aditya.sharma@example.com', phone: '+91 98111 22334', linkedin: 'linkedin.com/in/adityasharma', github: 'github.com/aditya' },
    extracted_skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js', 'PostgreSQL', 'MongoDB', 'Docker', 'Git', 'HTML5', 'CSS3', 'REST APIs'],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js', 'PostgreSQL', 'MongoDB', 'Docker', 'Git', 'HTML5', 'CSS3', 'REST APIs'],
    education: ['B.Tech in Information Technology (2021–2025)'],
    projects: [
      { title: 'High-Throughput Collaborative Workspace Platform', description: 'Real-time WebSocket Kanban board supporting 10k concurrent users.' },
      { title: 'Distributed Microservices E-Commerce Backend', description: 'Built with Node.js, Express, PostgreSQL, and Redis caching.' }
    ],
    profile_strength_score: 88,
    default_role: 'full_stack_developer',
  },
  priya: {
    contact: { name: 'Priya Nair', email: 'priya.nair@example.com', phone: '+91 99222 33445', linkedin: 'linkedin.com/in/priyanair', github: '' },
    extracted_skills: ['Product Strategy', 'Agile & Scrum', 'User Research', 'Wireframing & Prototyping', 'Product Analytics', 'A/B Testing', 'Roadmap Planning', 'Jira', 'SQL'],
    skills: ['Product Strategy', 'Agile & Scrum', 'User Research', 'Wireframing & Prototyping', 'Product Analytics', 'A/B Testing', 'Roadmap Planning', 'Jira', 'SQL'],
    education: ['B.E. in Computer Science & MBA in Tech Management'],
    projects: [
      { title: 'Fintech Mobile Onboarding Funnel Optimization', description: 'Reduced customer acquisition drop-off by 24% through iterative user journey testing.' }
    ],
    profile_strength_score: 82,
    default_role: 'product_manager',
  },
  sneha: {
    contact: { name: 'Sneha Patel', email: 'sneha.patel@example.com', phone: '+91 98450 12345', linkedin: 'linkedin.com/in/snehapatel', github: '' },
    extracted_skills: ['Business Analysis', 'SQL', 'Tableau', 'Power BI', 'Process Mapping', 'Requirement Gathering', 'Excel Modeling', 'Stakeholder Management'],
    skills: ['Business Analysis', 'SQL', 'Tableau', 'Power BI', 'Process Mapping', 'Requirement Gathering', 'Excel Modeling', 'Stakeholder Management'],
    education: ['B.Com (Hons) with Analytics Minor'],
    projects: [
      { title: 'Supply Chain Operations Bottleneck Analysis', description: 'Built interactive executive dashboard identifying $120k quarterly cost savings.' }
    ],
    profile_strength_score: 80,
    default_role: 'business_analyst',
  },
  cyber: {
    contact: { name: 'Karan Verma', email: 'karan.verma@example.com', phone: '+91 98765 09876', linkedin: 'linkedin.com/in/karanverma', github: 'github.com/karansec' },
    extracted_skills: ['Network Security', 'Penetration Testing', 'Wireshark', 'Linux / Bash', 'SIEM', 'OWASP Top 10', 'Python', 'Cryptography', 'Vulnerability Assessment'],
    skills: ['Network Security', 'Penetration Testing', 'Wireshark', 'Linux / Bash', 'SIEM', 'OWASP Top 10', 'Python', 'Cryptography', 'Vulnerability Assessment'],
    education: ['B.Tech in Cybersecurity & Information Assurance'],
    projects: [
      { title: 'Automated Web Application Vulnerability Scanner', description: 'Engineered custom Python tool detecting OWASP Top 10 vulnerabilities in CI/CD pipelines.' }
    ],
    profile_strength_score: 86,
    default_role: 'cybersecurity_analyst',
  },
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try { const s = localStorage.getItem('pathfinder_user'); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState('ai_ml_engineer');
  
  const [profile, setProfile] = useState(() => {
    if (currentUser?.email) {
      try {
        const local = localStorage.getItem('pathfinder_saved_profile_' + currentUser.email);
        if (local) return JSON.parse(local);
      } catch {}
    }
    if (currentUser?.profile && Object.keys(currentUser.profile).length > 0) {
      return {
        ...EMPTY_PROFILE,
        ...currentUser.profile,
        contact: {
          ...currentUser.profile.contact,
          name: currentUser.name || currentUser.profile.contact?.name || '',
          email: currentUser.email || currentUser.profile.contact?.email || ''
        },
        skills: currentUser.skills?.length ? currentUser.skills : (currentUser.profile.skills || currentUser.profile.extracted_skills || []),
        default_role: currentUser.target_role || currentUser.profile.default_role || 'ai_ml_engineer'
      };
    }
    if (currentUser?.skills?.length) {
      return {
        ...EMPTY_PROFILE,
        contact: { name: currentUser.name || '', email: currentUser.email || '' },
        skills: currentUser.skills,
        profile_strength_score: 75,
        default_role: currentUser.target_role || 'ai_ml_engineer'
      };
    }
    return {
      ...EMPTY_PROFILE,
      contact: { name: currentUser?.name || '', email: currentUser?.email || '' },
      default_role: currentUser?.target_role || 'ai_ml_engineer'
    };
  });

  const [userSkills, setUserSkills] = useState(() => {
    if (currentUser?.skills?.length) return currentUser.skills;
    if (currentUser?.profile?.extracted_skills?.length) return currentUser.profile.extracted_skills;
    return [];
  });
  const [verifiedSkills, setVerifiedSkills] = useState(() => currentUser?.verified_skills?.length ? currentUser.verified_skills : []);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [suitabilityData, setSuitabilityData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [backendStatus, setBackendStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pitchOpen, setPitchOpen] = useState(false);
  const [mentorChatOpen, setMentorChatOpen] = useState(false);

  useEffect(() => {
    fetchRoles();
    if (currentUser?.email) {
      fetch('/api/auth/user/' + encodeURIComponent(currentUser.email))
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.user) {
            setCurrentUser(data.user);
            localStorage.setItem('pathfinder_user', JSON.stringify(data.user));
            if (data.user.name) {
              setProfile(prev => ({
                ...prev,
                contact: { ...(prev?.contact || {}), name: data.user.name }
              }));
            }
          }
        })
        .catch(() => {});
    }
    if (currentUser?.skills?.length) {
      const role = currentUser?.target_role || selectedRole;
      runGapAnalysis(currentUser.skills, role);
    }
  }, []);

  useEffect(() => {
    if (userSkills?.length > 0) {
      runGapAnalysis(userSkills, selectedRole);
    } else {
      setGapAnalysis(null);
      setSuitabilityData(null);
      setRecommendations([]);
      setRoadmap(null);
    }
  }, [selectedRole, userSkills, verifiedSkills.length]);

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      if (res.ok) { const d = await res.json(); if (d.roles) setRoles(d.roles); setBackendStatus(true); }
    } catch { setBackendStatus(false); }
  };

  const runGapAnalysis = async (skills, roleId = selectedRole) => {
    if (!skills || skills.length === 0) {
      setGapAnalysis(null);
      setSuitabilityData(null);
      setRecommendations([]);
      setRoadmap(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/analyze-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills,
          target_role_id: roleId,
          verified_skills: verifiedSkills,
          candidate_name: profile?.contact?.name || currentUser?.name,
          candidate_email: profile?.contact?.email || currentUser?.email,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGapAnalysis(data.gap_analysis);
      setRecommendations(data.explainable_recommendations || []);
      setRoadmap(data.personalized_roadmap);
      if (data.suitability) setSuitabilityData(data.suitability);
      setBackendStatus(true);
    } catch {
      simulateLocalAnalysis(skills, roleId);
    } finally {
      setLoading(false);
    }
  };

  const simulateLocalAnalysis = (skills, roleId) => {
    if (!skills || skills.length === 0) return;
    const isAI = roleId === 'ai_ml_engineer';
    const match = isAI ? 80 : roleId === 'full_stack_developer' ? 68 : 55;
    setGapAnalysis({
      role_id: roleId,
      role_title: isAI ? 'AI / Machine Learning Engineer' : roleId === 'full_stack_developer' ? 'Full Stack Web Developer' : 'Data Scientist / Analytics Lead',
      match_score: match,
      readiness_tier: match >= 70 ? 'Job Ready' : 'Near Ready',
      category_scores: { core: match >= 70 ? 90 : 70, advanced: match >= 70 ? 75 : 55, tools: 70 },
      mastered_skills: skills,
      missing_core_skills: isAI ? [{ name: 'Large Language Models (LLMs)' }] : [{ name: 'Next.js' }],
      missing_advanced_skills: isAI ? [{ name: 'Retrieval-Augmented Generation (RAG)' }] : [{ name: 'PostgreSQL' }],
      missing_tools: [{ name: 'Kubernetes' }],
    });
    setSuitabilityData({
      best_fit_role_id: 'ai_ml_engineer',
      best_fit_role_title: 'AI / Machine Learning Engineer',
      best_fit_match_score: match,
      all_role_evaluations: [
        { role_id: 'ai_ml_engineer', role_title: 'AI / ML Engineer', match_score: match, icon: 'Cpu' },
        { role_id: 'data_scientist', role_title: 'Data Scientist', match_score: Math.max(0, match - 10), icon: 'BarChart3' },
        { role_id: 'full_stack_developer', role_title: 'Full Stack Dev', match_score: Math.max(0, match - 20), icon: 'Code2' },
      ],
    });
    setRoadmap({
      target_role_id: roleId,
      target_role: isAI ? 'AI / Machine Learning Engineer' : 'Full Stack Developer',
      match_score: match,
      skills_present: skills,
      skills_to_add: [{ name: 'LLMs' }, { name: 'RAG' }, { name: 'Kubernetes' }],
      phases: [
        {
          phase_id: 1, title: 'Phase 1: Core Competency & Foundational Bridging', duration: 'Weeks 1–3',
          focus: 'Bridge essential missing skills: Core Frameworks',
          milestone_goal: 'Establish working proficiency with foundational concepts.',
          topics: ['Core syntax & data models', 'Standardized dev environment', 'REST API testing'],
          resources: [{ title: 'Official Documentation', url: 'https://devdocs.io', type: 'Documentation' }],
          project_milestone: 'Build a modular prototype.',
        },
        {
          phase_id: 2, title: 'Phase 2: Framework Mastery & Microservice Architecture', duration: 'Weeks 4–6',
          focus: 'Integration and scalable pipelines',
          milestone_goal: 'Develop production-ready modules with proper validation.',
          topics: ['Asynchronous routing', 'Database persistence & indexing', 'Docker basics'],
          resources: [{ title: 'FastAPI Interactive Docs', url: 'https://fastapi.tiangolo.com', type: 'Guide' }],
          project_milestone: 'Create a functional service.',
        }
      ]
    });
  };

  const handleLogin = async (credentials) => {
    let user = credentials;
    if (credentials?.password) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials.email, password: credentials.password })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || 'Login failed. Please check your credentials.');
        }
        user = data.user;
      } catch (err) {
        if (err.message && !err.message.includes('fetch')) {
          throw err;
        }
      }
    }

    setCurrentUser(user);
    localStorage.setItem('pathfinder_user', JSON.stringify(user));
    if (user.target_role) setSelectedRole(user.target_role);

    // 1. Restore Profile from backend user object or local email cache
    let userProfile = user.profile;
    if (!userProfile || Object.keys(userProfile).length === 0) {
      try {
        const saved = localStorage.getItem('pathfinder_saved_profile_' + user.email);
        if (saved) userProfile = JSON.parse(saved);
      } catch {}
    }

    if (userProfile && Object.keys(userProfile).length > 0) {
      setProfile({
        ...EMPTY_PROFILE,
        ...userProfile,
        contact: {
          ...userProfile.contact,
          name: user.name || userProfile.contact?.name || '',
          email: user.email || userProfile.contact?.email || ''
        },
        skills: user.skills?.length ? user.skills : (userProfile.skills || userProfile.extracted_skills || []),
        default_role: user.target_role || userProfile.default_role || 'ai_ml_engineer'
      });
    } else {
      setProfile({
        ...EMPTY_PROFILE,
        contact: { name: user.name || '', email: user.email || '' },
        skills: user.skills || [],
        profile_strength_score: user.skills?.length ? 75 : 0,
        default_role: user.target_role || 'ai_ml_engineer'
      });
    }

    // 2. Restore Skills & Run Gap Analysis
    const skillsToUse = user.skills?.length ? user.skills : (userProfile?.extracted_skills || userProfile?.skills || []);
    if (skillsToUse.length > 0) {
      setUserSkills(skillsToUse);
      runGapAnalysis(skillsToUse, user.target_role || 'ai_ml_engineer');
    }

    // 3. Restore Verified Skills
    if (user.verified_skills?.length) {
      setVerifiedSkills(user.verified_skills);
    }

    // 4. Restore Milestones
    if (user.milestones && Object.keys(user.milestones).length > 0) {
      localStorage.setItem('pathfinder_completed_milestones', JSON.stringify(user.milestones));
    }

    // 5. Restore Skill Quiz Results
    if (user.skill_quiz_results && Object.keys(user.skill_quiz_results).length > 0) {
      localStorage.setItem('pathfinder_quiz_results', JSON.stringify(user.skill_quiz_results));
    }
  };

  const handleRegister = async (registrationData) => {
    let user = registrationData;
    if (registrationData?.password) {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registrationData.name,
          email: registrationData.email,
          password: registrationData.password,
          target_role: registrationData.target_role || 'ai_ml_engineer',
          skills: []
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed.');
      }
      user = data.user;
    }

    setCurrentUser(user);
    localStorage.setItem('pathfinder_user', JSON.stringify(user));
    if (user.target_role) setSelectedRole(user.target_role);
    setProfile({
      ...EMPTY_PROFILE,
      contact: { name: user.name || '', email: user.email || '' },
      skills: user.skills || [],
      profile_strength_score: 60,
      default_role: user.target_role || 'ai_ml_engineer'
    });
  };

  const handleLoadPreset = (key) => {
    const preset = DEMO_PRESETS[key];
    if (!preset) return;
    const newProfile = {
      ...EMPTY_PROFILE,
      ...preset,
      contact: {
        ...preset.contact,
        email: currentUser?.email || preset.contact.email,
        name: currentUser?.name || preset.contact.name,
      }
    };
    if (preset.default_role) {
      setSelectedRole(preset.default_role);
    }
    handleUpdateProfile(newProfile);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pathfinder_user');
    setActiveTab('dashboard');
    setUserSkills([]);
    setVerifiedSkills([]);
    setProfile(EMPTY_PROFILE);
    setGapAnalysis(null);
    setSuitabilityData(null);
    setRecommendations([]);
    setRoadmap(null);
  };

  // Synchronized Profile updater that persists to SQLite backend
  const handleUpdateProfile = (newProfile) => {
    setProfile(newProfile);
    const newSkills = newProfile.extracted_skills || newProfile.skills || userSkills;
    if (newSkills?.length) {
      setUserSkills(newSkills);
      runGapAnalysis(newSkills, selectedRole);
    }

    if (currentUser?.email) {
      localStorage.setItem('pathfinder_saved_profile_' + currentUser.email, JSON.stringify(newProfile));
      fetch('/api/auth/update-gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          profile: newProfile,
          skills: newSkills
        })
      }).then(r => r.json()).then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('pathfinder_user', JSON.stringify(data.user));
        }
      }).catch(() => {});
    }
  };

  // Synchronized Milestone progress updater that persists to SQLite backend
  const handleUpdateMilestoneProgress = (milestonesMap) => {
    if (currentUser?.email) {
      localStorage.setItem('pathfinder_completed_milestones', JSON.stringify(milestonesMap));
      fetch('/api/auth/update-gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          milestones: milestonesMap
        })
      }).catch(() => {});
    }
  };

  const handleSkillVerified = (skillName, status = 'verified', score = 10, total = 10) => {
    const clean = skillName.trim();
    let nextVerified = verifiedSkills;

    if (status === 'verified') {
      if (!verifiedSkills.some(v => v.toLowerCase() === clean.toLowerCase())) {
        nextVerified = [...verifiedSkills, clean];
        setVerifiedSkills(nextVerified);
      }
      if (!userSkills.some(s => s.toLowerCase() === clean.toLowerCase())) {
        setUserSkills(prev => [...prev, clean]);
      }
    }

    const savedQuizResults = (() => {
      try {
        const s = localStorage.getItem('pathfinder_quiz_results');
        return s ? JSON.parse(s) : {};
      } catch { return {}; }
    })();

    savedQuizResults[clean.toLowerCase()] = {
      status,
      score,
      total,
      date: new Date().toISOString()
    };
    localStorage.setItem('pathfinder_quiz_results', JSON.stringify(savedQuizResults));

    if (currentUser?.email) {
      const badgeText = status === 'verified'
        ? `Verified: ${clean} 🛡️ (${score}/${total})`
        : `Quiz: ${clean} (${score}/${total})`;
      const updatedBadges = Array.from(new Set([...(currentUser.badges || []), badgeText]));

      fetch('/api/auth/update-gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          verified_skills: nextVerified,
          streak_count: (currentUser.streak_count || 4) + (status === 'verified' ? 1 : 0),
          badges: updatedBadges,
          skill_quiz_results: savedQuizResults
        })
      }).then(r => r.json()).then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('pathfinder_user', JSON.stringify(data.user));
        }
      }).catch(() => {});
    }
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('pathfinder_user', JSON.stringify(updatedUser));
    setProfile(prev => ({
      ...prev,
      contact: {
        ...(prev?.contact || {}),
        name: updatedUser.name || prev?.contact?.name || ''
      }
    }));
    if (updatedUser?.email) {
      try {
        const pKey = 'pathfinder_saved_profile_' + updatedUser.email;
        const curSaved = JSON.parse(localStorage.getItem(pKey) || '{}');
        curSaved.contact = { ...(curSaved.contact || {}), name: updatedUser.name };
        localStorage.setItem(pKey, JSON.stringify(curSaved));
      } catch {}

      fetch('/api/auth/update-gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: updatedUser.email,
          name: updatedUser.name
        })
      }).then(r => r.json()).then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('pathfinder_user', JSON.stringify(data.user));
        }
      }).catch(() => {});
    }
  };

  // ── Landing Page (Unauthenticated) ──
  if (!currentUser) {
    return (
      <LandingPage
        onLogin={handleLogin}
        onRegister={handleRegister}
        backendStatus={backendStatus}
      />
    );
  }

  // ── App Shell (Authenticated) ──
  return (
    <>
      <AppShell
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenPitch={() => setPitchOpen(true)}
        onOpenMentorChat={() => setMentorChatOpen(true)}
      >
        {/* 1. Dashboard View */}
        {activeTab === 'dashboard' && (
          <DashboardView
            roles={roles}
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            suitabilityData={suitabilityData}
            gapAnalysis={gapAnalysis}
            userSkills={userSkills}
            verifiedSkills={verifiedSkills}
            loading={loading}
            onAnalyze={runGapAnalysis}
            onGoToResume={() => setActiveTab('resume')}
            onGoToRoadmap={() => setActiveTab('roadmap')}
            onGoToProjects={() => setActiveTab('projects')}
            onGoToJobMatcher={() => setActiveTab('job_matcher')}
            onGoToInterview={() => setActiveTab('interview')}
            currentUser={currentUser}
          />
        )}

        {/* 2. Resume & ATS Optimizer */}
        {activeTab === 'resume' && (
          <ResumeView
            profile={profile}
            setProfile={handleUpdateProfile}
            userSkills={userSkills}
            setUserSkills={setUserSkills}
            verifiedSkills={verifiedSkills}
            onAnalyze={(skills) => { setUserSkills(skills); runGapAnalysis(skills, selectedRole); }}
            loading={loading}
            onLoadPreset={handleLoadPreset}
            onGoToQuizzes={() => setActiveTab('interview')}
            onGoToRoadmap={() => setActiveTab('roadmap')}
          />
        )}

        {/* 3. Adaptive Milestone Roadmap */}
        {activeTab === 'roadmap' && (
          <AdaptiveRoadmapView
            roadmap={roadmap}
            userSkills={userSkills}
            selectedRole={selectedRole}
            roles={roles}
            onGoToResume={() => setActiveTab('resume')}
            onUpdateMilestoneProgress={handleUpdateMilestoneProgress}
          />
        )}

        {/* 4. Job Description Matcher */}
        {activeTab === 'job_matcher' && (
          <JobMatcherView
            userSkills={userSkills}
            selectedRole={selectedRole}
            roles={roles}
            onGoToResume={() => setActiveTab('resume')}
            onGoToRoadmap={() => setActiveTab('roadmap')}
          />
        )}

        {/* 5. Mock Interview & Skill Quizzes */}
        {activeTab === 'interview' && (
          <MockInterviewView
            selectedRole={selectedRole}
            roles={roles}
            userSkills={userSkills}
            verifiedSkills={verifiedSkills}
            onSkillVerified={handleSkillVerified}
          />
        )}

        {/* 6. Career Radar & Opportunities Feed */}
        {activeTab === 'career_radar' && (
          <CareerRadarView
            roles={roles}
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            userSkills={userSkills}
            suitabilityData={suitabilityData}
            onGoToProjects={() => setActiveTab('projects')}
            onGoToResume={() => setActiveTab('resume')}
          />
        )}

        {/* 7. Recommended Projects */}
        {activeTab === 'projects' && (
          <ProjectsView
            roles={roles}
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            userSkills={userSkills}
            gapAnalysis={gapAnalysis}
            onGoToResume={() => setActiveTab('resume')}
          />
        )}

        {/* 8. My Account & Export */}
        {activeTab === 'account' && (
          <MyAccountView
            currentUser={currentUser}
            userSkills={userSkills}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </AppShell>

      {/* Floating AI Career Mentor Launcher Icon Hovering on Every Page (Bottom-Right) */}
      <button
        onClick={() => setMentorChatOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl hover:shadow-emerald-600/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white cursor-pointer group"
        title="Chat with AI Career Mentor"
        aria-label="Open AI Career Mentor"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-300 border-2 border-white rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform duration-200">
          <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
        </svg>
      </button>

      {/* Floating Context-Aware AI Career Mentor Chatbot */}
      <AIMentorChat
        currentUser={currentUser}
        selectedRole={selectedRole}
        roles={roles}
        userSkills={userSkills}
        gapAnalysis={gapAnalysis}
        isOpen={mentorChatOpen}
        onClose={() => setMentorChatOpen(false)}
      />

      {/* Presentation Pitch Modal */}
      <PresentationModal isOpen={pitchOpen} onClose={() => setPitchOpen(false)} />
    </>
  );
}

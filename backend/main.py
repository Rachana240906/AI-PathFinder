from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uuid

from data.career_benchmarks import CAREER_ROLES
from services.resume_parser import parser
from services.gap_analyzer import gap_analyzer
from services.explainability import explainability_engine
from services.roadmap_generator import roadmap_generator
from services.opportunities import CURATED_MENTORS, CURATED_OPPORTUNITIES
from services.database import (
    save_profile, get_profile, create_user, authenticate_user, 
    get_user_by_email, update_user_profile, get_projects_for_gaps
)
from services.ai_features import (
    match_job_description,
    get_ats_resume_feedback,
    chat_career_mentor,
    get_mock_interview_questions,
    evaluate_interview_answer,
    verify_github_profile,
    compare_roles,
    get_curated_opportunities,
    SKILL_QUIZZES,
    DEFAULT_QUIZ
)

app = FastAPI(
    title="PathFinder AI Backend",
    description="Intelligent Student Success Ecosystem API",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed demo users on startup if not present
def seed_demo_accounts():
    demos = [
        {
            "name": "Rachana Bonigala",
            "email": "rachana@example.com",
            "password": "password123",
            "target_role": "ai_ml_engineer",
            "skills": ["Python", "PyTorch", "Scikit-Learn", "Deep Learning", "Natural Language Processing", "FastAPI", "React.js", "SQL", "Pandas", "NumPy", "Git & GitHub", "Docker"]
        },
        {
            "name": "Aditya Verma",
            "email": "aditya.v@example.com",
            "password": "password123",
            "target_role": "full_stack_developer",
            "skills": ["JavaScript", "TypeScript", "React.js", "Node.js", "HTML5", "CSS3", "Tailwind CSS", "MongoDB", "Git & GitHub"]
        },
        {
            "name": "Priya Sharma",
            "email": "priya.pm@example.com",
            "password": "password123",
            "target_role": "product_manager",
            "skills": ["Product Management", "PRD & Spec Writing", "Product Roadmapping", "Agile & Scrum", "User Research", "Jira & Confluence", "A/B Testing & Experimentation", "Figma", "Advanced Excel / Spreadsheets"]
        },
        {
            "name": "Sneha Kulkarni",
            "email": "sneha.ba@example.com",
            "password": "password123",
            "target_role": "business_analyst",
            "skills": ["Business Analysis", "Advanced Excel / Spreadsheets", "SQL", "Power BI", "Process Mapping (BPMN)", "Tableau", "Market Research", "Competitive Analysis"]
        },
        {
            "name": "Karan Patel",
            "email": "karan.sec@example.com",
            "password": "password123",
            "target_role": "cybersecurity_analyst",
            "skills": ["Linux / Bash", "Network Security", "Wireshark", "Python", "Cryptography", "Git & GitHub", "OWASP Top 10 Security"]
        }
    ]
    for d in demos:
        if not get_user_by_email(d["email"]):
            try:
                create_user(d["name"], d["email"], d["password"], d["target_role"], d["skills"])
            except Exception:
                pass

seed_demo_accounts()

# Request Models
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    target_role: Optional[str] = "ai_ml_engineer"
    skills: Optional[List[str]] = []

class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateRoleRequest(BaseModel):
    email: str
    target_role: str

class BestFitRequest(BaseModel):
    skills: List[str]

class SkillGapRequest(BaseModel):
    skills: List[str]
    target_role_id: str
    verified_skills: Optional[List[str]] = []
    profile_id: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None

class DirectTextParseRequest(BaseModel):
    text: str

class JobMatchRequest(BaseModel):
    jd_text: str
    user_skills: List[str]
    target_role_id: Optional[str] = None

class ATSResumeFeedbackRequest(BaseModel):
    resume_text: str
    profile: Optional[Dict[str, Any]] = None

class MentorChatRequest(BaseModel):
    message: str
    user_profile: Dict[str, Any]

class InterviewEvalRequest(BaseModel):
    role_id: str
    question_id: int
    answer: str

class AdaptiveRoadmapRequest(BaseModel):
    skills: List[str]
    target_role_id: str
    hours_per_week: Optional[int] = 10
    duration_weeks: Optional[int] = 12
    verified_skills: Optional[List[str]] = []

class UpdateGamificationRequest(BaseModel):
    email: str
    name: Optional[str] = None
    target_role: Optional[str] = None
    skills: Optional[List[str]] = None
    verified_skills: Optional[List[str]] = None
    streak_count: Optional[int] = None
    score_history: Optional[List[Dict[str, Any]]] = None
    badges: Optional[List[str]] = None
    profile: Optional[Dict[str, Any]] = None
    milestones: Optional[Dict[str, Any]] = None
    skill_quiz_results: Optional[Dict[str, Any]] = None

@app.get("/")
def root():
    return {
        "name": "PathFinder AI",
        "status": "online",
        "version": "2.1.0",
        "description": "Helping students discover the smartest path from skills to success across 24+ Tech and Non-Tech roles."
    }

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "PathFinder AI"}

# Authentication Endpoints
@app.post("/api/auth/register")
def register(req: RegisterRequest):
    if not req.email or not req.password or not req.name:
        raise HTTPException(status_code=400, detail="Name, email, and password are required.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    
    try:
        user = create_user(
            name=req.name,
            email=req.email,
            password=req.password,
            target_role=req.target_role or "ai_ml_engineer",
            skills=req.skills or []
        )
        return {"status": "success", "user": user, "message": "Account created successfully."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

@app.post("/api/auth/login")
def login(req: LoginRequest):
    if not req.email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password are required.")
    
    user = authenticate_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    return {"status": "success", "user": user, "message": "Login successful."}

@app.get("/api/auth/user/{email}")
def get_user(email: str):
    user = get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"user": user}

@app.post("/api/auth/update-role")
def update_role(req: UpdateRoleRequest):
    success = update_user_profile(req.email, target_role=req.target_role)
    if not success:
        raise HTTPException(status_code=404, detail="Failed to update user target role.")
    return {"status": "success", "target_role": req.target_role}

@app.post("/api/auth/update-gamification")
def update_gamification(req: UpdateGamificationRequest):
    success = update_user_profile(
        email=req.email,
        name=req.name,
        target_role=req.target_role,
        skills=req.skills,
        verified_skills=req.verified_skills,
        streak_count=req.streak_count,
        score_history=req.score_history,
        badges=req.badges,
        profile=req.profile,
        milestones=req.milestones,
        skill_quiz_results=req.skill_quiz_results
    )
    if not success:
        raise HTTPException(status_code=404, detail="User not found or update failed.")
    user = get_user_by_email(req.email)
    return {"status": "success", "user": user}

# Role and Career Intelligence
@app.get("/api/roles")
def get_roles():
    roles_list = []
    for r_id, r in CAREER_ROLES.items():
        roles_list.append({
            "id": r["id"],
            "title": r["title"],
            "category": r["category"],
            "domain": r.get("domain", "technical"),
            "domain_label": r.get("domain_label", "Technical"),
            "icon": r.get("icon", "Code2"),
            "demand": r.get("demand", "High"),
            "growth_rate": r.get("growth_rate", "+25%"),
            "avg_salary": r.get("avg_salary", ""),
            "summary": r.get("summary", ""),
            "core_skills_count": len(r["core_skills"]),
            "advanced_skills_count": len(r["advanced_skills"])
        })
    return {"roles": roles_list}

@app.get("/api/roles/compare")
def compare_career_roles(role_a: str = "full_stack_developer", role_b: str = "ai_ml_engineer", skills: str = ""):
    """Side-by-side role transition comparison."""
    user_skills = [s.strip() for s in skills.split(",") if s.strip()] if skills else []
    return compare_roles(role_a, role_b, user_skills)

@app.get("/api/roles/{role_id}")
def get_role_detail(role_id: str):
    if role_id not in CAREER_ROLES:
        raise HTTPException(status_code=404, detail="Role not found")
    return {"role": CAREER_ROLES[role_id]}

@app.post("/api/analyze-best-fit")
def analyze_best_fit(req: BestFitRequest):
    suitability = gap_analyzer.analyze_all_roles(req.skills)
    return suitability

@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        parsed_result = parser.parse(content, is_bytes=True, filename=file.filename)
        # Compute best fit immediately
        suitability = gap_analyzer.analyze_all_roles(parsed_result.get("extracted_skills", []))
        return {
            "status": "success", 
            "data": parsed_result,
            "suitability": suitability
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

@app.post("/api/resume/parse-text")
def parse_resume_text(req: DirectTextParseRequest):
    try:
        parsed_result = parser.parse(req.text, is_bytes=False)
        suitability = gap_analyzer.analyze_all_roles(parsed_result.get("extracted_skills", []))
        return {
            "status": "success", 
            "data": parsed_result,
            "suitability": suitability
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse text: {str(e)}")

@app.post("/api/analyze-gap")
def analyze_skill_gap(req: SkillGapRequest):
    gap_result = gap_analyzer.analyze(req.skills, req.target_role_id, req.verified_skills)
    recommendations = explainability_engine.explain_recommendations(gap_result)
    roadmap = roadmap_generator.generate(gap_result, req.skills)
    suitability = gap_analyzer.analyze_all_roles(req.skills)

    # Save to SQLite
    profile_id = req.profile_id or str(uuid.uuid4())[:8]
    if req.candidate_name:
        save_profile(
            profile_id=profile_id,
            name=req.candidate_name,
            email=req.candidate_email or "",
            target_role=req.target_role_id,
            skills=req.skills,
            score=gap_result["match_score"]
        )

    return {
        "profile_id": profile_id,
        "gap_analysis": gap_result,
        "explainable_recommendations": recommendations,
        "personalized_roadmap": roadmap,
        "suitability": suitability
    }

# ── High-Impact Features Endpoints ──

@app.post("/api/match-job")
def match_job(req: JobMatchRequest):
    """Compare user's skills against a real pasted job posting."""
    return match_job_description(req.jd_text, req.user_skills, req.target_role_id)

@app.post("/api/resume/ats-feedback")
def resume_ats_feedback(req: ATSResumeFeedbackRequest):
    """Deep ATS score analysis, missing sections, and AI bullet point rewrites."""
    return get_ats_resume_feedback(req.resume_text, req.profile)

@app.post("/api/mentor/chat")
def mentor_chat(req: MentorChatRequest):
    """AI Career Mentor chatbot that knows user profile, gaps, and roadmap."""
    return chat_career_mentor(req.message, req.user_profile)

@app.get("/api/mock-interview/questions/{role_id}")
def mock_interview_questions(role_id: str):
    """Role-specific technical and behavioral mock interview questions."""
    return {"questions": get_mock_interview_questions(role_id)}

@app.post("/api/mock-interview/evaluate")
def mock_interview_eval(req: InterviewEvalRequest):
    """Evaluate candidate answer with score and STAR method critique."""
    return evaluate_interview_answer(req.role_id, req.question_id, req.answer)

@app.get("/api/skills/quiz/{skill_name}")
def get_skill_quiz(skill_name: str):
    """Interactive 3-question quiz for skill verification."""
    clean_skill = skill_name.strip().lower()
    quiz = SKILL_QUIZZES.get(clean_skill, DEFAULT_QUIZ)
    return {"skill": skill_name, "quiz": quiz}

@app.get("/api/github/verify")
def verify_github(username: str):
    """Detect public repositories, languages, and auto-verify skills from GitHub."""
    return verify_github_profile(username)


@app.get("/api/opportunities/feed")
def get_opportunities_feed(skills: str = ""):
    """Curated hackathons, internships, and open-source programs matching user skills."""
    user_skills = [s.strip() for s in skills.split(",") if s.strip()] if skills else []
    return {"opportunities": get_curated_opportunities(user_skills)}

@app.get("/api/market/trends")
def get_market_trends():
    """Live trending skills, hiring demands, and compensation benchmarks."""
    return {
        "trending_skills": [
            {"skill": "Large Language Models & GenAI", "growth": "+142%", "tier": "Hottest Tech 2026"},
            {"skill": "FastAPI & Distributed Microservices", "growth": "+48%", "tier": "High Demand"},
            {"skill": "Docker & Kubernetes Deployment", "growth": "+52%", "tier": "Essential Infra"},
            {"skill": "React 19 & Next.js Architecture", "growth": "+38%", "tier": "High Demand"},
            {"skill": "Vector Databases & RAG Pipelines", "growth": "+115%", "tier": "Hottest Tech 2026"}
        ],
        "top_demand_roles": [
            {"role": "AI / Machine Learning Engineer", "growth": "+36% YoY", "demand": "Very High", "salary": "$115k - $165k"},
            {"role": "Full Stack Web Developer", "growth": "+24% YoY", "demand": "Very High", "salary": "$95k - $145k"},
            {"role": "Technical Product Manager", "growth": "+26% YoY", "demand": "High", "salary": "$105k - $155k"},
            {"role": "Cloud & DevOps Architect", "growth": "+30% YoY", "demand": "Very High", "salary": "$110k - $160k"}
        ]
    }

@app.post("/api/roadmap/generate-adaptive")
def generate_adaptive_roadmap(req: AdaptiveRoadmapRequest):
    """Regenerate roadmap according to available hours per week or target duration."""
    gap_result = gap_analyzer.analyze(req.skills, req.target_role_id, req.verified_skills)
    roadmap = roadmap_generator.generate(
        gap_result, 
        req.skills, 
        hours_per_week=req.hours_per_week or 10, 
        duration_weeks=req.duration_weeks or 12
    )
    return {
        "gap_analysis": gap_result,
        "roadmap": roadmap
    }

@app.post("/api/auth/update-gamification")
def update_gamification(req: UpdateGamificationRequest):
    """Sync streak, score history, verified skills, badges, profile, milestones, and name to SQLite."""
    success = update_user_profile(
        email=req.email,
        name=req.name,
        target_role=req.target_role,
        skills=req.skills,
        verified_skills=req.verified_skills,
        streak_count=req.streak_count,
        score_history=req.score_history,
        badges=req.badges,
        profile=req.profile,
        milestones=req.milestones,
        skill_quiz_results=req.skill_quiz_results
    )
    if not success:
        raise HTTPException(status_code=404, detail="User not found or update failed")
    updated_user = get_user_by_email(req.email)
    return {"status": "success", "user": updated_user, "message": "Gamification and progress updated."}

@app.get("/api/recommendations/projects")
def get_recommended_projects(role: str = "ai_ml_engineer", skills: str = ""):
    """
    Return projects that cover the user's skill gaps for the given role.
    skills = comma-separated list of the user's current skills (passed from frontend).
    """
    user_skills = [s.strip() for s in skills.split(",") if s.strip()] if skills else []
    if not user_skills:
        return {"projects": [], "role": role}

    # Reuse existing gap_analyzer to get gap list for this role
    gap_result = gap_analyzer.analyze(user_skills, role)
    gap_skills = (
        [s["name"] for s in gap_result.get("missing_core_skills", [])]
        + [s["name"] for s in gap_result.get("missing_advanced_skills", [])]
        + [s["name"] for s in gap_result.get("missing_tools", [])]
    )

    if not gap_skills:
        return {"projects": [], "role": role, "message": "No gaps found — all primary skills matched!"}

    projects = get_projects_for_gaps(gap_skills, role, top_n=6)
    return {
        "projects": projects,
        "role": role,
        "total_gaps": len(gap_skills),
        "gap_skills": gap_skills,
    }

@app.get("/api/opportunities")
def get_opportunities():
    return {
        "mentors": CURATED_MENTORS,
        "opportunities": CURATED_OPPORTUNITIES
    }

@app.get("/api/profile/{profile_id}")
def fetch_profile(profile_id: str):
    profile = get_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"profile": profile}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)


from typing import Dict, List, Any

class RoadmapGenerator:
    def generate(self, gap_result: Dict[str, Any], user_skills: List[str], hours_per_week: int = 10, duration_weeks: int = 12) -> Dict[str, Any]:
        role_title = gap_result.get("role_title", "Software Engineer")
        missing_core = [s["name"] for s in gap_result.get("missing_core_skills", [])]
        missing_adv = [s["name"] for s in gap_result.get("missing_advanced_skills", [])]
        missing_tools = [s["name"] for s in gap_result.get("missing_tools", [])]

        hours_per_week = max(4, min(40, hours_per_week))
        duration_weeks = 6 if duration_weeks <= 6 else (24 if duration_weeks >= 20 else 12)

        if duration_weeks == 6:
            p1_dur = "Weeks 1 - 2"
            p2_dur = "Weeks 3 - 4"
            p3_dur = "Week 5"
            p4_dur = "Week 6"
        elif duration_weeks == 24:
            p1_dur = "Weeks 1 - 6"
            p2_dur = "Weeks 7 - 12"
            p3_dur = "Weeks 13 - 18"
            p4_dur = "Weeks 19 - 24"
        else:
            p1_dur = "Weeks 1 - 3"
            p2_dur = "Weeks 4 - 6"
            p3_dur = "Weeks 7 - 9"
            p4_dur = "Weeks 10 - 12"

        # Phase 1: Foundational Core Bridging
        p1_skills = missing_core[:2] if missing_core else ["Advanced Problem Solving", "Code Architecture"]
        phase_1 = {
            "phase_id": 1,
            "title": "Phase 1: Core Competency & Foundational Bridging",
            "duration": p1_dur,
            "focus": f"Bridge essential missing skills: {', '.join(p1_skills)}",
            "milestone_goal": "Establish working proficiency with foundational concepts and basic implementation patterns.",
            "topics": [
                f"Deep dive into {s} syntax, core APIs, and best practices" for s in p1_skills
            ] + ["Setting up standardized development environment & Git workflow"],
            "resources": [
                {"title": f"{p1_skills[0]} Official Documentation & Tutorial", "url": "https://devdocs.io", "type": "Documentation"},
                {"title": "FreeCodeCamp & CS50 Interactive Labs", "url": "https://www.freecodecamp.org", "type": "Interactive Course"}
            ],
            "project_milestone": f"Build a modular CLI or starter application integrating {', '.join(p1_skills)}."
        }

        # Phase 2: Core Engineering & Framework Integration
        p2_skills = (missing_core[2:] + missing_tools[:2]) if (len(missing_core) > 2 or missing_tools) else ["API Integration", "Testing Pipelines"]
        p2_skills = p2_skills[:3]
        phase_2 = {
            "phase_id": 2,
            "title": "Phase 2: Framework Mastery & Microservice Architecture",
            "duration": p2_dur,
            "focus": f"Hands-on integration with {', '.join(p2_skills)}",
            "milestone_goal": "Develop production-ready modules with proper data validation and error handling.",
            "topics": [
                f"Architecting robust services with {s}" for s in p2_skills
            ] + ["Unit testing, logging, and asynchronous request handling"],
            "resources": [
                {"title": "FastAPI / React Interactive Walkthrough", "url": "https://fastapi.tiangolo.com", "type": "Guide"},
                {"title": "Full Stack Open Modern Web Development", "url": "https://fullstackopen.com", "type": "Course"}
            ],
            "project_milestone": "Create a fully functional full-stack prototype with database persistence and tested endpoints."
        }

        # Phase 3: Advanced Competencies & Industry-Grade Capstone
        p3_skills = missing_adv[:3] if missing_adv else ["Performance Optimization", "Scalability & Caching"]
        recommended_projects = gap_result.get("recommended_projects", ["End-to-End Enterprise Solution"])
        capstone_project = recommended_projects[0] if recommended_projects else "Full-Scale Domain Capstone"
        
        phase_3 = {
            "phase_id": 3,
            "title": "Phase 3: Advanced Features & Capstone Engineering",
            "duration": p3_dur,
            "focus": f"Master {', '.join(p3_skills)} through an industry-grade capstone",
            "milestone_goal": "Complete an impressive end-to-end portfolio project solving a real-world problem.",
            "topics": [
                f"Implementing {s} in high-throughput workflows" for s in p3_skills
            ] + ["Benchmarking response latency, scalability, and security posture"],
            "resources": [
                {"title": "Hugging Face & DeepLearning.AI Specializations", "url": "https://www.deeplearning.ai", "type": "Specialization"},
                {"title": "System Design Primer by Donne Martin", "url": "https://github.com/donnemartin/system-design-primer", "type": "Open Source Repo"}
            ],
            "project_milestone": capstone_project
        }

        # Phase 4: Production Deployment, CI/CD & Career Launch
        phase_4 = {
            "phase_id": 4,
            "title": "Phase 4: Cloud Deployment, Open Source & Job Readiness",
            "duration": p4_dur,
            "focus": "Containerization, Cloud CI/CD deployment, and technical interview preparation",
            "milestone_goal": "Deploy live applications, publish verified GitHub repositories, and mock interview practice.",
            "topics": [
                "Multi-stage Docker builds and automated GitHub Actions CI/CD",
                "Cloud deployment on AWS / Render / Vercel with monitoring",
                "Technical system design & algorithmic interview preparation",
                "Resume ATS optimization and LinkedIn portfolio showcase"
            ],
            "resources": [
                {"title": "NeetCode / LeetCode Structured Interview Patterns", "url": "https://neetcode.io", "type": "Practice"},
                {"title": "GitHub Student Developer Pack & Cloud Credits", "url": "https://education.github.com/pack", "type": "Tooling"}
            ],
            "project_milestone": "Live public demo URL, open-source README with architectural diagrams, and video walkthrough."
        }

        # Compile skills present vs skills to add
        mastered_skills = gap_result.get("mastered_skills", user_skills)
        all_missing = [
            {"name": s["name"], "category": "Core Foundation", "priority": "High"} for s in gap_result.get("missing_core_skills", [])
        ] + [
            {"name": s["name"], "category": "Advanced Specialization", "priority": "Medium"} for s in gap_result.get("missing_advanced_skills", [])
        ] + [
            {"name": s["name"], "category": "Tools & Infrastructure", "priority": "Practical"} for s in gap_result.get("missing_tools", [])
        ]

        return {
            "target_role_id": gap_result.get("role_id", "ai_ml_engineer"),
            "target_role": role_title,
            "match_score": gap_result.get("match_score", 0),
            "readiness_tier": gap_result.get("readiness_tier", "In Progress"),
            "total_estimated_weeks": duration_weeks,
            "hours_per_week": hours_per_week,
            "daily_target_hours": round(hours_per_week / 7, 1),
            "total_study_hours": hours_per_week * duration_weeks,
            "skills_present": mastered_skills,
            "skills_to_add": all_missing,
            "phases": [phase_1, phase_2, phase_3, phase_4]
        }

roadmap_generator = RoadmapGenerator()

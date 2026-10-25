from typing import Dict, List, Any, Optional
from data.career_benchmarks import CAREER_ROLES

class SkillGapAnalyzer:
    def analyze(self, user_skills: List[str], target_role_id: str, verified_skills: Optional[List[str]] = None) -> Dict[str, Any]:
        if target_role_id not in CAREER_ROLES:
            target_role_id = "ai_ml_engineer"
            
        role = CAREER_ROLES[target_role_id]
        user_skills_set = set(s.strip().lower() for s in user_skills)
        verified_set = set(s.strip().lower() for s in (verified_skills or []))

        # Helper to check matching
        def is_mastered(skill_name: str) -> bool:
            s_low = skill_name.lower()
            return any(s_low == u or s_low in u or u in s_low for u in user_skills_set)

        def is_verified(skill_name: str) -> bool:
            s_low = skill_name.lower()
            return any(s_low == v or s_low in v or v in s_low for v in verified_set)

        # Analyze Core Skills
        mastered_core = []
        missing_core = []
        core_weighted_score = 0.0
        core_max_score = 0.0

        for skill in role["core_skills"]:
            w = skill.get("weight", 1.0)
            core_max_score += w
            if is_mastered(skill["name"]):
                ver = is_verified(skill["name"])
                earned = w * (1.15 if ver else 1.0)
                mastered_core.append({**skill, "verified": ver})
                core_weighted_score += min(w, earned)
            else:
                missing_core.append({**skill, "verified": False})

        # Analyze Advanced Skills
        mastered_adv = []
        missing_adv = []
        adv_weighted_score = 0.0
        adv_max_score = 0.0

        for skill in role["advanced_skills"]:
            w = skill.get("weight", 0.8)
            adv_max_score += w
            if is_mastered(skill["name"]):
                ver = is_verified(skill["name"])
                earned = w * (1.15 if ver else 1.0)
                mastered_adv.append({**skill, "verified": ver})
                adv_weighted_score += min(w, earned)
            else:
                missing_adv.append({**skill, "verified": False})

        # Analyze Tools
        mastered_tools = []
        missing_tools = []
        tool_weighted_score = 0.0
        tool_max_score = 0.0

        for skill in role["tools_and_infrastructure"]:
            w = skill.get("weight", 0.7)
            tool_max_score += w
            if is_mastered(skill["name"]):
                ver = is_verified(skill["name"])
                earned = w * (1.15 if ver else 1.0)
                mastered_tools.append({**skill, "verified": ver})
                tool_weighted_score += min(w, earned)
            else:
                missing_tools.append({**skill, "verified": False})

        # Total Weighted Readiness Score
        total_earned = (core_weighted_score * 0.55) + (adv_weighted_score * 0.30) + (tool_weighted_score * 0.15)
        total_possible = (core_max_score * 0.55) + (adv_max_score * 0.30) + (tool_max_score * 0.15)
        
        # Boost bonus for verified skills
        verified_count = sum(1 for s in (mastered_core + mastered_adv + mastered_tools) if s.get("verified"))
        verification_boost = min(12, verified_count * 2)

        raw_score = (total_earned / total_possible) * 100 if total_possible > 0 else 0
        match_score = round(raw_score + (verification_boost if raw_score > 0 else 0))
        match_score = max(5, min(99, match_score)) if user_skills else 0

        # Category scores
        core_readiness = round((core_weighted_score / core_max_score) * 100) if core_max_score > 0 else 0
        adv_readiness = round((adv_weighted_score / adv_max_score) * 100) if adv_max_score > 0 else 0
        tool_readiness = round((tool_weighted_score / tool_max_score) * 100) if tool_max_score > 0 else 0

        # Tier calculation
        if match_score >= 80:
            readiness_tier = "Job Ready / Advanced Candidate"
            readiness_color = "emerald"
            tier_summary = "Outstanding alignment with industry requirements. Focus on capstone portfolio polish and behavioral interview prep."
        elif match_score >= 60:
            readiness_tier = "Competitive with Minor Upskilling"
            readiness_color = "blue"
            tier_summary = "Solid technical foundation. Bridging 2-3 key missing skills will make your profile highly competitive for top internships and entry roles."
        elif match_score >= 40:
            readiness_tier = "Intermediate Learner"
            readiness_color = "amber"
            tier_summary = "Promising progress. Target the high-impact core missing competencies to unlock practical project-building capability."
        else:
            readiness_tier = "Foundational Stage"
            readiness_color = "rose"
            tier_summary = "Early in your journey. Follow the structured step-by-step roadmap to establish strong core programming and domain principles."

        # Flatten mastered skills
        all_mastered = [s["name"] for s in mastered_core + mastered_adv + mastered_tools]

        return {
            "role_id": target_role_id,
            "role_title": role["title"],
            "role_category": role["category"],
            "domain": role.get("domain", "technical"),
            "domain_label": role.get("domain_label", "Technical"),
            "icon": role.get("icon", "Code2"),
            "demand": role.get("demand", "High"),
            "growth_rate": role.get("growth_rate", "+25%"),
            "avg_salary": role.get("avg_salary", "$90,000 - $140,000 / yr"),
            "summary": role.get("summary", ""),
            "match_score": match_score,
            "readiness_tier": readiness_tier,
            "readiness_color": readiness_color,
            "tier_summary": tier_summary,
            "category_scores": {
                "core": core_readiness,
                "advanced": adv_readiness,
                "tools": tool_readiness
            },
            "mastered_skills": all_mastered,
            "mastered_core_count": len(mastered_core),
            "total_core_count": len(role["core_skills"]),
            "missing_core_skills": missing_core,
            "missing_advanced_skills": missing_adv,
            "missing_tools": missing_tools,
            "recommended_projects": role["recommended_projects"]
        }

    def analyze_all_roles(self, user_skills: List[str]) -> Dict[str, Any]:
        """Evaluates all benchmark roles against the user's skill set and identifies the best fit."""
        evaluations = []
        for role_id in CAREER_ROLES.keys():
            result = self.analyze(user_skills, role_id)
            evaluations.append({
                "role_id": role_id,
                "role_title": result["role_title"],
                "role_category": result["role_category"],
                "domain": result.get("domain", "technical"),
                "domain_label": result.get("domain_label", "Technical"),
                "icon": result["icon"],
                "demand": result["demand"],
                "growth_rate": result["growth_rate"],
                "avg_salary": result.get("avg_salary", ""),
                "summary": result.get("summary", ""),
                "match_score": result["match_score"],
                "readiness_tier": result["readiness_tier"],
                "readiness_color": result["readiness_color"],
                "mastered_skills_count": len(result["mastered_skills"]),
                "mastered_skills": result["mastered_skills"][:5],
                "missing_skills_sample": [s["name"] for s in result["missing_core_skills"][:3]]
            })

        # Sort by match score descending
        evaluations.sort(key=lambda x: x["match_score"], reverse=True)
        best_fit = evaluations[0] if evaluations else None

        suitability_reason = ""
        if best_fit:
            if best_fit["match_score"] >= 75:
                suitability_reason = f"Your resume demonstrates exceptional strength in {best_fit['role_title']} with {best_fit['match_score']}% competency alignment. Your mastered skills provide an immediate competitive edge."
            elif best_fit["match_score"] >= 50:
                suitability_reason = f"Your background shows the highest natural overlap with {best_fit['role_title']} ({best_fit['match_score']}% match). Target a few specific bridge skills to achieve top candidate status."
            else:
                suitability_reason = f"Among benchmark careers, {best_fit['role_title']} represents your strongest starting point ({best_fit['match_score']}% match). Follow the foundational roadmap to accelerate readiness."

        return {
            "best_fit_role_id": best_fit["role_id"] if best_fit else "ai_ml_engineer",
            "best_fit_role_title": best_fit["role_title"] if best_fit else "AI / Machine Learning Engineer",
            "best_fit_match_score": best_fit["match_score"] if best_fit else 0,
            "suitability_reason": suitability_reason,
            "all_role_evaluations": evaluations
        }

gap_analyzer = SkillGapAnalyzer()

import sqlite3
import json
import os
import hashlib
import uuid
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "pathfinder.db")

def hash_password(password: str, salt: str = "pathfinder_salt_2026") -> str:
    return hashlib.sha256(f"{salt}_{password}".encode('utf-8')).hexdigest()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table for secured authentication
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            target_role TEXT DEFAULT 'ai_ml_engineer',
            skills_json TEXT DEFAULT '[]',
            verified_skills_json TEXT DEFAULT '[]',
            token TEXT,
            streak_count INTEGER DEFAULT 3,
            score_history_json TEXT DEFAULT '[]',
            badges_json TEXT DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Gracefully migrate existing sqlite tables
    for col_def in [
        ("verified_skills_json", "TEXT DEFAULT '[]'"),
        ("token", "TEXT"),
        ("streak_count", "INTEGER DEFAULT 3"),
        ("score_history_json", "TEXT DEFAULT '[]'"),
        ("badges_json", "TEXT DEFAULT '[]'"),
        ("profile_json", "TEXT DEFAULT '{}'"),
        ("milestones_json", "TEXT DEFAULT '{}'"),
        ("skill_quiz_results_json", "TEXT DEFAULT '{}'")
    ]:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_def[0]} {col_def[1]}")
        except Exception:
            pass

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            target_role TEXT,
            skills_json TEXT,
            profile_score INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analysis_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id TEXT,
            role_id TEXT,
            match_score REAL,
            missing_skills_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            estimated_hours INTEGER NOT NULL,
            primary_role_tags TEXT DEFAULT '[]',
            skills_covered TEXT DEFAULT '[]',
            resource_links TEXT DEFAULT '[]',
            github_starter_url TEXT
        )
    """)

    conn.commit()
    conn.close()

def seed_projects():
    """Seed starter project data (idempotent — skips if table already has rows)."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM projects")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    PROJECTS = [
        {
            "title": "Real-Time Chat App with WebSockets",
            "description": "Build a scalable chat application supporting rooms, presence, and message history using Node.js, Express.js, and Redis pub/sub.",
            "difficulty": "Intermediate",
            "estimated_hours": 18,
            "primary_role_tags": ["backend_engineer", "full_stack_developer"],
            "skills_covered": ["Node.js", "Express.js", "Redis", "MongoDB"],
            "resource_links": [{"title": "Socket.io Docs", "url": "https://socket.io/docs"}, {"title": "Redis Quickstart", "url": "https://redis.io/docs/getting-started/"}],
            "github_starter_url": None
        },
        {
            "title": "Event-Driven Order Processing Pipeline",
            "description": "Design a microservices order system using Apache Kafka as the message broker with producer/consumer services in Node.js.",
            "difficulty": "Advanced",
            "estimated_hours": 28,
            "primary_role_tags": ["backend_engineer", "data_engineer"],
            "skills_covered": ["Apache Kafka", "Node.js", "Express.js", "MongoDB", "Docker"],
            "resource_links": [{"title": "Kafka Quickstart", "url": "https://kafka.apache.org/quickstart"}, {"title": "Confluent Platform", "url": "https://developer.confluent.io"}],
            "github_starter_url": "https://github.com/confluentinc/kafka-tutorials"
        },
        {
            "title": "REST API with PostgreSQL & Authentication",
            "description": "Build a production-grade REST API with JWT auth, role-based access control, and PostgreSQL using Node.js and Express.js.",
            "difficulty": "Intermediate",
            "estimated_hours": 16,
            "primary_role_tags": ["backend_engineer", "full_stack_developer"],
            "skills_covered": ["Node.js", "Express.js", "PostgreSQL", "Docker"],
            "resource_links": [{"title": "Express.js Guide", "url": "https://expressjs.com/en/guide/routing.html"}, {"title": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com"}],
            "github_starter_url": None
        },
        {
            "title": "Linux Sysadmin Automation Scripts",
            "description": "Write a suite of Bash scripts to automate server provisioning, log rotation, disk monitoring, and cron job management.",
            "difficulty": "Beginner",
            "estimated_hours": 10,
            "primary_role_tags": ["backend_engineer", "cloud_devops_engineer", "site_reliability_engineer"],
            "skills_covered": ["Linux / Bash", "Docker"],
            "resource_links": [{"title": "Bash Scripting Guide", "url": "https://www.gnu.org/software/bash/manual/bash.html"}, {"title": "Linux Command Reference", "url": "https://linuxcommand.org"}],
            "github_starter_url": None
        },
        {
            "title": "Cross-Platform Mobile App with React Native",
            "description": "Build a personal finance tracker app for iOS and Android with offline support, push notifications, and charts.",
            "difficulty": "Intermediate",
            "estimated_hours": 24,
            "primary_role_tags": ["mobile_developer"],
            "skills_covered": ["React Native", "TypeScript", "MongoDB"],
            "resource_links": [{"title": "React Native Docs", "url": "https://reactnative.dev/docs/getting-started"}, {"title": "Expo Go", "url": "https://expo.dev"}],
            "github_starter_url": None
        },
        {
            "title": "Flutter E-Commerce App UI Kit",
            "description": "Implement a complete e-commerce UI in Flutter with product listings, cart, checkout flow, and Firebase authentication.",
            "difficulty": "Intermediate",
            "estimated_hours": 20,
            "primary_role_tags": ["mobile_developer"],
            "skills_covered": ["Flutter", "MongoDB"],
            "resource_links": [{"title": "Flutter Docs", "url": "https://flutter.dev/docs"}, {"title": "Dart Language Tour", "url": "https://dart.dev/guides/language/language-tour"}],
            "github_starter_url": None
        },
        {
            "title": "CI/CD Pipeline with GitHub Actions & Docker",
            "description": "Build a full CI/CD pipeline for a web app: lint, test, Docker build, push to registry, and deploy to a VPS on every push.",
            "difficulty": "Intermediate",
            "estimated_hours": 14,
            "primary_role_tags": ["cloud_devops_engineer", "backend_engineer", "site_reliability_engineer"],
            "skills_covered": ["CI/CD (GitHub Actions)", "Docker", "Linux / Bash"],
            "resource_links": [{"title": "GitHub Actions Docs", "url": "https://docs.github.com/en/actions"}, {"title": "Docker Hub", "url": "https://hub.docker.com"}],
            "github_starter_url": None
        },
        {
            "title": "Kubernetes Microservices Deployment",
            "description": "Deploy a multi-service application on a local Kubernetes cluster with Helm charts, autoscaling, and health checks.",
            "difficulty": "Advanced",
            "estimated_hours": 30,
            "primary_role_tags": ["cloud_devops_engineer", "site_reliability_engineer", "backend_engineer"],
            "skills_covered": ["Kubernetes", "Docker", "Linux / Bash", "CI/CD (GitHub Actions)"],
            "resource_links": [{"title": "Kubernetes Basics", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/"}, {"title": "Helm Docs", "url": "https://helm.sh/docs"}],
            "github_starter_url": "https://github.com/kelseyhightower/kubernetes-the-hard-way"
        },
        {
            "title": "Full-Stack Next.js SaaS Starter",
            "description": "Build a subscription SaaS app with Next.js App Router, PostgreSQL, Stripe billing, and TypeScript end-to-end.",
            "difficulty": "Advanced",
            "estimated_hours": 32,
            "primary_role_tags": ["full_stack_developer", "frontend_engineer"],
            "skills_covered": ["Next.js", "TypeScript", "PostgreSQL", "Node.js"],
            "resource_links": [{"title": "Next.js App Router", "url": "https://nextjs.org/docs/app"}, {"title": "Stripe Docs", "url": "https://stripe.com/docs"}],
            "github_starter_url": "https://github.com/vercel/nextjs-subscription-payments"
        },
        {
            "title": "GraphQL API with Apollo Server",
            "description": "Replace a REST API with a GraphQL schema using Apollo Server, MongoDB, and DataLoader for N+1 batching.",
            "difficulty": "Intermediate",
            "estimated_hours": 18,
            "primary_role_tags": ["backend_engineer", "full_stack_developer"],
            "skills_covered": ["GraphQL", "Node.js", "MongoDB", "TypeScript"],
            "resource_links": [{"title": "Apollo Server Docs", "url": "https://www.apollographql.com/docs/apollo-server"}, {"title": "GraphQL.org", "url": "https://graphql.org/learn/"}],
            "github_starter_url": None
        },
        {
            "title": "ML Model Serving API with FastAPI",
            "description": "Train a Scikit-Learn classification model and expose it as a production FastAPI endpoint with input validation and rate limiting.",
            "difficulty": "Intermediate",
            "estimated_hours": 16,
            "primary_role_tags": ["ai_ml_engineer", "ml_ops_engineer"],
            "skills_covered": ["FastAPI", "Scikit-Learn", "Docker", "Python"],
            "resource_links": [{"title": "FastAPI Docs", "url": "https://fastapi.tiangolo.com"}, {"title": "Scikit-Learn Guide", "url": "https://scikit-learn.org/stable/user_guide.html"}],
            "github_starter_url": None
        },
        {
            "title": "PyTorch Image Classifier (CNN)",
            "description": "Build a convolutional neural network to classify images from a custom dataset, with training curves, confusion matrix, and TorchScript export.",
            "difficulty": "Intermediate",
            "estimated_hours": 20,
            "primary_role_tags": ["ai_ml_engineer"],
            "skills_covered": ["PyTorch", "Python", "Scikit-Learn"],
            "resource_links": [{"title": "PyTorch Tutorials", "url": "https://pytorch.org/tutorials"}, {"title": "Weights & Biases", "url": "https://wandb.ai/site"}],
            "github_starter_url": None
        },
        {
            "title": "Retrieval-Augmented Generation (RAG) Chatbot",
            "description": "Build a document Q&A chatbot using LangChain, a vector store (ChromaDB), and HuggingFace embeddings with a FastAPI backend.",
            "difficulty": "Advanced",
            "estimated_hours": 26,
            "primary_role_tags": ["ai_ml_engineer", "ml_ops_engineer"],
            "skills_covered": ["PyTorch", "FastAPI", "Python", "Docker"],
            "resource_links": [{"title": "LangChain Docs", "url": "https://docs.langchain.com"}, {"title": "ChromaDB Guide", "url": "https://docs.trychroma.com"}],
            "github_starter_url": None
        },
        {
            "title": "AWS Serverless Data Pipeline",
            "description": "Build an ETL pipeline using AWS Lambda, S3, and Glue to process CSV data and load into Redshift with CloudWatch monitoring.",
            "difficulty": "Advanced",
            "estimated_hours": 25,
            "primary_role_tags": ["data_engineer", "cloud_devops_engineer", "ml_ops_engineer"],
            "skills_covered": ["AWS", "Python", "CI/CD (GitHub Actions)", "Linux / Bash"],
            "resource_links": [{"title": "AWS Lambda Docs", "url": "https://docs.aws.amazon.com/lambda"}, {"title": "AWS Glue", "url": "https://aws.amazon.com/glue"}],
            "github_starter_url": None
        },
        {
            "title": "Data Streaming Dashboard with Kafka & MongoDB",
            "description": "Ingest real-time sensor data through Apache Kafka consumers, store in MongoDB, and visualize on a live dashboard.",
            "difficulty": "Advanced",
            "estimated_hours": 30,
            "primary_role_tags": ["data_engineer", "backend_engineer"],
            "skills_covered": ["Apache Kafka", "MongoDB", "Node.js", "Docker"],
            "resource_links": [{"title": "MongoDB Change Streams", "url": "https://www.mongodb.com/docs/manual/changeStreams"}, {"title": "Kafka Connect", "url": "https://kafka.apache.org/documentation/#connect"}],
            "github_starter_url": None
        },
        {
            "title": "TypeScript Design Patterns Library",
            "description": "Implement 10 classic GoF design patterns in TypeScript with unit tests, JSDoc documentation, and a published npm package.",
            "difficulty": "Beginner",
            "estimated_hours": 12,
            "primary_role_tags": ["full_stack_developer", "frontend_engineer", "backend_engineer"],
            "skills_covered": ["TypeScript", "Node.js"],
            "resource_links": [{"title": "TypeScript Handbook", "url": "https://www.typescriptlang.org/docs/handbook"}, {"title": "Refactoring Guru", "url": "https://refactoring.guru/design-patterns"}],
            "github_starter_url": None
        },
        {
            "title": "Redis Caching Layer for a REST API",
            "description": "Add an intelligent Redis caching layer with TTL, cache invalidation strategies, and hit-rate monitoring to an existing Express API.",
            "difficulty": "Beginner",
            "estimated_hours": 9,
            "primary_role_tags": ["backend_engineer", "site_reliability_engineer"],
            "skills_covered": ["Redis", "Node.js", "Express.js"],
            "resource_links": [{"title": "Redis Node.js Client", "url": "https://github.com/redis/node-redis"}, {"title": "Redis Caching Patterns", "url": "https://redis.io/docs/manual/patterns/"}],
            "github_starter_url": None
        },
        {
            "title": "PostgreSQL Performance Tuning Lab",
            "description": "Optimize slow queries using EXPLAIN ANALYZE, add strategic indexes, set up pg_stat_statements, and configure connection pooling with PgBouncer.",
            "difficulty": "Intermediate",
            "estimated_hours": 12,
            "primary_role_tags": ["backend_engineer", "data_engineer"],
            "skills_covered": ["PostgreSQL", "Linux / Bash"],
            "resource_links": [{"title": "EXPLAIN ANALYZE Guide", "url": "https://www.postgresql.org/docs/current/sql-explain.html"}, {"title": "PgBouncer Docs", "url": "https://www.pgbouncer.org/usage.html"}],
            "github_starter_url": None
        },
        {
            "title": "Blockchain Token Smart Contract (Solidity)",
            "description": "Write, test, and deploy an ERC-20 token smart contract on a local Hardhat network with a React.js frontend using ethers.js.",
            "difficulty": "Advanced",
            "estimated_hours": 22,
            "primary_role_tags": ["blockchain_engineer"],
            "skills_covered": ["Node.js", "TypeScript", "React Native"],
            "resource_links": [{"title": "Hardhat Docs", "url": "https://hardhat.org/getting-started"}, {"title": "OpenZeppelin Contracts", "url": "https://docs.openzeppelin.com/contracts"}],
            "github_starter_url": None
        },
        {
            "title": "TensorFlow Object Detection Pipeline",
            "description": "Fine-tune a pre-trained SSD MobileNet model on a custom dataset using TensorFlow Object Detection API and export for edge inference.",
            "difficulty": "Advanced",
            "estimated_hours": 24,
            "primary_role_tags": ["ai_ml_engineer"],
            "skills_covered": ["TensorFlow", "Python", "Docker"],
            "resource_links": [{"title": "TF Object Detection API", "url": "https://tensorflow-object-detection-api-tutorial.readthedocs.io"}, {"title": "TF Model Garden", "url": "https://github.com/tensorflow/models"}],
            "github_starter_url": None
        },
    ]

    for p in PROJECTS:
        cursor.execute("""
            INSERT INTO projects
                (title, description, difficulty, estimated_hours, primary_role_tags, skills_covered, resource_links, github_starter_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["title"], p["description"], p["difficulty"], p["estimated_hours"],
            json.dumps(p["primary_role_tags"]), json.dumps(p["skills_covered"]),
            json.dumps(p["resource_links"]), p["github_starter_url"]
        ))

    conn.commit()
    conn.close()


def get_projects_for_gaps(gap_skills: List[str], role_id: str, top_n: int = 6) -> List[Dict[str, Any]]:
    """Return top_n projects ranked by overlap with gap_skills, annotated with matched_skills."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, description, difficulty, estimated_hours, primary_role_tags, skills_covered, resource_links, github_starter_url FROM projects")
    rows = cursor.fetchall()
    conn.close()

    gap_set = set(s.strip().lower() for s in gap_skills)

    scored = []
    for row in rows:
        proj_id, title, description, difficulty, hours, role_tags_json, skills_json, links_json, github_url = row
        try:
            skills_covered = json.loads(skills_json)
        except Exception:
            skills_covered = []
        try:
            role_tags = json.loads(role_tags_json)
        except Exception:
            role_tags = []
        try:
            resource_links = json.loads(links_json)
        except Exception:
            resource_links = []

        # Find matching gaps
        matched = [s for s in skills_covered if s.strip().lower() in gap_set]
        if not matched:
            continue

        # Ranking: overlap count (primary), role match (secondary)
        role_bonus = 1 if role_id in role_tags else 0
        score = len(matched) * 10 + role_bonus

        scored.append({
            "id": proj_id,
            "title": title,
            "description": description,
            "difficulty": difficulty,
            "estimated_hours": hours,
            "primary_role_tags": role_tags,
            "skills_covered": skills_covered,
            "matched_skills": matched,
            "resource_links": resource_links,
            "github_starter_url": github_url,
            "_score": score,
        })

    scored.sort(key=lambda x: x["_score"], reverse=True)
    results = scored[:top_n]
    for r in results:
        del r["_score"]
    return results


import secrets

def create_user(name: str, email: str, password: str, target_role: str = "ai_ml_engineer", skills: Optional[List[str]] = None) -> Dict[str, Any]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    user_id = str(uuid.uuid4())[:8]
    pwd_hash = hash_password(password)
    skills_json = json.dumps(skills or [])
    auth_token = secrets.token_hex(24)
    initial_score_history = json.dumps([
        {"date": "Day 1", "score": 35},
        {"date": "Day 3", "score": 45},
        {"date": "Day 5", "score": 60},
        {"date": "Today", "score": 75}
    ])
    initial_badges = json.dumps(["Profile Activated 🎯", "First Analysis 🚀"])
    
    try:
        cursor.execute("""
            INSERT INTO users (id, name, email, password_hash, target_role, skills_json, verified_skills_json, token, streak_count, score_history_json, badges_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, name.strip(), email.strip().lower(), pwd_hash, target_role, skills_json, '[]', auth_token, 4, initial_score_history, initial_badges))
        conn.commit()
        return {
            "id": user_id,
            "name": name.strip(),
            "email": email.strip().lower(),
            "target_role": target_role,
            "skills": skills or [],
            "verified_skills": [],
            "token": auth_token,
            "streak_count": 4,
            "score_history": json.loads(initial_score_history),
            "badges": json.loads(initial_badges)
        }
    except sqlite3.IntegrityError:
        raise ValueError("User with this email already exists.")
    finally:
        conn.close()

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    pwd_hash = hash_password(password)
    
    cursor.execute("""
        SELECT id, name, email, target_role, skills_json, verified_skills_json, token, streak_count, score_history_json, badges_json, profile_json, milestones_json, skill_quiz_results_json, created_at
        FROM users
        WHERE email = ? AND password_hash = ?
    """, (email.strip().lower(), pwd_hash))
    row = cursor.fetchone()
    
    if row:
        token = row[6]
        if not token:
            token = secrets.token_hex(24)
            cursor.execute("UPDATE users SET token = ? WHERE id = ?", (token, row[0]))
            conn.commit()
            
        skills = []
        try: skills = json.loads(row[4]) if row[4] else []
        except Exception: skills = []

        verified_skills = []
        try: verified_skills = json.loads(row[5]) if row[5] else []
        except Exception: verified_skills = []

        score_history = []
        try: score_history = json.loads(row[8]) if row[8] else []
        except Exception: score_history = [
            {"date": "Day 1", "score": 35},
            {"date": "Day 3", "score": 45},
            {"date": "Day 5", "score": 60},
            {"date": "Today", "score": 75}
        ]

        badges = []
        try: badges = json.loads(row[9]) if row[9] else []
        except Exception: badges = ["Profile Activated 🎯", "First Analysis 🚀"]

        profile = {}
        try: profile = json.loads(row[10]) if row[10] else {}
        except Exception: profile = {}

        milestones = {}
        try: milestones = json.loads(row[11]) if row[11] else {}
        except Exception: milestones = {}

        skill_quiz_results = {}
        try: skill_quiz_results = json.loads(row[12]) if row[12] else {}
        except Exception: skill_quiz_results = {}

        conn.close()
        return {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "target_role": row[3],
            "skills": skills,
            "verified_skills": verified_skills,
            "token": token,
            "streak_count": row[7] if row[7] is not None else 4,
            "score_history": score_history,
            "badges": badges,
            "profile": profile,
            "milestones": milestones,
            "skill_quiz_results": skill_quiz_results,
            "created_at": row[13]
        }
    conn.close()
    return None

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, email, target_role, skills_json, verified_skills_json, token, streak_count, score_history_json, badges_json, profile_json, milestones_json, skill_quiz_results_json, created_at
        FROM users
        WHERE email = ?
    """, (email.strip().lower(),))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        skills = []
        try: skills = json.loads(row[4]) if row[4] else []
        except Exception: skills = []

        verified_skills = []
        try: verified_skills = json.loads(row[5]) if row[5] else []
        except Exception: verified_skills = []

        score_history = []
        try: score_history = json.loads(row[8]) if row[8] else []
        except Exception: score_history = [
            {"date": "Day 1", "score": 35},
            {"date": "Day 3", "score": 45},
            {"date": "Day 5", "score": 60},
            {"date": "Today", "score": 75}
        ]

        badges = []
        try: badges = json.loads(row[9]) if row[9] else []
        except Exception: badges = ["Profile Activated 🎯", "First Analysis 🚀"]

        profile = {}
        try: profile = json.loads(row[10]) if row[10] else {}
        except Exception: profile = {}

        milestones = {}
        try: milestones = json.loads(row[11]) if row[11] else {}
        except Exception: milestones = {}

        skill_quiz_results = {}
        try: skill_quiz_results = json.loads(row[12]) if row[12] else {}
        except Exception: skill_quiz_results = {}

        return {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "target_role": row[3],
            "skills": skills,
            "verified_skills": verified_skills,
            "token": row[6] or "auth_demo_token_2026",
            "streak_count": row[7] if row[7] is not None else 4,
            "score_history": score_history,
            "badges": badges,
            "profile": profile,
            "milestones": milestones,
            "skill_quiz_results": skill_quiz_results,
            "created_at": row[13]
        }
    return None

def update_user_profile(
    email: str,
    name: Optional[str] = None,
    target_role: Optional[str] = None,
    skills: Optional[List[str]] = None,
    verified_skills: Optional[List[str]] = None,
    streak_count: Optional[int] = None,
    score_history: Optional[List[Dict[str, Any]]] = None,
    badges: Optional[List[str]] = None,
    profile: Optional[Dict[str, Any]] = None,
    milestones: Optional[Dict[str, Any]] = None,
    skill_quiz_results: Optional[Dict[str, Any]] = None
) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    updates = []
    params = []
    if name is not None and name.strip():
        updates.append("name = ?")
        params.append(name.strip())
    if target_role:
        updates.append("target_role = ?")
        params.append(target_role)
    if skills is not None:
        updates.append("skills_json = ?")
        params.append(json.dumps(skills))
    if verified_skills is not None:
        updates.append("verified_skills_json = ?")
        params.append(json.dumps(verified_skills))
    if streak_count is not None:
        updates.append("streak_count = ?")
        params.append(streak_count)
    if score_history is not None:
        updates.append("score_history_json = ?")
        params.append(json.dumps(score_history))
    if badges is not None:
        updates.append("badges_json = ?")
        params.append(json.dumps(badges))
    if profile is not None:
        updates.append("profile_json = ?")
        params.append(json.dumps(profile))
    if milestones is not None:
        updates.append("milestones_json = ?")
        params.append(json.dumps(milestones))
    if skill_quiz_results is not None:
        updates.append("skill_quiz_results_json = ?")
        params.append(json.dumps(skill_quiz_results))
    
    if not updates:
        conn.close()
        return True
        
    params.append(email.strip().lower())
    sql = f"UPDATE users SET {', '.join(updates)} WHERE email = ?"
    cursor.execute(sql, tuple(params))
    conn.commit()
    affected = cursor.rowcount > 0
    conn.close()
    return affected

def save_profile(profile_id: str, name: str, email: str, target_role: str, skills: List[str], score: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO profiles (id, name, email, target_role, skills_json, profile_score)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (profile_id, name, email, target_role, json.dumps(skills), score))
    conn.commit()
    conn.close()

def get_profile(profile_id: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, target_role, skills_json, profile_score, created_at FROM profiles WHERE id = ?", (profile_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "target_role": row[3],
            "skills": json.loads(row[4]),
            "profile_score": row[5],
            "created_at": row[6]
        }
    return None

init_db()
seed_projects()

-- ==============================================================================
-- LIVE WELL CLINICAL & LIFESTYLE DATABASE SCHEMA
-- Based on the book: "LIVE WELL: 8 habits to highly effective Health and Happiness"
-- Author: Dr. Murthy Gokula, MD, CMD, Dip ABLM, Dip FAAARM (Copyright © 2025)
-- Database Engine: SQLite / PostgreSQL Compatible DDL
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Book & Framework Metadata
CREATE TABLE IF NOT EXISTS book_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    author TEXT NOT NULL,
    co_authors TEXT NOT NULL,
    copyright_year INTEGER NOT NULL,
    summary TEXT NOT NULL
);

-- 2. Six Pillars of Lifestyle Medicine (ABLM Standards)
CREATE TABLE IF NOT EXISTS lifestyle_pillars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pillar_number INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    cellular_benefits TEXT NOT NULL,
    clinical_evidence TEXT
);

-- 3. Nine Hallmarks of Longevity & Cellular Aging Engines
CREATE TABLE IF NOT EXISTS hallmarks_of_aging (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hallmark_number INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL UNIQUE,
    biological_mechanism TEXT NOT NULL,
    disease_reversal_strategy TEXT NOT NULL
);

-- 4. Mapping: Lifestyle Pillars to Hallmarks of Aging (Table 4 in book)
CREATE TABLE IF NOT EXISTS pillar_hallmark_map (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pillar_id INTEGER NOT NULL,
    hallmark_id INTEGER NOT NULL,
    reversal_mechanism TEXT NOT NULL,
    FOREIGN KEY (pillar_id) REFERENCES lifestyle_pillars(id) ON DELETE CASCADE,
    FOREIGN KEY (hallmark_id) REFERENCES hallmarks_of_aging(id) ON DELETE CASCADE
);

-- 5. The 8 Superheroes / Habits of Vitality (Chapter 11)
CREATE TABLE IF NOT EXISTS habits_superpowers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_number INTEGER NOT NULL UNIQUE,
    superhero_name TEXT NOT NULL,
    domain TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    superpower_check_questions TEXT NOT NULL,
    morning_routine TEXT,
    meal_guidance TEXT,
    evening_wind_down TEXT,
    synergistic_helpers TEXT
);

-- 6. Ashtanga Yoga 8 Limbs (Mind-Body Alignment, Table 1 in book)
CREATE TABLE IF NOT EXISTS ashtanga_limbs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    limb_number INTEGER NOT NULL UNIQUE,
    sanskrit_name TEXT NOT NULL UNIQUE,
    english_name TEXT NOT NULL,
    core_focus TEXT NOT NULL,
    health_impact TEXT NOT NULL,
    pathway_type TEXT NOT NULL CHECK(pathway_type IN ('Health Transformation', 'Happiness & Inner Peace'))
);

-- 7. Eight Interconnected Drivers of Chronic Disease (Table 2 in book)
CREATE TABLE IF NOT EXISTS chronic_disease_drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_name TEXT NOT NULL UNIQUE,
    ashtanga_alignment TEXT NOT NULL,
    microhabit_example TEXT NOT NULL,
    evidence_impact TEXT NOT NULL
);

-- 8. "MY GOAL DO IT" 10-Step Microhabit Framework
CREATE TABLE IF NOT EXISTS my_goal_do_it_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    step_order INTEGER NOT NULL UNIQUE,
    letter TEXT NOT NULL,
    step_name TEXT NOT NULL,
    description TEXT NOT NULL,
    behavioral_science_principle TEXT NOT NULL
);

-- 9. Microhabits Directory (Categorized by Chronic Disease Driver and MY GOAL DO IT step)
CREATE TABLE IF NOT EXISTS microhabits_catalog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER NOT NULL,
    step_id INTEGER NOT NULL,
    microhabit_text TEXT NOT NULL,
    implementation_tip TEXT,
    FOREIGN KEY (driver_id) REFERENCES chronic_disease_drivers(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES my_goal_do_it_steps(id) ON DELETE CASCADE
);

-- 10. Clinical Quizzes & Questionnaires Directory
CREATE TABLE IF NOT EXISTS clinical_quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    chapter_source TEXT NOT NULL,
    target_condition TEXT NOT NULL,
    instructions TEXT NOT NULL,
    scoring_scale_type TEXT NOT NULL CHECK(scoring_scale_type IN ('yes_no_count', 'weighted_points', 'likert_4_point')),
    max_possible_score INTEGER NOT NULL
);

-- 11. Individual Screening Questions for each Quiz
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    points_weight INTEGER NOT NULL DEFAULT 1,
    options_json TEXT NOT NULL, -- JSON array of [{label: "...", points: 0}, ...]
    category TEXT,
    FOREIGN KEY (quiz_id) REFERENCES clinical_quizzes(id) ON DELETE CASCADE
);

-- 12. Quiz Scoring Rules & Clinical Triage Recommendations
CREATE TABLE IF NOT EXISTS quiz_scoring_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    risk_level TEXT NOT NULL CHECK(risk_level IN ('Low', 'Mild', 'Moderate', 'High', 'Severe')),
    min_score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    label TEXT NOT NULL,
    clinical_interpretation TEXT NOT NULL,
    recommended_actions TEXT NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES clinical_quizzes(id) ON DELETE CASCADE
);

-- 13. Evidence-Based Therapeutic Supplements & Botanicals (Table 5 & Fullscript protocols)
CREATE TABLE IF NOT EXISTS therapeutic_supplements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    mechanism_and_evidence TEXT NOT NULL,
    typical_dosage_and_notes TEXT NOT NULL,
    primary_indications TEXT NOT NULL,
    fullscript_protocol_name TEXT
);

-- 14. Clinical Laboratory Biomarkers (Insurance vs. Functional Longevity)
CREATE TABLE IF NOT EXISTS lab_biomarkers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_name TEXT NOT NULL,
    coverage_category TEXT NOT NULL CHECK(coverage_category IN ('Insurance Covered', 'Functional / Out of Pocket')),
    target_system TEXT NOT NULL,
    clinical_significance TEXT NOT NULL
);

-- 15. Patient Assessment Submissions
CREATE TABLE IF NOT EXISTS patient_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    quiz_id INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    clinical_summary TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES clinical_quizzes(id) ON DELETE CASCADE
);

-- 16. Patient Assessment Answer Details
CREATE TABLE IF NOT EXISTS patient_assessment_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_value TEXT NOT NULL,
    points_awarded INTEGER NOT NULL,
    FOREIGN KEY (assessment_id) REFERENCES patient_assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

-- 17. Patient Daily Microhabit Tracking Logs
CREATE TABLE IF NOT EXISTS patient_habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    microhabit_id INTEGER NOT NULL,
    log_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (microhabit_id) REFERENCES microhabits_catalog(id) ON DELETE CASCADE
);

-- Create Indexes for Fast Clinical Querying
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scoring_quiz ON quiz_scoring_rules(quiz_id);
CREATE INDEX IF NOT EXISTS idx_microhabits_driver ON microhabits_catalog(driver_id);
CREATE INDEX IF NOT EXISTS idx_microhabits_step ON microhabits_catalog(step_id);
CREATE INDEX IF NOT EXISTS idx_patient_assessments_user ON patient_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_answers_assessment ON patient_assessment_answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_patient_logs_user ON patient_habit_logs(user_id, log_date);

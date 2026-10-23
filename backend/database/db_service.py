import os
import sqlite3
import json
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "livewell.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


class LiveWellDBService:
    @staticmethod
    def get_overview() -> Dict[str, Any]:
        """Returns the high-level summary of book metadata, pillars, habits, and quizzes."""
        conn = get_db()
        cur = conn.cursor()

        cur.execute("SELECT * FROM book_metadata LIMIT 1")
        meta = dict(cur.fetchone() or {})

        cur.execute(
            "SELECT id, pillar_number, name, summary FROM lifestyle_pillars"
            " ORDER BY pillar_number"
        )
        pillars = [dict(r) for r in cur.fetchall()]

        cur.execute(
            "SELECT id, habit_number, superhero_name, domain, tagline FROM"
            " habits_superpowers ORDER BY habit_number"
        )
        habits = [dict(r) for r in cur.fetchall()]

        cur.execute(
            "SELECT id, quiz_code, title, chapter_source, target_condition,"
            " max_possible_score FROM clinical_quizzes"
        )
        quizzes = [dict(r) for r in cur.fetchall()]

        conn.close()
        return {
            "metadata": meta,
            "pillars_count": len(pillars),
            "pillars": pillars,
            "habits_count": len(habits),
            "habits": habits,
            "quizzes_count": len(quizzes),
            "quizzes": quizzes,
        }

    @staticmethod
    def get_habits() -> List[Dict[str, Any]]:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT * FROM habits_superpowers ORDER BY habit_number")
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows

    @staticmethod
    def get_pillars_and_hallmarks() -> Dict[str, Any]:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("SELECT * FROM lifestyle_pillars ORDER BY pillar_number")
        pillars = [dict(r) for r in cur.fetchall()]

        cur.execute("SELECT * FROM hallmarks_of_aging ORDER BY hallmark_number")
        hallmarks = [dict(r) for r in cur.fetchall()]

        cur.execute("""
            SELECT m.id, p.name as pillar_name, h.name as hallmark_name, m.reversal_mechanism
            FROM pillar_hallmark_map m
            JOIN lifestyle_pillars p ON m.pillar_id = p.id
            JOIN hallmarks_of_aging h ON m.hallmark_id = h.id
            ORDER BY p.pillar_number, h.hallmark_number
        """)
        mappings = [dict(r) for r in cur.fetchall()]

        conn.close()
        return {
            "pillars": pillars,
            "hallmarks": hallmarks,
            "mappings": mappings,
        }

    @staticmethod
    def get_ashtanga_and_drivers() -> Dict[str, Any]:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("SELECT * FROM ashtanga_limbs ORDER BY limb_number")
        limbs = [dict(r) for r in cur.fetchall()]

        cur.execute("SELECT * FROM chronic_disease_drivers ORDER BY id")
        drivers = [dict(r) for r in cur.fetchall()]

        conn.close()
        return {"ashtanga_limbs": limbs, "chronic_disease_drivers": drivers}

    @staticmethod
    def get_microhabits(
        driver_name: Optional[str] = None, step_letter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        conn = get_db()
        cur = conn.cursor()

        query = """
            SELECT m.id, d.driver_name, s.letter, s.step_name, m.microhabit_text, m.implementation_tip
            FROM microhabits_catalog m
            JOIN chronic_disease_drivers d ON m.driver_id = d.id
            JOIN my_goal_do_it_steps s ON m.step_id = s.id
            WHERE 1=1
        """
        params = []
        if driver_name:
            query += " AND LOWER(d.driver_name) = LOWER(?)"
            params.append(driver_name)
        if step_letter:
            query += " AND UPPER(s.letter) = UPPER(?)"
            params.append(step_letter)

        query += " ORDER BY d.id, s.step_order"
        cur.execute(query, params)
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows

    @staticmethod
    def get_quizzes() -> List[Dict[str, Any]]:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT q.id, q.quiz_code, q.title, q.chapter_source, q.target_condition,
                   q.instructions, q.scoring_scale_type, q.max_possible_score,
                   COUNT(qq.id) as questions_count
            FROM clinical_quizzes q
            LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
            GROUP BY q.id
            ORDER BY q.id
        """)
        quizzes = [dict(r) for r in cur.fetchall()]
        conn.close()
        return quizzes

    @staticmethod
    def get_quiz_by_code(quiz_code: str) -> Optional[Dict[str, Any]]:
        conn = get_db()
        cur = conn.cursor()

        cur.execute(
            "SELECT * FROM clinical_quizzes WHERE LOWER(quiz_code) ="
            " LOWER(?)",
            (quiz_code,),
        )
        quiz = cur.fetchone()
        if not quiz:
            conn.close()
            return None

        quiz_dict = dict(quiz)

        cur.execute(
            """
            SELECT id, question_number, question_text, points_weight, options_json, category
            FROM quiz_questions
            WHERE quiz_id = ?
            ORDER BY question_number
        """,
            (quiz_dict["id"],),
        )
        questions = []
        for r in cur.fetchall():
            q_row = dict(r)
            q_row["options"] = json.loads(q_row["options_json"])
            del q_row["options_json"]
            questions.append(q_row)

        cur.execute(
            """
            SELECT risk_level, min_score, max_score, label, clinical_interpretation, recommended_actions
            FROM quiz_scoring_rules
            WHERE quiz_id = ?
            ORDER BY min_score
        """,
            (quiz_dict["id"],),
        )
        scoring_rules = [dict(r) for r in cur.fetchall()]

        conn.close()
        quiz_dict["questions"] = questions
        quiz_dict["scoring_rules"] = scoring_rules
        return quiz_dict

    @staticmethod
    def evaluate_quiz(
        quiz_code: str, answers: Dict[int, Any], user_id: str = "guest"
    ) -> Dict[str, Any]:
        """Evaluates patient quiz responses, computes risk score, matches risk rule, and records assessment."""
        quiz_data = LiveWellDBService.get_quiz_by_code(quiz_code)
        if not quiz_data:
            raise ValueError(f"Unknown quiz code: {quiz_code}")

        questions = quiz_data["questions"]
        scoring_rules = quiz_data["scoring_rules"]

        total_score = 0
        detailed_answers = []

        for q in questions:
            q_num = q["question_number"]
            # Answer can be boolean, int, or string
            raw_val = answers.get(q_num, answers.get(str(q_num), 0))
            pts = 0

            # Find matching option points
            for opt in q["options"]:
                if isinstance(raw_val, bool):
                    if (raw_val and opt["label"].startswith("Yes")) or (
                        not raw_val and opt["label"].startswith("No")
                    ):
                        pts = opt["points"]
                        break
                elif isinstance(raw_val, (int, float)):
                    if opt["points"] == raw_val:
                        pts = opt["points"]
                        break
                    elif raw_val == 1 and opt["label"].startswith("Yes"):
                        pts = opt["points"]
                        break
                    elif raw_val == 0 and opt["label"].startswith("No"):
                        pts = opt["points"]
                        break
                elif str(raw_val).lower() in opt["label"].lower():
                    pts = opt["points"]
                    break

            total_score += pts
            detailed_answers.append({
                "question_id": q["id"],
                "question_number": q_num,
                "question_text": q["question_text"],
                "category": q["category"],
                "answer_value": str(raw_val),
                "points_awarded": pts,
            })

        # Find matching risk rule
        matched_rule = None
        for rule in scoring_rules:
            if rule["min_score"] <= total_score <= rule["max_score"]:
                matched_rule = rule
                break

        if not matched_rule and scoring_rules:
            matched_rule = (
                scoring_rules[-1]
                if total_score > scoring_rules[-1]["max_score"]
                else scoring_rules[0]
            )

        # Store assessment in database
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO patient_assessments (user_id, quiz_id, total_score, risk_level, clinical_summary)
            VALUES (?, ?, ?, ?, ?)
        """,
            (
                user_id,
                quiz_data["id"],
                total_score,
                matched_rule["risk_level"] if matched_rule else "Evaluated",
                matched_rule["clinical_interpretation"] if matched_rule else "",
            ),
        )
        assessment_id = cur.lastrowid

        for da in detailed_answers:
            cur.execute(
                """
                INSERT INTO patient_assessment_answers (assessment_id, question_id, answer_value, points_awarded)
                VALUES (?, ?, ?, ?)
            """,
                (
                    assessment_id,
                    da["question_id"],
                    da["answer_value"],
                    da["points_awarded"],
                ),
            )

        conn.commit()
        conn.close()

        return {
            "assessment_id": assessment_id,
            "user_id": user_id,
            "quiz_code": quiz_code,
            "quiz_title": quiz_data["title"],
            "total_score": total_score,
            "max_possible_score": quiz_data["max_possible_score"],
            "risk_level": (
                matched_rule["risk_level"] if matched_rule else "Unclassified"
            ),
            "label": matched_rule["label"] if matched_rule else "",
            "clinical_interpretation": (
                matched_rule["clinical_interpretation"] if matched_rule else ""
            ),
            "recommended_actions": (
                matched_rule["recommended_actions"] if matched_rule else ""
            ),
            "detailed_answers": detailed_answers,
        }

    @staticmethod
    def get_therapeutic_supplements() -> List[Dict[str, Any]]:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT * FROM therapeutic_supplements ORDER BY id")
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows

    @staticmethod
    def get_lab_biomarkers(
        category: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        conn = get_db()
        cur = conn.cursor()
        if category:
            cur.execute(
                "SELECT * FROM lab_biomarkers WHERE LOWER(coverage_category) ="
                " LOWER(?) ORDER BY id",
                (category,),
            )
        else:
            cur.execute("SELECT * FROM lab_biomarkers ORDER BY id")
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows

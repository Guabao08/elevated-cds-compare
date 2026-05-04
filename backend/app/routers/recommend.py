from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app import models, schemas
from app.config import settings
import google.generativeai as genai
import json

router = APIRouter(prefix="/recommend", tags=["recommend"])

genai.configure(api_key=settings.gemini_api_key)

def _score_school(school: models.School, req: schemas.RecommendRequest) -> float:
    score = 50.0

    # GPA → acceptance rate proxy (rough mapping)
    if school.acceptance_rate is not None:
        if req.gpa >= 3.9:
            score += (1 - school.acceptance_rate) * 10
        elif req.gpa >= 3.5:
            score += (1 - abs(school.acceptance_rate - 0.4)) * 10
        else:
            score += school.acceptance_rate * 10

    # SAT fit
    if req.sat and school.sat_avg:
        diff = abs(req.sat - school.sat_avg)
        score -= min(diff / 50, 15)

    # Budget fit
    if req.budget and school.tuition_out_state:
        if school.tuition_out_state <= req.budget:
            score += 10
        else:
            score -= min((school.tuition_out_state - req.budget) / 5000, 20)

    # Size preference
    if req.school_size and school.size_category == req.school_size:
        score += 8

    # Locale preference
    if req.locale_preference and school.locale == req.locale_preference:
        score += 8

    # State preference
    if req.state_preference and school.state == req.state_preference.upper():
        score += 5

    # Graduation rate bonus
    if school.graduation_rate:
        score += school.graduation_rate * 10

    return round(min(max(score, 0), 100), 1)


def _assign_tier(score: float, acceptance_rate: float | None, gpa: float) -> str:
    # Tier logic: compare applicant to typical admits
    if acceptance_rate is None:
        if score >= 75:
            return "Target"
        return "Safety"
    if acceptance_rate < 0.15:
        return "Reach"
    if acceptance_rate < 0.50 and gpa < 3.7:
        return "Reach"
    if acceptance_rate >= 0.70 or (score >= 70 and acceptance_rate >= 0.50):
        return "Safety"
    return "Target"


@router.post("", response_model=schemas.RecommendResponse)
async def recommend(req: schemas.RecommendRequest, db: Session = Depends(get_db)):
    # Step 1: filter schools by hard constraints
    query = db.query(models.School)
    if req.budget:
        query = query.filter(
            or_(
                models.School.tuition_out_state <= req.budget * 1.3,
                models.School.avg_net_price <= req.budget,
                models.School.tuition_out_state.is_(None),
            )
        )
    if req.school_size:
        query = query.filter(models.School.size_category == req.school_size)
    if req.locale_preference:
        query = query.filter(models.School.locale == req.locale_preference)

    candidates = query.limit(500).all()

    # Step 2: score and sort
    scored = [(school, _score_school(school, req)) for school in candidates]
    scored.sort(key=lambda x: x[1], reverse=True)
    top = scored[:12]

    if not top:
        raise HTTPException(status_code=404, detail="No schools matched your criteria. Try relaxing filters.")

    # Step 3: send top candidates to Gemini for reasoning
    school_summaries = []
    for school, fit_score in top:
        school_summaries.append({
            "id": school.id,
            "name": school.name,
            "state": school.state,
            "acceptance_rate": school.acceptance_rate,
            "sat_avg": school.sat_avg,
            "tuition_out_state": school.tuition_out_state,
            "graduation_rate": school.graduation_rate,
            "median_earnings_10yr": school.median_earnings_10yr,
            "size_category": school.size_category,
            "locale": school.locale,
            "top_programs": school.top_programs,
            "fit_score": fit_score,
        })

    prompt = f"""You are a college admissions counselor helping a student find the best-fit schools.

Student Profile:
- GPA: {req.gpa}
- SAT: {req.sat or "not provided"}
- ACT: {req.act or "not provided"}
- Budget (annual): ${req.budget or "no limit"}
- Intended major: {req.intended_major or "undecided"}
- Preferred school size: {req.school_size or "no preference"}
- Preferred locale: {req.locale_preference or "no preference"}
- State preference: {req.state_preference or "none"}
- Priorities: {", ".join(req.priorities) if req.priorities else "none specified"}

Candidate Schools (pre-filtered and scored by fit algorithm):
{json.dumps(school_summaries, indent=2)}

For each school, write a 2-sentence personalized explanation of why it's a good match for this student specifically.
Classify each as "Reach", "Target", or "Safety" based on the student's GPA/SAT vs the school's typical admit profile.

Also write a 1-sentence profile_summary describing this student's application profile overall.

Respond with valid JSON in this exact structure:
{{
  "profile_summary": "...",
  "schools": [
    {{
      "id": <school_id>,
      "tier": "Reach|Target|Safety",
      "reasoning": "2-sentence explanation"
    }},
    ...
  ]
}}"""

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        gemini_data = json.loads(text)
    except Exception as e:
        # Fallback: use algorithmic tiers and generic reasoning
        gemini_data = {
            "profile_summary": f"A student with a {req.gpa} GPA seeking colleges that match their academic profile and budget.",
            "schools": [
                {
                    "id": s.id,
                    "tier": _assign_tier(score, s.acceptance_rate, req.gpa),
                    "reasoning": f"{s.name} aligns with your academic profile with a {round((s.acceptance_rate or 0)*100)}% acceptance rate. It offers strong outcomes with a {round((s.graduation_rate or 0)*100)}% graduation rate."
                }
                for s, score in top
            ]
        }

    # Build response
    school_map = {s.id: (s, score) for s, score in top}
    result_schools = []
    for item in gemini_data.get("schools", []):
        sid = item.get("id")
        if sid in school_map:
            school, fit_score = school_map[sid]
            result_schools.append(schemas.RecommendedSchool(
                school=schemas.SchoolBase.model_validate(school),
                tier=item.get("tier", _assign_tier(fit_score, school.acceptance_rate, req.gpa)),
                fit_score=fit_score,
                reasoning=item.get("reasoning", ""),
            ))

    return schemas.RecommendResponse(
        profile_summary=gemini_data.get("profile_summary", ""),
        schools=result_schools,
    )

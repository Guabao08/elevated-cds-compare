"""
Fetches school data from the College Scorecard API and seeds the PostgreSQL database.
Run inside Docker: docker compose exec backend python scripts/seed_data.py
Or locally: python scripts/seed_data.py (with DATABASE_URL set)
"""
import os
import sys
import httpx
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base, School

DATABASE_URL = os.environ["DATABASE_URL"]
API_KEY = os.environ["COLLEGE_SCORECARD_API_KEY"]
BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools"

FIELDS = ",".join([
    "id",
    "school.name",
    "school.city",
    "school.state",
    "school.zip",
    "school.school_url",
    "school.ownership",
    "school.locale",
    "school.hbcu",
    "school.hispanic_serving",
    "school.women_only",
    "school.men_only",
    "latest.student.size",
    "latest.admissions.admission_rate.overall",
    "latest.admissions.sat_scores.average.overall",
    "latest.admissions.act_scores.midpoint.cumulative",
    "latest.cost.tuition.in_state",
    "latest.cost.tuition.out_of_state",
    "latest.cost.avg_net_price.public",
    "latest.cost.avg_net_price.private",
    "latest.aid.median_debt.completers.overall",
    "latest.completion.rate_suppressed.overall",
    "latest.student.retention_rate.four_year.full_time",
    "latest.earnings.10_yrs_after_entry.median",
    "latest.academics.program_percentage.computer",
    "latest.academics.program_percentage.business_marketing",
    "latest.academics.program_percentage.engineering",
    "latest.academics.program_percentage.biological",
    "latest.academics.program_percentage.health",
    "latest.academics.program_percentage.social_science",
    "latest.academics.program_percentage.psychology",
    "latest.academics.program_percentage.communication",
    "latest.academics.program_percentage.visual_performing",
    "latest.academics.program_percentage.education",
])

OWNERSHIP_MAP = {1: "Public", 2: "Private nonprofit", 3: "Private for-profit"}
LOCALE_MAP = {
    11: "City", 12: "City", 13: "City",
    21: "Suburb", 22: "Suburb", 23: "Suburb",
    31: "Town", 32: "Town", 33: "Town",
    41: "Rural", 42: "Rural", 43: "Rural",
}
PROGRAM_LABELS = {
    "computer": "Computer Science",
    "business_marketing": "Business",
    "engineering": "Engineering",
    "biological": "Biology",
    "health": "Health Sciences",
    "social_science": "Social Sciences",
    "psychology": "Psychology",
    "communication": "Communications",
    "visual_performing": "Arts",
    "education": "Education",
}

def size_category(n):
    if n is None:
        return None
    if n < 2000:
        return "Small"
    if n < 15000:
        return "Medium"
    return "Large"

def top_programs(r):
    prog = {}
    for key, label in PROGRAM_LABELS.items():
        val = r.get(f"latest.academics.program_percentage.{key}")
        if val and val > 0.02:
            prog[label] = val
    top = sorted(prog.items(), key=lambda x: x[1], reverse=True)[:5]
    return ", ".join(lbl for lbl, _ in top) if top else None

def fetch_page(page: int, per_page: int = 100):
    params = {
        "api_key": API_KEY,
        "fields": FIELDS,
        "per_page": per_page,
        "page": page,
    }
    resp = httpx.get(BASE_URL, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()

def run():
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    existing_ids = {r[0] for r in db.query(School.scorecard_id).all()}
    print(f"Existing schools in DB: {len(existing_ids)}")

    total_inserted = 0
    page = 0
    per_page = 100

    print("Fetching first page to get total count...")
    first = fetch_page(0, per_page)
    total = first["metadata"]["total"]
    total_pages = (total + per_page - 1) // per_page
    print(f"Total schools available: {total} across {total_pages} pages")

    all_pages_data = [first["results"]]

    for p in range(1, min(total_pages, 60)):  # cap at ~6000 schools
        try:
            data = fetch_page(p, per_page)
            all_pages_data.append(data["results"])
            if p % 10 == 0:
                print(f"  Fetched page {p}/{min(total_pages, 60)}")
            time.sleep(0.1)
        except Exception as e:
            print(f"  Error on page {p}: {e}")
            time.sleep(2)

    print(f"Processing {sum(len(r) for r in all_pages_data)} records...")

    for results in all_pages_data:
        batch = []
        for r in results:
            sid = r.get("id")
            if sid in existing_ids:
                continue

            # API returns flat dot-notation keys
            g = lambda key, default=None: r.get(key, default)

            name = g("school.name")
            if not name:
                continue  # skip records with no name

            avg_net = g("latest.cost.avg_net_price.public") or g("latest.cost.avg_net_price.private")

            school = School(
                scorecard_id=sid,
                name=name,
                city=g("school.city"),
                state=g("school.state"),
                zip_code=str(g("school.zip", ""))[:10],
                url=g("school.school_url"),
                school_type=OWNERSHIP_MAP.get(g("school.ownership")),
                locale=LOCALE_MAP.get(g("school.locale")),
                size_category=size_category(g("latest.student.size")),
                acceptance_rate=g("latest.admissions.admission_rate.overall"),
                sat_avg=g("latest.admissions.sat_scores.average.overall"),
                act_midpoint=g("latest.admissions.act_scores.midpoint.cumulative"),
                tuition_in_state=g("latest.cost.tuition.in_state"),
                tuition_out_state=g("latest.cost.tuition.out_of_state"),
                avg_net_price=avg_net,
                median_debt=g("latest.aid.median_debt.completers.overall"),
                graduation_rate=g("latest.completion.rate_suppressed.overall"),
                retention_rate=g("latest.student.retention_rate.four_year.full_time"),
                median_earnings_10yr=g("latest.earnings.10_yrs_after_entry.median"),
                undergrad_enrollment=g("latest.student.size"),
                hbcu=bool(g("school.hbcu")),
                hispanic_serving=bool(g("school.hispanic_serving")),
                womens_only=bool(g("school.women_only")),
                mens_only=bool(g("school.men_only")),
                top_programs=top_programs(r),
            )
            batch.append(school)
            existing_ids.add(sid)

        if batch:
            db.bulk_save_objects(batch)
            db.commit()
            total_inserted += len(batch)

    print(f"\nDone. Inserted {total_inserted} new schools. Total in DB: {db.query(School).count()}")
    db.close()

if __name__ == "__main__":
    run()

from pydantic import BaseModel
from typing import Optional

class SchoolBase(BaseModel):
    id: int
    scorecard_id: Optional[int] = None
    name: str
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    url: Optional[str] = None
    school_type: Optional[str] = None
    locale: Optional[str] = None
    size_category: Optional[str] = None
    acceptance_rate: Optional[float] = None
    sat_avg: Optional[float] = None
    act_midpoint: Optional[float] = None
    tuition_in_state: Optional[int] = None
    tuition_out_state: Optional[int] = None
    avg_net_price: Optional[int] = None
    median_debt: Optional[int] = None
    graduation_rate: Optional[float] = None
    retention_rate: Optional[float] = None
    median_earnings_10yr: Optional[int] = None
    undergrad_enrollment: Optional[int] = None
    hbcu: Optional[bool] = False
    hispanic_serving: Optional[bool] = False
    womens_only: Optional[bool] = False
    mens_only: Optional[bool] = False
    top_programs: Optional[str] = None

    class Config:
        from_attributes = True

class SchoolList(BaseModel):
    total: int
    page: int
    per_page: int
    results: list[SchoolBase]

class RecommendRequest(BaseModel):
    gpa: float
    sat: Optional[int] = None
    act: Optional[int] = None
    budget: Optional[int] = None
    state_preference: Optional[str] = None
    intended_major: Optional[str] = None
    school_size: Optional[str] = None   # Small / Medium / Large
    locale_preference: Optional[str] = None
    priorities: Optional[list[str]] = None  # e.g. ["strong research", "low debt", "warm weather"]

class RecommendedSchool(BaseModel):
    school: SchoolBase
    tier: str   # "Reach" | "Target" | "Safety"
    fit_score: float
    reasoning: str

class RecommendResponse(BaseModel):
    profile_summary: str
    schools: list[RecommendedSchool]

from sqlalchemy import Column, Integer, String, Float, Boolean, Text
from app.database import Base

class School(Base):
    __tablename__ = "schools"

    id = Column(Integer, primary_key=True, index=True)
    scorecard_id = Column(Integer, unique=True, index=True)
    name = Column(String, index=True, nullable=False)
    city = Column(String)
    state = Column(String(2), index=True)
    zip_code = Column(String(10))
    url = Column(String)
    school_type = Column(String)          # Public / Private nonprofit / Private for-profit
    locale = Column(String)               # City / Suburb / Town / Rural
    size_category = Column(String)        # Small / Medium / Large

    # Admissions
    acceptance_rate = Column(Float)       # 0-1
    sat_avg = Column(Float)
    act_midpoint = Column(Float)

    # Cost
    tuition_in_state = Column(Integer)
    tuition_out_state = Column(Integer)
    avg_net_price = Column(Integer)
    median_debt = Column(Integer)

    # Outcomes
    graduation_rate = Column(Float)       # 0-1
    retention_rate = Column(Float)        # 0-1
    median_earnings_10yr = Column(Integer)

    # Size
    undergrad_enrollment = Column(Integer)

    # Flags
    hbcu = Column(Boolean, default=False)
    hispanic_serving = Column(Boolean, default=False)
    womens_only = Column(Boolean, default=False)
    mens_only = Column(Boolean, default=False)

    # Top programs (comma-separated)
    top_programs = Column(Text)

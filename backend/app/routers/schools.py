from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Optional
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/schools", tags=["schools"])

@router.get("", response_model=schemas.SchoolList)
def list_schools(
    q: Optional[str] = None,
    state: Optional[str] = None,
    school_type: Optional[str] = None,
    locale: Optional[str] = None,
    size_category: Optional[str] = None,
    min_acceptance: Optional[float] = None,
    max_acceptance: Optional[float] = None,
    max_tuition: Optional[int] = None,
    min_grad_rate: Optional[float] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    sort_by: str = Query("name", enum=["name", "acceptance_rate", "tuition_out_state", "graduation_rate", "median_earnings_10yr", "undergrad_enrollment"]),
    sort_dir: str = Query("asc", enum=["asc", "desc"]),
    db: Session = Depends(get_db),
):
    query = db.query(models.School)

    if q:
        query = query.filter(
            or_(
                models.School.name.ilike(f"%{q}%"),
                models.School.city.ilike(f"%{q}%"),
            )
        )
    if state:
        query = query.filter(models.School.state == state.upper())
    if school_type:
        query = query.filter(models.School.school_type == school_type)
    if locale:
        query = query.filter(models.School.locale == locale)
    if size_category:
        query = query.filter(models.School.size_category == size_category)
    if min_acceptance is not None:
        query = query.filter(models.School.acceptance_rate >= min_acceptance)
    if max_acceptance is not None:
        query = query.filter(models.School.acceptance_rate <= max_acceptance)
    if max_tuition is not None:
        query = query.filter(
            or_(
                models.School.tuition_out_state <= max_tuition,
                models.School.tuition_out_state.is_(None),
            )
        )
    if min_grad_rate is not None:
        query = query.filter(models.School.graduation_rate >= min_grad_rate)

    total = query.count()

    sort_col = getattr(models.School, sort_by, models.School.name)
    if sort_dir == "desc":
        query = query.order_by(sort_col.desc().nulls_last())
    else:
        query = query.order_by(sort_col.asc().nulls_last())

    results = query.offset((page - 1) * per_page).limit(per_page).all()

    return schemas.SchoolList(total=total, page=page, per_page=per_page, results=results)


@router.get("/{school_id}", response_model=schemas.SchoolBase)
def get_school(school_id: int, db: Session = Depends(get_db)):
    school = db.query(models.School).filter(models.School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    return school


@router.get("/compare/batch", response_model=list[schemas.SchoolBase])
def compare_schools(ids: str, db: Session = Depends(get_db)):
    id_list = [int(i) for i in ids.split(",") if i.strip().isdigit()][:3]
    if not id_list:
        raise HTTPException(status_code=400, detail="Provide up to 3 comma-separated school IDs")
    schools = db.query(models.School).filter(models.School.id.in_(id_list)).all()
    return schools

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    return analytics_service.get_summary(db)


@router.get("/by-department")
def by_department(db: Session = Depends(get_db)):
    return analytics_service.get_by_department(db)


@router.get("/by-country")
def by_country(db: Session = Depends(get_db)):
    return analytics_service.get_by_country(db)


@router.get("/distribution")
def distribution(db: Session = Depends(get_db)):
    return analytics_service.get_distribution(db)
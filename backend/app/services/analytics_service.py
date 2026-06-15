from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models import Employee


def get_summary(db: Session):
    result = db.query(
        func.count(Employee.id).label("headcount"),
        func.avg(Employee.base_salary).label("avg_salary"),
        func.min(Employee.base_salary).label("min_salary"),
        func.max(Employee.base_salary).label("max_salary"),
    ).filter(Employee.status == "active").one()

    salaries = [r[0] for r in db.query(Employee.base_salary)
                .filter(Employee.status == "active").all()]
    salaries.sort()
    mid = len(salaries) // 2
    median = (
        (salaries[mid - 1] + salaries[mid]) / 2
        if len(salaries) % 2 == 0 else salaries[mid]
    ) if salaries else 0

    return {
        "headcount": result.headcount,
        "avg_salary": round(result.avg_salary or 0, 2),
        "median_salary": round(median, 2),
        "min_salary": round(result.min_salary or 0, 2),
        "max_salary": round(result.max_salary or 0, 2),
    }


def get_by_department(db: Session):
    rows = db.query(
        Employee.department,
        func.count(Employee.id).label("headcount"),
        func.avg(Employee.base_salary).label("avg_salary"),
        func.min(Employee.base_salary).label("min_salary"),
        func.max(Employee.base_salary).label("max_salary"),
    ).filter(Employee.status == "active").group_by(Employee.department).all()

    return [
        {
            "department": r.department,
            "headcount": r.headcount,
            "avg_salary": round(r.avg_salary or 0, 2),
            "min_salary": round(r.min_salary or 0, 2),
            "max_salary": round(r.max_salary or 0, 2),
        }
        for r in rows
    ]


def get_by_country(db: Session):
    rows = db.query(
        Employee.country,
        Employee.currency,
        func.count(Employee.id).label("headcount"),
        func.avg(Employee.base_salary).label("avg_salary"),
        func.min(Employee.base_salary).label("min_salary"),
        func.max(Employee.base_salary).label("max_salary"),
    ).filter(Employee.status == "active").group_by(Employee.country, Employee.currency).all()

    return [
        {
            "country": r.country,
            "currency": r.currency,
            "headcount": r.headcount,
            "avg_salary": round(r.avg_salary or 0, 2),
            "min_salary": round(r.min_salary or 0, 2),
            "max_salary": round(r.max_salary or 0, 2),
        }
        for r in rows
    ]


def get_distribution(db: Session, buckets: int = 10):
    salaries = [r[0] for r in db.query(Employee.base_salary)
                .filter(Employee.status == "active").all()]
    if not salaries:
        return []

    min_s, max_s = min(salaries), max(salaries)
    step = (max_s - min_s) / buckets
    if step == 0:
        return [{"range": f"{int(min_s)}", "count": len(salaries)}]

    distribution = []
    for i in range(buckets):
        low = min_s + i * step
        high = low + step
        if i == buckets - 1:
            count = sum(1 for s in salaries if low <= s <= high)
        else:
            count = sum(1 for s in salaries if low <= s < high)
        distribution.append({
            "range": f"{int(low/1000)}k–{int(high/1000)}k",
            "count": count
        })
    return distribution
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import EmployeeCreate, EmployeeUpdate, EmployeeOut, EmployeeListResponse
from app.services import employee_service
import csv
import io

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=EmployeeListResponse)
def list_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    search: str = Query(None),
    department: str = Query(None),
    country: str = Query(None),
    employment_type: str = Query(None),
    status: str = Query("active"),
    db: Session = Depends(get_db)
):
    total, results = employee_service.get_employees(
        db, page, page_size, search, department, country, employment_type, status
    )
    return EmployeeListResponse(
        total=total, page=page, page_size=page_size, results=results
    )


@router.post("", response_model=EmployeeOut, status_code=201)
def create_employee(data: EmployeeCreate, db: Session = Depends(get_db)):
    try:
        return employee_service.create_employee(db, data)
    except Exception as e:
        db.rollback()
        if "UNIQUE constraint failed: employees.email" in str(e):
            raise HTTPException(status_code=409, detail="An employee with this email already exists.")
        raise HTTPException(status_code=500, detail="Failed to create employee.")

@router.get("/export")
def export_employees(
    search: str = Query(None),
    department: str = Query(None),
    country: str = Query(None),
    employment_type: str = Query(None),
    status: str = Query("active"),
    db: Session = Depends(get_db)
):
    _, results = employee_service.get_employees(
        db, page=1, page_size=10000,
        search=search, department=department,
        country=country, employment_type=employment_type, status=status
    )
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "employee_id", "first_name", "last_name", "email",
        "department", "job_title", "country", "currency",
        "base_salary", "employment_type", "status"
    ])
    for e in results:
        writer.writerow([
            e.employee_id, e.first_name, e.last_name, e.email,
            e.department, e.job_title, e.country, e.currency,
            e.base_salary, e.employment_type, e.status
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=employees.csv"}
    )


@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = employee_service.get_employee_by_id(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id: str, data: EmployeeUpdate, db: Session = Depends(get_db)):
    emp = employee_service.update_employee(db, employee_id, data)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


@router.patch("/{employee_id}/deactivate", response_model=EmployeeOut)
def deactivate_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = employee_service.deactivate_employee(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


@router.get("/{employee_id}/audit")
def get_audit(employee_id: str, db: Session = Depends(get_db)):
    return employee_service.get_audit_log(db, employee_id)
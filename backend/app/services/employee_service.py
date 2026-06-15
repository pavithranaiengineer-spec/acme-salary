from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import Employee, SalaryAuditLog
from app.schemas import EmployeeCreate, EmployeeUpdate, VALID_COUNTRIES
import uuid


def generate_employee_id(db: Session) -> str:
    count = db.query(Employee).count()
    return f"EMP-{str(count + 1).zfill(5)}"


def get_employees(
    db: Session,
    page: int = 1,
    page_size: int = 50,
    search: str = None,
    department: str = None,
    country: str = None,
    employment_type: str = None,
    status: str = "active"
):
    query = db.query(Employee)

    if status:
        query = query.filter(Employee.status == status)
    if department:
        query = query.filter(Employee.department == department)
    if country:
        query = query.filter(Employee.country == country)
    if employment_type:
        query = query.filter(Employee.employment_type == employment_type)

    if search:
        search = search.strip()
        # full name search: "erin lee" → split and match first+last
        parts = search.split()
        if len(parts) >= 2:
            query = query.filter(
                or_(
                    # "erin lee" matches first=erin, last=lee
                    (Employee.first_name.ilike(f"%{parts[0]}%") &
                     Employee.last_name.ilike(f"%{parts[1]}%")),
                    # also try reverse: "lee erin"
                    (Employee.first_name.ilike(f"%{parts[1]}%") &
                     Employee.last_name.ilike(f"%{parts[0]}%")),
                    Employee.employee_id.ilike(f"%{search}%"),
                )
            )
        else:
            query = query.filter(
                or_(
                    Employee.first_name.ilike(f"%{search}%"),
                    Employee.last_name.ilike(f"%{search}%"),
                    Employee.employee_id.ilike(f"%{search}%"),
                )
            )

    total = query.count()

    # Sort: exact first name match first, then alphabetical
    if search and len(search.split()) == 1:
        from sqlalchemy import case
        query = query.order_by(
            case(
                (Employee.first_name.ilike(search), 0),
                else_=1
            ),
            Employee.first_name
        )
    else:
        query = query.order_by(Employee.first_name)

    results = query.offset((page - 1) * page_size).limit(page_size).all()
    return total, results

def get_employee_by_id(db: Session, employee_id: str):
    return db.query(Employee).filter(Employee.id == employee_id).first()


def create_employee(db: Session, data: EmployeeCreate) -> Employee:
    currency = VALID_COUNTRIES[data.country]
    emp = Employee(
        id=str(uuid.uuid4()),
        employee_id=generate_employee_id(db),
        currency=currency,
        **data.model_dump()
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp


def update_employee(db: Session, employee_id: str, data: EmployeeUpdate) -> Employee:
    emp = get_employee_by_id(db, employee_id)
    if not emp:
        return None

    updates = data.model_dump(exclude_unset=True)

    for field, new_value in updates.items():
        old_value = getattr(emp, field)
        if old_value != new_value:
            log = SalaryAuditLog(
                employee_id=emp.id,
                field_changed=field,
                old_value=str(old_value),
                new_value=str(new_value),
                changed_by="HR Manager"
            )
            db.add(log)
            setattr(emp, field, new_value)

        if field == "country":
            emp.currency = VALID_COUNTRIES.get(new_value, emp.currency)

    db.commit()
    db.refresh(emp)
    return emp


def deactivate_employee(db: Session, employee_id: str) -> Employee:
    emp = get_employee_by_id(db, employee_id)
    if not emp:
        return None
    emp.status = "inactive"
    db.add(SalaryAuditLog(
        employee_id=emp.id,
        field_changed="status",
        old_value="active",
        new_value="inactive",
        changed_by="HR Manager"
    ))
    db.commit()
    db.refresh(emp)
    return emp


def get_audit_log(db: Session, employee_id: str):
    return (
        db.query(SalaryAuditLog)
        .filter(SalaryAuditLog.employee_id == employee_id)
        .order_by(SalaryAuditLog.changed_at.desc())
        .all()
    )
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Integer, ForeignKey, Text
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Employee(Base):
    __tablename__ = "employees"

    id = Column(String, primary_key=True, default=generate_uuid)
    employee_id = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    department = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    country = Column(String, nullable=False)
    currency = Column(String, nullable=False)
    base_salary = Column(Float, nullable=False)
    employment_type = Column(String, nullable=False)  # full_time | part_time | contractor
    status = Column(String, default="active")          # active | inactive
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SalaryAuditLog(Base):
    __tablename__ = "salary_audit_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    field_changed = Column(String, nullable=False)
    old_value = Column(Text)
    new_value = Column(Text)
    changed_by = Column(String, default="HR Manager")
    changed_at = Column(DateTime, default=datetime.utcnow)
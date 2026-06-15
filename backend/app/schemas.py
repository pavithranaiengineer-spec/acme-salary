from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Literal
from datetime import datetime


VALID_DEPARTMENTS = [
    "Engineering", "Product", "Design", "Marketing", "Sales",
    "Finance", "HR", "Operations", "Legal", "Customer Support"
]

VALID_COUNTRIES = {
    "India": "INR", "USA": "USD", "UK": "GBP",
    "Germany": "EUR", "Canada": "CAD", "Australia": "AUD",
    "Singapore": "SGD", "UAE": "AED"
}


class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    department: str
    job_title: str
    country: str
    base_salary: float
    employment_type: Literal["full_time", "part_time", "contractor"]

    @field_validator("base_salary")
    @classmethod
    def salary_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("base_salary must be greater than 0")
        return v

    @field_validator("department")
    @classmethod
    def valid_department(cls, v):
        if v not in VALID_DEPARTMENTS:
            raise ValueError(f"Invalid department: {v}")
        return v

    @field_validator("country")
    @classmethod
    def valid_country(cls, v):
        if v not in VALID_COUNTRIES:
            raise ValueError(f"Invalid country: {v}")
        return v


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    country: Optional[str] = None
    base_salary: Optional[float] = None
    employment_type: Optional[Literal["full_time", "part_time", "contractor"]] = None

    @field_validator("base_salary")
    @classmethod
    def salary_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("base_salary must be greater than 0")
        return v


class EmployeeOut(BaseModel):
    id: str
    employee_id: str
    first_name: str
    last_name: str
    email: str
    department: str
    job_title: str
    country: str
    currency: str
    base_salary: float
    employment_type: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EmployeeListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    results: list[EmployeeOut]


class AuditLogOut(BaseModel):
    id: int
    employee_id: str
    field_changed: str
    old_value: Optional[str]
    new_value: Optional[str]
    changed_by: str
    changed_at: datetime

    model_config = {"from_attributes": True}
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from faker import Faker
from app.database import SessionLocal, engine, Base
from app.models import Employee
import uuid
import random

Base.metadata.create_all(bind=engine)
fake = Faker()

DEPARTMENTS = [
    "Engineering", "Product", "Design", "Marketing", "Sales",
    "Finance", "HR", "Operations", "Legal", "Customer Support"
]

COUNTRIES = {
    "India": "INR",
    "USA": "USD",
    "UK": "GBP",
    "Germany": "EUR",
    "Canada": "CAD",
    "Australia": "AUD",
    "Singapore": "SGD",
    "UAE": "AED"
}

SALARY_BANDS = {
    "Engineering":      (60000,  200000),
    "Product":          (70000,  180000),
    "Design":           (55000,  150000),
    "Marketing":        (45000,  130000),
    "Sales":            (40000,  160000),
    "Finance":          (55000,  160000),
    "HR":               (40000,  120000),
    "Operations":       (35000,  110000),
    "Legal":            (70000,  200000),
    "Customer Support": (30000,   90000),
}

JOB_TITLES = {
    "Engineering":      ["Software Engineer", "Senior Engineer", "Staff Engineer", "Engineering Manager"],
    "Product":          ["Product Manager", "Senior PM", "Director of Product"],
    "Design":           ["UI Designer", "UX Designer", "Senior Designer", "Design Lead"],
    "Marketing":        ["Marketing Analyst", "Content Strategist", "Growth Manager"],
    "Sales":            ["Sales Rep", "Account Executive", "Sales Manager"],
    "Finance":          ["Financial Analyst", "Accountant", "Finance Manager"],
    "HR":               ["HR Generalist", "Recruiter", "HR Manager"],
    "Operations":       ["Operations Analyst", "Ops Manager", "Business Analyst"],
    "Legal":            ["Legal Counsel", "Paralegal", "Senior Counsel"],
    "Customer Support": ["Support Agent", "Senior Support", "Support Lead"],
}

EMPLOYMENT_TYPES = ["full_time", "part_time", "contractor"]
EMPLOYMENT_WEIGHTS = [0.75, 0.10, 0.15]

COUNTRY_WEIGHTS = [0.35, 0.25, 0.10, 0.10, 0.05, 0.05, 0.05, 0.05]


def seed(n: int = 10000):
    db = SessionLocal()
    existing = db.query(Employee).count()
    if existing > 0:
        print(f"DB already has {existing} employees. Skipping seed.")
        db.close()
        return

    print(f"Seeding {n} employees...")
    country_list = list(COUNTRIES.keys())
    batch = []

    for i in range(1, n + 1):
        dept = random.choice(DEPARTMENTS)
        country = random.choices(country_list, weights=COUNTRY_WEIGHTS, k=1)[0]
        currency = COUNTRIES[country]
        low, high = SALARY_BANDS[dept]
        salary = round(random.uniform(low, high), 2)
        emp_type = random.choices(EMPLOYMENT_TYPES, weights=EMPLOYMENT_WEIGHTS, k=1)[0]
        status = "active" if random.random() > 0.05 else "inactive"

        emp = Employee(
            id=str(uuid.uuid4()),
            employee_id=f"EMP-{str(i).zfill(5)}",
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            email=fake.unique.email(),
            department=dept,
            job_title=random.choice(JOB_TITLES[dept]),
            country=country,
            currency=currency,
            base_salary=salary,
            employment_type=emp_type,
            status=status,
        )
        batch.append(emp)

        if i % 500 == 0:
            db.bulk_save_objects(batch)
            db.commit()
            batch = []
            print(f"  {i}/{n} inserted...")

    if batch:
        db.bulk_save_objects(batch)
        db.commit()

    db.close()
    print("Seeding complete.")


if __name__ == "__main__":
    seed()
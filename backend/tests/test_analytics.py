import pytest


def create_emp(client, email, department, country, salary, employment_type="full_time"):
    return client.post("/employees", json={
        "first_name": "Test",
        "last_name": "User",
        "email": email,
        "department": department,
        "job_title": "Analyst",
        "country": country,
        "base_salary": salary,
        "employment_type": employment_type
    })


def test_summary_empty(client):
    res = client.get("/analytics/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["headcount"] == 0
    assert data["avg_salary"] == 0


def test_summary_with_employees(client):
    create_emp(client, "a@acme.com", "Engineering", "India", 100000)
    create_emp(client, "b@acme.com", "Engineering", "India", 200000)
    res = client.get("/analytics/summary")
    data = res.json()
    assert data["headcount"] == 2
    assert data["avg_salary"] == 150000.0
    assert data["min_salary"] == 100000.0
    assert data["max_salary"] == 200000.0
    assert data["median_salary"] == 150000.0


def test_summary_median_odd(client):
    create_emp(client, "a@acme.com", "Engineering", "India", 100000)
    create_emp(client, "b@acme.com", "Finance", "USA", 200000)
    create_emp(client, "c@acme.com", "HR", "UK", 300000)
    data = client.get("/analytics/summary").json()
    assert data["median_salary"] == 200000.0


def test_by_department(client):
    create_emp(client, "a@acme.com", "Engineering", "India", 100000)
    create_emp(client, "b@acme.com", "Engineering", "USA", 200000)
    create_emp(client, "c@acme.com", "Finance", "UK", 90000)
    res = client.get("/analytics/by-department")
    assert res.status_code == 200
    data = res.json()
    eng = next(d for d in data if d["department"] == "Engineering")
    assert eng["headcount"] == 2
    assert eng["avg_salary"] == 150000.0
    fin = next(d for d in data if d["department"] == "Finance")
    assert fin["headcount"] == 1


def test_by_country(client):
    create_emp(client, "a@acme.com", "Engineering", "India", 100000)
    create_emp(client, "b@acme.com", "Engineering", "India", 200000)
    create_emp(client, "c@acme.com", "Finance", "USA", 150000)
    res = client.get("/analytics/by-country")
    assert res.status_code == 200
    data = res.json()
    india = next(d for d in data if d["country"] == "India")
    assert india["headcount"] == 2
    assert india["currency"] == "INR"
    usa = next(d for d in data if d["country"] == "USA")
    assert usa["headcount"] == 1
    assert usa["currency"] == "USD"


def test_distribution(client):
    salaries = [50000, 100000, 150000, 200000, 250000]
    for i, s in enumerate(salaries):
        create_emp(client, f"user{i}@acme.com", "Engineering", "India", s)
    res = client.get("/analytics/distribution")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 10
    total = sum(d["count"] for d in data)
    assert total == 5


def test_inactive_excluded_from_analytics(client):
    create_emp(client, "a@acme.com", "Engineering", "India", 100000)
    emp = create_emp(client, "b@acme.com", "Engineering", "India", 900000).json()
    client.patch(f"/employees/{emp['id']}/deactivate")
    data = client.get("/analytics/summary").json()
    assert data["headcount"] == 1
    assert data["avg_salary"] == 100000.0   
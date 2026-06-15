import pytest


@pytest.fixture
def sample_employee():
    return {
        "first_name": "Jane",
        "last_name": "Doe",
        "email": "jane.doe@acme.com",
        "department": "Engineering",
        "job_title": "Software Engineer",
        "country": "India",
        "base_salary": 120000,
        "employment_type": "full_time"
    }


# --- CREATE ---

def test_create_employee_success(client, sample_employee):
    res = client.post("/employees", json=sample_employee)
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "jane.doe@acme.com"
    assert data["currency"] == "INR"
    assert data["employee_id"] == "EMP-00001"
    assert data["status"] == "active"


def test_create_employee_invalid_salary(client, sample_employee):
    sample_employee["base_salary"] = -5000
    res = client.post("/employees", json=sample_employee)
    assert res.status_code == 422


def test_create_employee_invalid_department(client, sample_employee):
    sample_employee["department"] = "Wizardry"
    res = client.post("/employees", json=sample_employee)
    assert res.status_code == 422


def test_create_employee_invalid_country(client, sample_employee):
    sample_employee["country"] = "Mars"
    res = client.post("/employees", json=sample_employee)
    assert res.status_code == 422


def test_create_employee_invalid_employment_type(client, sample_employee):
    sample_employee["employment_type"] = "intern"
    res = client.post("/employees", json=sample_employee)
    assert res.status_code == 422


# --- READ ---

def test_list_employees_empty(client):
    res = client.get("/employees")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 0
    assert data["results"] == []


def test_list_employees_returns_created(client, sample_employee):
    client.post("/employees", json=sample_employee)
    res = client.get("/employees")
    assert res.status_code == 200
    assert res.json()["total"] == 1


def test_get_employee_by_id(client, sample_employee):
    created = client.post("/employees", json=sample_employee).json()
    res = client.get(f"/employees/{created['id']}")
    assert res.status_code == 200
    assert res.json()["email"] == "jane.doe@acme.com"


def test_get_employee_not_found(client):
    res = client.get("/employees/nonexistent-id")
    assert res.status_code == 404


# --- SEARCH & FILTER ---

def test_search_by_name(client, sample_employee):
    client.post("/employees", json=sample_employee)
    res = client.get("/employees?search=Jane")
    assert res.status_code == 200
    assert res.json()["total"] == 1


def test_search_no_match(client, sample_employee):
    client.post("/employees", json=sample_employee)
    res = client.get("/employees?search=xyz_nobody")
    assert res.json()["total"] == 0


def test_filter_by_department(client, sample_employee):
    client.post("/employees", json=sample_employee)
    res = client.get("/employees?department=Engineering")
    assert res.json()["total"] == 1
    res2 = client.get("/employees?department=Finance")
    assert res2.json()["total"] == 0


def test_filter_by_country(client, sample_employee):
    client.post("/employees", json=sample_employee)
    res = client.get("/employees?country=India")
    assert res.json()["total"] == 1


def test_pagination(client, sample_employee):
    for i in range(5):
        emp = sample_employee.copy()
        emp["email"] = f"user{i}@acme.com"
        client.post("/employees", json=emp)
    res = client.get("/employees?page=1&page_size=2")
    data = res.json()
    assert data["total"] == 5
    assert len(data["results"]) == 2


# --- UPDATE ---

def test_update_salary(client, sample_employee):
    created = client.post("/employees", json=sample_employee).json()
    res = client.put(f"/employees/{created['id']}", json={"base_salary": 150000})
    assert res.status_code == 200
    assert res.json()["base_salary"] == 150000


def test_update_creates_audit_log(client, sample_employee):
    created = client.post("/employees", json=sample_employee).json()
    client.put(f"/employees/{created['id']}", json={"base_salary": 150000})
    audit = client.get(f"/employees/{created['id']}/audit").json()
    assert len(audit) == 1
    assert audit[0]["field_changed"] == "base_salary"
    assert audit[0]["old_value"] == "120000.0"
    assert audit[0]["new_value"] == "150000.0"


def test_update_country_updates_currency(client, sample_employee):
    created = client.post("/employees", json=sample_employee).json()
    res = client.put(f"/employees/{created['id']}", json={"country": "USA"})
    assert res.json()["currency"] == "USD"


def test_update_invalid_salary(client, sample_employee):
    created = client.post("/employees", json=sample_employee).json()
    res = client.put(f"/employees/{created['id']}", json={"base_salary": 0})
    assert res.status_code == 422


def test_update_not_found(client):
    res = client.put("/employees/bad-id", json={"base_salary": 100000})
    assert res.status_code == 404


# --- DEACTIVATE ---

def test_deactivate_employee(client, sample_employee):
    created = client.post("/employees", json=sample_employee).json()
    res = client.patch(f"/employees/{created['id']}/deactivate")
    assert res.status_code == 200
    assert res.json()["status"] == "inactive"


def test_deactivated_employee_hidden_by_default(client, sample_employee):
    created = client.post("/employees", json=sample_employee).json()
    client.patch(f"/employees/{created['id']}/deactivate")
    res = client.get("/employees")
    assert res.json()["total"] == 0


def test_deactivated_employee_visible_with_filter(client, sample_employee):
    created = client.post("/employees", json=sample_employee).json()
    client.patch(f"/employees/{created['id']}/deactivate")
    res = client.get("/employees?status=inactive")
    assert res.json()["total"] == 1


# --- EXPORT ---

def test_export_csv(client, sample_employee):
    client.post("/employees", json=sample_employee)
    res = client.get("/employees/export")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    lines = res.text.strip().split("\n")
    assert len(lines) == 2
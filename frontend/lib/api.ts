const BASE_URL = "http://localhost:8000";
export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  job_title: string;
  country: string;
  currency: string;
  base_salary: number;
  employment_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeListResponse {
  total: number;
  page: number;
  page_size: number;
  results: Employee[];
}

export interface EmployeeCreate {
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  job_title: string;
  country: string;
  base_salary: number;
  employment_type: string;
}

export interface EmployeeUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  department?: string;
  job_title?: string;
  country?: string;
  base_salary?: number;
  employment_type?: string;
}

export interface AuditLog {
  id: number;
  employee_id: string;
  field_changed: string;
  old_value: string;
  new_value: string;
  changed_by: string;
  changed_at: string;
}

export interface Summary {
  headcount: number;
  avg_salary: number;
  median_salary: number;
  min_salary: number;
  max_salary: number;
}

export interface DepartmentStat {
  department: string;
  headcount: number;
  avg_salary: number;
  min_salary: number;
  max_salary: number;
}

export interface CountryStat {
  country: string;
  currency: string;
  headcount: number;
  avg_salary: number;
  min_salary: number;
  max_salary: number;
}

export interface DistributionBucket {
  range: string;
  count: number;
}

export const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Marketing", "Sales",
  "Finance", "HR", "Operations", "Legal", "Customer Support"
];

export const COUNTRIES = [
  "India", "USA", "UK", "Germany", "Canada", "Australia", "Singapore", "UAE"
];

export const EMPLOYMENT_TYPES = ["full_time", "part_time", "contractor"];

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  employees: {
    list: (params: Record<string, string | number>) => {
      const qs = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== "" && v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      ).toString();
      return request<EmployeeListResponse>(`/employees${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => request<Employee>(`/employees/${id}`),
    create: (data: EmployeeCreate) =>
      request<Employee>("/employees", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: EmployeeUpdate) =>
      request<Employee>(`/employees/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deactivate: (id: string) =>
      request<Employee>(`/employees/${id}/deactivate`, { method: "PATCH" }),
    audit: (id: string) => request<AuditLog[]>(`/employees/${id}/audit`),
    exportUrl: (params: Record<string, string>) => {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== "")
      ).toString();
      return `${BASE_URL}/employees/export${qs ? `?${qs}` : ""}`;
    },
  },
  analytics: {
    summary: () => request<Summary>("/analytics/summary"),
    byDepartment: () => request<DepartmentStat[]>("/analytics/by-department"),
    byCountry: () => request<CountryStat[]>("/analytics/by-country"),
    distribution: () => request<DistributionBucket[]>("/analytics/distribution"),
  },
};
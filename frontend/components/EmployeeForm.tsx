"use client";

import { useState } from "react";
import { api, Employee, EmployeeCreate, DEPARTMENTS, COUNTRIES, EMPLOYMENT_TYPES } from "@/lib/api";

interface Props {
  employee?: Employee;
  onClose: () => void;
  onSaved: () => void;
}

export default function EmployeeForm({ employee, onClose, onSaved }: Props) {
  const [form, setForm] = useState<EmployeeCreate>({
    first_name: employee?.first_name ?? "",
    last_name: employee?.last_name ?? "",
    email: employee?.email ?? "",
    department: employee?.department ?? "",
    job_title: employee?.job_title ?? "",
    country: employee?.country ?? "",
    base_salary: employee?.base_salary ?? 0,
    employment_type: employee?.employment_type ?? "full_time",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (key: keyof EmployeeCreate, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      if (employee) {
        await api.employees.update(employee.id, form);
      } else {
        await api.employees.create(form);
      }
      onSaved();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    key: keyof EmployeeCreate,
    type: string = "text"
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 font-medium">{label}</label>
      <input
        type={type === "number" ? "text" : type}
        inputMode={type === "number" ? "numeric" : undefined}
        value={form[key] as string}
        onChange={(e) =>
          update(key, type === "number" ? Number(e.target.value) : e.target.value)
        }
        className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
            {employee ? "Edit Employee" : "Add Employee"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {field("First Name", "first_name")}
          {field("Last Name", "last_name")}
          {field("Email", "email", "email")}
          {field("Job Title", "job_title")}

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Department</label>
            <select
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Country</label>
            <select
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {field("Base Salary", "base_salary", "number")}

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Employment Type</label>
            <select
              value={form.employment_type}
              onChange={(e) => update("employment_type", e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace("_", " ")}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
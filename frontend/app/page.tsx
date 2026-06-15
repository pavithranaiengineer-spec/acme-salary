"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api, Employee, EmployeeListResponse } from "@/lib/api";
import FilterBar from "@/components/FilterBar";
import EmployeeTable from "@/components/EmployeeTable";
import EmployeeForm from "@/components/EmployeeForm";
import AuditPanel from "@/components/AuditPanel";
import ConfirmModal from "@/components/ConfirmModal";

const DEFAULT_FILTERS = {
  search: "",
  department: "",
  country: "",
  employment_type: "",
  status: "active",
};

export default function HomePage() {
  const [data, setData] = useState<EmployeeListResponse | null>(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [auditEmployee, setAuditEmployee] = useState<Employee | null>(null);
  const [deactivateEmployee, setDeactivateEmployee] = useState<Employee | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.employees.list({ ...debouncedFilters, page, page_size: 50 });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeactivate = async () => {
    if (!deactivateEmployee) return;
    await api.employees.deactivate(deactivateEmployee.id);
    setDeactivateEmployee(null);
    load();
  };

  const handleExport = () => {
    window.open(
      api.employees.exportUrl(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""))
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage salary data across the organization
          </p>
        </div>
        <button
          onClick={() => {
            setEditEmployee(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Employee
        </button>
      </div>

      <FilterBar filters={filters} onChange={setFilters} onExport={handleExport} />

      {loading ? (
        <div className="py-16 text-center text-gray-400">Loading...</div>
      ) : (
        <EmployeeTable
          employees={data?.results ?? []}
          total={data?.total ?? 0}
          page={page}
          pageSize={50}
          onPageChange={setPage}
          onEdit={(emp) => {
            setEditEmployee(emp);
            setShowForm(true);
          }}
          onDeactivate={(emp) => setDeactivateEmployee(emp)}
          onAudit={(emp) => setAuditEmployee(emp)}
        />
      )}

      {showForm && (
        <EmployeeForm
          employee={editEmployee ?? undefined}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {auditEmployee && (
        <AuditPanel
          employeeId={auditEmployee.id}
          onClose={() => setAuditEmployee(null)}
        />
      )}

      {deactivateEmployee && (
        <ConfirmModal
          title="Deactivate Employee"
          message={`Are you sure you want to deactivate ${deactivateEmployee.first_name} ${deactivateEmployee.last_name} (${deactivateEmployee.employee_id})? This will hide them from active records.`}
          confirmLabel="Deactivate"
          onConfirm={handleDeactivate}
          onCancel={() => setDeactivateEmployee(null)}
        />
      )}
    </div>
  );
}
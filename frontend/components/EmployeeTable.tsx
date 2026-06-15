"use client";

import { Employee } from "@/lib/api";

interface Props {
  employees: Employee[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (employee: Employee) => void;
  onDeactivate: (employee: Employee) => void;
  onAudit: (employee: Employee) => void;
}

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

export default function EmployeeTable({
  employees, total, page, pageSize,
  onPageChange, onEdit, onDeactivate, onAudit
}: Props) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["ID", "Name", "Department", "Job Title", "Country", "Salary", "Type", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  No employees found
                </td>
              </tr>
            ) : employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{emp.employee_id}</td>
                <td className="px-4 py-3 font-medium">
                  {emp.first_name} {emp.last_name}
                  <div className="text-xs text-gray-400">{emp.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                <td className="px-4 py-3 text-gray-600">{emp.job_title}</td>
                <td className="px-4 py-3 text-gray-600">{emp.country}</td>
                <td className="px-4 py-3 font-medium">{fmt(emp.base_salary, emp.currency)}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                    {emp.employment_type.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    emp.status === "active"
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(emp)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onAudit(emp)}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      History
                    </button>
                    {emp.status === "active" && (
                      <button
                        onClick={() => onDeactivate(emp)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <span>{total.toLocaleString()} employees</span>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
          >
            ←
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
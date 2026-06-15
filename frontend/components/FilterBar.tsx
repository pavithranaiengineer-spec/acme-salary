"use client";

import { DEPARTMENTS, COUNTRIES, EMPLOYMENT_TYPES } from "@/lib/api";

interface Filters {
  search: string;
  department: string;
  country: string;
  employment_type: string;
  status: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onExport: () => void;
}

export default function FilterBar({ filters, onChange, onExport }: Props) {
  const update = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
        <label className="text-xs text-gray-500 font-medium">Search</label>
        <input
          type="text"
          placeholder="Name or Employee ID..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Department</label>
        <select
          value={filters.department}
          onChange={(e) => update("department", e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Country</label>
        <select
          value={filters.country}
          onChange={(e) => update("country", e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Countries</option>
          {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Type</label>
        <select
          value={filters.employment_type}
          onChange={(e) => update("employment_type", e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t} value={t}>{t.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Status</label>
        <select
          value={filters.status}
          onChange={(e) => update("status", e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="">All</option>
        </select>
      </div>

      <button
        onClick={onExport}
        className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-gray-600 transition-colors"
      >
        Export CSV
      </button>
    </div>
  );
}
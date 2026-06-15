"use client";

import { useEffect, useState } from "react";
import { api, Summary, DepartmentStat, CountryStat, DistributionBucket, DEPARTMENTS, COUNTRIES } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [departments, setDepartments] = useState<DepartmentStat[]>([]);
  const [countries, setCountries] = useState<CountryStat[]>([]);
  const [distribution, setDistribution] = useState<DistributionBucket[]>([]);
  const [deptFilter, setDeptFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  useEffect(() => {
    api.analytics.summary().then(setSummary);
    api.analytics.byDepartment().then(setDepartments);
    api.analytics.byCountry().then(setCountries);
    api.analytics.distribution().then(setDistribution);
  }, []);

  const filteredDepts = deptFilter
    ? departments.filter((d) => d.department === deptFilter)
    : departments;

  const filteredCountries = countryFilter
    ? countries.filter((c) => c.country === countryFilter)
    : countries;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">How the organization pays people</p>
        </div>
        <div className="flex gap-3">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Countries</option>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Headcount" value={summary.headcount.toLocaleString()} />
          <StatCard label="Average Salary" value={fmt(summary.avg_salary)} />
          <StatCard label="Median Salary" value={fmt(summary.median_salary)} />
          <StatCard label="Min Salary" value={fmt(summary.min_salary)} />
          <StatCard label="Max Salary" value={fmt(summary.max_salary)} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-base font-medium mb-1">Avg Salary by Department</h2>
          {deptFilter && (
            <p className="text-xs text-blue-500 mb-3">Filtered: {deptFilter}</p>
          )}
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={filteredDepts} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="department" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="avg_salary" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-base font-medium mb-1">Headcount by Country</h2>
          {countryFilter && (
            <p className="text-xs text-blue-500 mb-3">Filtered: {countryFilter}</p>
          )}
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={filteredCountries} margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="country" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="headcount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 md:col-span-2">
          <h2 className="text-base font-medium mb-4">Salary Distribution</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={distribution} margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-medium">Salary by Country</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Country", "Currency", "Headcount", "Avg Salary", "Min", "Max"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCountries.map((c) => (
              <tr key={c.country} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.country}</td>
                <td className="px-4 py-3 text-gray-500">{c.currency}</td>
                <td className="px-4 py-3">{c.headcount.toLocaleString()}</td>
                <td className="px-4 py-3">{fmt(c.avg_salary)}</td>
                <td className="px-4 py-3">{fmt(c.min_salary)}</td>
                <td className="px-4 py-3">{fmt(c.max_salary)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
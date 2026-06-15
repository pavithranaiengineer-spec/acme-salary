"use client";

import { useEffect, useState } from "react";
import { api, AuditLog } from "@/lib/api";

interface Props {
  employeeId: string;
  onClose: () => void;
}

export default function AuditPanel({ employeeId, onClose }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.employees.audit(employeeId).then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, [employeeId]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Audit History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-500">No changes recorded yet.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="border border-gray-100 rounded-lg p-3 text-sm">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{log.changed_by}</span>
                  <span>{new Date(log.changed_at).toLocaleString()}</span>
                </div>
                <div className="text-gray-700">
                  <span className="font-medium">{log.field_changed}</span>
                  {" changed from "}
                  <span className="bg-red-50 text-red-600 px-1 rounded">{log.old_value}</span>
                  {" to "}
                  <span className="bg-green-50 text-green-600 px-1 rounded">{log.new_value}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
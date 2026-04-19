import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * ActivityLogTable - Display admin action logs with expandable details
 */
export default function ActivityLogTable({ logs, isLoading }) {
  const [expandedId, setExpandedId] = useState(null);

  const getActionBadgeColor = (action) => {
    if (action.includes("deleted") || action.includes("freeze")) return "red";
    if (action.includes("created") || action.includes("unfreeze"))
      return "green";
    if (action.includes("updated") || action.includes("toggle")) return "blue";
    return "gray";
  };

  const getActionBadgeClass = (color) => {
    const colors = {
      red: "bg-red-100 text-red-800",
      green: "bg-green-100 text-green-800",
      blue: "bg-blue-100 text-blue-800",
      gray: "bg-gray-100 text-gray-800",
    };
    return colors[color];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">Loading activity logs...</div>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activity logs found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Admin
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Action
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Target
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Target ID
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              IP Address
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Timestamp
            </th>
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {logs.map((log) => (
            <React.Fragment key={log.id}>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-gray-900">
                    {log.admin_username || "Unknown"}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${getActionBadgeClass(
                      getActionBadgeColor(log.action),
                    )}`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {log.target_type || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {log.target_id || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">
                  {log.ip_address || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {formatDate(log.created_at)}
                </td>
                <td className="px-4 py-3 text-center">
                  {log.details && (
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === log.id ? null : log.id)
                      }
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {expandedId === log.id ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  )}
                </td>
              </tr>

              {/* Expandable Details */}
              {expandedId === log.id && log.details && (
                <tr className="bg-gray-50">
                  <td colSpan="7" className="px-4 py-4">
                    <div className="bg-white rounded border border-gray-200 p-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Details:
                      </p>
                      <pre className="text-xs text-gray-600 overflow-auto max-h-48 bg-gray-50 p-3 rounded">
                        {typeof log.details === "string"
                          ? log.details
                          : formatJSON(log.details)}
                      </pre>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

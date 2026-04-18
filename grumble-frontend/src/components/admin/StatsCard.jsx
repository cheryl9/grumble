/**
 * StatsCard Component
 * Reusable card for displaying dashboard metrics
 */
import { createElement } from "react";

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  change,
  color = "blue",
  variant,
  changeLabel = "vs last period",
}) {
  const resolvedColor = variant || color;

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    red: "bg-red-50 text-red-600 border-red-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };

  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>

          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${trendColors[trend]}`}>
                {trend === "up" && "↑"}
                {trend === "down" && "↓"}
                {trend === "neutral" && "→"}
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500">{changeLabel}</span>
            </div>
          )}
        </div>

        {icon && (
          <div
            className={`p-3 rounded-lg border ${colorClasses[resolvedColor] || colorClasses.blue}`}
          >
            {createElement(icon, { size: 24 })}
          </div>
        )}
      </div>
    </div>
  );
}

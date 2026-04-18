import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

/**
 * MetricsChart Component
 * Chart component using Recharts for dashboard visualizations
 */
export default function MetricsChart({
  type,
  data,
  title,
  dataKey,
  categoryKey,
  xAxisKey,
  height = 300,
}) {
  const COLORS = [
    "#F78660",
    "#FFCC7A",
    "#2945A8",
    "#10B981",
    "#EF4444",
    "#8B5CF6",
  ];
  const resolvedCategoryKey = categoryKey || xAxisKey;

  // Format data for charts
  const formatData = () => {
    if (type === "line" && resolvedCategoryKey === "month") {
      return data.map((item) => ({
        ...item,
        [resolvedCategoryKey]: format(
          new Date(item[resolvedCategoryKey]),
          "MMM yyyy",
        ),
      }));
    }
    return data;
  };

  const chartData = formatData();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {title ? (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      ) : null}

      {type === "pie" && (
        <div
          style={{
            width: "100%",
            height: "300px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {chartData && chartData.length > 0 ? (
            <>
              {/* Calculate total for percentages */}
              {(() => {
                const total = chartData.reduce(
                  (sum, item) => sum + (item[dataKey] || 0),
                  0,
                );

                return (
                  <PieChart width={450} height={280}>
                    <Pie
                      data={chartData}
                      dataKey={dataKey}
                      nameKey={resolvedCategoryKey}
                      cx="45%"
                      cy="50%"
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => {
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${value} (${percentage}%)`;
                      }}
                    />
                    <Legend
                      formatter={(value, entry) => {
                        const count = entry.payload[dataKey];
                        const percentage = ((count / total) * 100).toFixed(1);
                        return `${value} ${percentage}%`;
                      }}
                      verticalAlign="bottom"
                      height={30}
                      wrapperStyle={{ paddingTop: "10px" }}
                    />
                  </PieChart>
                );
              })()}
            </>
          ) : (
            <div style={{ padding: "40px", color: "#999" }}>
              No data available
            </div>
          )}
        </div>
      )}

      {type === "line" && (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey={resolvedCategoryKey}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#F78660"
              strokeWidth={2}
              dot={{ fill: "#F78660", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {type === "bar" && (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey={resolvedCategoryKey}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey={dataKey} fill="#F78660" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

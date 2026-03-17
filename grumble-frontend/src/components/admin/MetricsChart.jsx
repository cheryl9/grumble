import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

/**
 * MetricsChart Component
 * Chart component using Recharts for dashboard visualizations
 */
export default function MetricsChart({ type, data, title, dataKey, categoryKey, xAxisKey, height = 300 }) {
  const COLORS = ['#F78660', '#FFCC7A', '#2945A8', '#10B981', '#EF4444', '#8B5CF6'];
  const resolvedCategoryKey = categoryKey || xAxisKey;

  // Format data for charts
  const formatData = () => {
    if (type === 'line' && resolvedCategoryKey === 'month') {
      return data.map(item => ({
        ...item,
        [resolvedCategoryKey]: format(new Date(item[resolvedCategoryKey]), 'MMM yyyy')
      }));
    }
    return data;
  };

  const chartData = formatData();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {title ? <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3> : null}
      
      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' && (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={resolvedCategoryKey} tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="#F78660" 
              strokeWidth={2}
              dot={{ fill: '#F78660', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )}

        {type === 'bar' && (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={resolvedCategoryKey} tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey={dataKey} fill="#F78660" radius={[8, 8, 0, 0]} />
          </BarChart>
        )}

        {type === 'pie' && (
          <PieChart>
            <Pie
              data={chartData}
              dataKey={dataKey}
              nameKey={resolvedCategoryKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) => `${entry[resolvedCategoryKey]}: ${entry[dataKey]}`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

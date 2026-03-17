import { Eye } from 'lucide-react';
import { format } from 'date-fns';

const statusClasses = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  dismissed: 'bg-gray-100 text-gray-800'
};

export default function ReportCard({ report, onView, onReview, onResolve, onDismiss }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-xs text-gray-500">Report #{report.id}</p>
          <h3 className="text-sm font-semibold text-gray-900">{report.reason}</h3>
          <p className="text-xs text-gray-500">Type: {report.reported_type}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded ${statusClasses[report.status] || statusClasses.pending}`}>
          {report.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{report.description || 'No description'}</p>

      <div className="text-xs text-gray-500 mb-4">
        <p>Reporter: @{report.reporter_username || 'unknown'}</p>
        <p>{report.created_at ? format(new Date(report.created_at), 'MMM d, yyyy HH:mm') : 'Unknown time'}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button onClick={() => onView(report)} className="px-2 py-2 text-xs rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-1">
          <Eye size={14} /> View
        </button>
        <button onClick={() => onReview(report)} className="px-2 py-2 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100">
          Review
        </button>
        <button onClick={() => onResolve(report)} className="px-2 py-2 text-xs rounded bg-green-50 text-green-700 hover:bg-green-100">
          Resolve
        </button>
        <button onClick={() => onDismiss(report)} className="px-2 py-2 text-xs rounded bg-gray-50 text-gray-700 hover:bg-gray-100">
          Dismiss
        </button>
      </div>
    </div>
  );
}

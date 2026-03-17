import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { getReportDetails } from '../../services/adminReportService';

export default function ReportDetailModal({ reportId, onClose, onReview, onResolve, onDismiss }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await getReportDetails(reportId);
        setReport(result);
        setNotes(result.admin_notes || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report details');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [reportId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6">Loading...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <p className="text-red-600 mb-4">{error || 'Report not found'}</p>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Close</button>
        </div>
      </div>
    );
  }

  const targetPreview = report.reported_post_description || report.reported_comment_content || report.reported_username || 'No target preview available';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Report #{report.id}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p><strong>Status:</strong> {report.status}</p>
              <p><strong>Reason:</strong> {report.reason}</p>
              <p><strong>Reporter:</strong> @{report.reporter_username || 'unknown'}</p>
              <p><strong>Created:</strong> {format(new Date(report.created_at), 'MMM d, yyyy HH:mm')}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Description</h3>
              <p className="text-sm text-gray-700">{report.description || 'No description'}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Reported Content Preview</h3>
              <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700">
                {targetPreview}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Admin Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Add review notes..."
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
            <button onClick={() => onReview(report, notes)} className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Review</button>
            <button onClick={() => onResolve(report, notes)} className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">Resolve</button>
            <button onClick={() => onDismiss(report, notes)} className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">Dismiss</button>
          </div>
        </div>
      </div>
    </div>
  );
}

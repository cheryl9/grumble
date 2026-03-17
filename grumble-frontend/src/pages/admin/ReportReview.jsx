import { useEffect, useState } from 'react';
import ReportCard from '../../components/admin/ReportCard';
import ReportDetailModal from '../../components/admin/ReportDetailModal';
import Pagination from '../../components/admin/Pagination';
import * as adminReportService from '../../services/adminReportService';

const TABS = ['pending', 'reviewing', 'resolved', 'dismissed'];

export default function ReportReview() {
  const [activeTab, setActiveTab] = useState('pending');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });

  const fetchReports = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await adminReportService.getReports({
        page: pagination.page,
        limit: pagination.limit,
        status: activeTab,
        reason: reasonFilter
      });

      setReports(result.reports);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab, pagination.page]);

  const updateStatus = async (action, report, notes) => {
    try {
      if (action === 'review') await adminReportService.reviewReport(report.id, notes || '');
      if (action === 'resolve') await adminReportService.resolveReport(report.id, notes || '');
      if (action === 'dismiss') await adminReportService.dismissReport(report.id, notes || '');
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update report status');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Report Review</h1>
        <p className="text-gray-600 mt-1">Review and resolve reported posts, comments, and users</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className={`px-3 py-2 text-sm rounded-md ${
                activeTab === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            placeholder="Filter by reason"
            className="px-3 py-2 border border-gray-300 rounded-md w-full md:w-80"
          />
          <button
            onClick={() => {
              setPagination((p) => ({ ...p, page: 1 }));
              fetchReports();
            }}
            className="px-3 py-2 bg-gray-900 text-white rounded-md"
          >
            Apply
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-10 w-10 rounded-full border-b-2 border-orange-600 animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onView={setSelectedReport}
                onReview={(r) => updateStatus('review', r, '')}
                onResolve={(r) => updateStatus('resolve', r, '')}
                onDismiss={(r) => updateStatus('dismiss', r, '')}
              />
            ))}
            {reports.length === 0 && <p className="text-gray-500">No reports for this status</p>}
          </div>

          <div className="mt-4 bg-white border border-gray-200 rounded-lg">
            <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={(page) => setPagination((p) => ({ ...p, page }))} />
          </div>
        </>
      )}

      {selectedReport && (
        <ReportDetailModal
          reportId={selectedReport.id}
          onClose={() => setSelectedReport(null)}
          onReview={(r, notes) => updateStatus('review', r, notes)}
          onResolve={(r, notes) => updateStatus('resolve', r, notes)}
          onDismiss={(r, notes) => updateStatus('dismiss', r, notes)}
        />
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { REPORT_REASONS } from '../../utils/constants';
import api from '../../services/api';

const ReportPostModal = ({ postId, onClose, onReported }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!selectedReason || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await api.post(`/posts/${postId}/report`, { reason: selectedReason });
      onReported?.();
      onClose();
    } catch (err) {
      console.error('Failed to report post:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Report Post</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[55vh] overflow-y-auto">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => setSelectedReason(reason)}
              className={`w-full text-left px-3 py-3 rounded-lg border transition ${
                selectedReason === reason
                  ? 'border-[#F78660] bg-orange-50 text-gray-900'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {reason}
            </button>
          ))}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="px-4 py-2 bg-[#F78660] text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2945A8]"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPostModal;
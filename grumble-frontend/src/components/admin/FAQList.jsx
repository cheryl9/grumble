import React from 'react';
import { Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';

/**
 * FAQList - Display FAQs grouped by category with inline actions
 */
export default function FAQList({ faqs, onEdit, onDelete, onToggle, onReorder, isLoading }) {
  
  // Group FAQs by category
  const groupedFAQs = React.useMemo(() => {
    const groups = {};
    faqs.forEach(faq => {
      const category = faq.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(faq);
    });
    return groups;
  }, [faqs]);

  const handleDragStart = (e, faq) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('faqId', faq.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetFaq) => {
    e.preventDefault();
    const sourceFaqId = parseInt(e.dataTransfer.getData('faqId'));
    if (sourceFaqId !== targetFaq.id) {
      onReorder(sourceFaqId, targetFaq.id);
    }
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
        <div key={category} className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Category Header */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b">
            {category}
            <span className="text-sm text-gray-500 ml-2">({categoryFAQs.length})</span>
          </h3>

          {/* FAQs List */}
          <div className="space-y-3">
            {categoryFAQs.map((faq) => (
              <div
                key={faq.id}
                draggable
                onDragStart={(e) => handleDragStart(e, faq)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, faq)}
                className="flex items-start gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group cursor-move"
              >
                {/* Drag Handle */}
                <div className="mt-1 text-gray-400 group-hover:text-gray-600">
                  <GripVertical size={18} />
                </div>

                {/* FAQ Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                    {faq.question}
                  </h4>
                  <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                    {faq.answer}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {faq.is_active ? (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        Inactive
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      Order: {faq.display_order}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {/* Toggle Active Button */}
                  <button
                    onClick={() => onToggle(faq.id, !faq.is_active)}
                    disabled={isLoading}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
                    title={faq.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {faq.is_active ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => onEdit(faq)}
                    disabled={isLoading}
                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-white rounded transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete FAQ: "${faq.question}"?`)) {
                        onDelete(faq.id);
                      }
                    }}
                    disabled={isLoading}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-white rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

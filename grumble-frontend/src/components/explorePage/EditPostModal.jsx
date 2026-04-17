import React, { useEffect, useState } from 'react';
import { X, MapPin, Star } from 'lucide-react';

const EditPostModal = ({ post, onClose, onSave, isSaving = false }) => {
  const [locationName, setLocationName] = useState(post.location_name || '');
  const [description, setDescription] = useState(post.description || '');
  const [rating, setRating] = useState(post.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [visibility, setVisibility] = useState(post.visibility || 'public');
  const [error, setError] = useState(null);

  useEffect(() => {
    setLocationName(post.location_name || '');
    setDescription(post.description || '');
    setRating(post.rating || 0);
    setVisibility(post.visibility || 'public');
    setError(null);
  }, [post]);

  const handleSubmit = () => {
    if (!locationName.trim()) {
      setError('Location is required.');
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setError('Please choose a rating from 1 to 5.');
      return;
    }

    setError(null);
    onSave?.({
      locationName: locationName.trim(),
      description: description.trim(),
      rating,
      visibility,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-bold">Edit Post</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPin
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={26}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Caption</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Visibility</label>
            <div className="flex gap-2">
              {['public', 'friends', 'private'].map((v) => (
                <button
                  key={v}
                  onClick={() => setVisibility(v)}
                  className="px-4 py-2 rounded-full text-sm font-medium capitalize"
                  style={
                    visibility === v
                      ? { background: '#FF6B35', color: 'white' }
                      : { background: '#F5F5F5', color: '#666' }
                  }
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-white text-sm font-semibold"
              style={{
                background: isSaving
                  ? '#ccc'
                  : 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
              }}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;

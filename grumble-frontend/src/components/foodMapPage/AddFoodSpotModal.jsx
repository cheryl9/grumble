import React, { useState, useRef } from "react";
import { X, MapPin, Star, Image } from "lucide-react";
import api from "../../services/api";

const AddFoodSpotModal = ({ onClose, onSpotAdded, lat, lon }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [visibility, setVisibility] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!locationName.trim()) {
      setError("Please enter a location name.");
      return;
    }
    if (!rating) {
      setError("Please give a rating.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Upload image if one was selected
      let imageUrl = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const uploadRes = await api.post("/posts/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.imageUrl;
      }

      // Step 2: Create the food spot with the uploaded image URL
      await api.post("/food-places", {
        name: locationName.trim(),
        description: description.trim(),
        rating,
        imageUrl,
        visibility,
        latitude: lat,
        longitude: lon,
      });

      onSpotAdded?.();
      onClose();
    } catch (err) {
      console.error("Failed to add food spot:", err);
      setError("Failed to add food spot. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full overflow-hidden shadow-2xl"
        style={{ maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            background: "linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)",
          }}
        >
          <h2 className="text-white text-xl font-bold">Add Food Spot</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Photo
            </label>
            {imagePreview ? (
              <div
                className="relative rounded-xl overflow-hidden"
                style={{ height: "200px" }}
              >
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
                style={{
                  height: "160px",
                  borderColor: "#FF8C42",
                  backgroundColor: "#FFF8F5",
                }}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <Image
                  size={32}
                  style={{ color: "#FF8C42" }}
                  className="mb-2"
                />
                <p className="text-sm font-medium" style={{ color: "#FF6B35" }}>
                  Click or drag to upload
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG, WEBP • Max 10MB
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location <span style={{ color: "#FF6B35" }}>*</span>
            </label>
            <div className="relative">
              <MapPin
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="e.g. Maxwell Food Centre"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rating <span style={{ color: "#FF6B35" }}>*</span>
            </label>
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
                    size={28}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  {["", "Poor", "Fair", "Good", "Great", "Amazing!"][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Caption
            </label>
            <textarea
              placeholder="What did you think? Any must-tries?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {description.length}/300
            </p>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Visibility
            </label>
            <div className="flex gap-2">
              {["public", "friends", "private"].map((v) => (
                <button
                  key={v}
                  onClick={() => setVisibility(v)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all capitalize"
                  style={
                    visibility === v
                      ? { background: "#FF6B35", color: "white" }
                      : { background: "#F5F5F5", color: "#666" }
                  }
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
            style={{
              background: isSubmitting
                ? "#ccc"
                : "linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Adding..." : "Add Spot"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFoodSpotModal;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import logo from "../../assets/logo.png";
import { CUISINE_CATEGORIES, ROUTES } from "../../utils/constants";
import api from "../../services/api";

export default function OnboardingSurvey() {
  const navigate = useNavigate();

  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [hashtagCategories, setHashtagCategories] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState("cuisines");
  // Load available hashtags from backend
  useEffect(() => {
    const loadHashtags = async () => {
      try {
        const response = await api.get("/auth/hashtags");
        setHashtagCategories(response.data.data);
      } catch (err) {
        console.error("Failed to load hashtags:", err);
      }
    };
    loadHashtags();
  }, []);

  const handleCuisineToggle = (cuisine) => {
    setSelectedCuisines((prev) => {
      if (prev.includes(cuisine)) {
        return prev.filter((c) => c !== cuisine);
      } else {
        return [...prev, cuisine];
      }
    });
    if (error) setError("");
  };

  const handleHashtagToggle = (hashtag) => {
    setSelectedHashtags((prev) => {
      if (prev.includes(hashtag)) {
        return prev.filter((h) => h !== hashtag);
      } else {
        return [...prev, hashtag];
      }
    });
    if (error) setError("");
  };

  const handleSkip = () => {
    navigate(ROUTES.EXPLORE);
  };

  const handleNextStep = () => {
    if (currentStep === "cuisines") {
      setCurrentStep("hashtags");
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Remove # from hashtags for storage
      const hashtagsForStorage = selectedHashtags.map((h) =>
        h.startsWith("#") ? h.substring(1) : h,
      );
      await api.post("/auth/preferences", {
        cuisines: selectedCuisines,
        hashtags: hashtagsForStorage,
      });
      navigate(ROUTES.EXPLORE);
    } catch (_error) {
      setError("Failed to save preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div
        className="w-full bg-white rounded-2xl shadow-xl overflow-hidden"
        style={{ maxWidth: "680px" }}
      >
        <div style={{ padding: "40px 48px" }}>
          <img
            src={logo}
            alt="Grumble Logo"
            className="w-16 h-16 mx-auto mb-4"
          />

          {currentStep === "cuisines" ? (
            <>
              <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
                What do you like to eat?
              </h1>
              <p className="text-gray-600 text-center mb-8">
                Select your favorite cuisines to get personalized
                recommendations
              </p>

              {/* Cuisine Selection Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {CUISINE_CATEGORIES.map((cuisine) => {
                  const isSelected = selectedCuisines.includes(cuisine);
                  return (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => handleCuisineToggle(cuisine)}
                      className={`p-4 rounded-lg border-2 transition-all font-medium ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-300 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      {cuisine}
                    </button>
                  );
                })}
              </div>

              {/* Selection Counter */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  {selectedCuisines.length} cuisine
                  {selectedCuisines.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
                What's your vibe?
              </h1>
              <p className="text-gray-600 text-center mb-8">
                Select hashtags that match your food interests
              </p>

              {/* Hashtag Categories */}
              <div className="space-y-4 mb-6">
                {Object.entries(hashtagCategories).map(
                  ([categoryKey, category]) => (
                    <div key={categoryKey}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        {category.label}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {category.tags.map((tag) => {
                          // Normalize tag (remove # if present)
                          const normalizedTag = tag.startsWith("#")
                            ? tag.substring(1)
                            : tag;
                          const isSelected =
                            selectedHashtags.includes(normalizedTag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleHashtagToggle(normalizedTag)}
                              className={`px-3 py-1 rounded-full border transition-all text-sm font-medium ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-gray-300 hover:border-gray-400 text-gray-700"
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* Selection Counter */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  {selectedHashtags.length} interest
                  {selectedHashtags.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mb-3">
            {currentStep === "hashtags" && (
              <button
                type="button"
                onClick={() => setCurrentStep("cuisines")}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-800 font-medium py-2 mb-2"
              >
                Back
              </button>
            )}
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : currentStep === "cuisines"
                  ? "Next"
                  : "Continue"}
            </Button>
          </div>

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-center text-sm text-gray-600 hover:text-gray-800 font-medium py-2"
            disabled={isSubmitting}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

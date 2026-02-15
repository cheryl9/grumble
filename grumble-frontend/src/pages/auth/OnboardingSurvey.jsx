import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import logo from '../../assets/logo.png';
import { CUISINE_CATEGORIES, ROUTES } from '../../utils/constants';  

export default function OnboardingSurvey() {
  const navigate = useNavigate();

  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCuisineToggle = (cuisine) => {
    setSelectedCuisines(prev => {
      if (prev.includes(cuisine)) {
        return prev.filter(c => c !== cuisine);
      } else {
        return [...prev, cuisine];
      }
    });
    if (error) setError('');
  };

  const handleSkip = () => {
    navigate(ROUTES.EXPLORE);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedCuisines.length === 0) {
      setError('Please select at least one cuisine or skip the survey.');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Add API call to save user preferences
      console.log('Selected cuisines:', selectedCuisines);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to main app
      navigate(ROUTES.EXPLORE);
    } catch (_error) {
      setError('Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden"
        style={{ maxWidth: '680px' }}>
        <div style={{ padding: '40px 48px' }}>
          <img src={logo} alt="Grumble Logo" className="w-16 h-16 mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
            What do you like to eat?
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Select your favorite cuisines to get personalized recommendations
          </p>
            <form onSubmit={handleSubmit}>
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
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
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
                {selectedCuisines.length} cuisine{selectedCuisines.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
                        {/* Submit Button */}
            <div className="mb-3">
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Continue'}
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
          </form>
        </div>
      </div>
    </div>
  );
}
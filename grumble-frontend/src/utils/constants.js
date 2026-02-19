export const CUISINE_CATEGORIES = [
  'Western', 'Japanese', 'Korean', 'Chinese', 
  'Indian', 'Malay', 'Vietnamese', 'Mexican', 
  'Thai', 'Italian', 'French'
];

export const REPORT_REASONS = [
  "I just don't like it",
  "Bullying or unwanted contact",
  "Suicide, self-injury or eating disorders",
  "Violence, hate or exploitation",
  "Promoting restricted items",
  "Scam, fraud or spam",
  "False information",
  "Intellectual property"
];

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  ONBOARDING: '/onboarding',
  EXPLORE: '/explore',
  FIND_SPOTS: '/find-spots',
  FOOD_MAP: '/food-map',
  CHATS: '/chats',
  PROFILE: '/profile'
};

export const SINGAPORE_REGIONS = {
  Central: ['Bishan', 'Bukit Merah', 'Bukit Timah', 'Downtown Core', 'Geylang', 'Kallang', 'Marina East', 'Marina South', 'Marine Parade', 'Museum', 'Newton', 'Novena', 'Orchard', 'Outram', 'Queenstown', 'River Valley', 'Rochor', 'Singapore River', 'Southern Islands', 'Straits View', 'Tanglin', 'Toa Payoh'],
  East: ['Bedok', 'Changi', 'Changi Bay', 'Pasir Ris', 'Paya Lebar', 'Tampines'],
  North: ['Central Water Catchment', 'Lim Chu Kang', 'Mandai', 'Sembawang', 'Simpang', 'Sungei Kadut', 'Woodlands', 'Yishun'],
  'North-East': ['Ang Mo Kio', 'Hougang', 'North-Eastern Islands', 'Punggol', 'Seletar', 'Sengkang', 'Serangoon'],
  West: ['Boon Lay', 'Bukit Batok', 'Bukit Panjang', 'Choa Chu Kang', 'Clementi', 'Jurong East', 'Jurong West', 'Pioneer', 'Tengah', 'Tuas', 'Western Islands', 'Western Water Catchment']
};

export const PRICE_RANGES = [
  { label: '$0 - $10', value: '0-10', min: 0, max: 10 },
  { label: '$10 - $20', value: '10-20', min: 10, max: 20 },
  { label: '$20 - $30', value: '20-30', min: 20, max: 30 },
  { label: '$30 and above', value: '30+', min: 30, max: 999 }
];

export const OCCASIONS = [
  'Casual Dining',
  'Fine Dining',
  'Date Night',
  'Family Gathering',
  'Business Meeting',
  'Quick Bite',
  'Late Night',
  'Brunch'
];
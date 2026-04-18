/**
 * Maps Singapore postal codes to their regions
 * Postal code format: XXXXXX (6 digits)
 * First 2 digits determine the region
 */

export const POSTAL_CODE_TO_REGION = {
  // Central Region (01-19)
  "01": "Central",
  "02": "Central",
  "03": "Central",
  "04": "Central",
  "05": "Central",
  "06": "Central",
  "07": "Central",
  "08": "Central",
  "09": "Central",
  10: "Central",
  11: "Central",
  12: "Central",
  13: "Central",
  14: "Central",
  15: "Central",
  16: "Central",
  17: "Central",
  18: "Central",
  19: "Central",

  // East Region (14, 15, 41-48)
  41: "East",
  42: "East",
  43: "East",
  44: "East",
  45: "East",
  46: "East",
  47: "East",
  48: "East",

  // North Region (20-28)
  20: "North",
  21: "North",
  22: "North",
  23: "North",
  24: "North",
  25: "North",
  26: "North",
  27: "North",
  28: "North",

  // North-East Region (30-37, 38)
  30: "North-East",
  31: "North-East",
  32: "North-East",
  33: "North-East",
  34: "North-East",
  35: "North-East",
  36: "North-East",
  37: "North-East",
  38: "North-East",

  // West Region (59, 60-68)
  59: "West",
  60: "West",
  61: "West",
  62: "West",
  63: "West",
  64: "West",
  65: "West",
  66: "West",
  67: "West",
  68: "West",
  69: "West",
};

/**
 * Maps Singapore areas to their coordinate bounding boxes (lat/lon)
 * Used to determine which area a restaurant belongs to based on coordinates
 */
export const AREA_BOUNDS = {
  // Central Region
  Bishan: { minLat: 1.35, maxLat: 1.37, minLon: 103.845, maxLon: 103.865 },
  "Bukit Merah": {
    minLat: 1.275,
    maxLat: 1.295,
    minLon: 103.82,
    maxLon: 103.845,
  },
  "Bukit Timah": {
    minLat: 1.335,
    maxLat: 1.355,
    minLon: 103.77,
    maxLon: 103.8,
  },
  "Downtown Core": {
    minLat: 1.275,
    maxLat: 1.295,
    minLon: 103.84,
    maxLon: 103.87,
  },
  Geylang: { minLat: 1.305, maxLat: 1.325, minLon: 103.86, maxLon: 103.89 },
  Kallang: { minLat: 1.305, maxLat: 1.325, minLon: 103.86, maxLon: 103.89 },
  "Marina East": {
    minLat: 1.355,
    maxLat: 1.375,
    minLon: 103.96,
    maxLon: 104.0,
  },
  "Marina South": {
    minLat: 1.27,
    maxLat: 1.29,
    minLon: 103.85,
    maxLon: 103.88,
  },
  "Marine Parade": { minLat: 1.3, maxLat: 1.32, minLon: 103.9, maxLon: 103.93 },
  Museum: { minLat: 1.285, maxLat: 1.305, minLon: 103.82, maxLon: 103.85 },
  Newton: { minLat: 1.31, maxLat: 1.33, minLon: 103.835, maxLon: 103.865 },
  Novena: { minLat: 1.32, maxLat: 1.34, minLon: 103.84, maxLon: 103.87 },
  Orchard: { minLat: 1.3, maxLat: 1.32, minLon: 103.83, maxLon: 103.86 },
  Outram: { minLat: 1.28, maxLat: 1.3, minLon: 103.82, maxLon: 103.85 },
  Queenstown: { minLat: 1.285, maxLat: 1.305, minLon: 103.8, maxLon: 103.83 },
  "River Valley": {
    minLat: 1.29,
    maxLat: 1.31,
    minLon: 103.83,
    maxLon: 103.86,
  },
  Rochor: { minLat: 1.295, maxLat: 1.315, minLon: 103.855, maxLon: 103.885 },
  "Singapore River": {
    minLat: 1.285,
    maxLat: 1.305,
    minLon: 103.84,
    maxLon: 103.87,
  },
  "Southern Islands": {
    minLat: 1.22,
    maxLat: 1.25,
    minLon: 103.8,
    maxLon: 103.85,
  },
  "Straits View": {
    minLat: 1.27,
    maxLat: 1.29,
    minLon: 103.82,
    maxLon: 103.85,
  },
  Tanglin: { minLat: 1.3, maxLat: 1.32, minLon: 103.82, maxLon: 103.85 },
  "Toa Payoh": { minLat: 1.33, maxLat: 1.35, minLon: 103.85, maxLon: 103.88 },

  // East Region
  Bedok: { minLat: 1.32, maxLat: 1.34, minLon: 103.93, maxLon: 103.96 },
  Changi: { minLat: 1.355, maxLat: 1.38, minLon: 103.99, maxLon: 104.02 },
  "Changi Bay": {
    minLat: 1.375,
    maxLat: 1.405,
    minLon: 104.01,
    maxLon: 104.04,
  },
  "Pasir Ris": { minLat: 1.37, maxLat: 1.395, minLon: 103.94, maxLon: 103.98 },
  "Paya Lebar": {
    minLat: 1.345,
    maxLat: 1.365,
    minLon: 103.89,
    maxLon: 103.92,
  },
  Tampines: { minLat: 1.35, maxLat: 1.375, minLon: 103.94, maxLon: 103.97 },

  // North Region
  "Central Water Catchment": {
    minLat: 1.36,
    maxLat: 1.4,
    minLon: 103.79,
    maxLon: 103.83,
  },
  "Lim Chu Kang": {
    minLat: 1.42,
    maxLat: 1.45,
    minLon: 103.72,
    maxLon: 103.76,
  },
  Mandai: { minLat: 1.4, maxLat: 1.43, minLon: 103.8, maxLon: 103.84 },
  Sembawang: { minLat: 1.44, maxLat: 1.47, minLon: 103.83, maxLon: 103.87 },
  Simpang: { minLat: 1.44, maxLat: 1.47, minLon: 103.86, maxLon: 103.9 },
  "Sungei Kadut": { minLat: 1.41, maxLat: 1.44, minLon: 103.76, maxLon: 103.8 },
  Woodlands: { minLat: 1.435, maxLat: 1.465, minLon: 103.785, maxLon: 103.825 },
  Yishun: { minLat: 1.43, maxLat: 1.46, minLon: 103.835, maxLon: 103.875 },

  // North-East Region
  "Ang Mo Kio": {
    minLat: 1.37,
    maxLat: 1.395,
    minLon: 103.845,
    maxLon: 103.875,
  },
  Hougang: { minLat: 1.375, maxLat: 1.405, minLon: 103.88, maxLon: 103.915 },
  "North-Eastern Islands": {
    minLat: 1.405,
    maxLat: 1.435,
    minLon: 104.005,
    maxLon: 104.035,
  },
  Punggol: { minLat: 1.405, maxLat: 1.44, minLon: 103.9, maxLon: 103.96 },
  Seletar: { minLat: 1.415, maxLat: 1.45, minLon: 103.855, maxLon: 103.905 },
  Sengkang: { minLat: 1.385, maxLat: 1.415, minLon: 103.88, maxLon: 103.93 },
  Serangoon: { minLat: 1.36, maxLat: 1.39, minLon: 103.87, maxLon: 103.91 },

  // West Region
  "Boon Lay": { minLat: 1.34, maxLat: 1.365, minLon: 103.69, maxLon: 103.73 },
  "Bukit Batok": {
    minLat: 1.345,
    maxLat: 1.37,
    minLon: 103.75,
    maxLon: 103.79,
  },
  "Bukit Panjang": {
    minLat: 1.36,
    maxLat: 1.385,
    minLon: 103.765,
    maxLon: 103.805,
  },
  "Choa Chu Kang": {
    minLat: 1.38,
    maxLat: 1.41,
    minLon: 103.74,
    maxLon: 103.78,
  },
  Clementi: { minLat: 1.335, maxLat: 1.36, minLon: 103.765, maxLon: 103.805 },
  "Jurong East": {
    minLat: 1.335,
    maxLat: 1.36,
    minLon: 103.735,
    maxLon: 103.775,
  },
  "Jurong West": {
    minLat: 1.34,
    maxLat: 1.37,
    minLon: 103.69,
    maxLon: 103.735,
  },
  Pioneer: { minLat: 1.325, maxLat: 1.35, minLon: 103.78, maxLon: 103.82 },
  Tengah: { minLat: 1.385, maxLat: 1.41, minLon: 103.72, maxLon: 103.76 },
  Tuas: { minLat: 1.32, maxLat: 1.355, minLon: 103.62, maxLon: 103.7 },
  "Western Islands": {
    minLat: 1.25,
    maxLat: 1.3,
    minLon: 103.68,
    maxLon: 103.74,
  },
  "Western Water Catchment": {
    minLat: 1.33,
    maxLat: 1.38,
    minLon: 103.68,
    maxLon: 103.73,
  },
};

/**
 * Get area from coordinates using bounding boxes
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {string|null} - Area name or null if not found
 */
export function getAreaFromCoordinates(lat, lon) {
  if (lat == null || lon == null) return null;

  for (const [area, bounds] of Object.entries(AREA_BOUNDS)) {
    if (
      lat >= bounds.minLat &&
      lat <= bounds.maxLat &&
      lon >= bounds.minLon &&
      lon <= bounds.maxLon
    ) {
      return area;
    }
  }
  return null;
}

/**
 * Get region from postal code
 * @param {string|number} postalCode - 6-digit postal code
 * @returns {string|null} - Region name or null if not found
 */
export function getRegionFromPostalCode(postalCode) {
  if (!postalCode) return null;
  const prefix = String(postalCode).substring(0, 2);
  return POSTAL_CODE_TO_REGION[prefix] || null;
}

/**
 * Get region from coordinates using bounding boxes
 * Fallback when postal code is not available
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {string|null} - Region name or null if not found
 */
export function getRegionFromCoordinates(lat, lon) {
  if (lat == null || lon == null) return null;

  for (const [region, bounds] of Object.entries(REGION_BOUNDS)) {
    if (
      lat >= bounds.minLat &&
      lat <= bounds.maxLat &&
      lon >= bounds.minLon &&
      lon <= bounds.maxLon
    ) {
      return region;
    }
  }
  return null;
}

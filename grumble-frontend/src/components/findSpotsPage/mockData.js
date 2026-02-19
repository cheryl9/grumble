export const mockRestaurants = [
  {
    id: 1,
    name: "Tiong Bahru Bakery",
    cuisine: "Western",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500",
    rating: 4.3,
    priceRange: "$10 - $20",
    region: "Central",
    location: "Tiong Bahru",
    outlets: [
      { name: "Tiong Bahru Bakery @ Raffles Place", hours: "8am - 7pm" },
      { name: "Tiong Bahru Bakery @ Eng Hoon Street", hours: "8am - 7pm" }
    ],
    openingHours: "8am - 7pm",
    menu: ["Croissants", "Sourdough", "Kouign Amann", "Coffee"],
    friendsVisited: [
      { username: "john_doe", userId: 1, postId: 101 },
      { username: "jane_smith", userId: 2, postId: 102 }
    ],
    description: "French-style artisan bakery with amazing pastries"
  },
  {
    id: 2,
    name: "Elephant Grounds",
    cuisine: "Western",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500",
    rating: 4.5,
    priceRange: "$20 - $30",
    region: "Central",
    location: "Orchard",
    outlets: [
      { name: "Elephant Grounds @ Orchard", hours: "9am - 10pm" }
    ],
    openingHours: "9am - 10pm",
    menu: ["Brunch", "Coffee", "Healthy Bowls", "Sandwiches"],
    friendsVisited: [],
    description: "Hip cafe known for specialty coffee and brunch"
  },
  {
    id: 3,
    name: "All Hands Cafe",
    cuisine: "Western",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500",
    rating: 4.4,
    priceRange: "$10 - $20",
    region: "East",
    location: "Katong",
    outlets: [
      { name: "All Hands Cafe @ East Coast", hours: "7am - 6pm" }
    ],
    openingHours: "7am - 6pm",
    menu: ["Breakfast", "Coffee", "Pastries", "Light Lunch"],
    friendsVisited: [
      { username: "mike_tan", userId: 3, postId: 103 }
    ],
    description: "Cozy neighborhood cafe with great coffee"
  },
  {
    id: 4,
    name: "Medora",
    cuisine: "Western",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
    rating: 4.2,
    priceRange: "$30 and above",
    region: "Central",
    location: "Tanjong Pagar",
    outlets: [
      { name: "Medora @ Tanjong Pagar", hours: "6pm - 11pm" }
    ],
    openingHours: "6pm - 11pm",
    menu: ["Fine Dining", "Wine", "Steaks", "Seafood"],
    friendsVisited: [],
    description: "Upscale dining experience with Mediterranean influence"
  },
  {
    id: 5,
    name: "Frankie & Fern's",
    cuisine: "Western",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500",
    rating: 4.6,
    priceRange: "$20 - $30",
    region: "Central",
    location: "Dempsey",
    outlets: [
      { name: "Frankie & Fern's @ Dempsey", hours: "11am - 10pm" }
    ],
    openingHours: "11am - 10pm",
    menu: ["Burgers", "Steaks", "Salads", "Cocktails"],
    friendsVisited: [
      { username: "sarah_lim", userId: 4, postId: 104 }
    ],
    description: "American-style restaurant in lush Dempsey setting"
  },
  {
    id: 6,
    name: "Modu Kitchen",
    cuisine: "Korean",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
    rating: 4.7,
    priceRange: "$20 - $30",
    region: "North-East",
    location: "Serangoon",
    outlets: [
      { name: "Modu Kitchen @ NEX", hours: "11am - 10pm" }
    ],
    openingHours: "11am - 10pm",
    menu: ["Korean BBQ", "Kimchi Stew", "Bibimbap", "Soju"],
    friendsVisited: [],
    description: "Authentic Korean cuisine with modern twist"
  }
];
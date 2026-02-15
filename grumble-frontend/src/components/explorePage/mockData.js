// mockData.js - Temporary data for development
// Replace this with API calls when backend is ready

export const mockPosts = [
  {
    id: 1,
    username: 'User 1',
    location: 'JEM',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    caption: 'Caption......',
    likes: 2123,
    comments: 23,
    timeAgo: '10 days ago',
  },
  {
    id: 2,
    username: 'User 2',
    location: 'JEM',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
    caption: 'Caption......',
    likes: 2123,
    comments: 23,
    timeAgo: '10 days ago',
  },
  {
    id: 3,
    username: 'User 3',
    location: 'JEM',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600',
    caption: 'Caption......',
    likes: 2123,
    comments: 23,
    timeAgo: '10 days ago',
  },
  {
    id: 4,
    username: 'User 4',
    location: 'JEM',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
    caption: 'Caption......',
    likes: 2123,
    comments: 23,
    timeAgo: '10 days ago',
  },
  {
    id: 5,
    username: 'User 5',
    location: 'JEM',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600',
    caption: 'Caption......',
    likes: 2123,
    comments: 23,
    timeAgo: '10 days ago',
  },
  {
    id: 6,
    username: 'User 6',
    location: 'JEM',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600',
    caption: 'Caption......',
    likes: 2123,
    comments: 23,
    timeAgo: '10 days ago',
  },
];

export const trendingSpots = [
    {
      id: 1,
      name: 'Tiong Bahru Bakery',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
      cuisine: 'Bakery',
      location: 'Tiong Bahru'
    },
    {
      id: 2,
      name: 'Elephant Grounds',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
      cuisine: 'Cafe',
      location: 'Star Vista'
    },
    {
      id: 3,
      name: 'All Hands Cafe',
      image: 'https://images.unsplash.com/photo-1501492693086-7f79d7f1b5de?w=400',
      cuisine: 'Cafe',
      location: 'Holland Village'
    },
    {
      id: 4,
      name: 'Medusa',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      cuisine: 'Mediterranean',
      location: 'Dempsey'
    },
    {
      id: 5,
      name: "Frankie & Fern's",
      image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400',
      cuisine: 'Brunch',
      location: 'Boat Quay'
    },
    {
      id: 6,
      name: 'Monsterland',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
      cuisine: 'Fusion',
      location: 'Clarke Quay'
    }
  ];

  // Helper function for when you integrate with backend
export const fetchPosts = async () => {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/posts');
  // return response.json();
  return mockPosts;
};

  export const fetchSpots = async () => {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/posts');
  // return response.json();
  return trendingSpots;
};

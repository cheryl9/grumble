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

// Helper function for when you integrate with backend
export const fetchPosts = async () => {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/posts');
  // return response.json();
  return mockPosts;
};
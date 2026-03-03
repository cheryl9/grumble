export const mockChats = [
  {
    id: 1, type: 'group', name: 'Makan hang group',
    members: ['Friend 1', 'Friend 2', 'Friend 3'],
    lastMessage: 'Friend 1: So guys where we eating?', time: '2m', unread: 3,
    messages: [
      { id: 1, sender: 'Friend 1', text: 'So guys where we eating?', type: 'text', time: '2:30 PM' },
      {
        id: 2, sender: 'Xavier', type: 'food-suggestion', time: '2:31 PM',
        restaurant: { id: 1, name: 'Sushiro', cuisine: 'Japanese', rating: 4.5, image: null },
      },
      {
        id: 3, sender: 'System', type: 'poll', time: '2:32 PM',
        question: 'Pick what to eat tomorrow guys',
        options: [
          { id: 1, text: 'Sushiro' },
          { id: 2, text: 'Pizza Hut' },
          { id: 3, text: 'KFC' },
        ],
      },
      {
        id: 4, sender: 'Cheryl', type: 'spin-wheel', time: '2:33 PM',
        label: 'Cheryl is inviting you to:',
        options: ['Sushiro', 'Pizza Hut', 'KFC', 'McDonalds'],
      },
    ],
  },
  {
    id: 2, type: 'group', name: 'Friday dinner group',
    members: ['Friend 2', 'Friend 3'],
    lastMessage: 'Friend 3: sent a poll', time: '1h', unread: 0,
    messages: [
      { id: 1, sender: 'Friend 3', text: 'Where shall we go Friday?', type: 'text', time: '1:00 PM' },
    ],
  },
  {
    id: 3, type: 'friend', name: 'Friend 2',
    lastMessage: 'Check out this new in place', time: '5m', unread: 5,
    messages: [
      { id: 1, sender: 'Friend 2', text: 'Check out this new in place', type: 'text', time: '3:00 PM' },
      {
        id: 2, sender: 'Friend 2', type: 'food-suggestion', time: '3:01 PM',
        restaurant: { id: 2, name: 'Odette', cuisine: 'French', rating: 5, image: null },
        likes: 1, dislikes: 0,
      },
    ],
  },
  {
    id: 4, type: 'friend', name: 'Friend 3',
    lastMessage: 'Check out this next chinese place', time: '1h', unread: 1,
    messages: [
      { id: 1, sender: 'Friend 3', text: 'Check out this next chinese place', type: 'text', time: '2:00 PM' },
    ],
  },
  {
    id: 5, type: 'friend', name: 'Friend 4',
    lastMessage: 'See you there', time: '2h', unread: 0,
    messages: [],
  },
  {
    id: 6, type: 'group', name: 'Family go-where eat',
    members: ['Friend 2', 'Friend 5'],
    lastMessage: 'Friend 2: recommended a place', time: '3h', unread: 0,
    messages: [],
  },
  {
    id: 7, type: 'friend', name: 'Friend 5',
    lastMessage: 'I heard this place have offer', time: '4h', unread: 10,
    messages: [],
  },
  {
    id: 8, type: 'group', name: 'Dinner after CCA',
    members: ['Friend 5', 'Friend 6'],
    lastMessage: 'Friend 5: Guys I heard this place have offer', time: '4h', unread: 0,
    messages: [],
  },
  {
    id: 9, type: 'friend', name: 'Friend 9',
    lastMessage: 'This place looks good', time: '5h', unread: 0,
    messages: [],
  },
  {
    id: 10, type: 'friend', name: 'Friend 10',
    lastMessage: 'On ya I went there last night', time: '6h', unread: 0,
    messages: [],
  },
];

export const mockFriends = [
  { id: 1, name: 'Sarah' },
  { id: 2, name: 'Mike' },
  { id: 3, name: 'Amy' },
  { id: 4, name: 'Xavier' },
  { id: 5, name: 'Cheryl' },
  { id: 6, name: 'Jordan' },
];
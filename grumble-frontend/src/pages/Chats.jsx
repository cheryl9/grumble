import React, { useState } from 'react';
import { mockChats, mockFriends } from '../components/chatsPage/mockData';
import logo from '../assets/logo.png';
import ChatList from '../components/chatsPage/ChatList';
import ChatWindow from '../components/chatsPage/ChatWindow';
import CreateGroupModal from '../components/chatsPage/CreateGroupModal';

const Chats = () => {
  const [ chats, setChats ] = useState(mockChats);
  const [ activeTab, setActiveTab ] = useState('all');
  const [ searchQuery, setSearchQuery ] = useState('');
  const [ activeChat, setActiveChat ] = useState(null);
  const [ showCreateGroup, setShowCreateGroup ] = useState(false);
  const [ viewRestaurant, setViewRestaurant ] = useState(null);

  const handleCreateGroup = (title, memberIds) => {
    const members = mockFriends.filter(f => memberIds.includes(f.id)).map(f => f.name);
    setChats(prev => [{
      id: Date.now(), 
      type: 'group', 
      name: title, members, 
      lastMessage: 'Group created', 
      time: 'Now',
      unread: 0,
      messages: [],
    }, ...prev]);
  };

  if (activeChat) return (
    <div className = "chats-page flex flex-col" style = {{ height: '100dvh' }}> 
    <ChatWindow 
      chat = {activeChat} 
      onBack = {() => setActiveChat(null)}
      onViewRestaurant = {setViewRestaurant}
    />

     {viewRestaurant && (
        <div
          className="fixed inset-0 bg-black/60 z-[4000] flex items-center justify-center p-4"
          onClick={() => setViewRestaurant(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-48 bg-[#FCF1DD] flex items-center justify-center text-6xl">🍽️</div>
            <div className="p-5">
              <h2 className="text-xl font-bold text-gray-900">{viewRestaurant.name}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{viewRestaurant.cuisine}</p>
              <div className="flex gap-0.5 mt-1">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={i <= Math.round(viewRestaurant.rating) ? 'star-filled' : 'star-empty'}>★</span>
                ))}
              </div>
              <button
                className="btn-primary w-full py-3 rounded-xl mt-4"
                onClick={() => setViewRestaurant(null)}
              >
                View Full Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className = "chats-page">
      <div className = "explore-header">
        <div className = "flex items-center justify-between">
          <div className = "flex items-center gap-3">
            <img src = {logo} alt = "Grumble" className = "w-12 h-12" />
            <h1 className="text-4xl font-bold">Chats</h1>
          </div>
        </div>
      </div>

      <ChatList
        chats = {chats}
        activeTab = {activeTab}
        setActiveTab = {setActiveTab}
        searchQuery= {searchQuery}
        setSearchQuery = {setSearchQuery}
        onSelectChat = {setActiveChat}
        onCreateGroup={() => setShowCreateGroup(true)}
      />

      {showCreateGroup && (
        <CreateGroupModal 
          onClose = {() => setShowCreateGroup(false)}
          onCreate = {handleCreateGroup}
        />
      )}
    </div>
  );
}

export default Chats;
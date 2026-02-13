import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import FoodPostCard from '../components/explorePage/FoodPostCard';
import { mockPosts } from '../components/explorePage/mockData';
import {logo} from '../assets/logo.png';

const Explore = () => {
  const [activeTab, setActiveTab] = useState('forYou');

  return (
    <div className="explore-page">
      <div className="explore-header">
        <div className="flex items-center gap-3 mb-4">
          <img src={logo} alt="Grumble" className="w-12 h-12" />
          <h1 className="text-4xl font-bold">Explore</h1>
        </div>
      </div>

      {/* 3 tabs */}
      <div className="explore-tab-bar">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('forYou')}
            className={`tab ${activeTab === 'forYou' ? 'tab-active' : 'tab-inactive'}`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`tab ${activeTab === 'friends' ? 'tab-active' : 'tab-inactive'}`}
          >
            Friends
          </button>
          <button
            onClick={() => setActiveTab('myPosts')}
            className={`tab ${activeTab === 'myPosts' ? 'tab-active' : 'tab-inactive'}`}
          >
            My posts
          </button>
        </div>

        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} strokeWidth={2.5} />
          Upload New
        </button>
      </div>

      {/* Posts Grid */}
      <div className="posts-grid fade-in">
        {mockPosts.map((post) => (
          <FoodPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Explore;
import React from "react";
import { Search, Plus } from "lucide-react";
import Avatar from "./Avatar";

const TABS = ["all", "groups", "friends"];

const ChatList = ({
  chats,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onSelectChat,
  onCreateGroup,
  isLoading,
}) => {
  const filtered = (chats || []).filter((c) => {
    const name = (c.name || "").toLowerCase();
    const matchTabs =
      activeTab === "all" ||
      (activeTab === "groups" && c.type === "group") ||
      (activeTab === "friends" && c.type === "friend");
    const matchSearch = c.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchTabs && matchSearch;
  });

  return (
    <>
      <div className="chats-search-bar">
        <div className="flex gap-2 flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`chats-tab capitalize ${
                activeTab === tab ? "chats-tab-active" : "chats-tab-inactive"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="search-container flex-1">
          <Search
            size={16}
            className="search-icon"
            style={{ transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            style={{ background: "#F78660", color: "white" }}
          />
        </div>

        <button
          onClick={onCreateGroup}
          className="btn-primary flex items-center gap-2 px-3 py-1 rounded-full text-sm flex-shrink-0"
        >
          <Plus size={16} /> Create Group
        </button>
      </div>

      <div className="chats-list">
        {isLoading && (
          <div className="text-center py-10 text-gray-400">
            <p className="font-semibold">Loading…</p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">💬</p>
            <p className="font-semibold">No chats found</p>
          </div>
        )}

        {filtered.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className="chat-list-item"
          >
            <Avatar name={chat.name} size="md" />
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-900 text-sm truncate">
                  {chat.name}
                </p>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {chat.time}
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {chat.lastMessage}
              </p>
            </div>
            {chat.unread > 0 && (
              <span className="chat-unread-badge">{chat.unread}</span>
            )}
          </button>
        ))}
      </div>
    </>
  );
};

export default ChatList;


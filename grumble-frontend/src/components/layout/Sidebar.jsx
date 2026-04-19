import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Globe,
  MessageCircle,
  Users,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useChatUnread } from "../../context/ChatUnreadContext";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalUnread } = useChatUnread();

  const menuItems = [
    { id: "explore", label: "Explore", icon: Home, path: "/explore" },
    {
      id: "find spots",
      label: "Find Spots",
      icon: Search,
      path: "/find-spots",
    },
    { id: "food map", label: "Food Map", icon: Globe, path: "/food-map" },
    { id: "chats", label: "Chats", icon: MessageCircle, path: "/chats" },
    { id: "friends", label: "Friends", icon: Users, path: "/friends" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"} `}>
      <nav className="flex-1 pt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const showChatBadge = item.id === "chats" && totalUnread > 0;
          const chatBadgeLabel = totalUnread > 99 ? "99+" : String(totalUnread);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`sidebar-item ${isActive ? "sidebar-item-active" : "sidebar-item-inactive"}`}
              title={!isOpen ? item.label : " "}
            >
              <span style={{ position: "relative", display: "inline-flex" }}>
                <Icon size={24} strokeWidth={2} />
                {showChatBadge && (
                  <span
                    className="chat-unread-badge"
                    style={{
                      position: "absolute",
                      top: "-7px",
                      right: "-7px",
                      transform: "scale(0.9)",
                    }}
                    aria-label={`${chatBadgeLabel} unread messages`}
                  >
                    {chatBadgeLabel}
                  </span>
                )}
              </span>
              {isOpen && <span className="font-medium"> {item.label} </span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pb-4">
        <button
          onClick={() => navigate("/login")}
          className="sidebar-item sidebar-item-inactive"
          title={!isOpen ? "Logout" : ""}
        >
          <LogOut size={24} className="text-red-500" strokeWidth={2.5} />
          {isOpen && <span className="font-medium text-red-500">Logout</span>}
        </button>
      </div>

      <button
        onClick={toggleSidebar}
        className="sidebar-toggle"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          <ChevronLeft size={20} strokeWidth={2.5} />
        ) : (
          <ChevronRight size={20} strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
};

export default Sidebar;

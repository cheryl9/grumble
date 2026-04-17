import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import FloatingPet from "../common/FloatingPet";
import api from "../../services/api";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await api.get("/auth/streak");
        if (res.data.success) {
          setStreak(res.data.data.currentStreak || 0);
        }
      } catch (error) {
        console.error("Failed to fetch streak:", error);
      }
    };

    fetchStreak();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main
        className="flex-1 overflow-y-auto transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? "200px" : "80px" }}
      >
        <Outlet />
      </main>
      <FloatingPet streak={streak} />
    </div>
  );
}

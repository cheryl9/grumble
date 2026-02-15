import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main 
        className="flex-1 overflow-y-auto transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? '200px' : '80px' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
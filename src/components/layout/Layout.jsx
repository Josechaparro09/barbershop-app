//src\components\layout\Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useTheme } from '../../context/ThemeContext';

const Layout = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200
      ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      <Navbar />
      <main className="flex-grow p-4">
        <div className="container mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
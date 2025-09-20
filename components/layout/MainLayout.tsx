
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../shared/Logo';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const childNavLinks = [
    { to: '/monitor', label: 'Monitor', icon: '🔍' },
    { to: '/mood-tracker', label: 'Mood Tracker', icon: '😊' },
    { to: '/safe-circles', label: 'Safe Circles', icon: '🤝' },
  ];

  const parentNavLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  ];

  const navLinks = user?.role === 'Child' ? childNavLinks : parentNavLinks;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 shadow-sm sticky top-0 z-10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Logo className="h-10 w-auto" />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-base font-medium transition-colors duration-200 ${
                      isActive ? 'text-blue-600' : 'text-slate-600 hover:text-blue-500'
                    }`
                  }
                >
                  <span className="mr-2">{link.icon}</span>{link.label}
                </NavLink>
              ))}
            </div>
            <div className="flex items-center">
                <span className="text-slate-600 mr-4 hidden sm:inline">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-blue-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-600 transition-colors duration-200 text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="md:hidden bg-white/80 backdrop-blur-sm border-t border-blue-100 fixed bottom-0 left-0 right-0">
          <div className="flex justify-around items-center h-16">
              {navLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} className={({ isActive }) => `flex flex-col items-center transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                      <span className="text-2xl">{link.icon}</span>
                      <span className="text-xs font-medium">{link.label}</span>
                  </NavLink>
              ))}
          </div>
      </footer>
    </div>
  );
};

export default MainLayout;

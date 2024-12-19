// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { Moon, Sun, Scissors, Menu, X, ChevronDown, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const menuLinks = user?.role === 'admin' ? [
    { to: '/admin', text: 'Estadísticas' },
    { to: '/admin/new-haircut', text: 'Nuevo Servicio' },
    { to: '/admin/barbers', text: 'Gestionar Barberos' },
    { to: '/admin/services', text: 'Servicios' },
    { to: '/admin/approvals', text: 'Aprobar Servicios' },
    { to: '/admin/inventory', text: 'Inventario' },
    { to: '/admin/expenses', text: 'Control de Gastos' },
    { to: '/admin/appointments', text: 'Citas' }
    
  ] : [
    { to: '/barber', text: 'Estadísticas' },
    { to: '/barber/new-haircut', text: 'Nuevo Servicio' },
    { to: '/barber/services', text: 'Mis Servicios' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente');
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-gray-800 dark:to-gray-900 shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-white" />
              <span className="text-white font-bold text-xl">StarBarber</span>
            </Link>
          </div>

          {/* Menú de escritorio */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              {menuLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isCurrentPath(link.to)
                      ? 'bg-indigo-700 dark:bg-gray-700 text-white'
                      : 'text-indigo-100 hover:bg-indigo-500 dark:hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {link.text}
                </Link>
              ))}
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-white hover:bg-indigo-500 dark:hover:bg-gray-700 transition-colors"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              
              <div className="relative ml-4 flex items-center space-x-3">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-1 text-white hover:text-indigo-200 dark:hover:text-gray-300 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm">{user.name}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 top-full ring-1 ring-black ring-opacity-5">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-500 dark:hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botón menú móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:bg-indigo-500 dark:hover:bg-gray-700 hover:text-white focus:outline-none transition-colors"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Abrir menú principal</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && user && (
          <>
            {/* Overlay oscuro */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menú lateral */}
            <div className={`
              fixed top-0 right-0 h-full w-64 
              bg-gradient-to-r from-indigo-600 to-indigo-800 
              dark:from-gray-800 dark:to-gray-900
              z-50 transform transition-transform duration-300 ease-in-out md:hidden
              ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl
            `}>
              <div className="flex flex-col h-full">
                {/* Header del menú */}
                <div className="flex justify-between items-center p-4 border-b border-indigo-500 dark:border-gray-700">
                  <span className="text-white font-bold">Menú</span>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white hover:text-indigo-200 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Links de navegación */}
                <div className="flex-1 px-2 py-4 overflow-y-auto">
                  {menuLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`block px-3 py-2 rounded-md text-base font-medium mb-1 transition-colors
                        ${isCurrentPath(link.to)
                          ? 'bg-indigo-700 dark:bg-gray-700 text-white'
                          : 'text-indigo-100 hover:bg-indigo-500 dark:hover:bg-gray-700 hover:text-white'
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.text}
                    </Link>
                  ))}
                  {/* Theme Toggle en móvil */}
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-500 dark:hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-5 w-5 mr-2" />
                        Modo Claro
                      </>
                    ) : (
                      <>
                        <Moon className="h-5 w-5 mr-2" />
                        Modo Oscuro
                      </>
                    )}
                  </button>
                </div>

                {/* Footer con info del usuario */}
                <div className="border-t border-indigo-500 dark:border-gray-700 p-4">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-gray-700 flex items-center justify-center">
                      <User className="h-6 w-6 text-indigo-600 dark:text-gray-300" />
                    </div>
                    <div className="ml-3">
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-indigo-200 dark:text-gray-400 text-sm">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 rounded-md text-indigo-100 hover:bg-indigo-500 dark:hover:bg-gray-700 hover:text-white transition-colors text-left"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
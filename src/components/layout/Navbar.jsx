import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Navbar = () => {
 const { user, logout } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();
 const [isMenuOpen, setIsMenuOpen] = useState(false);

 const menuLinks = user?.role === 'admin' ? [
   { to: '/admin', text: 'Estadísticas' },
   { to: '/admin/new-haircut', text: 'Nuevo Servicio' },
   { to: '/admin/barbers', text: 'Gestionar Barberos' },
   { to: '/admin/services', text: 'Servicios' },
   { to: '/admin/approvals', text: 'Aprobar Servicios' },
   { to: '/admin/inventory', text: 'Inventario' },
   { to: '/admin/expenses', text: 'Control de Gastos' }
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
   <nav className="bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-lg">
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       <div className="flex items-center justify-between h-16">
         {/* Logo */}
         <div className="flex items-center">
           <Link to="/" className="flex items-center space-x-2">
             <span className="text-white font-bold text-xl">✂️ StarBarber</span>
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
                     ? 'bg-indigo-700 text-white'
                     : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
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
                 className="flex items-center space-x-1 text-white hover:text-indigo-200 transition-colors"
               >
                 <span className="text-sm">{user.name}</span>
                 <svg
                   className={`h-5 w-5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                   xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 20 20"
                   fill="currentColor"
                 >
                   <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                 </svg>
               </button>
               {isMenuOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 top-full">
                   <button
                     onClick={handleLogout}
                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-500 hover:text-white transition-colors"
                   >
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
             className="inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:bg-indigo-500 hover:text-white focus:outline-none transition-colors"
             aria-expanded={isMenuOpen}
           >
             <span className="sr-only">Abrir menú principal</span>
             {isMenuOpen ? (
               <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
               </svg>
             ) : (
               <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
               </svg>
             )}
           </button>
         </div>
       </div>

       {/* Menú móvil lateral */}
       {isMenuOpen && user && (
         <>
           {/* Overlay oscuro */}
           <div 
             className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
             onClick={() => setIsMenuOpen(false)}
           ></div>

           {/* Menú lateral */}
           <div className={`
             fixed top-0 right-0 h-full w-64 bg-gradient-to-r from-indigo-600 to-indigo-800 
             z-50 transform transition-transform duration-300 ease-in-out md:hidden
             ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl
           `}>
             <div className="flex flex-col h-full">
               {/* Header del menú */}
               <div className="flex justify-between items-center p-4 border-b border-indigo-500">
                 <span className="text-white font-bold">Menú</span>
                 <button 
                   onClick={() => setIsMenuOpen(false)}
                   className="text-white hover:text-indigo-200 transition-colors"
                 >
                   <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                   </svg>
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
                         ? 'bg-indigo-700 text-white'
                         : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
                       }`}
                     onClick={() => setIsMenuOpen(false)}
                   >
                     {link.text}
                   </Link>
                 ))}
               </div>

               {/* Footer con info del usuario */}
               <div className="border-t border-indigo-500 p-4">
                 <div className="flex items-center mb-4">
                   <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                     <svg className="h-6 w-6 text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                     </svg>
                   </div>
                   <div className="ml-3">
                     <div className="text-white font-medium">{user.name}</div>
                     <div className="text-indigo-200 text-sm">{user.email}</div>
                   </div>
                 </div>
                 <button
                   onClick={() => {
                     handleLogout();
                     setIsMenuOpen(false);
                   }}
                   className="w-full px-3 py-2 rounded-md text-indigo-100 hover:bg-indigo-500 hover:text-white transition-colors text-left"
                 >
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
// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await login(formData.email, formData.password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        await logout();
        toast.error('No se encontraron datos del usuario');
        return;
      }

      const userData = userDoc.data();

      if (userData.role === 'barber') {
        if (userData.status === 'pending') {
          await logout();
          toast.error('Tu cuenta está pendiente de aprobación por el administrador');
          return;
        }
        
        if (userData.status === 'inactive') {
          await logout();
          toast.error('Tu cuenta no está activa. Contacta al administrador de la barbería');
          return;
        }
      }

      toast.success('¡Bienvenido!');
      navigate(userData.role === 'admin' ? '/admin' : '/barber');
      
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      let errorMessage = 'Error al iniciar sesión';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Usuario deshabilitado';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Usuario no encontrado';
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Credenciales inválidas';
          break;
        default:
          errorMessage = 'Error al iniciar sesión. Verifica tus credenciales';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-2xl relative">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-500" />
          )}
        </button>

        <div>
        {theme === 'dark' ? (
            <img 
            src="/bb.png" 
            alt="Barbería" 
            className="mx-auto h-36"
          />
          ) : (
            <img 
            src="/bbDark.png" 
            alt="Barbería" 
            className="mx-auto h-36"
          />
          )}
          
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Iniciar sesión en tu cuenta
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border 
                  border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 
                  text-gray-900 dark:text-white rounded-t-md focus:outline-none 
                  focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm
                  dark:bg-gray-700 transition-colors duration-200"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border
                  border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400
                  text-gray-900 dark:text-white rounded-b-md focus:outline-none
                  focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm
                  dark:bg-gray-700 transition-colors duration-200"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent 
                text-sm font-medium rounded-md text-black bg-yellow-500 hover:bg-yellow-400
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 
                transition-colors duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </form>
        <div className="mt-6">
          <Link
            to="/register"
            className="w-full flex justify-center py-2 px-4 border border-yellow-500 rounded-md 
              shadow-sm text-sm font-medium text-yellow-500 bg-transparent
              hover:bg-yellow-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
          >
            Crear una cuenta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
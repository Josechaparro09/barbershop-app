import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import ShopList from '../components/common/ShopList';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'barber',
    phone: '',
    shopId: '',
    shopName: ''
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, user } = useAuth();

  // Si el usuario ya está autenticado, redirigir
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Si el usuario cambia el rol, resetear los campos de la barbería
      ...(name === 'role' && {
        shopId: '',
        shopName: ''
      })
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('El correo electrónico es requerido');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('El teléfono es requerido');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.role === 'barber' && !formData.shopId) {
      toast.error('Debe seleccionar una barbería');
      return false;
    }
    if (formData.role === 'admin' && !formData.shopName) {
      toast.error('Debe ingresar el nombre de la barbería');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Crear usuario en Authentication
      const userCredential = await signup(formData.email, formData.password);
      const uid = userCredential.user.uid;
      
      // Preparar datos para Firestore
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        createdAt: new Date().toISOString(),
        status: formData.role === 'admin' ? 'active' : 'inactive', // Los barberos inician inactivos
        shopId: formData.role === 'admin' ? uid : formData.shopId,
        shopName: formData.role === 'admin' ? formData.shopName : formData.shopName,
        uid: uid
      };

      // Si es admin, crear nueva barbería
      if (formData.role === 'admin') {
        userData.shopId = uid; // Usar el UID del admin como shopId
        userData.shopName = formData.shopName;
        userData.isShopOwner = true;
        userData.status = 'active'; // Admin siempre activo
      } else {
        // Si es barbero, verificar que la barbería existe
        const shopDoc = await getDoc(doc(db, "users", formData.shopId));
        if (!shopDoc.exists()) {
          throw new Error('La barbería seleccionada no existe');
        }
        userData.shopId = formData.shopId;
        userData.shopName = formData.shopName;
        userData.status = 'pending'; // Barbero inicia como pendiente
        userData.isApproved = false; // Estado de aprobación
      }

      // Guardar en Firestore
      await setDoc(doc(db, "users", uid), userData);
      
      let message = 'Registro exitoso';
      if (formData.role === 'barber') {
        message += '. Tu cuenta está pendiente de aprobación por el administrador de la barbería';
      }
      toast.success(message);
      navigate('/login');
    } catch (error) {
      console.error('Error en el registro:', error);
      let errorMessage = 'Error al registrar usuario';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo ya está registrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'El registro está deshabilitado temporalmente';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es muy débil';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear nueva cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Inicia sesión
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Teléfono"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <select
                id="role"
                name="role"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="barber">Barbero</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {formData.role === 'admin' ? (
              <div>
                <input
                  id="shopName"
                  name="shopName"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Nombre de la Barbería"
                  value={formData.shopName}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <div className="border border-gray-300 rounded-md p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Barbería
                </label>
                <ShopList
                  onSelect={(shop) => {
                    setFormData(prev => ({
                      ...prev,
                      shopId: shop.shopId,
                      shopName: shop.shopName
                    }));
                  }}
                  selectedShopId={formData.shopId}
                />
              </div>
            )}
            
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white 
                ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
            >
              {loading ? (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Registrando...
                </>
              ) : (
                'Registrarse'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
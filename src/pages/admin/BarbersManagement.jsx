// Importaciones en BarbersManagement.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth, secondaryAuth } from '../../firebase/config';  // Añadido secondaryAuth
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiToggleLeft, 
  FiToggleRight,
  FiUserPlus,
  FiUser,
  FiMail,
  FiPhone,
  FiLock
} from 'react-icons/fi';

const BarbersManagement = () => {
  const { user } = useAuth();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user?.shopId) {
      fetchBarbers();
    }
  }, [user?.shopId]);

  const fetchBarbers = async () => {
    try {
      const q = query(
        collection(db, "users"),
        where("shopId", "==", user.shopId),
        where("role", "==", "barber")
      );
      
      const querySnapshot = await getDocs(q);
      const barbersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBarbers(barbersData);
    } catch (error) {
      console.error("Error fetching barbers:", error);
      toast.error("Error al cargar los barberos");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (barberId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const barberRef = doc(db, "users", barberId);
      await updateDoc(barberRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid
      });

      setBarbers(prevBarbers => 
        prevBarbers.map(barber => 
          barber.id === barberId 
            ? { ...barber, status: newStatus }
            : barber
        )
      );

      toast.success(`Estado del barbero actualizado a ${newStatus === 'active' ? 'activo' : 'inactivo'}`);
    } catch (error) {
      console.error("Error toggling barber status:", error);
      toast.error("Error al actualizar el estado del barbero");
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("El nombre es requerido");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("El correo electrónico es requerido");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("El teléfono es requerido");
      return false;
    }
    if (!formData.password) {
      toast.error("La contraseña es requerida");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    return true;
  };

  const handleCreateBarber = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Crear nuevo usuario usando la instancia secundaria
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email,
        formData.password
      );

      // Preparar datos del barbero
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: 'barber',
        status: 'active',
        shopId: user.shopId,
        shopName: user.shopName,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
        uid: userCredential.user.uid
      };

      // Guardar datos en Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), userData);

      // Cerrar sesión en la instancia secundaria inmediatamente
      await secondaryAuth.signOut();

      // Cerrar modal y limpiar formulario
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        confirmPassword: ''
      });

      // Actualizar la lista de barberos
      fetchBarbers();
      
      toast.success("Barbero registrado exitosamente");
    } catch (error) {
      console.error("Error registering barber:", error);
      let errorMessage = "Error al registrar el barbero";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este correo ya está registrado";
      }
      toast.error(errorMessage);

      // Si hay un error, asegurarse de cerrar la sesión secundaria
      try {
        await secondaryAuth.signOut();
      } catch (signOutError) {
        console.error("Error al cerrar sesión secundaria:", signOutError);
      }
    }
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || badges.inactive;
  };

  const translateStatus = (status) => ({
    active: 'Activo',
    inactive: 'Inactivo'
  }[status] || status);

  const filteredBarbers = barbers.filter(barber => {
    if (filter === 'all') return true;
    return barber.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Barberos</h1>
          <p className="text-gray-600 text-sm sm:text-base">Barbería: {user?.shopName}</p>
        </div>
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <FiUserPlus className="w-5 h-5" />
            <span>Agregar Barbero</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:hidden">
        {filteredBarbers.length === 0 ? (
          <p className="text-center text-gray-500">
            No hay barberos {filter !== 'all' ? `en estado ${translateStatus(filter)}` : ''}
          </p>
        ) : (
          filteredBarbers.map((barber) => (
            <div key={barber.id} className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{barber.name}</h2>
                  <p className="text-gray-500">{barber.email}</p>
                  <p className="text-gray-500">{barber.phone}</p>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${getStatusBadge(barber.status)}`}>
                    {translateStatus(barber.status)}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleActive(barber.id, barber.status)}
                  className={`p-2 rounded-full ${barber.status === 'active' ? 'text-red-600' : 'text-green-600'} hover:bg-gray-100 transition`}
                >
                  {barber.status === 'active' ? <FiToggleLeft size={20} /> : <FiToggleRight size={20} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden sm:block bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBarbers.map((barber) => (
              <tr key={barber.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                <td className="px-4 py-2 text-gray-900 dark:text-gray-300">{barber.name}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-300">{barber.email}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-300">{barber.phone}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(barber.status)}`}>
                    {translateStatus(barber.status)}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button 
                    onClick={() => handleToggleActive(barber.id, barber.status)}
                    className={`flex items-center ml-auto transition-colors duration-150 ${
                      barber.status === 'active' 
                        ? 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300' 
                        : 'text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                    }`}
                  >
                    {barber.status === "active" ? (
                      <>
                        <FiXCircle className="mr-1" />
                        <span>Desactivar</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="mr-1" />
                        <span>Activar</span>
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {filteredBarbers.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-2 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron barberos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Modal de Registro de Barbero */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Registrar Nuevo Barbero
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateBarber} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiUser />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiMail />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiPhone />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="123-456-7890"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiLock />
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiLock />
                  </div>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Confirmar contraseña"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <FiUserPlus className="w-5 h-5" />
                  Registrar Barbero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarbersManagement;
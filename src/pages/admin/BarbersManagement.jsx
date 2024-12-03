import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const BarbersManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        // Verificar que el usuario sea admin y tenga shopId
        if (!user || !user.shopId || user.role !== 'admin') {
          console.error('Usuario no autorizado o falta shopId');
          toast.error('No tienes permisos para ver esta página');
          navigate('/');
          return;
        }

        // Consulta solo los barberos de la barbería del admin
        const q = query(
          collection(db, "users"), 
          where("role", "==", "barber"),
          where("shopId", "==", user.shopId)
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

    fetchBarbers();
  }, [user, navigate]);

  const toggleBarberStatus = async (barberId, currentStatus) => {
    if (!user?.shopId) {
      toast.error('Error de autenticación');
      return;
    }

    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, "users", barberId), {
        status: newStatus
      });
      
      setBarbers(barbers.map(barber => 
        barber.id === barberId 
          ? { ...barber, status: newStatus }
          : barber
      ));
      
      toast.success(`Estado del barbero actualizado`);
    } catch (error) {
      console.error("Error updating barber status:", error);
      toast.error("Error al actualizar el estado del barbero");
    }
  };

  const copyShopId = () => {
    if (!user?.shopId) {
      toast.error('No se encontró el ID de la barbería');
      return;
    }
    navigator.clipboard.writeText(user.shopId);
    toast.success('ID de la barbería copiado al portapapeles');
  };

  if (!user || !user.shopId || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Acceso No Autorizado</h2>
          <p className="text-gray-600 mt-2">No tienes permisos para ver esta página</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Barberos</h1>
          <p className="text-gray-600">Barbería: {user.shopName || 'No disponible'}</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-sm text-gray-500">Total de barberos: {barbers.length}</p>
          <button
            onClick={copyShopId}
            className="text-sm text-indigo-600 hover:text-indigo-800 mt-1"
          >
            Copiar ID de barbería
          </button>
        </div>
      </div>

      {/* Vista móvil */}
      <div className="md:hidden space-y-4">
        {barbers.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No hay barberos registrados. Comparte el ID de la barbería para que los barberos puedan registrarse.
          </p>
        ) : (
          barbers.map((barber) => (
            <div
              key={barber.id}
              className="bg-white shadow rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{barber.name}</h3>
                  <p className="text-sm text-gray-500">{barber.email}</p>
                  <p className="text-sm text-gray-500">{barber.phone}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full 
                    ${barber.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'}`}
                >
                  {barber.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => toggleBarberStatus(barber.id, barber.status)}
                  className={`px-3 py-1 rounded-md text-sm font-medium text-white 
                    ${barber.status === 'active' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {barber.status === 'active' ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vista escritorio */}
      <div className="hidden md:block">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {barbers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No hay barberos registrados. Comparte el ID de la barbería para que los barberos puedan registrarse.
                  </td>
                </tr>
              ) : (
                barbers.map((barber) => (
                  <tr key={barber.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{barber.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{barber.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{barber.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${barber.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'}`}
                      >
                        {barber.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleBarberStatus(barber.id, barber.status)}
                        className={`px-3 py-1 rounded-md text-sm font-medium text-white 
                          ${barber.status === 'active' 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        {barber.status === 'active' ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BarbersManagement;
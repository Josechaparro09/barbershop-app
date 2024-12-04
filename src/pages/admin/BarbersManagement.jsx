import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const BarbersManagement = () => {
  const { user } = useAuth();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBarbers();
  }, [user?.shopId]);

  const fetchBarbers = async () => {
    if (!user?.shopId) return;

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

      setBarbers(barbers.map(barber => 
        barber.id === barberId 
          ? { ...barber, status: newStatus }
          : barber
      ));

      toast.success(`Estado del barbero actualizado a ${newStatus}`);
    } catch (error) {
      console.error("Error toggling barber status:", error);
      toast.error("Error al actualizar el estado del barbero");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.inactive;
  };

  const translateStatus = (status) => {
    const translations = {
      pending: 'Pendiente',
      active: 'Activo',
      inactive: 'Inactivo',
      rejected: 'Rechazado'
    };
    return translations[status] || status;
  };

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
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="rejected">Rechazados</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:hidden">
        {filteredBarbers.length === 0 ? (
          <p className="text-center text-gray-500">No hay barberos {filter !== 'all' ? `en estado ${translateStatus(filter)}` : 'registrados'}</p>
        ) : (
          filteredBarbers.map((barber) => (
            <div key={barber.id} className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{barber.name}</h2>
                  <p className="text-gray-500">{barber.email}</p>
                  <p className="text-gray-500">{barber.phone}</p>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${getStatusBadge(barber.status)}`}>
                    {translateStatus(barber.status)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleActive(barber.id, barber.status)}
                    className={`p-2 rounded-full ${barber.status === 'active' ? 'text-red-600' : 'text-green-600'} hover:bg-gray-100 transition`}
                  >
                    {barber.status === 'active' ? <FiToggleLeft size={20} /> : <FiToggleRight size={20} />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden sm:block bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBarbers.map((barber) => (
                <tr key={barber.id}>
                  <td className="px-4 py-2">{barber.name}</td>
                  <td className="px-4 py-2">{barber.email}</td>
                  <td className="px-4 py-2">{barber.phone}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(barber.status)}`}>
                      {translateStatus(barber.status)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button 
                      onClick={() => handleToggleActive(barber.id, barber.status)}
                      className="flex items-center text-blue-500 hover:text-blue-600"
                    >
                      {barber.status === "active" ? <FiXCircle className="mr-1" /> : <FiCheckCircle className="mr-1" />}
                      {barber.status === "active" ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BarbersManagement;

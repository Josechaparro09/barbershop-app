import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

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
const handleActivation = async (barberId, action) => {
    try {
      const barberRef = doc(db, "users", barberId);
      const updateData = {
        status: action ? 'active' : 'pending',
        isApproved: action,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid
      };

      if (action) {
        updateData.approvedAt = new Date().toISOString();
        updateData.approvedBy = user.uid;
      }

      await updateDoc(barberRef, updateData);
      
      setBarbers(barbers.map(barber => 
        barber.id === barberId 
          ? { 
              ...barber, 
              status: action ? 'active' : 'pending',
              isApproved: action,
              approvedAt: action ? new Date().toISOString() : null
            }
          : barber
      ));
      
      toast.success(`Barbero ${action ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      console.error("Error updating barber status:", error);
      toast.error("Error al actualizar el estado del barbero");
    }
  };

  const handleToggleStatus = async (barberId, currentStatus) => {
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
          ? { 
              ...barber, 
              status: newStatus,
              updatedAt: new Date().toISOString(),
              updatedBy: user.uid
            }
          : barber
      ));
      
      toast.success(`Barbero ${newStatus === 'active' ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      console.error("Error updating barber status:", error);
      toast.error("Error al actualizar el estado del barbero");
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      default:
        return status;
    }
  };
  // Función para manejar la aprobación inicial
  const handleApproval = async (barberId, approve) => {
    try {
      const barberRef = doc(db, "users", barberId);
      await updateDoc(barberRef, {
        status: approve ? 'active' : 'rejected',
        approvedAt: approve ? new Date().toISOString() : null,
        approvedBy: approve ? user.uid : null,
        updatedAt: new Date().toISOString()
      });

      setBarbers(barbers.map(barber => 
        barber.id === barberId 
          ? { 
              ...barber, 
              status: approve ? 'active' : 'rejected',
              approvedAt: approve ? new Date().toISOString() : null 
            }
          : barber
      ));

      toast.success(`Barbero ${approve ? 'aprobado' : 'rechazado'} exitosamente`);
    } catch (error) {
      console.error("Error updating barber approval:", error);
      toast.error("Error al actualizar el estado del barbero");
    }
  };

  // Función para cambiar el estado activo/inactivo
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Barberos</h1>
          <p className="text-gray-600">Barbería: {user?.shopName}</p>
        </div>
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="rejected">Rechazados</option>
          </select>
        </div>
      </div>

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
            {filteredBarbers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No hay barberos {filter !== 'all' ? `en estado ${translateStatus(filter)}` : 'registrados'}
                </td>
              </tr>
            ) : (
              filteredBarbers.map((barber) => (
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(barber.status)}`}>
                      {translateStatus(barber.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {barber.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproval(barber.id, true)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleApproval(barber.id, false)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : barber.status !== 'rejected' && (
                      <button
                        onClick={() => handleToggleActive(barber.id, barber.status)}
                        className={barber.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                      >
                        {barber.status === 'active' ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BarbersManagement;   
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const HaircutApprovals = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingServices();
  }, [user?.shopId]);

  const fetchPendingServices = async () => {
    if (!user?.shopId) return;

    try {
      const q = query(
        collection(db, "haircuts"),
        where("shopId", "==", user.shopId),
        where("approvalStatus", "==", "pending")
      );

      const querySnapshot = await getDocs(q);
      const servicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Error al cargar los servicios pendientes");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (serviceId, approved) => {
    try {
      const serviceRef = doc(db, "haircuts", serviceId);
      const updateData = {
        approvalStatus: approved ? 'approved' : 'rejected',
        status: approved ? 'completed' : 'rejected',
        approvedAt: new Date().toISOString(),
        approvedBy: user.uid,
        approvedByName: user.name
      };

      await updateDoc(serviceRef, updateData);
      
      setServices(services.filter(service => service.id !== serviceId));
      
      toast.success(`Servicio ${approved ? 'aprobado' : 'rechazado'} exitosamente`);
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Error al actualizar el servicio");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Aprobación de Servicios</h1>

      {services.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          No hay servicios pendientes de aprobación
        </div>
      ) : (
        <div className="grid gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {service.serviceName}
                    </h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pendiente
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Cliente: {service.clientName}</p>
                  <p className="text-sm text-gray-500">Barbero: {service.barberName}</p>
                  <p className="text-sm text-gray-500">
                    Precio: ${service.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Fecha: {format(new Date(service.createdAt), 'dd/MM/yyyy HH:mm')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Método de pago: {service.paymentMethod}
                  </p>
                  {service.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      Notas: {service.notes}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproval(service.id, true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleApproval(service.id, false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HaircutApprovals;
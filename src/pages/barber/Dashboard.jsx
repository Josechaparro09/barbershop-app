import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

const BarberDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    completedServices: 0,
    pendingServices: 0,
    todayEarnings: 0,
    pendingEarnings: 0
  });
  const [recentServices, setRecentServices] = useState([]);
  const [pendingServices, setPendingServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchServices();
    }
  }, [user?.uid]);

  const fetchServices = async () => {
    try {
      console.log("Fetching services for barber:", user.uid);
      
      // Obtener servicios pendientes
      const pendingRef = query(
        collection(db, "haircuts"),
        where("barberId", "==", user.uid),
        where("status", "==", "pending")
      );
      
      // Obtener servicios aprobados
      const approvedRef = query(
        collection(db, "haircuts"),
        where("barberId", "==", user.uid),
        where("status", "==", "completed")
      );

      const [pendingSnapshot, approvedSnapshot] = await Promise.all([
        getDocs(pendingRef),
        getDocs(approvedRef)
      ]);

      // Procesar servicios pendientes
      const pendingData = pendingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Servicios pendientes encontrados:", pendingData.length);
      setPendingServices(pendingData);

      // Procesar servicios aprobados
      const approvedData = approvedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Servicios aprobados encontrados:", approvedData.length);
      setRecentServices(approvedData);

      // Actualizar estadísticas
      const pendingEarnings = pendingData.reduce((total, service) => total + (service.price || 0), 0);
      const completedEarnings = approvedData.reduce((total, service) => total + (service.price || 0), 0);

      setStats({
        completedServices: approvedData.length,
        pendingServices: pendingData.length,
        todayEarnings: completedEarnings,
        pendingEarnings: pendingEarnings
      });

    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Error al cargar los servicios");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const ServiceList = ({ services, isPending = false }) => (
    <div className="space-y-4">
      {services.map(service => (
        <div 
          key={service.id}
          className="bg-white rounded-lg shadow p-4 border-l-4 border-l-indigo-500"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">{service.serviceName}</h3>
              <p className="text-sm text-gray-600">Cliente: {service.clientName}</p>
              <p className="text-sm text-gray-600">
                Fecha: {format(new Date(service.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
              </p>
              <p className="text-sm text-gray-600">Precio: ${service.price}</p>
              {service.paymentMethod && (
                <p className="text-sm text-gray-600">
                  Método de pago: {service.paymentMethod}
                </p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPending 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {isPending ? 'Pendiente' : 'Aprobado'}
            </span>
          </div>
        </div>
      ))}
      {services.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          No hay servicios {isPending ? 'pendientes' : 'aprobados'}
        </p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Dashboard</h1>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Servicios Aprobados</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {stats.completedServices}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Servicios Pendientes</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {stats.pendingServices}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Ingresos Aprobados</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            ${stats.todayEarnings.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Ingresos Pendientes</h3>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            ${stats.pendingEarnings.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Servicios Pendientes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Servicios Pendientes de Aprobación</h2>
        <ServiceList services={pendingServices} isPending={true} />
      </div>

      {/* Servicios Aprobados */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Servicios Aprobados</h2>
        <ServiceList services={recentServices} />
      </div>
    </div>
  );
};

export default BarberDashboard;
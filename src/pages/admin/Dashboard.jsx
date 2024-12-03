import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBarbers: 0,
    activeBarbers: 0,
    todayServices: 0,
    todayEarnings: 0,
    monthlyServices: 0,
    monthlyEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentServices, setRecentServices] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.shopId) return;

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Obtener barberos de esta barbería
        const barbersQuery = query(
          collection(db, "users"), 
          where("role", "==", "barber"),
          where("shopId", "==", user.shopId)
        );
        const barbersSnapshot = await getDocs(barbersQuery);
        const barberIds = barbersSnapshot.docs.map(doc => doc.id);
        const totalBarbers = barbersSnapshot.size;
        const activeBarbers = barbersSnapshot.docs.filter(doc => doc.data().status === 'active').length;

        // Obtener servicios de hoy solo de los barberos de esta barbería
        const todayServicesQuery = query(
          collection(db, "haircuts"),
          where("barberId", "in", barberIds),
          where("createdAt", ">=", today.toISOString())
        );
        const todayServicesSnapshot = await getDocs(todayServicesQuery);
        const todayServices = todayServicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Obtener servicios del mes
        const monthlyServicesQuery = query(
          collection(db, "haircuts"),
          where("barberId", "in", barberIds),
          where("createdAt", ">=", firstDayOfMonth.toISOString())
        );
        const monthlyServicesSnapshot = await getDocs(monthlyServicesQuery);
        const monthlyServices = monthlyServicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calcular estadísticas
        const todayEarnings = todayServices.reduce((sum, service) => sum + service.price, 0);
        const monthlyEarnings = monthlyServices.reduce((sum, service) => sum + service.price, 0);

        setStats({
          totalBarbers,
          activeBarbers,
          todayServices: todayServices.length,
          todayEarnings,
          monthlyServices: monthlyServices.length,
          monthlyEarnings
        });

        // Obtener servicios recientes
        const sortedServices = todayServices
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentServices(sortedServices);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.shopId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{user?.shopName || 'Dashboard'}</h1>
      
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Barberos</h3>
          <div className="flex justify-between items-center">
            <p className="text-3xl font-bold text-indigo-600">{stats.activeBarbers}</p>
            <p className="text-sm text-gray-500">de {stats.totalBarbers} activos</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Servicios Hoy</h3>
          <div className="flex justify-between items-center">
            <p className="text-3xl font-bold text-green-600">{stats.todayServices}</p>
            <p className="text-sm text-gray-500">${stats.todayEarnings.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Este Mes</h3>
          <div className="flex justify-between items-center">
            <p className="text-3xl font-bold text-purple-600">{stats.monthlyServices}</p>
            <p className="text-sm text-gray-500">${stats.monthlyEarnings.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Servicios recientes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Servicios Recientes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barbero
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentServices.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {service.clientName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {service.serviceName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {service.barberName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${service.price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {format(new Date(service.createdAt), 'HH:mm', { locale: es })}
                    </div>
                  </td>
                </tr>
              ))}
              {recentServices.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No hay servicios registrados hoy
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
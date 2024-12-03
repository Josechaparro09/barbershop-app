import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const BarberDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayServices: 0,
    todayEarnings: 0,
    weeklyServices: 0,
    weeklyEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentServices, setRecentServices] = useState([]);
  const [topServices, setTopServices] = useState([]);

  useEffect(() => {
    const fetchBarberData = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        // Obtener servicios de hoy
        const todayServicesQuery = query(
          collection(db, "haircuts"),
          where("barberId", "==", user.uid),
          where("createdAt", ">=", today.toISOString())
        );
        const todayServicesSnapshot = await getDocs(todayServicesQuery);
        const todayServices = todayServicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Obtener servicios de la semana
        const weeklyServicesQuery = query(
          collection(db, "haircuts"),
          where("barberId", "==", user.uid),
          where("createdAt", ">=", lastWeek.toISOString())
        );
        const weeklyServicesSnapshot = await getDocs(weeklyServicesQuery);
        const weeklyServices = weeklyServicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calcular estadísticas
        const todayEarnings = todayServices.reduce((sum, service) => sum + service.price, 0);
        const weeklyEarnings = weeklyServices.reduce((sum, service) => sum + service.price, 0);

        setStats({
          todayServices: todayServices.length,
          todayEarnings,
          weeklyServices: weeklyServices.length,
          weeklyEarnings
        });

        // Obtener servicios recientes
        const sortedServices = todayServices
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentServices(sortedServices);

        // Calcular servicios más populares
        const servicesCount = weeklyServices.reduce((acc, service) => {
          acc[service.serviceName] = (acc[service.serviceName] || 0) + 1;
          return acc;
        }, {});

        const topServicesList = Object.entries(servicesCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([name, count]) => ({ name, count }));
        
        setTopServices(topServicesList);

      } catch (error) {
        console.error("Error fetching barber data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBarberData();
  }, [user.uid]);

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
        <h1 className="text-2xl font-bold text-gray-900">Mi Dashboard</h1>
        <Link
          to="/barber/new-haircut"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Nuevo Servicio
        </Link>
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Hoy</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Servicios</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.todayServices}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ingresos</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats.todayEarnings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Esta Semana</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Servicios</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.weeklyServices}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ingresos</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats.weeklyEarnings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Servicios Recientes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Servicios Recientes</h3>
          <div className="space-y-4">
            {recentServices.length > 0 ? (
              recentServices.map((service) => (
                <div key={service.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium text-gray-800">{service.serviceName}</p>
                    <p className="text-sm text-gray-500">{service.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">${service.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(service.createdAt), 'HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No hay servicios registrados hoy</p>
            )}
          </div>
        </div>

        {/* Servicios Más Populares */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Servicios Más Populares</h3>
          <div className="space-y-4">
            {topServices.length > 0 ? (
              topServices.map((service, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <p className="font-medium text-gray-800">{service.name}</p>
                  <div className="flex items-center">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {service.count} servicios
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No hay datos suficientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberDashboard;
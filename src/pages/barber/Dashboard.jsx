// src/pages/barber/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  Clock,
  DollarSign,
  ClipboardList,
  Calendar,
  TrendingUp,
  Scissors,
  User
} from "lucide-react";

const BarberDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    completedServices: 0,
    pendingServices: 0,
    todayEarnings: 0,
    pendingEarnings: 0,
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
      const pendingRef = query(
        collection(db, "haircuts"),
        where("barberId", "==", user.uid),
        where("status", "==", "pending")
      );

      const approvedRef = query(
        collection(db, "haircuts"),
        where("barberId", "==", user.uid),
        where("status", "==", "completed")
      );

      const [pendingSnapshot, approvedSnapshot] = await Promise.all([
        getDocs(pendingRef),
        getDocs(approvedRef),
      ]);

      const pendingData = pendingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingServices(pendingData);

      const approvedData = approvedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecentServices(approvedData);

      const pendingEarnings = pendingData.reduce(
        (total, service) => total + (service.price || 0),
        0
      );
      const completedEarnings = approvedData.reduce(
        (total, service) => total + (service.price || 0),
        0
      );

      setStats({
        completedServices: approvedData.length,
        pendingServices: pendingData.length,
        todayEarnings: completedEarnings,
        pendingEarnings: pendingEarnings,
      });
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Error al cargar los servicios");
    } finally {
      setLoading(false);
    }
  };

  const ServiceList = ({ services, isPending = false }) => {
    const cardBgColor = theme === 'dark' 
      ? 'bg-gray-800 hover:bg-gray-700' 
      : 'bg-white hover:bg-gray-50';

    const textColor = theme === 'dark'
      ? 'text-gray-300'
      : 'text-gray-700';

    return (
      <div className={`rounded-lg shadow-lg overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } transition-colors duration-200`}>
        <div className={`px-6 py-4 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        } flex justify-between items-center`}>
          <h3 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {isPending ? "Servicios Pendientes" : "Servicios Completados"}
          </h3>
          {isPending ? (
            <Clock className="text-yellow-500 h-5 w-5" />
          ) : (
            <CheckCircle className="text-green-500 h-5 w-5" />
          )}
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {services.length === 0 ? (
            <div className={`p-6 text-center ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No hay servicios {isPending ? "pendientes" : "completados"}
            </div>
          ) : (
            services.map((service) => (
              <div key={service.id} className={`p-4 ${cardBgColor} transition-colors duration-200`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Scissors className={`h-4 w-4 ${textColor}`} />
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {service.serviceName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className={`h-4 w-4 ${textColor}`} />
                      <span className={textColor}>
                        Cliente: {service.clientName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className={`h-4 w-4 ${textColor}`} />
                      <span className={textColor}>
                        {format(new Date(service.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${
                    theme === 'dark' 
                      ? 'bg-green-900/20 text-green-400' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    ${service.price?.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          theme === 'dark' ? 'border-white' : 'border-indigo-600'
        }`} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Dashboard de {user.name}
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          {user.shopName}
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Servicios Completados",
            value: stats.completedServices,
            icon: CheckCircle,
            color: "green",
          },
          {
            title: "Servicios Pendientes",
            value: stats.pendingServices,
            icon: Clock,
            color: "yellow",
          },
          {
            title: "Ingresos Totales",
            value: `$${stats.todayEarnings.toFixed(2)}`,
            icon: DollarSign,
            color: "blue",
          },
          {
            title: "Pendiente de Cobro",
            value: `$${stats.pendingEarnings.toFixed(2)}`,
            icon: TrendingUp,
            color: "purple",
          },
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`rounded-lg shadow-lg p-6 ${
                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
              } transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {card.title}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-opacity-10 ${
                  card.color === 'green' && (theme === 'dark' ? 'bg-green-400 text-green-400' : 'bg-green-500 text-green-500')
                } ${
                  card.color === 'yellow' && (theme === 'dark' ? 'bg-yellow-400 text-yellow-400' : 'bg-yellow-500 text-yellow-500')
                } ${
                  card.color === 'blue' && (theme === 'dark' ? 'bg-blue-400 text-blue-400' : 'bg-blue-500 text-blue-500')
                } ${
                  card.color === 'purple' && (theme === 'dark' ? 'bg-purple-400 text-purple-400' : 'bg-purple-500 text-purple-500')
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Listas de Servicios */}
      <div className="space-y-6">
        <ServiceList services={pendingServices} isPending={true} />
        <ServiceList services={recentServices} isPending={false} />
      </div>
    </div>
  );
};

export default BarberDashboard;
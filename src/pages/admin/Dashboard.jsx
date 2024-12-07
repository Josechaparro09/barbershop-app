// src\pages\admin\Dashboard.jsx
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Calendar,
  DollarSign,
  Scissors,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalBarbers: 0,
    activeBarbers: 0,
    pendingBarbers: 0,
    todayServices: 0,
    todayEarnings: 0,
    monthlyServices: 0,
    monthlyEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentServices, setRecentServices] = useState([]);
  const [pendingServices, setPendingServices] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.shopId]);

  const fetchDashboardData = async () => {
    if (!user?.shopId) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Consulta de barberos
      const barbersQuery = query(
        collection(db, "users"),
        where("role", "==", "barber"),
        where("shopId", "==", user.shopId)
      );
      const barbersSnapshot = await getDocs(barbersQuery);
      const totalBarbers = barbersSnapshot.size;
      const activeBarbers = barbersSnapshot.docs.filter(
        (doc) => doc.data().status === "active"
      ).length;
      const pendingBarbers = barbersSnapshot.docs.filter(
        (doc) => doc.data().status === "pending"
      ).length;

      // Consulta de servicios
      const servicesQuery = query(
        collection(db, "haircuts"),
        where("shopId", "==", user.shopId)
      );
      
      const servicesSnapshot = await getDocs(servicesQuery);
      const allServices = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const todayStart = today.toISOString();
      const monthStart = firstDayOfMonth.toISOString();

      const completedServices = allServices.filter(
        service => 
          service.status === "completed" && 
          service.createdAt >= todayStart
      );

      const pendingServicesData = allServices.filter(
        service => service.status === "pending"
      );

      const monthlyServices = allServices.filter(
        service => 
          service.status === "completed" && 
          service.createdAt >= monthStart
      );

      const todayEarnings = completedServices.reduce((sum, service) => sum + (service.price || 0), 0);
      const monthlyEarnings = monthlyServices.reduce((sum, service) => sum + (service.price || 0), 0);

      setStats({
        totalBarbers,
        activeBarbers,
        pendingBarbers,
        todayServices: completedServices.length,
        todayEarnings,
        monthlyServices: monthlyServices.length,
        monthlyEarnings,
      });

      setRecentServices(completedServices.slice(0, 5));
      setPendingServices(pendingServicesData.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  const ServiceList = ({ services, isPending }) => {
    const tableHeaderClasses = `px-4 py-2 text-xs font-medium ${
      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
    } uppercase tracking-wider`;

    const tableCellClasses = `px-4 py-2 whitespace-nowrap ${
      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
    }`;

    return (
      <div className={`rounded-lg shadow-lg overflow-hidden transition-colors duration-200 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="px-6 py-4 border-b transition-colors duration-200 flex justify-between items-center">
          <h3 className={`text-lg font-semibold transition-colors duration-200 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {isPending ? "Servicios Pendientes" : "Servicios Completados Recientes"}
          </h3>
          {isPending ? <Clock className="text-yellow-500" /> : <CheckCircle className="text-green-500" />}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y transition-colors duration-200">
            <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={tableHeaderClasses + " text-left"}>Cliente</th>
                <th className={tableHeaderClasses + " text-left"}>Barbero</th>
                <th className={tableHeaderClasses + " text-left"}>Servicio</th>
                <th className={tableHeaderClasses + " text-right"}>Precio</th>
                <th className={tableHeaderClasses + " text-left"}>Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y transition-colors duration-200">
              {services.length === 0 ? (
                <tr>
                  <td colSpan="5" className={`${tableCellClasses} text-center py-8`}>
                    No hay servicios {isPending ? "pendientes" : "completados"}.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className={`
                    transition-colors duration-200
                    ${theme === 'dark' 
                      ? 'hover:bg-gray-700 even:bg-gray-800/50' 
                      : 'hover:bg-gray-50 even:bg-gray-50/50'
                    }
                  `}>
                    <td className={tableCellClasses}>{service.clientName}</td>
                    <td className={tableCellClasses}>{service.barberName}</td>
                    <td className={tableCellClasses}>{service.serviceName}</td>
                    <td className={`${tableCellClasses} text-right font-medium ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>
                      ${service.price?.toFixed(2)}
                    </td>
                    <td className={tableCellClasses}>
                      {format(new Date(service.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
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

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen transition-colors duration-200 ${
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
        <h1 className={`text-2xl font-bold mb-2 transition-colors duration-200 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Dashboard
        </h1>
        <p className={`transition-colors duration-200 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {user?.shopName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Barberos Activos",
            value: `${stats.activeBarbers} / ${stats.totalBarbers}`,
            icon: Users,
            color: "blue",
            subtitle: `${stats.pendingBarbers} pendientes`
          },
          {
            title: "Servicios Hoy",
            value: stats.todayServices,
            icon: Scissors,
            color: "green",
            subtitle: `$${stats.todayEarnings.toFixed(2)}`
          },
          {
            title: "Servicios Mensuales",
            value: stats.monthlyServices,
            icon: Calendar,
            color: "purple",
            subtitle: `$${stats.monthlyEarnings.toFixed(2)}`
          },
          {
            title: "Servicios Pendientes",
            value: pendingServices.length,
            icon: AlertCircle,
            color: "yellow",
            subtitle: "Por aprobar"
          }
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`rounded-lg shadow-lg p-6 transition-colors duration-200 ${
                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium transition-colors duration-200 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {card.title}
                  </p>
                  <p className={`text-2xl font-bold mt-1 transition-colors duration-200 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {card.value}
                  </p>
                  <p className={`text-sm transition-colors duration-200 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {card.subtitle}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-opacity-10 
                  ${card.color === 'blue' && (theme === 'dark' ? 'bg-blue-400 text-blue-400' : 'bg-blue-500 text-blue-500')}
                  ${card.color === 'green' && (theme === 'dark' ? 'bg-green-400 text-green-400' : 'bg-green-500 text-green-500')}
                  ${card.color === 'purple' && (theme === 'dark' ? 'bg-purple-400 text-purple-400' : 'bg-purple-500 text-purple-500')}
                  ${card.color === 'yellow' && (theme === 'dark' ? 'bg-yellow-400 text-yellow-400' : 'bg-yellow-500 text-yellow-500')}
                `}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-6">
        <ServiceList services={pendingServices} isPending={true} />
        <ServiceList services={recentServices} isPending={false} />
      </div>
    </div>
  );
};

export default AdminDashboard;
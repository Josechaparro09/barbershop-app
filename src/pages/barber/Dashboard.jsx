import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "react-hot-toast";
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaDollarSign,
  FaClipboardList,
} from "react-icons/fa";

const BarberDashboard = () => {
  const { user } = useAuth();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const ServiceCard = ({ service, isPending = false }) => (
    <div className="bg-white border border-[#d4c3b5] rounded-lg p-4 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {isPending ? (
              <FaHourglassHalf className="text-yellow-500 text-2xl" />
            ) : (
              <FaCheckCircle className="text-green-500 text-2xl" />
            )}
          </div>
          <div>
            <h3 className="font-serif text-[#2c1810] font-medium">{service.serviceName}</h3>
            <p className="text-sm text-[#8b7355]">Cliente: {service.clientName}</p>
            <p className="text-sm text-[#8b7355]">
              {format(new Date(service.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
            </p>
          </div>
        </div>
        <p className="text-lg font-bold text-[#6b4423]">${service.price}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-[#f8f5f0] p-6 rounded-lg border border-[#d4c3b5] shadow mb-8">
        <h1 className="text-2xl font-serif text-[#2c1810] text-center mb-6 border-b border-[#d4c3b5] pb-2">
          Panel de {user.name}
        </h1>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-[#d4c3b5] shadow-sm">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-[#3c7a3d] text-2xl" />
              <div>
                <p className="text-xs text-[#8b7355] font-serif">Servicios Aprobados</p>
                <p className="text-xl font-bold text-[#2c1810]">{stats.completedServices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#d4c3b5] shadow-sm">
            <div className="flex items-center gap-3">
              <FaHourglassHalf className="text-yellow-500 text-2xl" />
              <div>
                <p className="text-xs text-[#8b7355] font-serif">Servicios Pendientes</p>
                <p className="text-xl font-bold text-[#2c1810]">{stats.pendingServices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#d4c3b5] shadow-sm">
            <div className="flex items-center gap-3">
              <FaDollarSign className="text-[#3c7a3d] text-2xl" />
              <div>
                <p className="text-xs text-[#8b7355] font-serif">Ingresos Aprobados</p>
                <p className="text-xl font-bold text-[#6b4423]">${stats.todayEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#d4c3b5] shadow-sm">
            <div className="flex items-center gap-3">
              <FaClipboardList className="text-yellow-500 text-2xl" />
              <div>
                <p className="text-xs text-[#8b7355] font-serif">Ingresos Pendientes</p>
                <p className="text-xl font-bold text-[#6b4423]">${stats.pendingEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Servicios Pendientes */}
      <div className="bg-white border border-[#d4c3b5] rounded-lg p-6 mb-6">
        <h2 className="text-xl font-serif text-[#2c1810] mb-4 pb-2 border-b border-[#d4c3b5]">
          Servicios Pendientes
        </h2>
        <div className="space-y-4">
          {pendingServices.length === 0 ? (
            <p className="text-center text-[#8b7355] py-4">No hay servicios pendientes</p>
          ) : (
            pendingServices.map((service) => (
              <ServiceCard key={service.id} service={service} isPending={true} />
            ))
          )}
        </div>
      </div>

      {/* Servicios Aprobados */}
      <div className="bg-white border border-[#d4c3b5] rounded-lg p-6">
        <h2 className="text-xl font-serif text-[#2c1810] mb-4 pb-2 border-b border-[#d4c3b5]">
          Servicios Aprobados
        </h2>
        <div className="space-y-4">
          {recentServices.length === 0 ? (
            <p className="text-center text-[#8b7355] py-4">No hay servicios aprobados</p>
          ) : (
            recentServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BarberDashboard;
